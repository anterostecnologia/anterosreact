"use strict";

const webpack = require('webpack');
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
const path = require('path');
const env = require('yargs').argv.env; 
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ChunksPlugin = require('webpack-split-chunks');


let libraryName = 'anteros-react-table';

let outputFileJs, outputFileCSS;
let uglifyPlugin;
let minimizeCSS = false;
let plugins = [];

if (env === 'build') {
  plugins.push(new UglifyJsPlugin({ minimize: true, comments: false }));
  minimizeCSS = true;
  outputFileJs = libraryName + '.min.js';
  outputFileCSS = libraryName + '.min.css';
} else {
  outputFileJs = libraryName + '.js';
  outputFileCSS = libraryName + '.css';
}

plugins.push(new ExtractTextPlugin(outputFileCSS));
plugins.push(new OptimizeCssAssetsPlugin());

module.exports = {
  entry: __dirname + '/src/index.jsx',
  devtool: 'source-map',
  output: {
    path: __dirname + '/lib',
    filename: outputFileJs,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  plugins: plugins,
  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react'
    },
    'react-dom': {
      root: 'ReactDOM',
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
      amd: 'react-dom'
    },
    'lodash': 'lodash',
    'anteros-react-core': 'anteros-react-core',
    'anteros-react-datasource': 'anteros-react-datasource',
    'axios': 'axios',
    'bootstrap':'bootstrap'
  },
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

