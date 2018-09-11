
	/**
	 * @auther zkx
	 */
	var address; //地址名称保存
	var officeName = $("#officelist").html();
	var facilityName = $("#facilitylist").html();
	var showMap = $.getUrlParam('showMap') == undefined ? '0' : $.getUrlParam('showMap'); //地图显示判断
	var resourcename = $.getUrlParam('resourcename') == undefined ? "幼儿园" : $.getUrlParam('resourcename'); //图层名称显示
	var locationY = $.getUrlParam('locationY') == undefined ? 30 : $.getUrlParam('locationY');
	var locationX = $.getUrlParam('locationX') == undefined ? 120 : $.getUrlParam('locationX');
	var maxx = $.getUrlParam('maxx') == undefined ? 120.1767977 : $.getUrlParam('maxx');
	var minx = $.getUrlParam('minx') == undefined ? 119.99331442 : $.getUrlParam('minx');
	var maxy = $.getUrlParam('maxy') == undefined ? 30.35774284 : $.getUrlParam('maxy');
	var miny = $.getUrlParam('miny') == undefined ? 30.07773723 : $.getUrlParam('miny');
	var mid = $.getUrlParam('mid') == undefined ? '' : $.getUrlParam('mid');
	var rid = $.getUrlParam('rid') == undefined ? '' : $.getUrlParam('rid');
	initAll(minx, miny, maxx, maxy);
	document.getElementById("locationX").value = locationX;
	document.getElementById("locationY").value = locationY;
	document.getElementById("maxx").value = maxx;
	document.getElementById("maxy").value = maxy;
	document.getElementById("minx").value = minx;
	document.getElementById("miny").value = miny;
	document.getElementById("selectOption_1").value = resourcename;
	// 分享ID
	document.getElementById("mid").value = mid;
	// 最多跑一次数据ID
	document.getElementById("rid").value = rid;
	var areaname = $.getUrlParam("areaname") == undefined ? "杭州市，西湖区" : $.getUrlParam("areaname");
	var addressFullName = addressName = "浙江省";
	if (areaname.indexOf("，") > -1) {
		var city = areaname.substring(0, areaname.indexOf("，"));
		var country = areaname.substring(areaname.indexOf("，") + 1);
		addressName = "浙江省" + city;
		addressFullName = "浙江省" + city + country;
	}
	$("#selectAddress_1").val(areaname);
	var areacode = "330106";
	if ($.getUrlParam("areacode") != undefined) {
		areacode = $.getUrlParam("areacode");
		document.getElementById("areacode").value = areacode;
	} else {
		getDefaultCode();
	}
	var resourceid = "CH0000052";
	document.getElementById("resourceid").value = resourceid;
	
	if ($.getUrlParam('resourceid') != undefined) {
		resourceid = $.getUrlParam('resourceid');
		document.getElementById("resourceid").value = resourceid;
		var name = areaname.replace(",", "");
		cart_getPosition(areacode, resourceid, name, resourcename);
	}else{
		cart_getPosition(areacode, resourceid, name, resourcename);
	}
	
	if(rid != null && rid != undefined && rid.length > 0){
		$(".select-input-address").hide();
		$("#map_z").css("top","0");
		$("#addrelist").hide();
	}

	function getDataStore() {
		return this.dataStore;
	}

	$(function () {
		$(".leaflet-control-zoom-in").html("");
		$(".leaflet-control-zoom-out").html("");
		$("#lk-icon img").on("click", function () {
			if ($(this).attr("src") == "images/map_traffic_layer_hl_new.png") {
				$(this).attr("src", "images/map_traffic_layer_hl_new_active.png");
			} else {
				$(this).attr("src", "images/map_traffic_layer_hl_new.png");
			}
		});
//		$("#tc-icon img").on("click", function () {
//			if ($(this).attr("src") == "images/map_layer_change_new.png") {
//				$(this).attr("src", "images/map_layer_change_new_active.png");
//			} else {
//				$(this).attr("src", "images/map_layer_change_new.png");
//			}
//		});


		//机构点击事件绑定
		bindBtnClick();
		mui.init({
			swipeBack: true //启用右滑关闭功能
		});
		mui('.mui-scroll-wrapper').scroll({
			deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		});


		setupWebViewJavascriptBridge(function () {
			/*这里回调以后就可以开始调用混合API了*/

			dd.biz.navigation.setTitle({
				title: '地图服务',
				onSuccess: function (result) {},
				onFail: function (err) {}
			});

		});

		var icon = [];
		var LeafIcon = L.Icon.extend({
			options: {
				iconSize: [25, 25],
				popupAnchor: [0, -25]
			}
		});
		var locateIcon = new LeafIcon({
			iconUrl: 'images/your_position.png'
		});
		var marker3;
		$("#tflist-icon").on("click", function () {
			dd.device.location.get({
				onSuccess: function (data) {
					map.setView([Number(data.latitude), Number(data.longitude)], 17);
					if (marker3 != null) {
						map.removeLayer(marker3);
					}
					marker3 = L.marker([Number(data.latitude), Number(data.longitude)], {
						icon: locateIcon
					}).addTo(map);
				},
				onFail: function () {}
			});
		});

		if (window.location.href.split("#").length == 4) {
			$("#addrelist").hide();
			$("#tflist-icon").hide();
			$(".select-input-address").hide();
			$("#map_z").css("top", 0);
		}

	});

	function test() {
		var str = "504F494E54283132302E3137333030362033302E32343034353429";
		var arr = str.split("");
		var result = "";
		for (var i = 0; i < arr.length / 2; i++) {
			var temp = "0x" + arr[i * 2] + arr[i * 2 + 1];
			var charValue = String.fromCharCode(temp);
			result += charValue;
		}
		return result;
	}
