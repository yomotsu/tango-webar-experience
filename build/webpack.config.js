var path = require( 'path' );
var webpack = require( 'webpack' );

module.exports = {
	entry: {
		bundle: path.resolve( __dirname, '../src/main.js' ),
	},
	output: {
		path: path.resolve( __dirname, '../dist' ),
		publicPath: '/dist/',
		filename: '[name].js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			}
		]
	},
	resolve: {
		alias: {
			'@': path.resolve( __dirname, '../src/' ),
			'@node_modules': path.resolve( __dirname, '../node_modules/' )
		},
		extensions: [ '.js' ],
	},
	devServer: {
		contentBase: path.resolve( __dirname, '../dist/' ),
		host: '0.0.0.0',
		port: 3000,
		inline: true,
		historyApiFallback: true,
		noInfo: true
	},
	performance: {
		hints: false
	},
	devtool: '#eval-source-map'
};

if ( process.env.NODE_ENV === 'production' ) {

	delete module.exports.devtool;

	module.exports.plugins = ( module.exports.plugins || [] ).concat( [
		new webpack.DefinePlugin( {
			'process.env': {
				NODE_ENV: '"production"'
			}
		} ),
		new webpack.optimize.UglifyJsPlugin( {
			sourceMap: true,
			compress: {
				warnings: false
			}
		} ),
		new webpack.LoaderOptionsPlugin( {
			minimize: true
		} )
	] );

}
