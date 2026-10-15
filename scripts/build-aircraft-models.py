"""Run through Blender MCP (or Blender --python). Rebuild only the aircraft library.

All airframes face +X, Z up. Individual exports and the runtime bundle are
centered at the origin; the editable .blend arranges them for inspection.
Existing Blender scenes and the mine asset are never cleared or overwritten.
"""
import bpy
import bmesh
import math
import json
import struct
import io_scene_gltf2
from pathlib import Path
from mathutils import Vector, Quaternion

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/models'
(OUT / 'aircraft').mkdir(parents=True, exist_ok=True)
scene = bpy.data.scenes.new('AZ_Aircraft_Library')
bpy.context.window.scene = scene
collection = bpy.data.collections.new('AZ_Four_Airframes')
scene.collection.children.link(collection)

def material(name, color, metallic=0.15, roughness=.45):
    mat = bpy.data.materials.new('Air_' + name)
    mat.use_nodes = True
    node = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    node.inputs['Base Color'].default_value = (*color, 1)
    node.inputs['Metallic'].default_value = metallic
    node.inputs['Roughness'].default_value = roughness
    mat.diffuse_color = (*color, 1)
    return mat

ivory = material('Ivory', (.83, .81, .68))
red = material('Vermilion', (.73, .105, .045))
navy = material('Midnight_Blue', (.065, .16, .25))
gold = material('Amber', (.97, .53, .065))
sea = material('Seafoam', (.14, .43, .39))
olive = material('Olive', (.27, .32, .16))
metal = material('Aluminium', (.42, .49, .51), .65, .38)
dark = material('Charcoal', (.024, .034, .044), .25)
glass = material('Blue_Glass', (.035, .20, .27), .55, .19)

def empty(name, parent=None, pos=(0, 0, 0)):
    obj = bpy.data.objects.new(name, None)
    collection.objects.link(obj)
    obj.parent = parent
    obj.location = pos
    return obj

def mesh(name, vertices, faces, mat, parent, smooth=False):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    data.update()
    bm = bmesh.new()
    bm.from_mesh(data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(data)
    bm.free()
    obj = bpy.data.objects.new(name, data)
    collection.objects.link(obj)
    obj.parent = parent
    data.materials.append(mat)
    for face in data.polygons:
        face.use_smooth = smooth
    return obj

def loft(name, stations, mat, parent, sides=16):
    # (longitudinal position, half width, half height, vertical centre)
    verts = [(x, w*math.cos(a*math.tau/sides), z+h*math.sin(a*math.tau/sides))
             for x, w, h, z in stations for a in range(sides)]
    faces = [tuple(reversed(range(sides)))]
    for j in range(len(stations)-1):
        for i in range(sides):
            k = j*sides+i
            n = j*sides+(i+1)%sides
            faces.append((k, n, n+sides, k+sides))
    faces.append(tuple(range((len(stations)-1)*sides, len(stations)*sides)))
    return mesh(name, verts, faces, mat, parent, True)

def prism(name, points, thickness, mat, parent, vertical=False):
    if vertical:
        verts = [(x, y+sign*thickness/2, z) for sign in [-1, 1] for x, y, z in points]
    else:
        verts = [(x, y, z+sign*thickness/2) for sign in [-1, 1] for x, y, z in points]
    n = len(points)
    faces = [tuple(reversed(range(n))), tuple(range(n, n*2))]
    faces += [(i, (i+1)%n, (i+1)%n+n, i+n) for i in range(n)]
    return mesh(name, verts, faces, mat, parent)

def finish(obj, name, mat, parent):
    obj.name = name
    for col in list(obj.users_collection):
        col.objects.unlink(obj)
    collection.objects.link(obj)
    obj.parent = parent
    obj.data.materials.append(mat)
    return obj

def ellipsoid(name, pos, scale, mat, parent, segments=16, rings=10):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=pos)
    obj = finish(bpy.context.object, name, mat, parent)
    obj.scale = scale
    for face in obj.data.polygons:
        face.use_smooth = True
    return obj

def rod(name, a, b, radius, mat, parent, tip=None, vertices=12):
    delta = Vector(b)-Vector(a)
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius,
        radius2=radius if tip is None else tip, depth=delta.length,
        location=(Vector(a)+Vector(b))/2)
    obj = finish(bpy.context.object, name, mat, parent)
    obj.rotation_euler = delta.to_track_quat('Z', 'Y').to_euler()
    return obj

def box(name, pos, size, mat, parent):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    obj = finish(bpy.context.object, name, mat, parent)
    obj.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return obj

def canopy(parent, x, z, length, width, height, frame=ivory):
    ellipsoid('Glazed_Canopy', (x, 0, z), (length/2, width, height), glass, parent)
    for offset in [-.28, .05, .30]:
        px = x+length*offset
        ring_scale = math.sqrt(1-(2*offset)**2)
        points = [(px, width*ring_scale*math.cos(a*math.pi/8),
                   z+height*ring_scale*math.sin(a*math.pi/8)+.004) for a in range(9)]
        for a, b in zip(points, points[1:]):
            rod('Canopy_Frame', a, b, .006, frame, parent, vertices=6)

def propeller(parent, pos, radius, accent, name):
    pivot = empty(name, parent, pos)
    pivot['animatedPropeller'] = True
    pivot['propellerId'] = name
    for i in range(3):
        angle = i*math.tau/3
        blade = box('Prop_Blade', (0, radius*.47*math.cos(angle), radius*.47*math.sin(angle)),
                    (.014, radius*.94, radius*.16), dark, pivot)
        blade.rotation_euler.x = angle
        tip = box('Prop_Tip', (0, radius*.87*math.cos(angle), radius*.87*math.sin(angle)),
                  (.016, radius*.20, radius*.17), accent, pivot)
        tip.rotation_euler.x = angle
    ellipsoid('Spinner', (.027, 0, 0), (.07, radius*.23, radius*.23), accent, pivot)
    return pivot

def engine(parent, x, y, z, radius, accent, prop_name, prop_radius=.23, rear=.24, fairing=None):
    if fairing is not None:
        # Wing-mounted engines need a broad aft nacelle, not a thin stalk.
        # Its tail reaches the wing trailing edge; the forward shoulder stays
        # full-width as it crosses the leading edge and meets the cowling.
        aft = loft('Wing_Nacelle_Fairing', [(-.34, radius*.16, radius*.12, z),
            (x-.42, radius*.95, radius*.80, z),
            (x-.24, radius*1.08, radius*.96, z),
            (x-.13, radius*.99, radius*.99, z)], fairing, parent)
        aft.location.y = y
    body = loft('Radial_Cowling', [(x-(.15 if fairing is not None else rear),
        radius*(.99 if fairing is not None else .45), radius*(.99 if fairing is not None else .45), z),
        (x-(.12 if fairing is not None else .17), radius, radius, z), (x-.025, radius, radius, z),
        (x, radius*.84, radius*.84, z)], accent, parent)
    body.location.y = y
    rod('Engine_Face', (x-.008, y, z), (x+.007, y, z), radius*.79, dark, parent, vertices=20)
    for i in range(7):
        a = i*math.tau/7
        rod('Radial_Cylinder', (x+.009, y+radius*.43*math.cos(a), z+radius*.43*math.sin(a)),
            (x+.018, y+radius*.43*math.cos(a), z+radius*.43*math.sin(a)), radius*.19, metal, parent, vertices=8)
    propeller(parent, (x+.035, y, z), prop_radius, ivory, prop_name)

def fin(parent, x, y, z, size, mat, accent):
    prism('Tail_Fin', [(x-.16*size,y,z), (x-.17*size,y,z+.28*size),
        (x+.025*size,y,z+.31*size),(x+.17*size,y,z)], .027, mat, parent, True)
    prism('Rudder_Accent', [(x-.165*size,y,z+.055*size),(x-.17*size,y,z+.28*size),
        (x-.10*size,y,z+.293*size),(x-.08*size,y,z+.055*size)], .029, accent, parent, True)

def wing(parent, span, leading, trailing, tip_leading, tip_trailing, z, mat, accent, tip_start=.77):
    for side in [-1, 1]:
        prism('Main_Wing', [(leading,0,z),(trailing,0,z),(tip_trailing,side*span*.92,z+.025),
            (tip_trailing+.035,side*span,z+.03),(tip_leading-.035,side*span,z+.03),
            (tip_leading,side*span*.92,z+.025)], .045, mat, parent)
        yt = side*span*tip_start
        # Large, readable tip panel; its outline follows the tapered wing.
        front = leading+(tip_leading-leading)*tip_start
        back = trailing+(tip_trailing-trailing)*tip_start
        prism('Wingtip_Panel', [(front,yt,z+.029),(back,yt,z+.029),
            (tip_trailing,side*span*.92,z+.050),(tip_trailing+.035,side*span,z+.055),
            (tip_leading-.035,side*span,z+.055),(tip_leading,side*span*.92,z+.050)], .008, accent, parent)
        rod('Flap_Seam', (trailing+.065,side*span*.22,z+.026),
            (tip_trailing+.07,side*span*.71,z+.044), .004, dark, parent, vertices=6)
        # Fictional naval marking: ivory disc with a coloured diamond.
        center = (leading+trailing)*.5+(tip_leading+tip_trailing-leading-trailing)*.26
        yy = side*span*.52
        rod('Wing_Roundel', (center,yy,z+.033),(center,yy,z+.039), .068, ivory, parent, vertices=20)
        prism('Wing_Diamond', [(center+.038,yy,z+.044),(center,yy+.038,z+.044),
            (center-.038,yy,z+.044),(center,yy-.038,z+.044)], .005, accent, parent)

def tailplane(parent, x, span, z, mat):
    for side in [-1,1]:
        prism('Horizontal_Tail', [(x+.16,0,z),(x-.13,0,z),(x-.17,side*span,z+.016),
              (x+.035,side*span,z+.016)], .027, mat, parent)

def bomb(parent, x, y, z, length=.36):
    ellipsoid('Bomb', (x,y,z), (length*.5,.048,.048), dark, parent, 12, 8)
    box('Bomb_Pylon',(x,y,z+.07),(.10,.025,.085),metal,parent)
    prism('Bomb_Fin',[(x-length*.48,y-.075,z),(x-length*.48,y+.075,z),
        (x-length*.27,y+.04,z),(x-length*.27,y-.04,z)],.012,gold,parent)
    prism('Bomb_Fin_V',[(x-length*.48,y,z-.075),(x-length*.48,y,z+.075),
        (x-length*.27,y,z+.04),(x-length*.27,y,z-.04)],.012,gold,parent,True)

roots = {}
def airframe(role):
    obj=empty('Aircraft_'+role)
    obj['aircraftRole']=role
    obj['forwardAxis']='+X'
    roots[role]=obj
    return obj

# FIGHTER: compact, pointed tail, clipped elliptical wings, red nose.
p=airframe('fighter')
loft('Fighter_Fuselage',[(-.68,.014,.025,.015),(-.58,.048,.058,.02),(-.38,.075,.085,.025),
    (-.13,.10,.12,.025),(.12,.112,.125,.025),(.38,.105,.11,.025),(.53,.08,.09,.025)],ivory,p)
wing(p,.70,.23,-.18,-.04,-.33,-.025,ivory,red,.70)
engine(p,.56,0,.025,.112,red,'Propeller_fighter',.23)
canopy(p,-.06,.126,.34,.078,.09,metal)
tailplane(p,-.51,.26,.045,ivory)
fin(p,-.53,0,.045,.82,ivory,red)
for side in [-1,1]:
    rod('Wing_Cannon',(.04,side*.25,-.02),(.36,side*.25,-.02),.012,dark,p)
    box('Exhaust_Row',(.28,side*.108,.015),(.15,.027,.028),dark,p)

# BOMBER: broad gull-like wings, long tandem cockpit, large centreline bomb.
p=airframe('bomber')
loft('Bomber_Fuselage',[(-.80,.016,.022,.025),(-.65,.052,.055,.03),(-.43,.095,.085,.04),
    (-.22,.135,.125,.035),(.08,.148,.14,.03),(.34,.14,.14,.025),(.55,.12,.115,.025),(.65,.10,.09,.025)],navy,p)
wing(p,.88,.30,-.24,.035,-.26,-.025,navy,gold,.80)
engine(p,.69,0,.025,.145,gold,'Propeller',.26)
canopy(p,-.10,.155,.58,.103,.10,metal)
tailplane(p,-.62,.34,.06,navy)
fin(p,-.64,0,.07,1.03,navy,gold)
bomb(p,.04,0,-.235,.46)
for side in [-1,1]:
    box('Dive_Brake',(-.19,side*.40,.008),(.065,.26,.013),metal,p)
    for y in [.30,.35,.40,.45,.50]:
        box('Brake_Slot',(-.19,side*y,.017),(.042,.017,.008),dark,p)
    rod('Wing_Gun',(.12,side*.30,-.015),(.38,side*.30,-.015),.011,dark,p)

# SCOUT: very long slim wings, high glazing, twin pontoon floats. No weapons.
p=airframe('scout')
loft('Scout_Fuselage',[(-.72,.016,.03,.055),(-.58,.05,.058,.065),(-.35,.073,.08,.07),
    (-.12,.105,.115,.075),(.16,.11,.12,.07),(.39,.085,.095,.06),(.55,.065,.075,.055)],sea,p)
wing(p,1.05,.16,-.12,.09,-.16,.035,sea,ivory,.78)
engine(p,.58,0,.06,.10,ivory,'Propeller_scout',.23)
canopy(p,-.09,.17,.49,.092,.11,ivory)
tailplane(p,-.57,.29,.095,ivory)
fin(p,-.58,0,.10,.86,sea,ivory)
for side in [-1,1]:
    float_obj=loft('Pontoon', [(-.59,.025,.035,-.31),(-.40,.065,.063,-.31),
        (-.04,.075,.073,-.31),(.32,.065,.061,-.285),(.48,.032,.043,-.25),(.53,.005,.015,-.24)],ivory,p,12)
    float_obj.location.y=side*.24
    for x in [-.32,.25]:
        rod('Float_Strut',(x,side*.075,-.01),(x-.04,side*.24,-.26),.016,metal,p)
    rod('Wing_Brace',(-.08,side*.10,-.02),(-.02,side*.68,.015),.011,metal,p)
    box('Float_Top_Stripe',(-.03,side*.24,-.236),(.57,.027,.008),sea,p)
rod('Camera_Lens',(-.23,0,-.04),(-.23,0,-.13),.052,dark,p,vertices=16)
rod('Camera_Glass',(-.23,0,-.13),(-.23,0,-.135),.037,glass,p,vertices=16)
rod('Aerial',(-.25,0,.25),(-.31,0,.40),.007,dark,p,vertices=6)

# HEAVY / STRIKE: four engines, broad angular wing, twin rudders, paired ordnance.
p=airframe('heavy')
loft('Strike_Fuselage',[(-.89,.025,.035,.04),(-.73,.07,.08,.04),(-.47,.13,.13,.04),
    (-.14,.163,.16,.04),(.21,.17,.155,.04),(.50,.14,.125,.04),(.70,.09,.095,.04),(.79,.014,.03,.04)],olive,p)
wing(p,1.13,.29,-.30,-.035,-.30,.0,olive,gold,.85)
canopy(p,.38,.153,.35,.112,.085,ivory)
ellipsoid('Glazed_Nose',(.72,0,.045),(.10,.074,.068),glass,p)
tailplane(p,-.70,.43,.085,olive)
for side in [-1,1]:
    fin(p,-.71,side*.35,.10,.88,olive,gold)
    for i,y in enumerate([.38,.78]):
        engine(p,.40-i*.115,side*y,.015,.10,metal,f'Propeller_heavy_{side}_{i}',.18,fairing=olive)
    bomb(p,-.05,side*.24,-.19,.37)
    box('Fuselage_Stripe',(-.39,side*.128,.07),(.09,.012,.15),ivory,p)
ellipsoid('Dorsal_Turret',(-.17,0,.192),(.10,.085,.065),glass,p)
rod('Turret_Barrel',(-.18,0,.22),(-.36,0,.24),.01,dark,p)

def consolidate(parent):
    groups={}
    for obj in list(parent.children):
        if obj.type=='MESH':
            groups.setdefault(obj.data.materials[0],[]).append(obj)
    for mat, objects in groups.items():
        bpy.ops.object.select_all(action='DESELECT')
        for obj in objects: obj.select_set(True)
        bpy.context.view_layer.objects.active=objects[0]
        if len(objects)>1: bpy.ops.object.join()
        objects[0].name=parent.name+'_'+mat.name
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

for parent in roots.values():
    for child in list(parent.children):
        if child.get('animatedPropeller'): consolidate(child)
    consolidate(parent)

export_format=next(identifier for identifier,name,description in io_scene_gltf2.get_format_items(None,bpy.context) if '(.glb)' in name)
def export(parents, path):
    bpy.ops.object.select_all(action='DESELECT')
    for parent in parents:
        parent.select_set(True)
        for child in parent.children_recursive: child.select_set(True)
    bpy.context.view_layer.objects.active=parents[0]
    bpy.ops.export_scene.gltf(filepath=str(path), export_format=export_format, use_selection=True,
        export_apply=True, export_cameras=False, export_lights=False, export_extras=True)
    # Blender suffixes object names when the script is rerun in the same file.
    # Keep stable runtime names without renaming or removing any prior scenes.
    data=path.read_bytes()
    json_length, chunk_type=struct.unpack_from('<II',data,12)
    assert chunk_type==0x4E4F534A
    document=json.loads(data[20:20+json_length])
    for node in document.get('nodes',[]):
        extra=node.get('extras',{})
        if 'aircraftRole' in extra: node['name']='Aircraft_'+extra['aircraftRole']
        if 'propellerId' in extra: node['name']=extra['propellerId']
    chunk=json.dumps(document,separators=(',',':'),ensure_ascii=False).encode('utf-8')
    chunk+=b' '*(-len(chunk)%4)
    remainder=data[20+json_length:]
    path.write_bytes(struct.pack('<III',0x46546C67,2,20+len(chunk)+len(remainder))+
        struct.pack('<II',len(chunk),chunk_type)+chunk+remainder)
    print(path.name, path.stat().st_size, 'bytes')

for role, parent in roots.items(): export([parent], OUT/'aircraft'/f'{role}.glb')
export(list(roots.values()), OUT/'aircraft.glb')

# Display layout is authored only after exporting origin-centred assets.
for role, pos in zip(['fighter','bomber','scout','heavy'], [(0,-1.55,0),(0,1.55,0),(-2.25,-1.55,0),(-2.25,1.55,0)]):
    roots[role].location=pos
scene.world=bpy.data.worlds.new('Aircraft_Studio')
scene.world.color=(.12,.12,.12)
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.shading.color_type='MATERIAL'
        area.spaces.active.overlay.show_overlays=False
        region=area.spaces.active.region_3d
        region.view_distance=7.5
        region.view_location=(-1.15,0,0)
        region.view_rotation=Quaternion((.860,.360,-.140,-.330)).normalized()
        region.view_perspective='ORTHO'
bpy.ops.object.select_all(action='DESELECT')
bpy.data.libraries.write(str(OUT/'aircraft-library.blend'),{scene})
print('Built four aircraft in',scene.name)
for role,parent in roots.items():
    count=sum(len(o.data.polygons) for o in parent.children_recursive if o.type=='MESH')
    print(role,'faces',count,'propellers',sum(bool(o.get('animatedPropeller')) for o in parent.children))
