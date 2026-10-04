# Run through Blender MCP after scripts/export-island-catalog.mjs.
# Adds an isolated catalog scene; never deletes or modifies the user's scene.
import bpy, json, math
from mathutils import Quaternion, Vector
from pathlib import Path
root = Path(__file__).resolve().parents[1]
catalog = json.loads(Path('/tmp/azurlane-island-catalog.json').read_text())
scene = bpy.data.scenes.new('Azurlane_Island_Catalog_v044')
collection = bpy.data.collections.new('Azurlane_13_Island_Forms')
scene.collection.children.link(collection)
material = bpy.data.materials.new('Azurlane_Sand_Rock_Grass')
material.use_nodes = True
bsdf = next(n for n in material.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
bsdf.inputs['Roughness'].default_value = 1
vertex_color = material.node_tree.nodes.new('ShaderNodeVertexColor')
vertex_color.layer_name = 'IslandColor'
material.node_tree.links.new(vertex_color.outputs['Color'], bsdf.inputs['Base Color'])
for index, form in enumerate(catalog):
    vertices, faces, colors = [], [], []
    for part in form['meshes']:
        offset=len(vertices)
        pos=part['position']; rgb=part['color']
        vertices.extend((pos[i],-pos[i+2],pos[i+1]) for i in range(0,len(pos),3))
        colors.extend(tuple(rgb[i:i+3])+(1,) if rgb else tuple(part['baseColor'])+(1,) for i in range(0,len(pos),3))
        faces.extend((offset+i,offset+i+1,offset+i+2) for i in range(0,len(pos)//3,3))
    mesh=bpy.data.meshes.new(form['name']);mesh.from_pydata(vertices,[],faces);mesh.update()
    attribute=mesh.color_attributes.new(name='IslandColor',type='FLOAT_COLOR',domain='POINT')
    for item, value in zip(attribute.data,colors):item.color=value
    obj=bpy.data.objects.new(f"{form['size']}hex_{form['name']}",mesh);collection.objects.link(obj)
    obj.location=((index%4)*10,-(index//4)*8,0);obj.data.materials.append(material)
    obj['hex_count']=form['size'];obj['footprint']=json.dumps(form['cells'])
# An isolated review camera; no modifications to the original camera or lights.
camera_data=bpy.data.cameras.new('Island_Catalog_Camera')
valid=[i.identifier for i in camera_data.bl_rna.properties['type'].enum_items]
if 'ORTHO' in valid: camera_data.type='ORTHO'
camera_data.ortho_scale=46
camera=bpy.data.objects.new('Island_Catalog_Camera',camera_data);scene.collection.objects.link(camera)
camera.location=(20,-45,40);target=Vector((18,-12,0));camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();scene.camera=camera
scene.world=bpy.data.worlds.new('Island_Catalog_World');scene.world.color=(.2,.3,.4)
scene.render.resolution_x=1600;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
# Blender 5.2.2 crashes copying Scene via libraries.write (BKE_view_layer_copy_data).
# Save a copy through the regular file writer instead; keep the live file path unchanged.
if bpy.context.window: bpy.context.window.scene=scene
bpy.ops.wm.save_as_mainfile(filepath=str(root/'assets/models/island-library.blend'), copy=True)
if bpy.context.window:
    bpy.context.window.scene=scene
    for area in bpy.context.screen.areas:
        if area.type=='VIEW_3D':
            space=area.spaces.active
            space.region_3d.view_location=target;space.region_3d.view_distance=43
            space.region_3d.view_rotation=camera.rotation_euler.to_quaternion()
            valid=[i.identifier for i in space.shading.bl_rna.properties['color_type'].enum_items]
            if 'VERTEX' in valid:space.shading.color_type='VERTEX'
print('Saved 13 original island meshes: assets/models/island-library.blend')
