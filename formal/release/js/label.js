!function(t){var e={};function n(o){if(e[o])return e[o].exports;var a=e[o]={i:o,l:!1,exports:{}};return t[o].call(a.exports,a,a.exports,n),a.l=!0,a.exports}n.m=t,n.c=e,n.d=function(t,e,o){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:o})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var a in t)n.d(o,a,function(e){return t[e]}.bind(null,a));return o},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="./",n(n.s=1)}([,function(t,e){navigator.userAgent.toLowerCase().indexOf("dingtalk")>-1&&document.writeln('<script src="https://appx/web-view.min.js"><\/script>');var n,o,a,l,i=17,r={};function c(t){$.ajax({url:encodeURI("https://dh.ditu.zj.cn:9443/inverse/getInverseGeocoding.jsonp?&detail=1&zoom=11&latlon="+t.lon+","+t.lat+"&lat=&lon=&customer=2"),dataType:"jsonp",success:function(t){r.latitude=parseFloat(t.latlon.split(",")[1]),r.longitude=parseFloat(t.latlon.split(",")[0]),r.location=t.city.value+t.dist.value+t.town.value+t.poi},error:function(t){dd.alert({content:"地址解析出错"})}})}dd.postMessage({type:"init"}),dd.onMessage=function(t){switch(t.dataType){case"render":a=t.lon&&t.lat?{lon:t.lon,lat:t.lat}:{lon:120.14989,lat:30.27751},l=t.cityName||"杭州市",c(a),function(){n=L.map("map",{crs:L.CRS.CustomEPSG4326,center:a,minZoom:5,zoom:i,inertiaDeceleration:15e3,zoomControl:!1});var t=new L.GXYZ("https://ditu.zjzwfw.gov.cn/mapserver/vmap/zjvmap/getMAP?x={x}&y={y}&l={z}&styleId=tdt_biaozhunyangshi_2017",{tileSize:512,minZoom:5});n.addLayer(t);var e=new L.GXYZ("https://ditu.zjzwfw.gov.cn/mapserver/label/zjvmap/getImg?x={x}&y={y}&l={z}&styleId=tdt_biaozhunyangshi_2017",{tileSize:512,hitDetection:!0,keepBuffer:0,updateWhenZooming:!1});n.addLayer(e);var c=L.icon({iconUrl:"../img/indoor_pub_poi_pressed.png",iconSize:[21,30],iconAnchor:[10,20]});o=L.marker([n.getCenter().lat,n.getCenter().lng],{draggable:!1,opacity:1,icon:c}),n.addLayer(o);var d=L.circle([n.getCenter().lat,n.getCenter().lng],{radius:30});n.addLayer(d),dd.postMessage({type:"render"}),n.on("click",function(t){var e=encodeURI("https://dh.ditu.zj.cn:9443/inverse/getInverseGeocoding.jsonp?&detail=1&zoom=11&latlon="+t.latlng.lng+","+t.latlng.lat+"&lat=&lon=&customer=2");$.ajax({url:e,dataType:"jsonp",success:function(e){r.latitude=parseFloat(e.latlon.split(",")[1]),r.longitude=parseFloat(e.latlon.split(",")[0]),r.location=e.city.value+e.dist.value+e.town.value+e.poi,o.setLatLng(t.latlng),o.unbindTooltip().bindTooltip(e.city.value+e.dist.value+e.town.value+e.poi,{offset:[0,10],direction:"bottom"}).openTooltip()},error:function(t){dd.alert({content:"地址解析出错"})}})}),$(".iptSearch").on("keydown",function(t){if(13==t.keyCode)if(t.target.value){var e=l+t.target.value,a=encodeURI("https://dh.ditu.zj.cn:9446/geocoding/getLatLonByAddress.jsonp?&city="+l+"&keyword="+e+"&width=500&height=430&pn=1&customer=2&encode=UTF-8");$.ajax({url:a,dataType:"jsonp",success:function(e){if("0.0,0.0"==e.strlatlon)dd.alert({content:"未查询到相关信息"});else{r.latitude=parseFloat(e.strlatlon.split(",")[1]),r.longitude=parseFloat(e.strlatlon.split(",")[0]),r.location=e.city+t.target.value;var a={lon:r.longitude,lat:r.latitude};o.setLatLng(a),o.unbindTooltip().bindTooltip(t.target.value,{offset:[0,10],direction:"bottom"}).openTooltip(),n.panTo(a)}},error:function(t){dd.alert({content:"地址解析出错"})}})}else dd.alert({content:"请输入查询关键字"})}),$(".resetBtn").on("click",function(t){dd.postMessage({type:"location"})}),$(".modifyBtn").on("click",function(){dd.postMessage($.extend({type:"tagging"},r))})}();break;case"location":n.setView([Number(t.localLat),Number(t.localLon)],i),o.unbindTooltip().setLatLng({lon:t.localLon,lat:t.localLat}),c({lon:t.localLon,lat:t.localLat});break;case"init":dd.postMessage({type:"init"})}}}]);