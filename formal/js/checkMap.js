if (navigator.userAgent.indexOf('AlipayClient') > -1) {
    document.writeln('<script src="https://appx/web-view.min.js"' + '>' + '<' + '/' + 'script>');
  }
  my.getEnv(function(res) {
      if (!res.miniProgram) {
          my.alert({
              content:JSON.stringify('运行出错')
          });
      }
  });
  var initLatlng, initZoom = 10, cityName, newCenterData,  markDatas = [], map, markers, mapParams, idx;
  
  my.postMessage('init');
  my.onMessage = function(e) {
      initLatlng = {lon: e.lon, lat: e.lat} || {lon: 120.14989, lat: 30.27751};  // 默认经纬度为蓝天商务中心
      cityName = e.cityName || "杭州市";
      markDatas = e.markDatas;
      drawMap(e.init)
  }
  function drawMap(e) {
      if (e) { init(); return; }
      reductionMap()
      drawMarekers()
  }

  function init() {
      map = L.map('map',{crs:L.CRS.CustomEPSG4326,center: initLatlng, minZoom: 5, zoom: initZoom, inertiaDeceleration:15000, zoomControl: false});
      var tileAddress = 'http://ditu.zjzwfw.gov.cn/mapserver/vmap/zjvmap/getMAP?x={x}&y={y}&l={z}&styleId=tdt_biaozhunyangshi_2017';

      var layer = new L.GXYZ(tileAddress, {tileSize:512, minZoom: 5});
      map.addLayer(layer);

      // 添加注记图层
      var labelLayer = new L.GWVTAnno({tileSize:512});
      var dataSource = new Custom.URLDataSource();
      dataSource.url = 'http://ditu.zjzwfw.gov.cn/mapserver/label/zjvmap/getDatas?x=${x}&y=${y}&l=${z}&styleId=tdt_biaozhunyangshi_2017';
      labelLayer.addDataSource(dataSource);
      map.addLayer(labelLayer);

      markers = L.markerClusterGroup();
      drawMarekers();
      map.addLayer(markers);

      map.on('click', function (e) {
          if($(".detail_info").hasClass('active')) { 
              $(".detail_info").removeClass('active');
          }
      });

  }

  $('.filterBtn').on('click', function () {
    $('.custom-mask').addClass('custom-mask--visible');
    $('.custom-container').addClass('custom-container--visible');
    $('.custom-container li').addClass('active');
  });

  $('.custom-mask').on('click', function () {
    $('.custom-mask').removeClass('custom-mask--visible');
    if ($(".floating_box").hasClass('active')) {
        $(".floating_box").removeClass('active');
        $('.filter_list_box').removeClass('active');
    } else {
        $('.custom-container').removeClass('custom-container--visible');
        $('.custom-container li').removeClass('active');
    }
  });

  $('.custom-container').on('click', function (ev) {
    $('.custom-mask').removeClass('custom-mask--visible');
    $('.custom-container').removeClass('custom-container--visible');
    $('.custom-container li').removeClass('active');
    var metter = $(ev.target).data('metter');
    my.postMessage({type: 'distance', val: metter});
  });

  $(".floating_box").on("click", function (e) {
        $(this).addClass('active');
        $('.custom-mask').addClass('custom-mask--visible');
        $('.filter_list_box').addClass('active');
  });

  $('.iptSearch').on('keydown',function(e){
      // e.preventDefault();
      if(e.keyCode == 13){
          var keyWord = cityName + e.target.value;
          if (e.target.value) {
              my.postMessage({type: 'keyword', val: e.target.value});
          } else {
              my.alert({
                  content: "请输入查询关键字"
              });
          }
      }
  });

  $('.btn_handler_box').on('click', function (ev) {
      var filter = $(ev.target).data('filter');
      if (filter == "" || filter == "1" || filter == "2" || filter == "3") {
          my.postMessage({type: 'checkState', val: filter});
          return
      }
      if (filter == "reset") {
          map.setView([Number(initLatlng.lat), Number(initLatlng.lon)], initZoom);
          return
      }
  });
  $(".call_tel").on("click", function () {
      var phoneNum = $(".call_tel").data("tel");
      my.postMessage({type: 'callPhone', val: phoneNum});
  });

  $(".menu_icon_3").on("click", function () {
      my.postMessage({type: 'openMap', val: mapParams});
  });

  $(".detail").on("click", function () {
      my.postMessage({type: 'detail', val: idx});
  });

  $(".gocheck").on("click", function () {
      my.postMessage({type: 'gocheck', val: idx});
  });

  $(".unfind").on("click", function () {
      my.postMessage({type: 'unfind', val: idx});
  });
  

  function drawMarekers() {
      markDatas.forEach(function (val, index) {
          var preState = val.checkState, marker, customIcon;
          switch(preState){
              case "1":
                  marker = L.marker([val.lat, val.lon], {draggable: false, opacity: 1, icon: L.divIcon({className: 'green-marker', html: '<p>' + (index + 1) + '</p>'})});
                  break;
              case "2":
                  marker = L.marker([val.lat, val.lon], {draggable: false, opacity: 1, icon: L.divIcon({className: 'blue-marker', html: '<p>' + (index + 1) + '</p>'})});
                  break;
              case "3":
                  marker = L.marker([val.lat, val.lon], {draggable: false, opacity: 1, icon: L.divIcon({className: 'red-marker', html: '<p>' + (index + 1) + '</p>'})});
                  break;
          }
          markers.addLayer(marker);
          marker.on('click', function (e) {
              if($(".detail_info").hasClass('active')) { 
                  $(".detail_info").removeClass('active');
              }
              idx = parseInt(e.originalEvent.target.textContent) - 1;
              getAdressInfo(markDatas[idx]);
          });
      });
  }

  function reductionMap() {
      markers.clearLayers();
      map.setView([Number(initLatlng.lat), Number(initLatlng.lon)], initZoom);
  }

  function getAdressInfo (e) {
      var reverseResolutionUrl = encodeURI("http://dh.ditu.zj.cn:18005/inverse/getInverseGeocoding.jsonp?&detail=1&zoom=11&latlon=" + e.lon + "," + e.lat + "&lat=&lon=&customer=2");
      $.ajax({
          url: reverseResolutionUrl,
          dataType: "jsonp",
          // jsonp: "callback",
          success: function(res) {
              var location = res.city.value + res.dist.value + res.town.value + res.poi;
              $(".legalEntity_name").text(e.legalEntityName)
              $(".legalRep_name").text(e.legalRep)
              $(".legalRep_tel").text(e.tel)
              $(".address_info").text(location)
              $(".distance_info").text((parseInt(e.distance) / 1000).toFixed(2));
              $(".call_tel").data("tel", e.tel);
              mapParams = {
                  longitude: e.lon,
                  latitude: e.lat,
                  name: res.poi,
                  address: res.poi,
              };
              $(".detail_info").addClass('active');
          },
          error: function (err) {
              my.alert({
                  content: "地址解析出错"
              });
          }
      });
  }