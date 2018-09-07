/**
 * 版本类
 */
Custom = {};
Custom.Version = 'jssdk_bate@1 leaflet 1.1.9';

/**
 * 重写Attribution方法的options属性，去掉leaflet商标
 */
L.Control.Attribution.prototype.options={
    position: 'bottomright'
};

/**
 * 重写手势缩放的bug
 */
L.Map.TouchZoom.prototype._onTouchMove=(function(_super) {
    return function(e) {
        if (!e.touches || e.touches.length !== 2 || !this._zooming) { return; }

        var map = this._map,
            p1 = map.mouseEventToContainerPoint(e.touches[0]),
            p2 = map.mouseEventToContainerPoint(e.touches[1]),
            scale = p1.distanceTo(p2) / this._startDist;


        this._zoom = map.getScaleZoom(scale, this._startZoom)+1;

        if (!map.options.bounceAtZoomLimits && (
                (this._zoom < map.getMinZoom() && scale < 1) ||
                (this._zoom > map.getMaxZoom() && scale > 1))) {
            this._zoom = map._limitZoom(this._zoom);
        }

        if (map.options.touchZoom === 'center') {
            this._center = this._startLatLng;
            if (scale === 1) { return; }
        } else {
            // Get delta from pinch to center, so centerLatLng is delta applied to initial pinchLatLng
            var delta = p1._add(p2)._divideBy(2)._subtract(this._centerPoint);
            if (scale === 1 && delta.x === 0 && delta.y === 0) { return; }
            this._center = map.unproject(map.project(this._pinchStartLatLng, this._zoom).subtract(delta), this._zoom);
        }

        if (!this._moved) {
            map._moveStart(true);
            this._moved = true;
        }

        L.Util.cancelAnimFrame(this._animRequest);

        var moveFn = L.bind(map._move, map, this._center, this._zoom, {pinch: true, round: false});
        this._animRequest = L.Util.requestAnimFrame(moveFn, this, true);

        L.DomEvent.preventDefault(e);
    };
})(L.Map.TouchZoom.prototype._onTouchMove);


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