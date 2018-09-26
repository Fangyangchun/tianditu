
        if (navigator.userAgent.toLowerCase().indexOf('dingtalk') > -1) {
            document.writeln('<script src="https://appx/web-view.min.js"' + '>' + '<' + '/' + 'script>');
        }
        // dd.getEnv(function(res) {
        //     if (!res.miniprogram) {
        //         dd.alert({
        //             content:JSON.stringify('运行出错')
        //         });
        //     }
        // });
        var initLatlng, initZoom = 10, cityName, newCenterData,  markDatas = [],
        map, markers, mapParams, idx, filterDatas, pickerOpt;
        var taskStatus, curTaskStatus, legalEntityCata, curLegalEntityCata, checkType, curCheckType, legalEntityTag, curLegalEntityTag, areaName, areaCode, currentAreaCode; 
        var btn = document.getElementById("picker-btn");
        dd.postMessage({type: 'init'});
        dd.onMessage = function(e) {
            initLatlng = {lon: e.lon, lat: e.lat} || {lon: 120.14989, lat: 30.27751};  // 默认经纬度为蓝天商务中心
            cityName = e.cityName || "杭州市";
            markDatas = e.markDatas;
            filterDatas = e.filterDatas;
            drawMap(e.init);
        }
        function drawMap(e) {
            if (e) {
                init();
                return; 
            }
            reductionMap()
            drawMarekers()
        }

        function init() {
            map = L.map('map',{crs:L.CRS.CustomEPSG4326,center: initLatlng, minZoom: 5, zoom: initZoom, inertiaDeceleration:15000, zoomControl: false});
            var tileAddress = 'http://ditu.zjzwfw.gov.cn/mapserver/vmap/zjvmap/getMAP?x={x}&y={y}&l={z}&styleId=tdt_biaozhunyangshi_2017';

            var layer = new L.GXYZ(tileAddress, {tileSize:512, minZoom: 5});
            map.addLayer(layer);

            // 添加注记图层
            // var labelLayer = new L.GWVTAnno({tileSize:512});
            // var dataSource = new Custom.URLDataSource();
            // dataSource.url = 'http://ditu.zjzwfw.gov.cn/mapserver/label/zjvmap/getDatas?x=${x}&y=${y}&l=${z}&styleId=tdt_biaozhunyangshi_2017';
            // labelLayer.addDataSource(dataSource);
            // map.addLayer(labelLayer);
            var labelLayer = new L.GXYZ('http://ditu.zjzwfw.gov.cn/mapserver/label/zjvmap/getImg?x={x}&y={y}&l={z}&styleId=tdt_biaozhunyangshi_2017',{tileSize:512,hitDetection:true,keepBuffer:0,updateWhenZooming:false});
            map.addLayer(labelLayer);

            markers = L.markerClusterGroup();
            drawMarekers();
            map.addLayer(markers);

            initFilterHtml();
            getPickerOpt(); 

            map.on('click', function (e) {
                if($(".detail_info").hasClass('active')) { 
                    $(".detail_info").removeClass('active');
                }
            });
            

        }

        function getPickerOpt() {
            pickerOpt = {};
            $.each(filterDatas.SlicenoLDNameJson, function (index, val) {
                var idxKey = val.addressName;
                pickerOpt[idxKey] = [];
                if (val.codeAddress) {
                    $.each(val.codeAddress, function (idx, value) {
                        pickerOpt[idxKey].push(value.addressName);
                    })
                }
            })
        }

        function initFilterHtml () {
            var marketHtml = '', typeHtml = '', statusHtml = '', tagHtml = '';
            $.each(filterDatas.marketType, function (index, val) {
                marketHtml += '<dd data-paramCode="' + val.paramCode + '" data-paramCodeType="' + val.paramCodeType + '">' + val.paramName + '</dd>';
            });
            $.each(filterDatas.checkType, function (index, val) {
                typeHtml += '<dd data-paramCode="' + val.paramCode + '" data-paramCodeType="' + val.paramCodeType + '">' + val.paramName + '</dd>';
            });
            $.each(filterDatas.taskStatus, function (index, val) {
                statusHtml += '<dd data-paramCode="' + val.paramCode + '" data-paramCodeType="' + val.paramCodeType + '">' + val.paramName + '</dd>';
            });
            $.each(filterDatas.superviseTag, function (index, val) {
                tagHtml += '<dd data-paramCode="' + val.paramCode + '" data-paramCodeType="' + val.paramCodeType + '">' + val.paramName + '</dd>';
            });
            $('#MARKET_TYPE').html(marketHtml);
            $('#TASK_TYPE').html(typeHtml);
            $('#TASK_STATUS').html(statusHtml);
            $('#SUPERVISE_TAG').html(tagHtml);
            
            $(".filter_list").on('click', 'dd', function (ev) {
                $(this).siblings().removeClass('active')
                $(this).addClass('active');
                var type = $(ev.target)[0].dataset.paramcodetype;
                switch(type){
                    case "MARKET_TYPE":
                        legalEntityCata = $(ev.target)[0].dataset.paramcode;
                        break;
                    case "TASK_TYPE":
                        checkType = $(ev.target)[0].dataset.paramcode;
                        break;
                    case "TASK_STATUS":
                        taskStatus = $(ev.target)[0].dataset.paramcode;
                        break;
                    case "SUPERVISE_TAG":
                        legalEntityTag = $(ev.target)[0].dataset.paramcode;
                        break;
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
            if (metter == "") {
                $('.filterBtn span').html('不限' + '<i class="icon-arrow"></i>')
            } else {
                $('.filterBtn span').html(metter + '<i class="icon-arrow"></i>')
            }
            dd.postMessage({type: 'distance', val: metter});
        });

        $(".floating_box").on("click", function (e) {
            $(this).addClass('active');
            $('.custom-mask').addClass('custom-mask--visible');
            $('.filter_list_box').addClass('active');
            if (curTaskStatus) {
                $('#TASK_STATUS dd').removeClass('active');
                var arr = jQuery.makeArray($('#TASK_STATUS dd'));
                $.each(arr, function (index, val) {
                    if (val.dataset.paramcode == taskStatus) {
                        $(val).addClass('active');
                        return true
                    }
                })
            } else {
                $('#TASK_STATUS dd').removeClass('active');
            }
            if (currentAreaCode) {
                $('#picker-btn').text(areaName.join('-'));
                $('#picker-btn').addClass('active');
            } else {
                $('#picker-btn').text('管辖单位|片区');
                $('#picker-btn').removeClass('active');
            }
            if (curLegalEntityCata) {
                $('#MARKET_TYPE dd').removeClass('active');
                var arr = jQuery.makeArray($('#MARKET_TYPE dd'));
                $.each(arr, function (index, val) {
                    if (val.dataset.paramcode == legalEntityCata) {
                        $(val).addClass('active');
                        return true
                    }
                })
            } else {
                $('#MARKET_TYPE dd').removeClass('active');
            }
            if (curCheckType) {
                $('#TASK_TYPE dd').removeClass('active');
                var arr = jQuery.makeArray($('#TASK_TYPE dd'));
                $.each(arr, function (index, val) {
                    if (val.dataset.paramcode == checkType) {
                        $(val).addClass('active');
                        return true
                    }
                })
            } else {
                $('#TASK_TYPE dd').removeClass('active');
            }
            if (curLegalEntityTag) {
                $('#SUPERVISE_TAG dd').removeClass('active');
                var arr = jQuery.makeArray($('#SUPERVISE_TAG dd'));
                $.each(arr, function (index, val) {
                    if (val.dataset.paramcode == legalEntityTag) {
                        $(val).addClass('active');
                        return true
                    }
                })
            } else {
                $('#SUPERVISE_TAG dd').removeClass('active');
            }
        });

        $('.custom-mask').on('touchmove', function (ev) {
            ev.preventDefault();
        });

        $('.custom-container').on('touchmove', function(ev) {
            ev.preventDefault();
        });


        $('.iptSearch').on('keydown',function(e){
            // e.preventDefault();
            if(e.keyCode == 13){
                var keyWord = cityName + e.target.value;
                if (e.target.value) {
                    dd.postMessage({type: 'keyword', val: e.target.value});
                } else {
                    dd.alert({
                        content: "请输入查询关键字"
                    });
                }
            }
        });

        $('.btn_handler_box').on('click', function (ev) {
            var filter = $(ev.target).data('filter');
            if (filter == "" || filter == "1" || filter == "2" || filter == "3") {
                dd.postMessage({type: 'checkState', val: filter});
                return
            }
            if (filter == "reset") {
                map.setView([Number(initLatlng.lat), Number(initLatlng.lon)], initZoom);
                return
            }
        });
        $(".call_tel").on("click", function () {
            var phoneNum = $(".call_tel").data("tel");
            dd.postMessage({type: 'callPhone', val: phoneNum});
        });

        $(".menu_icon_3").on("click", function () {
            dd.postMessage({type: 'openMap', val: mapParams});
        });

        $(".detail").on("click", function () {
            dd.postMessage({type: 'detail', val: idx});
        });

        $(".gocheck").on("click", function () {
            dd.postMessage({type: 'gocheck', val: idx});
        });

        $(".unfind").on("click", function () {
            dd.postMessage({type: 'unfind', val: idx});
        });

        $(".reset_btn").on("click", function () {
            areaName = [];
            areaCode = [];
            btn.innerText = '管辖单位|片区';
            $(".filter_type dd").removeClass('active');
            $('.custom-mask').removeClass('custom-mask--visible');
            $(".floating_box").removeClass('active');
            $('.filter_list_box').removeClass('active');
            curTaskStatus = ''
            curLegalEntityCata = ''
            curCheckType = ''
            curLegalEntityTag = ''
            var preFilterData = {
                taskStatus: '',
                businessDistrict: '', //片区
                legalEntityCata: '',
                checkType: '',
                legalEntityTag: ''
            }
            dd.postMessage({type: 'businessDistrict', val: preFilterData});
        });

        $(".confirm_btn").on("click", function () {
            if (areaCode) {
                currentAreaCode = areaCode.join(',');
            } else {
                currentAreaCode = '';
            }
            curTaskStatus = ''
            curLegalEntityCata = ''
            curCheckType = ''
            curLegalEntityTag = ''
            var preFilterData = {
                    taskStatus: taskStatus || '',
                    businessDistrict: currentAreaCode, //片区
                    legalEntityCata: legalEntityCata || '',
                    checkType: checkType || '',
                    legalEntityTag: legalEntityTag || ''
            }
            $('.custom-mask').removeClass('custom-mask--visible');
            $(".floating_box").removeClass('active');
            $('.filter_list_box').removeClass('active');
            dd.postMessage({type: 'businessDistrict', val: preFilterData});
        });

        btn.onclick = function(){
            // data = {"小明家":[], "小红家":["小红爸爸", "小红妈妈"]}
            var pickerView = new PickerView({
                bindElem: btn,
                data: pickerOpt,
                // data: data,
                title: '片区/商圈',
                leftText: '取消',
                rightText: '确定',
                rightFn: function( selectArr ){
                    // var indexArry = btn.getAttribute("selectcache");
                    areaName = [];
                    areaCode = [];
                    var subSlicenoLDNameJson;
                    var firstIdx = filterDatas.SlicenoLDNameJson.findIndex(function(obj){return obj.addressName == selectArr[0]});
                    areaCode.push(filterDatas.SlicenoLDNameJson[firstIdx].code);
                    if (selectArr[1]) {
                        areaName = selectArr;
                        subSlicenoLDNameJson = filterDatas.SlicenoLDNameJson[firstIdx].codeAddress;
                        var subIdx = subSlicenoLDNameJson.findIndex(function(val){return val.addressName == selectArr[1]});
                        areaCode.push(subSlicenoLDNameJson[subIdx].code);
                    } else {
                        areaName.push(selectArr[0]);
                    }
                    btn.innerText = areaName.join('-');
                    btn.setAttribute("class", 'active');
                }
            });
        }
        

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
                    dd.alert({
                        content: "地址解析出错"
                    });
                }
            });
        }