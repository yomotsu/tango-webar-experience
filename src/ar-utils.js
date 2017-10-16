export function getARDisplay() {

	return new Promise( ( resolve, reject ) => {

		navigator.getVRDisplays().then( displays => {

			for ( let i = 0; i < displays.length; i ++ ) {

				if ( isTango( displays[ i ] ) ) {

					resolve( displays[ i ] );
					return;

				}

			}

			reject();

		} );

	} );

}

export function isTango( vrDisplay ) {

	return vrDisplay && /tango/.test( vrDisplay.displayName.toLowerCase() );

}
