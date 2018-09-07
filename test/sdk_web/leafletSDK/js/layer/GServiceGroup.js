/**
 * Created by kongjian on 2017/6/26.
 */
Custom.GServiceGroup =function(layerId, url, map, options) {
    this.map = null;
    this.layer = null;
    this.label = null;
    this.layerType = 0;
    this.labelType = 2;
    this.map = map;
    this.url = url;
    this.layerId = layerId;
    this.styleId = null;
    this.tileSize = 256;
    this.addServiceGroup = function () {
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
    this.addBaseLayer = function() {
        this.layer = new L.GXYZ(
                this.url + "&x={x}&y={y}&l={z}&tileType=" + this.layerType,
                {sphericalMercator: false, isBaseLayer: false,tileSize:this.tileSize}
        );
        this.map.addLayer(this.layer);
        
    };
    /*前端底图*/
    this.addFrontBaseLayer = function(){
        this.layer = new L.GVMapGrid(
                this.url + "&x={x}&y={y}&l={z}&tileType=" + this.layerType,
                {maxZoom: 21,keepBuffer:0,updateWhenZooming:false,tileSize:this.tileSize}
        );
        this.map.addLayer(this.layer);
    }
//////////////////////////////////////////////////////////////////////////

    /*后端注记绘制*/
    this.AddImgLabel = function(){
        this.label = new L.GXYZ(
                this.url + "&x={x}&y={y}&l={z}&tileType=" + this.labelType,
                {sphericalMercator: false, isBaseLayer: false,tileSize:this.tileSize}
        );
        this.map.addLayer(this.label);
    }
    /*后端注记避让*/
    this.addAvoidLabel = function(url) {
        this.label = new L.GLabelGrid(
            this.url + '&x={x}&y={y}&l={z}&tileType=' + this.labelType,
            {hitDetection:true,keepBuffer:0,updateWhenZooming:false,tileSize:this.tileSize}
        );
        this.map.addLayer(this.label);
       
    };
    /*前端*/
    this.addFrontLabel = function(url) {
        this.label = new L.GWVTAnno("GWVTanno",{tileSize:this.tileSize});

        var dataSource = new Custom.URLDataSource();
        dataSource.url = this.url+'&x=${x}&y=${y}&l=${z}&tileType='+this.labelType;
        this.label.addDataSource(dataSource);
        this.map.addLayer(this.label);
    };

    this.setLayerType = function (layerType) {
        if(layerType == "Img"){
            this.layerType = 0;
        }else if(layerType == "Data"){
            this.layerType = 1;
        }
    };

    this.setLabelType = function (labelType) {
        if(labelType == "Data"){
            this.labelType = 2;
        }else if(labelType == "Img"){
            this.labelType = 3;
        }else if(labelType == "AvoidImg"){
            this.labelType = 4;
        }
    };
    this.setTileSize = function(tileSize) {
        this.tileSize = tileSize;
    };
    this.getLayer = function () {
        return this.layer;
    };

    this.getLabel = function () {
        return this.label;
    };

    this.removeGroupLayer = function () {
        if(this.layer){
            this.map.removeLayer(this.layer);
        }
        if(this.label){
            this.map.removeLayer(this.label);
        }
    };
}