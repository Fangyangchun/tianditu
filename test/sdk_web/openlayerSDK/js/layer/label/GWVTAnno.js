/**
 * Created by kongjian on 2017/6/26.
 */
OpenLayers.Layer.GWVTAnno = OpenLayers.Class(OpenLayers.Layer, {
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
        this.canvasLayer = new Custom.CanvasLayer();
        this.canvasLayer.tileSize = this.tileSize;
        this.canvasLayer.hitDetection = this.hitDetection;
    },

    /**
     * 重写浏览器窗口缩放回调处理
     */
    onMapResize:function(){
        var size = this.map.getSize();
        this.canvasLayer.init(size.w,size.h,this.tileSize,this);
    },

    /**
     * 重写ol的layer的方法，改方法平移缩放时触发
     */
    moveTo: function(bounds, zoomChanged, dragging) {
        OpenLayers.Layer.prototype.moveTo.apply(this, arguments);
        var grid = this.getGrid(bounds);

        var maxExtent = this.map.getMaxExtent();
        this.canvasLayer.maxExtent = [maxExtent.left,maxExtent.bottom,maxExtent.right,maxExtent.top];
        this.canvasLayer.extent = [bounds.left,bounds.bottom,bounds.right,bounds.top];
        this.canvasLayer.res = this.map.getResolution();
        this.canvasLayer.requestLabelTiles(grid,zoomChanged);
        if(zoomChanged){
            this.canvasLayer.clean();
        }
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
            this.canvasLayer.changStart();
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