/**
 * Created by kongjian on 2017/9/26.
 * 前端绘制底图layer
 */
var GVMapGrid  = L.TileLayer.extend({
    //多个服务器url的域名，用于解决一个域名只有6条请求管线的限制
    urlArray:[],
    // 不带过滤条件的url
    sourceUrl: null,
    // 纹理图标集合
    textures: {},
    //瓦片队列
    tileQueue:[],
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


        this.gVMapGridUtil = new Custom.GVMapGridUtil();
        this.gVMapGridUtil.tileSize = this.tilesize;
        this.gVMapGridUtil.parseUrl(url);

        this._url = url +'&ratio='+this.ratio+'&tilesize='+this.tilesize+'&clientVersion='+Custom.Version;
        L.setOptions(this,options);
        this.hitDetection = options.hitDetection;
        this.on('tileunload', this._onTileRemove);
        this.on('tileload', this._onTileLoad);
        this.on('tileerror', this._onTileError);
    },

    onAdd: function () {
        if(this.control){
            this._url = this.sourceUrl +'&ratio='+this.ratio+'&tilesize='+this.tilesize+'&clientVersion='+Custom.Version+ '&control='+this.control;
        }
        if(this.controlId){
            this._url = this.sourceUrl +'&ratio='+this.ratio+'&tilesize='+this.tilesize+'&clientVersion='+Custom.Version+ '&controlId='+this.controlId;
        }

        this._initContainer();

        this._levels = {};
        this._tiles = {};

        var reqArr = this.gVMapGridUtil.loadStyle('layer');
        Promise.all(reqArr).then(function(){
            this._resetView();
            this._update();
        }.bind(this));
    },

    /**
     * 重写构造瓦片的方法
     */
    createTile: function (coords, done) {
        //从队列中取canvas，避免频繁创建canvas
        var tile = this.tileQueue.pop();
        if(!tile){
            tile = this.initTile();
        }else{
            this._cleanTile(tile);
        }

        var url = this.getTileUrl(coords);

        Custom.getJSON({url:url,dataType:'json'})
            .then(function(data) {
                    tile.data = data;
                    this._tileOnLoad.apply(this, [done,tile]);
            }.bind(this),
              function(error){
                  this._tileOnError.apply(this, [done, tile,error]);
              }.bind(this));

        return tile;
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
     *  初始化canvas
     */
    initTile:function(){
        // console.time('initTile');
        var tile = document.createElement("canvas");
        tile.style.width = this.tilesize + "px";
        tile.style.height = this.tilesize + "px";
        tile.width = this.tilesize;
        tile.height = this.tilesize;

        var ctx = tile.getContext("2d",{isQuality:true});
        tile.ctx = ctx;
        // console.timeEnd('initTile');
        return tile;
    },

    //移除瓦片
    _onTileRemove: function (e) {
        //加入到瓦片队列
        this.tileQueue.push(e.tile);
    },

    /**
     *  重写，取消请求的操作
     */
    _abortLoading: function () {
        var i, tile;
        for (i in this._tiles) {
            if (this._tiles[i].coords.z !== this._tileZoom) {
                tile = this._tiles[i].el;

                if (!tile.complete) {
                    L.DomUtil.remove(tile);
                }
            }
        }
    },

    _onTileLoad:function(item){
        var tile = item.tile;
        this._drawTile(tile,tile.data);
        tile.complete = true;
    },

    _onTileError:function(item){
        var tile = item.tile;
        tile.complete = true;
        this.tileQueue.push(tile);
    },

    _tileOnError: function (done, tile, e) {
        done(e, tile);
    },

    _drawTile:function(tile,features){
        // console.time('_drawTile');
        var ctx = tile.ctx;
        var level = Math.floor(this._map.getZoom());
        var holder = new DataHolder({
            layerDataMap:features,
            ctx:ctx,
            ratio:1,
            control:null,
            textures:this.gVMapGridUtil.textures,
            extent:{
                level:level
            }
        });
        this.gVMapGridUtil.styleFun.call({}, holder, level);
        // console.timeEnd('_drawTile');
    },

    _cleanTile:function(tile){
        tile.ctx.clearRect(0, 0, this.tilesize, this.tilesize);
    },

    /**
     * 设置过滤条件
     */
    setFilter:function(filter){
        if(!this._url ||  !filter || (filter.layers.length == 0 && filter.order.length == 0)){
            return;
        }

        this.gVMapGridUtil.setFilter(filter,function(result){
            if(result.isIE){
                this.controlId =result.id;
                this.setUrl(this.sourceUrl +'&ratio='+this.ratio+'&tilesize='+this.tilesize+'&clientVersion='+Custom.Version + '&controlId='+result.id);
            }else{
                this.control =result.id;
                this.setUrl(this.sourceUrl +'&ratio='+this.ratio+'&tilesize='+this.tilesize+'&clientVersion='+Custom.Version+ '&control='+result.id);
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

        this.gVMapGridUtil.pickupFeatures(row,col,level,tx,ty,this.control,this.controlId,function(features){
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
        var filter = this.gVMapGridUtil.CreateHighlightFilter(layerFeatures,style);
        //如果没有过滤任何要素
        if(filter.layers.length == 0){
            return;
        }

        style.color = style.color.replace('#','%23');
        if(!this.highlightLayer){
            //构造高亮图层
            var url = this.gVMapGridUtil.host + '/mapserver/vmap/'+this.gVMapGridUtil.servername+'/getMAP?x={x}&y={y}&l={z}'
                +'&styleId='+this.gVMapGridUtil.styleId;
            if(this.control){
                url = url + '&control='+this.control;
            }
            if(this.controlId){
                url = url + '&controlId='+this.controlId;
            }


            this.highlightLayer = new L.GXYZ(url,this.options);
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
     * 取消高亮
     */
    cancelHighlight:function(){
        if(this.highlightLayer){
            this._map.removeLayer(this.highlightLayer);
            this.highlightLayer = null;
        }
    }
})
module.exports = GVMapGrid;
