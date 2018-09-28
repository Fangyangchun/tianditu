// 'use strict';
// require('babel-polyfill');
const Custom = module.exports = {};
require('./ext/LeafletExt');
L.CRS.CustomEPSG4326 = require('./ext/CRS.CustomEPSG4326');
Custom.DataSource = require('./layer/datasource/DataSource');
Custom.URLDataSource = require('./layer/datasource/URLDataSource');
Custom.LocalDataSource = require('./layer/datasource/LocalDataSource');
L.GLabelGrid = require('./layer/label/GLabelGrid');
L.GWVTAnno = require('./layer/label/GWVTAnno');
Custom.Feature = require('./layer/label/feature/Feature');

Custom.GGroup = require('./layer/vector/stylejs/GGroup');
Custom.GLevels = require('./layer/vector/stylejs/GLevels');
Custom.GStyleItem = require('./layer/vector/stylejs/GStyleItem');


L.GDynamicMap = require('./layer/vector/GDynamicMap');
L.GVMapGrid = require('./layer/vector/GVMapGrid');
L.GXYZ = require('./layer/vector/GXYZ');
Custom.GServiceGroup = require('./layer/GServiceGroup');


Custom.GVMapGridUtil = require('./layer/vector/draw/GVMapGridUtil');
Custom.Filter = require('./filter/Filter');
Custom.FilterLayer = require('./filter/FilterLayer');


