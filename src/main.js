import * as THREE from 'three';
import { Easing, Tween, autoPlay } from 'es6-tween/src/index.lite';
import { getARDisplay } from './ar-utils.js';
import ARView from './ARView.js';
import ARPerspectiveCamera from './ARPerspectiveCamera.js';
import ARPointCloudGeometry from './ARPointCloudGeometry.js';
import ARPointCloudDepthMaterial from './ARPointCloudDepthMaterial.js';
import positionAndRotateObject3DWithPickingPointAndPlaneInPointCloud from './positionAndRotateObject3DWithPickingPointAndPlaneInPointCloud.js';
import loadModels from './load-models.js';

THREE.VRControls = require( 'imports-loader?THREE!exports-loader?THREE.VRControls!@node_modules/three/examples/js/controls/VRControls.js' );

autoPlay( true );

const se = new Audio( 'se.ogg' );

getARDisplay().then( ( vrDisplay ) => {

	Promise.all( [
		loadModels()
	] ).then( results => {

		const models = results[ 0 ];

		const scene            = new THREE.Scene();
		const pointsDepthScene = new THREE.Scene();
		const camera           = new ARPerspectiveCamera( vrDisplay );

		const renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.gammaInput  = true;
		renderer.gammaOutput = true;
		renderer.autoClear = false;
		document.body.appendChild( renderer.domElement );

		const vrControls = new THREE.VRControls( camera );
		const arView = new ARView( vrDisplay, renderer );

		const pointLight = new THREE.PointLight( 0xffffff, 1, 0 );
		pointLight.position.set( 0, 3, 0 );

		scene.add(
			pointLight,
			new THREE.HemisphereLight( 0x443333, 0x332222 ),
			new THREE.AmbientLight( 0x999999 )
		);

		// var model = new THREE.Mesh(
		// 	new THREE.BoxGeometry( .1, .1, .1 ),
		//   new THREE.MeshBasicMaterial( {color: 0xff00ff } )
		// );
		// model.position.set( 0, 0, - 0.1 );
		// scene.add( model );

		// scene.add( models[ 0 ] );


		const pointCloudDepthMaterial = new ARPointCloudDepthMaterial();
		const pointCloudGeometry = new ARPointCloudGeometry( vrDisplay );
		const points = new THREE.Points( pointCloudGeometry, pointCloudDepthMaterial );
		points.frustumCulled = false;
		pointsDepthScene.add( points );

		anim();

		renderer.domElement.addEventListener( 'click', event => {

			if ( ! vrDisplay ) return;

			const x = event.pageX / window.innerWidth;
			const y = event.pageY / window.innerHeight;
			const mesh = createObject( x, y );
			scene.add( mesh );

		} );

		window.addEventListener( 'resize', () => {

			camera.updateProjectionMatrix();
			renderer.setSize( window.innerWidth, window.innerHeight );

		} );

		function anim() {

			vrDisplay.requestAnimationFrame( anim );
			vrDisplay.getPose();

			vrControls.update();
			pointCloudGeometry.update( true, 0, true );

			renderer.clear();
			arView.render();

			renderer.context.colorMask( false, false, false, false );
			renderer.render( pointsDepthScene, camera );
			renderer.context.colorMask( true, true, true, true );

			renderer.render( scene, camera );

		}

		function createObject( screenX, screenY ) {

			const scale = THREE.Math.randFloat( 0.5, 1 );
			const model = models[ THREE.Math.randInt( 0, models.length - 1 ) ].clone();
			const pointAndPlane = vrDisplay.getPickingPointAndPlaneInPointCloud( screenX, screenY );

			if ( ! pointAndPlane ) {

				// alert( 'couldn\'t pick a point. try again.' );
				return;

			}

			positionAndRotateObject3DWithPickingPointAndPlaneInPointCloud(
				pointAndPlane,
				model,
				- 0.01
			);

			model.scale.set( 0, 0, 0 );

			 new Tween( model.scale )
				.to( { x: scale, y: scale, z: scale }, 500 )
				.easing( Easing.Back.Out )
				.start();

			se.currentTime = 0;
			se.play();

			return model;

		}

	} );

} );
