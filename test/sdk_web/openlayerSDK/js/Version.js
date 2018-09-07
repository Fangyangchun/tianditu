var Custom = {};
Custom.Version = 'jssdk_bate@1 openLayers 1.1.9';
/**
 * 重写move方法，解决拖动注记抖动的bug
 */
OpenLayers.Kinetic.prototype.move =(function(_super) {
    return function() {
        var args = Array.prototype.slice.call(arguments);
        var callback = function(x, y, end){
            if(end){
                x = Math.round(x);
                y = Math.round(y);
            }
            args[1](x,y,end);
        };
        _super.apply(this, [args[0],callback]);
    };
})(OpenLayers.Kinetic.prototype.move);

/**
 * 重写down方法，解决拖动地图过程中，地图有时不发请求的bug
 */
OpenLayers.Handler.Drag.prototype.down = function(evt){
    if(this.map.dragging){
        this.map.setCenter(this.map.getCenter());
        this.map.dragging = false;
    }
};

/**
 * 重写shouldDraw方法，解决图层重绘时，报指针的bug
 */
OpenLayers.Tile.prototype.shouldDraw =(function(_super) {
    return function() {
         if(!this.layer){
            return false;
        }
       return _super.apply(this);
    };
})(OpenLayers.Tile.prototype.shouldDraw);

/**
 * 如果是ie浏览器，则增加startsWith和endsWith方法
 */
if (!!window.ActiveXObject || "ActiveXObject" in window) {
    String.prototype.startsWith = function (str) {

        if (str == null || str == "" || this.length == 0 || str.length > this.length)
            return false;
        if (this.substr(0, str.length) == str)
            return true;
        else
            return false;
        return true;
    };

    String.prototype.endsWith = function(str) {
        if (!!window.ActiveXObject || "ActiveXObject" in window) {
            return this.indexOf(str, this.length - str.length) !== -1;
        }else{
            return this.endsWith(str);
        }
    };
}



