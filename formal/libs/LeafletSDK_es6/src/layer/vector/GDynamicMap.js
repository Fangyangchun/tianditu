/**
 * Created by kongjian on 2017/9/26.
 * 前端绘制底图layer
 */
const GVMapGrid = require('./GVMapGrid');
const GVMapGridUtil = require('./draw/GVMapGridUtil');
var GDynamicMap  = GVMapGrid.extend({
    // styleObj对象
    styleObj: {},
    //sytle的js形式，为字符串
    styleJs:null,
    initialize: function(url, options) {
        options.isDynamicMap = true;
        if(window.devicePixelRatio > 1.5){
            this.ratio = 2;
        }

        if(!this.sourceUrl){
            this.sourceUrl = url;
        }

        if(options &&options.tileSize){
            this.tilesize = options.tileSize;
        }


        this.gVMapGridUtil = new Custom.GVMapGridUtil(options.isDynamicMap);
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

        this.gVMapGridUtil.setStyle(this.styleObj);

        var reqArr = this.gVMapGridUtil.loadStyle('layer');
        Promise.all(reqArr).then(function(){
            this._resetView();
            this._update();
        }.bind(this));
    },

    addLevels:function(gLevels){
        this.styleObj[gLevels.levelsKey] = gLevels.levelsData;
    },

    redraw: function () {
        this.gVMapGridUtil.formatStyle(this.styleObj,function(){
            if (this._map) {
                this._removeAllTiles();
                this._update();
            }
        })
        return this;
    }
})

module.exports = GDynamicMap;