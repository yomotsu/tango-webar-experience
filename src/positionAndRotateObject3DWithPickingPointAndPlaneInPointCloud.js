// based on https://github.com/google-ar/WebARonTango/blob/master/THREE.WebAR/THREE.WebAR.js

/*
 * Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as THREE from 'three';

const AR_WORLD_UP = new THREE.Vector3( 0, 1, 0 );
const AR_NORMAL_Y = new THREE.Vector3();
const AR_NORMAL_Z = new THREE.Vector3();
const AR_ROTATION_MATRIX = new THREE.Matrix4();
const AR_PLANE_NORMAL = new THREE.Vector3();

function rotateObject3D (normal1, normal2, object3d) {
  if (normal1 instanceof THREE.Vector3 || normal1 instanceof THREE.Vector4) {
    AR_PLANE_NORMAL.set(normal1.x, normal1.y, normal1.z);
  }
  else if (normal1 instanceof Float32Array) {
    AR_PLANE_NORMAL.set(normal1[0], normal1[1], normal1[2]);
  }
  else {
    throw "Unknown normal1 type.";
  }
  if (normal2 instanceof THREE.Vector3 || normal2 instanceof THREE.Vector4) {
    AR_NORMAL_Z.set(normal2.x, normal2.y, normal2.z);
  }
  else if (normal1 instanceof Float32Array) {
    AR_NORMAL_Z.set(normal2[0], normal2[1], normal2[2]);
  }
  else {
    throw "Unknown normal2 type.";
  }
  AR_NORMAL_Y.crossVectors(AR_PLANE_NORMAL, 
    AR_NORMAL_Z).normalize();
  AR_ROTATION_MATRIX.elements[ 0] = AR_PLANE_NORMAL.x;
  AR_ROTATION_MATRIX.elements[ 1] = AR_PLANE_NORMAL.y;
  AR_ROTATION_MATRIX.elements[ 2] = AR_PLANE_NORMAL.z;
  AR_ROTATION_MATRIX.elements[ 4] = AR_NORMAL_Z.x;
  AR_ROTATION_MATRIX.elements[ 5] = AR_NORMAL_Z.y;
  AR_ROTATION_MATRIX.elements[ 6] = AR_NORMAL_Z.z;
  AR_ROTATION_MATRIX.elements[ 8] = AR_NORMAL_Y.x;
  AR_ROTATION_MATRIX.elements[ 9] = AR_NORMAL_Y.y;
  AR_ROTATION_MATRIX.elements[10] = AR_NORMAL_Y.z;
  object3d.quaternion.setFromRotationMatrix(AR_ROTATION_MATRIX);
};

/**
* Transform a given THREE.Object3D instance to be correctly oriented according to a given plane normal.
* @param {THREE.Vector3|THREE.Vector4|Float32Array} plane A vector that represents the normal of the plane to be used to orient the object3d.
* @param {THREE.Object3D} object3d The object3d to be transformed so it is oriented according to the given plane.
*/
function rotateObject3DWithPickingPlane (plane, object3d) {
  if (plane instanceof THREE.Vector3 || plane instanceof THREE.Vector4) {
    AR_PLANE_NORMAL.set(plane.x, plane.y, plane.z);
  }
  else if (plane instanceof Float32Array) {
    AR_PLANE_NORMAL.set(plane[0], plane[1], plane[2]);
  }
  else {
    throw "Unknown plane type.";
  }
  AR_NORMAL_Y.set(0.0, 1.0, 0.0);
  var threshold = 0.5;
  if (Math.abs(AR_PLANE_NORMAL.dot( AR_WORLD_UP )) > 
    threshold) {
    AR_NORMAL_Y.set(0.0, 0.0, 1.0);
  }
  AR_NORMAL_Z.crossVectors(AR_PLANE_NORMAL, 
    AR_NORMAL_Y).normalize();
  AR_NORMAL_Y.crossVectors(AR_NORMAL_Z, 
    AR_PLANE_NORMAL).normalize();
  AR_ROTATION_MATRIX.elements[ 0] = AR_PLANE_NORMAL.x;
  AR_ROTATION_MATRIX.elements[ 1] = AR_PLANE_NORMAL.y;
  AR_ROTATION_MATRIX.elements[ 2] = AR_PLANE_NORMAL.z;
  AR_ROTATION_MATRIX.elements[ 4] = AR_NORMAL_Y.x;
  AR_ROTATION_MATRIX.elements[ 5] = AR_NORMAL_Y.y;
  AR_ROTATION_MATRIX.elements[ 6] = AR_NORMAL_Y.z;
  AR_ROTATION_MATRIX.elements[ 8] = AR_NORMAL_Z.x;
  AR_ROTATION_MATRIX.elements[ 9] = AR_NORMAL_Z.y;
  AR_ROTATION_MATRIX.elements[10] = AR_NORMAL_Z.z;
  object3d.quaternion.setFromRotationMatrix(AR_ROTATION_MATRIX);
};

/**
* Transform a given THREE.Object3D instance to be correctly positioned according to a given point position.
* @param {THREE.Vector3|THREE.Vector4|Float32Array} point A vector that represents the position where the object3d should be positioned.
* @param {THREE.Object3D} object3d The object3d to be transformed so it is positioned according to the given point.
*/
function positionObject3DWithPickingPoint (point, object3d) {
  if (point instanceof THREE.Vector3 || point instanceof THREE.Vector4) {
    object3d.position.set(point.x, point.y, point.z);
  }
  else if (point instanceof Float32Array) {
    object3d.position.set(point[0], point[1], point[2]);
  }
  else {
    throw "Unknown point type.";
  }
};

/**
* Transform a given THREE.Object3D instance to be correctly positioned and oriented according to a given VRPickingPointAndPlane and a scale (half the size of the object3d for example).
* @param {VRPickingPointandPlane} pointAndPlane The point and plane retrieved using the VRDisplay.getPickingPointAndPlaneInPointCloud function.
* @param {THREE.Object3D} object3d The object3d to be transformed so it is positioned and oriented according to the given point and plane.
* @param {number} scale The value the object3d will be positioned in the direction of the normal of the plane to be correctly positioned. Objects usually have their position value referenced as the center of the geometry. In this case, positioning the object in the picking point would lead to have the object3d positioned in the plane, not on top of it. this scale value will allow to correctly position the object in the picking point and in the direction of the normal of the plane. Half the size of the object3d would be a correct value in this case.
*/
export default function positionAndRotateObject3DWithPickingPointAndPlaneInPointCloud(pointAndPlane, object3d, scale) {
  rotateObject3DWithPickingPlane(pointAndPlane.plane, object3d);
  positionObject3DWithPickingPoint(pointAndPlane.point, object3d);
  object3d.position.add(AR_PLANE_NORMAL.multiplyScalar(scale));
};

/**
* Transform a given THREE.Object3D instance to be correctly positioned and oriented according to an axis formed by 2 plane normals, a position and a scale (half the size of the object3d for example).
* @param {VRPickingPointandPlane} pointAndPlane The point and plane retrieved using the VRDisplay.getPickingPointAndPlaneInPointCloud function.
* @param {THREE.Object3D} object3d The object3d to be transformed so it is positioned and oriented according to the given point and plane.
* @param {number} scale The value the object3d will be positioned in the direction of the normal of the plane to be correctly positioned. Objects usually have their position value referenced as the center of the geometry. In this case, positioning the object in the picking point would lead to have the object3d positioned in the plane, not on top of it. this scale value will allow to correctly position the object in the picking point and in the direction of the normal of the plane. Half the size of the object3d would be a correct value in this case.
*/
function positionAndRotateObject3D(position, normal1, normal2, object3d, scale) {
  rotateObject3D(normal1, normal2, object3d);
  positionObject3DWithPickingPoint(position, object3d);
  object3d.position.add(AR_PLANE_NORMAL.multiplyScalar(scale));
};



