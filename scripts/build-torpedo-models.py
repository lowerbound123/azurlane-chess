"""Independent exterior art studies, executed in Blender via MCP.

References and artistic departures: docs/art/TORPEDO-STUDIES.md.
Does not touch the game model pack or runtime asset manifest. +X is the nose.
Every run creates a new scene; previous scenes and user work are preserved.
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
OUT = ROOT / 'assets/models/torpedoes'
OUT.mkdir(parents=True, exist_ok=True)
scene = bpy.data.scenes.new('AZ_Torpedo_Studies')
bpy.context.window.scene = scene
collection = bpy.data.collections.new('Torpedo_Exterior_Studies')
scene.collection.children.link(collection)

def material(name, color, metallic=.3, roughness=.4):
    m = bpy.data.materials.new('Torpedo_'+name)
    m.use_nodes = True
    node = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    node.inputs['Base Color'].default_value = (*color,1)
    node.inputs['Metallic'].default_value = metallic
    node.inputs['Roughness'].default_value = roughness
    m.diffuse_color = (*color,1)
    return m

steel = material('Satin_Steel',(.38,.44,.46),.78,.32)
bright = material('Machined_Edges',(.67,.71,.69),.8,.27)
gunmetal = material('Blackened_Steel',(.075,.10,.11),.65,.38)
navy = material('Navy_Graphite',(.045,.075,.085),.4,.34)
olive = material('Deep_Olive',(.16,.20,.115),.28,.48)
bronze = material('Propeller_Bronze',(.53,.31,.115),.77,.3)
copper = material('Warm_Head',(.40,.23,.115),.65,.37)
seam = material('Recessed_Joints',(.018,.024,.027),.15,.58)
ivory = material('Stencil_Ivory',(.72,.72,.58),.05,.64)
wood = [material('Plywood_'+str(i),(.35+i*.017,.19+i*.012,.07+i*.007),.0,.78) for i in range(4)]
grain = material('Plywood_Fibres',(.23,.12,.045),.0,.86)

def empty(name,parent=None,pos=(0,0,0)):
    o=bpy.data.objects.new(name,None);collection.objects.link(o)
    o.parent=parent;o.location=pos
    return o

def mesh(name,verts,faces,mat,parent,smooth=False):
    data=bpy.data.meshes.new(name);data.from_pydata(verts,[],faces);data.update()
    bm=bmesh.new();bm.from_mesh(data);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(data);bm.free()
    o=bpy.data.objects.new(name,data);collection.objects.link(o);o.parent=parent;data.materials.append(mat)
    for f in data.polygons:f.use_smooth=smooth
    return o

def lathe(name,profile,mat,parent,segments=64):
    verts=[(x,r*math.cos(i*math.tau/segments),r*math.sin(i*math.tau/segments)) for x,r in profile for i in range(segments)]
    faces=[tuple(reversed(range(segments)))]
    for j in range(len(profile)-1):
        for i in range(segments):
            a=j*segments+i;b=j*segments+(i+1)%segments
            faces.append((a,b,b+segments,a+segments))
    faces.append(tuple(range((len(profile)-1)*segments,len(profile)*segments)))
    return mesh(name,verts,faces,mat,parent,True)

def tube(name,x0,x1,outer,inner,mat,parent,segments=64):
    verts=[(x,r*math.cos(i*math.tau/segments),r*math.sin(i*math.tau/segments))
           for x,r in [(x0,outer),(x1,outer),(x0,inner),(x1,inner)] for i in range(segments)]
    faces=[]
    for i in range(segments):
        j=(i+1)%segments;n=segments
        faces += [(i,j,j+n,i+n),(i+2*n,i+3*n,j+3*n,j+2*n),
                  (i,i+2*n,j+2*n,j),(i+n,j+n,j+3*n,i+3*n)]
    return mesh(name,verts,faces,mat,parent,True)

def band(parent,x,r,width=.012,mat=bright):
    return tube('Joint_Band',x-width/2,x+width/2,r+.002,r-.003,mat,parent)

def rod(name,a,b,r,mat,parent,segments=10):
    direction=Vector(b)-Vector(a)
    # Direct mesh construction keeps repeated micro details fast in Blender.
    q=direction.to_track_quat('X','Z')
    o=lathe(name,[(-direction.length/2,r),(direction.length/2,r)],mat,parent,segments)
    o.location=(Vector(a)+Vector(b))/2;o.rotation_mode='QUATERNION';o.rotation_quaternion=q
    return o

def prism(name,outline,thickness,mat,parent):
    verts=[(x,y,z+sign*thickness/2) for sign in [-1,1] for x,y,z in outline]
    n=len(outline);faces=[tuple(reversed(range(n))),tuple(range(n,2*n))]
    faces += [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    return mesh(name,verts,faces,mat,parent)

def box(name,pos,size,mat,parent):
    x,y,z=pos;a,b,c=[v/2 for v in size]
    return mesh(name,[(x+u*a,y+v*b,z+w*c) for u,v,w in
        [(-1,-1,-1),(-1,1,-1),(1,1,-1),(1,-1,-1),(-1,-1,1),(-1,1,1),(1,1,1),(1,-1,1)]],
        [(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],mat,parent)

def screw(parent,x,angle,r,size=.006):
    normal=Vector((0,math.cos(angle),math.sin(angle)))
    center=Vector((x,0,0))+normal*r
    rod('Flush_Fastener',center,center+normal*.002,size,bright,parent,8)
    tangent=Vector((0,-math.sin(angle),math.cos(angle)))
    rod('Screw_Slot',center+normal*.0025-tangent*size*.65,center+normal*.0025+tangent*size*.65,.0009,seam,parent,6)

def fastener_ring(parent,x,r,count=20):
    for i in range(count):screw(parent,x,i*math.tau/count,r)

def hatch(parent,x,r,angle=math.pi/2,radius=.035):
    normal=Vector((0,math.cos(angle),math.sin(angle)))
    center=Vector((x,0,0))+normal*(r+.001)
    rod('Service_Cover_Recess',center,center+normal*.002,radius,seam,parent,32)
    rod('Service_Cover',center+normal*.002,center+normal*.0035,radius*.86,steel,parent,32)
    tangent=Vector((0,-math.sin(angle),math.cos(angle)))
    rod('Cover_Slot',center+normal*.004-tangent*.014,center+normal*.004+tangent*.014,.0015,seam,parent,6)
    for offset in [-1,1]:
        p=center+Vector((offset*radius*.57,0,0))+normal*.004
        rod('Cover_Fastener',p,p+normal*.002,.0035,bright,parent,8)

def stencil(parent,text,pos,size=.028,mat=ivory):
    data=bpy.data.curves.new('Stamped_Lettering','FONT');data.body=text;data.size=size;data.extrude=.00015;data.resolution_u=2
    o=bpy.data.objects.new('Stencil_'+text,data);collection.objects.link(o);o.parent=parent;o.location=pos
    data.materials.append(mat)
    bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
    bpy.ops.object.convert(target='MESH')
    result=bpy.context.object
    bm=bmesh.new();bm.from_mesh(result.data)
    bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.000001)
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces)
    bm.to_mesh(result.data);bm.free()
    return result

def plate(parent,x,r,text):
    box('Identification_Plate',(x,0,r+.002),(.20,.077,.005),gunmetal,parent)
    stencil(parent,text,(x-.083,-.015,r+.005),.028)
    for dx in [-.087,.087]:
        for dy in [-.025,.025]:rod('Plate_Rivet',(x+dx,dy,r+.005),(x+dx,dy,r+.007),.003,bright,parent,8)

def propeller(parent,x,radius,blades,direction,label):
    p=empty(label,parent,(x,0,0));p['torpedoPropeller']=True;p['spinDirection']=direction;p['canonicalName']=label
    lathe('Propeller_Hub',[(-.019,radius*.23),(.019,radius*.23)],bronze,p,32)
    # Curved, pitched blades: visual geometry only, not engineering geometry.
    for i in range(blades):
        verts=[]
        for sign in [-1,1]:
            for k in range(7):
                f=k/6;rr=radius*(.20+.80*f);sweep=direction*(.08+.43*f)
                width=radius*(.20+.28*math.sin(f*math.pi)**.7)*(1-.65*f)
                for edge in [-1,1]:
                    t=sweep+edge*width/(rr*2)
                    verts.append((direction*edge*width*.27+sign*.0022,rr*math.cos(t),rr*math.sin(t)))
        faces=[];n=14
        for k in range(6):
            a=k*2;faces += [(a,a+1,a+3,a+2),(a+n,a+n+2,a+n+3,a+n+1),
                            (a,a+2,a+n+2,a+n),(a+1,a+n+1,a+n+3,a+3)]
        faces += [(0,n,n+1,1),(12,13,27,26)]
        blade=mesh('Sculpted_Propeller_Blade',verts,faces,bronze,p,True)
        blade.rotation_euler.x=i*math.tau/blades
    return p

def tail(parent,L,r,kind,mat):
    t=empty('Tail_Assembly',parent)
    aft=-L/2;fin_start=aft+L*.17;fin_end=aft+L*.045
    extent=r*(1.28 if kind!='mk13' else 1.42)
    for i in range(4):
        angle=i*math.pi/2
        f=prism('Stabilizer',[(fin_start,r*.60,0),(fin_start-L*.018,extent*.88,0),
            (fin_end+.035,extent,0),(fin_end,extent*.87,0),(fin_end,r*.18,0)],.009,mat,t)
        f.rotation_euler.x=angle
        for offset in [0,.028]:
            a=(fin_end+.055+offset,extent*.57,0);b=(fin_end+.055+offset,extent*.94,0)
            o=rod('Rudder_Hinge' if offset==0 else 'Rudder_Seam',a,b,.0035,bright if offset==0 else seam,t,8)
            rotation=Quaternion((1,0,0),angle);o.location=rotation@o.location;o.rotation_quaternion=rotation@o.rotation_quaternion
        # Rudder root links stay inside the tail envelope.
        o=rod('Control_Link',(fin_end+.065,r*.28,.008),(fin_end+.065,extent*.57,.008),.004,steel,t,8)
        rotation=Quaternion((1,0,0),angle);o.location=rotation@o.location;o.rotation_quaternion=rotation@o.rotation_quaternion
    x1=aft+L*.034;x2=aft+L*.013
    rod('Tail_Shaft',(aft-.018,0,0),(fin_end+.06,0,0),r*.105,bright,t,20)
    blades=4 if kind in ['mk14','mk13'] else 3
    propeller(t,x1,r*.91,blades,1,'Propeller_A')
    propeller(t,x2,r*.91,blades,-1,'Propeller_B')
    lathe('Aft_End_Cap',[(aft-.018,.002),(aft-.007,r*.11),(aft+.01,r*.15)],bronze,t,32)
    if kind=='mk13':
        tube('Tail_Shroud_Ring',fin_end-.04,fin_end+.055,extent+.01,extent-.005,steel,t)
    return t

def make_body(kind,L,r,bodymat,headmat):
    root=empty('Torpedo_'+kind);root['torpedoVariant']=kind;root['canonicalName']='Torpedo_'+kind
    root['studyOnly']=True;root['forwardAxis']='+X'
    hull=empty('Body_Sections',root);nose=L/2;join=nose-L*.22;aft=-L/2
    # Slightly different ogives, but all remain rounded like the reference photos.
    if kind=='type93':
        profile=[(join,r),(nose-r*1.20,r),(nose-r*.70,r*.96),(nose-r*.32,r*.72),(nose-r*.10,r*.39),(nose,.004)]
    elif kind=='g7e':
        profile=[(join,r),(nose-r*1.65,r),(nose-r*1.10,r*.94),(nose-r*.62,r*.74),(nose-r*.32,r*.42),(nose-r*.18,r*.25)]
    else:
        profile=[(join,r),(nose-r*1.40,r),(nose-r*.90,r*.96),(nose-r*.48,r*.80),(nose-r*.18,r*.50),(nose-r*.04,r*.24),(nose,.003)]
    lathe('Rounded_Forebody',profile,headmat,hull)
    tail_join=aft+L*.25
    lathe('Main_Cylindrical_Shell',[(tail_join,r*.96),(tail_join+.04,r),(join,r)],bodymat,hull)
    lathe('Tapered_Afterbody',[(aft+L*.04,r*.18),(aft+L*.09,r*.40),(aft+L*.16,r*.70),(tail_join,r*.96)],bodymat,hull)
    details=empty('Flush_Surface_Details',root)
    for x in [join,tail_join]:
        band(details,x,r,.009,seam);band(details,x+.009,r,.006,bright)
        fastener_ring(details,x-.019,r,24 if kind=='type93' else 20)
    # Fine flush access details; avoid oversized pipes or fantasy armour bands.
    for x in [-L*.08,L*.17]:hatch(details,x,r,radius=r*.20)
    for angle in [math.pi/2,.1,math.pi+.1]:hatch(details,tail_join+.12,r,angle,r*.15)
    band(details,-L*.08,r,.006,bodymat)
    plate(details,L*.06,r,{'mk14':'MK 14','type93':'TYPE 93','g7e':'G7e / T3','mk13':'MK 13'}[kind])
    for i in range(6):box('Inspection_Ticks',(-L*.16+i*.014,-.025,r+.002),(.003,.022 if i%2==0 else .014,.002),ivory,details)
    if kind=='g7e':
        # External nose silhouette from the museum exhibit, deliberately simplified.
        cap=lathe('Nose_Collar',[(nose-r*.20,r*.26),(nose-r*.03,r*.25),(nose+.018,r*.16)],gunmetal,details,40)
        for i in range(4):
            a=i*math.pi/2
            tab=prism('Nose_Feelers',[(nose-.01,r*.12,0),(nose+.065,r*.70,0),
                (nose+.09,r*.72,0),(nose+.045,r*.16,0)],.009,bronze,details)
            tab.rotation_euler.x=a
        lathe('Nose_Button',[(nose+.008,r*.16),(nose+.045,.006)],steel,details,32)
    tail(root,L,r,kind,bodymat)
    return root

def launch_kit(root,L,r):
    kit=empty('Launch_Kit',root);kit['displayAttachment']=True;kit['canonicalName']='Launch_Kit'
    nose=L/2;aft=-L/2
    # Open wooden drag barrel at the nose, based on museum imagery.
    x0=nose-.26;x1=nose+.09;radius=r*1.30
    for i in range(24):
        a=i*math.tau/24+.009;b=(i+1)*math.tau/24-.009
        verts=[(x,rr*math.cos(t),rr*math.sin(t)) for x in [x0,x1] for rr in [radius-.018,radius] for t in [a,b]]
        mesh('Nose_Barrel_Stave',verts,[(0,4,5,1),(2,3,7,6),(0,2,6,4),(1,5,7,3),(0,1,3,2),(4,6,7,5)],wood[i%4],kit)
    for x in [x0+.022,x1-.022]:tube('Barrel_Retaining_Band',x-.007,x+.007,radius+.002,radius-.004,gunmetal,kit)
    box('Barrel_Front_Brace',(x1+.002,0,0),(.018,radius*2,.023),wood[2],kit)
    # Removable plywood box surrounds the tail, separate from underwater fins.
    y=r*1.52;front=aft+.25;back=aft-.13;span=front-back
    for side in [-1,1]:
        box('Plywood_Side',((front+back)/2,side*y,0),(span,.024,y*2),wood[0 if side<0 else 2],kit)
        box('Plywood_Top_Bottom',((front+back)/2,0,side*y),(span,y*2,.024),wood[1 if side<0 else 3],kit)
        for yy in [-y+.025,y-.025]:
            box('Box_Corner_Rail',((front+back)/2,yy,side*(y-.016)),(span,.027,.027),wood[0],kit)
        for line_index in range(7):
            across=(line_index-3)*y*.23
            points=[(back+.045+(span-.09)*k/5,across+.002*math.sin(k*1.7+line_index)) for k in range(6)]
            for (xa,va),(xb,vb) in zip(points,points[1:]):
                rod('Plywood_Grain',(xa,side*(y+.0127),va),(xb,side*(y+.0127),vb),.0008,grain,kit,5)
                rod('Plywood_Grain',(xa,va,side*(y+.0127)),(xb,vb,side*(y+.0127)),.0008,grain,kit,5)
    for x in [back+.025,front-.025]:
        for ysign in [-1,1]:
            for z in [-y*.72,y*.72]:
                rod('Wood_Screw',(x,ysign*y,z),(x,ysign*(y+.014),z),.005,gunmetal,kit,8)
    return kit

specs=[('mk14',3.60,.153,navy,navy),('type93',5.17,.175,steel,gunmetal),
       ('g7e',4.14,.153,steel,copper),('mk13',2.36,.164,olive,olive)]
roots={}
for kind,L,r,bodymat,headmat in specs:
    root=make_body(kind,L,r,bodymat,headmat);roots[kind]=root
    if kind=='mk13':launch_kit(root,L,r)

def consolidate(group):
    for child in list(group.children):
        if child.type=='EMPTY':consolidate(child)
    materials={}
    for o in list(group.children):
        if o.type=='MESH':materials.setdefault(o.data.materials[0],[]).append(o)
    for mat,objects in materials.items():
        bpy.ops.object.select_all(action='DESELECT')
        for o in objects:o.select_set(True)
        bpy.context.view_layer.objects.active=objects[0]
        if len(objects)>1:bpy.ops.object.join()
        objects[0].name=group.name+'_'+mat.name
        bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)

# Keep the source .blend's named parts editable. Export optimized duplicates.
export_format=next(k for k,n,d in io_scene_gltf2.get_format_items(None,bpy.context) if '(.glb)' in n)
stats={}
for kind,root in roots.items():
    copies=[]
    def clone_tree(original,parent=None):
        c=original.copy()
        if original.data is not None:c.data=original.data.copy()
        collection.objects.link(c);c.parent=parent;copies.append(c)
        for child in original.children:clone_tree(child,c)
        return c
    export_root=clone_tree(root);consolidate(export_root)
    bpy.ops.object.select_all(action='DESELECT')
    export_root.select_set(True)
    for child in export_root.children_recursive:child.select_set(True)
    bpy.context.view_layer.objects.active=export_root
    path=OUT/(kind+'.glb')
    bpy.ops.export_scene.gltf(filepath=str(path),export_format=export_format,use_selection=True,
        export_apply=True,export_extras=True,export_cameras=False,export_lights=False)
    data=path.read_bytes();size,ctype=struct.unpack_from('<II',data,12)
    document=json.loads(data[20:20+size])
    for node in document.get('nodes',[]):
        canonical=node.get('extras',{}).get('canonicalName')
        if canonical:node['name']=canonical
    chunk=json.dumps(document,separators=(',',':')).encode();chunk+=b' '*(-len(chunk)%4)
    rest=data[20+size:]
    path.write_bytes(struct.pack('<III',0x46546C67,2,20+len(chunk)+len(rest))+struct.pack('<II',len(chunk),ctype)+chunk+rest)
    stats[kind]={'bytes':path.stat().st_size,'meshes':sum(o.type=='MESH' for o in export_root.children_recursive)}
    # These copies belong only to this export; never remove original/user data.
    bpy.data.batch_remove(ids=[export_root]+list(export_root.children_recursive))

for i,root in enumerate(roots.values()):root.location=(0,(i-1.5)*1.15,.45)
scene.world=bpy.data.worlds.new('Torpedo_Studio');scene.world.color=(.15,.15,.15)
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.shading.color_type='MATERIAL'
        area.spaces.active.overlay.show_overlays=False
        area.spaces.active.region_3d.view_distance=8
        area.spaces.active.region_3d.view_location=(0,0,.45)
        area.spaces.active.region_3d.view_rotation=Quaternion((.90,.34,-.12,-.24)).normalized()
        area.spaces.active.region_3d.view_perspective='ORTHO'
bpy.ops.object.select_all(action='DESELECT')
bpy.data.libraries.write(str(OUT/'torpedo-studies.blend'),{scene})
(OUT/'catalog.json').write_text(json.dumps({'version':1,'studyOnly':True,'models':stats},indent=2)+'\n')
print('Torpedo study scene:',scene.name)
print(json.dumps(stats))
