/**
 * Created by kongjian on 2017/6/26.
 */
class GServiceGroup{
    constructor(layerId, url, map, options) {
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
    addBaseLayer() {
        this.layer = new L.GXYZ(
            this.url + "&x={x}&y={y}&l={z}&tileType=" + this.layerType,
            {sphericalMercator: false, isBaseLayer: false,tileSize:this.tileSize}
        );
        this.map.addLayer(this.layer);

    };
    /*前端底图*/
    addFrontBaseLayer(){
        this.layer = new L.GVMapGrid(
            this.url + "&x={x}&y={y}&l={z}&tileType=" + this.layerType,
            {maxZoom: 21,keepBuffer:0,updateWhenZooming:false,tileSize:this.tileSize}
        );
        this.map.addLayer(this.layer);
    }
//////////////////////////////////////////////////////////////////////////

    /*后端注记绘制*/
    AddImgLabel(){
        this.label = new L.GXYZ(
            this.url + "&x={x}&y={y}&l={z}&tileType=" + this.labelType,
            {sphericalMercator: false, isBaseLayer: false,tileSize:this.tileSize}
        );
        this.map.addLayer(this.label);
    }
    /*后端注记避让*/
    addAvoidLabel(url) {
        this.label = new L.GLabelGrid(
            this.url + '&x={x}&y={y}&l={z}&tileType=' + this.labelType,
            {hitDetection:true,keepBuffer:0,updateWhenZooming:false,tileSize:this.tileSize}
        );
        this.map.addLayer(this.label);

    };
    /*前端*/
    addFrontLabel(url) {
        this.label = new L.GWVTAnno("GWVTanno",{tileSize:this.tileSize});

        var dataSource = new Custom.URLDataSource();
        dataSource.url = this.url+'&x=${x}&y=${y}&l=${z}&tileType='+this.labelType;
        this.label.addDataSource(dataSource);
        this.map.addLayer(this.label);
    };

    setLayerType(layerType) {
        if(layerType == "Img"){
            this.layerType = 0;
        }else if(layerType == "Data"){
            this.layerType = 1;
        }
    };

    setLabelType(labelType) {
        if(labelType == "Data"){
            this.labelType = 2;
        }else if(labelType == "Img"){
            this.labelType = 3;
        }else if(labelType == "AvoidImg"){
            this.labelType = 4;
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