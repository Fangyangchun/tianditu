!function(e){var t={};function a(n){if(t[n])return t[n].exports;var i=t[n]={i:n,l:!1,exports:{}};return e[n].call(i.exports,i,i.exports,a),i.l=!0,i.exports}a.m=e,a.c=t,a.d=function(e,t,n){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},a.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(a.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)a.d(n,i,function(t){return e[t]}.bind(null,i));return n},a.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(t,"a",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p="./",a(a.s=0)}([function(e,t){navigator.userAgent.toLowerCase().indexOf("dingtalk")>-1&&document.writeln('<script src="https://appx/web-view.min.js"><\/script>');var a,n,i,s,o,c,r,l,d,m,u,v,p,f,y,b,g,h=10,k=[],C=[],T=[],_=[],x=[],S=[],A=document.getElementById("picker-btn"),E=document.getElementById("district-btn");function w(){m={},$.each(c.DistrictJson,function(e,t){var a=t.name;m[a]=[],t.children&&$.each(t.children,function(e,t){m[a].push(t.name)})})}function j(){k.forEach(function(e,t){var a;switch(e.checkState){case"1":a=L.marker([e.lat,e.lon],{draggable:!1,opacity:1,icon:L.divIcon({className:"green-marker",html:"<p>"+(t+1)+"</p>"})});break;case"2":a=L.marker([e.lat,e.lon],{draggable:!1,opacity:1,icon:L.divIcon({className:"blue-marker",html:"<p>"+(t+1)+"</p>"})});break;case"3":a=L.marker([e.lat,e.lon],{draggable:!1,opacity:1,icon:L.divIcon({className:"red-marker",html:"<p>"+(t+1)+"</p>"})})}i.addLayer(a),a.on("click",function(e){$(".detail_info").hasClass("active")&&$(".detail_info").removeClass("active"),o=parseInt(e.originalEvent.target.textContent)-1,function(e){var t=encodeURI("https://dh.ditu.zj.cn:9443/inverse/getInverseGeocoding.jsonp?&detail=1&zoom=11&latlon="+e.lon+","+e.lat+"&lat=&lon=&customer=2");$.ajax({url:t,dataType:"jsonp",success:function(t){var a=t.city.value+t.dist.value+t.town.value+t.poi;$(".legalEntity_name").text(e.legalEntityName),$(".legalRep_name").text(e.legalRep),$(".legalRep_tel").text(e.tel),$(".address_info").text(a),$(".distance_info").text((parseInt(e.distance)/1e3).toFixed(2)),$(".call_tel").data("tel",e.tel),s={longitude:e.lon,latitude:e.lat,name:t.poi,address:t.poi},$(".detail_info").addClass("active")},error:function(e){dd.alert({content:"地址解析出错"})}})}(k[o])})})}dd.postMessage({type:"init"}),dd.onMessage=function(e){a={lon:e.lon,lat:e.lat}||{lon:120.14989,lat:30.27751},C=e.cityName||"杭州市",k=e.markDatas,c=e.filterDatas,r=e.userLevel,l=e.showDistrict,e.init||r&&l&&(E.style.display="inline-block",w()),function(e){if(e)return void function(){n=L.map("map",{crs:L.CRS.CustomEPSG4326,center:a,minZoom:5,zoom:h,inertiaDeceleration:15e3,zoomControl:!1});var e=new L.GXYZ("https://ditu.zjzwfw.gov.cn/mapserver/vmap/zjvmap/getMAP?x={x}&y={y}&l={z}&styleId=tdt_biaozhunyangshi_2017",{tileSize:512,minZoom:5});n.addLayer(e);var t=new L.GXYZ("https://ditu.zjzwfw.gov.cn/mapserver/label/zjvmap/getImg?x={x}&y={y}&l={z}&styleId=tdt_biaozhunyangshi_2017",{tileSize:512,hitDetection:!0,keepBuffer:0,updateWhenZooming:!1});n.addLayer(t),i=L.markerClusterGroup(),j(),n.addLayer(i),function(){var e="",t="",a="";$.each(c.marketType,function(t,a){e+='<dd data-paramCode="'+a.paramCode+'" data-paramCodeType="'+a.paramCodeType+'">'+a.paramName+"</dd>"}),$.each(c.checkType,function(e,a){t+='<dd data-paramCode="'+a.paramCode+'" data-paramCodeType="'+a.paramCodeType+'">'+a.paramName+"</dd>"}),$.each(c.taskStatus,function(e,t){a+='<dd data-paramCode="'+t.paramCode+'" data-paramCodeType="'+t.paramCodeType+'">'+t.paramName+"</dd>"}),$("#MARKET_TYPE").html(e),$("#TASK_TYPE").html(t),$("#TASK_STATUS").html(a),$(".filter_list dd").on("click",function(e){$(this).siblings().removeClass("active"),$(this).addClass("active");var t=$(e.target)[0].dataset.paramcodetype;switch(t){case"MARKET_TYPE":p=$(e.target)[0].dataset.paramcode;break;case"TASK_TYPE":y=$(e.target)[0].dataset.paramcode;break;case"TASK_STATUS":u=$(e.target)[0].dataset.paramcode}})}(),r?(A.style.display="inline-block",d={},$.each(c.SlicenoLDNameJson,function(e,t){var a=t.name;d[a]=[],t.children&&$.each(t.children,function(e,t){d[a].push(t.name)})})):(E.style.display="inline-block",w());n.on("click",function(e){$(".detail_info").hasClass("active")&&$(".detail_info").removeClass("active")})}();i.clearLayers(),n.setView([Number(a.lat),Number(a.lon)],h),j()}(e.init)},$(".filterBtn").on("click",function(){$(".custom-mask").addClass("custom-mask--visible"),$(".custom-container").addClass("custom-container--visible"),$(".custom-container li").addClass("active")}),$(".custom-mask").on("click",function(){$(".custom-mask").removeClass("custom-mask--visible"),$(".floating_box").hasClass("active")?($(".floating_box").removeClass("active"),$(".filter_list_box").removeClass("active")):($(".custom-container").removeClass("custom-container--visible"),$(".custom-container li").removeClass("active"))}),$(".custom-container").on("click",function(e){$(".custom-mask").removeClass("custom-mask--visible"),$(".custom-container").removeClass("custom-container--visible"),$(".custom-container li").removeClass("active");var t=$(e.target).data("metter");""==t?$(".filterBtn span").html('不限<i class="icon-arrow"></i>'):$(".filterBtn span").html(t+'<i class="icon-arrow"></i>'),dd.postMessage({type:"distance",val:t})}),$(".floating_box").on("click",function(e){if($(this).addClass("active"),$(".custom-mask").addClass("custom-mask--visible"),$(".filter_list_box").addClass("active"),v){$("#TASK_STATUS dd").removeClass("active");var t=jQuery.makeArray($("#TASK_STATUS dd"));$.each(t,function(e,t){if(t.dataset.paramcode==u)return $(t).addClass("active"),!0})}else $("#TASK_STATUS dd").removeClass("active");if(g?r?($("#picker-btn").text(C.join("-")),$("#picker-btn").addClass("active"),_&&($("#district-btn").text(_.join("-")),$("#district-btn").addClass("active"))):($("#district-btn").text(_.join("-")),$("#district-btn").addClass("active")):r?($("#picker-btn").text("市|区|县"),$("#picker-btn").removeClass("active"),$("#district-btn").text("商圈/片区"),$("#district-btn").removeClass("active"),$("#district-btn").css("display","none")):($("#district-btn").text("商圈/片区"),$("#district-btn").removeClass("active")),f){$("#MARKET_TYPE dd").removeClass("active");t=jQuery.makeArray($("#MARKET_TYPE dd"));$.each(t,function(e,t){if(t.dataset.paramcode==p)return $(t).addClass("active"),!0})}else $("#MARKET_TYPE dd").removeClass("active");if(b){$("#TASK_TYPE dd").removeClass("active");t=jQuery.makeArray($("#TASK_TYPE dd"));$.each(t,function(e,t){if(t.dataset.paramcode==y)return $(t).addClass("active"),!0})}else $("#TASK_TYPE dd").removeClass("active")}),$(".custom-mask").on("touchmove",function(e){e.preventDefault()}),$(".custom-container").on("touchmove",function(e){e.preventDefault()}),$(".iptSearch").on("keydown",function(e){13==e.keyCode&&dd.postMessage({type:"keyword",val:e.target.value||""})}),$(".btn_handler_box li").on("click",function(e){var t=$(e.target).data("filter");""!=t&&"1"!=t&&"2"!=t&&"3"!=t?"reset"!=t||n.setView([Number(a.lat),Number(a.lon)],h):dd.postMessage({type:"checkState",val:t})}),$(".call_tel").on("click",function(){var e=$(".call_tel").data("tel");dd.postMessage({type:"callPhone",val:e})}),$(".menu_icon_3").on("click",function(){dd.postMessage({type:"openMap",val:s})}),$(".detail").on("click",function(){dd.postMessage({type:"detail",val:o})}),$(".gocheck").on("click",function(){dd.postMessage({type:"gocheck",val:o})}),$(".unfind").on("click",function(){dd.postMessage({type:"unfind",val:o})}),$(".reset_btn").on("click",function(){S=[],_=[],x=[],C=[],T=[],A.innerText="市|区|县",E.innerText="商圈/片区",$(".filter_type dd").removeClass("active"),$(".custom-mask").removeClass("custom-mask--visible"),$(".floating_box").removeClass("active"),$(".filter_list_box").removeClass("active"),v="",f="",b="","",g="";dd.postMessage({type:"businessDistrict",val:{taskStatus:"",businessDistrict:"",legalEntityCata:"",checkType:"",legalEntityTag:""}})}),$(".confirm_btn").on("click",function(){S=T.concat(x),g=S?S.join(","):"";var e={taskStatus:v=u||"",businessDistrict:g,legalEntityCata:f=p||"",checkType:b=y||"",legalEntityTag:""};$(".custom-mask").removeClass("custom-mask--visible"),$(".floating_box").removeClass("active"),$(".filter_list_box").removeClass("active"),dd.postMessage({type:"businessDistrict",val:e})}),A.onclick=function(){new PickerView({bindElem:A,data:d,title:"市|区|县",leftText:"取消",rightText:"确定",rightFn:function(e){var t;C=[],T=[];var a=c.SlicenoLDNameJson.findIndex(function(t){return t.name==e[0]});if(T.push(c.SlicenoLDNameJson[a].code),e[1]){C=e;var n=(t=c.SlicenoLDNameJson[a].children).findIndex(function(t){return t.name==e[1]});T.push(t[n].code)}else C.push(e[0]);A.innerText=C.join("-"),A.setAttribute("class","active"),E.innerText="商圈/片区",E.style.display="none",E.setAttribute("class",""),_=[],x=[],dd.postMessage({type:"showDistrict",val:T[T.length-1]})}})},E.onclick=function(){new PickerView({bindElem:E,data:m,title:"商圈/片区",leftText:"取消",rightText:"确定",rightFn:function(e){var t;_=[],x=[];var a=c.DistrictJson.findIndex(function(t){return t.name==e[0]});if(x.push(c.DistrictJson[a].code),e[1]){_=e;var n=(t=c.DistrictJson[a].children).findIndex(function(t){return t.name==e[1]});x.push(t[n].code)}else _.push(e[0]);E.innerText=_.join("-"),E.setAttribute("class","active")}})}}]);