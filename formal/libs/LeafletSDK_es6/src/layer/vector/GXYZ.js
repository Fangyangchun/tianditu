/**
 * Created by kongjian on 2017/7/3.
 * 后端绘制底图layer
 */
const GXYZUtil = require('./draw/GXYZUtil');
const Version = require('../../ext/Version');
var GXYZ  = L.TileLayer.extend({
    //多个服务器url的域名，用于解决一个域名只有6条请求管线的限制
    urlArray:[],
    // 不带过滤条件的url
    sourceUrl: null,
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
    initialize: function(url, options) {
        if(window.devicePixelRatio > 1.5){
            this.ratio = 2;
        }

        if(!this.sourceUrl){
            this.sourceUrl = url;
        }

        if(options &&options.tileSize){
            this.tilesize = options.tileSize;
        }

        this.gxyzUtil = new GXYZUtil();
        this.gxyzUtil.tileSize = this.tilesize;
        this.gxyzUtil.parseUrl(url);

        this._url = url +'&ratio='+this.ratio+'&tilesize='+this.tilesize+'&clientVersion='+Version;
        L.setOptions(this,options);
    },

    onAdd: function () {
        if(this.control){
            this._url = this.sourceUrl +'&ratio='+this.ratio+'&tilesize='+this.tilesize+'&clientVersion='+Version+ '&control='+this.control;
        }
        if(this.controlId){
            this._url = this.sourceUrl +'&ratio='+this.ratio+'&tilesize='+this.tilesize+'&clientVersion='+Version+ '&controlId='+this.controlId;
        }

        this._initContainer();

        this._levels = {};
        this._tiles = {};

        this._resetView();
        this._update();
    },

    /**
     * 获取url的方法
     */
    getTileUrl: function (coords) {
        var data = {
            r: L.Browser.retina ? '@2x' : '',
            s: this._getSubdomain(coords),
            x: coords.x,
            y: coords.y,
            z: this._getZoomForUrl()
        };
        if (this._map && !this._map.options.crs.infinite) {
            var invertedY = this._globalTileRange.max.y - coords.y;
            if (this.options.tms) {
                data['y'] = invertedY;
            }
            data['-y'] = invertedY;
        }

        if(this.urlArray.length == 0){
            return L.Util.template(this._url, L.extend(data, this.options));
        }else{
            //从urlArray中随机取出一个url
            var len = this.urlArray.length-1;
            var index = Math.round(Math.random()*len);
            var url = this.urlArray[index];

            var array = this._url.split('/mapserver');
            var partUrl = array[1];
            url = url + '/mapserver'+partUrl;
            return L.Util.template(url, L.extend(data, this.options));
        }
    },

    /**
     * 设置过滤条件
     */
    setFilter:function(filter){
        if(!this._url ||  !filter || (filter.layers.length == 0 && filter.order.length == 0)){
            return;
        }

        this.gxyzUtil.setFilter(filter,function(result){
            if(result.isIE){
                this.controlId =result.id;
                this.setUrl(this.sourceUrl +'&ratio='+this.ratio+'&tilesize='+this.tilesize+'&clientVersion='+Version + '&controlId='+result.id);
            }else{
                this.control =result.id;
                this.setUrl(this.sourceUrl +'&ratio='+this.ratio+'&tilesize='+this.tilesize+'&clientVersion='+Version+ '&control='+result.id);
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
        var latLng = this._map.containerPointToLatLng(new L.point(x,y));
        this.getFeatureByLonlat(latLng,callback);
    },

    /**
     * 根据地理坐标获取拾取到的要素
     * Parameters :
     * lonlat - 地理坐标对象
     * callback - 拾取成功的回调函数
     */
    getFeatureByLonlat:function(latLng,callback){
        var maxBounds = this._map.options.crs.projection.bounds;
        //地图当前范围
        var bounds = this._map.getBounds();
        var pBounds = this._map.getPixelBounds();
        //地图当前分辨率
        var res = (bounds._northEast.lat - bounds._southWest.lat)/(pBounds.max.y - pBounds.min.y);

        var tileSize = this.options.tileSize;
        var row = (maxBounds.max.y - latLng.lat) /(res*tileSize);
        var col = (latLng.lng - maxBounds.min.x)/(res*tileSize);

        var level = this._map.getZoom();
        var tx = (col - Math.floor(col))*tileSize;
        var ty = (row - Math.floor(row))*tileSize;

        this.gxyzUtil.pickupFeatures(row,col,level,tx,ty,this.control,this.controlId,function(features){
            callback(features);
        });
    },

    /**
     * 根据指定的样式高亮要素
     * Parameters :
     * layerFeatures - 要素map集合
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
            this.highlightLayer = new L.GXYZ(this.sourceUrl,this.options);
            this._map.addLayer(this.highlightLayer);
        }

        this.highlightLayer.options.opacity = style.opacity;
        this.highlightLayer._updateOpacity();
        //设置高亮过滤条件
        this.highlightLayer.setFilter(filter);
        //获取当前图层的index
        var index = this.options.zIndex;
        //设置高亮图层在当前底图图层之上
        this.highlightLayer.setZIndex(index+1);
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
            this.highlightLayer = new L.GXYZ(this.sourceUrl,this.options);
            this._map.addLayer(this.highlightLayer);
        }

        this.highlightLayer.options.opacity = opacity;
        this.highlightLayer._updateOpacity();
        //设置高亮过滤条件
        this.highlightLayer.setFilter(filter);
        //获取当前图层的index
        var index = this.options.zIndex;
        //设置高亮图层在当前底图图层之上
        this.highlightLayer.setZIndex(index+1);
    },


    /**
     * 取消高亮
     */
    cancelHighlight:function(){
        if(this.highlightLayer){
            this._map.removeLayer(this.highlightLayer);
            this.highlightLayer = null;
        }
    }
})

module.exports = GXYZ;