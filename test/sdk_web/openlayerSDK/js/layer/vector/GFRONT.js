/**
 * Created by lz on 2017/7/28.
 */
OpenLayers.Layer.GFRONT = OpenLayers.Class(OpenLayers.Layer.XYZ, {
    // 不带过滤条件的url
    sourceUrl: null,
    dataSource: null,
    options: {
        tileSize:256
    },
    initialize: function(name, url, options) {
        OpenLayers.Layer.XYZ.prototype.initialize.apply(this, [name, url, options]);
    },

    /**
     * 设置过滤条件
     */
    setFilter: function(filter) {
        if (!this.url || !filter || (filter.layers.length == 0 && filter.order.length == 0)) {
            return;
        }

        if (!this.sourceUrl) {
            this.sourceUrl = this.url;
        }

        var filterStr = '&control=';
        for (var i = 0; i < filter.layers.length; i++) {
            var filterLayer = filter.layers[i];
            if (!filterLayer.id) {
                filter.layers.splice(i, 1);
            }
        }

        var json = JSON.stringify(filter);
        filterStr = filterStr + json;
        this.url = this.sourceUrl + filterStr;
    },
    /**
     * Method: moveTo
     * This function is called whenever the map is moved. All the moving
     * of actual 'tiles' is done by the map, but moveTo's role is to accept
     * a bounds and make sure the data that that bounds requires is pre-loaded.
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     * zoomChanged - {Boolean}
     * dragging - {Boolean}
     */
    moveTo:function(bounds, zoomChanged, dragging) {

        OpenLayers.Layer.HTTPRequest.prototype.moveTo.apply(this, arguments);

        bounds = bounds || this.map.getExtent();

        if (bounds != null) {
             
            // if grid is empty or zoom has changed, we *must* re-tile
            var forceReTile = !this.grid.length || zoomChanged;
            
            // total bounds of the tiles
            var tilesBounds = this.getTilesBounds();            

            // the new map resolution
            var resolution = this.map.getResolution();

            // the server-supported resolution for the new map resolution
            var serverResolution = this.getServerResolution(resolution);

            if (this.singleTile) {
                
                // We want to redraw whenever even the slightest part of the 
                //  current bounds is not contained by our tile.
                //  (thus, we do not specify partial -- its default is false)

                if ( forceReTile ||
                     (!dragging && !tilesBounds.containsBounds(bounds))) {

                    // In single tile mode with no transition effect, we insert
                    // a non-scaled backbuffer when the layer is moved. But if
                    // a zoom occurs right after a move, i.e. before the new
                    // image is received, we need to remove the backbuffer, or
                    // an ill-positioned image will be visible during the zoom
                    // transition.

                    if(zoomChanged && this.transitionEffect !== 'resize') {
                        this.removeBackBuffer();
                    }

                    if(!zoomChanged || this.transitionEffect === 'resize') {
                        this.applyBackBuffer(resolution);
                    }

                    this.initSingleTile(bounds);
                }
            } else {

                // if the bounds have changed such that they are not even 
                // *partially* contained by our tiles (e.g. when user has 
                // programmatically panned to the other side of the earth on
                // zoom level 18), then moveGriddedTiles could potentially have
                // to run through thousands of cycles, so we want to reTile
                // instead (thus, partial true).  
                forceReTile = forceReTile ||
                    !tilesBounds.intersectsBounds(bounds, {
                        worldBounds: this.map.baseLayer.wrapDateLine &&
                            this.map.getMaxExtent()
                    });

                if(forceReTile) {
                    if(zoomChanged && (this.transitionEffect === 'resize' ||
                                          this.gridResolution === resolution)) {
                        this.applyBackBuffer(resolution);
                    }
                    var reqArr = this.getDatasource().loadStyle();
                    $.when(reqArr).then(function(){
                        this.initGriddedTiles(bounds);
                    }.bind(this));
                } else {
                    this.moveGriddedTiles();
                }
            }
        }
    },
    /**
     * Method: initGriddedTiles
     * 
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     */
    initGriddedTiles: function(bounds) {
        this.events.triggerEvent("retile");

        // work out mininum number of rows and columns; this is the number of
        // tiles required to cover the viewport plus at least one for panning

        var viewSize = this.map.getSize();

        var origin = this.getTileOrigin();
        var resolution = this.map.getResolution(),
            serverResolution = this.getServerResolution(),
            ratio = resolution / serverResolution,
            tileSize = {
                w: this.tileSize.w / ratio,
                h: this.tileSize.h / ratio
            };

        var minRows = Math.ceil(viewSize.h / tileSize.h) +
            2 * this.buffer + 1;
        var minCols = Math.ceil(viewSize.w / tileSize.w) +
            2 * this.buffer + 1;

        var tileLayout = this.calculateGridLayout(bounds, origin, serverResolution);
        this.gridLayout = tileLayout;

        var tilelon = tileLayout.tilelon;
        var tilelat = tileLayout.tilelat;

        var layerContainerDivLeft = this.map.layerContainerOriginPx.x;
        var layerContainerDivTop = this.map.layerContainerOriginPx.y;

        var tileBounds = this.getTileBoundsForGridIndex(0, 0);
        var startPx = this.map.getViewPortPxFromLonLat(
            new OpenLayers.LonLat(tileBounds.left, tileBounds.top)
        );
        startPx.x = Math.round(startPx.x) - layerContainerDivLeft;
        startPx.y = Math.round(startPx.y) - layerContainerDivTop;

        var tileData = [],
            center = this.map.getCenter();

        var rowidx = 0;
        do {
            var row = this.grid[rowidx];
            if (!row) {
                row = [];
                this.grid.push(row);
            }

            var colidx = 0;
            do {
                tileBounds = this.getTileBoundsForGridIndex(rowidx, colidx);
                var px = startPx.clone();
                px.x = px.x + colidx * Math.round(tileSize.w);
                px.y = px.y + rowidx * Math.round(tileSize.h);
                var tile = row[colidx];

                if (!tile) {
                    tile = this.addTile(tileBounds, px);
                    this.addTileMonitoringHooks(tile);
                    row.push(tile);
                } else {
                    tile.moveTo(tileBounds, px, false);
                }
                tile.setImgSrc = this.setImgSrc;

                var tileCenter = tileBounds.getCenterLonLat();
                tileData.push({
                    tile: tile,
                    distance: Math.pow(tileCenter.lon - center.lon, 2) +
                        Math.pow(tileCenter.lat - center.lat, 2)
                });

                colidx += 1;
            } while ((tileBounds.right <= bounds.right + tilelon * this.buffer) ||
                colidx < minCols);

            rowidx += 1;
        } while ((tileBounds.bottom >= bounds.bottom - tilelat * this.buffer) ||
            rowidx < minRows);

        //shave off exceess rows and colums
        this.removeExcessTiles(rowidx, colidx);

        var resolution = this.getServerResolution();
        // store the resolution of the grid
        this.gridResolution = resolution;

        //now actually draw the tiles
        tileData.sort(function(a, b) {
            return a.distance - b.distance;
        });
        for (var i = 0, ii = tileData.length; i < ii; ++i) {
            tileData[i].tile.draw(true);
        }
    },
    /**
     * Method: setImgSrc
     * Sets the source for the tile image
     *
     * Parameters:
     * url - {String} or undefined to hide the image
     */
    setImgSrc: function(url) {
        var img = this.imgDiv;
        if (url) {
            img.style.visibility = 'hidden';
            img.style.opacity = 0;
            // don't set crossOrigin if the url is a data URL
            if (this.crossOriginKeyword) {
                if (url.substr(0, 5) !== 'data:') {
                    img.setAttribute("crossorigin", this.crossOriginKeyword);
                } else {
                    img.removeAttribute("crossorigin");
                }
            }
            $.ajax( {
                url:url,
                context:this.layer,
                dataType:'jsonp',
                success:function(result) {
                    var paras = this.getParameters(url);
                    var control = null;
                    if(paras.control) {
                        control = JSON.parse(paras.control.join(','));
                    }
                    var canvas = document.createElement("canvas");
                    canvas.width = this.options.tileSize;
                    canvas.height = this.options.tileSize;
                    canvas.style.width = this.options.tileSize + "px";
                    canvas.style.height = this.options.tileSize + "px";
                    var ctx = canvas.getContext('2d');
                    var level = Math.floor(this.map.getZoom());
                    var holder = new DataHolder({
                        layerDataMap:result,
                        ctx:ctx,
                        ratio:1,
                        control:control,
                        extent:{
                            level:level
                        }
                    })
                    this.getDatasource().styleFun.call({}, holder, level);
                    img.src = ctx.canvas.toDataURL('image/png');
                }
            });
            //img.src = url;
        } else {
            // Remove reference to the image, and leave it to the browser's
            // caching and garbage collection.
            this.stopLoading();
            this.imgDiv = null;
            if (img.parentNode) {
                img.parentNode.removeChild(img);
            }
        }
    },
    getDatasource:function() {
        return this.dataSource;
    },
    setDatasource:function(dataSource) {
        this.dataSource = dataSource;

    },
    getParameters:function(url, options) {
        options = options || {};
        // if no url specified, take it from the location bar
        url = (url === null || url === undefined) ? window.location.href : url;

        //parse out parameters portion of url string
        var paramsString = "";
        if(url.indexOf('?') != -1) {
            var start = url.indexOf('?') + 1;
            var end = url.indexOf('#') != -1 ?
                url.indexOf('#') : url.length;
            paramsString = url.substring(start, end);
        }

        var parameters = {};
        var pairs = paramsString.split(/[&;]/);
        for(var i = 0, len = pairs.length; i < len; ++i) {
            var keyValue = pairs[i].split('=');
            if(keyValue[0]) {

                var key = keyValue[0];
                try {
                    key = decodeURIComponent(key);
                } catch(err) {
                    key = unescape(key);
                }

                // being liberal by replacing "+" with " "
                var value = (keyValue[1] || '').replace(/\+/g, " ");

                try {
                    value = decodeURIComponent(value);
                } catch(err) {
                    value = unescape(value);
                }

                // follow OGC convention of comma delimited values
                if(options.splitArgs !== false) {
                    value = value.split(",");
                }

                //if there's only one value, do not return as array                    
                if(value.length == 1) {
                    value = value[0];
                }

                parameters[key] = value;
            }
        }
        return parameters;
    },
    CLASS_NAME: "OpenLayers.Layer.GFRONT"
});