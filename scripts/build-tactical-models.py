"""Legacy source study + mine builder. Does not overwrite the four-role aircraft
bundle: use build-aircraft-models.py for current aircraft. Keeps existing scenes.
"""
import bpy
import math
import io_scene_gltf2
from pathlib import Path
from mathutils import Vector

ROOT = Path('/Volumes/Coding/projects/azurlane-chess')
OUT = ROOT / 'assets/models'
OUT.mkdir(parents=True, exist_ok=True)
scene = bpy.data.scenes.new('AZ_Tactical_Models_v057')
bpy.context.window.scene = scene
collection = bpy.data.collections.new('AZ_Tactical_Models')
scene.collection.children.link(collection)

def material(name, color, metallic=0, roughness=.45):
    mat = bpy.data.materials.new('AZ_' + name)
    mat.use_nodes = True
    shader = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Metallic'].default_value = metallic
    shader.inputs['Roughness'].default_value = roughness
    mat.diffuse_color = (*color, 1)
    return mat

navy = material('Aircraft_Paint', (.17, .29, .37), .35)
silver = material('Brushed_Aluminium', (.56, .63, .64), .8, .32)
dark = material('Engine_And_Tires', (.026, .036, .041), .25)
glass = material('Cockpit_Glass', (.08, .37, .49), .6, .17)
yellow = material('Safety_Yellow', (.98, .64, .09), .25)
iron = material('Mine_Iron', (.09, .14, .16), .8, .47)
brass = material('Mine_Contacts', (.56, .38, .14), .75, .35)
rust = material('Anchor_Chain', (.21, .12, .065), .6, .65)

def root(name):
    obj = bpy.data.objects.new(name, None)
    collection.objects.link(obj)
    return obj

aircraft = root('Aircraft')
mine = root('NavalMine')

def finish(obj, name, mat, parent):
    obj.name = name
    for col in list(obj.users_collection):
        col.objects.unlink(obj)
    collection.objects.link(obj)
    obj.parent = parent
    obj.data.materials.append(mat)
    return obj

def sphere(name, pos, scale, mat, parent, segments=20, rings=12):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=pos)
    obj = finish(bpy.context.object, name, mat, parent)
    obj.scale = scale
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj

def box(name, pos, scale, mat, parent, bevel=.01):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    obj = finish(bpy.context.object, name, mat, parent)
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = obj.modifiers.new('Edge bevel', 'BEVEL')
        mod.width = bevel
        mod.segments = 1
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return obj

def rod(name, a, b, radius, mat, parent, tip=None, vertices=12):
    delta = Vector(b) - Vector(a)
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius, radius2=radius if tip is None else tip, depth=delta.length, location=(Vector(a)+Vector(b))/2)
    obj = finish(bpy.context.object, name, mat, parent)
    obj.rotation_euler = delta.to_track_quat('Z', 'Y').to_euler()
    return obj

def torus(name, pos, radius, tube, mat, parent, rotation=(0,0,0)):
    bpy.ops.mesh.primitive_torus_add(major_segments=24, minor_segments=6, location=pos, major_radius=radius, minor_radius=tube, rotation=rotation)
    return finish(bpy.context.object, name, mat, parent)

def prism(name, outline, thickness, mat, parent):
    # Wing outline is in XY, upper/lower skin in Z.
    vertices=[(x,y,z+sign*thickness/2) for sign in [-1,1] for x,y,z in outline]
    n=len(outline)
    faces=[tuple(reversed(range(n))),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(vertices,[],faces)
    mesh.update()
    obj=bpy.data.objects.new(name,mesh)
    collection.objects.link(obj)
    obj.parent=parent
    mesh.materials.append(mat)
    return obj

# Nose points +X; Blender Z becomes Three.js Y in the glTF exporter.
sphere('Fuselage',(-.04,0,.02),(.65,.12,.13),navy,aircraft)
rod('Engine_Cowling',(.43,0,.02),(.62,0,.02),.143,silver,aircraft,tip=.12,vertices=24)
torus('Cowling_Rim',(.61,0,.02),.119,.012,dark,aircraft,(0,math.pi/2,0))
for i in range(8):
    angle=2*math.pi*i/8
    rod('Engine_Cylinder',(.48,.093*math.cos(angle),.02+.093*math.sin(angle)),(.57,.093*math.cos(angle),.02+.093*math.sin(angle)),.026,dark,aircraft)
sphere('Spinner',(.66,0,.02),(.095,.063,.063),yellow,aircraft)
propeller=root('Propeller')
propeller.parent=aircraft
propeller.location=(.646,0,.02)
for i in range(3):
    angle=2*math.pi*i/3
    blade=box('Propeller_Blade',(0,.13*math.cos(angle),.13*math.sin(angle)),(.017,.30,.038),dark,propeller)
    blade.rotation_euler.x=angle
    tip=box('Propeller_Tip',(0,.26*math.cos(angle),.26*math.sin(angle)),(.02,.048,.04),yellow,propeller)
    tip.rotation_euler.x=angle
for side in [-1,1]:
    prism('Main_Wing',[(.21,0,-.028),(-.22,0,-.028),(-.28,side*.67,-.015),(.015,side*.71,.005),(.12,side*.50,-.012)],.047,navy,aircraft)
    prism('Wing_Tip',[(.012,side*.62,.012),(-.263,side*.60,.012),(-.28,side*.67,.012),(.015,side*.71,.027)],.014,yellow,aircraft)
    rod('Aileron_Seam',(-.21,side*.25,-.004),(-.25,side*.58,.012),.004,dark,aircraft,vertices=6)
    sphere('Wing_Insignia',(-.055,side*.43,.018),(.072,.072,.005),silver,aircraft,segments=12,rings=6)
    prism('Tailplane',[(-.41,0,.04),(-.62,0,.04),(-.64,side*.27,.05),(-.5,side*.30,.05)],.028,silver,aircraft)
    rod('Exhaust',(.32,side*.11,-.018),(.17,side*.14,-.06),.019,dark,aircraft)
    rod('Wing_Gun',(.23,side*.30,-.027),(.37,side*.30,-.027),.012,dark,aircraft)
    box('Landing_Strut',(-.04,side*.16,-.13),(.025,.028,.13),silver,aircraft)
    wheel=rod('Landing_Wheel',(-.04,side*.16-.026,-.20),(-.04,side*.16+.026,-.20),.057,dark,aircraft,vertices=12)
cockpit=sphere('Cockpit_Canopy',(-.04,0,.135),(.23,.086,.094),glass,aircraft)
for x in [-.19,-.04,.12]:
    torus('Canopy_Frame',(x,0,.135),.084,.008,silver,aircraft,(0,math.pi/2,0))
fin=prism('Vertical_Tail',[(-.61,0,.05),(-.61,0,.31),(-.43,0,.23),(-.40,0,.05)],.035,navy,aircraft)
fin.data.clear_geometry()
outline=[(-.61,.05),(-.61,.31),(-.43,.23),(-.40,.05)]
fin.data.from_pydata([(x,y,z) for y in [-.017,.017] for x,z in outline],[],[(3,2,1,0),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)])
rod('Bomb',(-.25,0,-.16),(.23,0,-.16),.042,iron,aircraft,tip=.025,vertices=16)
box('Bomb_Fins',(-.23,0,-.16),(.075,.12,.016),silver,aircraft)

# Moored contact mine with seam band, flange bolts, brass horns and anchor shackle.
sphere('Mine_Hull',(0,0,.005),(.238,.238,.238),iron,mine,segments=24,rings=14)
torus('Equator_Weld',(0,0,.005),.237,.012,silver,mine)
torus('Lower_Collar',(0,0,-.12),.203,.015,iron,mine)
for i in range(12):
    angle=2*math.pi*i/12
    sphere('Flange_Bolt',(.239*math.cos(angle),.239*math.sin(angle),.012),(.016,.016,.016),brass,mine,segments=8,rings=6)
for z,count,offset in [(.13,4,0),(-.11,4,math.pi/4),(.0,4,math.pi/4)]:
    radial=math.sqrt(.238**2-z*z)
    for i in range(count):
        angle=2*math.pi*i/count+offset
        normal=Vector((radial*math.cos(angle),radial*math.sin(angle),z)).normalized()
        a=normal*.225+Vector((0,0,.005));b=normal*.345+Vector((0,0,.005))
        rod('Contact_Horn',a,b,.028,brass,mine,tip=.016)
        sphere('Horn_Cap',b,(.023,.023,.023),brass,mine,segments=10,rings=6)
rod('Top_Fuze',(0,0,.215),(0,0,.28),.043,silver,mine,tip=.033)
torus('Anchor_Shackle',(0,0,-.26),.043,.011,brass,mine,(math.pi/2,0,0))
for i in range(4):
    torus('Anchor_Link',(0,0,-.31-i*.044),.028,.006,rust,mine,(math.pi/2,0,0) if i%2 else (0,math.pi/2,0))

def consolidate(parent):
    # Join static parts by material to keep draw calls low. Propeller remains a pivot.
    groups={}
    for obj in list(parent.children):
        if obj.type=='MESH':
            groups.setdefault(obj.data.materials[0],[]).append(obj)
    for mat,objects in groups.items():
        bpy.ops.object.select_all(action='DESELECT')
        for obj in objects: obj.select_set(True)
        bpy.context.view_layer.objects.active=objects[0]
        if len(objects)>1: bpy.ops.object.join()
        objects[0].name=parent.name+'_'+mat.name
        bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)

consolidate(aircraft)
consolidate(propeller)
consolidate(mine)
for parent,filename in [(mine,'naval-mine.glb')]:
    bpy.ops.object.select_all(action='DESELECT')
    parent.select_set(True)
    for child in parent.children_recursive: child.select_set(True)
    bpy.context.view_layer.objects.active=parent
    # Read exporter enum values rather than assuming translated identifiers.
    export_format=next(identifier for identifier,name,description in io_scene_gltf2.get_format_items(None,bpy.context) if '(.glb)' in name)
    bpy.ops.export_scene.gltf(filepath=str(OUT/filename),export_format=export_format,use_selection=True,export_apply=True,export_cameras=False,export_lights=False)
    print(filename,(OUT/filename).stat().st_size,'bytes')
# Native editable asset library, only this task's scene/data, original user scene retained.
mine.location=(2.1,0,0)
bpy.data.libraries.write(str(OUT/'tactical-models.blend'),{scene})
print('Task scene:',scene.name,'meshes:',len([o for o in scene.objects if o.type=='MESH']))
