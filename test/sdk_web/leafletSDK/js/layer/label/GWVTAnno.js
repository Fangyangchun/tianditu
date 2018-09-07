/**
 * Created by kongjian on 2017/6/26.
 * 前端注记避让并绘制layer
 */
L.GWVTAnno = L.Layer.extend({
    canvasLayer:null,
    currLevel:2,
    //是否允许拾取
    hitDetection:true,
    options: {
        tileSize:256
    },
    /**
     * 构造方法
     */
    initialize: function (options) {
        L.setOptions(this, options);
        if(this.options.hasOwnProperty('hitDetection')){
            this.hitDetection = this.options.hitDetection;
        }
        this.canvasLayer = new Custom.CanvasLayer();
        this.canvasLayer.tileSize = this.options.tileSize;
        this.canvasLayer.hitDetection = this.hitDetection;
    },

    /**
     * 图层被添加到地图中调用
     */
    onAdd: function () {
        //地图最大范围
        var maxExtent = this._map.options.crs.projection.bounds;
        this.canvasLayer.init(this._map._size.x,this._map._size.y,this.options.tileSize,this);
        this.canvasLayer.maxExtent = [maxExtent.min.x,maxExtent.min.y,maxExtent.max.x,maxExtent.max.y];
        this._container = this.canvasLayer.root;

        if (this._zoomAnimated) {
            L.DomUtil.addClass(this._container, 'leaflet-zoom-animated');
        }
        this.getPane().appendChild(this.canvasLayer.root);
        this._update();
    },

    /**
     * 注册事件
     */
    getEvents: function () {
        var events = {
            resize:this.onResize,
            movestart:this.onMoveStart,
            zoom: this._onZoom,
            moveend: this._update
        };

        if (this._zoomAnimated) {
            events.zoomanim = this._onAnimZoom;
        }
        return events;
    },

    /**
     * 浏览器窗口缩放事件
     */
    onResize:function(e){
        this.canvasLayer.init(this._map._size.x,this._map._size.y,this.options.tileSize,this);
        this._update();
    },

    _onAnimZoom: function (ev) {
        this.updateTransform(ev.center, ev.zoom);
    },

    _onZoom: function () {
        this.updateTransform(this._map.getCenter(), this._map.getZoom());
    },

    /**
     * 缩放时更新注记层的位置
     */
    updateTransform: function (center,zoom) {
        if(!this._zoom || !this._center){
            this._zoom = this._map.getZoom();
            this._center = this._map.getCenter();
        }

        var scale = this._map.getZoomScale(zoom, this._zoom),
            position = this.getCanvasXY(),
            viewHalf = this._map.getSize().multiplyBy(0.5),
            currentCenterPoint = this._map.project(this._center, zoom),
            destCenterPoint = this._map.project(center, zoom),
            centerOffset = destCenterPoint.subtract(currentCenterPoint),
            topLeftOffset = viewHalf.multiplyBy(-scale).add(position).add(viewHalf).subtract(centerOffset);
        if (L.Browser.any3d) {
            L.DomUtil.setTransform(this.canvasLayer.root, topLeftOffset, scale);
        } else {
            L.DomUtil.setPosition(this.canvasLayer.root, topLeftOffset);
        }
    },

    /**
     * 缩放，平移完成的回调
     */
    onMoveStart:function(){
        this.canvasLayer.changStart();
    },

    /**
     * 缩放，平移完成的回调
     */
    _update: function () {
        var map = this._map;
        if (!map || map._animatingZoom) {
            return;
        }

        //地图当前范围
        var bounds = map.getBounds();
        var pBounds = map.getPixelBounds();
        //地图当前分辨率
        var res = (bounds._northEast.lat - bounds._southWest.lat)/(pBounds.max.y - pBounds.min.y);
        //地图最大范围
        var maxExtent = map.options.crs.projection.bounds;

        //需要请求行列号
        var minRow = Math.floor((maxExtent.max.y - bounds._northEast.lat) /(res*this.options.tileSize));
        var maxRow = Math.ceil((maxExtent.max.y - bounds._southWest.lat)/(res*this.options.tileSize));
        var minCol = Math.floor((bounds._southWest.lng - maxExtent.min.x)/(res*this.options.tileSize));
        var maxCol = Math.ceil((bounds._northEast.lng - maxExtent.min.x)/(res*this.options.tileSize));

        var level = map._animatingZoom ? Math.max(map._animateToZoom, map.getZoom()) : map.getZoom();
        var zoomChanged = (this.currLevel != level);
        //发送请求
        var grid = this.getGrid(minRow,maxRow,minCol,maxCol,level);
        this.canvasLayer.extent = [bounds._southWest.lng,bounds._southWest.lat,bounds._northEast.lng,bounds._northEast.lat];
        this.canvasLayer.res = res;

        this.canvasLayer.requestLabelTiles(grid,zoomChanged);
        this.currLevel = level;
    },

    /**
     * 根据当前视口获取要请求的瓦片的行列号
     * Parameters (single argument):
     * bounds - 当前视口范围
     * Returns:
     * grid -  当前范围对应的瓦片层行列号
     */
    getGrid:function(minRow,maxRow,minCol,maxCol,level){
        var grid = [];
        for (var col = minCol; col < maxCol; col++) {
            for (var row = minRow; row < maxRow; row++) {
                grid.push({"row":row,"col":col,"level":level});
            }
        }
        return grid;
    },

    /**
     * 当图层缩放，平移后，更新canvas的位置
     * 考虑到它的位置信息存到了map中，不同的map sdk实现机制不一样
     * 所以考虑将该方法提到本类中
     */
    resetCanvasDiv :function(){
        var p = this.getCanvasXY();
        L.DomUtil.setPosition(this._container, p);
        this._center = this._map.getCenter();
        this._zoom = this._map.getZoom();
    },

    /**
     * 获取canvas的坐标
     */
    getCanvasXY:function(){
        if(!this._map){
            return;
        }
        var transform = this._map.dragging._draggable._element.style.transform;
        var offset = transform.match(/(-?\d+\.?\d*)(px)/g);

        var x =offset[0].replace('px','');
        var y =offset[1].replace('px','');
        return {x:-x,y:-y};
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

    onRemove: function (map) {
        L.DomUtil.remove(this.canvasLayer.root);
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