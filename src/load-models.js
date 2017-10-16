import * as THREE from 'three';

const jsonLoader = new THREE.JSONLoader();
const textureLoader = new THREE.TextureLoader();

const envMap = textureLoader.load( './hdri.png' );
envMap.format = THREE.RGBFormat;
envMap.mapping = THREE.SphericalReflectionMapping;

export default function loadModels() {

	return new Promise( resolve => {

		Promise.all( [
			load( 'amanita_a' ),
			load( 'amanita_b' ),
			load( 'big_ambrela' ),
			load( 'boletus' ),
			load( 'chanterelles' ),
			load( 'morel' ),
			load( 'mystical_truffel' ),
			load( 'russula' )
		] ).then( models => {

			resolve( models );

		} );

	} );

}

function load( name ) {

	return new Promise( resolve => {

		jsonLoader.load( `./models/${ name }.json`, ( geometry ) => {

			const rotMatrix = new THREE.Matrix4().makeRotationZ( THREE.Math.degToRad( - 90 ) );
			geometry.applyMatrix( rotMatrix );

			var material = new THREE.MeshStandardMaterial( {
				color: 0x333333,
				metalness: 0,
				roughness: .8,
				map      : textureLoader.load( `./models/${ name }_color.jpg` ),
				bumpMap  : textureLoader.load( `./models/${ name }_bump.jpg` ),
				normalMap: textureLoader.load( `./models/${ name }_normals.jpg` ),
				lightMap : textureLoader.load( `./models/${ name }_specular.jpg` ),
				bumpScale: 1,
				normalScale: new THREE.Vector2( 2, 2 ),
				envMap: envMap
			} );

			resolve( new THREE.Mesh( geometry, material ) );

		} );

	} );

}
