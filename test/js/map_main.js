require(['common/util', 'component/iframeLayer', 'component/dataTable', 'common/http', 'handlebars', 'jquery'], function (util, layer, dataTable, http, handlebars) {

    init();
    /**
     * 初始化函数集合
     */
    function init() {
        mapInit();
    }

    function mapInit() {
        http.httpRequest({
            url:'/admin/taskassignment/getAssignPeople',
            serializable: false,
            data: {
                deptCode: '330782000M027S006',
                desLongitude: 121.62020610522553,
                desLatitude: 29.862702640712047
            },
            type:"post",
            success: function (data) {
                var result = data.data;
                var map = L.map('map',{crs:L.CRS.CustomEPSG4326,center: {lon: 121.62020610522553, lat: 29.862702640712047}, minZoom: 5, zoom: 17, inertiaDeceleration:15000, zoomControl: true});
                var layer = new L.GVMapGrid('https://ditu.zjzwfw.gov.cn/mapserver/data/zjvmap/getData?x={x}&y={y}&l={z}&styleId=tdt_biaozhunyangshi_2017',{tileSize:512,maxZoom: 21,keepBuffer:0,updateWhenZooming:false});
                map.addLayer(layer);
                var labelLayer = new L.GXYZ('https://ditu.zjzwfw.gov.cn/mapserver/label/zjvmap/getImg?x={x}&y={y}&l={z}&styleId=tdt_biaozhunyangshi_2017',{tileSize:512,hitDetection:true,keepBuffer:0,updateWhenZooming:false});
                map.addLayer(labelLayer);

                var markers = L.markerClusterGroup();

                result.forEach(function (val, index) {
                    var type = val.type, marker;
                    switch(type){
                        case "people":
                            marker = L.marker([val.latitude, val.longitude], {draggable: false, opacity: 1, icon: L.divIcon({className: 'red-marker'})});
                            break;
                        case "place":
                            marker = L.marker([val.latitude, val.longitude], {draggable: false, opacity: 1, icon: L.divIcon({className: 'address-marker'})});
                            break;
                    }
                    markers.addLayer(marker);
                    marker.on('click', function () {
                        if (type == "place") {
                            marker.unbindPopup().bindPopup('<p class="map-address">' + result[index].name + '</p>', {offset: [10, 0], direction : "top"}).openPopup()
                        } else {
                            marker.unbindPopup().bindPopup('<p class="map-person spec">' + result[index].name + '&nbsp;&nbsp;' + result[index].mobile + '<span class="map-marker-time">' + result[index].minute + '</span></p>'
                                + '<p class="map-person"><span class="map-person-tip">时间：</span>' + result[index].time + '</p>'
                                + '<p class="map-assign-box center"><span class="map-person-assign">指派给他</span></p>',
                                {offset: [10, 0], direction : "top"}).openPopup()
                        }

                    });
                });
                map.addLayer(markers);
            }
        })
    }

    function bind() {
        /*util.bindEvents([
            {
                el: '#goMap',
                event: 'click',
                handler: function () {
                    layer.close({result:"goMap"});
                }
            }
        ])*/
    }

})
