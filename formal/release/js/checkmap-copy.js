!function(a){var e={};function t(s){if(e[s])return e[s].exports;var i=e[s]={i:s,l:!1,exports:{}};return a[s].call(i.exports,i,i.exports,t),i.l=!0,i.exports}t.m=a,t.c=e,t.d=function(a,e,s){t.o(a,e)||Object.defineProperty(a,e,{enumerable:!0,get:s})},t.r=function(a){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(a,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(a,"__esModule",{value:!0})},t.t=function(a,e){if(1&e&&(a=t(a)),8&e)return a;if(4&e&&"object"==typeof a&&a&&a.__esModule)return a;var s=Object.create(null);if(t.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:a}),2&e&&"string"!=typeof a)for(var i in a)t.d(s,i,function(e){return a[e]}.bind(null,i));return s},t.n=function(a){var e=a&&a.__esModule?function(){return a.default}:function(){return a};return t.d(e,"a",e),e},t.o=function(a,e){return Object.prototype.hasOwnProperty.call(a,e)},t.p="./",t(t.s=0)}([function(a,e){navigator.userAgent.toLowerCase().indexOf("dingtalk")>-1&&document.writeln('<script src="https://appx/web-view.min.js"><\/script>');var t,s,i,n,o,d,c,r,l,m,p,u,v,g,f,C,h,b,y,_,k,T,x,A,S,N,M,D=[],I=[],w=[],E=[],j=!0,P=10,z=[],G=[],K=[],U=[],Y=[],R=document.getElementById("picker-btn"),O=document.getElementById("district-btn");function B(a){var e="",t=[];t=a&&j?D:w,$.each(t,function(t,s){s.paramName.length>6?s.paramCode!=A||a?e+='<dd data-paramCode="'+s.paramCode+'" data-paramCode1="'+s.paramCode1+'" data-paramCode2="'+s.paramCode2+'" data-paramName="'+s.paramName+'">'+s.paramName.substring(0,5)+"…</dd>":e+='<dd class="active" data-paramCode="'+s.paramCode+'" data-paramCode1="'+s.paramCode1+'" data-paramCode2="'+s.paramCode2+'" data-paramName="'+s.paramName+'">'+s.paramName.substring(0,5)+"…</dd>":s.paramCode!=A||a?e+='<dd data-paramCode="'+s.paramCode+'" data-paramCode1="'+s.paramCode1+'" data-paramCode2="'+s.paramCode2+'" data-paramName="'+s.paramName+'">'+s.paramName+"</dd>":e+='<dd class="active" data-paramCode="'+s.paramCode+'" data-paramCode1="'+s.paramCode1+'" data-paramCode2="'+s.paramCode2+'" data-paramName="'+s.paramName+'">'+s.paramName+"</dd>"}),$("#Large_TAG").html(e),$(".large_tag_box").css("display","block"),$("#Large_TAG dd").on("click",function(){$(this).siblings().removeClass("active"),$(this).hasClass("active")||$(this).addClass("active");var a=$(this).data("paramcode");S=a,M=$(this).data("paramname"),T="",_="",$(".tagInfo").text(M),dd.postMessage({type:"smallTag",val:a})})}function J(a){var e=[];if((e=a&&j?I:E).length>0){var t="";$.each(e,function(e,s){s.tagName.length>6?s.tagCode!=k||a?t+='<dd data-tagCode="'+s.tagCode+'" data-tagName="'+s.tagName+'">'+s.tagName.substring(0,5)+"…</dd>":t+='<dd class="active" data-tagCode="'+s.tagCode+'" data-tagName="'+s.tagName+'">'+s.tagName.substring(0,5)+"…</dd>":s.tagCode!=k||a?t+='<dd data-tagCode="'+s.tagCode+'" data-tagName="'+s.tagName+'">'+s.tagName+"</dd>":t+='<dd class="active" data-tagCode="'+s.tagCode+'" data-tagName="'+s.tagName+'">'+s.tagName+"</dd>"}),$("#SMALL_TAG").html(t),$(".small_tag_box").css("display","block"),$("#SMALL_TAG dd").on("click",function(){$(this).siblings().removeClass("active"),$(this).hasClass("active")||$(this).addClass("active");var a=$(this).data("tagcode");_=a,T=$(this).data("tagname"),$(".tagInfo").text(M+" - "+T)})}else $("#SMALL_TAG").html(""),$(".small_tag_box").css("display","none")}function Z(){v={},$.each(m.DistrictJson,function(a,e){var t=e.name;v[t]=["全部"],e.children&&$.each(e.children,function(a,e){v[t].push(e.name)})})}function Q(){z.forEach(function(a,e){var t;switch(a.checkState){case"1":t=L.marker([a.lat,a.lon],{draggable:!1,opacity:1,icon:L.divIcon({className:"green-marker",html:"<p>"+(e+1)+"</p>"})});break;case"2":t=L.marker([a.lat,a.lon],{draggable:!1,opacity:1,icon:L.divIcon({className:"blue-marker",html:"<p>"+(e+1)+"</p>"})});break;case"3":t=L.marker([a.lat,a.lon],{draggable:!1,opacity:1,icon:L.divIcon({className:"red-marker",html:"<p>"+(e+1)+"</p>"})})}c.addLayer(t),t.on("click",function(a){$(".detail_info").hasClass("active")&&$(".detail_info").removeClass("active"),l=parseInt(a.originalEvent.target.textContent)-1,function(a){var e=encodeURI("https://dh.ditu.zj.cn:9443/inverse/getInverseGeocoding.jsonp?&detail=1&zoom=11&latlon="+a.lon+","+a.lat+"&lat=&lon=&customer=2");$.ajax({url:e,dataType:"jsonp",success:function(e){var t=e.city.value+e.dist.value+e.town.value+e.poi;$(".legalEntity_name").text(a.legalEntityName),$(".legalRep_name").text(a.legalRep),$(".legalRep_tel").text(a.tel),$(".address_info").text(t),$(".distance_info").text((parseInt(a.distance)/1e3).toFixed(2)),$(".call_tel").data("tel",a.tel),r={longitude:a.lon,latitude:a.lat,name:e.poi,address:e.poi},$(".detail_info").addClass("active")},error:function(a){dd.alert({content:"地址解析出错"})}})}(z[l])})})}dd.postMessage({type:"init"}),dd.onMessage=function(a){switch(a.dataType){case"init":a.userId,a.token,a.baseUrl,a.tagAction,n=a.lon&&a.lat?{lon:a.lon,lat:a.lat}:{lon:120.14989,lat:30.27751},a.cityName||"杭州市",z=a.markDatas,m=a.filterDatas,p=a.userLevel,a.showDistrict,t=a.tagLineData,function(){o=L.map("map",{crs:L.CRS.CustomEPSG4326,center:n,minZoom:5,zoom:P,inertiaDeceleration:15e3,zoomControl:!1});var a=new L.GXYZ("https://ditu.zjzwfw.gov.cn/mapserver/vmap/zjvmap/getMAP?x={x}&y={y}&l={z}&styleId=tdt_biaozhunyangshi_2017",{tileSize:512,minZoom:5});o.addLayer(a);var e=new L.GXYZ("https://ditu.zjzwfw.gov.cn/mapserver/label/zjvmap/getImg?x={x}&y={y}&l={z}&styleId=tdt_biaozhunyangshi_2017",{tileSize:512,hitDetection:!0,keepBuffer:0,updateWhenZooming:!1});o.addLayer(e);var i=L.icon({iconUrl:"../img/indoor_pub_poi_pressed.png",iconSize:[21,30],iconAnchor:[10,20]}),d=L.marker([o.getCenter().lat,o.getCenter().lng],{draggable:!1,opacity:1,icon:i});o.addLayer(d),c=L.markerClusterGroup(),Q(),o.addLayer(c),$(".whiteBtn").addClass("active"),$(".check_title").text($(".whiteBtn").data("title")).fadeIn(),function(){var a="",e="",i="",n="";$.each(m.marketType,function(e,t){a+='<dd data-paramCode="'+t.paramCode+'" data-paramCodeType="'+t.paramCodeType+'">'+t.paramName+"</dd>"}),$.each(m.checkType,function(a,t){e+='<dd data-paramCode="'+t.paramCode+'" data-paramCodeType="'+t.paramCodeType+'">'+t.paramName+"</dd>"}),$.each(m.taskStatus,function(a,e){i+='<dd data-paramCode="'+e.paramCode+'" data-paramCodeType="'+e.paramCodeType+'">'+e.paramName+"</dd>"}),$.each(t,function(a,e){n+='<dd data-dutyDeptCode="'+e.dutyDeptCode+'">'+e.dutyDeptName+"</dd>"}),$("#MARKET_TYPE").html(a),$("#TASK_TYPE").html(e),$("#TASK_STATUS").html(i),$("#SUP_TAG_LINE").html(n),$(".filter_list dd").on("click",function(a){$(this).siblings().removeClass("active"),$(this).hasClass("active")||$(this).addClass("active");var e=$(a.target)[0].dataset.paramcodetype;switch(e){case"MARKET_TYPE":C=$(a.target)[0].dataset.paramcode;break;case"TASK_TYPE":b=$(a.target)[0].dataset.paramcode;break;case"TASK_STATUS":g=$(a.target)[0].dataset.paramcode}}),$("#SUP_TAG_LINE dd").on("click",function(){s=$(this).data("dutydeptcode"),$(this).siblings().removeClass("active"),$(this).hasClass("active")||$(this).addClass("active"),$(".large_tag_box").css("display","none"),$(".small_tag_box").css("display","none"),j=!0,$(".tagInfo").text($(this).text()),$(".tagInfo-box").css("display","block"),dd.postMessage({type:"superTag",val:s})})}(),p?(R.style.display="inline-block",u={},$.each(m.SlicenoLDNameJson,function(a,e){var t=e.name;u[t]=[],e.children&&$.each(e.children,function(a,e){u[t].push(e.name)})})):(O.style.display="inline-block",Z());o.on("click",function(a){$(".detail_info").hasClass("active")&&$(".detail_info").removeClass("active")})}();break;case"updateMarks":z=a.markDatas,c.clearLayers(),o.setView([Number(n.lat),Number(n.lon)],P),Q();break;case"showDistrict":a.showDistrict&&(m=a.filterDatas,O.style.display="inline-block",Z());break;case"queryLargeTag":D=a.largeTagData,B(!0);break;case"querySmallTag":I=a.smallTagData,J(!0)}},$(".filterBtn").on("click",function(){$(".custom-mask").addClass("custom-mask--visible"),$(".custom-container").addClass("custom-container--visible"),$(".custom-container li").addClass("active")}),$(".custom-mask").on("click",function(){$(".custom-mask").removeClass("custom-mask--visible"),$(".floating_box").hasClass("active")?($(".floating_box").removeClass("active"),$(".filter_list_box").removeClass("active")):($(".custom-container").removeClass("custom-container--visible"),$(".custom-container li").removeClass("active"))}),$(".custom-container").on("click",function(a){$(".custom-mask").removeClass("custom-mask--visible"),$(".custom-container").removeClass("custom-container--visible"),$(".custom-container li").removeClass("active");var e=$(a.target).data("metter");""==e?$(".filterBtn span").html('不限<i class="icon-arrow"></i>'):$(".filterBtn span").html(e+'<i class="icon-arrow"></i>'),dd.postMessage({type:"distance",val:e})}),$(".floating_box").on("click",function(a){if($(this).addClass("active"),$(".custom-mask").addClass("custom-mask--visible"),$(".filter_list_box").addClass("active"),f){$("#TASK_STATUS dd").removeClass("active");var e=jQuery.makeArray($("#TASK_STATUS dd"));$.each(e,function(a,e){if(e.dataset.paramcode==g)return $(e).addClass("active"),!0})}else $("#TASK_STATUS dd").removeClass("active");if(K.length>0||Y.length>0?p?($("#picker-btn").text(G.join("-")),$("#picker-btn").addClass("active"),U&&($("#district-btn").text(U.join("-")),$("#district-btn").addClass("active"))):($("#district-btn").text(U.join("-")),$("#district-btn").addClass("active")):p?($("#picker-btn").text("市|区|县"),$("#picker-btn").removeClass("active"),$("#district-btn").text("商圈/片区"),$("#district-btn").removeClass("active"),$("#district-btn").css("display","none")):($("#district-btn").text("商圈/片区"),$("#district-btn").removeClass("active")),$(".tagInfo-box").css("display","none"),$(".large_tag_box").css("display","none"),$(".small_tag_box").css("display","none"),$("#SUP_TAG_LINE dd").removeClass("active"),j=!1,A){e=jQuery.makeArray($("#SUP_TAG_LINE dd"));$.each(e,function(a,e){if(e.dataset.dutydeptcode==i)return $(e).addClass("active"),!0}),B(!1),J(!1),k?$(".tagInfo").text(N+" - "+x):$(".tagInfo").text(N),$(".tagInfo-box").css("display","block")}else $(".tagInfo").text(""),$("#Large_TAG").html(""),$("#SMALL_TAG").html("");if(h){$("#MARKET_TYPE dd").removeClass("active");e=jQuery.makeArray($("#MARKET_TYPE dd"));$.each(e,function(a,e){if(e.dataset.paramcode==C)return $(e).addClass("active"),!0})}else $("#MARKET_TYPE dd").removeClass("active");if(y){$("#TASK_TYPE dd").removeClass("active");e=jQuery.makeArray($("#TASK_TYPE dd"));$.each(e,function(a,e){if(e.dataset.paramcode==b)return $(e).addClass("active"),!0})}else $("#TASK_TYPE dd").removeClass("active")}),$(".custom-mask").on("touchmove",function(a){a.preventDefault()}),$(".custom-container").on("touchmove",function(a){a.preventDefault()}),$(".iptSearch").on("keydown",function(a){13==a.keyCode&&dd.postMessage({type:"keyword",val:a.target.value||""})}),$(".btn_handler_box li").on("click",function(a){var e=$(a.target).data("filter"),t=$(a.target).data("title");return $(this).closest("li").addClass("active").siblings().removeClass("active"),""==e||"1"==e||"2"==e||"3"==e?($(".check_title").text(t).fadeIn(),void dd.postMessage({type:"checkState",val:e})):"reset"==e?($(".check_title").fadeOut(),c.clearLayers(),o.setView([Number(n.lat),Number(n.lon)],P),d=L.circle([o.getCenter().lat,o.getCenter().lng],{radius:30}),void o.addLayer(d)):void 0}),$(".call_tel").on("click",function(){var a=$(".call_tel").data("tel");dd.postMessage({type:"callPhone",val:a})}),$(".menu_icon_3").on("click",function(){dd.postMessage({type:"openMap",val:r})}),$(".detail").on("click",function(){dd.postMessage({type:"detail",val:l})}),$(".gocheck").on("click",function(){dd.postMessage({type:"gocheck",val:l})}),$(".unfind").on("click",function(){dd.postMessage({type:"unfind",val:l})}),$(".reset_btn").on("click",function(){[],U=[],Y=[],G=[],K=[],$("#picker-btn").text("市|区|县"),$("#district-btn").text("商圈/片区"),p?($("#picker-btn").removeClass("active"),$("#district-btn").removeClass("active"),$("#district-btn").css("display","none")):$("#district-btn").removeClass("active"),$(".filter_type dd").removeClass("active"),$(".custom-mask").removeClass("custom-mask--visible"),$(".floating_box").removeClass("active"),$(".filter_list_box").removeClass("active"),f="",h="",y="","",_="",S="",T="",M="",x="",N="",k="",A="",w=[],E=[],i="";dd.postMessage({type:"businessDistrict",val:{taskStatus:"",businessDistrict:"",legalEntityCata:"",checkType:"",localAdm:"",curMinTagCode:"",curMaxTagCode:""}})}),$(".confirm_btn").on("click",function(){f=g||"",h=C||"",y=b||"",k=_||"",A=S||"",x=T||"",N=M||"",w=D||[],E=I||[],i=s||"";var a={taskStatus:f,legalEntityCata:h,checkType:y,curMinTagCode:k,curMaxTagCode:A};1==K.length?(a.localAdm=K[0],a.businessDistrict=""):0==Y.length?(a.localAdm=K[0],a.businessDistrict=""):(a.localAdm=Y[0],a.businessDistrict=Y[1]||""),$(".custom-mask").removeClass("custom-mask--visible"),$(".floating_box").removeClass("active"),$(".filter_list_box").removeClass("active"),dd.postMessage({type:"businessDistrict",val:a})}),R.onclick=function(){new PickerView({bindElem:R,data:u,title:"市|区|县",leftText:"取消",rightText:"确定",rightFn:function(a){var e;G=[],K=[];var t=m.SlicenoLDNameJson.findIndex(function(e){return e.name==a[0]});K.push(m.SlicenoLDNameJson[t].code),G=a;var s=(e=m.SlicenoLDNameJson[t].children).findIndex(function(e){return e.name==a[1]});K.push(e[s].code),R.innerText=G.join("-"),R.setAttribute("class","active"),O.innerText="商圈/片区",O.style.display="none",O.setAttribute("class",""),U=[],Y=[],dd.postMessage({type:"showDistrict",val:{localAdm:K[K.length-1],selAll:!1}})}})},O.onclick=function(){new PickerView({bindElem:O,data:v,title:"商圈/片区",leftText:"取消",rightText:"确定",rightFn:function(a){var e;U=[],Y=[];var t=m.DistrictJson.findIndex(function(e){return e.name==a[0]});if(Y.push(m.DistrictJson[t].code),"全部"!=a[1]){U=a;var s=(e=m.DistrictJson[t].children).findIndex(function(e){return e.name==a[1]});Y.push(e[s].code)}else U.push(a[0]);O.innerText=U.join("-"),O.setAttribute("class","active")}})}}]);