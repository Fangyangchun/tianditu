'use strict';
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackCleanupPlugin  = require('webpack-cleanup-plugin');
const outputRoot = path.resolve(__dirname, './release');
const srcRoot = path.resolve(__dirname, './');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var webpackConfig = {
    mode: "production",
    entry: {},//具体内容由后面编写的脚本填充
    output: {
        path: outputRoot,
        filename: 'js/[name].js'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                loader: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new WebpackCleanupPlugin(),
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
        ])
    ],
    devtool: '#eval-source-map-inline'
}


let filenames = fs.readdirSync(path.resolve(srcRoot, 'html'));

filenames.forEach(function(filename){
    let stats = fs.statSync(path.resolve(srcRoot, 'html', filename));
    if(stats.isFile()){
        let extension = path.extname(filename);
        let name = filename.substring(0,filename.lastIndexOf(extension));
        webpackConfig.entry[name] = path.resolve(srcRoot, 'js', name + '.js')
        webpackConfig.plugins.push(new HtmlWebpackPlugin({
            filename: 'html/' + name + '.html',
            template: path.resolve(srcRoot, 'html', name + '.html'),
            inject: true,
            chunks: ['common', name] //这个设置使得每个 html 只包含 common 以及与自己命名相同的那一个 chunk
        }));
    }
});

webpack(webpackConfig, function (err, stats) {
  if (err) throw err
  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n')
})