!function(t){var e={};function o(n){if(e[n])return e[n].exports;var a=e[n]={i:n,l:!1,exports:{}};return t[n].call(a.exports,a,a.exports,o),a.l=!0,a.exports}o.m=t,o.c=e,o.d=function(t,e,n){o.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},o.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},o.t=function(t,e){if(1&e&&(t=o(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(o.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var a in t)o.d(n,a,function(e){return t[e]}.bind(null,a));return n},o.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return o.d(e,"a",e),e},o.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},o.p="./",o(o.s=1)}([,function(t,e){navigator.userAgent.toLowerCase().indexOf("dingtalk")>-1&&document.writeln('<script src="https://appx/web-view.min.js"><\/script>');var o,n,a,l,i,r,c=17,d={};function s(t,e){$.ajax({url:encodeURI("https://dh.ditu.zj.cn:9443/inverse/getInverseGeocoding.jsonp?&detail=1&zoom=11&latlon="+t.lon+","+t.lat+"&lat=&lon=&customer=2"),dataType:"jsonp",success:function(t){d.latitude=parseFloat(t.latlon.split(",")[1]),d.longitude=parseFloat(t.latlon.split(",")[0]),d.location=t.dist.value+t.town.value+t.poi,e&&"location"==e&&n.bindTooltip(t.city.value+t.dist.value+t.town.value+t.poi,{offset:[0,10],direction:"bottom"}).openTooltip()},error:function(t){dd.alert({content:"地址解析出错"})}})}dd.postMessage({type:"init"}),dd.onMessage=function(t){switch(t.dataType){case"render":a=t.lon&&t.lat?{lon:t.lon,lat:t.lat}:{lon:120.14989,lat:30.27751},l=t.cityName||"杭州市",s(a),function(){o=L.map("map",{crs:L.CRS.CustomEPSG4326,center:a,minZoom:5,zoom:c,inertiaDeceleration:15e3,zoomControl:!1});var t=new L.GVMapGrid("https://ditu.zjzwfw.gov.cn/mapserver/data/zjvmap/getData?x={x}&y={y}&l={z}&styleId=tdt_biaozhunyangshi_2017",{tileSize:512,maxZoom:21,keepBuffer:0,updateWhenZooming:!1});o.addLayer(t);var e=new L.GXYZ("https://ditu.zjzwfw.gov.cn/mapserver/label/zjvmap/getImg?x={x}&y={y}&l={z}&styleId=tdt_biaozhunyangshi_2017",{tileSize:512,hitDetection:!0,keepBuffer:0,updateWhenZooming:!1});o.addLayer(e);var s=L.icon({iconUrl:"../img/indoor_pub_poi_pressed.png",iconSize:[21,30],iconAnchor:[10,20]});n=L.marker([o.getCenter().lat,o.getCenter().lng],{draggable:!1,opacity:1,icon:s}),o.addLayer(n),i=L.circle([o.getCenter().lat,o.getCenter().lng],60,{color:"rgba(255, 255, 255, 0)",fillColor:"#3296FA"}),o.addLayer(i),dd.postMessage({type:"render"}),o.on("click",function(t){var e=encodeURI("https://dh.ditu.zj.cn:9443/inverse/getInverseGeocoding.jsonp?&detail=1&zoom=11&latlon="+t.latlng.lng+","+t.latlng.lat+"&lat=&lon=&customer=2");$.ajax({url:e,dataType:"jsonp",success:function(e){if(d.latitude=parseFloat(e.latlon.split(",")[1]),d.longitude=parseFloat(e.latlon.split(",")[0]),d.location=e.dist.value+e.town.value+e.poi,r)o.removeLayer(r),r.setLatLng(t.latlng);else{var n=L.icon({iconUrl:"../img/marker.png",iconSize:[46,60],iconAnchor:[23,45]});r=L.marker([t.latlng.lat,t.latlng.lng],{draggable:!1,opacity:1,icon:n})}o.addLayer(r),r.unbindTooltip().bindTooltip(e.city.value+e.dist.value+e.town.value+e.poi,{offset:[0,10],direction:"bottom"}).openTooltip()},error:function(t){dd.alert({content:"地址解析出错"})}})}),$(".iptSearch").on("keydown",function(t){if(13==t.keyCode)if(t.target.value){var e=t.target.value,a=encodeURI("https://dh.ditu.zj.cn:9446/geocoding/getLatLonByAddress.jsonp?&city="+l+"&keyword="+e+"&width=500&height=430&pn=1&customer=2&encode=UTF-8");$.ajax({url:a,dataType:"jsonp",success:function(e){if("0.0,0.0"==e.strlatlon)dd.alert({content:"未查询到相关信息"});else{d.latitude=parseFloat(e.strlatlon.split(",")[1]),d.longitude=parseFloat(e.strlatlon.split(",")[0]),d.location=t.target.value;var a={lon:d.longitude,lat:d.latitude};n.setLatLng(a),n.unbindTooltip().bindTooltip(t.target.value,{offset:[0,10],direction:"bottom"}).openTooltip(),o.panTo(a)}},error:function(t){dd.alert({content:"地址解析出错"})}})}else dd.alert({content:"请输入查询关键字"})}),$(".search-btn").on("click",function(t){var e=$(".iptSearch").val();if(e){var a=encodeURI("https://dh.ditu.zj.cn:9446/geocoding/getLatLonByAddress.jsonp?&city="+l+"&keyword="+e+"&width=500&height=430&pn=1&customer=2&encode=UTF-8");$.ajax({url:a,dataType:"jsonp",success:function(e){if("0.0,0.0"==e.strlatlon)dd.alert({content:"未查询到相关信息"});else{d.latitude=parseFloat(e.strlatlon.split(",")[1]),d.longitude=parseFloat(e.strlatlon.split(",")[0]),d.location=t.target.value;var a={lon:d.longitude,lat:d.latitude};n.setLatLng(a),n.unbindTooltip().bindTooltip(t.target.value,{offset:[0,10],direction:"bottom"}).openTooltip(),o.panTo(a)}},error:function(t){dd.alert({content:"地址解析出错"})}})}else dd.alert({content:"请输入查询关键字"})}),$(".resetBtn").on("click",function(t){dd.postMessage({type:"location"})}),$(".modifyBtn").on("click",function(){dd.postMessage($.extend({type:"tagging"},d))})}();break;case"location":o.removeLayer(r),o.setView([Number(t.localLat),Number(t.localLon)],c),i?i.setLatLng([Number(t.localLat),Number(t.localLon)]):(i=L.circle([Number(t.localLat),Number(t.localLon)],60,{color:"rgba(255, 255, 255, 0)",fillColor:"#3296FA"}),o.addLayer(i)),n.unbindTooltip().setLatLng({lon:t.localLon,lat:t.localLat}),s({lon:t.localLon,lat:t.localLat},"location");break;case"init":dd.postMessage({type:"init"})}}}]);