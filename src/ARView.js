// based on https://github.com/google-ar/three.ar.js/blob/master/src/ARView.js

/*
 * Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as THREE from 'three';

const vertexShaderSource = [
	'attribute vec3 position;',
	'attribute vec2 uv;',
	'',
	'varying vec2 vUV;',
	'',
	'void main( void ) {',
	'',
	'	gl_Position = vec4( position, 1.0 );',
	'	vUV = uv;',
	'',
	'}'
].join( '\n' );

const fragmentShaderSource = [
	'#extension GL_OES_EGL_image_external : require',
	'precision mediump float;',
	'',
	'varying vec2 vUV;',
	'',
	'uniform samplerExternalOES map;',
	'',
	'void main( void ) {',
	'',
	'	gl_FragColor = texture2D( map, vUV );',
	'',
	'}'
].join( '\n' );

class ARVideoRenderer {

	constructor( vrDisplay ) {

		this.vrDisplay = vrDisplay;

		this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
		this.scene = new THREE.Scene();

		const geometry = new THREE.BufferGeometry();
		this.passThroughCamera = vrDisplay.getSeeThroughCamera();

		const video = this.passThroughCamera;
		// HACK: Needed to tell the THREE.VideoTexture that the video is ready and
		// that the texture needs update.
		video.readyState = 2;
		video.HAVE_CURRENT_DATA = 2;

		// All the possible texture coordinates for the 4 possible orientations.
		// The ratio between the texture size and the camera size is used in order
		// to be compatible with the YUV to RGB conversion option (not recommended
		// but still available).
		const u = this.passThroughCamera.width / this.passThroughCamera.textureWidth;
		const v = this.passThroughCamera.height / this.passThroughCamera.textureHeight;

		this.f32TextureCoords = [
			new Float32Array( [
				0, 0,
				0, v,
				u, 0,
				u, v
			] ),
			new Float32Array( [
				u, 0,
				0, 0,
				u, v,
				0, v
			] ),
			new Float32Array( [
				u, v,
				u, 0,
				0, v,
				0, 0
			] ),
			new Float32Array( [
				0, v,
				u, v,
				0, 0,
				u, 0
			] )
		];

		geometry.addAttribute( 'position', new THREE.BufferAttribute(
			new Float32Array( [
				- 1,   1, 0,
				- 1, - 1, 0,
				  1,   1, 0,
				  1, - 1, 0
			] ), 3
		) );
		geometry.setIndex( new THREE.BufferAttribute( new Uint16Array( [ 0, 1, 2, 2, 1, 3 ] ), 1 ) );

		this.combineOrientation = getCombineOrientation(
			screen.orientation.angle,
			this.passThroughCamera.orientation
		);
		const textureCoords = this.f32TextureCoords[ this.combineOrientation ];
		geometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( textureCoords ), 2 ) );
		geometry.computeBoundingSphere();

		const videoTexture = new THREE.VideoTexture( video );
		videoTexture.minFilter = THREE.NearestFilter;
		videoTexture.magFilter = THREE.NearestFilter;
		videoTexture.format = THREE.RGBFormat;
		videoTexture.flipY = false;

		// The material is different if the see through camera is provided inside the vrDisplay or not.
		const material = new THREE.RawShaderMaterial( {
			uniforms: {
				map: { type: 't', value: videoTexture },
			},
			vertexShader: vertexShaderSource,
			fragmentShader: fragmentShaderSource,
			side: THREE.DoubleSide,
			depthWrite: false,
			depthTest: false
		} );

		this.quad = new THREE.Mesh( geometry, material );
		this.quad.frustumCulled = false; // Avoid getting clipped
		this.scene.add( this.quad );

	}

	render( renderer ) {

		const combineOrientation = getCombineOrientation(
			screen.orientation.angle,
			this.vrDisplay.getSeeThroughCamera().orientation
		);

	  if ( combineOrientation !== this.combineOrientation ) {

			const uvs = this.quad.geometry.getAttribute( 'uv' );
			const textureCoords = this.f32TextureCoords[ combineOrientation ];
			this.combineOrientation = combineOrientation;

			for ( let i = 0; i < uvs.length; i ++ ) {

				uvs.array[ i ] = textureCoords[ i ];

			}

			uvs.needsUpdate = true;

		}

		renderer.render( this.scene, this.camera );

	}

}

export default class ARView {

	/**
	 * @param {VRDisplay} vrDisplay
	 * @param {THREE.WebGLRenderer} renderer
	 */
	constructor( vrDisplay, renderer ) {

		this.vrDisplay = vrDisplay;

		this.renderer = renderer;
		this.gl = renderer.context;

		this.videoRenderer = new ARVideoRenderer( vrDisplay );
		this._resetGLState();

		// Cache the width/height so we're not potentially forcing
		// a reflow if there's been a style invalidation
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		window.addEventListener( 'resize', this.onWindowResize.bind( this ), false );

	}

	/**
	 * Updates the stored width/height of window on resize.
	 */
	onWindowResize() {

		this.width = window.innerWidth;
		this.height = window.innerHeight;

	}

	/**
	 * Renders the see through camera to the passed in renderer
	 */
	render() {

		const gl = this.gl;
		const dpr = window.devicePixelRatio;
		const width = this.width * dpr;
		const height = this.height * dpr;

		if ( gl.viewportWidth !== width ) {

			gl.viewportWidth = width;

		}

		if ( gl.viewportHeight !== height ) {

			gl.viewportHeight = height;

		}

		// this.gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );
		this.videoRenderer.render( this.renderer );
		// this._resetGLState();

	}

	/**
	 * Resets the GL state in the THREE.WebGLRenderer.
	 */
	_resetGLState() {

		if ( typeof this.renderer.resetGLState === 'function' ) {

			// If using three.js <= r86
			this.renderer.resetGLState();

		} else {

			// If using three.js >= r87
			this.renderer.state.reset();

		}

	}

}

function getCombineOrientation( screenOrientation, seeThroughCameraOrientation ) {

	let seeThroughCameraOrientationIndex = 0;
	switch ( seeThroughCameraOrientation ) {

		case 90:
			seeThroughCameraOrientationIndex = 1;
			break;
		case 180:
			seeThroughCameraOrientationIndex = 2;
			break;
		case 270:
			seeThroughCameraOrientationIndex = 3;
			break;
		default:
			seeThroughCameraOrientationIndex = 0;
			break;

	}
	let screenOrientationIndex = 0;
	switch ( screenOrientation ) {

		case 90:
			screenOrientationIndex = 1;
			break;
		case 180:
			screenOrientationIndex = 2;
			break;
		case 270:
			screenOrientationIndex = 3;
			break;
		default:
			screenOrientationIndex = 0;
			break;

	}
	let ret = screenOrientationIndex - seeThroughCameraOrientationIndex;

	if ( ret < 0 ) {

		ret += 4;

	}

	return ret % 4;

}
