!function(e){var t={};function a(i){if(t[i])return t[i].exports;var n=t[i]={i:i,l:!1,exports:{}};return e[i].call(n.exports,n,n.exports,a),n.l=!0,n.exports}a.m=e,a.c=t,a.d=function(e,t,i){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},a.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(a.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)a.d(i,n,function(t){return e[t]}.bind(null,n));return i},a.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(t,"a",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p="./",a(a.s=0)}([function(e,t){navigator.userAgent.toLowerCase().indexOf("dingtalk")>-1&&document.writeln('<script src="https://appx/web-view.min.js"><\/script>');var a,i,n,s,o,c,r,l,d,m,u,p,v,f,g,y,b,C,h,k,_,T=10,S=[],x=[],A=[],E=[],w=[],j=document.getElementById("picker-btn"),P=document.getElementById("district-btn");function M(){u={},$.each(r.DistrictJson,function(e,t){var a=t.name;u[a]=[],t.children&&$.each(t.children,function(e,t){u[a].push(t.name)})})}function I(){S.forEach(function(e,t){var a;switch(e.checkState){case"1":a=L.marker([e.lat,e.lon],{draggable:!1,opacity:1,icon:L.divIcon({className:"green-marker",html:"<p>"+(t+1)+"</p>"})});break;case"2":a=L.marker([e.lat,e.lon],{draggable:!1,opacity:1,icon:L.divIcon({className:"blue-marker",html:"<p>"+(t+1)+"</p>"})});break;case"3":a=L.marker([e.lat,e.lon],{draggable:!1,opacity:1,icon:L.divIcon({className:"red-marker",html:"<p>"+(t+1)+"</p>"})})}s.addLayer(a),a.on("click",function(e){$(".detail_info").hasClass("active")&&$(".detail_info").removeClass("active"),c=parseInt(e.originalEvent.target.textContent)-1,function(e){var t=encodeURI("https://dh.ditu.zj.cn:9443/inverse/getInverseGeocoding.jsonp?&detail=1&zoom=11&latlon="+e.lon+","+e.lat+"&lat=&lon=&customer=2");$.ajax({url:t,dataType:"jsonp",success:function(t){var a=t.city.value+t.dist.value+t.town.value+t.poi;$(".legalEntity_name").text(e.legalEntityName),$(".legalRep_name").text(e.legalRep),$(".legalRep_tel").text(e.tel),$(".address_info").text(a),$(".distance_info").text((parseInt(e.distance)/1e3).toFixed(2)),$(".call_tel").data("tel",e.tel),o={longitude:e.lon,latitude:e.lat,name:t.poi,address:t.poi},$(".detail_info").addClass("active")},error:function(e){dd.alert({content:"地址解析出错"})}})}(S[c])})})}dd.postMessage({type:"init"}),dd.onMessage=function(e){a={lon:e.lon,lat:e.lat}||{lon:120.14989,lat:30.27751},x=e.cityName||"杭州市",S=e.markDatas,r=e.filterDatas,l=e.userLevel,d=e.showDistrict,e.init||l&&d&&(P.style.display="inline-block",M()),function(e){if(e)return void function(){i=L.map("map",{crs:L.CRS.CustomEPSG4326,center:a,minZoom:5,zoom:T,inertiaDeceleration:15e3,zoomControl:!1});var e=new L.GXYZ("https://ditu.zjzwfw.gov.cn/mapserver/vmap/zjvmap/getMAP?x={x}&y={y}&l={z}&styleId=tdt_biaozhunyangshi_2017",{tileSize:512,minZoom:5});i.addLayer(e);var t=new L.GXYZ("https://ditu.zjzwfw.gov.cn/mapserver/label/zjvmap/getImg?x={x}&y={y}&l={z}&styleId=tdt_biaozhunyangshi_2017",{tileSize:512,hitDetection:!0,keepBuffer:0,updateWhenZooming:!1});i.addLayer(t);var n=L.icon({iconUrl:"../img/indoor_pub_poi_pressed.png",iconSize:[21,30],iconAnchor:[10,20]}),o=L.marker([i.getCenter().lat,i.getCenter().lng],{draggable:!1,opacity:1,icon:n});i.addLayer(o),s=L.markerClusterGroup(),I(),i.addLayer(s),$(".whiteBtn").addClass("active"),$(".check_title").text($(".whiteBtn").data("title")).fadeIn(),function(){var e="",t="",a="",i="";$.each(r.marketType,function(t,a){e+='<dd data-paramCode="'+a.paramCode+'" data-paramCodeType="'+a.paramCodeType+'">'+a.paramName+"</dd>"}),$.each(r.checkType,function(e,a){t+='<dd data-paramCode="'+a.paramCode+'" data-paramCodeType="'+a.paramCodeType+'">'+a.paramName+"</dd>"}),$.each(r.taskStatus,function(e,t){a+='<dd data-paramCode="'+t.paramCode+'" data-paramCodeType="'+t.paramCodeType+'">'+t.paramName+"</dd>"}),$.each(r.superviseTag,function(e,t){i+='<dd data-paramCode="'+t.paramCode+'" data-paramCode1="'+t.paramCode1+'" data-paramCode2="'+t.paramCode2+'" data-paramCodeType="'+t.paramCodeType+'">'+t.paramName+"</dd>"}),$("#MARKET_TYPE").html(e),$("#TASK_TYPE").html(t),$("#TASK_STATUS").html(a),$("#SUPERVISE_TAG").html(i),$(".filter_list dd").on("click",function(e){$(this).siblings().removeClass("active"),$(this).addClass("active");var t=$(e.target)[0].dataset.paramcodetype;switch(t){case"MARKET_TYPE":f=$(e.target)[0].dataset.paramcode;break;case"TASK_TYPE":y=$(e.target)[0].dataset.paramcode;break;case"TASK_STATUS":p=$(e.target)[0].dataset.paramcode;break;case"SUPERVISE_TAG_LARGECLASS":C=$(e.target)[0].dataset.paramcode,h=$(e.target)[0].dataset.paramcode1,k=$(e.target)[0].dataset.paramcode2}})}(),l?(j.style.display="inline-block",m={},$.each(r.SlicenoLDNameJson,function(e,t){var a=t.name;m[a]=[],t.children&&$.each(t.children,function(e,t){m[a].push(t.name)})})):(P.style.display="inline-block",M());i.on("click",function(e){$(".detail_info").hasClass("active")&&$(".detail_info").removeClass("active")})}();s.clearLayers(),i.setView([Number(a.lat),Number(a.lon)],T),I()}(e.init)},$(".filterBtn").on("click",function(){$(".custom-mask").addClass("custom-mask--visible"),$(".custom-container").addClass("custom-container--visible"),$(".custom-container li").addClass("active")}),$(".custom-mask").on("click",function(){$(".custom-mask").removeClass("custom-mask--visible"),$(".floating_box").hasClass("active")?($(".floating_box").removeClass("active"),$(".filter_list_box").removeClass("active")):($(".custom-container").removeClass("custom-container--visible"),$(".custom-container li").removeClass("active"))}),$(".custom-container").on("click",function(e){$(".custom-mask").removeClass("custom-mask--visible"),$(".custom-container").removeClass("custom-container--visible"),$(".custom-container li").removeClass("active");var t=$(e.target).data("metter");""==t?$(".filterBtn span").html('不限<i class="icon-arrow"></i>'):$(".filterBtn span").html(t+'<i class="icon-arrow"></i>'),dd.postMessage({type:"distance",val:t})}),$(".floating_box").on("click",function(e){if($(this).addClass("active"),$(".custom-mask").addClass("custom-mask--visible"),$(".filter_list_box").addClass("active"),v){$("#TASK_STATUS dd").removeClass("active");var t=jQuery.makeArray($("#TASK_STATUS dd"));$.each(t,function(e,t){if(t.dataset.paramcode==p)return $(t).addClass("active"),!0})}else $("#TASK_STATUS dd").removeClass("active");if(A.length>0||w.length>0?l?($("#picker-btn").text(x.join("-")),$("#picker-btn").addClass("active"),E&&($("#district-btn").text(E.join("-")),$("#district-btn").addClass("active"))):($("#district-btn").text(E.join("-")),$("#district-btn").addClass("active")):l?($("#picker-btn").text("市|区|县"),$("#picker-btn").removeClass("active"),$("#district-btn").text("商圈/片区"),$("#district-btn").removeClass("active"),$("#district-btn").css("display","none")):($("#district-btn").text("商圈/片区"),$("#district-btn").removeClass("active")),g){$("#MARKET_TYPE dd").removeClass("active");t=jQuery.makeArray($("#MARKET_TYPE dd"));$.each(t,function(e,t){if(t.dataset.paramcode==f)return $(t).addClass("active"),!0})}else $("#MARKET_TYPE dd").removeClass("active");if(b){$("#TASK_TYPE dd").removeClass("active");t=jQuery.makeArray($("#TASK_TYPE dd"));$.each(t,function(e,t){if(t.dataset.paramcode==y)return $(t).addClass("active"),!0})}else $("#TASK_TYPE dd").removeClass("active");if(_){$("#SUPERVISE_TAG dd").removeClass("active");t=jQuery.makeArray($("#SUPERVISE_TAG dd"));$.each(t,function(e,t){if(t.dataset.paramcode==C)return $(t).addClass("active"),!0})}else $("#SUPERVISE_TAG dd").removeClass("active")}),$(".custom-mask").on("touchmove",function(e){e.preventDefault()}),$(".custom-container").on("touchmove",function(e){e.preventDefault()}),$(".iptSearch").on("keydown",function(e){13==e.keyCode&&dd.postMessage({type:"keyword",val:e.target.value||""})}),$(".btn_handler_box li").on("click",function(e){var t=$(e.target).data("filter"),o=$(e.target).data("title");return $(this).closest("li").addClass("active").siblings().removeClass("active"),""==t||"1"==t||"2"==t||"3"==t?($(".check_title").text(o).fadeIn(),void dd.postMessage({type:"checkState",val:t})):"reset"==t?($(".check_title").fadeOut(),s.clearLayers(),i.setView([Number(a.lat),Number(a.lon)],T),n=L.circle([i.getCenter().lat,i.getCenter().lng],{radius:30}),void i.addLayer(n)):void 0}),$(".call_tel").on("click",function(){var e=$(".call_tel").data("tel");dd.postMessage({type:"callPhone",val:e})}),$(".menu_icon_3").on("click",function(){dd.postMessage({type:"openMap",val:o})}),$(".detail").on("click",function(){dd.postMessage({type:"detail",val:c})}),$(".gocheck").on("click",function(){dd.postMessage({type:"gocheck",val:c})}),$(".unfind").on("click",function(){dd.postMessage({type:"unfind",val:c})}),$(".reset_btn").on("click",function(){[],E=[],w=[],x=[],A=[],$("#picker-btn").text("市|区|县"),$("#district-btn").text("商圈/片区"),l?($("#picker-btn").removeClass("active"),$("#district-btn").removeClass("active"),$("#district-btn").css("display","none")):$("#district-btn").removeClass("active"),$(".filter_type dd").removeClass("active"),$(".custom-mask").removeClass("custom-mask--visible"),$(".floating_box").removeClass("active"),$(".filter_list_box").removeClass("active"),v="",g="",b="",_="","","","";dd.postMessage({type:"businessDistrict",val:{taskStatus:"",businessDistrict:"",legalEntityCata:"",checkType:"",legalEntityTag:"",legalEntityTag1:"",legalEntityTag2:"",localAdm:""}})}),$(".confirm_btn").on("click",function(){var e={taskStatus:v=p||"",legalEntityCata:g=f||"",checkType:b=y||"",legalEntityTag:_=C||"",legalEntityTag1:h||"",legalEntityTag2:k||""};1==A.length?(e.localAdm=A[0],e.businessDistrict=""):0==w.length?(e.localAdm=A[0],e.businessDistrict=""):(e.localAdm=w[0],e.businessDistrict=w[1]||""),$(".custom-mask").removeClass("custom-mask--visible"),$(".floating_box").removeClass("active"),$(".filter_list_box").removeClass("active"),dd.postMessage({type:"businessDistrict",val:e})}),j.onclick=function(){new PickerView({bindElem:j,data:m,title:"市|区|县",leftText:"取消",rightText:"确定",rightFn:function(e){var t;x=[],A=[];var a=r.SlicenoLDNameJson.findIndex(function(t){return t.name==e[0]});A.push(r.SlicenoLDNameJson[a].code),x=e;var i=(t=r.SlicenoLDNameJson[a].children).findIndex(function(t){return t.name==e[1]});A.push(t[i].code),j.innerText=x.join("-"),j.setAttribute("class","active"),P.innerText="商圈/片区",P.style.display="none",P.setAttribute("class",""),E=[],w=[],dd.postMessage({type:"showDistrict",val:{localAdm:A[A.length-1],selAll:!1}})}})},P.onclick=function(){new PickerView({bindElem:P,data:u,title:"商圈/片区",leftText:"取消",rightText:"确定",rightFn:function(e){var t;E=[],w=[];var a=r.DistrictJson.findIndex(function(t){return t.name==e[0]});w.push(r.DistrictJson[a].code),E=e;var i=(t=r.DistrictJson[a].children).findIndex(function(t){return t.name==e[1]});w.push(t[i].code),P.innerText=E.join("-"),P.setAttribute("class","active")}})}}]);