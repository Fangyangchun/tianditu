(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Custom = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * 重写move方法，解决拖动注记抖动的bug
 */
OpenLayers.Kinetic.prototype.move =(function(_super) {
    return function() {
        var args = Array.prototype.slice.call(arguments);
        var callback = function(x, y, end){
            if(end){
                x = Math.round(x);
                y = Math.round(y);
            }
            args[1](x,y,end);
        };
        _super.apply(this, [args[0],callback]);
    };
})(OpenLayers.Kinetic.prototype.move);

/**
 * 重写down方法，解决拖动地图过程中，地图有时不发请求的bug
 */
OpenLayers.Handler.Drag.prototype.down = function(evt){
    if(this.map.dragging){
        this.map.setCenter(this.map.getCenter());
        this.map.dragging = false;
    }
};

/**
 * 重写shouldDraw方法，解决图层重绘时，报指针的bug
 */
OpenLayers.Tile.prototype.shouldDraw =(function(_super) {
    return function() {
        if(!this.layer){
            return false;
        }
        return _super.apply(this);
    };
})(OpenLayers.Tile.prototype.shouldDraw);

/**
 * 如果是ie浏览器，则增加startsWith和endsWith方法
 */
if (!!window.ActiveXObject || "ActiveXObject" in window) {
    String.prototype.startsWith = function (str) {

        if (str == null || str == "" || this.length == 0 || str.length > this.length)
            return false;
        if (this.substr(0, str.length) == str)
            return true;
        else
            return false;
        return true;
    };

    String.prototype.endsWith = function(str) {
        if (!!window.ActiveXObject || "ActiveXObject" in window) {
            return this.indexOf(str, this.length - str.length) !== -1;
        }else{
            return this.endsWith(str);
        }
    };
}
},{}],2:[function(require,module,exports){
module.exports  = 'jssdk_bate@ leaflet 2.0.5';
},{}],3:[function(require,module,exports){
/**
 * Created by kongjian on 2017/6/30.
 */
class Filter{
    constructor(){
        //该值为ture时，后面的layers是全部要显示的，如果为false，后面的layers全部不显示,顶替上面的cmdAll
        this.otherDisplay = true;
        //图层集合
        this.layers = [];
        //里面存放layerName，最终渲染的图层顺序以该图层存放的顺序为准，如果为空数组，则以样式文件中的顺序为准. 注记图层，该属性会被忽略
        this.order = [];
    }


    /**
     * 添加过滤图层
     * Parameters :
     * filterLayer - 过滤图层
     */
    addFilterLayer(filterLayer){
        this.layers.push(filterLayer);
    }

    /**
     * 移除过滤图层
     * Parameters :
     * filterLayerId - 过滤图层ID
     */
    removeFilterLayerById(filterLayerId){
        for(var i = 0;i<this.layers.length;i++){
            if(this.layers[i].id == filterLayerId){
                this.layers.splice(i,1);
            }
        }
    }
}
module.exports = Filter;
},{}],4:[function(require,module,exports){
/**
 * Created by kongjian on 2017/6/30.
 */
const Filter = require('./Filter');
class FilterLayer extends Filter{
    constructor(){
        super();
        //过滤图层的唯一标识
        this.id = null;
        //过滤条件
        this.filters = {};
        //过滤数据的唯一id标识
        this.idFilter = null;
        //过滤字符串,与制图系统中的过滤字符串一致，如果同时也有filters，服务会优先使用filterStr
        this.filterStr = null;
        //是否显示
        this.display = true;
    }

    /**
     * 添加字段过滤条件
     * Parameters :
     * key - 如： Q_fcode_S_EQ，表示fcode等于value的值
     * value - 如：2101010500
     */
    addFilterField(key,value){
        this.filters[key] = value;
    }

    /**
     * 添加字段过滤条件
     * Parameters :
     * key
     */
    removeFilterField(key){
        delete this.filters[key];
    }
}
module.exports = FilterLayer;
},{"./Filter":3}],5:[function(require,module,exports){
'use strict';

const Custom = module.exports = {};
require('./ext/OlExt');

Custom.DataSource = require('./layer/datasource/DataSource');
Custom.URLDataSource = require('./layer/datasource/URLDataSource');
Custom.LocalDataSource = require('./layer/datasource/LocalDataSource');

OpenLayers.Layer.GWVTAnno = require('./layer/label/GWVTAnno');
Custom.Feature = require('./layer/label/feature/Feature');

OpenLayers.Layer.GXYZ = require('./layer/vector/GXYZ');
Custom.GServiceGroup = require('./layer/GServiceGroup');





},{"./ext/OlExt":1,"./layer/GServiceGroup":6,"./layer/datasource/DataSource":7,"./layer/datasource/LocalDataSource":8,"./layer/datasource/URLDataSource":9,"./layer/label/GWVTAnno":10,"./layer/label/feature/Feature":20,"./layer/vector/GXYZ":21}],6:[function(require,module,exports){
/**
 * Created by kongjian on 2017/6/26.
 */
class GServiceGroup{
    constructor(layerId, url, map, options) {
        this.map = null;
        this.layer = null;
        this.label = null;
        this.url = null;
        this.layerType = 0;
        this.labelType = 2;
        this.map = map;
        this.url = url;
        this.layerId = null;
        this.styleId = null;
        this.tileSize = 256;
    }

    addServiceGroup() {
        if(options && options.styleId){
            this.styleId = options.styleId;
        }
        if(options && options.tileSize){
            this.tileSize = options.tileSize;
        }
        switch(this.layerType){
            case 0: this.addBaseLayer();
                break;
            case 1: this.addFrontBaseLayer();
                break;
        }
        switch(this.labelType){
            case 2: this.addFrontLabel();
                break;
            case 3: this.AddImgLabel();
                break;
            case 4: this.addAvoidLabel();
                break;
        }
    };
    /*后端底图*/
    addBaseLayer(url) {
        var tileSize = new OpenLayers.Size(this.tileSize,this.tileSize);
        this.layer = new OpenLayers.Layer.GXYZ(this.layerId,
            this.url + "&x=${x}&y=${y}&l=${z}&tileType=" + this.layerType,
            {sphericalMercator: false, isBaseLayer: true,tileSize:tileSize}
        );
        this.map.addLayers([this.layer]);

    };

    addFrontBaseLayer(url) {

    };
    /*后端注记绘制*/
    AddImgLabel(){
        var tileSize = new OpenLayers.Size(this.tileSize,this.tileSize);
        this.label = new OpenLayers.Layer.GXYZ(
            this.layerId + "_Label",
            this.url + "&x=${x}&y=${y}&l=${z}&tileType=" + this.labelType,
            {sphericalMercator: false, isBaseLayer: false,tileSize:tileSize}
        );
        this.map.addLayers([this.label]);
    }
    /*后端注记避让*/
    addAvoidLabel(url) {
        this.label = new OpenLayers.Layer.GWVTAnno(
            this.url + '&x=${x}&y=${y}&l=${z}&tileType=' + this.labelType,
            {tileSize:this.tileSize,hitDetection:true,keepBuffer:0,updateWhenZooming:false});
        this.map.addLayers([this.label]);

    };
    /*前端*/
    addFrontLabel(url) {
        var tileSize = new OpenLayers.Size(this.tileSize,this.tileSize);
        this.label = new OpenLayers.Layer.GWVTAnno("GWVTanno",{tileSize:tileSize});

        var dataSource = new Custom.URLDataSource();
        dataSource.url = this.url+'&x=${x}&y=${y}&l=${z}&tileType='+this.labelType;
        dataSource.styleId =  this.styleId ;
        this.label.addDataSource(dataSource);
        this.map.addLayers([this.label]);
    };

    setLayerType(layerType) {
        if(layerType == "Img"){
            this.layerType = 0;
        }
    };

    setLabelType(labelType) {
        if(labelType == "Data"){
            this.labelType = 2;
        }else if(labelType == "Img"){
            this.labelType = 3;
        }
    };

    setTileSize(tileSize) {
        this.tileSize = tileSize;
    };

    getLayer() {
        return this.layer;
    };

    getLabel() {
        return this.label;
    };

    removeGroupLayer() {
        if(this.layer){
            this.map.removeLayer(this.layer);
        }
        if(this.label){
            this.map.removeLayer(this.label);
        }
    };
}

module.exports = GServiceGroup;
},{}],7:[function(require,module,exports){
/**
 * Created by kongjian on 2017/6/30.
 */
const UUID = require('../../utils/UUID');
class DataSource{
    constructor() {
        //数据源id
        this.id = new UUID().valueOf();
        //数据源类型
        this.type = "";
        //key为文件名，value为image对象
        this.textures = {};
    }
};

module.exports = DataSource;
},{"../../utils/UUID":24}],8:[function(require,module,exports){
const DataSource = require('./DataSource');
/**
 * Created by kongjian on 2017/6/30.
 */
class LocalDataSource extends DataSource{
    constructor() {
       super();
        //数据源类型
        this.type = 'LocalDataSource';
        //本地要素集合
        this.features = [];
        //图标url Map：{name:1.png,value:'http://localhost:8080/mapserver/1.png'}
        this.textureUrls = {};
    }



    /**
     * 添加feature
     * Parameters :
     * feature
     */
    addFeature(feature){
        this.features.push(feature);
    };

    /**
     * 添加url图标
     * Parameters :
     * name 图标名称,如：1.png
     * url 图标的请求地址
     */
    addTextureUrl(name,url){
        this.textureUrls[name] = url;
    };

    /**
     * 移除url图标
     * Parameters :
     * name 图标名称,如：1.png
     */
    removeTextureUrl(name){
       delete this.textureUrls[name];
    };

    /**
     * 加载纹理
     */
    loadTexture(){
        let def = new Deferred();
        let totalCount = 0;
        for(let i in this.textureUrls){
            totalCount++;
        }

        if(totalCount == 0){
            def.resolve();
            return;
        }

        let count = 0;
        for(let key in this.textureUrls){
            let img = new Image();
            img.name = key;
            img.onload = function(data) {
                count++;
                let name = data.target.name;
                this.textures[name] =data.target;
                if(count == totalCount){
                    def.resolve();
                }
            }.bind(this);
            img.src = this.textureUrls[key];
        }
        return def;
    };

    /**
     * 通过featureId移除feature
     * Parameters :
     * featureId
     */
    removeFeatureById(featureId){
        for(let i = 0;i<this.features.length;i++){
            let feature = this.features[i];
            if(feature.id == featureId){
                this.features.splice(i,1);
            }
        }
    }

};

module.exports = LocalDataSource;
},{"./DataSource":7}],9:[function(require,module,exports){
/**
 * Created by kongjian on 2017/6/30.
 */
const DataSource = require('./DataSource');
const {Deferred,getJSON} = require('./../../utils/es6-promise');
const Version = require('../../ext/Version');
class URLDataSource extends DataSource{
    constructor() {
        super();
        //多个服务器url的域名，用于解决一个域名只有6条请求管线的限制
        this.urlArray=[];
        //数据源类型
        this.type = 'URLDataSource';
        //注记数据的请求url
        this.url = null;
        //样式文件的请求接口url
        this.styleUrl = null;
        //样式文件Id
        this.styleId = 'style';
        //过滤条件
        this.filter = null;
        //纹理
        this.textures = {};
        //过滤条件字符
        this.control = null;
        //过滤的id
        this.controlId = null;
        // 不带过滤条件的url
        this.sourceUrl = null;
        //域名
        this.host = '';
        //服务名
        this.servername = '';
    }



    /**
     * 加载样式文件和纹理数据
     */
    loadStyle(styleType){
        let def0 = new Deferred();
        let def1 = new Deferred();
        let def2 = new Deferred();

        //解析url，获取servername,styleId
        this.parseUrl();

        if(!this.sourceUrl){
            this.sourceUrl = this.url +'&clientVersion='+Version;
            this.url = this.url +'&clientVersion='+Version;
        }

        if(this.control && this.isIE()){
            //设置过滤条件
            getJSON({type:'post',url:this.host + '/mapserver/vmap/'+this.servername+'/setControl',
                data:'control='+this.control,
                dataType:'json'})
                .then(function(result) {
                    this.controlId = result.id;
                    this.url = this.sourceUrl + '&controlId='+result.id;
                    def0.resolve();
                }.bind(this));
        }else{
            if(this.control){
                this.url = this.sourceUrl + '&control='+this.control;
            }else{
                this.url = this.sourceUrl;
            }
            def0.resolve();
        }

        if(!styleType){
            styleType = 'label';
        }

        //请求样式文件
        getJSON({url:this.host + '/mapserver/styleInfo/'+this.servername+'/'+this.styleId+'/'+styleType+'/style.js',dataType:'text'})
            .then(function(result) {
                this.styleFun = new Function("drawer","level", result);
                def1.resolve();
        }.bind(this));

        //请求图标纹理
        getJSON({url:this.host+ '/mapserver/styleInfo/'+this.servername+'/'+this.styleId+'/label/texture.js',dataType:'text'}).then(function(result){
            let textures = JSON.parse(result);
            let totalCount = 0;
            for(let i in textures){
                totalCount++;
            }

            if(totalCount == 0){
                def2.resolve();
                return;
            }

            let count = 0;
            for(let key in textures){
                let img = new Image();
                img.name = key;
                 img.onload = function(data) {
                    count++;
                    let name = data.target.name;
                    this.textures[name] =data.target;
                    if(count == totalCount){
                        def2.resolve();
                    }
                }.bind(this);
                img.src = textures[key];
            }
        }.bind(this));

       return [def0,def1,def2];
    }

    /**
     * 解析url
     */
    parseUrl(){
        let urlParts = this.url.split('?');
        let urlPartOne = urlParts[0].split('/mapserver/');
        this.host = urlPartOne[0];
        this.servername = urlPartOne[1].split('/')[1];
        let params = urlParts[1].split('&');
        for(let i = 0;i<params.length;i++){
            let param = params[i];
            let keyValue = param.split('=');
            if(keyValue[0] == 'styleId'){
                this.styleId = keyValue[1];
                return;
            }
        }
    };


    /**
     * 设置过滤条件
     */
    setFilter(filter){
        this.control = null;
        if(!this.url ||  !filter || (filter.layers.length == 0 && filter.order.length == 0)){
            return;
        }

        for(let i = 0;i<filter.layers.length;i++){
            let filterLayer = filter.layers[i];
            if(!filterLayer.id){
                filter.layers.splice(i,1);
            }
        }

        this.control = JSON.stringify(filter);
    }

    getTexture(key) {
        return this.textures[key];
    }
    addTexture(key,texture) {
        this.textures[key] = texture;
    }


    /**
     * 是否为ie浏览器
     */
    isIE() {
        if (!!window.ActiveXObject || "ActiveXObject" in window)
            return true;
        else
            return false;
    };
};

module.exports = URLDataSource;
},{"../../ext/Version":2,"./../../utils/es6-promise":25,"./DataSource":7}],10:[function(require,module,exports){
/**
 * Created by kongjian on 2017/6/26.
 */

const CanvasLayer = require('./draw/CanvasLayer');
var GWVTAnno = OpenLayers.Class(OpenLayers.Layer, {
    tileSize:256,
    //是否允许拾取
    hitDetection:true,
    canvasLayer:null,
    initialize: function(name, options) {
        OpenLayers.Layer.prototype.initialize.apply(this, [name, options]);
        if(this.options && this.options.tileSize){
            this.tileSize = this.options.tileSize.w;
        }

        if(this.options.hasOwnProperty('hitDetection')){
            this.hitDetection = this.options.hitDetection;
        }
        this.canvasLayer = new CanvasLayer();
        this.canvasLayer.tileSize = this.tileSize;
        this.canvasLayer.hitDetection = this.hitDetection;
        this.animating = false;
    },

    /**
     * 重写浏览器窗口缩放回调处理
     */
    onMapResize:function(){
        var size = this.map.getSize();
        this.canvasLayer.tileSize = this.tileSize;
        this.canvasLayer.gwvtAnno = this;
        this.canvasLayer.initCanvas(size.w,size.h);
        this.map.setCenter(this.map.getCenter());
    },

    /**
     * 重写ol的layer的方法，改方法平移缩放时触发
     */
    moveTo: function(bounds, zoomChanged, dragging) {
        if(zoomChanged){
            this.canvasLayer.clean();
        }

        this.animating = false;
        OpenLayers.Layer.prototype.moveTo.apply(this, arguments);
        var grid = this.getGrid(bounds);

        var maxExtent = this.map.getMaxExtent();
        this.canvasLayer.maxExtent = [maxExtent.left,maxExtent.bottom,maxExtent.right,maxExtent.top];
        this.canvasLayer.extent = [bounds.left,bounds.bottom,bounds.right,bounds.top];
        this.canvasLayer.res = this.map.getResolution();
        this.canvasLayer.requestLabelTiles(grid,zoomChanged);
    },

    /**
     * 根据当前视口获取要请求的瓦片的行列号
     * Parameters (single argument):
     * bounds - 当前视口范围
     * Returns:
     * grid -  当前范围对应的瓦片层行列号
     */
    getGrid:function(bounds){
        var maxExtent = this.map.getMaxExtent();
        var res = this.map.getResolution();
        var minRow = Math.floor((maxExtent.top - bounds.top) /(res*this.tileSize));
        var maxRow = Math.ceil((maxExtent.top - bounds.bottom)/(res*this.tileSize));
        var minCol = Math.floor((bounds.left - maxExtent.left)/(res*this.tileSize));
        var maxCol = Math.ceil((bounds.right - maxExtent.left)/(res*this.tileSize));

        var level = this.map.getZoom();
        var grid = [];
        for (var col = minCol; col < maxCol; col++) {
            for (var row = minRow; row < maxRow; row++) {
                grid.push({"row":row,"col":col,"level":level});
            }
        }
        return grid;
    },

    /**
     * 重写ol的layer的setMap方法，map.addLayer时触发
     */
    setMap:function(map){
        OpenLayers.Layer.prototype.setMap.apply(this, arguments);
        var size = this.map.getSize();
        this.canvasLayer.init(size.w,size.h,this.tileSize,this);
        this.div.appendChild(this.canvasLayer.root);

        this.map.events.register("movestart", this.map, function(){
            this.animating = true;
        }.bind(this));

        if(this.map.getExtent()){
            this.moveTo(this.map.getExtent());
        }
    },

    /**
     * 当图层缩放，平移后，更新canvas的位置
     * 考虑到它的位置信息存到了map中，不同的map sdk实现机制不一样
     * 所以考虑将该方法提到本类中
     */
    resetCanvasDiv :function(){
        this.div.style.margin  ="0px";
        // this.div.style.left =-this.map.layerContainerDiv.offsetLeft+'px';
        // this.div.style.top =-this.map.layerContainerDiv.offsetTop+'px';

        var x = -this.map.layerContainerDiv.offsetLeft;
        var y = -this.map.layerContainerDiv.offsetTop;
        this.canvasLayer.root.style['transform'] = 'translate(' + x + 'px,' + y + 'px)' ;

        // this.canvasLayer.root.style.transform = 'transform: translate3d('+
        //     -this.map.layerContainerDiv.offsetLeft+'px',+
        //     -this.map.layerContainerDiv.offsetTop+'px ,0px)';
        // transform: translate3d(343px, -1102px, 0px);
        // this.canvasLayer.root.style.left =-this.map.layerContainerDiv.offsetLeft+'px';
        // this.canvasLayer.root.style.top =-this.map.layerContainerDiv.offsetTop+'px';
    },

    /**
     * 重新绘制注记要素，当动态更改DataSouce数据源后，需要调用redraw方法
     */
    redraw :function(){
        if(this.canvasLayer){
            this.canvasLayer.redraw();
        }
    },

    /**
     * 添加数据源
     * Parameters :
     * dataSource
     */
    addDataSource : function(dataSource){
        this.canvasLayer.addDataSource(dataSource);
    },

    /**
     * 根据dataSoucceId移除数据源
     * Parameters :
     * dataSoucceId
     */
    removeDataSourceById:function(dataSoucceId){
        this.canvasLayer.removeDataSourceById(dataSoucceId);
    },

    addToMap:function(map){
        map.addLayer(this);
    },

    /**
     * 根据屏幕坐标获取feature
     * Parameters :
     * x
     * y
     */
    getFeatureByXY:function(x,y){
       return this.canvasLayer.getFeatureByXY(x,y);
    },

    /**
     * 是否支持isImportant属性，默认值为true
     * Parameters :
     * b
     */
    setHasImportant:function(b){
        if(this.canvasLayer){
            this.canvasLayer.hasImportant = b;
        }
    },

    /**
     * 获取支持isImportant属性，返回true 或者false
     */
    getHasImportant:function(){
        if(this.canvasLayer){
            return this.canvasLayer.hasImportant;
        }else{
            return true;
        }
    },
    CLASS_NAME: "OpenLayers.Layer.GWVTAnno"

});

module.exports = GWVTAnno;
},{"./draw/CanvasLayer":18}],11:[function(require,module,exports){
/**
 * Class: GAnnoAvoid
 * 避让策略类
 *
 * Inherits:
 *  - <Object>
 */
const GGridIndex = require('./GGridIndex');
const GLabelBox = require('./GLabelBox');
class GAnnoAvoid{
    constructor(ctx,formatFont) {
        this.grid=null;
        this.GLabelBox = new GLabelBox(ctx,formatFont);
    }

    //注记和线图元进行避让
    avoid(labelFeatures,avoidLineFeatures){
        if(avoidLineFeatures.length  == 0){
            return labelFeatures;
        }

        for(let i =0;i<labelFeatures.length;i++){
            let labelFeature = labelFeatures[i];
            if(labelFeature.type == 1){
                this.avoidPointLine(labelFeature,avoidLineFeatures);
            }

            if(labelFeature.type == 2){
                labelFeature.isCollision = this.avoidLineLine(labelFeature,avoidLineFeatures);
            }
        }

        return labelFeatures;
    }

    //点注记和线图元避让
    avoidPointLine(feature,avoidLineFeatures){
        let startDirection = feature.style.direction;
        let weight = feature.weight;

        //获取需要与注记避让的线图元
        avoidLineFeatures = this.getAvoidLineFeatures(weight,avoidLineFeatures);

        //删除的方向个数
        let delDirectionCount = 0;
        for(let i = 0;i<avoidLineFeatures.length;i++){
            let avoidLineFeature = avoidLineFeatures[i];
            for(let j = 0;j<4;j++) {
                let direction = startDirection + j;
                if (direction >= 4) {
                    direction = direction - 4;
                }

                let box = feature.boxs[direction];
                let b = this.crashBoxLine(box,avoidLineFeature.sourceDatas,false);
                if(b){
                    if(feature.directions[direction]){
                        //点注记的四个方向中减去一个方向
                        delete feature.directions[direction];
                        delDirectionCount++;

                        //如果四个方向都压盖，则压盖
                        if(delDirectionCount == 4){
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }


    //线注记和线图元避让
    avoidLineLine(feature,avoidLineFeatures){
        let weight = feature.weight;

        //获取需要与注记避让的线图元
        avoidLineFeatures = this.getAvoidLineFeatures(weight,avoidLineFeatures);

        for(let j = 0;j<avoidLineFeatures.length;j++){
            let avoidLineFeature = avoidLineFeatures[j];
            let isCollision = false;
            for(let i = 0;i<feature.boxs.length;i++){
                isCollision = this.crashPartLineLine(feature.boxs[i],avoidLineFeature.sourceDatas);
                if(isCollision){
                    return true;
                }
            }
        }

        return false;
    }

    //获取权重比点注记高的先图元要素
    getAvoidLineFeatures(weight,avoidLineFeatures){
        let alFeatures = [];
        for(let i = 0;i<avoidLineFeatures.length;i++){
            let avoidLineFeature = avoidLineFeatures[i];
            let lineWeight = avoidLineFeature.weight;
            if(lineWeight > weight){
                alFeatures.push(avoidLineFeature);
            }
        }
        return alFeatures;
    }

    // box和line是否相交
    crashBoxLine(box,line,isFour){
        let boxLines = [];
        if(isFour){
            boxLines.push([box[0],box[1],box[2],box[1]]);
            boxLines.push([box[2],box[1],box[2],box[3]]);
            boxLines.push([box[2],box[3],box[0],box[3]]);
            boxLines.push([box[0],box[3],box[0],box[1]]);
        }else{
            boxLines.push([box[0],box[1],box[2],box[3]]);
            boxLines.push([box[2],box[1],box[0],box[3]]);
        }


        for(let i = 0;i<boxLines.length;i++){
            let boxLine = boxLines[i];
            for(let j = 0;j<line.length/2-1;j++){
                let partLine = [line[2*j],line[2*j+1],line[2*(j+1)],line[2*(j+1)+1]];
                if(this.crashPartLinePartLine(boxLine,partLine)){
                    return true;
                }
            }
        }
        return false;
    }

    // 两条线是否相交
    crashLineLine(line1,line2){
        for(let i = 0;i<line1.length/2-1;i++){
            let partLine1 = [line1[2*i],line1[2*i+1],line1[2*(i+1)],line1[2*(i+1)+1]];
            for(let j = 0;j<line2.length/2-1;j++){
                let partLine2 = [line2[2*j],line2[2*j+1],line2[2*(j+1)],line2[2*(j+1)+1]];
                if(this.crashPartLinePartLine(partLine1,partLine2)){
                    return true;
                }
            }
        }
        return false;
    }


    // 两条线是否相交
    crashPartLineLine(partLine,line2){
        for(let j = 0;j<line2.length/2-1;j++){
            let partLine2 = [line2[2*j],line2[2*j+1],line2[2*(j+1)],line2[2*(j+1)+1]];
            if(this.crashPartLinePartLine(partLine,partLine2)){
                return true;
            }
        }
        return false;
    }

    // 两条线段是否相交
    crashPartLinePartLine(line1,line2){
        let p0_x = line1[0];
        let p0_y = line1[1];
        let p1_x = line1[2];
        let p1_y = line1[3];

        let p2_x = line2[0];
        let p2_y = line2[1];
        let p3_x = line2[2];
        let p3_y = line2[3];


        let s02_x, s02_y, s10_x, s10_y, s32_x, s32_y, s_numer, t_numer, denom, t;
        s10_x = p1_x - p0_x;
        s10_y = p1_y - p0_y;
        s32_x = p3_x - p2_x;
        s32_y = p3_y - p2_y;

        denom = s10_x * s32_y - s32_x * s10_y;
        if (denom == 0)//平行或共线
            return 0; // Collinear
        let denomPositive = denom > 0;

        s02_x = p0_x - p2_x;
        s02_y = p0_y - p2_y;
        s_numer = s10_x * s02_y - s10_y * s02_x;
        if ((s_numer < 0) == denomPositive)//参数是大于等于0且小于等于1的，分子分母必须同号且分子小于等于分母
            return 0; // No collision

        t_numer = s32_x * s02_y - s32_y * s02_x;
        if ((t_numer < 0) == denomPositive)
            return 0; // No collision

        if (((s_numer > denom) == denomPositive) || ((t_numer > denom) == denomPositive))
            return 0; // No collision
        return 1;
    }

    //避让
    defaultAvoid(features,hasImportant){
        this.grid = new GGridIndex(8192, 16, 0);
        if(features== null || features.length<1) return [];
        // console.time('计算box');
        // //设置box,如果有线编码或者线箭头，则会新增要素
        features = this.GLabelBox.setBox(features,false);
        // console.timeEnd('计算box');

        // console.time('mergeFeatures');
        features = this.mergeFeatures(features);
        // console.timeEnd('mergeFeatures');
        // console.time('排序');
        //权值排序
        this.sort(features,hasImportant);
        // console.timeEnd('排序');

        // console.time('避让');
        //将注记添加到单元格中，进行避让
        for(let i =0;i<features.length;i++){
            this.avoidFeature(features[i]);
        }
        // console.timeEnd('避让');
        features = this.GLabelBox.filterFeature(features);

        // console.time('去重');
        //注记去重
        this.removeRepeat(features);
        // console.timeEnd('去重');
        features = this.filterFeature(features);
        this.prevFeatures = features;
        return features;
    }

    /**
     * 给要素设置避让的box和注记的绘制坐标
     * @param f
     */
    avoidFeature(f){
        if(f.style.show == false || f.hidden == true){
            f.hidden =true;
            return;
        }
        if(f.boxs){
            if(f.type == 1){
                //点注记跟其它注记避让
                this.avoidPoint(f);
            }else{
                if(f.isCollision){
                    f.hidden = true;
                }else{
                    //线注记跟其它注记进行避让
                    this.avoidLine(f);
                }
            }
        }else{
            f.hidden = true;
        }
    }

    /**
     * 将点注记加入到计算出的多个单元格中
     * @param feature
     */
    avoidPoint(feature){
        //如果为重要的，则不避让
        if(feature.style.isImportant == true){
            let box = feature.boxs[feature.style.direction];
            this.addBoxToCells(feature.primaryId,box);
            return;
        }

        //如果前面有小图标，并且开启了四宫格避让
        if(feature.style.isFourDirections && feature.style.texture){
            this.addFourCollisionFeatureToCells(feature,feature.style.direction);
        }else{
            //如果没有指定的方向
            if(!feature.directions[feature.style.direction]){
                feature.hidden = true;
                return;
            }

            let box = feature.boxs[feature.style.direction];
            let isCollision = this.isCollision(box);
            if(isCollision){
                feature.hidden = true;
                return;
            }else{
                this.addBoxToCells(feature.primaryId,box);
            }
        }
    }


    /**
     * 将线注记加入到计算出的多个单元格中
     * @param feature
     */
    avoidLine(feature){
        //如果为重要的，则不避让
        if(feature.style.isImportant == true){
            for(let i = 0 ;i<feature.boxs.length;i++){
                let box = feature.boxs[i];
                this.addBoxToCells(feature.primaryId+'index_'+i,box);
            }
            return;
        }

        //线注记是否与其它注记相交
        let isCollision = false;
        for(let i = 0 ;i<feature.boxs.length;i++){
            let box = feature.boxs[i];
            if(this.isCollision(box)){
                isCollision = true;
                break;
            }
        }

        if(isCollision){
            feature.hidden = true;
        }else{
            for(let i = 0 ;i<feature.boxs.length;i++){
                let box = feature.boxs[i];
                this.addBoxToCells(feature.primaryId+'index_'+i,box);
            }
        }
    }

    /**
     * 将点注记添加到单元格中
     * @param feature 点注记
     * @param index 点注记四宫格的index
     */
    addFourCollisionFeatureToCells(feature,index){
        let isCollision = true;
        let box = [];
        //如果有指定的方向
        if(feature.directions[index]){
            box = feature.boxs[index];
            isCollision = this.isCollision(box);
        }

        // 如果相交,进行四宫格避让
        if(isCollision){
            index ++;
            if(index == 4){
                index = index - 4;
            }

            //四个方向全部避让完成，仍然相交
            if(index == feature.style.direction){
                feature.hidden = true;
                return;
            }else{
                //换个点注记方向的box，再进行递归避让检测
                this.addFourCollisionFeatureToCells(feature,index);
            }
        }else{
            feature.style.textPoint =feature.fourPoints[index];
            this.addBoxToCells(feature.primaryId,box);
        }
    }

    /**
     *  返回注记的box是否与其它注记相交
     * @param row
     * @param col
     * @param feature
     */
    isCollision(box){
        let x1 = box[0];
        let y1 = box[1];

        let x2 = box[2];
        let y2 = box[3];
        let result = this.grid.query(x1,y1,x2,y2);
        return result.length>0;
    }

    /**
     *  注记box所占的单元格标识为true
     */
    addBoxToCells(key,box){
        let x1 = box[0];
        let y1 = box[1];
        let x2 = box[2];
        let y2 = box[3];
        this.grid.insert(key,x1,y1,x2,y2);
    }

    //attributeId当相同时，点注记的四个方向合并。线注记有一个是和图元压盖时，其它的线注记也不显示
    mergeFeatures(features){
        let map = {};
        for(let i = 0;i<features.length;i++){
            let feature = features[i];
            if(!map[feature.attributeId]){
                map[feature.attributeId] = [];
            }
            map[feature.attributeId].push(feature);
        }

        for(let key in map) {
            let array = map[key];
            if (array.length > 1) {
                let fristFeature = array[0];
                //点注记，合并四宫格方向
                if (fristFeature.type == '1') {
                    let directions = array[0].directions;
                    for (let j = 1; j < array.length; j++) {
                        directions = this.getBothDirection(directions, array[j].directions)
                    }

                    let isEmpty = false;
                    for(let dKey in directions){
                        isEmpty = true;
                        break;
                    }


                    for (let k = 0; k < array.length; k++) {
                        if(isEmpty){
                            array[0].hidden = true;
                        }else{
                            array[0].directions = directions;
                        }
                    }
                }

                //是线注记,如果一条线压盖，其它的线也不显示
                if (fristFeature.type == '2') {
                    let isCollision = false;
                    for (let n = 0; n < array.length; n++) {
                        if (array[n].isCollision == true) {
                            isCollision = true;
                            break;
                        }
                    }

                    if (isCollision) {
                        for (let m = 0; m < array.length; m++) {
                            array[m].hidden = true
                        }
                    }
                }
            }
        }

        //去掉隐藏的注记
        return this.GLabelBox.filterFeature(features);
    }

    //要素排序.
    sort(features,hasImportant){
        if(features.length > 0) {
            //从大到少排序
            return  features.sort(function (a, b) {
                if(hasImportant){
                    if(a.style.isImportant && !b.style.isImportant){
                        return -1;
                    }
                    if(b.style.isImportant && !a.style.isImportant){
                        return 1;
                    }
                }

                let aAttr = a.weight;
                let bAttr = b.weight;

                let aId = a.primaryId;
                let bId = b.primaryId;

                if(!aAttr){
                    aAttr = -1;
                }
                if(!bAttr){
                    bAttr = -1;
                }
                if (aAttr < bAttr) {
                    return 1;
                } else if (aAttr == bAttr){
                    if(aId < bId){
                        return 1;
                    }
                    else{
                        return -1;
                    }
                } else {
                    return -1;
                }
            }.bind(this));
        }
    }

    //合并两个点注记的方向
    getBothDirection(directions1,directions2){
        let directions = {};
        for(let key in directions1){
            if(directions2[key]){
                directions[key] = 1;
            }
        }
        return directions;
    }


    //去掉重复的注记
    removeRepeat(features){
        let pointsFs = [];
        let lineTextFs = [];
        let lineCodeFs = [];

        let drawedPointFs = [];
        let drawedLineTextFs = [];
        let drawedLineCodeFs = [];
        for(let i = 0;i<features.length;i++){
            let f = features[i];
            if(f.type == 1){
                if(f.drawed == true){
                    drawedPointFs.push(f);
                }else{
                    pointsFs.push(f);
                }

            }else if(f.type == 2){
                if(f.lineType == 'text'){
                    if(f.drawed == true){
                        drawedLineTextFs.push(f);
                    }else{
                        lineTextFs.push(f);
                    }
                }
                if(f.lineType == 'code'){
                    if(f.drawed == true){
                        drawedLineCodeFs.push(f);
                    }else{
                        lineCodeFs.push(f);
                    }
                }
            }
        }


        for(let j = 0;j<pointsFs.length;j++){
            let pf = pointsFs[j];
            this.getShowPointFeatrues(drawedPointFs,pf);
        }

        for(let k = 0;k<lineTextFs.length;k++){
            let ltf = lineTextFs[k];
            this.getShowLineTextFeatrues(drawedLineTextFs,ltf);
        }


        for(let n = 0;n<lineCodeFs.length;n++){
            let lcf = lineCodeFs[n];
            this.getShowLineCodeFeatrues(drawedLineCodeFs,lcf);
        }

        //清除上一屏的注记的绘制状态
        if(this.prevFeatures){
            for(let m = 0;m<this.prevFeatures.length;m++){
                let pf = this.prevFeatures[m];
                pf.drawed = false;
            }
        }
    }

    getShowPointFeatrues(features,feature){
        let hidden =  false;
        for(let i = 0;i<features.length;i++){
            let f = features[i];
            if(f.label == feature.label && f.style.distance && feature.style.distance){
                //求两个点注记之间的距离
                let distance = this.getDistance(f.style.textPoint,feature.style.textPoint);
                if(distance<f.style.distance){
                    hidden = true;
                    feature.hidden = true;
                }
            }
        }

        if(!hidden){
            features.push(feature);
        }
    }

    getShowLineTextFeatrues(features,feature){
        let hidden =  false;
        for(let i = 0;i<features.length;i++){
            let f = features[i];
            if(f.label == feature.label && f.style.lineTextDistance && feature.style.lineTextDistance){
                //求两个点注记之间的距离
                let distance = this.getDistance(f.centerPoint,feature.centerPoint);
                if(distance<f.style.lineTextDistance){
                    hidden = true;
                    feature.hidden = true;
                }
            }
        }

        if(!hidden){
            features.push(feature);
        }
    }

    getShowLineCodeFeatrues(features,feature){
        let hidden =  false;
        for(let i = 0;i<features.length;i++){
            let f = features[i];
            if(f.label == feature.label && f.style.lineCodeDistance && feature.style.lineCodeDistance){
                //求两个点注记之间的距离
                let distance = this.getDistance(f.centerPoint,feature.centerPoint);
                if(distance<f.style.lineCodeDistance){
                    hidden = true;
                    feature.hidden = true;
                }
            }
        }

        if(!hidden){
            features.push(feature);
        }
    }

    /**
     * 求两点之间的距离
     */
    getDistance(p1,p2){
        let calX = p2[0] - p1[0];
        let calY = p2[1] - p1[1];
        return Math.pow((calX *calX + calY * calY), 0.5);
    }

    // 获取过滤后的要素.
    filterFeature(features){
        let returnFeatures = [];
        //剔除需避让的要素
        for(let i= 0 ;i<features.length;i++){
            if(!features[i].hidden ) {
                features[i].drawed = true;
                returnFeatures.push(features[i]);
            }
        }
        return returnFeatures;
    }
}
module.exports = GAnnoAvoid;
},{"./GGridIndex":15,"./GLabelBox":16}],12:[function(require,module,exports){
const GDistance = require('./GDistance');
const Util = require('./Util');
class GCutLine{
    static cutLineFeature(feature){
        let fs = [];
        let index = 0;
        if(feature.sourceData.length < 4){
            return fs;
        }



        let lineText = this.createLineTextFeatrue(feature,index);
        index = lineText.index;
        if(lineText.feature){
            fs.push(lineText.feature);
        }

        let lineCode= this.createLineCodeFeatrue(feature,index);
        index = lineCode.index;
        if(lineCode.feature){
            fs.push(lineCode.feature);
        }

        let lineArrow= this.createLineArrowFeatrue(feature,index);
        if(lineArrow.feature){
            fs.push(lineArrow.feature);
        }
        return fs;
    }

    /**
     * 创建线文字注记
     *  Parameters :
     *  feature
     *  index - 可用的line的index位置
     */
    static createLineTextFeatrue(feature,index){
        let style = feature.style;
        let line = feature.sourceData;
        let d = new GDistance();
        let gaps = [];
        let textFeature =null;

        if(Util.isNotNull(feature.label)) {
            //获取线段长度
            // let lineDis = this.getLineDistance(line);
            //如果线段长度小于100个像素,则只取首尾两个点
            // if(lineDis < 100 && lineDis >0){
            //     line = [line[0],line[1],line[line.length-2],line[line.length-1]];
            // }

            //线注记的文字内容
            feature.label = feature.label+ '';
            //多切一个字的宽度，防止文字方向反转时，线段不够长
            for (let count = 0; count < feature.label.length + 1; count++) {
                gaps.push(style.lineHeight*1.2 +2+ style.gap);
            }

            let cloneGaps = [].concat(gaps);
            let points = d.getNodePath(line, gaps);
            let textPoints = points.pointList;

            if(textPoints.length > 1){
                index = points.index;
                let showChanged = false;
                let endLength = feature.label.length > textPoints.length ? textPoints.length -1:feature.label.length-1;
                let p1 = [textPoints[0][0][0], textPoints[0][0][1]];
                let p2 = textPoints[endLength][0];

                //获取两点连线与x轴的夹角
                let angle = Util.getAngle(p1,p2);
                textFeature =  this.cloneFeature(feature);
                textFeature.angle = angle;

                if(style.changeDirection != false){
                    //改变方向
                    //判断是否应该换方向
                    showChanged = this.isChangeDirection(feature.label,p1, p2,angle);
                    if (showChanged) {
                        textPoints = this.changeDirection(line, textPoints, cloneGaps,index,endLength);
                    }
                }

                textFeature.attributeId = textFeature.attributeId+'_text';
                textFeature.sourceAngleData = textPoints;
                textFeature.lineType = 'text';

                if(textPoints.length < feature.label.length){
                    index = feature.sourceData.length;
                    //如果文字放不下，则增加延长线
                    if(textPoints.length > feature.label.length*0.5){
                        this.delayTextPoint(line,textPoints,feature.label,style.chinaLabelWidth + style.gap,showChanged);
                    }else{
                        textFeature = null;
                    }
                }
            }else{
                if(!style.showRoadCode){
                    textFeature =  this.cloneFeature(feature);
                    textFeature.attributeId = textFeature.attributeId+'_text';
                    textFeature.sourceAngleData = [[[line[0],line[1]],0]];
                    textFeature.lineType = 'text';
                    index =2;
                }
            }
        }
        return {feature:textFeature,index:index};
    }

    /**
     * 创建线编码注记
     *  Parameters :
     *  feature
     *  index - 可用的line的index位置
     */
    static createLineCodeFeatrue(feature,index){
        let style = feature.style;
        let line = feature.sourceData;
        let d = new GDistance();
        let gaps = [];
        let codeFeature =null;

        let roadLabel = feature.roadCodeLabel;
        //如果有道路编码
        if(style.showRoadCode && Util.isNotNull(roadLabel) && index < line.length){
            let codeLine = line.slice(index,line.length -1);
            //默认是30个像素
            gaps.push(30);
            let cPoints = d.getNodePath(codeLine, gaps);
            let codePoints = cPoints.pointList;
            if(codePoints.length  == 1){
                index = index + cPoints.index;
                codeFeature =  this.cloneFeature(feature);
                codeFeature.attributeId = codeFeature.attributeId+'_code';
                codeFeature.sourceAngleData = codePoints;
                codeFeature.lineType = 'code';
                codeFeature.label = roadLabel+'';
            }

            if(codePoints.length ==0){
                codeFeature =  this.cloneFeature(feature);
                codeFeature.attributeId = codeFeature.attributeId+'_code';
                codeFeature.sourceAngleData = [[line,0]];
                codeFeature.lineType = 'code';
                codeFeature.label = roadLabel+'';
                index = 2;
                return {feature:codeFeature,index:index};
            }
        }
        return {feature:codeFeature,index:index};
    }

    /**
     * 创建线箭头注记
     *  Parameters :
     *  feature
     *  index - 可用的line的index位置
     */
    static createLineArrowFeatrue(feature,index){
        let style = feature.style;
        let line = feature.sourceData;
        let d = new GDistance();
        let gaps = [];
        let arrowFeature =null;

        //如果有箭头
        if(style.showArrow && index < line.length){
            let arrowLine = line.slice(index,line.length -1);
            gaps.push(16);
            gaps.push(16);
            let aPoints = d.getNodePath(arrowLine, gaps);
            let arrowPoints = aPoints.pointList;

            if(arrowPoints.length == 2){
                arrowFeature =  this.cloneFeature(feature);
                arrowFeature.attributeId = arrowFeature.attributeId+'_arrow';
                arrowFeature.sourceAngleData = arrowPoints;
                arrowFeature.lineType = 'arrow';
            }
        }
        return {feature:arrowFeature,index:index};
    }

    /**
     * 当线文字放不下时，获取延长线上的点
     *  Parameters :
     *  line - 原始线坐标
     *  textPoints - 切割之后的点坐标
     *  label - 线注记
     *  gap - 每个字之间的间隔
     *  showChanged
     *
     */
    static delayTextPoint(line,textPoints,label,gap,showChanged){
        let fristPoint = null;
        let secondPoint = null;
        //如果只能放下一个字
        if(textPoints.length == 1){
            if(showChanged){
                fristPoint = [line[line.length -2],line[line.length -1]];
            }else{
                fristPoint = [line[0],line[1]];
            }
        }else{
            fristPoint = textPoints[textPoints.length-2][0];
        }
        secondPoint = textPoints[textPoints.length-1][0];
        let angle = textPoints[textPoints.length-1][1];

        let len = textPoints.length;
        for(let i = 1;i<label.length - len +1;i++){
            let p = this.getPoint(fristPoint,secondPoint,gap*i);
            let textPoint = [p,angle];
            textPoints.push(textPoint);
        }
    }

    /**
     * 克隆feature
     *  Parameters :
     *  feature - 单个线注记要素
     */
    static cloneFeature(feature){
        return {type:feature.type,datas:feature.datas,sourceData:feature.sourceData,label:feature.label,roadCodeLabel:feature.roadCodeLabel,
            attributeId:feature.attributeId,style:feature.style,textures:feature.textures,xyz:feature.xyz,
            lineType:feature.lineType,weight:feature.weight,attributes:feature.attributes};
    }

    /**
     *  改变文本线段的方向
     *  Parameters :
     *  line - 原始线数据
     *  textPoints - 未改方向前的文本线段数组
     *  gaps - 要切割的线段的数据间距
     *  index - 文本在原始线段中，能写到line的那个index索引位置
     */
    static changeDirection(line,textPoints,gaps,index,endLength){
        //判断是否应该换方向
        index = index >=line.length? line.length:index;
        let textLine = line.slice(0,index);
        let linePoint = [];
        for(let i = 0;i<textLine.length-1;i++){
            linePoint.push([textLine[i],textLine[i+1]]);
            i++;
        }
        linePoint = linePoint.reverse();

        let lastPoint = textPoints[endLength][0];
        textLine = [lastPoint[0],lastPoint[1]];
        for(let j = 0;j<linePoint.length;j++){
            textLine.push(linePoint[j][0]);
            textLine.push(linePoint[j][1]);
        }
        let d = new GDistance();
        textPoints = d.getNodePath(textLine,gaps).pointList;
        return textPoints;
    }


    /**
     * 是否需要改变线的方向
     *  Parameters :
     *  p1 - 线段起点
     *  p2 -线段的重点
     *  angle - 两点连线与x轴的夹角
     */
    static isChangeDirection(label,p1,p2,angle){
        let showChange = false;
        //判断是否包含汉字
        if(/.*[\u4e00-\u9fa5]+.*$/.test(label)) {
            //如果是垂直线
            if(p1[0] == p2[0]){
                if(p1[1]>p2[1]){
                    showChange = true;
                    return showChange;
                }
            }

            //如果是反斜线，并且夹角与x轴的夹角大于45度
            if(angle<-45 && angle>-90 ){
                if(p1[0]< p2[0]){
                    showChange = true;
                }
            }else{
                if(p1[0]> p2[0]){
                    showChange = true;
                }
            }
        }else{
            if(p1[0] > p2[0]){
                showChange = true;
            }
        }
        return showChange;
    }




    /**
     * 求两点之间的距离
     */
    static getDistance(p1,p2){
        let calX = p2[0] - p1[0];
        let calY = p2[1] - p1[1];
        return Math.pow((calX *calX + calY * calY), 0.5);
    }

    /**
     * 获取线的长度
     */
    static getLineDistance(line){
        if(line.length <4){
            return 0;
        }

        let dis = 0;
        for(let i = 0;i<line.length/2-1;i++){
            let p1 = [line[2*i],line[2*i+1]];
            let p2 = [line[2*(i+1)],line[2*(i+1)+1]];
            dis = dis + this.getDistance(p1,p2);
        }
        return dis;
    }

    /**
     * 已知两点，延长距离，获取延长线上的点坐标
     */
    static getPoint(p1,p2,d){
        let xab = p2[0] - p1[0];
        let yab = p2[1] - p1[1];
        let xd = p2[0];
        let yd = p2[1];
        if(xab == 0){
            if(yab > 0){
                yd = p2[1] + d;
            }else{
                yd = p2[1] - d;
            }
        }else{
            let xbd = Math.sqrt((d * d)/((yab/xab) * (yab/xab) + 1));
            if (xab < 0) {
                xbd = -xbd
            }

            xd = p2[0] + xbd;
            yd = p2[1] + yab / xab * xbd;
        }
        return [xd,yd];
    }
}

module.exports = GCutLine;
},{"./GDistance":13,"./Util":17}],13:[function(require,module,exports){
/**
 * Created by matt on 2017/3/5.
 */
class GDistance{
    getLengthPoint(fromX, fromY, toX, toY, len,index){
        let dx = toX - fromX;
        let dy = toY - fromY;
        let x_new;
        let y_new;
        if(dx == 0){
            x_new = toX;
            if(dy > 0){
                y_new = fromY + len;
            }else{
                y_new = fromY - len;
            }
            if(index == null){
                return [x_new,y_new];
            }else{
                return [x_new,y_new,index];
            }
        }

        let tan = dy / dx;
        let sec = Math.sqrt((tan * tan) + 1);
        let dx_new = Math.abs(len / sec);
        let dy_new = Math.abs(dx_new * tan);
        if(dx > 0){
            x_new = fromX + dx_new;
        }else{
            x_new = fromX - dx_new;
        }
        if(dy > 0){
            y_new = fromY + dy_new;
        }else{
            y_new = fromY - dy_new;
        }
        if(index == null){
            return [x_new,y_new];
        }else{
            return [x_new,y_new,index];
        }
    }

    getAngle(p1,p2){
        if(p2[0]-p1[0] == 0){
            if(p2[1]>p1[0]){
                return 90;
            }else{
                return -90;
            }
        }
        let k = (p2[1]-p1[1])/(p2[0]-p1[0]);
        let angle = 360*Math.atan(k)/(2*Math.PI);
        return angle;
    }

    length(x0, y0, x1, y1){
        let dx = x1 - x0;
        let dy = y1 - y0;
        let len = Math.sqrt(dx * dx + dy * dy);
        return len;
    }

    getNodePath(coords,interval){
        let previous = [];
        let points = {};
        let pointList = [];
        let intervalLength = interval.length;

        //初始化标记长度等于单位长度
        let fun_getInterval = function(interval){
            let value = interval[0];
            interval.splice(0,1);
            return value;
        }
        let markLength = fun_getInterval(interval);
        let index = 0;
        while(true){
            if(pointList.length == intervalLength){
                points.index = index;
                points.pointList = pointList;
                return points;
            }
            if(index >= coords.length){
                points.index = index;
                points.pointList = pointList;
                return points;
            }
            let x = coords[index];
            let y = coords[index + 1];
            //判断上一个节点是否为空
            if(previous.length == 0){
                //如果为空就设置当前点到 上一个节点上
                previous[0] = x;
                previous[1] = y;
                continue;
            }else{

                //如果不为空则需要求上一个节点与当前结点的距离
                let lengthPath = this.length(previous[0], previous[1], x, y);
                //把节点长度加起来

                if(lengthPath >= markLength){
                    //如果长度大于标记长度，则需要上一点到标记成都的点
                    let savePoint = this.getLengthPoint(previous[0],previous[1], x,y, markLength,null);
                    let angle = this.getAngle(previous,[x,y]);

                    if(angle == 90){
                        angle = 0;
                    }
                    if(angle == -90){
                        angle = 0;
                    }
                    if(angle == 0){
                        angle = 0.5;
                    }

                    //保证竖方向的字是正的
                    if(angle >= 45){
                        angle = angle - 90;
                    }else{
                        if(angle <= - 45){
                            angle = angle + 90;
                        }
                    }


                    let pointAngle = [savePoint,angle];
                    pointList.push(pointAngle);
                    previous[0] = savePoint[0];
                    previous[1] = savePoint[1];
                    markLength = fun_getInterval(interval);
                }else{
                    markLength = markLength - lengthPath;

                    previous[0] = x;
                    previous[1] = y;
                    index = index + 2;
                }
            }
        }

        points.index = index;
        points.pointList = pointList;
        return points;
    }
}

module.exports = GDistance;






},{}],14:[function(require,module,exports){
/**
 * Created by kongjian on 2017/6/26.
 * 绘制点，线面的工具类
 */
const BoxSet = require('../../../utils/gistools/BoxSet');
const _boxSet512 = new BoxSet(0,512,0,512,512,5);
const _boxSet256 = new BoxSet(0,256,0,256,256,5);

const GisTools = require('../../../utils/gistools/GisTools');
const Util = require('./Util');
class GDrawGeomerty{
    /**
     * 画注记
     * Parameters:
     * features - 设置过样式，转换过为屏幕坐标，避让过的注记数据
     */
    static draw(ctx,features,ratio,checkDraw,isChangeFont,hitCtx,hitDetection){
        let drewMap = null;
        if(checkDraw){
            drewMap = new Map();
        }

        for(let i = 0;i<features.length;i++){
            let feature = features[i];
            //画点注记
            if(feature.type == 1){
                this.drawPointIcon(ctx,feature,ratio,drewMap,hitCtx,hitDetection);
                this.drawPoint(ctx,feature,ratio,drewMap,isChangeFont,hitCtx,hitDetection);
                continue;
            }
            //画线注记
            if(feature.type == 2){
                this.drawLine(ctx,feature,ratio,drewMap,isChangeFont,hitCtx,hitDetection);
            }
        }
        drewMap = null;
    };

    /**
     * 画点注记图标
     * Parameters:
     *  ctx - 画布对象
     *  hitCtx - 画拾取box的画布对象
     * hitDetection - 是否绘制拾取的box
     * feature - 设置过样式，转换过为屏幕坐标，避让过的注记数据
     */
    static drawPointIcon(ctx,feature,ratio,drewMap,hitCtx,hitDetection){
        let style = feature.style;
        if(!style.texture){
            return;
        }

        let width = style.graphicWidth;
        let height = style.graphicHeight;


        let img = feature.iconImg;
        if(!img){
            return ;
        }

        if(!width || !height){
            width = img.width;
            height = img.height;
            if(drewMap){
                width = width/ratio;
                height = height/ratio;
            }
        }

        let xOffset =  style.graphicXOffset -0.5 * width;
        let yOffset =  style.graphicYOffset -0.5 * height;

        let pointOffsetX = style.pointOffsetX;
        let pointOffsetY = style.pointOffsetY;
        if(!pointOffsetX){
            pointOffsetX = 0;
        }
        if(!pointOffsetY){
            pointOffsetY = 0;
        }
        //包括点图标的box,用于避让
        let point = [feature.datas[0][0][0],feature.datas[0][0][1]];
        point[0] = point[0]+pointOffsetX;
        point[1] = point[1]+pointOffsetY;

        let x = point[0] + xOffset;
        let y = point[1] + yOffset;
        let opacity = style.pointFillAlpha || 1;

        // 画过的不画
        if(drewMap){
            let drewMark = style.texture + "_" + x + "_" + y;
            if(drewMap.get(drewMark) == null) {
                drewMap.set(drewMark,true);
            }else{
                return;
            }
        }

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.drawImage(img, x*ratio, y*ratio, width*ratio, height*ratio);
        ctx.restore();

        //拾取检测用的矩形
        if (hitDetection) {
            hitCtx.save();
            this.setHitContextStyle(hitCtx,feature.id);
            hitCtx.fillRect(x,y,width,height);
            hitCtx.restore();
        }
    }

    /**
     * 画点注记
     * Parameters:
     *  ctx - 画布对象
     *  hitCtx - 画拾取box的画布对象
     * hitDetection - 是否绘制拾取的box
     * feature - 设置过样式，转换过为屏幕坐标，避让过的注记数据
     */
    static drawPoint(ctx,feature,ratio,drewMap,isChangeFont,hitCtx,hitDetection){
        if(!feature.label){
            return;
        }

        let style = feature.style;
        //不在范围内的不绘制
        let pt = style.textPoint;
        if(drewMap){
            //如果这个注记不在渲染格网里面，则不绘制；
            let polyIn = GisTools.boxToPolyArr(feature.box[0],feature.box[1],feature.box[2],feature.box[3]);
            let polyOut;
            if(ctx.canvas.width / ratio == 512){
                polyOut = GisTools.boxToPolyArr(-20,-20,532,532);
            }else if(ctx.canvas.width / ratio == 256){
                polyOut = GisTools.boxToPolyArr(-15,-15,271,271);
            }
            if(GisTools.polyWith(polyOut,polyIn) == 3 ){
                return;
            }

            let drewKey = feature.label + "_" + pt[0] + "_" + pt[1];
            if(drewMap.get(drewKey) == null){
                drewMap.set(drewKey,true);
            }else{
                return;
            }
        }


        let labelRows = feature.label.split(' ');
        let numRows = labelRows.length;
        let lineHeight = style.pointHeight;
        lineHeight =lineHeight +2;

        let pointFillFont = Util.formatFont(style.pointFillFont,ratio,isChangeFont);
        let pointStrokeFont = Util.formatFont(style.pointStrokeFont,ratio,isChangeFont);

        if(style.pointHashBackground == true){
            ctx.save();
            ctx.globalAlpha = style.pointBackgroundAlpha;
            ctx.strokeStyle = style.pointBackgroundLineColor;
            ctx.lineWidth = style.pointBackgroundLineWidth;
            ctx.fillStyle = style.pointBackgroundColor;
            ctx.font = style.pointFillFont;
            let rectX= pt[0] - style.pointBackgroundGap;
            let rectY = pt[1]-style.pointBackgroundGap - style.pointHeight/2;

            let maxWidth = 0;
            for (let i = 0; i < numRows; i++) {
                let itemWdith = ctx.measureText(labelRows[i]).width;
                if(itemWdith > maxWidth){
                    maxWidth = itemWdith;
                }
            }
            this.drawRoundRect(ctx,rectX,rectY,maxWidth+style.pointBackgroundGap*2,
                style.pointHeight*numRows+style.pointBackgroundGap*2+(numRows-1)*2,style.pointBackgroundRadius,ratio);
            ctx.fill();
            ctx.restore();

            for (let j = 0; j < numRows; j++) {
                if (style.pointHashOutline == true){
                    ctx.save();
                    ctx.textBaseline = "middle";
                    ctx.globalAlpha = style.pointStrokeAlpha;
                    ctx.strokeStyle = style.pointStrokeStyle;
                    ctx.lineWidth = style.pointLineWidth;
                    ctx.font = pointStrokeFont;
                    ctx.strokeText(labelRows[j], pt[0]*ratio, (pt[1]+ (lineHeight * j))*ratio);
                    ctx.restore();
                }

                ctx.save();
                ctx.textBaseline = "middle";
                ctx.globalAlpha = style.pointFillAlpha;
                ctx.fillStyle = style.pointFillStyle;
                ctx.font = pointFillFont;
                ctx.fillText(labelRows[j], pt[0]*ratio, (pt[1]+ (lineHeight * j))*ratio);
                ctx.restore();
            }

            //拾取检测用的矩形
            if (hitDetection) {
                hitCtx.save();
                this.setHitContextStyle(hitCtx,feature.id);
                this.drawHitRoundRect(hitCtx,rectX,rectY,maxWidth+style.pointBackgroundGap*2,style.pointHeight+style.pointBackgroundGap*2,style.pointBackgroundRadius);
                hitCtx.fill();
                hitCtx.restore();
            }
        }else{
            let maxWidth = 0;
            for (let i = 0; i < numRows; i++) {
                if (style.pointHashOutline == true) {
                    ctx.save();
                    ctx.textBaseline = "middle";
                    ctx.globalAlpha = style.pointStrokeAlpha;
                    ctx.strokeStyle = style.pointStrokeStyle;
                    ctx.lineWidth = style.pointLineWidth;
                    ctx.font = pointStrokeFont;
                    ctx.strokeText(labelRows[i], pt[0]*ratio, (pt[1]+ (lineHeight * i))*ratio);
                    ctx.restore();
                }

                ctx.save();
                ctx.textBaseline = "middle";
                ctx.globalAlpha = style.pointFillAlpha;
                ctx.fillStyle = style.pointFillStyle;
                ctx.font = pointFillFont;
                ctx.fillText(labelRows[i], pt[0]*ratio, (pt[1]+ (lineHeight * i))*ratio);
                maxWidth = ctx.measureText(labelRows[i]).width > maxWidth?  ctx.measureText(labelRows[i]).width : maxWidth ;
                ctx.restore();
            }


            //拾取检测用的矩形
            if (hitDetection) {
                hitCtx.save();
                this.setHitContextStyle(hitCtx,feature.id);
                hitCtx.textBaseline = "middle";
                hitCtx.fillRect(pt[0],pt[1]- style.pointHeight/2,maxWidth,lineHeight * numRows);
                hitCtx.restore();
            }
        }
    }


    /**
     * 画线注记
     * Parameters:
     *  ctx - 画布对象
     * hitCtx - 画拾取box的画布对象
     * hitDetection - 是否绘制拾取的box
     * feature - 设置过样式，转换过为屏幕坐标，避让过的注记数据
     */
    static drawLine(ctx,feature,ratio,drewMap,isChangeFont,hitCtx,hitDetection){

        if(feature.lineType == 'text'){
            this.drawLineText(ctx,feature,ratio,drewMap,isChangeFont,hitCtx,hitDetection);
        }

        if(feature.lineType == 'code'){
            this.drawLineCode(ctx,feature,ratio,drewMap,isChangeFont,hitCtx,hitDetection);
        }

        if(feature.lineType == 'arrow'){
            this.drawLineArrow(ctx,feature,ratio,drewMap,hitCtx,hitDetection);
        }
    }


    /**
     * 画线文本注记
     * Parameters:
     *  ctx - 画布对象
     * hitCtx - 画拾取box的画布对象
     * hitDetection - 是否绘制拾取的box
     * feature - 设置过样式，转换过为屏幕坐标，避让过的注记数据
     */
    static drawLineText(ctx,feature,ratio,drewMap,isChangeFont,hitCtx,hitDetection){
        let style = feature.style;
        let label = feature.label;
        let textPoints =  feature.textPoints;

        let lineBoxSet;
        if(drewMap){
            // 如果是512 则使用boxset 512
            if(ctx.canvas.width / ratio == 512){
                lineBoxSet = _boxSet512;
            }else if(ctx.canvas.width / ratio == 256){
                lineBoxSet = _boxSet256;
            }
        }

        let lineFillFont = Util.formatFont(style.lineFillFont,ratio,isChangeFont);
        let lineStrokeFont = Util.formatFont(style.lineStrokeFont,ratio,isChangeFont);

        //去掉尾部的空格
        //只有一个点，或者是有线背景矩形框
        if(style.lineHashBackground == true || textPoints.length == 1){
            let index = Math.floor(textPoints.length/2);
            let localPoint = textPoints[index][0];
            if(textPoints.length == 1){
                this.drawBgText(ctx,label,ratio,localPoint,style.backgroundAlpha,
                    style.backgroundLineColor,style.backgroundLineWidth,
                    style.backgroundColor,style.lineFillFont,style.lineBackgroundGap,
                    style.lineHeight,style.lineBackgroundRadius,style.lineHashOutline,
                    style.lineStrokeAlpha,style.lineStrokeStyle,style.lineLineWidth,
                    style.lineStrokeFont,style.lineFillAlpha,style.lineFillStyle,
                    hitCtx,hitDetection,feature.id,false,isChangeFont);
            }else{
                this.drawBgText(ctx,label,ratio,localPoint,style.backgroundAlpha,
                    style.backgroundLineColor,style.backgroundLineWidth,
                    style.backgroundColor,style.lineFillFont,style.lineBackgroundGap,
                    style.lineHeight,style.lineBackgroundRadius,style.lineHashOutline,
                    style.lineStrokeAlpha,style.lineStrokeStyle,style.lineLineWidth,
                    style.lineStrokeFont,style.lineFillAlpha,style.lineFillStyle,
                    hitCtx,hitDetection,feature.id,true,isChangeFont);
            }

        }else {
            //开始绘制线注记
            for (let j = 0; j < label.length; j++) {
                let pa = textPoints[j];
                let angle = pa[1];
                let point = pa[0];
                let labelChar = label.charAt(j);

                if(drewMap){
                    let drewKey = labelChar + "_" + point[0] + "_" + point[1] + "_" + angle;
                    if(drewMap.get(drewKey) != null){
                        continue;
                    }
                    drewMap.set(drewKey,true);
                    if(!lineBoxSet.in([point[0] / ratio, point[1] / ratio])){
                        continue;
                    }
                }


                if(style.lineHashOutline == true){
                    ctx.save();
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.globalAlpha = style.lineStrokeAlpha;
                    ctx.strokeStyle = style.lineStrokeStyle;
                    ctx.lineWidth = style.lineLineWidth;
                    ctx.font = lineStrokeFont;
                    ctx.translate(point[0]*ratio, point[1]*ratio);
                    ctx.rotate(angle * Math.PI / 180);
                    ctx.strokeText(labelChar, 0, 0);
                    ctx.restore();
                }

                ctx.save();
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.globalAlpha = style.lineFillAlpha;
                ctx.fillStyle = style.lineFillStyle;
                ctx.font = lineFillFont;
                ctx.translate(point[0]*ratio, point[1]*ratio);
                ctx.rotate(angle * Math.PI / 180);
                ctx.fillText(labelChar, 0, 0);
                ctx.restore();


                //拾取检测用的矩形
                if (hitDetection) {
                    hitCtx.save();
                    this.setHitContextStyle(hitCtx,feature.id);
                    hitCtx.translate(point[0], point[1]);
                    hitCtx.rotate(angle * Math.PI / 180);
                    hitCtx.fillRect(-style.lineHeight*1.2*0.5, -style.lineHeight*1.2*0.5,style.lineHeight*1.2,style.lineHeight*1.2);
                    hitCtx.restore();
                }
            }
        }
    }

    /**
     * 画线编码注记
     * Parameters:
     *  ctx - 画布对象
     * hitCtx - 画拾取box的画布对象
     * hitDetection - 是否绘制拾取的box
     * feature - 设置过样式，转换过为屏幕坐标，避让过的注记数据
     */
    static drawLineCode(ctx,feature,ratio,drewMap,isChangeFont,hitCtx,hitDetection){
        let style = feature.style;
        let localPoint =  feature.codePoint;
        let codeLabel = feature.label;


        if(style.showRoadCode == true && codeLabel && codeLabel.length > 0){
            this.drawBgText(ctx,codeLabel,ratio,localPoint,style.codeBackgroundAlpha,
                style.codeBackgroundLineColor,style.codeBackgroundLineWidth,
                style.codeBackgroundColor,style.codeLineFillFont,style.codeLineBackgroundGap,
                style.codeLineHeight,style.codeLineBackgroundRadius,style.codeLineHashOutline,
                style.codeLineStrokeAlpha,style.codeLineStrokeStyle,style.codeLineLineWidth,
                style.codeLineStrokeFont,style.codeLineFillAlpha,style.codeLineFillStyle,
                hitCtx,hitDetection,feature.id,true,isChangeFont);
        }
    }

    /**
     * 画线箭头
     * Parameters:
     *  ctx - 画布对象
     * hitCtx - 画拾取box的画布对象
     * hitDetection - 是否绘制拾取的box
     * feature - 设置过样式，转换过为屏幕坐标，避让过的注记数据
     */
    static drawLineArrow(ctx,feature,ratio,drewMap,hitCtx,hitDetection){
        let points = feature.arrowPoint;
        let style = feature.style;
        let p1 = points[0][0];
        let p2 =  points[1][0];
        ctx.save();
        ctx.lineWidth=2;
        ctx.strokeStyle="#666666";
        ctx.fillStyle="#666666";
        //画线
        ctx.beginPath();
        ctx.moveTo(p1[0]*ratio,p1[1]*ratio);
        ctx.lineTo(p2[0]*ratio,p2[1]*ratio);
        ctx.stroke();
        //画箭头
        if(style.arrowDirectionValue == 0){
            let startRadians=Math.atan((p2[1]-p1[1])/(p2[0]-p1[0]));
            startRadians+=((p2[0]>p1[0])?-90:90)*Math.PI/180;
            this.drawArrowhead(ctx,p1[0],p1[1],startRadians,ratio);
        }else{
            let startRadians=Math.atan((p2[1]-p1[1])/(p2[0]-p1[0]));
            startRadians+=((p2[0]>p1[0])?90:-90)*Math.PI/180;
            this.drawArrowhead(ctx,p2[0],p2[1],startRadians,ratio);
        }
        ctx.restore();
    }

    /**
     * 画箭头的头
     * Parameters:
     */
    static drawArrowhead(ctx,x,y,radians,ratio){
        ctx.beginPath();
        ctx.translate(x*ratio,y*ratio);
        ctx.rotate(radians);
        ctx.moveTo(0,0);
        ctx.lineTo(3*ratio,6*ratio);
        ctx.lineTo(0,5);
        ctx.lineTo(-3*ratio,6*ratio);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * 画圆角矩形
     */
    static drawRoundRect(ctx, x, y, width, height, radius,ratio){
        ctx.beginPath();
        ctx.arc((x + radius)*ratio, (y + radius)*ratio, radius*ratio, Math.PI, Math.PI * 3 / 2);
        ctx.lineTo((width - radius + x)*ratio, y*ratio);
        ctx.arc((width - radius + x)*ratio, (radius + y)*ratio, radius*ratio, Math.PI * 3 / 2, Math.PI * 2);
        ctx.lineTo((width + x)*ratio, (height + y - radius)*ratio);
        ctx.arc((width - radius + x)*ratio, (height - radius + y)*ratio, radius*ratio, 0, Math.PI * 1 / 2);
        ctx.lineTo((radius + x)*ratio, (height +y)*ratio);
        ctx.arc((radius + x)*ratio, (height - radius + y)*ratio, radius*ratio, Math.PI * 1 / 2, Math.PI);
        ctx.closePath();
    }

    /**
     * 绘制带背景的线文本
     */
    static drawBgText(ctx,label,ratio,localPoint,backgroundAlpha,
                          backgroundLineColor,backgroundLineWidth,
                          backgroundColor,lineFillFont,lineBackgroundGap,
                          lineHeight,lineBackgroundRadius,lineHashOutline,
                          lineStrokeAlpha,lineStrokeStyle,lineLineWidth,
                          lineStrokeFont,lineFillAlpha,lineFillStyle,hitCtx,hitDetection,featureId,isDrawbg,isChangeFont){
        ctx.save();
        ctx.globalAlpha = backgroundAlpha;
        ctx.strokeStyle = backgroundLineColor;
        ctx.lineWidth = backgroundLineWidth;
        ctx.fillStyle = backgroundColor;
        ctx.font = Util.formatFont(lineFillFont,1,isChangeFont);
        let w = ctx.measureText(label).width;
        let rectX= localPoint[0] - w/2-lineBackgroundGap;
        let rectY = localPoint[1]-lineHeight/2-lineBackgroundGap;
        if(isDrawbg){
            this.drawRoundRect(ctx,rectX,rectY,w+lineBackgroundGap*2,lineHeight+lineBackgroundGap*2,lineBackgroundRadius,ratio);
            ctx.fill();
        }
        ctx.restore();


        lineFillFont = Util.formatFont(lineFillFont,ratio,isChangeFont);
        lineStrokeFont = Util.formatFont(lineStrokeFont,ratio,isChangeFont);
        if(lineHashOutline == true){
            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.globalAlpha = lineStrokeAlpha;
            ctx.strokeStyle = lineStrokeStyle;
            ctx.lineWidth = lineLineWidth;
            ctx.font = lineStrokeFont;
            ctx.translate(localPoint[0]*ratio, localPoint[1]*ratio);
            ctx.strokeText(label, 0, 0);
            ctx.restore();
        }

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = lineFillAlpha;
        ctx.fillStyle = lineFillStyle;
        ctx.font = lineFillFont;
        ctx.translate(localPoint[0]*ratio, localPoint[1]*ratio);
        ctx.fillText(label, 0, 0);
        ctx.restore();


        //拾取检测用的矩形
        if (hitDetection) {
            hitCtx.save();
            this.setHitContextStyle(hitCtx, featureId);
            this.drawHitRoundRect(hitCtx,rectX,rectY,w+lineBackgroundGap*2,lineHeight+lineBackgroundGap*2,lineBackgroundRadius);
            hitCtx.fill();
            hitCtx.restore();
        }
    }

    /**
     * 根据featureId生成颜色值
     */
    static featureIdToHex(featureId) {
        let id = Number(featureId) + 1;
        let hex = "000000" + id.toString(16);
        let len = hex.length;
        hex = "#" + hex.substring(len-6, len);
        return hex;
    }

    static setHitContextStyle(hitCtx,featureId){
        let hex = this.featureIdToHex(featureId);
        hitCtx.globalAlpha = 1;
        hitCtx.fillStyle = hex;
    }

    /**
     * 绘制拾取背景框
     */
    static drawHitRoundRect(hitCtx, x, y, width, height, radius){
        hitCtx.beginPath();
        hitCtx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
        hitCtx.lineTo(width - radius + x, y);
        hitCtx.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
        hitCtx.lineTo(width + x, height + y - radius);
        hitCtx.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
        hitCtx.lineTo(radius + x, height +y);
        hitCtx.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
        hitCtx.closePath();
    }
}
module.exports = GDrawGeomerty;
},{"../../../utils/gistools/BoxSet":26,"../../../utils/gistools/GisTools":27,"./Util":17}],15:[function(require,module,exports){
'use strict';

module.exports = GGridIndex;
var NUM_PARAMS = 3;
function GGridIndex(extent, n, padding) {
    var cells = this.cells = [];

    if (extent instanceof ArrayBuffer) {
        this.arrayBuffer = extent;
        var array = new Int32Array(this.arrayBuffer);
        extent = array[0];
        n = array[1];
        padding = array[2];

        this.d = n + 2 * padding;
        for (var k = 0; k < this.d * this.d; k++) {
            var start = array[NUM_PARAMS + k];
            var end = array[NUM_PARAMS + k + 1];
            cells.push(start === end ?
                    null :
                    array.subarray(start, end));
        }
        var keysOffset = array[NUM_PARAMS + cells.length];
        var bboxesOffset = array[NUM_PARAMS + cells.length + 1];
        this.keys = array.subarray(keysOffset, bboxesOffset);
        this.bboxes = array.subarray(bboxesOffset);

        this.insert = this._insertReadonly;

    } else {
        this.d = n + 2 * padding;
        for (var i = 0; i < this.d * this.d; i++) {
            cells.push([]);
        }
        this.keys = [];
        this.bboxes = [];
    }

    this.n = n;
    this.extent = extent;
    this.padding = padding;
    this.scale = n / extent;
    this.uid = 0;

    var p = (padding / n) * extent;
    this.min = -p;
    this.max = extent + p;
}


GGridIndex.prototype.insert = function(key, x1, y1, x2, y2) {
    this._forEachCell(x1, y1, x2, y2, this._insertCell, this.uid++);
    this.keys.push(key);
    this.bboxes.push(x1);
    this.bboxes.push(y1);
    this.bboxes.push(x2);
    this.bboxes.push(y2);
};

GGridIndex.prototype._insertReadonly = function() {
    throw 'Cannot insert into a GridIndex created from an ArrayBuffer.';
};

GGridIndex.prototype._insertCell = function(x1, y1, x2, y2, cellIndex, uid) {
    this.cells[cellIndex].push(uid);
};

GGridIndex.prototype.query = function(x1, y1, x2, y2) {
    var min = this.min;
    var max = this.max;
    if (x1 <= min && y1 <= min && max <= x2 && max <= y2) {
        // We use `Array#slice` because `this.keys` may be a `Int32Array` and
        // some browsers (Safari and IE) do not support `TypedArray#slice`
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/slice#Browser_compatibility
        return Array.prototype.slice.call(this.keys);

    } else {
        var result = [];
        var seenUids = {};
        this._forEachCell(x1, y1, x2, y2, this._queryCell, result, seenUids);
        return result;
    }
};

GGridIndex.prototype._queryCell = function(x1, y1, x2, y2, cellIndex, result, seenUids) {
    var cell = this.cells[cellIndex];
    if (cell !== null) {
        var keys = this.keys;
        var bboxes = this.bboxes;
        for (var u = 0; u < cell.length; u++) {
            var uid = cell[u];
            if (seenUids[uid] === undefined) {
                var offset = uid * 4;
                if ((x1 <= bboxes[offset + 2]) &&
                    (y1 <= bboxes[offset + 3]) &&
                    (x2 >= bboxes[offset + 0]) &&
                    (y2 >= bboxes[offset + 1])) {
                    seenUids[uid] = true;
                    result.push(keys[uid]);
                } else {
                    seenUids[uid] = false;
                }
            }
        }
    }
};

GGridIndex.prototype._forEachCell = function(x1, y1, x2, y2, fn, arg1, arg2) {
    var cx1 = this._convertToCellCoord(x1);
    var cy1 = this._convertToCellCoord(y1);
    var cx2 = this._convertToCellCoord(x2);
    var cy2 = this._convertToCellCoord(y2);
    for (var x = cx1; x <= cx2; x++) {
        for (var y = cy1; y <= cy2; y++) {
            var cellIndex = this.d * y + x;
            if (fn.call(this, x1, y1, x2, y2, cellIndex, arg1, arg2)) return;
        }
    }
};

GGridIndex.prototype._convertToCellCoord = function(x) {
    return Math.max(0, Math.min(this.d - 1, Math.floor(x * this.scale) + this.padding));
};

GGridIndex.prototype.toArrayBuffer = function() {
    if (this.arrayBuffer) return this.arrayBuffer;

    var cells = this.cells;

    var metadataLength = NUM_PARAMS + this.cells.length + 1 + 1;
    var totalCellLength = 0;
    for (var i = 0; i < this.cells.length; i++) {
        totalCellLength += this.cells[i].length;
    }

    var array = new Int32Array(metadataLength + totalCellLength + this.keys.length + this.bboxes.length);
    array[0] = this.extent;
    array[1] = this.n;
    array[2] = this.padding;

    var offset = metadataLength;
    for (var k = 0; k < cells.length; k++) {
        var cell = cells[k];
        array[NUM_PARAMS + k] = offset;
        array.set(cell, offset);
        offset += cell.length;
    }

    array[NUM_PARAMS + cells.length] = offset;
    array.set(this.keys, offset);
    offset += this.keys.length;

    array[NUM_PARAMS + cells.length + 1] = offset;
    array.set(this.bboxes, offset);
    offset += this.bboxes.length;

    return array.buffer;
};

},{}],16:[function(require,module,exports){
/**
 * Class: GAnnoAvoid
 *  计算注记避让box类
 *
 * Inherits:
 *  - <Object>
 */
const Util =  require('./Util');
class GLabelBox{
    constructor(ctx,formatFont) {
        this.boxDistance = 0;
        this.ctx =  ctx;
        this.formatFont = formatFont;
    }

    setBox(features,isSource){
        features.forEach(function(f, index) {
            f.hidden =false;
            //去掉尾部的空格
            f.label = Util.formatLabel(f.label);

            //如果要素不显示,没字就不画
            if(f.style.show == false){
                f.hidden =true;
                return;
            }
            if(f.type == 1){
                //构造点盒子
                if(isSource){
                    this.setPointBox(f,f.sourceAngleData,this.ctx);
                }else{
                    this.setPointBox(f,f.datas,this.ctx);
                }
            }
            if(f.type == 2){
                //如果是线文本注记
                if(f.lineType == 'text'){
                    if(isSource){
                        this.setTextLineBox(f,f.sourceAngleData,this.ctx);
                    }else{
                        this.setTextLineBox(f,f.datas,this.ctx);
                    }
                }

                //如果是线编码注记
                if(f.lineType == 'code') {
                    if(isSource){
                        this.setCodeLineBox(f,f.sourceAngleData,this.ctx);
                    }else{
                        this.setCodeLineBox(f,f.datas,this.ctx);
                    }
                }

                //如果是线箭头注记
                if(f.lineType == 'arrow') {
                    if(isSource){
                        this.setArrowLineBox(f,f.sourceAngleData);
                    }else{
                        this.setArrowLineBox(f,f.datas);
                    }
                }
            }
        }.bind(this));
        return this.filterFeature(features);
    }

    //构造点注记的boxs,上下左右四个方向
    setPointBox(feature,datas,ctx){
        let style = feature.style;
        let currPara = {};

        let graphicWidth = style.graphicWidth;
        let graphicHeight = style.graphicHeight;

        let img = feature.iconImg;
        if(img){
            //如果没有
            if(!graphicWidth || !graphicHeight) {
                graphicWidth = img.width;
                graphicHeight = img.height;
            }
        }else{
            graphicWidth = 0;
            graphicHeight = 0;
        }

        currPara.fontwidth = graphicWidth;
        currPara.fontheight = graphicHeight;

        //对要显示的点注记内容按照用户的转换函数进行转换
        if(style.labelFunction){
            let labelFunction = new Function("label", style.labelFunction);
            try{
                feature.label = labelFunction.call({}, feature.label);
            }catch (e){
                console.warn(feature.label + ': 调用labelFunction失败!');
            }
        }

        let labelIsNotNull = Util.isNotNull(feature.label);
        //如既没有文字，又没有图标,则不显示
        if(!labelIsNotNull && (graphicWidth == 0  || graphicHeight == 0)){
            feature.hidden =true;
            return;
        }


        let tmpLabels = 0;
        //设置当前注记的宽度和高度
        //注记分行
        if(labelIsNotNull){
            //转换为字符串
            feature.label = feature.label +'';
            tmpLabels = feature.label.split(' ');
            let tmpLabelWidth=0;
            ctx.save();
            if(this.formatFont){
                ctx.font = Util.formatFont(style.pointFillFont,1,true);
            }else{
                ctx.font = style.pointFillFont;
            }

            for(let i = 0;i<tmpLabels.length;i++ ){
                let oneRowLabelWidth = ctx.measureText(tmpLabels[i]).width;
                tmpLabelWidth = oneRowLabelWidth > tmpLabelWidth?oneRowLabelWidth:tmpLabelWidth;
            }
            ctx.restore();
            //各行的最宽宽度
            currPara.fontwidth =  tmpLabelWidth;
            //文字的高度 * 文字的行数+  行间距
            currPara.fontheight = style.pointHeight *  tmpLabels.length  + 2*(tmpLabels.length -1);
            // 如果点符号高度（用点符号宽度代替）高于文字高度 则用点符号高度替换文字高度
            currPara.fontheight = currPara.fontheight> graphicHeight ? currPara.fontheight: graphicHeight;
        }


        let pointOffsetX = style.pointOffsetX;
        let pointOffsetY = style.pointOffsetY;
        if(!pointOffsetX){
            pointOffsetX = 0;
        }
        if(!pointOffsetY){
            pointOffsetY = 0;
        }
        let pt = [datas[0][0][0],datas[0][0][1]];
        pt[0] = pt[0]+pointOffsetX;
        pt[1] = pt[1]+pointOffsetY;
        if(style.pointHashBackground != true){
            style.pointBackgroundGap = 0;
        }
        if(graphicHeight == 0 || graphicWidth ==0){
            style.graphicDistance = 0;
        }

        let rightBox = [ pt[0] - graphicWidth*0.5 ,
            pt[1] - style.pointBackgroundGap -currPara.fontheight*0.5,
            pt[0] +graphicWidth*0.5 +style.graphicDistance+ currPara.fontwidth + style.pointBackgroundGap*2,
            pt[1] +currPara.fontheight*0.5 + style.pointBackgroundGap];
        let leftBox = [pt[0] -graphicWidth*0.5 -style.graphicDistance- currPara.fontwidth - style.pointBackgroundGap*2,
            rightBox[1],pt[0] + graphicWidth*0.5,
            rightBox[3]];

        let bottomBox = [pt[0]-currPara.fontwidth*0.5-style.pointBackgroundGap,
            pt[1] -graphicHeight*0.5 , pt[0]+currPara.fontwidth*0.5+style.pointBackgroundGap,
            pt[1]+graphicHeight*0.5 + style.graphicDistance+style.pointBackgroundGap*2 +currPara.fontheight] ;

        let topBox = [bottomBox[0],pt[1]  -style.graphicDistance - style.pointBackgroundGap*2 - currPara.fontheight-graphicHeight*0.5 ,
            bottomBox[2],pt[1]+graphicHeight*0.5];


        rightBox = this.boxScale(rightBox,style.pointBoxDisance);
        leftBox = this.boxScale(leftBox,style.pointBoxDisance);
        bottomBox = this.boxScale(bottomBox,style.pointBoxDisance);
        topBox = this.boxScale(topBox,style.pointBoxDisance);
        let boxs = [rightBox,leftBox,bottomBox,topBox];
        if(!style.direction){
            style.direction = 0;
        }

        feature.boxs = boxs;
        feature.box = boxs[style.direction];

        //最大单行高度
        let maxOneLineHeight = graphicHeight;
        if(style.pointHeight > graphicHeight){
            maxOneLineHeight = style.pointHeight;
        }
        //不包括点图标,用于文字绘制的起点坐标
        let rPoint = [pt[0] + graphicWidth*0.5 + style.graphicDistance + style.pointBackgroundGap,
            pt[1]-currPara.fontheight*0.5+maxOneLineHeight*0.5];
        let lPoint = [pt[0] -graphicWidth*0.5 - style.graphicDistance - style.pointBackgroundGap -currPara.fontwidth,
            pt[1]-currPara.fontheight*0.5+maxOneLineHeight*0.5];
        let bPoint = [pt[0]- currPara.fontwidth*0.5,
            pt[1] + style.graphicDistance + style.pointBackgroundGap + maxOneLineHeight*0.5+graphicHeight*0.5];
        let tPoint = [bPoint[0],
            pt[1]-style.graphicDistance-style.pointBackgroundGap - currPara.fontheight+ maxOneLineHeight*0.5-graphicHeight*0.5];
        let fourPoints = [rPoint ,lPoint  ,bPoint  ,tPoint ];
        feature.fourPoints = fourPoints;
        feature.style.textPoint = fourPoints[style.direction];
    }

    /**
     * 设置线文字的box
     *  Parameters :
     *  feature - 单个线注记要素
     */
    setTextLineBox(feature,datas,ctx){
        let label = feature.label;
        let textPoints = datas;
        if(textPoints.length == 0){
            feature.hidden = true;
            return;
        }

        let style = feature.style;
        //将分段的点数据和角度数据保留，留给后面绘制
        feature.textPoints = textPoints;
        //线的boxs
        let lineBoxs = [];
        //如果线注记带底色
        if(style.lineHashBackground == true || textPoints.length ==1){
            let p = textPoints[0][0];
            if(textPoints.length >1){
                //获取线段的中间点
                let index = Math.floor(label.length/2);
                p = textPoints[index][0];
            }

            ctx.save();

            if(this.formatFont){
                ctx.font = Util.formatFont(style.lineFillFont,1,true);
            }else{
                ctx.font = style.lineFillFont;
            }

            let w = ctx.measureText(feature.label).width;
            ctx.restore();

            let minX = p[0] - w/2 -style.lineBackgroundGap;
            let maxX =  p[0]+ w/2 +style.lineBackgroundGap;
            let minY = p[1] -style.lineHeight*0.5-style.lineBackgroundGap;
            let maxY = p[1]+style.lineHeight*0.5 +style.lineBackgroundGap;
            let box = [minX,minY,maxX,maxY];
            this.boxScale(box,style.lineTextBoxDisance);
            lineBoxs.push(box);
        }else{
            //如果文字需要旋转
            if(style.lineTextRotate){
                for(let m = 0;m<textPoints.length;m++){
                    textPoints[m][1] = style.lineTextRotate;
                }
            }else{
                //如果文字注记旋转角度方向不一致(有的字向左，有的字向右旋转)，则调整为一致
                this.textToSameBearing(feature.angle,textPoints);

                if(!style.isImportant){
                    //判断线文字之间的最大夹角是否大于指定的阈值
                    if(this.isMessy(textPoints,style,label)){
                        feature.hidden = true;
                        return;
                    }
                }
            }

            //获取每个字的box,判断每个字之前是否有压盖
            let boxs = this.getLineBoxs(label,textPoints,style);
            if(boxs){
                lineBoxs =lineBoxs.concat(boxs);
            }else{
                feature.hidden = true;
                return;
            }
        }
        feature.boxs = lineBoxs;
    }

    /**
     * 设置线编码的box
     *  Parameters :
     *  feature - 单个线注记要素
     */
    setCodeLineBox(feature,datas,ctx){
        let codePoints = datas;
        if(codePoints.length == 0){
            feature.hidden = true;
            return;
        }

        let style = feature.style;
        //如果要显示道路编号
        let p = codePoints[0][0];

        ctx.save();
        if(this.formatFont){
            ctx.font = Util.formatFont(style.codeLineFillFont,1,true);
        }else{
            ctx.font = style.codeLineFillFont;
        }

        let w = ctx.measureText(feature.label).width;
        ctx.restore();


        let minX = p[0] - w/2 -style.codeLineBackgroundGap;
        let maxX =  p[0]+ w/2 +style.codeLineBackgroundGap;
        let minY = p[1] -style.codeLineHeight*0.5-style.codeLineBackgroundGap;
        let maxY = p[1]+ style.codeLineHeight*0.5 +style.codeLineBackgroundGap;
        let box = [minX,minY,maxX,maxY];
        this.boxScale(box,style.lineCodeBoxDisance);
        feature.boxs = [box];
        feature.codePoint = p;
    }

    /**
     * 设置线箭头的box
     *  Parameters :
     *  feature - 单个线注记要素
     */
    setArrowLineBox(feature,datas){
        let arrowPoints = datas;
        if(arrowPoints.length != 2){
            feature.hiden = true;
            return;
        }

        let p = arrowPoints[0][0];
        let p1 = arrowPoints[1][0];

        let minX = p[0]<p1[0]?p[0]:p1[0];
        let maxX = p[0]>p1[0]?p[0]:p1[0];
        let minY = p[1]<p1[1]?p[1]:p1[1];
        let maxY = p[1]>p1[1]?p[1]:p1[1];
        let box = [minX,minY,maxX,maxY];
        this.boxScale(box,feature.style.lineArrowBoxDisance);
        feature.boxs = [box];
        feature.arrowPoint = arrowPoints;
    }


    // 获取过滤后的要素.
    filterFeature(features){
        let returnFeatures = [];
        //剔除需避让的要素
        for(let i= 0 ;i<features.length;i++){
            if(!features[i].hidden ) {
                returnFeatures.push(features[i]);
            }
        }
        return returnFeatures;
    }

    /**
     * 判断线文字之间的最大夹角是否大于指定的阈值
     *  Parameters :
     * textPoints - 文本注记的线段数组
     *  style -要素的样式
     */
    isMessy(textPoints,style,label){
        let firstPoint = textPoints[0][0];
        let minX = firstPoint[0];
        let minY = firstPoint[1];
        let maxX = firstPoint[0];
        let maxY = firstPoint[1];

        let minAngle = textPoints[0][1];
        let maxAngle = textPoints[0][1];
        for(let i = 0;i<label.length;i++){
            let currPoint = textPoints[i][0];
            let currAngle = textPoints[i][1];
            if(currPoint[0]>maxX)   // 判断最大值
                maxX=currPoint[0];
            if(currPoint[0]<minX)   // 判断最小值
                minX=currPoint[0];

            if(currPoint[1]>maxY)   // 判断最大值
                maxY=currPoint[1];
            if(currPoint[1]<minY)   // 判断最小值
                minY=currPoint[1];

            if(currAngle>maxAngle)   // 判断最大值
                maxAngle=currAngle;
            if(currAngle<minAngle)   // 判断最小值
                minAngle=currAngle;
        }

        //如果文字之间，相差的最大角度大于配置的角度度则不画
        if(maxAngle -minAngle > style.angle){
            if(style.angleSwitch ==false  && style.angleColor){
                style.lineFillStyle = style.angleColor;
            }else{
                return true;
            }
        }
        return false;
    }

    /**
     * 检测线文字之间是否有自压盖
     *  Parameters :
     * boxs -
     *  style -要素的样式
     */
    getLineBoxs(label,textPoints,style){
        //和其它注记避让的boxs
        let boxs = [];
        //自相交避让的boxs
        let owmCrashBoxs = [];
        for(let i = 0;i<label.length;i++){
            let pt = textPoints[i][0];
            //解决旋转后的注记和不旋转的注记样式不一致的问题
            if(textPoints[i][1] == 0){
                textPoints[i][1] = 0.5;
            }
            //考虑到线文字注记有角度偏转，box统一增加1.2倍
            let labelBox = [pt[0]-(style.lineHeight*1.2)*0.5,pt[1]-style.lineHeight*1.2*0.5,pt[0]+(style.lineHeight*1.2)*0.5,pt[1]+style.lineHeight*1.2*0.5];
            this.boxScale(labelBox,style.lineTextBoxDisance);
            let owmCrashBox = [pt[0]-style.lineHeight*0.5,pt[1]-style.lineHeight*1.2*0.5,pt[0]+style.lineHeight*0.5,pt[1]+style.lineHeight*0.5];
            owmCrashBoxs.push(owmCrashBox);
            boxs.push(labelBox);
        }


        if(!style.isImportant){
            for(let j = 0;j<owmCrashBoxs.length-1;j++){
                let box1 = owmCrashBoxs[j];
                for(let k=j+1 ;k<owmCrashBoxs.length ;k++){
                    let box2 = owmCrashBoxs[k];
                    if(this.crashBox(box1,box2)){
                        return null;
                    }
                }
            }
        }
        return boxs;
    }

    // 两个盒子是否相交.
    crashBox(ibox,jbox){
        return ibox[0] <= jbox[2] &&
            ibox[2]  >= jbox[0] &&
            ibox[1]  <= jbox[3] &&
            ibox[3]  >= jbox[1] ;
    }

    boxScale(box,pointBoxDisance){
        if(!pointBoxDisance){
            pointBoxDisance = this.boxDistance;
        }

        box[0] = box[0]-pointBoxDisance*0.5;
        box[1] = box[1]-pointBoxDisance*0.5;
        box[2] = box[2]+pointBoxDisance*0.5;
        box[3] = box[3]+pointBoxDisance*0.5;
        return box;
    }


    /**
     * 如果文字注记旋转角度方向不一致(有的字向左，有的字向右旋转)，则调整为一致
     * @param textPoints
     */
    textToSameBearing(angle,textPoints){
        //保证竖方向的字是正的
        if(angle >= 45){
            angle = angle - 90;
        }else{
            if(angle <= - 45){
                angle = angle + 90;
            }
        }


        for(let i = 0;i<textPoints.length;i++){
            let p = textPoints[i][1];
            let offsetAngle = angle - p;
            if(offsetAngle > 45){
                textPoints[i][1] = p +90;
            }
            if(offsetAngle < -45){
                textPoints[i][1] = p -90;
            }
        }
    }

    // /**
    //  * 如果文字注记旋转角度方向不一致(有的字向左，有的字向右旋转)，则调整为一致
    //  * @param textPoints
    //  */
    // textToSameBearing(textPoints){
    //     let indexs = [];
    //     for(let m = 0;m<textPoints.length-1;m++){
    //         let p1 = textPoints[m][1];
    //         let p2 = textPoints[m+1][1];
    //         if(Math.abs(p1 -p2) >= 45){
    //             indexs.push(m+1);
    //         }
    //     }
    //
    //     if(indexs.length == 0){
    //         return;
    //     }
    //
    //     let leftIndexDis = indexs[0];
    //     let rightIndexDis = textPoints.length  - indexs[indexs.length - 1];
    //
    //     //从线头方向开始更换文字的角度
    //     if(leftIndexDis > rightIndexDis){
    //         for(let i = leftIndexDis-1;i<textPoints.length-2;i++){
    //             let p1 = textPoints[i][1];
    //             let p2 = textPoints[i+1][1];
    //             if(p1 -p2 >= 45){
    //                 textPoints[i+1][1] = p2 + 90;
    //             }
    //
    //             if(p1 -p2 <= -45){
    //                 textPoints[i+1][1] = p2 - 90;
    //             }
    //         }
    //     }else{
    //         //从线尾方向开始更换文字方向
    //         for(let j = indexs[indexs.length - 1];j>0;j--){
    //             let p1 = textPoints[j][1];
    //             let p2 = textPoints[j-1][1];
    //             if(p1 -p2 >= 45){
    //                 textPoints[j-1][1] = p2 + 90;
    //             }
    //
    //             if(p1 -p2 <= -45){
    //                 textPoints[j-1][1] = p2 - 90;
    //             }
    //         }
    //     }
    // }
}

module.exports = GLabelBox;
},{"./Util":17}],17:[function(require,module,exports){
class Util{
    static getRealLength(str) {
        var length = str.length;
        var realLength = 0
        for (var i = 0; i < length; i++) {
            let charCode = str.charCodeAt(i);
            if (charCode >= 0 && charCode <= 128) {
                realLength += 0.5;
            } else {
                realLength += 1;
            }
        }
        return realLength;
    }

    /**
     * 判断文本是否不为空
     *  Parameters :
     *  label - 要显示的文本
     *
     */
    static isNotNull(label){
        if(!label && label !=0){
            return false;
        }

        //如果是字符串
        if(typeof(label) == 'string'){
            label = label.toLowerCase();
            if(label == ''|| label == 'undefined' || label == 'null'){
                return false;
            }
        }
        return true;
    }

    /**
     * 统一转为微软雅黑
     */
    static formatFont(font,ratio,isChangeFont){
        var fontArr = font;
        if(isChangeFont){
            var farr = font.split(' ');
            farr[farr.length -1] = 'SimHei';
            fontArr =farr.join(' ');
        }

        return fontArr.replace(
            /(\d+\.?\d*)(px|em|rem|pt)/g,
            function(w, m, u) {
                if(m < 12){
                    m = 12 * ratio;
                }else{
                    m = Math.round(m) * ratio;
                }
                return m + u;
            }
        );
    };

    /**
     * 对注记进行去空格等处理
     */
    static formatLabel(label){
        if(label && label.length >0){
            //去掉不可见字符
            label =  label.replace( /([\x00-\x1f\x7f])/g,'');
            label = label.replace(/(\s*$)/g,"");
            label = label.replace(/<br\/>/g, "");
        }
        return label;
    }

    //获取两点连线与y轴的夹角
    static getAngle( p1,p2){
        if(p2[0]-p1[0] == 0){
            if(p2[1]>p1[0]){
                return 90;
            }else{
                return -90;
            }
        }
        let k = (p2[1]-p1[1])/(p2[0]-p1[0]);
        let angle = 360*Math.atan(k)/(2*Math.PI);
        return angle;
    }
}
module.exports = Util;




},{}],18:[function(require,module,exports){
/**
 * Created by kongjian on 2017/6/26.
 */
const Cache = require('../../../utils/Cache');
const GDrawGeomerty = require('../avoid/GDrawGeomerty');
const {Promise,getParamJSON} = require('./../../../utils/es6-promise');
const LabelDrawer = require('./LabelDrawer');
const GAnnoAvoid = require('./../avoid/GAnnoAvoid');
const GCutLine = require('./../avoid/GCutLine');
class CanvasLayer{
    constructor() {
        this.width = 0;
        this.height= 0;

        //当前屏幕的瓦片层行列号集合
        this.grid =[];
        this.cache = new Cache(256);
        //注记图层对象
        this.gwvtAnno = null;
        //数据源集合
        this.dataSource = [];
        //如果dataSource是urldatasource,那么样式纹理是否加载完成。 如果只有localDataSource,则为true
        this.isReady = false;

        //地图的最大范围
        this.maxExtent = [];
        //地图的当前视口
        this.extent =[];
        //地图的当前分辨率
        this.res = 0;
        //瓦片大小
        this.tileSize = 256;
        //是否允许拾取
        this.hitDetection = false;
        //当前屏幕内的features
        this.features = [];
        //正在请求中的瓦片请求集合,还没返回的请求
        this.requestingTiles = {};
        // 是否支持有isImportant属性
        this.hasImportant = true;
        //缩放比例
        this.ratio = 1;
        let canvas = document.createElement('CANVAS');
        let ctx =  canvas.getContext('2d',{isQuality:true});
        this.GAnnoAvoid = new GAnnoAvoid(ctx,false);
    }

    /**
     * 初始化
     */
    init(w,h,tileSize,gwvtAnno){
        this.tileSize = tileSize;
        this.gwvtAnno = gwvtAnno;
        this.initCanvas(w,h);
        this.loadResources();
    };

    /**
     * 加载dataSource的样式文件和纹理，所有dataSource的
     * 样式文件和纹理加载完成，则isReady设置为ture
     */
    loadResources(){
        if(this.dataSource.length == 0){
            this.isReady = false;
            return;
        }

        this.cache.clean();
        let reqArr = [];
        for(let i = 0;i<this.dataSource.length;i++){
            let ds = this.dataSource[i];
            if(ds.type == 'URLDataSource'){
                reqArr = reqArr.concat(ds.loadStyle());
            }
            if(ds.type == 'LocalDataSource'){
                reqArr = reqArr.concat(ds.loadTexture());
            }
        }

        if(reqArr.length > 0){
            Promise.all(reqArr).then(function(){
                this.isReady = true;
                //重新请求注记数据
                if(this.grid.length > 0){
                    this.requestLabelTiles(this.grid);
                }
            }.bind(this));
        }else{
            this.isReady = true;
        }
    };

    /**
     * 初始化画布
     * Parameters :
     * w - 图层宽
     * h - 图层高
     */
    initCanvas(w,h){
        this.width = w;
        this.height= h;
        if(!this.root){
            this.root = document.createElement("canvas");
        }
        this.root.style.width = this.width + "px";
        this.root.style.height = this.height + "px";
        this.root.width = this.width*this.ratio;
        this.root.height = this.height*this.ratio;
        this.root.id = 'labelCanvas';
        this.canvas = this.root.getContext("2d",{isQuality:true});


        if (this.hitDetection) {
            if(!this.hitCanvas){
                this.hitCanvas = document.createElement("canvas");
            }
            this.hitCanvas.style.width = this.width + "px";
            this.hitCanvas.style.height = this.height + "px";
            this.hitCanvas.width = this.width;
            this.hitCanvas.height = this.height;
            this.hitContext = this.hitCanvas.getContext("2d",{isQuality:true});
        }
    };


    /**
     * 添加数据源
     * Parameters :
     * dataSource
     */
    addDataSource(dataSource){
        if(dataSource.type =='URLDataSource'){
            dataSource.url = dataSource.url + '&tilesize='+this.tileSize;
        }

        if(dataSource.type =='URLDataSource' || dataSource.type =='LocalDataSource'){
            this.dataSource.push(dataSource);
        }
    };

    /**
     * 根据dataSoucceId移除数据源
     * Parameters :
     * dataSoucceId
     */
    removeDataSourceById(dataSoucceId){
        for(let i = 0;i<this.dataSource.length;i++){
            if(this.dataSource[i].id == dataSoucceId){
                this.dataSource.splice(i,1);
                return;
            }
        }
    };

    /**
     * 根据dataSoucceId获取数据源
     * Parameters :
     * dataSoucceId
     */
    getDataSourceById(dataSoucceId){
        for(let i = 0;i<this.dataSource.length;i++){
            if(this.dataSource[i].id == dataSoucceId){
                return this.dataSource[i];
            }
        }
    };

    /**
     * 清空画布
     */
    clean(){
        this.canvas.clearRect(0, 0, this.width*this.ratio, this.height*this.ratio);
        if(this.hitContext){
            this.hitContext.clearRect(0, 0, this.width, this.height);
        }
    };

    /**
     * 重新绘制注记要素，当动态更改DataSouce数据源后，需要调用redraw方法
     */
    redraw(){
        if(this.grid.length == 0){
            return;
        }
        this.cache.clean();
        //重新加载样式，纹理文件
        this.loadResources();
    };

    /**
     * 请求注记瓦片
     * Parameters :
     * grid - 当前视口内，瓦片的层行列号集合
     * zoomChanged - 是否进行了缩放操作
     */
    requestLabelTiles(grid,zoomChanged){
        this.grid = grid;
        //如果数据源没有准备好
        if(!this.isReady){
            return;
        }

        //获取需要请求的url
        let requestTileUrls = this.getRequestTileUrls(grid);
        this.sendRequest(requestTileUrls);
    };

    /**
     * 获取localDataSource中在当前屏幕范围内的注记要素
     */
    getLocalLabelDatas(){
        let localFeatures = [];
        for(let i = 0;i<this.dataSource.length;i++){
            let ds = this.dataSource[i];
            if(ds.type == 'LocalDataSource'){
                for(let j = 0;j<ds.features.length;j++){
                    let feature = ds.features[j];
                    //找出在当前视口内的要素
                    if(feature.inBounds(this.extent)){
                        if(feature.type == 1){
                            //转换要素的地理坐标为屏幕坐标
                            feature.sourceAngleData = [[feature.sourceData,0]];
                            feature.transformData(this.extent,this.res);
                            feature.label = feature.getFeatureLabel();
                            feature.textures = ds.textures;
                            localFeatures.push(feature);
                        }

                        if(feature.type == 2){
                            feature.label = feature.getFeatureLabel();
                            feature.textures = ds.textures;
                            localFeatures = localFeatures.concat(this.cutLineFeature(feature,true));
                        }
                    }
                }
            }
        }

        return localFeatures;
    };

    /**
     * 计算需要请求的瓦片的url
     * Parameters :
     * requestTiles - 需要请求的瓦片层行列号集合
     */
    getRequestTileUrls(grid){
        this.hitCacheUrls = [];
        this.currentTileDatas = [];
        //本次需要请求的url
        let requestTileUrls = {};
        //请求队列中找到的url集合
        let findedRequestUrls ={};
        for(let i = 0;i<this.dataSource.length;i++){
            let dataSource = this.dataSource[i];
            //url数据源
            if(dataSource.type == 'URLDataSource'){
                let url = dataSource.url;
                for(let j = 0;j<grid.length;j++){
                    let item = grid[j];
                    let tileUrl  = url.replace('${x}',item.col).replace('{x}',item.col);
                    tileUrl = tileUrl.replace('${y}',item.row).replace('{y}',item.row);
                    tileUrl = tileUrl.replace('${z}',item.level).replace('{z}',item.level);

                    //多域名url
                    if(dataSource.urlArray.length > 0){
                        let len = dataSource.urlArray.length-1;
                        let index = Math.round(Math.random()*len);
                        let domainUrl = dataSource.urlArray[index];

                        let array = tileUrl.split('/mapserver');
                        let partUrl = array[1];
                        tileUrl = domainUrl + '/mapserver'+partUrl;
                    }

                    //判断缓存中有没有该注记
                    let cacheItem = this.cache.getItem(tileUrl);
                    if(cacheItem){
                        this.hitCacheUrls.push(tileUrl);
                    }else{
                        //已经发送的请求队列中找,队列中没找到的需要发送请求
                        if(!this.requestingTiles[tileUrl]){
                            requestTileUrls[tileUrl] = {url:tileUrl,xyz:item,dataSourceId:dataSource.id,dataType:'json'};
                        }else{
                            findedRequestUrls[tileUrl] = true;
                        }
                    }
                }
            }
        }

        // console.log('total count  ================='+ grid.length);
        //关闭上次不需要的请求
        this.cancelRequest(findedRequestUrls);
        return requestTileUrls;
    };

    /**
     * 取消上次不需要的请求
     * Parameters :
     * findedRequestUrls - 请求队列中找到的url集合
     */
    cancelRequest(findedRequestUrls){
        for(let tileUrl in this.requestingTiles) {
            if (!findedRequestUrls[tileUrl]) {
                let requestTile = this.requestingTiles[tileUrl];
                delete this.requestingTiles[tileUrl];
                requestTile.xhr.abort();
                requestTile.requestItem.cancel = true;
            }
        }
    };

    /**
     * 发送请求，取注记瓦片数据
     * Parameters :
     * requestTileUrls - 需要请求的瓦片url集合
     */
    sendRequest(requestTileUrls){
        let count = 0;
        for(let url in requestTileUrls){
            let item = requestTileUrls[url];
            let promise = getParamJSON(item);
            this.requestingTiles[item.url] = {xhr:promise.xhr,requestItem:item};
            promise.then(this.tileSuccessFunction.bind(this),this.tileFailFunction.bind(this));
            count++;
        }
        // console.log('sendRequest count ==============='+count);
        if(count == 0){
            this.sendSuccess([]);
        }
    };

    /**
     * 单个瓦片注记请求成功的回调
     */
    tileSuccessFunction(data){
        if(data.param.cancel == true){
            //请求取消失败的，直接返回
            return;
        }

        let url = data.param.url;
        // console.log('onSuceess url ==='+ url);
        //删除正在请求的url
        delete this.requestingTiles[url];
        let features = this.parseFeature(data);
        //设置boxs
        let labelFeatures = this.GAnnoAvoid.GLabelBox.setBox(features.labelFeatures,features.avoidLineFeatures,true);
        labelFeatures = this.GAnnoAvoid.avoid(labelFeatures,features.avoidLineFeatures);
        this.currentTileDatas.push({url:url,labelFeatures:labelFeatures,avoidLineFeatures:features.avoidLineFeatures});

        //如果所有的瓦片请求成功
        if(this.isEmptyObject(this.requestingTiles)){
            this.sendSuccess(this.currentTileDatas);
        }
    };

    //判断map是否为空
    isEmptyObject(e) {
        for (let t in e)
            return !1;
        return !0
    };

    /**
     * 单个瓦片注记请求失败的回调
     */
    tileFailFunction(data){
        if(data.param.cancel == true){
            //请求取消失败的，直接返回
            return;
        }

        let url = data.param.url;
        // console.log('onfail url ==='+ url);
        delete this.requestingTiles[url];

        //如果所有的瓦片请求成功
        if(this.isEmptyObject(this.requestingTiles)){
            this.sendSuccess(this.currentTileDatas);
        }
    };

    /**
     * 请求成功的回调函数，没有请求url，也会执行该回调
     * Parameters :
     * results - 请求成功的结果
     */
    sendSuccess(results){
        if(this.gwvtAnno.animating){
            return;
        }

        //合并上次在当前视口范围内的注记要素(不包括本地要素)
        let mergeFeatures = this.mergeLabelData(results,this.hitCacheUrls);
        let labelFeatures = mergeFeatures.labelFeatures;

        for(let i = 0;i<results.length;i++){
            let item = results[i];
            this.cache.push(item.url,item);
        }

        //获取localDataSource中在当前屏幕范围内的注记要素
        let localFeatures = this.getLocalLabelDatas();
        labelFeatures = labelFeatures.concat(localFeatures);
        // console.time('avoid time:');
        //进行避让
        this.avoidlabelDatas = this.GAnnoAvoid.defaultAvoid(labelFeatures,this.hasImportant);
        // console.timeEnd('avoid time:');
        //重置图层位置
        this.gwvtAnno.resetCanvasDiv();
        this.clean();
        // this.drawAvoidLine(mergeFeatures.avoidLineFeatures);

        //保持当前屏幕内需要拾取的要素
        if(this.hitDetection){
            this.features = [];
            for(let i = 0;i<this.avoidlabelDatas.length;i++) {
                let feature = this.avoidlabelDatas[i];
                this.features[feature.id] = feature;
            }
        }
        //绘制注记要素
        GDrawGeomerty.draw(this.canvas,this.avoidlabelDatas,this.ratio,false,false,this.hitContext, this.hitDetection);
    };

    drawAvoidLine(avoidLineFeatures){
        this.canvas.save();
        this.canvas.beginPath();
        for(let i =0;i<avoidLineFeatures.length;i++){
            let avoidLineFeature = avoidLineFeatures[i];
            this.canvas.lineWidth=1;
            this.canvas.strokeStyle="#fff000";
            //画线
            this.canvas.moveTo(avoidLineFeature.datas[0],avoidLineFeature.datas[1]);
            for(j = 1;j<avoidLineFeature.datas.length/2;j++){
                this.canvas.lineTo(avoidLineFeature.datas[j*2],avoidLineFeature.datas[j*2+1]);
            }
        }
        this.canvas.stroke();
        this.canvas.restore();
    };

    /**
     * 解析返回的注记信息
     * Parameters:
     * tileData - 请求返回的注记数据
     * Returns:
     * labelDatas - 设置过样式,坐标由瓦片内坐标转为屏幕坐标的注记数据
     */
    parseFeature(tileData){
        let layers = tileData.data;
        let xyz = tileData.param.xyz;
        let count = 0;
        for(let key in layers){
            let layerData = layers[key];
            layerData.xyz = xyz;
            count++;
        }

        let dataSourceId = tileData.param.dataSourceId;

        let labelFeatures = [];
        let dataSource = this.getDataSourceById(dataSourceId);
        if(count > 0 &&  dataSource && dataSource.styleFun){
            //设置样式
            let itemDatas = [];
            let level = tileData.param.xyz.level;
            let drawer = new LabelDrawer(layers,level,itemDatas);
            dataSource.styleFun.call({}, drawer,level);

            //转换瓦片坐标为屏幕坐标,并构造label数据
            for(let j = 0;j<itemDatas.length;j++){
                let itemData =  itemDatas[j];
                itemData.textures = dataSource.textures;
                labelFeatures = labelFeatures.concat(this.parseItemData(itemData));
            }
        }

        let avoidLineFeatures = this.parseAvoidLine(layers['_layerAvoids'],xyz);
        return {labelFeatures:labelFeatures,avoidLineFeatures:avoidLineFeatures};
    };


    /**
     * 解析图元线要素
     * Parameters:
     * layerAvoids - 需要避让的线图层数据
     * xyz - 层行列号对象
     * Returns:
     * avoidLineFeatures - 需要避让的线要素
     */
    parseAvoidLine(layerAvoids,xyz){
        let avoidLineFeatures = [];
        for(let weight in layerAvoids){
            let lines = layerAvoids[weight];
            weight = parseInt(weight);
            for(let i = 0;i<lines.length;i++){
                let feature = {};
                feature.weight = weight;
                feature.sourceDatas = lines[i];
                feature.datas = this.transformAvoidLine(lines[i],xyz);
                feature.xyz =xyz;
                avoidLineFeatures.push(feature);
            }
        }
        return avoidLineFeatures;
    };



    /**
     * 将瓦片内坐标转换为当前屏幕坐标
     * Parameters:
     * line - 原始的需要避让的线
     * xyz - 瓦片的层行列号
     * Returns:
     * rdata - 本地屏幕内坐标数组
     */
    transformAvoidLine(line,xyz){
        //取出当前视口左上角的地理坐标
        let left = this.extent[0];
        let top = this.extent[3];

        //地图最大的范围
        let mLeft = this.maxExtent[0];
        let mTop = this.maxExtent[3];

        //计算坐上角的屏幕坐标
        let x = (left - mLeft) / this.res;
        let y = (mTop - top) / this.res;

        let newLine = [];

        for(let i = 0;i<line.length/2;i++){
            let px = line[2*i];
            let py = line[2*i+1];
            let gx = px + xyz.col * this.tileSize;
            let gy = py + xyz.row * this.tileSize;
            newLine.push(gx-x);
            newLine.push(gy-y);
        }
        return newLine;
    };


    /**
     * 将注记几何数据转换为相对本地的屏幕坐标
     * Parameters:
     * itemData - 瓦片内坐标的注记数据
     * Returns:
     * labelDatas - 设置过样式,坐标由瓦片内坐标转为屏幕坐标的注记数据
     */
    parseItemData(itemData){
        let labelDatas = [];
        //点
        if(itemData.type == 1){
            labelDatas =  this.parsePoint(itemData);
        }
        //线
        if(itemData.type == 2){
            if(itemData[0] =='LINESTRING'){
                labelDatas = labelDatas.concat(this.parseLine(itemData));
            }
            //多线
            if(itemData[0] =='MULTILINESTRING'){
                labelDatas = labelDatas.concat(this.parseMultiLine(itemData,itemData[2][0][0]));
            }
        }
        return labelDatas;
    };

    /**
     * 将点注记几何数据转换为相对本地的屏幕坐标
     * Parameters:
     * itemData - 瓦片内坐标的注记数据
     * Returns:
     * points - 设置过样式,坐标由瓦片内坐标转为屏幕坐标的注记数据
     */
    parsePoint(itemData){
        let points = [];
        let point = itemData[2];
        let sourceAngleData = [[point,0]];
        let p = this.transformData(sourceAngleData,itemData.xyz);
        let style = itemData.style;
        let label = itemData.fieldValueMap[style.labelfield];
        let primaryId = itemData.fieldValueMap['attributeId']+ '_row_'+itemData.xyz.row+'_col_'+itemData.xyz.col+'_level_'+itemData.xyz.level+'_x_'+sourceAngleData[0][0][0]+'_y_'+sourceAngleData[0][0][1];
        let weight = 0;
        if(itemData.fieldValueMap[style.avoidField]){
            weight = parseInt(itemData.fieldValueMap[style.avoidField]);
            if(isNaN(weight)){
                weight = 0;
            }
        }

        let directions = {0:1,1:1,2:1,3:1};
        points.push({id:Math.round(Math.random()*256*256*256),type:itemData.type,datas:p,sourceData:point,sourceAngleData:sourceAngleData,label:label,
            attributeId:itemData.fieldValueMap['attributeId'],primaryId:primaryId,style:style,iconImg:itemData.textures[style.texture],xyz:itemData.xyz,weight:weight,
            directions:directions,attributes:itemData.fieldValueMap});
        return points;
    };

    /**
     * 将线注记几何数据转换为相对本地的屏幕坐标
     * Parameters:
     * itemData - 瓦片内坐标的注记数据
     * Returns:
     * lines - 设置过样式,坐标由瓦片内坐标转为屏幕坐标的注记数据
     */
    parseLine(itemData){
        if(itemData[2].length == 0){
            return [];
        }

        let lines = [];
        if(Array.isArray(itemData[2][0][0])){
            lines = this.parseMultiLine(itemData,itemData[2][0]);
        }else{
            lines = this.parseMultiLine(itemData,itemData[2]);
        }
        return lines;
    };


    /**
     * 将多线注记几何数据转换为相对本地的屏幕坐标
     * Parameters:
     * itemData - 瓦片内坐标的注记数据
     * Returns:
     * multiLines - 设置过样式,坐标由瓦片内坐标转为屏幕坐标的注记数据
     */
    parseMultiLine(itemData,datas){
        let multiLines = [];
        let style = itemData.style;
        for(let i=0;i<datas.length;i++){
            let line = datas[i];
            if(line.length == 0){
                continue;
            }
            let label = itemData.fieldValueMap[style.labelfield];
            let roadCodeLabel = itemData.fieldValueMap[style.roadCodeLabel];
            let weight = 0;
            if(itemData.fieldValueMap[style.avoidField]){
                weight = parseInt(itemData.fieldValueMap[style.avoidField]);
            }
            let feature = {type:itemData.type,sourceData:line,label:label,weight:weight,roadCodeLabel:roadCodeLabel,
                attributeId:itemData.fieldValueMap['attributeId'],style:style,textures:itemData.textures,xyz:itemData.xyz,
                attributes:itemData.fieldValueMap};
            multiLines = multiLines.concat(this.cutLineFeature(feature,false));
        }
        return multiLines;
    };

    /**
     * 将线切多段，分为线文字，线编码，线箭头,并转换为屏幕坐标
     * Parameters:
     * feature - 瓦片内坐标的注记数据
     * isLocal - true为本地Feature,false为远程请求的feature
     * Returns:
     * features - 切好的线文字，线编码，线箭头要素集合
     */
    cutLineFeature(feature,isLocal){
        let features = GCutLine.cutLineFeature(feature);
        for(let i = 0;i<features.length;i++){
            let f = features[i];
            //转换为屏幕坐标
            if(isLocal){
                f.datas = feature.transformData(this.extent,this.res);
            }else{
                f.datas = this.transformData(f.sourceAngleData,f.xyz);
            }

            f.primaryId = f.attributeId+ '_row_'+feature.xyz.row+'_col_'+feature.xyz.col+'_level_'+feature.xyz.level
                +'_x_'+f.sourceAngleData[0][0][0]+'_y_'+f.sourceAngleData[0][0][1];
            //用于拾取的id
            f.id = Math.round(Math.random()*256*256*256);

            //获取注记的中心点
            if(f.lineType == 'text'){
                let centerIndex = Math.floor(f.datas.length/2);
                f.centerPoint = f.datas[centerIndex][0];
            }

            //获取注记的中心点
            if(f.lineType == 'code'){
                f.centerPoint = f.datas[0][0];
            }
        }
        return features;
    };

    /**
     * 将瓦片内坐标转换为当前屏幕坐标
     * Parameters:
     * points - 瓦片内坐标数组,item示例：[[12,20],0] [12,20]为点坐标，0为旋转的角度
     * xyz - 瓦片的层行列号
     * Returns:
     * rdata - 本地屏幕内坐标数组
     */
    transformData(points,xyz){
        //取出当前视口左上角的地理坐标
        let left = this.extent[0];
        let top = this.extent[3];

        //地图最大的范围
        let mLeft = this.maxExtent[0];
        let mTop = this.maxExtent[3];

        //计算坐上角的屏幕坐标
        let x = (left - mLeft) / this.res;
        let y = (mTop - top) / this.res;

        let rPoint = [];

        for(let i = 0;i<points.length;i++){
            let point = points[i][0];
            let gx = point[0] + xyz.col * this.tileSize;
            let gy = point[1] + xyz.row * this.tileSize;
            let p = [gx - x,gy - y];
            rPoint.push([p,points[i][1]]);
        }
        return rPoint;
    };

    /**
     * 将本次请求的注记数据和上次在本视口范围内的要素合并
     * Parameters:
     * labelDatas - 本次请求到注记数据
     * noRequestTiles - 当前视口中不需要请求的瓦片层行列号集合
     * Returns:
     * labelDatas - 合并后的注记数据，当前视口整个屏幕的数据
     */
    mergeLabelData(results,hitCacheUrls){
        let labelFeatures = [];
        let avoidLineFeatures = [];
        for(let j = 0;j<results.length;j++){
            let result = results[j];
            labelFeatures = labelFeatures.concat(result.labelFeatures);
            avoidLineFeatures = avoidLineFeatures.concat(result.avoidLineFeatures);
        }

        // let count = 0;
        for(let i =0 ;i<hitCacheUrls.length;i++){
            let cacheLabelFeatures = this.cache.getItem(hitCacheUrls[i]).labelFeatures;
            // if(cacheItem){
            //     count++;
            // }
            for(let j =0;j<cacheLabelFeatures.length;j++){
                let labelFeature = cacheLabelFeatures[j];
                //重新计算当前屏幕坐标
                labelFeature.datas = this.transformData(labelFeature.sourceAngleData,labelFeature.xyz);

                //获取注记的中心点
                if(labelFeature.lineType == 'text'){
                    let centerIndex = Math.floor(labelFeature.datas.length/2);
                    labelFeature.centerPoint = labelFeature.datas[centerIndex][0];
                }

                //获取注记的中心点
                if(labelFeature.lineType == 'code'){
                    labelFeature.centerPoint = labelFeature.datas[0][0];
                }
            }
            labelFeatures = labelFeatures.concat(cacheLabelFeatures);




            let cacheAvoidLineFeatures = this.cache.getItem(hitCacheUrls[i]).avoidLineFeatures;
            for(let j =0;j<cacheAvoidLineFeatures.length;j++){
                let avoidLineFeature = cacheAvoidLineFeatures[j];
                //重新计算当前屏幕坐标
                avoidLineFeature.datas = this.transformAvoidLine(avoidLineFeature.sourceDatas,avoidLineFeature.xyz);
            }
            avoidLineFeatures = avoidLineFeatures.concat(cacheAvoidLineFeatures);
        }



        // console.log('merge cache count =============='+count );
        return {labelFeatures:labelFeatures,avoidLineFeatures:avoidLineFeatures};
    };


    /**
     * 根据屏幕坐标获取feature
     * Parameters :
     * x
     * y
     */
    getFeatureByXY(x,y) {
        let feature = null;
        if (this.hitDetection) {
            let featureId;
            let data = this.hitContext.getImageData(x, y, 1, 1).data;
            if (data[3] === 255) { // antialiased
                let id = data[2] + (256 * (data[1] + (256 * data[0])));
                if (id) {
                    featureId = id - 1 ;
                    try {
                        feature = this.features[featureId];
                    } catch(err) {
                    }
                }
            }
        }
        return feature;
    }
}
module.exports = CanvasLayer;

},{"../../../utils/Cache":23,"../avoid/GDrawGeomerty":14,"./../../../utils/es6-promise":25,"./../avoid/GAnnoAvoid":11,"./../avoid/GCutLine":12,"./LabelDrawer":19}],19:[function(require,module,exports){
/**
 * Created by kongjian on 2017/5/1.
 */
class LabelDrawer{
    constructor(layerDataMap,level,features) {
        this.layerDataMap = layerDataMap;
        this.level = level;
        this.features = features;
    }

    getLayer(layername){
        this.labelDatas = [];

        let data = this.layerDataMap[layername];
        if(data == null || data.features == null){
            return this;
        }

        for(let j=0;j<data.features.length;j++){
            let labelData = data.features[j];
            labelData.layerName = layername;
            labelData.xyz = data.xyz;
            labelData.type = data.type;
            if(!labelData.fieldValueMap){
                labelData.fieldValueMap = this.getFieldValueMap(data,labelData);
            }
            this.labelDatas.push(labelData);
        }
        return this;
    }

    getGroupLayer(layername,value){
        this.labelDatas = [];

        let valueArr = value.split(',');
        let length = valueArr.length;
        if(length == 0){
            return this;
        }

        let data = this.layerDataMap[layername];
        if(data == null || data.features == null){
            return this;
        }

        for(let j = 0 ; j < length ; j ++){
            let dataArr = data.features[valueArr[j]];
            if(dataArr == null){
                continue;
            }

            let labelData = data.features[i];
            labelData.layerName = layername;
            labelData.xyz = data.xyz;
            labelData.type = data.type;
            if(!labelData.fieldValueMap){
                labelData.fieldValueMap = this.getFieldValueMap(data,labelData);
            }
            this.labelDatas.push(labelData);
        }
        return this;
    }

    setStyle(fn){
        for(let i=0;i<this.labelDatas.length;i++){
            let labelData = this.labelDatas[i];
            let get = function(key){
                return labelData.fieldValueMap[key];
            };
            let style = fn.call({},this.level,get);
            if(style && style.show == true){
                labelData.style = style;
                labelData.fieldValueMap['avoidWeight']=style.avoidWeight;
                this.features.push(labelData);
            }
        }
    }

    getFieldValueMap(data,labelData){
        let  fieldValueMap=  {};
        for(let i = 0;i<data.fieldsConfig.length;i++){
            let fieldName = data.fieldsConfig[i]['name'];
            let index = data.fieldsConfig[i]['index'];
            let id = data.fieldsConfig[i]['id'];
            if(id == true){
                //图层名和数据的主键构成唯一id
                fieldValueMap['attributeId'] =labelData.layerName+labelData[1][index];
            }
            fieldValueMap[fieldName] = labelData[1][index];
        }
        return fieldValueMap;
    }

    draw(){

    }
}

module.exports = LabelDrawer;


},{}],20:[function(require,module,exports){
/**
 * Created by kongjian on 2017/6/27.
 */
class Feature{
    constructor() {
        this.id = Math.round(Math.random()*256*256*256);
        //要素类型，1代表点，2代表线
        this.type = 1;
        //数据一维数组，里面依次存放x,y地理坐标
        this.sourceData =[];
        //根据sourceAngleData转换为屏幕坐标的集合
        this.datas = [];
        //由原始sourceData切断过，带角度的数据
        this.sourceAngleData = [];
        this.attributes ={};
        //单个注记的样式
        this.style ={};
    }

    /**
     * 添加属性字段
     * Parameters :
     * key
     * value
     */
    addAttribute(key,value){
        this.attributes[key] = value;
    };

    /**
     * 根据字段名删除属性
     * Parameters :
     * key
     * value
     */
    removeAttributeByKey(key){
        delete this.attributes[key];
    };

    /**
     * 计算feature的最大外接矩形
     */
    getMaxExtent(){
        if(this.sourceData.length == 0 ){
            return null;
        }
        let minX = this.sourceData[0];
        let maxX = this.sourceData[0];
        let minY = this.sourceData[1];
        let maxY = this.sourceData[1];
        for(let i = 2;i< this.sourceData.length;i++){
            let tempX = this.sourceData[i];
            let tempY = this.sourceData[i+1];
            if(tempX>maxX)   // 判断最大值
                maxX=tempX;
            if(tempX<minX)   // 判断最小值
                minX=tempX;

            if(tempY>maxY)   // 判断最大值
                maxY=tempY;
            if(tempY<minY)   // 判断最小值
                minY=tempY;
            i++;
        }
        return [minX,minY,maxX,maxY];
    };

    /**
     * 判断feature是否在当前视口中
     * Parameters :
     * srceenBounds - 当前视口的外接矩形
     */
    inBounds(srceenBounds){
        let featureBounds = this.getMaxExtent();
        if(!featureBounds){
            return false;
        }

        return featureBounds[0] <= srceenBounds[2] &&
            featureBounds[2]  >= srceenBounds[0] &&
            featureBounds[1]  <= srceenBounds[3] &&
            featureBounds[3]  >= srceenBounds[1] ;
    };


    /**
     * 将要素的地理坐标转换为当前的屏幕坐标
     * Parameters:
     * srceenBounds - 当前视口的外接矩形
     * res - 当前地图的分辨率
     */
    transformData(srceenBounds,res){
        this.datas = [];
        if(this.sourceData.length == 0){
            return;
        }
        //取出当前视口左上角的地理坐标
        let left = srceenBounds[0];
        let top = srceenBounds[3];

        // for(let i = 0;i< this.sourceData.length;i++){
        //     let sx = this.sourceData[i];
        //     let sy = this.sourceData[i+1];
        //     this.datas.push((sx - left)/res);
        //     this.datas.push((top - sy)/res);
        //     i++;
        // }

        let rPoints = [];
        for(let i = 0;i<this.sourceAngleData.length;i++){
            let point = this.sourceAngleData[i][0];
            let gx = (point[0] - left)/res;
            let gy = (top - point[1])/res;
            let p = [gx,gy];
            rPoints.push([p,this.sourceAngleData[i][1]]);
        }
        this.datas = rPoints;
    };


    /**
     * 获取要素要显示的文字内容
     */
    getFeatureLabel(){
        let labelField = this.style['labelfield'];
        if(labelField){
            if(this.attributes[labelField]){
                return this.attributes[labelField]+'';
            }
        }
        return null;
    }
}

module.exports = Feature;

},{}],21:[function(require,module,exports){
/**
 * Created by kongjian on 2017/7/3.
 */
const GXYZUtil = require('./draw/GXYZUtil');
const Version = require('../../ext/Version');
var GXYZ = OpenLayers.Class(OpenLayers.Layer.XYZ, {
    //多个服务器url的域名，用于解决一个域名只有6条请求管线的限制
    urlArray:[],
    // 不带过滤条件的url
    sourceUrl: null,
    //过滤是否准备好
    isReady:true,
    //底图图层的代理类，负责封装过滤，拾取高亮等接口
    gxyzUtil:null,
    //高亮图层
    highlightLayer:null,
    //缩放比例
    ratio:1,
    //过滤json对象
    control:null,
    //过滤的id
    controlId:null,
    //瓦片大小
    tilesize:256,
    initialize: function(name, url, options) {
        if(window.devicePixelRatio > 1.5){
            this.ratio = 2;
        }

        if(!this.sourceUrl){
            this.sourceUrl = url;
        }
        if(options &&options.tileSize){
            this.tilesize = options.tileSize.w;
        }
        this.url = url +'&ratio='+this.ratio+'&tilesize='+this.tilesize+'&clientVersion='+Version;
        this.gxyzUtil = new GXYZUtil();
        this.gxyzUtil.tileSize = this.tilesize;
        this.gxyzUtil.parseUrl(url);
        OpenLayers.Layer.XYZ.prototype.initialize.apply(this, [name,this.url, options]);
    },

    moveTo:function(bounds, zoomChanged, dragging) {
        if(this.isReady){
            OpenLayers.Layer.XYZ.prototype.moveTo.apply(this, arguments);
        }
    },

    /**
     * 重写ol的layer的setMap方法，map.addLayer时触发
     */
    setMap:function(map){
        if(this.control){
            this.url = this.sourceUrl +'&ratio='+this.ratio+'&tilesize='+this.tilesize+'&clientVersion='+Version+ '&control='+this.control;
        }
        if(this.controlId){
            this.url = this.sourceUrl +'&ratio='+this.ratio+'&tilesize='+this.tilesize+'&clientVersion='+Version+ '&controlId='+this.controlId;
        }
        OpenLayers.Layer.XYZ.prototype.setMap.apply(this, arguments);
    },

    getURL: function (bounds) {
        var xyz = this.getXYZ(bounds);
        var url = this.url;
        if (this.urlArray.length != 0) {
            var s = '' + xyz.x + xyz.y + xyz.z;
            var array = url.split('/mapserver');
            var partUrl = array[1];
            url = this.selectUrl(s, this.urlArray) + '/mapserver'+partUrl;
        }

        return OpenLayers.String.format(url, xyz);
    },

    /**
     * 设置过滤条件
     */
    setFilter:function(filter){
        if(!this.url){
            return;
        }

        if(!filter || (filter.layers.length == 0 && filter.order.length == 0)){
            this.url = this.sourceUrl +'&ratio='+this.ratio+'&tilesize='+this.tilesize+'&clientVersion='+Version;
            if(this.map){
                this.clearGrid();
                var center = this.map.getCenter();
                center.lon = center.lon +0.00000000001;
                this.map.setCenter(center);
            }
            return;
        }

        this.isReady = false;
        this.gxyzUtil.setFilter(filter,function(result){
            if(result.isIE){
                this.controlId =result.id;
                this.url = this.sourceUrl +'&ratio='+this.ratio+'&tilesize='+this.tilesize+'&clientVersion='+Version+ '&controlId='+result.id;
            }else{
                this.control =result.id;
                this.url = this.sourceUrl +'&ratio='+this.ratio+'&tilesize='+this.tilesize+'&clientVersion='+Version+ '&control='+result.id;
            }

            this.isReady = true;
            if(this.map){
                this.clearGrid();
                var center = this.map.getCenter();
                center.lon = center.lon +0.00000000001;
                this.map.setCenter(center);
            }
        }.bind(this));
    },

    /**
     * 根据屏幕坐标获取拾取到的要素
     * Parameters :
     * x -
     * y -
     * callback - 拾取成功的回调函数
     */
    getFeatureByXY:function(x,y,callback){
        var lonlat = this.map.getLonLatFromPixel(new OpenLayers.Pixel(x,y));
        this.getFeatureByLonlat(lonlat,callback);
    },

    /**
     * 根据地理坐标获取拾取到的要素
     * Parameters :
     * lonlat - 地理坐标对象
     * callback - 拾取成功的回调函数
     */
    getFeatureByLonlat:function(lonlat,callback){
        var maxBounds = this.map.getMaxExtent();
        var res = this.map.getResolution();
        var tileSize = this.tileSize.w;
        var row = (maxBounds.top - lonlat.lat) /(res*tileSize);
        var col = (lonlat.lon - maxBounds.left)/(res*tileSize);

        var level = this.map.getZoom();
        var tx = (col - Math.floor(col))*tileSize;
        var ty = (row - Math.floor(row))*tileSize;

        this.gxyzUtil.pickupFeatures(row,col,level,tx,ty,this.control,this.controlId,function(features){
            callback(features);
        });
    },

    /**
     * 根据指定的样式高亮要素
     * Parameters :
     * layerFeatures - 要素数组
     * style - 高亮样式 如：{color:"red",opacity:0.8};
     */
    highlightFeatures:function(layerFeatures,style){
        //获取高亮的过滤条件
        var filter = this.gxyzUtil.CreateHighlightFilter(layerFeatures,style);
        //如果没有过滤任何要素
        if(filter.layers.length == 0){
            return;
        }

        style.color = style.color.replace('#','%23');
       if(!this.highlightLayer){
           //构造高亮图层
           var option = this.cloneOptions(this.options);
           option.opacity = style.opacity;
           option.isBaseLayer = false;
           this.highlightLayer = new OpenLayers.Layer.GXYZ("highlightLayer",this.sourceUrl,option);
           this.map.addLayer(this.highlightLayer);
       }
       //设置高亮过滤条件
       this.highlightLayer.setFilter(filter);
       //获取当前图层的index
       var index = this.map.getLayerIndex(this);
        //设置高亮图层在当前底图图层之上
        this.map.setLayerIndex(this.highlightLayer,index+1);
    },

    /**
     * 根据指定的样式高亮要素，每个要素都可以有不同的样式
     * Parameters :
     * layerFeatures - 要素map集合
     * opacity - 透明度，所有要高亮的要素都是必须是相同的透明度;
     */
    highlightEveryFeatures:function(layerFeatures,opacity){
        //获取高亮的过滤条件
        var filter = this.gxyzUtil.CreateEveryHighlightFilter(layerFeatures);
        //如果没有过滤任何要素
        if(filter.layers.length == 0){
            return;
        }

        if(!this.highlightLayer){
            //构造高亮图层
            var option = this.cloneOptions(this.options);
            option.isBaseLayer = false;
            option.opacity = opacity;
            this.highlightLayer = new OpenLayers.Layer.GXYZ("highlightLayer",this.sourceUrl,option);
            this.map.addLayer(this.highlightLayer);
        }
        //设置高亮过滤条件
        this.highlightLayer.setFilter(filter);
        //获取当前图层的index
        var index = this.map.getLayerIndex(this);
        //设置高亮图层在当前底图图层之上
        this.map.setLayerIndex(this.highlightLayer,index+1);
    },


    /**
     * 克隆对象
     */
    cloneOptions:function(myObj){
        if(typeof(myObj) != 'object' || myObj == null) return myObj;
        var newObj = new Object();
        for(var i in myObj){
            newObj[i] = this.cloneOptions(myObj[i]);
        }
        return newObj;
    },

/**
     * 取消高亮
     */
    cancelHighlight:function(){
        if(this.highlightLayer){
            this.map.removeLayer(this.highlightLayer);
            this.highlightLayer = null;
        }
    }
})

module.exports = GXYZ;
},{"../../ext/Version":2,"./draw/GXYZUtil":22}],22:[function(require,module,exports){
/**
 * Created by kongjian on 2017/6/26.
 */
const {getJSON} = require('./../../../utils/es6-promise');
const Filter = require('./../../../filter/Filter');
const FilterLayer = require('./../../../filter/FilterLayer');
const Version = require('../../../ext/Version');
class GXYZUtil{
    constructor() {
        this.tileSize=256;
    }

    /**
     * 设置过滤条件
     */
    setFilter(filter,callback){
        for(var i = 0;i<filter.layers.length;i++){
            var filterLayer = filter.layers[i];
            if(!filterLayer.id){
                filter.layers.splice(i,1);
            }
        }

        var control = JSON.stringify(filter);
        if(this.isIE()){
            //设置过滤条件
            getJSON({type:'post',url:this.host + '/mapserver/vmap/'+this.servername+'/setControl',
                data:'control= '+ control,
                dataType:'json'}).then(function(result){
                result.isIE = true;
                callback(result);
            }.bind(this));
        }else{
            var result = {isIE:false,id:control};
            callback(result);
        }
    };


    /**
     * 解析url
     */
    parseUrl(url){
        var urlParts = url.split('?');
        // var urlPartOne = urlParts[0].split('/mapserver/vmap/');
        var urlPartOne = urlParts[0].split('/mapserver/');
        this.host = urlPartOne[0];
        this.servername = urlPartOne[1].split('/')[1];
        var params = urlParts[1].split('&');
        for(var i = 0;i<params.length;i++){
            var param = params[i];
            var keyValue = param.split('=');
            if(keyValue[0] == 'styleId'){
                this.styleId = keyValue[1];
                return;
            }
        }
    };

    /**
     * 拾取要素
     * Parameters :
     * row - 要拾取的要素所在的行
     * col - 要拾取的要素所在的列
     * level - 要拾取的要素所在的层级
     * x - 要拾取的要素所在瓦片内的x坐标
     * y - 要拾取的要素所在瓦片内y坐标
     * control - 过滤的json对象
     * controlId - 过滤对象在服务器上存的key
     * callback - 拾取到要素后的回调函数
     */
    pickupFeatures(row,col,level,x,y,control,controlId,callback) {
        var url = this.host + '/mapserver/pickup/'+this.servername+'/getData?x='+col +'&y='+row+'&l='+level+
            '&pixelX='+x+'&pixelY='+y+'&styleId='+this.styleId+'&tilesize='+this.tileSize+'&clientVersion='+Version;
        if(control){
            url = url + '&control='+control;
        }
        if(controlId){
            url = url + '&controlId='+controlId;
        }

        getJSON({
            url:url,
            dataType: "json"}).then(function (features) {
            callback(features);
        },function(){
            callback([]);
        })
    };

    /**
     * 构造高亮的filter
     * Parameters :
     * features - 要素数组
     * style - 高亮样式 如：{color:"red",opacity:0.8};
     */
    CreateHighlightFilter(layerFeatures,style){
        var filter = new Filter();
        filter.otherDisplay = false;

        for(var layerId in layerFeatures){
            var fs = layerFeatures[layerId];
            var hasFid = false;
            for(var fid in fs){
                var filterLayer = new FilterLayer();
                filterLayer.id = layerId;
                filterLayer.idFilter = fid;
                filterLayer.color = style;
                filter.addFilterLayer(filterLayer);
                hasFid = true;
            }
            if(!hasFid){
                var filterLayer = new FilterLayer();
                filterLayer.id = layerId;
                filterLayer.color = style;
                filter.addFilterLayer(filterLayer);
            }
        }
        return filter;
    };


    /**
     * 构造高亮的filter,每个要素都有高亮样式
     * Parameters :
     * layerFeatures - 要素数组
     */
    CreateEveryHighlightFilter(layerFeatures){
        var filter = new Filter();
        filter.otherDisplay = false;

        for(var layerId in layerFeatures){
            var fs = layerFeatures[layerId];
            var layerStyle = fs.style;
            var hasFid = false;
            for(var fid in fs){
                var style = fs[fid].style;
                style.color = style.color.replace('#','%23');
                var filterLayer = new FilterLayer();
                filterLayer.id = layerId;
                filterLayer.idFilter = fid;
                filterLayer.color = style;
                filter.addFilterLayer(filterLayer);
                hasFid = true;
            }
            if(!hasFid && layerStyle){
                layerStyle.color = layerStyle.color.replace('#','%23');
                var filterLayer = new FilterLayer();
                filterLayer.id = layerId;
                filterLayer.color = layerStyle;
                filter.addFilterLayer(filterLayer);
            }
        }
        return filter;
    };

    /**
     * 是否为ie浏览器
     */
    isIE() {
        if (!!window.ActiveXObject || "ActiveXObject" in window)
            return true;
        else
            return false;
    };
}

module.exports = GXYZUtil;

},{"../../../ext/Version":2,"./../../../filter/Filter":3,"./../../../filter/FilterLayer":4,"./../../../utils/es6-promise":25}],23:[function(require,module,exports){
/**
 * Created by kongjian on 2018/6/12.
 * 注记瓦片队列缓存工具类
 */
class Cache{
    constructor(size) {
        this.size = size;
        this.map = {};
        this.list = [];
    }

    //往缓存中加入数据
    push(key,item){
        if(this.list.length>this.size-1){
            var removeKey = this.list.shift();
            delete this.map[removeKey];
        }
        this.list.push(key);
        this.map[key] = item;
    }

    //获取缓存数据
    getItem(key){
        return this.map[key];
    }

    //清空缓存
    clean(){
        this.map = {};
        this.list = [];
    }

    //获取缓存的长度
    length(){
        return this.list.length;
    }
}

module.exports = Cache;

},{}],24:[function(require,module,exports){
function UUID() {
	this.id = this.createUUID()
}
UUID.prototype.valueOf = function() {
	return this.id
};
UUID.prototype.toString = function() {
	return this.id
};
UUID.prototype.createUUID = function() {
	var c = new Date(1582, 10, 15, 0, 0, 0, 0);
	var f = new Date();
	var h = f.getTime() - c.getTime();
	var i = UUID.getIntegerBits(h, 0, 31);
	var g = UUID.getIntegerBits(h, 32, 47);
	var e = UUID.getIntegerBits(h, 48, 59) + "2";
	var b = UUID.getIntegerBits(UUID.rand(4095), 0, 7);
	var d = UUID.getIntegerBits(UUID.rand(4095), 0, 7);
	var a = UUID.getIntegerBits(UUID.rand(8191), 0, 7)
			+ UUID.getIntegerBits(UUID.rand(8191), 8, 15)
			+ UUID.getIntegerBits(UUID.rand(8191), 0, 7)
			+ UUID.getIntegerBits(UUID.rand(8191), 8, 15)
			+ UUID.getIntegerBits(UUID.rand(8191), 0, 15);
	return i + g + e + b + d + a
};
UUID.getIntegerBits = function(f, g, b) {
	var a = UUID.returnBase(f, 16);
	var d = new Array();
	var e = "";
	var c = 0;
	for (c = 0; c < a.length; c++) {
		d.push(a.substring(c, c + 1))
	}
	for (c = Math.floor(g / 4); c <= Math.floor(b / 4); c++) {
		if (!d[c] || d[c] == "") {
			e += "0"
		} else {
			e += d[c]
		}
	}
	return e
};
UUID.returnBase = function(c, d) {
	var e = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C",
			"D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P",
			"Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
	if (c < d) {
		var b = e[c]
	} else {
		var f = "" + Math.floor(c / d);
		var a = c - f * d;
		if (f >= d) {
			var b = this.returnBase(f, d) + e[a]
		} else {
			var b = e[f] + e[a]
		}
	}
	return b
};
UUID.rand = function(a) {
	return Math.floor(Math.random() * a)
};

module.exports = UUID;
},{}],25:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   4.1.0+f046478d
 */

function promiseFun() { 'use strict';
    function objectOrFunction(x) {
        var type = typeof x;
        return x !== null && (type === 'object' || type === 'function');
    }

    function isFunction(x) {
        return typeof x === 'function';
    }

    var _isArray = undefined;
    if (Array.isArray) {
        _isArray = Array.isArray;
    } else {
        _isArray = function (x) {
            return Object.prototype.toString.call(x) === '[object Array]';
        };
    }

    var isArray = _isArray;

    var len = 0;
    var vertxNext = undefined;
    var customSchedulerFn = undefined;

    var asap = function asap(callback, arg) {
        queue[len] = callback;
        queue[len + 1] = arg;
        len += 2;
        if (len === 2) {
            // If len is 2, that means that we need to schedule an async flush.
            // If additional callbacks are queued before the queue is flushed, they
            // will be processed by this flush that we are scheduling.
            if (customSchedulerFn) {
                customSchedulerFn(flush);
            } else {
                scheduleFlush();
            }
        }
    };

    function setScheduler(scheduleFn) {
        customSchedulerFn = scheduleFn;
    }

    function setAsap(asapFn) {
        asap = asapFn;
    }

    var browserWindow = typeof window !== 'undefined' ? window : undefined;
    var browserGlobal = browserWindow || {};
    var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
    var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';

// test for web worker but not in IE10
    var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
    function useNextTick() {
        // node version 0.10.x displays a deprecation warning when nextTick is used recursively
        // see https://github.com/cujojs/when/issues/410 for details
        return function () {
            return process.nextTick(flush);
        };
    }

// vertx
    function useVertxTimer() {
        if (typeof vertxNext !== 'undefined') {
            return function () {
                vertxNext(flush);
            };
        }

        return useSetTimeout();
    }

    function useMutationObserver() {
        var iterations = 0;
        var observer = new BrowserMutationObserver(flush);
        var node = document.createTextNode('');
        observer.observe(node, { characterData: true });

        return function () {
            node.data = iterations = ++iterations % 2;
        };
    }

// web worker
    function useMessageChannel() {
        var channel = new MessageChannel();
        channel.port1.onmessage = flush;
        return function () {
            return channel.port2.postMessage(0);
        };
    }

    function useSetTimeout() {
        // Store setTimeout reference so es6-promise will be unaffected by
        // other code modifying setTimeout (like sinon.useFakeTimers())
        var globalSetTimeout = setTimeout;
        return function () {
            return globalSetTimeout(flush, 1);
        };
    }

    var queue = new Array(1000);
    function flush() {
        for (var i = 0; i < len; i += 2) {
            var callback = queue[i];
            var arg = queue[i + 1];

            callback(arg);

            queue[i] = undefined;
            queue[i + 1] = undefined;
        }

        len = 0;
    }

    function attemptVertx() {
        try {
            var r = require;
            var vertx = r('vertx');
            vertxNext = vertx.runOnLoop || vertx.runOnContext;
            return useVertxTimer();
        } catch (e) {
            return useSetTimeout();
        }
    }

    var scheduleFlush = undefined;
// Decide what async method to use to triggering processing of queued callbacks:
    if (isNode) {
        scheduleFlush = useNextTick();
    } else if (BrowserMutationObserver) {
        scheduleFlush = useMutationObserver();
    } else if (isWorker) {
        scheduleFlush = useMessageChannel();
    } else if (browserWindow === undefined && typeof require === 'function') {
        scheduleFlush = attemptVertx();
    } else {
        scheduleFlush = useSetTimeout();
    }

    function then(onFulfillment, onRejection) {
        var _arguments = arguments;

        var parent = this;

        var child = new this.constructor(noop);

        if (child[PROMISE_ID] === undefined) {
            makePromise(child);
        }

        var _state = parent._state;

        if (_state) {
            (function () {
                var callback = _arguments[_state - 1];
                asap(function () {
                    return invokeCallback(_state, child, callback, parent._result);
                });
            })();
        } else {
            subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
    }

    /**
     @method resolve
     @static
     @param {Any} value value that the returned promise will be resolved with
     Useful for tooling.
     @return {Promise} a promise that will become fulfilled with the given
     `value`
     */
    function resolve$1(object) {
        /*jshint validthis:true */
        var Constructor = this;

        if (object && typeof object === 'object' && object.constructor === Constructor) {
            return object;
        }

        var promise = new Constructor(noop);
        resolve(promise, object);
        return promise;
    }

    var PROMISE_ID = Math.random().toString(36).substring(16);

    function noop() {}

    var PENDING = void 0;
    var FULFILLED = 1;
    var REJECTED = 2;

    var GET_THEN_ERROR = new ErrorObject();

    function selfFulfillment() {
        return new TypeError("You cannot resolve a promise with itself");
    }

    function cannotReturnOwn() {
        return new TypeError('A promises callback cannot return that same promise.');
    }

    function getThen(promise) {
        try {
            return promise.then;
        } catch (error) {
            GET_THEN_ERROR.error = error;
            return GET_THEN_ERROR;
        }
    }

    function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
        try {
            then$$1.call(value, fulfillmentHandler, rejectionHandler);
        } catch (e) {
            return e;
        }
    }

    function handleForeignThenable(promise, thenable, then$$1) {
        asap(function (promise) {
            var sealed = false;
            var error = tryThen(then$$1, thenable, function (value) {
                if (sealed) {
                    return;
                }
                sealed = true;
                if (thenable !== value) {
                    resolve(promise, value);
                } else {
                    fulfill(promise, value);
                }
            }, function (reason) {
                if (sealed) {
                    return;
                }
                sealed = true;

                reject(promise, reason);
            }, 'Settle: ' + (promise._label || ' unknown promise'));

            if (!sealed && error) {
                sealed = true;
                reject(promise, error);
            }
        }, promise);
    }

    function handleOwnThenable(promise, thenable) {
        if (thenable._state === FULFILLED) {
            fulfill(promise, thenable._result);
        } else if (thenable._state === REJECTED) {
            reject(promise, thenable._result);
        } else {
            subscribe(thenable, undefined, function (value) {
                return resolve(promise, value);
            }, function (reason) {
                return reject(promise, reason);
            });
        }
    }

    function handleMaybeThenable(promise, maybeThenable, then$$1) {
        if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
            handleOwnThenable(promise, maybeThenable);
        } else {
            if (then$$1 === GET_THEN_ERROR) {
                reject(promise, GET_THEN_ERROR.error);
                GET_THEN_ERROR.error = null;
            } else if (then$$1 === undefined) {
                fulfill(promise, maybeThenable);
            } else if (isFunction(then$$1)) {
                handleForeignThenable(promise, maybeThenable, then$$1);
            } else {
                fulfill(promise, maybeThenable);
            }
        }
    }

    function resolve(promise, value) {
        if (promise === value) {
            reject(promise, selfFulfillment());
        } else if (objectOrFunction(value)) {
            handleMaybeThenable(promise, value, getThen(value));
        } else {
            fulfill(promise, value);
        }
    }

    function publishRejection(promise) {
        if (promise._onerror) {
            promise._onerror(promise._result);
        }

        publish(promise);
    }

    function fulfill(promise, value) {
        if (promise._state !== PENDING) {
            return;
        }

        promise._result = value;
        promise._state = FULFILLED;

        if (promise._subscribers.length !== 0) {
            asap(publish, promise);
        }
    }

    function reject(promise, reason) {
        if (promise._state !== PENDING) {
            return;
        }
        promise._state = REJECTED;
        promise._result = reason;

        asap(publishRejection, promise);
    }

    function subscribe(parent, child, onFulfillment, onRejection) {
        var _subscribers = parent._subscribers;
        var length = _subscribers.length;

        parent._onerror = null;

        _subscribers[length] = child;
        _subscribers[length + FULFILLED] = onFulfillment;
        _subscribers[length + REJECTED] = onRejection;

        if (length === 0 && parent._state) {
            asap(publish, parent);
        }
    }

    function publish(promise) {
        var subscribers = promise._subscribers;
        var settled = promise._state;

        if (subscribers.length === 0) {
            return;
        }

        var child = undefined,
            callback = undefined,
            detail = promise._result;

        for (var i = 0; i < subscribers.length; i += 3) {
            child = subscribers[i];
            callback = subscribers[i + settled];

            if (child) {
                invokeCallback(settled, child, callback, detail);
            } else {
                callback(detail);
            }
        }

        promise._subscribers.length = 0;
    }

    function ErrorObject() {
        this.error = null;
    }

    var TRY_CATCH_ERROR = new ErrorObject();

    function tryCatch(callback, detail) {
        // try {
            return callback(detail);
        // } catch (e) {
        //     TRY_CATCH_ERROR.error = e;
        //     return TRY_CATCH_ERROR;
        // }
    }

    function invokeCallback(settled, promise, callback, detail) {
        var hasCallback = isFunction(callback),
            value = undefined,
            error = undefined,
            succeeded = undefined,
            failed = undefined;

        if (hasCallback) {
            value = tryCatch(callback, detail);

            if (value === TRY_CATCH_ERROR) {
                failed = true;
                error = value.error;
                value.error = null;
            } else {
                succeeded = true;
            }

            if (promise === value) {
                reject(promise, cannotReturnOwn());
                return;
            }
        } else {
            value = detail;
            succeeded = true;
        }

        if (promise._state !== PENDING) {
            // noop
        } else if (hasCallback && succeeded) {
            resolve(promise, value);
        } else if (failed) {
            reject(promise, error);
        } else if (settled === FULFILLED) {
            fulfill(promise, value);
        } else if (settled === REJECTED) {
            reject(promise, value);
        }
    }

    function initializePromise(promise, resolver) {
        try {
            resolver(function resolvePromise(value) {
                resolve(promise, value);
            }, function rejectPromise(reason) {
                reject(promise, reason);
            });
        } catch (e) {
            reject(promise, e);
        }
    }

    var id = 0;
    function nextId() {
        return id++;
    }

    function makePromise(promise) {
        promise[PROMISE_ID] = id++;
        promise._state = undefined;
        promise._result = undefined;
        promise._subscribers = [];
    }

    function Enumerator$1(Constructor, input) {
        this._instanceConstructor = Constructor;
        this.promise = new Constructor(noop);

        if (!this.promise[PROMISE_ID]) {
            makePromise(this.promise);
        }

        if (isArray(input)) {
            this.length = input.length;
            this._remaining = input.length;

            this._result = new Array(this.length);

            if (this.length === 0) {
                fulfill(this.promise, this._result);
            } else {
                this.length = this.length || 0;
                this._enumerate(input);
                if (this._remaining === 0) {
                    fulfill(this.promise, this._result);
                }
            }
        } else {
            reject(this.promise, validationError());
        }
    }

    function validationError() {
        return new Error('Array Methods must be provided an Array');
    }

    Enumerator$1.prototype._enumerate = function (input) {
        for (var i = 0; this._state === PENDING && i < input.length; i++) {
            this._eachEntry(input[i], i);
        }
    };

    Enumerator$1.prototype._eachEntry = function (entry, i) {
        var c = this._instanceConstructor;
        var resolve$$1 = c.resolve;

        if (resolve$$1 === resolve$1) {
            var _then = getThen(entry);

            if (_then === then && entry._state !== PENDING) {
                this._settledAt(entry._state, i, entry._result);
            } else if (typeof _then !== 'function') {
                this._remaining--;
                this._result[i] = entry;
            } else if (c === Promise$2) {
                var promise = new c(noop);
                handleMaybeThenable(promise, entry, _then);
                this._willSettleAt(promise, i);
            } else {
                this._willSettleAt(new c(function (resolve$$1) {
                    return resolve$$1(entry);
                }), i);
            }
        } else {
            this._willSettleAt(resolve$$1(entry), i);
        }
    };

    Enumerator$1.prototype._settledAt = function (state, i, value) {
        var promise = this.promise;

        if (promise._state === PENDING) {
            this._remaining--;

            if (state === REJECTED) {
                reject(promise, value);
            } else {
                this._result[i] = value;
            }
        }

        if (this._remaining === 0) {
            fulfill(promise, this._result);
        }
    };

    Enumerator$1.prototype._willSettleAt = function (promise, i) {
        var enumerator = this;

        subscribe(promise, undefined, function (value) {
            return enumerator._settledAt(FULFILLED, i, value);
        }, function (reason) {
            return enumerator._settledAt(REJECTED, i, reason);
        });
    };

    /**
     @method all
     @static
     @param {Array} entries array of promises
     @param {String} label optional string for labeling the promise.
     Useful for tooling.
     @return {Promise} promise that is fulfilled when all `promises` have been
     fulfilled, or rejected if any of them become rejected.
     @static
     */
    function all$1(entries) {
        return new Enumerator$1(this, entries).promise;
    }

    /**
     @method race
     @static
     @param {Array} promises array of promises to observe
     Useful for tooling.
     @return {Promise} a promise which settles in the same way as the first passed
     promise to settle.
     */
    function race$1(entries) {
        /*jshint validthis:true */
        var Constructor = this;

        if (!isArray(entries)) {
            return new Constructor(function (_, reject) {
                return reject(new TypeError('You must pass an array to race.'));
            });
        } else {
            return new Constructor(function (resolve, reject) {
                var length = entries.length;
                for (var i = 0; i < length; i++) {
                    Constructor.resolve(entries[i]).then(resolve, reject);
                }
            });
        }
    }

    /**
     @method reject
     @static
     @param {Any} reason value that the returned promise will be rejected with.
     Useful for tooling.
     @return {Promise} a promise rejected with the given `reason`.
     */
    function reject$1(reason) {
        /*jshint validthis:true */
        var Constructor = this;
        var promise = new Constructor(noop);
        reject(promise, reason);
        return promise;
    }

    function needsResolver() {
        throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function needsNew() {
        throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    /**
     @class Promise
     @param {function} resolver
     Useful for tooling.
     @constructor
     */
    function Promise$2(resolver) {
        this[PROMISE_ID] = nextId();
        this._result = this._state = undefined;
        this._subscribers = [];

        if (noop !== resolver) {
            typeof resolver !== 'function' && needsResolver();
            this instanceof Promise$2 ? initializePromise(this, resolver) : needsNew();
        }
    }

    Promise$2.all = all$1;
    Promise$2.race = race$1;
    Promise$2.resolve = resolve$1;
    Promise$2.reject = reject$1;
    Promise$2._setScheduler = setScheduler;
    Promise$2._setAsap = setAsap;
    Promise$2._asap = asap;

    Promise$2.prototype = {
        constructor: Promise$2,
        /*
         @method then
         @param {Function} onFulfilled
         @param {Function} onRejected
         Useful for tooling.
         @return {Promise}
         */
        then: then,

        /**
         @method catch
         @param {Function} onRejection
         Useful for tooling.
         @return {Promise}
         */
        'catch': function _catch(onRejection) {
            return this.then(null, onRejection);
        }
    };

    /*global self*/
    function polyfill$1() {
        var local = undefined;

        if (typeof global !== 'undefined') {
            local = global;
        } else if (typeof self !== 'undefined') {
            local = self;
        } else {
            try {
                local = Function('return this')();
            } catch (e) {
                throw new Error('polyfill failed because global object is unavailable in this environment');
            }
        }

        var P = local.Promise;

        if (P) {
            var promiseToString = null;
            try {
                promiseToString = Object.prototype.toString.call(P.resolve());
            } catch (e) {
                // silently ignored
            }

            if (promiseToString === '[object Promise]' && !P.cast) {
                return;
            }
        }

        local.Promise = Promise$2;
    }

// Strange compat..
    Promise$2.polyfill = polyfill$1;
    Promise$2.Promise = Promise$2;

    return Promise$2;

};

var ES6Promise = promiseFun();
var Promise = ES6Promise.Promise;
var Deferred = function() {
    this.promise = new Promise((function(resolve, reject) {
        this.resolve = resolve;
        this.reject = reject;
    }).bind(this));

    this.then = this.promise.then.bind(this.promise);
    this.catch = this.promise.catch.bind(this.promise);
};



var getJSON = function (param) {
    if(!param.type){
        param.type = 'GET';
    }
    if(!param.dataType){
        param.dataType = 'json';
    }
    return new Promise(function(resolve, reject){
        var xhr = new XMLHttpRequest();
        //针对某些特定的版本的mozilla浏览器的BUG进行修正
        if(xhr.overrideMimeType){
            xhr.overrideMimeType("text/html");
        }
        xhr.open(param.type, param.url);
        xhr.onreadystatechange = handler;
        xhr.responseType = 'text';

        if(param.type.toUpperCase() == 'GET'){
            xhr.setRequestHeader("Content-Type","text/plain; charset=utf-8");
        }
        if(param.type.toUpperCase() == 'POST'){
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }

        xhr.send(param.data);
        function handler() {
            if (this.readyState === this.DONE) {
                if (this.status === 200) {
                    var results = this.responseText;
                    if(param.dataType == 'json' && typeof(results) == 'string'){
                        results = JSON.parse(results);
                    }
                    resolve(results);
                } else {
                    reject(new Error('getJSON: ' + param.url + ' failed with status: [' + this.status + ']'));
                }
            }
        };
    });
}


var getParamJSON = function (param) {
    if(!param.type){
        param.type = 'GET';
    }
    if(!param.dataType){
        param.dataType = 'json';
    }

    var xhr = new XMLHttpRequest();
    var promise =  new Promise(function(resolve, reject){
        //针对某些特定的版本的mozilla浏览器的BUG进行修正
        if(xhr.overrideMimeType){
            xhr.overrideMimeType("text/html");
        }

        var timeout = 30000;
        var time = false;//是否超时
        var timer = setTimeout(function(){
            if(xhr.status != '200'){
                time = true;
                xhr.abort();//请求中止
            }
        },timeout);

        xhr.open(param.type, param.url);
        xhr.onreadystatechange = handler;
        xhr.responseType = 'text';
        if(param.type.toUpperCase() == 'GET'){
            xhr.setRequestHeader("Content-Type","text/plain; charset=utf-8");
        }
        if(param.type.toUpperCase() == 'POST'){
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }
        xhr.send(param.data);
        function handler() {
            if(time) {
                reject({param:param,data:'getParamJSON: ' + param.url + ' timeout'});
                return;//忽略中止请求
            }

            if (this.readyState === this.DONE) {
                if (this.status === 200) {
                    var results = this.responseText;
                    if(param.dataType == 'json' && typeof(results) == 'string'){
                        results = JSON.parse(results);
                    }
                    resolve({param:param,data:results});
                } else {
                    reject({param:param,data:'getParamJSON: ' + param.url + ' failed with status: [' + this.status + ']'});
                }
            }
        };
    });

    promise.xhr = xhr;
    return promise;
}

module.exports = {
    Promise: Promise,
    Deferred: Deferred,
    getJSON: getJSON,
    getParamJSON:getParamJSON
};
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":28}],26:[function(require,module,exports){


const _quadrant_left = 1;
const _quadrant_left_bottom = 2;
const _quadrant_bottom = 3;
const _quadrant_right_bottom = 4;
const _quadrant_right = 5;
const _quadrant_right_top = 6;
const _quadrant_top = 7;
const _quadrant_left_top = 8;
const _inner = 9;

const _save = 1;
const _question = 2;
const _out = 3;

class BoxSet {
    constructor(left,right,bottom,top,base,bufferPercent) {
        if (bufferPercent == null) {
            bufferPercent = 5;
        }
        let buffer = base * 5 /100;
        this.left = left - buffer;
        this.right = right + buffer;
        this.bottom = bottom - buffer;
        this.top = top + buffer;
        this.previous = BoxSet.createEmptyDoubleArray();
        this.now = BoxSet.createEmptyDoubleArray();
        this.question = BoxSet.createEmptyDoubleArray();
        this.point_previous_quadrant = -1;
        this.point_now_quadrant = -1;
        this.point_question_quadrant = -1;

    }

    static createEmptyDoubleArray() {
        return [NaN,NaN];
    }

    copy(form ,to){
        to[0] = form[0];
        to[1] = form[1];
    }

    static isEmpty(array){
        if(array == null){
            return true;
        }
        if(isNaN(array[0]) || isNaN(array[1])){
            return true;
        }else{
            return false;
        }
    }

    isQuadrant(point){
        let x = point[0];
        let y = point[1];

        if(x < this.left){
            if(y > this.top){
                return _quadrant_left_top;
            }
            if( y < this.bottom){
                return _quadrant_left_bottom;
            }else{
                return _quadrant_left;
            }
        }
        if(x > this.right){
            if(y > this.top){
                return _quadrant_right_top;
            }
            if(y < this.bottom){
                return _quadrant_right_bottom;
            }else{
                return _quadrant_right;
            }
        }else{
            if(y > this.top){
                return _quadrant_top;
            }
            if(y < this.bottom){
                return _quadrant_bottom;
            }else{
                return _inner;
            }
        }
    }

    passrule(point_previous_quadrant,point_now_quadrant){
        if(point_previous_quadrant == 1){
            if(point_now_quadrant == 1 || point_now_quadrant == 2 || point_now_quadrant == 8){
                return _question;
            }else{
                return _save;
            }
        }
        if(point_previous_quadrant == 2){
            if(point_now_quadrant == 1 || point_now_quadrant == 2 || point_now_quadrant == 8 || point_now_quadrant == 3 || point_now_quadrant == 4){
                return _question;
            }else{
                return _save;
            }
        }
        if(this.point_previous_quadrant == 3){
            if(this.point_now_quadrant == 2 || this.point_now_quadrant == 3 || this.point_now_quadrant == 4){
                return _question;
            }else{
                return _save;
            }
        }
        if(point_previous_quadrant == 4){
            if(point_now_quadrant == 2 || point_now_quadrant == 3 || point_now_quadrant == 4 || point_now_quadrant == 5 || point_now_quadrant == 6){
                return _question;
            }else{
                return _save;
            }
        }
        if(point_previous_quadrant == 5){
            if(point_now_quadrant == 4 || point_now_quadrant == 5 || point_now_quadrant == 6){
                return _question;
            }else{
                return _save;
            }
        }
        if(point_previous_quadrant == 6){
            if(point_now_quadrant == 4 || point_now_quadrant == 5 || point_now_quadrant == 6|| point_now_quadrant == 7|| point_now_quadrant == 8){
                return _question;
            }else{
                return _save;
            }
        }
        if(point_previous_quadrant == 7){
            if(point_now_quadrant == 6 ||point_now_quadrant == 7 || point_now_quadrant == 8){
                return _question;
            }else{
                return _save;
            }
        }
        if(point_previous_quadrant == 8){
            if(point_now_quadrant == 6 || point_now_quadrant == 7 || point_now_quadrant == 8|| point_now_quadrant == 1|| point_now_quadrant == 2){
                return _question;
            }else{
                return _save;
            }
        }
        if(point_previous_quadrant == 9){
            return _save;
        }else{
            return _save;
        }
    }

    reset(){
        this.previous[0] = NaN;
        this.previous[1] = NaN;
        this.question[0] = NaN;
        this.question[1] = NaN;
        this.now[0] = NaN;
        this.now[1] = NaN;
        this.point_previous_quadrant = -1;
        this.point_now_quadrant = -1;
        this.point_question_quadrant = -1;
    }

    in(now){
        if(now[0] <	this.left || now[0] > this.right){
            return false;
        }
        if(now[1] < this.bottom || now[1] > this.top){
            return false;
        }
        return true;
    }


    static length( x0, y0, x1, y1){
        let dx = x1 - x0;
        let dy = y1 - y0;
        let len = Math.sqrt(dx * dx + dy * dy);
        return len;
    }


    push(x, y){

        this.now[0] = x;
        this.now[1] = y;
        if(BoxSet.isEmpty(this.previous)){
            this.copy(this.now, this.previous);
            this.point_previous_quadrant = this.isQuadrant(this.now);
            return [this.now];
        }else{
            this.point_now_quadrant = this.isQuadrant(this.now);
            let passrule = this.passrule(this.point_previous_quadrant,this.point_now_quadrant);
            if(passrule == _save){

                this.point_previous_quadrant = this.isQuadrant(this.now);
                this.copy(this.now, this.previous);
                if(!BoxSet.isEmpty(this.question)){
                    let returnPoint = [];
                    this.copy(this.question,returnPoint);

                    this.question = BoxSet.createEmptyDoubleArray();

                    return [returnPoint,this.now];
                }else{
                    return [this.now];
                }


            }
            if(passrule == _question){
                //如果存疑，则需要和存疑点比对
                if(!BoxSet.isEmpty(this.question)){
                    //point_question_quadrant = this.isQuadrant(question);
                    passrule = this.passrule(this.point_question_quadrant,this.point_now_quadrant);
                    if(passrule == _save){
                        let returnPoint = [];
                        this.copy(this.question,returnPoint);
                        this.question = BoxSet.createEmptyDoubleArray();
                        return [returnPoint,this.now];
                    }
                    if(passrule == _question){

                    }
                }
                this.copy(this.now, this.question);
                this.point_question_quadrant = this.point_now_quadrant;
                return null;
            }else{
                return null;
            }
        }
    }
}
module.exports = exports = BoxSet;

},{}],27:[function(require,module,exports){
/**
 * Created by matt on 2017/7/16.
 */
//几个像素可以算是命中
let _dis =  3;

class GisTools{
    static pointDistToLine(x, y, startx, starty, endx, endy) {
        let se =  (startx - endx) * (startx - endx) + (starty - endy) * (starty - endy);
        let p = ((x - startx) * (endx - startx) + (y - starty) * (endy - starty));
        let r = p / se;
        let outx = startx + r * (endx - startx);
        let outy = starty + r * (endy - starty);
        let des = Math.sqrt((x - outx) * (x - outx) + (y - outy) * (y - outy));

        //console.log(des);
        return des;
    }
    static isPointOnSegment(px,py,p1x,p1y,p2x,p2y) {

        if ((px - _dis > p1x && px + _dis > p2x) || (px + _dis < p1x && px - _dis < p2x)) {
            return 0;
        }
        if ((py - _dis > p1y && py + _dis > p2y) || (py + _dis < p1y && py - _dis < p2y)) {
            return 0;
        }
        let d = GisTools.pointDistToLine(px,py,p1x,p1y,p2x,p2y);
        if(d < _dis){
            return 1;
        }else{
            return 0;
        }
    }
    static pointInLine(px,py, polyline) {
        let flag = 0;
        let line = [];
        if(Array.isArray(polyline[0])) {
            line = polyline;
        }else{
            line.push(polyline);
        }
        for(var polyIndex = 0 ; polyIndex < line.length ; polyIndex++){
            let subpoly = line[polyIndex];
            let length = subpoly.length / 2;
           // for (var i = 0, l = length, j = l - 1; i < l; j = i, i++) {

            for (var i = 0; i < length - 1 ; i++) {
                let j;
                j = i + 1;
                let sx = subpoly[2 * i],
                    sy = subpoly[2 * i + 1],
                    tx = subpoly[2 * j],
                    ty = subpoly[2 * j + 1]
                if(GisTools.isPointOnSegment(px,py,sx,sy,tx,ty) == 1){
                    return 1;
                }else{

                }
            }
        }
        return 0;
    }
    static pointInPolygon(px,py, polygen) {
        let flag = 0;
        let poly = [];
        if(Array.isArray(polygen[0])) {
            poly = polygen;
        }else{
            poly.push(polygen);
        }

        for(var polyIndex = 0 ; polyIndex < poly.length ; polyIndex++){
            let subpoly = poly[polyIndex];
            let length = subpoly.length / 2;


            for (var i = 0, l = length, j = l - 1; i < l; j = i, i++) {
                let sx = subpoly[2 * i],
                    sy = subpoly[2 * i + 1],
                    tx = subpoly[2 * j],
                    ty = subpoly[2 * j + 1]

                // 点与多边形顶点重合
                if ((sx === px && sy === py) || (tx === px && ty === py)) {
                    return 1
                }

                // 判断线段两端点是否在射线两侧
                if ((sy < py && ty >= py) || (sy >= py && ty < py)) {
                    // 线段上与射线 Y 坐标相同的点的 X 坐标
                    let x = sx + (py - sy) * (tx - sx) / (ty - sy)

                    // 点在多边形的边上
                    if (x === px) {
                        return 1
                    }
                    if (x > px) {
                        flag = !flag
                    }
                }
            }
        }
        return flag ? 1 : 0;

    }

    static lineIntersects(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
        var denominator,
            a,
            b,
            numerator1,
            numerator2,
            onLine1= false,
            onLine2= false,
            res = [null, null];

        denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
        if (denominator === 0) {
            if(res[0] !== null && res[1] !== null) {
                return res;
            } else {
                return false;
            }
        }
        a = line1StartY - line2StartY;
        b = line1StartX - line2StartX;
        numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
        numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
        a = numerator1 / denominator;
        b = numerator2 / denominator;

        // if we cast these lines infinitely in both directions, they intersect here:
        res[0] = line1StartX + (a * (line1EndX - line1StartX));
        res[1] = line1StartY + (a * (line1EndY - line1StartY));


        // if line2 is a segment and line1 is infinite, they intersect if:
        if (b > 0 && b < 1) {
            return res;
        }
        else {
            return false;
        }
    }

    /**
     * 判断两个poly的关系
     * @param polyOut
     * @param polyIn
     * @returns {1,相交，2包涵，3，没关系}
     */
    static polyWith(polyOut, polyIn) {
        let lengthOut = polyOut.length / 2;
        let lengthIn = polyIn.length / 2;
        let flag = false;
        let bY;
        let aX;
        let aY;
        let bX;
        let dY;
        let cX;
        let cY;
        let dX;
        for (let i = 0; i < lengthOut; i++) {

            if (i != lengthOut - 1) {
                aX = polyOut[(i * 2)];
                aY = polyOut[(i * 2 + 1)];
                bX = polyOut[(i * 2 + 2)];
                bY = polyOut[(i * 2 + 3)];
            } else {
                aX = polyOut[(i * 2)];
                aY = polyOut[(i * 2 + 1)];
                bX = polyOut[0];
                bY = polyOut[1];
            }
            for (let j = 0; j < lengthIn; j++) {

                if (j != lengthIn - 1) {
                    cX = polyIn[(j * 2)];
                    cY = polyIn[(j * 2 + 1)];
                    dX = polyIn[(j * 2 + 2)];
                    dY = polyIn[(j * 2 + 3)];
                } else {
                    cX = polyIn[(j * 2)];
                    cY = polyIn[(j * 2 + 1)];
                    dX = polyIn[0];
                    dY = polyIn[1];
                }

                if (GisTools.lineIntersects(aX, aY, bX, bY, cX, cY, dX, dY) != false) {
                    return 1;
                }
            }
        }

        let firstX = polyIn[0];
        let firstY = polyIn[1];
        if (GisTools.pointInPolygon(firstX, firstY,  polyOut )) {
            return 2;
        }
        return 3;
    }

    /**
     * 把bbox转成double Array
     * @param left
     * @param bottom
     * @param right
     * @param top
     * @returns {Array}
     */
    static boxToPolyArr(left, bottom, right, top){
        let arr = [];
        arr.push(left);
        arr.push(bottom);

        arr.push(left);
        arr.push(top);

        arr.push(right);
        arr.push(top);

        arr.push(right);
        arr.push(bottom);

        arr.push(left);
        arr.push(bottom);

        return arr;
    }

    static getExtensionPoint(p1,p2,d){
        let xab = p2[0] - p1[0];
        let yab = p2[1] - p1[1];
        let xd = p2[0];
        let yd = p2[1];
        if(xab == 0){
            if(yab > 0){
                yd = p2[1] + d;
            }else{
                yd = p2[1] - d;
            }
        }else{
            let xbd = Math.sqrt((d * d)/((yab/xab) * (yab/xab) + 1));
            if (xab < 0) {
                xbd = -xbd
            }

            xd = p2[0] + xbd;
            yd = p2[1] + yab / xab * xbd;
        }
        return [xd,yd];
    }
}
module.exports = exports = GisTools;




},{}],28:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[5])(5)
});