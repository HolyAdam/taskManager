const path = require('path')
const HTMLPlugin = require('html-webpack-plugin')
const miniCssExtractPlugin = require('mini-css-extract-plugin')
const optCss = require('optimize-css-assets-webpack-plugin')
const uglJS = require('uglifyjs-webpack-plugin')


module.exports = {
	entry: ['@babel/polyfill', './src/js/app.js'],
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	optimization: {
		minimizer: [
			new optCss({}),
			new uglJS({})
		]
	},
	devServer: {
		contentBase: path.resolve(__dirname, 'dist'),
		port: 3000
	},
	plugins: [
		new HTMLPlugin({
			filename: 'index.html',
			template: './src/index.html'
		}),
		new miniCssExtractPlugin({
			filename: 'style.css'
		})
	],
	module: {
		rules: [

			{
				test: /\.css$/,
				use: [miniCssExtractPlugin.loader, 'css-loader?url=false']
			},
			{
				test: /\.sass$/,
				use: [miniCssExtractPlugin.loader, 'css-loader?url=false', 'sass-loader'],
				
			},
			{

			},

			{
		        test: /\.m?js$/,
		        exclude: /node_modules/,
		        use: {
		          loader: "babel-loader",
		          options: {
		            presets: ['@babel/preset-env']
		          }
		        }
		      }
		]
	}
}