// based on https://github.com/google-ar/three.ar.js/blob/master/src/experimental/ARPointCloudDepthMaterial.js

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

var vertexShader = [
	'attribute vec3 position;',
	'uniform float size;',
	'uniform mat4 modelViewMatrix;',
	'uniform mat4 projectionMatrix;',
	'uniform vec4 plane;',
	'uniform float distance;',
	'varying float v_discard;',
	'void main(void) {',
	'	vec4 v4Position = vec4(position, 1.0);',
	'	float d = dot(plane, v4Position);',
	'	v_discard = 0.0;',
	'	if (abs(d) < distance) v_discard = 1.0;',
	'	gl_PointSize = size;',
	'	gl_Position = projectionMatrix * modelViewMatrix * v4Position;',
	'}'
].join( '\m' );

var fragmentShader = [
	'precision mediump float;',
	'uniform vec3 color;',
	'uniform float opacity;',
	'varying float v_discard;',
	'void main(void) {',
	'	if (v_discard > 0.0) discard;',
	'	gl_FragColor = vec4( color, opacity );',
	'}'
].join( '\m' );

export default class ARPointCloudDepthMaterial extends THREE.RawShaderMaterial {

	constructor() {

		super( {
			uniforms: {
				// size: { value: 30 },
				size: { value: 20 },
				opacity: { value: 0.1 },
				color: { value: new THREE.Color( 0xffffff ) },
				plane: { value: new THREE.Vector4() },
				distance: { value: 0.05 }
			},
			vertexShader: vertexShader,
			fragmentShader: fragmentShader
		} );

	}

}
