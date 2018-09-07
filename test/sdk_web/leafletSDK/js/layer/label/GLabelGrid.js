/**
 * Created by kongjian on 2017/9/26.
 * 后端避让后的注记，前端绘制显示图层
 */
L.GLabelGrid  = L.TileLayer.extend({
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
    //瓦片大小
    tilesize:256,
    //过滤json对象
    control:null,
    //过滤的id
    controlId:null,
    //是否支持注记拾取
    hitDetection:false,
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

        this.gxyzUtil = new Custom.GXYZUtil();
        this.gxyzUtil.tileSize = this.tilesize;
        this.gxyzUtil.parseUrl(url);

        this._url = url +'&tilesize='+this.tilesize+'&clientVersion='+Custom.Version;
        L.setOptions(this,options);

        this.hitDetection = options.hitDetection;
        this.on('tileunload', this._onTileRemove);
        this.on('tileload', this._onTileLoad);
        this.on('tileerror', this._onTileError);
    },

    _initContainer: function () {
        if (this._container) { return; }

        this._container = L.DomUtil.create('div', 'leaflet-pane leaflet-overlay-pane');
        this.getPane().appendChild(this._container);
    },

    onAdd: function () {
        if(this.control){
            this._url = this.sourceUrl +'&tilesize='+this.tilesize+'&clientVersion='+Custom.Version+ '&control='+this.control;
        }
        if(this.controlId){
            this._url = this.sourceUrl +'&tilesize='+this.tilesize+'&clientVersion='+Custom.Version+ '&controlId='+this.controlId;
        }

        this._initContainer();

        this._levels = {};
        this._tiles = {};

        //请求图标纹理
        Custom.getJSON({url:this.gxyzUtil.host+ '/mapserver/styleInfo/'+this.gxyzUtil.servername+'/'+this.gxyzUtil.styleId+'/label/texture.js',dataType:'text'}).then(function(result){
            var textures = JSON.parse(result);
            var totalCount = 0;
            for(var i in textures){
                totalCount++;
            }

            if(totalCount == 0){
                this._resetView();
                this._update();
            }

            var count = 0;
            for(var key in textures){
                var img = new Image();
                img.name = key;
                img.onload = function(data) {
                    count++;
                    var name = data.target.name;
                    this.textures[name] =data.target;
                    if(count == totalCount){
                        this._resetView();
                        this._update();
                    }
                }.bind(this);
                img.src = textures[key];
            }
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

        if(this.hitDetection){
            var canvas = document.createElement("canvas");
            canvas.style.width = this.tilesize + "px";
            canvas.style.height = this.tilesize + "px";
            canvas.width = this.tilesize;
            canvas.height = this.tilesize;
            var hitCtx = canvas.getContext("2d",{isQuality:true});
            tile.hitCtx = hitCtx;
        }
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

                // if (!tile.complete) { // 是否要缩放时，注记放大效果
                    L.DomUtil.remove(tile);
                // }
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
        var hitCtx = tile.hitCtx;
        var featureIdMap = {};
        for(var i = 0;i<features.length;i++){
            var feature = features[i];
            //画点注记
            if(feature.type == 1){
                feature.id = Math.round(Math.random()*256*256*256);
                featureIdMap[feature.id] = feature;
                Custom.GDrawGeomerty.drawPointIcon(ctx,tile.hitCtx, this.hitDetection, feature,this.textures);
                Custom.GDrawGeomerty.drawPoint(ctx,tile.hitCtx, this.hitDetection,feature);
                continue;
            }
            //画线注记
            if(feature.type == 2){
                Custom.GDrawGeomerty.drawLine(ctx,feature);
            }
        }

        //用于拾取查找
        tile.featureIdMap = featureIdMap;
        // console.timeEnd('_drawTile');
    },

    _cleanTile:function(tile){
        tile.ctx.clearRect(0, 0, this.tilesize, this.tilesize);
        if(tile.hitCtx){
            tile.hitCtx.clearRect(0, 0, this.tilesize, this.tilesize);
        }
    },

    /**
     * 根据屏幕坐标获取feature
     * Parameters :
     * x
     * y
     */
    getFeatureByXY : function(x,y) {
        var feature = null;
        if (this.hitDetection) {
            var featureId;

            var latLng = this._map.containerPointToLatLng(new L.point(x,y));
            var maxBounds = this._map.options.crs.projection.bounds;
            //地图当前范围
            var bounds = this._map.getBounds();
            var pBounds = this._map.getPixelBounds();
            //地图当前分辨率
            var res = (bounds._northEast.lat - bounds._southWest.lat)/(pBounds.max.y - pBounds.min.y);

            var tileSize = this.tilesize;
            var row = (maxBounds.max.y - latLng.lat) /(res*tileSize);
            var col = (latLng.lng - maxBounds.min.x)/(res*tileSize);
            var frow = Math.floor(row);
            var fcol = Math.floor(col);
            var level = this._map.getZoom();

            var tile = this._tiles[fcol+':'+frow+':'+level].el;

            var tx = (col - fcol)*tileSize;
            var ty = (row - frow)*tileSize;
            var data = tile.hitCtx.getImageData(tx, ty, 1, 1).data;
            if (data[3] === 255) { // antialiased
                var id = data[2] + (256 * (data[1] + (256 * data[0])));
                if (id) {
                    featureId = id - 1 ;
                    try {
                        feature = tile.featureIdMap[featureId];
                    } catch(err) {
                    }
                }
            }
        }
        return feature;
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
                this.controlId = result.id;
                this.setUrl(this.sourceUrl +'&tilesize='+this.tilesize+'&clientVersion='+Custom.Version + '&controlId='+result.id);
            }else{
                this.control = result.id;
                this.setUrl(this.sourceUrl +'&tilesize='+this.tilesize+'&clientVersion='+Custom.Version+ '&control='+result.id);
            }
        }.bind(this));
    }
})