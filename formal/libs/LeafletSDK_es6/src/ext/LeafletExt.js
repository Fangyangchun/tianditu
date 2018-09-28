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
 * 重写flyTo函数，解决该函数产生的小数缩放级别的bug
 */
L.Map.prototype.flyTo=(function(_super) {
    return function(targetCenter, targetZoom, options) {
        options = options || {};
        if (options.animate === false || !L.Browser.any3d) {
            return this.setView(targetCenter, targetZoom, options);
        }

        this._stop();

        var from = this.project(this.getCenter()),
            to = this.project(targetCenter),
            size = this.getSize(),
            startZoom = this._zoom;

        targetCenter = L.latLng(targetCenter);
        targetZoom = targetZoom === undefined ? startZoom : targetZoom;

        var w0 = Math.max(size.x, size.y),
            w1 = w0 * this.getZoomScale(startZoom, targetZoom),
            u1 = (to.distanceTo(from)) || 1,
            rho = 1.42,
            rho2 = rho * rho;

        function r(i) {
            var s1 = i ? -1 : 1,
                s2 = i ? w1 : w0,
                t1 = w1 * w1 - w0 * w0 + s1 * rho2 * rho2 * u1 * u1,
                b1 = 2 * s2 * rho2 * u1,
                b = t1 / b1,
                sq = Math.sqrt(b * b + 1) - b;

            // workaround for floating point precision bug when sq = 0, log = -Infinite,
            // thus triggering an infinite loop in flyTo
            var log = sq < 0.000000001 ? -18 : Math.log(sq);

            return log;
        }

        function sinh(n) { return (Math.exp(n) - Math.exp(-n)) / 2; }
        function cosh(n) { return (Math.exp(n) + Math.exp(-n)) / 2; }
        function tanh(n) { return sinh(n) / cosh(n); }

        var r0 = r(0);

        function w(s) { return w0 * (cosh(r0) / cosh(r0 + rho * s)); }
        function u(s) { return w0 * (cosh(r0) * tanh(r0 + rho * s) - sinh(r0)) / rho2; }

        function easeOut(t) { return 1 - Math.pow(1 - t, 1.5); }

        var start = Date.now(),
            S = (r(1) - r0) / rho,
            duration = options.duration ? 1000 * options.duration : 1000 * S * 0.8;

        function frame() {
            var t = (Date.now() - start) / duration,
                s = easeOut(t) * S;

            if (t <= 1) {
                this._flyToFrame = L.Util.requestAnimFrame(frame, this);

                this._move(
                    this.unproject(from.add(to.subtract(from).multiplyBy(u(s) / u1)), startZoom),
                    this.getScaleZoom(w0 / w(s), startZoom),
                    {flyTo: true});

            } else {
                //增加这行，保证flyto完成后，地图的层级为整数
                targetZoom = Math.round(targetZoom);
                this
                    ._move(targetCenter, targetZoom)
                    ._moveEnd(true);
            }
        }

        this._moveStart(true);

        frame.call(this);
        return this;
    };
})(L.Map.prototype.flyTo);


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