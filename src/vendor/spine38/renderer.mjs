/*!
Spine Runtimes License Agreement
Last updated May 1, 2019. Replaces all prior versions.

Copyright (c) 2013-2019, Esoteric Software LLC

Integration of the Spine Runtimes into software or otherwise creating
derivative works of the Spine Runtimes is permitted under the terms and
conditions of Section 2 of the Spine Editor License Agreement:
http://esotericsoftware.com/spine-editor-license

Otherwise, it is permitted to integrate the Spine Runtimes into software
or otherwise create derivative works of the Spine Runtimes (collectively,
"Products"), provided that each user of the Products must obtain their own
Spine Editor license and redistribution of the Products in any form must
include this license and copyright notice.

THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
import * as THREE from "three";
import core from "./core.mjs";
let spine = core;
var __extends = (this && this.__extends) || (function () {
	var extendStatics = function (d, b) {
		extendStatics = Object.setPrototypeOf ||
			({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
			function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
		return extendStatics(d, b);
	};
	return function (d, b) {
		if (typeof b !== "function" && b !== null)
			throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
		extendStatics(d, b);
		function __() { this.constructor = d; }
		d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
})();

(function (spine) {
	var threejs;
	(function (threejs) {
		var AssetManager = (function (_super) {
			__extends(AssetManager, _super);
			function AssetManager(pathPrefix) {
				if (pathPrefix === void 0) { pathPrefix = ""; }
				return _super.call(this, function (image) {
					return new threejs.ThreeJsTexture(image);
				}, pathPrefix) || this;
			}
			return AssetManager;
		}(spine.AssetManager));
		threejs.AssetManager = AssetManager;
	})(threejs = spine.threejs || (spine.threejs = {}));
})(spine || (spine = {}));

(function (spine) {
	var threejs;
	(function (threejs) {
		var MeshBatcher = (function (_super) {
			__extends(MeshBatcher, _super);
			function MeshBatcher(maxVertices, materialCustomizer) {
				if (maxVertices === void 0) { maxVertices = 10920; }
				if (materialCustomizer === void 0) { materialCustomizer = function (parameters) { }; }
				var _this = Reflect.construct(_super, [], this.constructor);
				_this.verticesLength = 0;
				_this.indicesLength = 0;
				if (maxVertices > 10920)
					throw new Error("Can't have more than 10920 triangles per batch: " + maxVertices);
				var vertices = _this.vertices = new Float32Array(maxVertices * MeshBatcher.VERTEX_SIZE);
				var indices = _this.indices = new Uint16Array(maxVertices * 3);
				var geo = new THREE.BufferGeometry();
				var vertexBuffer = _this.vertexBuffer = new THREE.InterleavedBuffer(vertices, MeshBatcher.VERTEX_SIZE);
				vertexBuffer.usage = THREE.DynamicDrawUsage;
				geo.setAttribute("position", new THREE.InterleavedBufferAttribute(vertexBuffer, 3, 0, false));
				geo.setAttribute("color", new THREE.InterleavedBufferAttribute(vertexBuffer, 4, 3, false));
				geo.setAttribute("uv", new THREE.InterleavedBufferAttribute(vertexBuffer, 2, 7, false));
				geo.setIndex(new THREE.BufferAttribute(indices, 1));
				geo.getIndex().usage = THREE.DynamicDrawUsage;
				;
				geo.drawRange.start = 0;
				geo.drawRange.count = 0;
				_this.geometry = geo;
				_this.material = new threejs.SkeletonMeshMaterial(materialCustomizer);
				return _this;
			}
			MeshBatcher.prototype.dispose = function () {
				this.geometry.dispose();
				if (this.material instanceof THREE.Material)
					this.material.dispose();
				else if (this.material) {
					for (var i = 0; i < this.material.length; i++) {
						var material = this.material[i];
						if (material instanceof THREE.Material)
							material.dispose();
					}
				}
			};
			MeshBatcher.prototype.clear = function () {
				var geo = this.geometry;
				geo.drawRange.start = 0;
				geo.drawRange.count = 0;
				this.material.uniforms.map.value = null;
			};
			MeshBatcher.prototype.begin = function () {
				this.verticesLength = 0;
				this.indicesLength = 0;
			};
			MeshBatcher.prototype.canBatch = function (verticesLength, indicesLength) {
				if (this.indicesLength + indicesLength >= this.indices.byteLength / 2)
					return false;
				if (this.verticesLength + verticesLength >= this.vertices.length)
					return false;
				return true;
			};
			MeshBatcher.prototype.batch = function (vertices, verticesLength, indices, indicesLength, z) {
				if (z === void 0) { z = 0; }
				var indexStart = this.verticesLength / MeshBatcher.VERTEX_SIZE;
				var vertexBuffer = this.vertices;
				var i = this.verticesLength;
				var j = 0;
				for (; j < verticesLength;) {
					vertexBuffer[i++] = vertices[j++];
					vertexBuffer[i++] = vertices[j++];
					vertexBuffer[i++] = z;
					vertexBuffer[i++] = vertices[j++];
					vertexBuffer[i++] = vertices[j++];
					vertexBuffer[i++] = vertices[j++];
					vertexBuffer[i++] = vertices[j++];
					vertexBuffer[i++] = vertices[j++];
					vertexBuffer[i++] = vertices[j++];
				}
				this.verticesLength = i;
				var indicesArray = this.indices;
				for (i = this.indicesLength, j = 0; j < indicesLength; i++, j++)
					indicesArray[i] = indices[j] + indexStart;
				this.indicesLength += indicesLength;
			};
			MeshBatcher.prototype.end = function () {
				this.vertexBuffer.needsUpdate = this.verticesLength > 0;
				this.vertexBuffer.clearUpdateRanges();
                this.vertexBuffer.addUpdateRange(0, this.verticesLength);
				var geo = this.geometry;
				geo.getIndex().needsUpdate = this.indicesLength > 0;
				geo.getIndex().clearUpdateRanges();
                geo.getIndex().addUpdateRange(0, this.indicesLength);
				geo.drawRange.start = 0;
				geo.drawRange.count = this.indicesLength;
			};
			MeshBatcher.VERTEX_SIZE = 9;
			return MeshBatcher;
		}(THREE.Mesh));
		threejs.MeshBatcher = MeshBatcher;
	})(threejs = spine.threejs || (spine.threejs = {}));
})(spine || (spine = {}));

(function (spine) {
	var threejs;
	(function (threejs) {
		var SkeletonMeshMaterial = (function (_super) {
			__extends(SkeletonMeshMaterial, _super);
			function SkeletonMeshMaterial(customizer) {
				var _this = this;
				var vertexShader = "\n\t\t\t\tattribute vec4 color;\n\t\t\t\tvarying vec2 vUv;\n\t\t\t\tvarying vec4 vColor;\n\t\t\t\tvoid main() {\n\t\t\t\t\tvUv = uv;\n\t\t\t\t\tvColor = color;\n\t\t\t\t\tgl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);\n\t\t\t\t}\n\t\t\t";
				var fragmentShader = "\n\t\t\t\tuniform sampler2D map;\n\t\t\t\tvarying vec2 vUv;\n\t\t\t\tvarying vec4 vColor;\n\t\t\t\tvoid main(void) {\n\t\t\t\t\tgl_FragColor = texture2D(map, vUv)*vec4(vColor.rgb*vColor.a,vColor.a);\n\t\t\t\t}\n\t\t\t";
				var parameters = {
					uniforms: {
						map: { type: "t", value: null }
					},
					vertexShader: vertexShader,
					fragmentShader: fragmentShader,
					side: THREE.DoubleSide,
					transparent: true,
					depthWrite: false, depthTest: true, alphaTest: 0, premultipliedAlpha: true
				};
				customizer(parameters);
				_this = Reflect.construct(_super, [parameters], this.constructor);
				return _this;
			}
			;
			return SkeletonMeshMaterial;
		}(THREE.ShaderMaterial));
		threejs.SkeletonMeshMaterial = SkeletonMeshMaterial;
		var SkeletonMesh = (function (_super) {
			__extends(SkeletonMesh, _super);
			function SkeletonMesh(skeletonData, materialCustomizer) {
				if (materialCustomizer === void 0) { materialCustomizer = function (parameters) { }; }
				var _this = Reflect.construct(_super, [], this.constructor);
				_this.tempPos = new spine.Vector2();
				_this.tempUv = new spine.Vector2();
				_this.tempLight = new spine.Color();
				_this.tempDark = new spine.Color();
				_this.zOffset = 0.1;
				_this.batches = new Array();
				_this.nextBatchIndex = 0;
				_this.clipper = new spine.SkeletonClipping();
				_this.vertices = spine.Utils.newFloatArray(1024);
				_this.tempColor = new spine.Color();
				_this.materialCustomizer = materialCustomizer;
				_this.skeleton = new spine.Skeleton(skeletonData);
				var animData = new spine.AnimationStateData(skeletonData);
				_this.state = new spine.AnimationState(animData);
				return _this;
			}
			SkeletonMesh.prototype.update = function (deltaTime) {
				var state = this.state;
				var skeleton = this.skeleton;
				state.update(deltaTime);
				state.apply(skeleton);
				skeleton.updateWorldTransform();
				this.updateGeometry();
			};
			SkeletonMesh.prototype.dispose = function () {
				for (var i = 0; i < this.batches.length; i++) {
					this.batches[i].dispose();
				}
			};
			SkeletonMesh.prototype.clearBatches = function () {
				for (var i = 0; i < this.batches.length; i++) {
					this.batches[i].clear();
					this.batches[i].visible = false;
				}
				this.nextBatchIndex = 0;
			};
			SkeletonMesh.prototype.nextBatch = function () {
				if (this.batches.length == this.nextBatchIndex) {
					var batch_1 = new threejs.MeshBatcher(10920, this.materialCustomizer);
					this.add(batch_1);
					this.batches.push(batch_1);
				}
				var batch = this.batches[this.nextBatchIndex++];
				batch.visible = true;
				return batch;
			};
			SkeletonMesh.prototype.updateGeometry = function () {
				this.clearBatches();
				var tempPos = this.tempPos;
				var tempUv = this.tempUv;
				var tempLight = this.tempLight;
				var tempDark = this.tempDark;
				var numVertices = 0;
				var verticesLength = 0;
				var indicesLength = 0;
				var blendMode = null;
				var clipper = this.clipper;
				var vertices = this.vertices;
				var triangles = null;
				var uvs = null;
				var drawOrder = this.skeleton.drawOrder;
				var batch = this.nextBatch();
				batch.begin();
				var z = 0;
				var zOffset = this.zOffset;
				for (var i = 0, n = drawOrder.length; i < n; i++) {
					var vertexSize = clipper.isClipping() ? 2 : SkeletonMesh.VERTEX_SIZE;
					var slot = drawOrder[i];
					if (!slot.bone.active) {
                        clipper.clipEndWithSlot(slot);
                        continue;
                    }
					var attachment = slot.getAttachment();
					var attachmentColor = null;
					var texture = null;
					var numFloats = 0;
					if (attachment instanceof spine.RegionAttachment) {
						var region = attachment;
						attachmentColor = region.color;
						vertices = this.vertices;
						numFloats = vertexSize * 4;
						region.computeWorldVertices(slot.bone, vertices, 0, vertexSize);
						triangles = SkeletonMesh.QUAD_TRIANGLES;
						uvs = region.uvs;
						texture = region.region.renderObject.texture;
					}
					else if (attachment instanceof spine.MeshAttachment) {
						var mesh = attachment;
						attachmentColor = mesh.color;
						vertices = this.vertices;
						numFloats = (mesh.worldVerticesLength >> 1) * vertexSize;
						if (numFloats > vertices.length) {
							vertices = this.vertices = spine.Utils.newFloatArray(numFloats);
						}
						mesh.computeWorldVertices(slot, 0, mesh.worldVerticesLength, vertices, 0, vertexSize);
						triangles = mesh.triangles;
						uvs = mesh.uvs;
						texture = mesh.region.renderObject.texture;
					}
					else if (attachment instanceof spine.ClippingAttachment) {
						var clip = (attachment);
						clipper.clipStart(slot, clip);
						continue;
					}
					else { clipper.clipEndWithSlot(slot); continue; }
					if (texture != null) {
						var skeleton = slot.bone.skeleton;
						var skeletonColor = skeleton.color;
						var slotColor = slot.color;
						var alpha = skeletonColor.a * slotColor.a * attachmentColor.a;
						var color = this.tempColor;
						color.set(skeletonColor.r * slotColor.r * attachmentColor.r, skeletonColor.g * slotColor.g * attachmentColor.g, skeletonColor.b * slotColor.b * attachmentColor.b, alpha);
						var finalVertices = void 0;
						var finalVerticesLength = void 0;
						var finalIndices = void 0;
						var finalIndicesLength = void 0;
						if (clipper.isClipping()) {
							clipper.clipTriangles(vertices, numFloats, triangles, triangles.length, uvs, color, null, false);
							var clippedVertices = clipper.clippedVertices;
							var clippedTriangles = clipper.clippedTriangles;
							if (this.vertexEffect != null) {
								var vertexEffect = this.vertexEffect;
								var verts = clippedVertices;
								for (var v = 0, n_3 = clippedVertices.length; v < n_3; v += vertexSize) {
									tempPos.x = verts[v];
									tempPos.y = verts[v + 1];
									tempLight.setFromColor(color);
									tempDark.set(0, 0, 0, 0);
									tempUv.x = verts[v + 6];
									tempUv.y = verts[v + 7];
									vertexEffect.transform(tempPos, tempUv, tempLight, tempDark);
									verts[v] = tempPos.x;
									verts[v + 1] = tempPos.y;
									verts[v + 2] = tempLight.r;
									verts[v + 3] = tempLight.g;
									verts[v + 4] = tempLight.b;
									verts[v + 5] = tempLight.a;
									verts[v + 6] = tempUv.x;
									verts[v + 7] = tempUv.y;
								}
							}
							finalVertices = clippedVertices;
							finalVerticesLength = clippedVertices.length;
							finalIndices = clippedTriangles;
							finalIndicesLength = clippedTriangles.length;
						}
						else {
							var verts = vertices;
							if (this.vertexEffect != null) {
								var vertexEffect = this.vertexEffect;
								for (var v = 0, u = 0, n_4 = numFloats; v < n_4; v += vertexSize, u += 2) {
									tempPos.x = verts[v];
									tempPos.y = verts[v + 1];
									tempLight.setFromColor(color);
									tempDark.set(0, 0, 0, 0);
									tempUv.x = uvs[u];
									tempUv.y = uvs[u + 1];
									vertexEffect.transform(tempPos, tempUv, tempLight, tempDark);
									verts[v] = tempPos.x;
									verts[v + 1] = tempPos.y;
									verts[v + 2] = tempLight.r;
									verts[v + 3] = tempLight.g;
									verts[v + 4] = tempLight.b;
									verts[v + 5] = tempLight.a;
									verts[v + 6] = tempUv.x;
									verts[v + 7] = tempUv.y;
								}
							}
							else {
								for (var v = 2, u = 0, n_5 = numFloats; v < n_5; v += vertexSize, u += 2) {
									verts[v] = color.r;
									verts[v + 1] = color.g;
									verts[v + 2] = color.b;
									verts[v + 3] = color.a;
									verts[v + 4] = uvs[u];
									verts[v + 5] = uvs[u + 1];
								}
							}
							finalVertices = vertices;
							finalVerticesLength = numFloats;
							finalIndices = triangles;
							finalIndicesLength = triangles.length;
						}
						if (finalVerticesLength == 0 || finalIndicesLength == 0) {
                            clipper.clipEndWithSlot(slot);
                            continue;
                        }
						if (!batch.canBatch(finalVerticesLength, finalIndicesLength)) {
							batch.end();
							batch = this.nextBatch();
							batch.begin();
						}
						var batchMaterial = batch.material;
						if (batchMaterial.uniforms.map.value == null) {
							batchMaterial.uniforms.map.value = texture.texture;
						}
						if (batchMaterial.uniforms.map.value != texture.texture || (batch.indicesLength > 0 && batchMaterial.userData.slotBlend !== slot.data.blendMode)) {
							batch.end();
							batch = this.nextBatch();
							batch.begin();
							batchMaterial = batch.material;
							batchMaterial.uniforms.map.value = texture.texture;
						}
						batchMaterial.userData.slotBlend = slot.data.blendMode;
                        const mode = slot.data.blendMode;
                        batchMaterial.blending = THREE.CustomBlending;
                        batchMaterial.blendEquation = THREE.AddEquation;
                        batchMaterial.blendSrc = mode === spine.BlendMode.Multiply ? THREE.DstColorFactor : THREE.OneFactor;
                        batchMaterial.blendDst = mode === spine.BlendMode.Additive ? THREE.OneFactor : mode === spine.BlendMode.Screen ? THREE.OneMinusSrcColorFactor : THREE.OneMinusSrcAlphaFactor;
                        batchMaterial.blendSrcAlpha = THREE.OneFactor;
                        batchMaterial.blendDstAlpha = mode === spine.BlendMode.Additive ? THREE.OneFactor : THREE.OneMinusSrcAlphaFactor;
                        batchMaterial.needsUpdate = true;
						batch.batch(finalVertices, finalVerticesLength, finalIndices, finalIndicesLength, z);
						z += zOffset;
					}
					clipper.clipEndWithSlot(slot);
				}
				clipper.clipEnd();
				batch.end();
			};
			SkeletonMesh.QUAD_TRIANGLES = [0, 1, 2, 2, 3, 0];
			SkeletonMesh.VERTEX_SIZE = 2 + 2 + 4;
			return SkeletonMesh;
		}(THREE.Object3D));
		threejs.SkeletonMesh = SkeletonMesh;
	})(threejs = spine.threejs || (spine.threejs = {}));
})(spine || (spine = {}));

(function (spine) {
	var threejs;
	(function (threejs) {
		var ThreeJsTexture = (function (_super) {
			__extends(ThreeJsTexture, _super);
			function ThreeJsTexture(image) {
				var _this = _super.call(this, image) || this;
				_this.texture = new THREE.Texture(image);
				_this.texture.flipY = false;
				_this.texture.needsUpdate = true;
				return _this;
			}
			ThreeJsTexture.prototype.setFilters = function (minFilter, magFilter) {
				this.texture.minFilter = ThreeJsTexture.toThreeJsTextureFilter(minFilter);
				this.texture.magFilter = ThreeJsTexture.toThreeJsTextureFilter(magFilter);
			};
			ThreeJsTexture.prototype.setWraps = function (uWrap, vWrap) {
				this.texture.wrapS = ThreeJsTexture.toThreeJsTextureWrap(uWrap);
				this.texture.wrapT = ThreeJsTexture.toThreeJsTextureWrap(vWrap);
			};
			ThreeJsTexture.prototype.dispose = function () {
				this.texture.dispose();
			};
			ThreeJsTexture.toThreeJsTextureFilter = function (filter) {
				if (filter === spine.TextureFilter.Linear)
					return THREE.LinearFilter;
				else if (filter === spine.TextureFilter.MipMap)
					return THREE.LinearMipmapLinearFilter;
				else if (filter === spine.TextureFilter.MipMapLinearNearest)
					return THREE.LinearMipmapNearestFilter;
				else if (filter === spine.TextureFilter.MipMapNearestLinear)
					return THREE.NearestMipmapLinearFilter;
				else if (filter === spine.TextureFilter.MipMapNearestNearest)
					return THREE.NearestMipmapNearestFilter;
				else if (filter === spine.TextureFilter.Nearest)
					return THREE.NearestFilter;
				else
					throw new Error("Unknown texture filter: " + filter);
			};
			ThreeJsTexture.toThreeJsTextureWrap = function (wrap) {
				if (wrap === spine.TextureWrap.ClampToEdge)
					return THREE.ClampToEdgeWrapping;
				else if (wrap === spine.TextureWrap.MirroredRepeat)
					return THREE.MirroredRepeatWrapping;
				else if (wrap === spine.TextureWrap.Repeat)
					return THREE.RepeatWrapping;
				else
					throw new Error("Unknown texture wrap: " + wrap);
			};
			return ThreeJsTexture;
		}(spine.Texture));
		threejs.ThreeJsTexture = ThreeJsTexture;
	})(threejs = spine.threejs || (spine.threejs = {}));
})(spine || (spine = {}));

export default spine.threejs;
