"use strict";

const webpack = require('webpack');
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
const path = require('path');
const env = require('yargs').argv.env; 
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ChunksPlugin = require('webpack-split-chunks');


let libraryName = 'anteros-react-theme';

let sufixCSS;
let uglifyPlugin;
let minimizeCSS = false;
let plugins = [];

if (env === 'build') {
  plugins.push(new UglifyJsPlugin({ minimize: true, comments: false }));
  plugins.push(new OptimizeCssAssetsPlugin());
  minimizeCSS = true;
  sufixCSS = '.min.css';
} else {
  sufixCSS = '.css';
}

plugins.push(new ExtractTextPlugin(libraryName+'-[name]'+sufixCSS));


module.exports = {
  entry: {
    blue: __dirname + '/src/assets/scss/blue.scss',
    'default': __dirname + '/src/assets/scss/dark-blue.scss',
    'dark-blue': __dirname + '/src/assets/scss/dark-blue.scss',
    'dark-green': __dirname + '/src/assets/scss/dark-green.scss',
    'gazin': __dirname + '/src/assets/scss/gazin.scss'
  },
  devtool: 'source-map',
  output: {
    path: __dirname + '/lib',
    filename: libraryName+'-[name]'+sufixCSS
  },
  plugins: plugins,  
  module: {
    loaders: [{
      test: /.js[x]?$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: {
        presets: ['es2015', 'es2017', 'react'],
        plugins: ['transform-object-rest-spread']
      }
    }, {
      test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)|\.png($|\?)|\.jpg($|\?)|\.gif($|\?)/,
      loader: 'url-loader',
    },
    {
      test: /\.s[ac]ss$/,
      use: ExtractTextPlugin.extract({
        use: ['css-loader', 'sass-loader'],
        fallback: 'style-loader'
      })
    },
    {
      test: /\.css$/,
      use: ExtractTextPlugin.extract({
        use: {
					loader: "css-loader",
					options: {
						sourceMap: true,
            minimize: minimizeCSS
					}
				},
        fallback: 'style-loader'
      })
    }]
  },
  resolve: {
    modules: ["node_modules"],
    extensions: ['.js', '.jsx']
  }
};

