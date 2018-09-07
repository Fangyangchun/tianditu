/**
 * Created by kongjian on 2017/5/1.
 */
function Drawer(config){
    AbstractVTileProcess.apply(this,[config]);

    // if(config == null){
    //     return;
    // }
    if(config){
        this.ctx = config.ctx;
        this.shadowDatas = [];
        this.textures = config.textures;
    }


    this.draw = function(){
        if (this.featuresArr == null) {
            return;
        }
        this.process();
        for(var j = 0;j < this.shadowDatas.length ; j++){
            var shadowData = this.shadowDatas[j];
            this._drawShape(shadowData.data);
            this._processShadowEnd(shadowData.style);
        }
    }
    this._processShadowEnd = function(style){
        this.ctx.closePath();
        if(style['shadowColor']){
            this.ctx.globalAlpha = 1;
            this.ctx.fillStyle = style['shadowColor'];
            this.ctx.fill();
        }
    }


    this._drawShape = function(points) {
        var context = this.ctx;
        if (!points.length) {
            return;
        }

        context.beginPath();
        if(this.resize){
            context.moveTo(points[0]* this.ratio, points[1]* this.ratio);
            for (var i = 2, il = points.length; i < il; i += 2) {
                context.lineTo(points[i]* this.ratio, points[i + 1]* this.ratio);
            }
        }else{
            context.moveTo(points[0], points[1]);
            for (var i = 2, il = points.length; i < il; i += 2) {
                context.lineTo(points[i], points[i + 1]);
            }
        }
        context.closePath();
    }


    this._processFeature = function(gjson) {
        var style = this._filterByStyle(gjson);
        if (style == null) {
            return;
        }
        if (style.display == false) {
            return;
        }
        this._beginDraw();
        this._drawFeature(gjson,style);
    }
    this._beginDraw = function(){
        this.ctx.beginPath();
    }
    this._drawFeature = function(gjson,style){
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
        if(style.sparsity == null){


        }else {
            sparsity = parseFloat(style.sparsity);
        }
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

    }
   this._processShadow = function(components,style,type) {
        var len = components.length;
        for (var i = 0; i < len; i++) {
            var component = components[i];

            if (Array.isArray(component)) {
                if (component.length == 0) {
                    return;
                }
                if (Array.isArray(component[0])) {
                    this._processShadow(component);
                } else {
                    this._drawShadow(component, style, type);
                }
            }else{
                var PS = component.PS;
                this._drawShadow(PS, style, type);
            }
        }
    }

    this._drawShadow = function(points,style,type){
        var h = -3.5 ;
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
                if ((bx - ax) * (_a.y - ay) < (_a.x - ax) * (by - ay)) {
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
                    this.shadowDatas.push(shadowData);
                }
            }
        }
    }




    this._processPoint = function(points){

    }
    this._processLineString = function(components,sparsity) {
        if (Array.isArray(components[0])) {
            var len = components.length;
            for (var i = 0; i < len; i++) {
                var component = components[i];
                this._processLineString(component,sparsity);
            }
        } else {
            this._renderLinePath(components, false,sparsity);
        }
    }

    this._processLineStringEnd = function(style) {
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
            this.ctx.lineJoin = "round";
            this.ctx.lineCap = "butt";
        }
    }

    this._processPolygon = function(components,sparsity){
        if (Array.isArray(components[0])) {
            var len = components.length;
            for (var i = 0; i < len; i++) {
                var component = components[i];
                this._processPolygon(component,sparsity);
            }
        } else {
            this._renderLinePath(components, true , sparsity);
        }
    }

    this._processPolygonEnd = function(style){
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
                    this.ctx.lineWidth = style.strokeWidth * this.ratio;
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
            var texture = this.textures(textureId);
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


        if (typeof customeColor == "object" && customeColor['color'] != null) {

            this.ctx.fillStyle = customeColor['color'];
            this.ctx.globalAlpha = customeColor['opacity'];
            this.ctx.fill();
        }
    }


    this._isSavePoint = function(previous,now,next,sparsity){

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
    }

    this._renderLinePath = function(points,close,sparsity){
        //   sparsity = 2.5
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

                while (!this._isSavePoint(previous, now, next, sparsity * this.ratio)) {
                    gap = gap + 2;
                    now = [points[i + gap], points[i + 1 + gap]];
                    if (i + 2 + gap > len) {
                        next = null;
                    } else {
                        next = [points[i + 2 + gap], points[i + 3 + gap]];
                    }
                }
            }

            if(this.resize) {
                this.ctx.lineTo(now[0] * this.ratio , now[1] * this.ratio );
            }else{
                this.ctx.lineTo(now[0], now[1]);
            }
            previous = now;
            i = i + gap + 2;
        }
        if(close){
            if(this.resize){
                this.ctx.lineTo(points[0] * this.ratio , points[1] * this.ratio);
            }else{
                this.ctx.lineTo(points[0], points[1]);
            }
            this.ctx.closePath();
        }
    }

}