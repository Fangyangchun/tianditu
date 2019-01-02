
        if (navigator.userAgent.toLowerCase().indexOf('dingtalk') > -1) {
            document.writeln('<script src="https://appx/web-view.min.js"' + '>' + '<' + '/' + 'script>');
        }
        var userId, token, baseUrl, tagAction;
        var initLatlng, initZoom = 10, cityName, newCenterData,  markDatas = [],
        map, curMarker, circle, markers, mapParams, idx, filterDatas, userLevel, showDistrict, pickerOpt, distPickerOpt;
        var taskStatus, curTaskStatus, legalEntityCata, curLegalEntityCata, checkType, curCheckType, 
        legalEntityTag, legalEntityTag1, legalEntityTag2, curLegalEntityTag, curLegalEntityTag1, curLegalEntityTag2,
        cityName = [], cityCode = [], distName = [], distCode = [], areaName = [], areaCode = [], currentAreaCode; 
        var tagPickerOpt, preTagMinOpt, minTagCode, curMinTagCode, curMinTagName, curMaxTagCode, maxTagCode, curMaxTagName;  // 监管标签-picker.data
        var btn = document.getElementById("picker-btn");
        var distBtn = document.getElementById("district-btn");
        var tagBtn = document.getElementById("tag-btn");
        dd.postMessage({type: 'init'});
        dd.onMessage = function(e) {
            userId = e.userId;
            token = e.token;
            baseUrl = e.baseUrl;
            tagAction = e.tagAction;
            if (e.lon && e.lat) {
                initLatlng = {lon: e.lon, lat: e.lat}
            } else {
                initLatlng = {lon: 120.14989, lat: 30.27751};  // 默认经纬度为蓝天商务中心
            }
            cityName = e.cityName || "杭州市";
            markDatas = e.markDatas;
            filterDatas = e.filterDatas;
            userLevel = e.userLevel;
            showDistrict = e.showDistrict;
            if (!e.init) {
                if (userLevel && showDistrict) {
                    distBtn.style.display =  'inline-block';
                    getDistPickerOpt()
                }
            }
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
            var tileAddress = 'https://ditu.zjzwfw.gov.cn/mapserver/vmap/zjvmap/getMAP?x={x}&y={y}&l={z}&styleId=tdt_biaozhunyangshi_2017';

            var layer = new L.GXYZ(tileAddress, {tileSize:512, minZoom: 5});
            map.addLayer(layer);

            // 添加注记图层
            // var labelLayer = new L.GWVTAnno({tileSize:512});
            // var dataSource = new Custom.URLDataSource();
            // dataSource.url = 'https://ditu.zjzwfw.gov.cn/mapserver/label/zjvmap/getDatas?x=${x}&y=${y}&l=${z}&styleId=tdt_biaozhunyangshi_2017';
            // labelLayer.addDataSource(dataSource);
            // map.addLayer(labelLayer);
            var labelLayer = new L.GXYZ('https://ditu.zjzwfw.gov.cn/mapserver/label/zjvmap/getImg?x={x}&y={y}&l={z}&styleId=tdt_biaozhunyangshi_2017',{tileSize:512,hitDetection:true,keepBuffer:0,updateWhenZooming:false});
            map.addLayer(labelLayer);
            var customIcon = L.icon({ 
                iconUrl: '../img/indoor_pub_poi_pressed.png',
                iconSize: [21, 30],
                iconAnchor:   [10, 20],
            }); 
            var curMarker = L.marker( 
                [map.getCenter().lat, map.getCenter().lng], 
                { 
                    draggable: false,
                    opacity: 1,
                    icon: customIcon
                }
            );
            map.addLayer(curMarker);

            markers = L.markerClusterGroup();
            drawMarekers();
            map.addLayer(markers);

            $('.whiteBtn').addClass('active');
            $('.check_title').text($('.whiteBtn').data('title')).fadeIn();
            initFilterHtml();
            
            if (userLevel) {
                btn.style.display = 'inline-block';
                getPickerOpt();
            } else {
                distBtn.style.display = 'inline-block';
                getDistPickerOpt();
            }

            getTagPickerOpt();

            map.on('click', function (e) {
                if($(".detail_info").hasClass('active')) { 
                    $(".detail_info").removeClass('active');
                }
            });
            

        }

        function getPickerOpt() {
            pickerOpt = {};
            $.each(filterDatas.SlicenoLDNameJson, function (index, val) {
                var idxKey = val.name;
                // pickerOpt[idxKey] = ['全部'];
                pickerOpt[idxKey] = [];
                if (val.children) {
                    $.each(val.children, function (idx, value) {
                        pickerOpt[idxKey].push(value.name);
                    })
                }
            })
        }

        function getDistPickerOpt() {
            distPickerOpt = {};
            $.each(filterDatas.DistrictJson, function (index, val) {
                var idxKey = val.name;
                distPickerOpt[idxKey] = ['全部'];
                // distPickerOpt[idxKey] = [];
                if (val.children) {
                    $.each(val.children, function (idx, value) {
                        distPickerOpt[idxKey].push(value.name);
                    })
                }
            })
        }

        function getTagPickerOpt() {
            tagPickerOpt = {};
            $.each(filterDatas.superviseTag, function (index, val) {
                var idxKey = val.paramName;
                tagPickerOpt[idxKey] = [];
                if (index == 0) {
                    ajaxMinTagOpt(idxKey, val.paramCode);
                }
            })
        }

        function ajaxMinTagOpt(name, code) {
            // preTagMinOpt = [{tagName: '垃圾填埋场', tagCode: 'A01900000010000014'},
            // {tagName: '环保部门20181126', tagCode: 'A01900000010000003'},
            // {tagName: '垃圾填埋场20181126', tagCode: 'A01900000010000003'},
            // {tagName: '环保部门', tagCode: 'A01900000010000003'}];
            // $.each(preTagMinOpt, function (idx, value) {
            //     tagPickerOpt[name].push(value.tagName);
            //
            // })
            $.ajax({
                async: false,
                type: "POST",
                url: encodeURI(baseUrl + tagAction),
                data: JSON.stringify({ 'encParamsStr': encrypt(JSON.stringify({ token: token, userId: userId, tagLargeCategory: code }))}),
                contentType: 'application/json',
                // dataType: "jsonp",
                success: function(res) {
                    if (typeof res == 'string') {
                        preTagMinOpt = JSON.parse(res).data;
                    } else {
                        preTagMinOpt = res.data;
                    }
                    $.each(preTagMinOpt, function (idx, value) {
                        tagPickerOpt[name].push(value.tagName);
                    })
                },
                error: function (err) {
                    dd.alert({ content: err.msg });
                }
            });
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
            // $.each(filterDatas.superviseTag, function (index, val) {
            //     tagHtml += '<dd data-paramCode="' + val.paramCode + '" data-paramCode1="' + val.paramCode1 
            //     + '" data-paramCode2="' + val.paramCode2 + '" data-paramCodeType="' + val.paramCodeType + '">' + val.paramName + '</dd>';
            // });
            $('#MARKET_TYPE').html(marketHtml);
            $('#TASK_TYPE').html(typeHtml);
            $('#TASK_STATUS').html(statusHtml);
            // $('#SUPERVISE_TAG').html(tagHtml);
            
            $(".filter_list dd").on('click', function (ev) {
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
                    // case "SUPERVISE_TAG_LARGECLASS":
                    //     legalEntityTag = $(ev.target)[0].dataset.paramcode;
                    //     legalEntityTag1 = $(ev.target)[0].dataset.paramcode1;
                    //     legalEntityTag2 = $(ev.target)[0].dataset.paramcode2;
                    //     break;
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
            if (cityCode.length > 0 || distCode.length > 0) {
                if (userLevel) {
                    $('#picker-btn').text(cityName.join('-'));
                    $('#picker-btn').addClass('active');
                    if (distName) {
                        $('#district-btn').text(distName.join('-'));
                        $('#district-btn').addClass('active');
                    }
                } else {
                    $('#district-btn').text(distName.join('-'));
                    $('#district-btn').addClass('active');
                }
            } else {
                if (userLevel) {
                    $('#picker-btn').text('市|区|县');
                    $('#picker-btn').removeClass('active');
                    $('#district-btn').text('商圈/片区');
                    $('#district-btn').removeClass('active');
                    $('#district-btn').css('display', 'none');
                } else {
                    $('#district-btn').text('商圈/片区');
                    $('#district-btn').removeClass('active');
                }
            }
            if (curMinTagCode) {
                $('#tag-btn').text(curMinTagName);
                $('#tag-btn').addClass('active');
            } else if (curMaxTagCode) {
                $('#tag-btn').text(curMaxTagName);
                $('#tag-btn').addClass('active');
            } else {
                $('#tag-btn').text('选择监管类型');
                $('#tag-btn').removeClass('active');
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
            // if (curLegalEntityTag) {
            //     $('#SUPERVISE_TAG dd').removeClass('active');
            //     var arr = jQuery.makeArray($('#SUPERVISE_TAG dd'));
            //     $.each(arr, function (index, val) {
            //         if (val.dataset.paramcode == legalEntityTag) {
            //             $(val).addClass('active');
            //             return true
            //         }
            //     })
            // } else {
            //     $('#SUPERVISE_TAG dd').removeClass('active');
            // }
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
                dd.postMessage({type: 'keyword', val: e.target.value || ''});
            }
        });

        $('.btn_handler_box li').on('click', function (ev) {
            var filter = $(ev.target).data('filter');
            var title = $(ev.target).data('title');
            $(this).closest("li").addClass('active').siblings().removeClass('active')
            if (filter == "" || filter == "1" || filter == "2" || filter == "3") {
                $('.check_title').text(title).fadeIn();
                dd.postMessage({type: 'checkState', val: filter});
                return
            }
            if (filter == "reset") {
                $('.check_title').fadeOut();
                markers.clearLayers();
                map.setView([Number(initLatlng.lat), Number(initLatlng.lon)], initZoom);
                circle = L.circle([map.getCenter().lat, map.getCenter().lng], {radius: 30});
                map.addLayer(circle);
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
            areaCode = []; distName = []; distCode = [];
            cityName = []; cityCode = [];
            $('#picker-btn').text('市|区|县');
            $('#district-btn').text('商圈/片区');
            $('#tag-btn').text('选择监管类型');
            $('#tag-btn').removeClass('active');
            if (userLevel) {
                $('#picker-btn').removeClass('active');
                $('#district-btn').removeClass('active');
                $('#district-btn').css('display', 'none');
            } else {
                $('#district-btn').removeClass('active');
            }
            $(".filter_type dd").removeClass('active');
            $('.custom-mask').removeClass('custom-mask--visible');
            $(".floating_box").removeClass('active');
            $('.filter_list_box').removeClass('active');
            curTaskStatus = ''
            curLegalEntityCata = ''
            curCheckType = ''
            // curLegalEntityTag = ''
            // curLegalEntityTag1 = ''
            // curLegalEntityTag2 = ''
            currentAreaCode = ''
            minTagCode = ''
            maxTagCode = ''
            curMinTagName = ''
            curMaxTagName = ''
            curMinTagCode = ''
            curMaxTagCode = ''
            var preFilterData = {
                taskStatus: '',
                businessDistrict: '', //片区
                legalEntityCata: '',
                checkType: '',
                // legalEntityTag: '',
                // legalEntityTag1: '',
                // legalEntityTag2: '',
                localAdm: '',
                curMinTagCode: '',
                curMaxTagCode: ''
            }
            dd.postMessage({type: 'businessDistrict', val: preFilterData});
        });

        $(".confirm_btn").on("click", function () {
            // areaCode = cityCode.concat(distCode);
            // if (areaCode) {
            //     currentAreaCode = areaCode.join(',');
            // } else {    
            //     currentAreaCode = '';
            // }
            curTaskStatus = taskStatus || ''
            curLegalEntityCata = legalEntityCata || ''
            curCheckType = checkType || ''
            curMinTagCode = minTagCode || ''
            curMaxTagCode = maxTagCode || ''
            // curLegalEntityTag = legalEntityTag || ''
            // curLegalEntityTag1 = legalEntityTag1 || ''
            // curLegalEntityTag2 = legalEntityTag2 || ''
            var preFilterData = {
                    taskStatus: curTaskStatus,
                    // businessDistrict: currentAreaCode, //片区
                    legalEntityCata: curLegalEntityCata,
                    checkType: curCheckType,
                    curMinTagCode: curMinTagCode,
                    curMaxTagCode: curMaxTagCode
                    // legalEntityTag: curLegalEntityTag,
                    // legalEntityTag1: curLegalEntityTag1,
                    // legalEntityTag2: curLegalEntityTag2
            }
            if (cityCode.length == 1) {
                preFilterData['localAdm'] = cityCode[0];
                preFilterData['businessDistrict'] = '';
            } else {
                if (distCode.length == 0) {
                    preFilterData['localAdm'] = cityCode[0];
                    preFilterData['businessDistrict'] = '';
                } else {
                    preFilterData['localAdm'] = distCode[0];
                    preFilterData['businessDistrict'] = distCode[1] || '';
                }
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
                title: '市|区|县',
                leftText: '取消',
                rightText: '确定',
                rightFn: function( selectArr ){
                    // var indexArry = btn.getAttribute("selectcache");
                    cityName = [];
                    cityCode = [];
                    var selAll;
                    var subSlicenoLDNameJson;
                    var firstIdx = filterDatas.SlicenoLDNameJson.findIndex(function(obj){return obj.name == selectArr[0]});
                    cityCode.push(filterDatas.SlicenoLDNameJson[firstIdx].code);
                    // if (selectArr[1] != '全部') {
                    //     cityName = selectArr;
                    //     selAll = false;
                    //     subSlicenoLDNameJson = filterDatas.SlicenoLDNameJson[firstIdx].children;
                    //     var subIdx = subSlicenoLDNameJson.findIndex(function(val){return val.name == selectArr[1]});
                    //     cityCode.push(subSlicenoLDNameJson[subIdx].code);
                    // } else {
                    //     selAll = true;
                    //     cityName.push(selectArr[0]);
                    // }
                    cityName = selectArr;
                    selAll = false;
                    subSlicenoLDNameJson = filterDatas.SlicenoLDNameJson[firstIdx].children;
                    var subIdx = subSlicenoLDNameJson.findIndex(function(val){return val.name == selectArr[1]});
                    cityCode.push(subSlicenoLDNameJson[subIdx].code);

                    btn.innerText = cityName.join('-');
                    btn.setAttribute("class", 'active');
                    distBtn.innerText = '商圈/片区';
                    distBtn.style.display = 'none';
                    distBtn.setAttribute("class", '');
                    distName = [];
                    distCode = [];
                    dd.postMessage({type: 'showDistrict', val: {localAdm: cityCode[cityCode.length - 1], selAll: selAll}});
                }
            });
        }

        distBtn.onclick = function(){
            var pickerView = new PickerView({
                bindElem: distBtn,
                data: distPickerOpt,
                title: '商圈/片区',
                leftText: '取消',
                rightText: '确定',
                rightFn: function( selectArr ){
                    distName = [];
                    distCode = [];
                    var subSlicenoLDNameJson;
                    var firstIdx = filterDatas.DistrictJson.findIndex(function(obj){return obj.name == selectArr[0]});
                    distCode.push(filterDatas.DistrictJson[firstIdx].code);
                    if (selectArr[1] != '全部') {
                        distName = selectArr;
                        subSlicenoLDNameJson = filterDatas.DistrictJson[firstIdx].children;
                        var subIdx = subSlicenoLDNameJson.findIndex(function(val){return val.name == selectArr[1]});
                        distCode.push(subSlicenoLDNameJson[subIdx].code);
                    } else {
                        distName.push(selectArr[0]);
                    }
                    // distName = selectArr;
                    // subSlicenoLDNameJson = filterDatas.DistrictJson[firstIdx].children;
                    // var subIdx = subSlicenoLDNameJson.findIndex(function(val){return val.name == selectArr[1]});
                    // distCode.push(subSlicenoLDNameJson[subIdx].code);

                    distBtn.innerText = distName.join('-');
                    distBtn.setAttribute("class", 'active');
                }
            });
        }

        tagBtn.onclick = function(){
            // data = {"小明家":[], "小红家":["小红爸爸", "小红妈妈"]}
            // console.log(filterDatas.superviseTag);
            var pickerView = new PickerView({
                bindElem: tagBtn,
                data: tagPickerOpt,
                title: '监管类型',
                leftText: '取消',
                rightText: '确定',
                getAjaxData: true,
                ajaxFn: function(selectArr) {
                    $.each(filterDatas.superviseTag, function (index, val) {
                        if (val.paramName == selectArr[0]) {
                            tagPickerOpt[val.paramName] = [];
                            ajaxMinTagOpt(val.paramName, val.paramCode);
                            return false;
                        }
                    })
                },
                rightFn: function(selectArr){
                    curMinTagName = '';
                    curMaxTagName = '';
                    maxTagCode = '';
                    minTagCode = '';
                    $.each(filterDatas.superviseTag, function (idx, val) {
                        if (val.paramName == selectArr[0]) {
                            maxTagCode = val.paramCode;
                            curMaxTagName = val.paramName;
                            return false;
                        }
                    });
                    $.each(preTagMinOpt, function (idx, value) {
                        if (value.tagName == selectArr[1]) {
                            minTagCode = value.tagCode;
                            curMinTagName = value.tagName;
                            return false;
                        }
                    })
                    if (selectArr[1]) {
                        $('#tag-btn').text(curMinTagName);
                        $('#tag-btn').addClass('active');
                    } else {
                        $('#tag-btn').text(curMaxTagName);
                        $('#tag-btn').addClass('active');
                    }
                }
            });
        }
        

        function drawMarekers() {
            markDatas.forEach(function (val, index) {
                var preState = val.checkState, marker;
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
            var reverseResolutionUrl = encodeURI("https://dh.ditu.zj.cn:9443/inverse/getInverseGeocoding.jsonp?&detail=1&zoom=11&latlon=" + e.lon + "," + e.lat + "&lat=&lon=&customer=2");
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
                    dd.alert({ content: "地址解析出错" });
                }
            });
        }