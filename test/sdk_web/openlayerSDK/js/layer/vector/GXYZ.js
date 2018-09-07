/**
 * Created by kongjian on 2017/7/3.
 */
OpenLayers.Layer.GXYZ = OpenLayers.Class(OpenLayers.Layer.XYZ, {
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
        this.url = url +'&ratio='+this.ratio+'&tilesize='+this.tilesize+'&clientVersion='+Custom.Version;
        this.gxyzUtil = new Custom.GXYZUtil();
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
            this.url = this.sourceUrl +'&ratio='+this.ratio+'&tilesize='+this.tilesize+'&clientVersion='+Custom.Version+ '&control='+this.control;
        }
        if(this.controlId){
            this.url = this.sourceUrl +'&ratio='+this.ratio+'&tilesize='+this.tilesize+'&clientVersion='+Custom.Version+ '&controlId='+this.controlId;
        }
        OpenLayers.Layer.XYZ.prototype.setMap.apply(this, arguments);
    },

    /**
     * 设置过滤条件
     */
    setFilter:function(filter){
        if(!this.url){
            return;
        }

        if(!filter || (filter.layers.length == 0 && filter.order.length == 0)){
            this.url = this.sourceUrl +'&ratio='+this.ratio+'&tilesize='+this.tilesize+'&clientVersion='+Custom.Version;
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
                this.url = this.sourceUrl +'&ratio='+this.ratio+'&tilesize='+this.tilesize+'&clientVersion='+Custom.Version+ '&controlId='+result.id;
            }else{
                this.control =result.id;
                this.url = this.sourceUrl +'&ratio='+this.ratio+'&tilesize='+this.tilesize+'&clientVersion='+Custom.Version+ '&control='+result.id;
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