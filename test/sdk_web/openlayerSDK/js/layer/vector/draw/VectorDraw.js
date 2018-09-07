
/**
 * 属性获得器
 */
var PropertyGetter = function PropertyGetter(propertyConfig) {
    var this$1 = this;


    this.propertyConfig = {};

    for(var i = 0 ;i < propertyConfig.length; i ++){
        if(propertyConfig[i].id == 'true' || propertyConfig[i].id == true){

            this$1.idIndex = propertyConfig[i].index;
        }
        this$1.propertyConfig[propertyConfig[i].name] = parseInt(propertyConfig[i].index);
    }
};;
PropertyGetter.prototype.get = function get (data, propertyName){

    var value = data[this.propertyConfig[propertyName]];
    return value;


};;
PropertyGetter.prototype.getId = function getId (data){
    return data[this.idIndex];
};


var AbstractDataHolder = function AbstractDataHolder(config,drawerCalss) {

    this.layerDataMap = config.layerDataMap;
    this.extent = config.extent;
    this.ctx = config.ctx;
    this.ratio = config.ratio;
    this.control = config.control;
    this.drawerCalss = drawerCalss;
    this.config = config;
};

AbstractDataHolder.prototype._emptyDrawer = function _emptyDrawer (styleLayerID){
    var drawer = new this.drawerCalss(null);
    return drawer;
};

AbstractDataHolder.prototype.getLayer = function getLayer (dataLayerID,styleLayerID){
    if(styleLayerID == null){
        styleLayerID = dataLayerID;
    }

    if(null == this.layerDataMap){
        return this._emptyDrawer(styleLayerID);
    }


    //判断其他图层是否显示Control otherDisplay,如果是其他图层不显示，则需要在这里处理
    if(this.control != null) {
        //  console.log(this.control.controlObj.otherDisplay);
        if (this.control.controlObj.otherDisplay == false) {
            if (this.control.controlObj.controlLayersArr.indexOf(styleLayerID) == -1) {
                return this._emptyDrawer(styleLayerID);
            }
        }
    }


    var data = this.layerDataMap[dataLayerID];

    if(data == null){
        return this._emptyDrawer(styleLayerID);
    }else{
        //修正一个十分傻逼的错误,好吧，我英语不好
        if(data.datas){
            data.features = data.datas;
        }

        if(data.features == null){
            return this._emptyDrawer(styleLayerID);
        }
        var propertyGetter = null;
        if(null !== data.fieldsConfig){
            propertyGetter = new PropertyGetter(data.fieldsConfig);
        }

        this.config['dataLayerID'] = dataLayerID;
        this.config['styleLayerID'] = styleLayerID;
        this.config['propertyGetter'] = propertyGetter;
        this.config['control'] = this.control;


        var drawer = new this.drawerCalss(this.config);



        if(!Array.isArray(data.features)){
            for(var index in data.features){
                drawer.addFeatures(data.features[index]);
            }
        }else {
            drawer.addFeatures(data.features);
        }
        return drawer;
    }
};

AbstractDataHolder.prototype.getGroupLayer = function getGroupLayer (dataLayerID,value,styleLayerID){

    if(this.layerDataMap == null){
        return this._emptyDrawer(styleLayerID);
    }
    if(styleLayerID == null){
        styleLayerID = dataLayerID;
    }
    //判断其他图层是否显示Control otherDisplay,如果是其他图层不显示，则需要在这里处理
    if(this.control != null) {
        //  console.log(this.control.controlObj.otherDisplay);
        if (this.control.controlObj.otherDisplay == false) {
            if (this.control.controlObj.controlLayersArr.indexOf(styleLayerID) == -1) {
                return this._emptyDrawer(styleLayerID);
            }
        }
    }

    var data = this.layerDataMap[dataLayerID];
    if(this.layerDataMap == null){
        return this._emptyDrawer(styleLayerID);
    }
    if(data == null){
        return this._emptyDrawer(styleLayerID);
    }
    if(data.datas == null && data.data == null ){
        return this._emptyDrawer(styleLayerID);
    }

    var valueArr = value.split(',');
    var length = valueArr.length;
    if(length == 0){
        return this._emptyDrawer(styleLayerID);
    }
    var propertyGetter = null;
    if(data.fieldsConfig != null){
        propertyGetter = new PropertyGetter(data.fieldsConfig);
    }
    this.config['dataLayerID'] = dataLayerID;
    this.config['styleLayerID'] = styleLayerID;
    this.config['propertyGetter'] = propertyGetter;
    this.config['control'] = this.control;


    var drawer = new this.drawerCalss(this.config);

    if(data.data == null){
        data.features = data.datas;
    }else{
        data.features = data.data;
    }
    for(var i = 0 ; i < length ; i ++){
        var dataArr = data.features[valueArr[i]]
        if(dataArr == null){
            continue;
        }
        drawer.addFeatures(dataArr);
    }
    return drawer;
};


var AbstractVTileProcess = function AbstractVTileProcess(config) {
    if(config == null){
        return;
    }
    //放数据的容器
    this.featuresArr = [];
    //属性构造器
    this.propertyGetter = config.propertyGetter;
    //网格
    this.extent = config.extent;
    /**
     * 缩放比例
     * @type {*|number}
     */
    this.ratio = config.ratio;
    this.resize = false;
    if(this.ratio != 1){
        this.resize = true;
    }
    /**
     * 等级
     */
    this.level = this.extent.level;
    /**
     * 数据层级ID
     */
    this.dataLayerID = config.dataLayerID;
    /**
     * 样式层级ID
     */
    this.styleLayerID = config.styleLayerID;
    /**
     * 过滤器
     * @type {*|null}
     */
    this.control = config.control;
};

/**
 * 加入处理数据
 * @param features
 */
AbstractVTileProcess.prototype.addFeatures = function addFeatures (features){
    this.featuresArr.push(features);
};

/**
 * 加入处理样式
 * @param fn
 */
AbstractVTileProcess.prototype.setStyle = function setStyle (fn){
    this.styleOperator = fn;
};


/**
 *处理
 */
AbstractVTileProcess.prototype.process = function process (){
        var this$1 = this;

    var queryFilter = null;


    if (this.featuresArr == null) {
        return;
    }
    var length = this.featuresArr.length;
    if (length == 0) {
        return;
    }
    for (var i = 0; i < length; i++) {
        var features = this$1.featuresArr[i];
        this$1._processFeatures(features);
    }


};



AbstractVTileProcess.prototype._processFeature = function _processFeature (gjson){
    throw "抽象方法"
};

AbstractVTileProcess.prototype._processFeatures = function _processFeatures (features) {
        var this$1 = this;

    for (var i = 0; i < features.length; i++) {
        var gjson = features[i];
        this$1._processFeature(gjson);
    }
    return;
};

AbstractVTileProcess.prototype._getProperty = function _getProperty (data){
    return data[1];
};

AbstractVTileProcess.prototype._getPoints = function _getPoints (data){
    return data[2];
};
AbstractVTileProcess.prototype._getType = function _getType (data){
    return data[0];
};
AbstractVTileProcess.prototype._filterByStyle = function _filterByStyle (gjson) {
    var type = this._getType(gjson);
    var points = this._getPoints(gjson);
    var property = this._getProperty(gjson);
    if(points == null){
        throw "绘制失败,数据中缺少Geometry";
    }
    if(type == null){
        type = "POLYGON";
    }
    var controlRes = null;
    if(this.styleOperator == null){
        return null;
    }else {
        this.propertyGetter;
        var id = this.propertyGetter.getId(property);
        var _propertyGetter = this.propertyGetter;
        var get = function(fieldName){
            return _propertyGetter.get(property,fieldName);
        }
        if(this.control) {
            if(typeof this.control.controlFn == "function") {
                controlRes = this.control.controlFn.call({}, id, get, this.styleLayerID);
                //console.log(controlRes);
                if (controlRes == false || controlRes == null) {
                    return {
                        display:false
                    };
                }
            }
        }
        var style = this.styleOperator.call({},this.level,get);
        //   } catch (e) {
        //    throw e;
        //}
    }
    if(style == null){
        return null;
    }
    if(style.display != null){
        if (style.display == false) {
            return {
                display:false
            };
        }
    }

    if(controlRes != null) {
        style.customeColor = controlRes;
    }
    return style;
};



var default_style = {
    "fillColor":"#F5F3F0","fillOpacity":1
}


var BackgroundDrawer = function BackgroundDrawer(level,ctx,propertyGetter,scale,name) {


    if(level == null){
        this.datasArr = null;
        return;
    }
    this.scale = scale;
    this.datasArr = [];
    this.level = level;
    this.ctx = ctx;
    this.propertyGetter = propertyGetter;
    if(this.scale == null){
        this.scale = 1;
    }
    if(this.scale != 1) {
        this.resize = true;
    }else{
        this.resize = false;
    }
    this.name = name;
    /**
     * 样式队列
     * @type {Array}
     */
    this.styleFn = null;
    this.drawable = false;
};
BackgroundDrawer.prototype.getName = function getName (){
    return this.name;
};

/**
 * 加入样式队列
 * @param fn
 */
BackgroundDrawer.prototype.setStyle = function setStyle (fn){
    this.styleFn = fn;
};


BackgroundDrawer.prototype.draw = function draw (){
    this.drawable = true
    this.doDraw();

};

/**
 * 绘制
 */
BackgroundDrawer.prototype.doDraw = function doDraw (layerFilter) {
    if(this.drawable) {
        var style = null;
        style = this.styleFn.call({}, this.level);



        if(style.backgroundColor) {
            this.ctx.fillStyle = style.backgroundColor;
        }
        if(style.fillOpacity) {
            this.ctx.globalAlpha = style.fillOpacity;
        }else{
            this.ctx.globalAlpha = 1;
        }

        this.ctx.fillRect(0, 0, 256 * this.scale, 256 * this.scale);
    }



};

/**
 * Created by matt on 2017/7/10.
 */

var DataHolder = (function (AbstractDataHolder) {
    function DataHolder(config) {
        AbstractDataHolder.call(this, config,Drawer);
    }

    if ( AbstractDataHolder ) DataHolder.__proto__ = AbstractDataHolder;
    DataHolder.prototype = Object.create( AbstractDataHolder && AbstractDataHolder.prototype );
    DataHolder.prototype.constructor = DataHolder;

    DataHolder.prototype.getBackground = function getBackground (){
        /*var backgroundDrawer = new BackgroundDrawer({
            extent:this.extent,
            ctx:this.ctx,
            ratio:this.ratio
        })*/
        var backgroundDrawer = new BackgroundDrawer(this.extent.level,this.ctx,null,this.ratio);
        return backgroundDrawer;
    };
    DataHolder.prototype.getWatermark = function getWatermark (){

    };

    return DataHolder;
}(AbstractDataHolder));

var Drawer = (function (AbstractVTileProcess) {
    function Drawer(config){
        AbstractVTileProcess.call(this, config);
        if(config == null){
            return;
        }
        this.ctx = config.ctx;
        this.shadowDatas = [];
    }

    if ( AbstractVTileProcess ) Drawer.__proto__ = AbstractVTileProcess;
    Drawer.prototype = Object.create( AbstractVTileProcess && AbstractVTileProcess.prototype );
    Drawer.prototype.constructor = Drawer;
    /*_processFeatures(features){
        debugger
    }*/

    Drawer.prototype.draw = function draw (){
        var this$1 = this;

        if (this.featuresArr == null) {
            return;
        }
        this.process();
        for(var j = 0;j < this.shadowDatas.length ; j++){
            var shadowData = this$1.shadowDatas[j];
            this$1._drawShape(shadowData.data);
            this$1._processShadowEnd(shadowData.style);
        }
    };
    Drawer.prototype._processShadowEnd = function _processShadowEnd (style){
        this.ctx.closePath();
        if(style['shadowColor']){
            this.ctx.globalAlpha = 1;
            this.ctx.fillStyle = style['shadowColor'];
            this.ctx.fill();
        }
    };


    Drawer.prototype._drawShape = function _drawShape (points) {
        var this$1 = this;

        var context = this.ctx;
        if (!points.length) {
            return;
        }

        context.beginPath();
        if(this.resize){
            context.moveTo(points[0]* this.scale, points[1]* this.scale);
            for (var i = 2, il = points.length; i < il; i += 2) {
                context.lineTo(points[i]* this$1.scale, points[i + 1]* this$1.scale);
            }
        }else{
            context.moveTo(points[0], points[1]);
            for (var i = 2, il = points.length; i < il; i += 2) {
                context.lineTo(points[i], points[i + 1]);
            }
        }
        context.closePath();
    };


    Drawer.prototype._processFeature = function _processFeature (gjson) {
        var style = this._filterByStyle(gjson);
        if (style == null) {
            return;
        }
        if (style.display == false) {
            return;
        }
        this._beginDraw();
        this._drawFeature(gjson,style);
    };
    Drawer.prototype._beginDraw = function _beginDraw (){
        this.ctx.beginPath();
    };
    Drawer.prototype._drawFeature = function _drawFeature (gjson,style){
        var type = this._getType(gjson);
        var points = this._getPoints(gjson);
        var property = this._getProperty(gjson);
        if(points == null){
            throw "绘制失败,数据中缺少Geometry";
        }
        if(type == null){
            type = "POLYGON";
        }
        var sparsity = null;
        sparsity = parseFloat(style.sparsity);
        switch (type) {
            case "PT":
                this._processPoint(points);
                break;
            case "LINESTRING":
                this._processLineString(points,sparsity);
                this._processLineStringEnd(style);
                break;
            case "MULTILINESTRING":
                this._processLineString(points,sparsity);
                this._processLineStringEnd(style);
                break;
            case "MULTIPOLYGON":
                this._processPolygon(points,sparsity);
                this._processPolygonEnd(style);
                break;
            case "POLYGON":
                this._processPolygon(points,sparsity);
                this._processPolygonEnd(style);
                break;
            default:
                break;
        }
        if(style['shadowColor']){
            this._processShadow(points,style,type);
        }

    };
    Drawer.prototype._processShadow = function _processShadow (components,style,type) {
        var this$1 = this;

        var len = components.length;
        for (var i = 0; i < len; i++) {
            var component = components[i];

            if (Array.isArray(component)) {
                if (component.length == 0) {
                    return;
                }
                if (Array.isArray(component[0])) {
                    this$1._processShadow(component);
                } else {
                    this$1._drawShadow(component, style, type);
                }
            }else{
                var PS = component.PS;
                this$1._drawShadow(PS, style, type);
            }
        }
    };

    Drawer.prototype._drawShadow = function _drawShadow (points,style,type){
        var this$1 = this;

        var h =3.5;
        if(type == 'MULTIPOLYGON' || type =='POLYGON'){
            for(var i = 0; i < points.length - 3; i += 2){
                var _a = {};
                var _b = {};
                _a.x = points[i];
                _a.y = points[i + 1];
                _b.x = points[i + 2];
                _b.y = points[i + 3];

                var ax = _a.x;
                var ay =  _a.y+h;
                var bx = _b.x ;
                var by = _b.y+h;
                if ((bx - ax) * (_a.y - ay) > (_a.x - ax) * (by - ay)) {
                    // this._drawShape([
                    //     bx , by ,
                    //     ax , ay ,
                    //     _a.x, _a.y,
                    //     _b.x, _b.y
                    // ],true);
                    // this._processShadowEnd(style);
                    var shadowData = {};
                    shadowData.data = [
                        bx , by ,
                        ax , ay ,
                        _a.x, _a.y,
                        _b.x, _b.y
                    ];
                    shadowData.style =style;
                    this$1.shadowDatas.push(shadowData);
                }
            }
        }
    };




    Drawer.prototype._processPoint = function _processPoint (points){

    };
    Drawer.prototype._processLineString = function _processLineString (components,sparsity) {
        var this$1 = this;

        if (Array.isArray(components[0])) {
            var len = components.length;
            for (var i = 0; i < len; i++) {
                var component = components[i];
                this$1._processLineString(component, false,sparsity);
            }
        } else {
            this._renderLinePath(components, false,sparsity);
        }
    };

    Drawer.prototype._processLineStringEnd = function _processLineStringEnd (style) {
        var stroke = true;

        if (style.stroke == false) {
            stroke = false;
        }
        if (stroke != false) {
            if (this.resize) {
                this.ctx.lineWidth = style.strokeWidth * this.ratio;
            }else{
                this.ctx.lineWidth = style.strokeWidth;
            }
            this.ctx.strokeStyle = style.strokeColor;
            this.ctx.globalAlpha = style.strokeOpacity;
            if (style.dash != null) {
                this.ctx.setLineDash(style.dash);
            }
            if (style.lineCap) {
                this.ctx.lineCap = style.lineCap;
            }
            this.ctx.stroke();

            var customeColor = style['customeColor'];

            if (typeof customeColor == "object" && customeColor['color'] != null) {
                this.ctx.strokeStyle = customeColor['color'];
                this.ctx.globalAlpha = customeColor['opacity'];
                this.ctx.stroke();
            }
            this.ctx.setLineDash([])
            this.ctx.lineJoin = "miter";
            this.ctx.lineCap = "butt";
        }
    };

    Drawer.prototype._processPolygon = function _processPolygon (components,sparsity){
        var this$1 = this;

        if (Array.isArray(components[0])) {
            var len = components.length;
            for (var i = 0; i < len; i++) {
                var component = components[i];
                this$1._processLineString(component, true,sparsity);
            }
        } else {
            this._renderLinePath(components, true , sparsity);
        }
    };

    Drawer.prototype._processPolygonEnd = function _processPolygonEnd (style){
        var stroke = false;
        var fill = false;
        if (style.stroke == true) {
            stroke = true;
        }
        if(style.fill == true){
            fill = true;
        }
        if (fill) {
            if(style['fillColor']) {
                this.ctx.fillStyle = style['fillColor'];
            }
            if(style['fillOpacity']) {
                this.ctx.globalAlpha = style['fillOpacity'];
            }else{
                this.ctx.globalAlpha = 1;
            }
            this.ctx.fill();
        }
        if (stroke) {
            if(style['strokeWidth']) {

                if(this.resize){
                    this.ctx.lineWidth = style.strokeWidth * this.scale;
                }else{
                    this.ctx.lineWidth = style.strokeWidth;
                }
            }
            if(style['strokeColor']) {
                this.ctx.strokeStyle = style['strokeColor'];
            }
            if(style['strokeOpacity']) {
                this.ctx.globalAlpha = style['strokeOpacity'];
            }else{
                this.ctx.globalAlpha = 1;
            }
            this.ctx.stroke();
        }
        if(style['texture']){
            var textureId = style['texture'];
            var texture = TextureManager.getTxture(textureId);
            if(texture != null){
                var ratio = style['textureratio'];
                if(ratio == null){

                }
                var pat = this.ctx.createPattern(texture.toPattern(ratio),"repeat");
                this.ctx.fillStyle = pat;
                this.ctx.fill();
            }
        }
        var customeColor = style['customeColor'];
        if(customeColor){
            this.ctx.fillStyle = customeColor['color'];
            this.ctx.globalAlpha = customeColor['opacity'];
            this.ctx.fill();
        }
    };


    Drawer.prototype._isSavePoint = function _isSavePoint (previous,now,next,sparsity){

        if(previous == null || next == null){
            return true;
        }
        var dx = now[0] - previous[0];
        var dy = now[1] - previous[1];
        var dx1 = next[0] - now[0];
        var dy1 = next[1] - now[1];

        if(Math.sqrt(dx * dx + dy * dy) < sparsity && Math.sqrt(dx1 * dx1 + dy1 * dy1) < sparsity){
            return false
        }else{
            return true;
        }
    };

    Drawer.prototype._renderLinePath = function _renderLinePath (points,close,sparsity){
        var this$1 = this;

        if(this.resize){
            this.ctx.moveTo(points[0] * this.ratio , points[1] * this.ratio);
        }else{
            this.ctx.moveTo(points[0], points[1]);
        }

        var i = 2;
        var len = points.length;
        if(len % 2 != 0){
            len = len - 1;
        }
        var previous = [points[0],points[1]];
        var now = null;
        var next = null;
        while(i < len){

            var gap = 0;
            now = [points[i], points[i + 1]];
            if(sparsity != null) {
                if (i + 2 > len) {
                    next = null;
                } else {
                    next = [points[i + 2], points[i + 3]];
                }

                while (!this._isSavePoint(previous, now, next,sparsity)) {
                    gap = gap + 2;
                    now = [points[i + gap], points[i + 1 + gap]];
                    if (i + 2 + gap > len) {
                        next = null;
                    } else {
                        next = [points[i + 2 + gap], points[i + 3 + gap]];
                    }
                }
            }

            if(this$1.resize) {
                this$1.ctx.lineTo(now[0] * this$1.ratio , now[1] * this$1.ratio );
            }else{
                this$1.ctx.lineTo(now[0], now[1]);
            }
            previous = now;
            i = i + gap + 2;
        }
        if(close){
            this.ctx.closePath();
        }
    };

    return Drawer;
}(AbstractVTileProcess));

