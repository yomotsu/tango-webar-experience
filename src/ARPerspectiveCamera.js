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

export default function ARPerspectiveCamera( vrDisplay ) {

	const camera = new THREE.PerspectiveCamera();

	this.updateProjectionMatrix = function ( vrDisplay, camera ) {

		camera.aspect = window.innerWidth / window.innerHeight;

		const windowWidthBiggerThanHeight = window.innerWidth > window.innerHeight;
		const seeThroughCamera = vrDisplay.getSeeThroughCamera();

		const cameraWidthBiggerThanHeight = seeThroughCamera.width > seeThroughCamera.height;
		const swapWidthAndHeight = ! ( windowWidthBiggerThanHeight && cameraWidthBiggerThanHeight );

		const width  = swapWidthAndHeight ? seeThroughCamera.height : seeThroughCamera.width;
		const height = swapWidthAndHeight ? seeThroughCamera.width  : seeThroughCamera.height;
		const fx = swapWidthAndHeight ? seeThroughCamera.focalLengthY : seeThroughCamera.focalLengthX;
		const fy = swapWidthAndHeight ? seeThroughCamera.focalLengthX : seeThroughCamera.focalLengthY;
		const cx = swapWidthAndHeight ? seeThroughCamera.pointY : seeThroughCamera.pointX;
		const cy = swapWidthAndHeight ? seeThroughCamera.pointX : seeThroughCamera.pointY;

		const xscale = camera.near / fx;
		const yscale = camera.near / fy;

		const xoffset =   ( cx - ( width  / 2 ) ) * xscale;
		// Color camera's coordinates has Y pointing downwards so we negate this term.
		const yoffset = - ( cy - ( height / 2 ) ) * yscale;

		const left   = xscale * - width  / 2 - xoffset;
		const right  = xscale *   width  / 2 - xoffset;
		const bottom = yscale * - height / 2 - yoffset;
		const top    = yscale *   height / 2 - yoffset;

		camera.projectionMatrix.makeFrustum(
			left,
			right,
			bottom,
			top,
			camera.near,
			camera.far
		);

		// Recalculate the fov as threejs is not doing it.
		camera.fov = THREE.Math.radToDeg( Math.atan( ( top * camera.zoom ) / camera.near ) ) * 2;

	};

	this.updateProjectionMatrix( vrDisplay, camera );
	return camera;

}

