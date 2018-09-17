if (navigator.userAgent.toLowerCase().indexOf('dingtalk') > -1) {
    document.writeln('<script src="https://appx/web-view.min.js"' + '>' + '<' + '/' + 'script>');
  }
  dd.getEnv(function(res) {
      if (!res.miniProgram) {
          dd.alert({
              content:JSON.stringify('运行出错')
          });
      }
  });
  var initLatlng, initZoom = 17, cityName, newCenterData = {};
  
  dd.postMessage('init');
  dd.onMessage = function(e) {
      initLatlng = {lon: e.lon, lat: e.lat} || {lon: 120.14989, lat: 30.27751};  // 默认经纬度为蓝天商务中心
      cityName = e.cityName || "杭州市";
      $.ajax({
          url: encodeURI("http://dh.ditu.zj.cn:18005/inverse/getInverseGeocoding.jsonp?&detail=1&zoom=11&latlon=" + initLatlng.lon + "," + initLatlng.lat + "&lat=&lon=&customer=2"),
          dataType: "jsonp",
          // jsonp: "callback",
          success: function(res) {
              newCenterData.latitude = parseFloat(res.latlon.split(',')[1])
              newCenterData.longitude = parseFloat(res.latlon.split(',')[0])
              newCenterData.location = res.city.value + res.dist.value + res.town.value + res.poi;
          },
          error: function (err) {
              dd.alert({
                  content: "地址解析出错"
              });
          }
      });
      init()
  }
  function init() {
      var map = L.map('map',{crs:L.CRS.CustomEPSG4326,center: initLatlng, minZoom: 5, zoom: initZoom, inertiaDeceleration:15000, zoomControl: false});
      var tileAddress = 'http://ditu.zjzwfw.gov.cn/mapserver/vmap/zjvmap/getMAP?x={x}&y={y}&l={z}&styleId=tdt_biaozhunyangshi_2017';

      var layer = new L.GXYZ(tileAddress, {tileSize:512, minZoom: 5});
      map.addLayer(layer);

      // 添加注记图层
      var labelLayer = new L.GWVTAnno({tileSize:512});
      var dataSource = new Custom.URLDataSource();
      dataSource.url = 'http://ditu.zjzwfw.gov.cn/mapserver/label/zjvmap/getDatas?x=${x}&y=${y}&l=${z}&styleId=tdt_biaozhunyangshi_2017';
      labelLayer.addDataSource(dataSource);
      map.addLayer(labelLayer);
      var customIcon = L.icon({ 
          iconUrl: '../img/indoor_pub_poi_pressed.png',
          iconSize: [21, 30],
          iconAnchor:   [10, 20],
      }); 
      var marker = L.marker( 
          [map.getCenter().lat, map.getCenter().lng], 
          { 
              draggable: false,
              opacity: 1,
              icon: customIcon
          }
      ).addTo(map);
      L.circle([map.getCenter().lat, map.getCenter().lng], {radius: 30}).addTo(map);

      map.on('click', function(e) {
          var reverseResolutionUrl = encodeURI("http://dh.ditu.zj.cn:18005/inverse/getInverseGeocoding.jsonp?&detail=1&zoom=11&latlon=" + e.latlng.lng + "," + e.latlng.lat + "&lat=&lon=&customer=2");
          $.ajax({
              url: reverseResolutionUrl,
              dataType: "jsonp",
              // jsonp: "callback",
              success: function(res) {
                  newCenterData.latitude = parseFloat(res.latlon.split(',')[1])
                  newCenterData.longitude = parseFloat(res.latlon.split(',')[0])
                  newCenterData.location = res.city.value + res.dist.value + res.town.value + res.poi;
                  marker.setLatLng(e.latlng);
                  marker.unbindTooltip().bindTooltip(res.city.value + res.dist.value + res.town.value + res.poi, {offset: [0, 10], direction : "bottom"}).openTooltip();
              },
              error: function (err) {
                  dd.alert({
                      content: "地址解析出错"
                  });
              }
          });
      });

      $('.iptSearch').on('keydown',function(e){
          // e.preventDefault();
          if(e.keyCode == 13){
              if(e.target.value) {
                  var keyWord = cityName + e.target.value;
                  var resolutionUrl = encodeURI("http://dh.ditu.zj.cn:18006/geocoding/getLatLonByAddress.jsonp?&city=" + cityName + "&keyword=" + keyWord + "&width=500&height=430&pn=1&customer=2&encode=UTF-8");
                  $.ajax({
                      url: resolutionUrl,
                      dataType: "jsonp",
                      // jsonp: "callback",
                      success: function(res) {
                          if (res.strlatlon == "0.0,0.0") {
                              dd.alert({
                                  content: "未查询到相关信息"
                              });
                          } else {
                              newCenterData.latitude = parseFloat(res.strlatlon.split(',')[1]);
                              newCenterData.longitude = parseFloat(res.strlatlon.split(',')[0]);
                              newCenterData.location = res.city + res.keyword;
                              var newCenterLatlon = {lon: newCenterData.longitude, lat: newCenterData.latitude}
                              marker.setLatLng(newCenterLatlon);
                              marker.unbindTooltip().bindTooltip(keyWord, {offset: [0, 10], direction : "bottom"}).openTooltip();
                              map.panTo(newCenterLatlon)
                          }
                      },
                      error: function (err) {
                          dd.alert({
                              content: "地址解析出错"
                          });
                      }
                  });
              } else {
                  dd.alert({
                      content: "请输入查询关键字"
                  });
              }
              
          }
      });
      $('.resetBtn').on('click',function(e){
          map.setView([Number(initLatlng.lat), Number(initLatlng.lon)], initZoom);
          marker.unbindTooltip().setLatLng(initLatlng);
      });
      $(".modifyBtn").on('click', function () {
          dd.postMessage(newCenterData);
      })

  }