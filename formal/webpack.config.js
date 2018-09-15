
var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var assets = 'release/';
var jsSrc = path.join(__dirname,'js');
var entries = getEntries();
var chunks = Object.keys(entries);

function getEntries(){

    var files = fs.readdirSync(jsSrc);

    var regexp = /(.*)\.js$/;
    var map = {};

    files.forEach((file)=>{
        var matchfile = file.match(regexp);

        if( matchfile ){
            map[matchfile[1]] = path.resolve(__dirname,jsSrc+"/"+matchfile[0])
        }

    });

    return map;
}

module.exports = {
    entry: entries,
    output: {
        path: path.resolve(assets),    // 默认会生成`dist/`文件夹
        filename: 'js/[name].js',
        chunkFilename: 'js/[name].[chunkhash:8].chunk.js',
        publicPath: './'
    },
    devtool: 'inline-source-map',
    plugins: [
        new CleanWebpackPlugin(['release']),
        new CopyWebpackPlugin([
            {
                from: __dirname+'/libs',
                to: __dirname+'/release/libs'
            },
            {
                from: __dirname+'/css',
                to: __dirname+'/release/css'
            },
            {
                from: __dirname+'/img',
                to: __dirname+'/release/img'
            },
            {
                from: __dirname+'/html',
                to: __dirname+'/release/html'
            }
        ])
    ]
};