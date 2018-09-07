/**
 * Created by kongjian on 2017/6/26.
 */
Custom.CanvasLayer = function(){
    this.width = 0;
    this.height= 0;
    this.requestUUI ='';

    //当前屏幕的瓦片层行列号集合
    this.grid =[];
    //上次请求成功的瓦片的层行列号集合
    this.oldGrid = [];
    //注记图层对象
    this.gwvtAnno = null;
    //数据源集合
    this.dataSource = [];
    //当前视口内的注记要素集合
    this.labelDatas = [];
    //如果dataSource是urldatasource,那么样式纹理是否加载完成。 如果只有localDataSource,则为true
    this.isReady = false;

    //地图的最大范围
    this.maxExtent = [];
    //地图的当前视口
    this.extent =[];
    //地图的当前分辨率
    this.res = 0;
    //瓦片大小
    this.tileSize = 256;
    //是否允许拾取
    this.hitDetection = false;
    //当前屏幕内的features
    this.features = [];

    //正在请求中的瓦片请求集合,还没返回的请求
    this.requestingTiles = {};

    //当前应该请求的瓦片集合
    this.currentRequestTiles = {};

    //上次在请求队列中命中的瓦片
    this.onceHitTiles = {};

    //当前请求成功的瓦片注记数据
    this.currentTileDatas = [];

    // 是否支持有isImportant属性
    this.hasImportant = true;
    /**
     * 初始化
     */
    this.init = function(w,h,tileSize,gwvtAnno){
        this.tileSize = tileSize;
        this.gwvtAnno = gwvtAnno;
        this.initCanvas(w,h);
        this.loadResources();
    };

    /**
     * 加载dataSource的样式文件和纹理，所有dataSource的
     * 样式文件和纹理加载完成，则isReady设置为ture
     */
    this.loadResources = function(){
        this.labelDatas = [];
        if(this.dataSource.length == 0){
            this.isReady = false;
            return;
        }

        var reqArr = [];
        for(var i = 0;i<this.dataSource.length;i++){
            var ds = this.dataSource[i];
            if(ds.type == 'URLDataSource'){
                reqArr = reqArr.concat(ds.loadStyle());
            }
            if(ds.type == 'LocalDataSource'){
                reqArr = reqArr.concat(ds.loadTexture());
            }
        }

        if(reqArr.length > 0){
            Promise.all(reqArr).then(function(){
                this.isReady = true;
                //重新请求注记数据
                if(this.grid.length > 0){
                    this.requestLabelTiles(this.grid);
                }
            }.bind(this));
        }else{
            this.isReady = true;
        }
    };

    /**
     * 初始化画布
     * Parameters :
     * w - 图层宽
     * h - 图层高
     */
    this.initCanvas = function (w,h){
        this.width = w;
        this.height= h;
        if(!this.root){
            this.root = document.createElement("canvas");
        }
        this.root.style.width = this.width + "px";
        this.root.style.height = this.height + "px";
        this.root.width = this.width;
        this.root.height = this.height;
        this.canvas = this.root.getContext("2d",{isQuality:true});


        if (this.hitDetection) {
            if(!this.hitCanvas){
                this.hitCanvas = document.createElement("canvas");
            }
            this.hitCanvas.style.width = this.width + "px";
            this.hitCanvas.style.height = this.height + "px";
            this.hitCanvas.width = this.width;
            this.hitCanvas.height = this.height;
            this.hitContext = this.hitCanvas.getContext("2d",{isQuality:true});
        }
    };


    /**
     * 平移或者缩放开始
     */
    this.changStart = function(){
        this.requestUUI = new UUID().valueOf();
    };

    /**
     * 添加数据源
     * Parameters :
     * dataSource
     */
    this.addDataSource = function(dataSource){
        if(dataSource.type =='URLDataSource'){
            dataSource.url = dataSource.url + '&tilesize='+this.tileSize;
        }

        if(dataSource.type =='URLDataSource' || dataSource.type =='LocalDataSource'){
            this.dataSource.push(dataSource);
        }
    };

    /**
     * 根据dataSoucceId移除数据源
     * Parameters :
     * dataSoucceId
     */
    this.removeDataSourceById = function(dataSoucceId){
        for(var i = 0;i<this.dataSource.length;i++){
            if(this.dataSource[i].id == dataSoucceId){
                this.dataSource.splice(i,1);
                return;
            }
        }
    };

    /**
     * 根据dataSoucceId获取数据源
     * Parameters :
     * dataSoucceId
     */
    this.getDataSourceById = function(dataSoucceId){
        for(var i = 0;i<this.dataSource.length;i++){
            if(this.dataSource[i].id == dataSoucceId){
                return this.dataSource[i];
            }
        }
    };

    /**
     * 清空画布
     */
    this.clean = function(){
        this.canvas.clearRect(0, 0, this.width, this.height);
        if(this.hitContext){
            this.hitContext.clearRect(0, 0, this.width, this.height);
        }
    };

    /**
     * 重新绘制注记要素，当动态更改DataSouce数据源后，需要调用redraw方法
     */
    this.redraw = function(){
        if(this.grid.length == 0){
            return;
        }
        //所有的要素重新加载
        this.oldGrid = [];
        //重新加载样式，纹理文件
        this.loadResources();
    };

    /**
     * 请求注记瓦片
     * Parameters :
     * grid - 当前视口内，瓦片的层行列号集合
     * zoomChanged - 是否进行了缩放操作
     */
    this.requestLabelTiles = function (grid,zoomChanged){
        this.grid = grid;
        //如果数据源没有准备好
        if(!this.isReady){
            return;
        }

        var tiles = this.getTiles(grid);
        var requestTiles = tiles.requestTiles;
        //上次请求过的，不需要再请求的瓦片
        this.noRequestTiles = tiles.noRequestTiles;
        var requestTileUrls = this.getRequestTileUrls(requestTiles);
        this.sendRequest(requestTileUrls);
    };

    /**
     * 获取localDataSource中在当前屏幕范围内的注记要素
     */
    this.getLocalLabelDatas = function(){
        var localFeatures = [];

        for(var i = 0;i<this.dataSource.length;i++){
            var ds = this.dataSource[i];
            if(ds.type == 'LocalDataSource'){
                for(var j = 0;j<ds.features.length;j++){
                    var feature = ds.features[j];
                    //找出在当前视口内的要素
                    if(feature.inBounds(this.extent)){
                        if(feature.type == 1){
                            //转换要素的地理坐标为屏幕坐标
                            feature.sourceAngleData = [[feature.sourceData,0]];
                            feature.transformData(this.extent,this.res);
                            feature.label = feature.getFeatureLabel();
                            feature.textures = ds.textures;
                            localFeatures.push(feature);
                        }

                        if(feature.type == 2){
                            feature.label = feature.getFeatureLabel();
                            feature.textures = ds.textures;
                            localFeatures = localFeatures.concat(this.cutLineFeature(feature,true));
                        }
                    }
                }
            }
        }

        return localFeatures;
    };


    /**
     * 计算需要请求的瓦片和重复的不需要请求的瓦片
     * Parameters :
     * grid - 当前视口内，瓦片的层行列号集合
     */
    this.getTiles = function(grid){
        //需要请求的瓦片集合
        var requestTiles = [];
        //上次请求过的，不需要再请求的瓦片
        var noRequestTiles = [];
        for(var i = 0;i<grid.length;i++){
            var item = grid[i];
            var isNewTile = true;
            for(var j =0;j<this.oldGrid.length;j++){
                var oldItem = this.oldGrid[j];
                if(item.row == oldItem.row && item.col == oldItem.col && item.level == oldItem.level){
                    isNewTile = false;
                    noRequestTiles.push(oldItem);
                    break;
                }
            }

            if(isNewTile){
                requestTiles.push(item);
            }
        }
        return {requestTiles:requestTiles,noRequestTiles:noRequestTiles};
    };

    /**
     * 计算需要请求的瓦片的url
     * Parameters :
     * requestTiles - 需要请求的瓦片层行列号集合
     */
    this.getRequestTileUrls = function(requestTiles){
        this.currentRequestTiles = {};
        this.currentTileDatas = [];
        for(var i = 0;i<this.dataSource.length;i++){
            var dataSource = this.dataSource[i];
            //url数据源
            if(dataSource.type == 'URLDataSource'){
                var url = dataSource.url;
                for(var j = 0;j<requestTiles.length;j++){
                    var item = requestTiles[j];
                    var tileUrl  = url.replace('${x}',item.col).replace('{x}',item.col);
                    tileUrl = tileUrl.replace('${y}',item.row).replace('{y}',item.row);
                    tileUrl = tileUrl.replace('${z}',item.level).replace('{z}',item.level);

                    if(dataSource.urlArray.length == 0){
                        this.currentRequestTiles[tileUrl] = {url:tileUrl,xyz:item,dataSourceId:dataSource.id,dataType:'json'};
                    }else{
                        //从urlArray中随机取出一个url
                        var len = dataSource.urlArray.length-1;
                        var index = Math.round(Math.random()*len);
                        var url = dataSource.urlArray[index];

                        var array = tileUrl.split('/mapserver');
                        var partUrl = array[1];
                        url = url + '/mapserver'+partUrl;
                        this.currentRequestTiles[url] = {url:url,xyz:item,dataSourceId:dataSource.id,dataType:'json'};
                    }
                }
            }
        }


        //当前需要请求的瓦片，在请求队列中命中的瓦片请求
        var hitTiles = {};
        //如果正在请求的瓦片中，有当前需要请求的，则不需要重复请求
        var requestTileUrls = [];
        for(var url in this.currentRequestTiles){
            if(this.requestingTiles[url]){
                hitTiles[url] = 1;
            }else{
                requestTileUrls.push(this.currentRequestTiles[url]);
            }
        }

        //终止不需要的请求
        for(var tileUrl in this.requestingTiles){
            if(!hitTiles[tileUrl] && !this.onceHitTiles[tileUrl]){
                this.requestingTiles[tileUrl].abort();
                delete this.requestingTiles[tileUrl];
            }
        }

        this.onceHitTiles = hitTiles;
        return requestTileUrls;
    };

    /**
     * 发送请求，取注记瓦片数据
     * Parameters :
     * requestTileUrls - 需要请求的瓦片url集合
     */
    this.sendRequest = function(requestTileUrls){
        if(requestTileUrls.length == 0){
            this.sendSuccess(null);
            return;
        }

        this.currentTequestUUI = this.requestUUI;
        for(var i =0;i < requestTileUrls.length;i++){
            var item = requestTileUrls[i];
            var promise = Custom.getParamJSON(item);
            this.requestingTiles[item.url] = promise.xhr;
            promise.then(this.tileSuccessFunction.bind(this),this.tileFailFunction.bind(this));
        }
    };

    /**
     * 单个瓦片注记请求成功的回调
     */
    this.tileSuccessFunction = function(data){
        var url = data.param.url;
        //删除正在请求的url
        delete this.requestingTiles[url];

        //如果返回的数据，是当前需要的数据
        if(this.currentRequestTiles[url]){
            delete this.currentRequestTiles[url];
            this.currentTileDatas.push(data);

            //如果所有的瓦片请求成功
            if(this.isEmptyObject(this.currentRequestTiles) && this.currentTequestUUI == this.requestUUI){
                this.sendSuccess(this.currentTileDatas);
            }
        }
    };

    //判断map是否为空
    this.isEmptyObject = function(e) {
        for (var t in e)
            return !1;
        return !0
    };

    /**
     * 单个瓦片注记请求失败的回调
     */
    this.tileFailFunction = function(data){
        var url = data.param.url;
        delete this.requestingTiles[url];

        //如果返回的数据，是当前需要的数据
        if(this.currentRequestTiles[url]){
            delete this.currentRequestTiles[url];
            //如果所有的瓦片请求成功
            if(this.isEmptyObject(this.currentRequestTiles)){
                this.sendSuccess(this.currentTileDatas);
            }
        }
    };

    /**
     * 请求成功的回调函数，没有请求url，也会执行该回调
     * Parameters :
     * results - 请求成功的结果
     */
    this.sendSuccess = function(results){
        var labelDatas = [];
        //如果有请求的返回结果
        if(results){
            labelDatas = this.parseFeature(results);
        }
        //合并上次在当前视口范围内的注记要素(不包括本地要素)
        labelDatas = this.mergeLabelData(labelDatas,this.noRequestTiles);

        //获取localDataSource中在当前屏幕范围内的注记要素
        var localFeatures = this.getLocalLabelDatas();
        labelDatas = labelDatas.concat(localFeatures);
        //更新前端图层的注记要素集合
        this.labelDatas = labelDatas;
        //进行避让
        this.avoidlabelDatas = GAnnoAvoid.defaultAvoid(labelDatas,this.hasImportant);
        //更新grid
        this.oldGrid = this.grid;
        //重置图层位置
        this.gwvtAnno.resetCanvasDiv();
        //绘制注记要素
        this.draw(this.avoidlabelDatas,1);
    };

    /**
     * 解析返回的注记信息
     * Parameters:
     * results - 请求返回的注记数据
     * Returns:
     * labelDatas - 设置过样式,坐标由瓦片内坐标转为屏幕坐标的注记数据
     */
    this.parseFeature = function(results){
        var layerDatasStyleMap = {};
        for(var i = 0;i<results.length;i++){
            var tileData = results[i];
            var layers = tileData.data;
            var xyz = tileData.param.xyz;
            for(var key in layers){
                var layerData = layers[key];
                layerData.xyz = xyz;
            }

            var dataSourceId = tileData.param.dataSourceId;
            if(!layerDatasStyleMap[dataSourceId]){
                layerDatasStyleMap[dataSourceId] = [];
            }
            layerDatasStyleMap[dataSourceId] = layerDatasStyleMap[dataSourceId].concat(layers);
        }

        var labelDatas = [];
        for(var dsId in layerDatasStyleMap){
            var layerDatas = layerDatasStyleMap[dsId];
            var dataSource = this.getDataSourceById(dsId);
            if(layerDatas.length > 0 && dataSource.styleFun){
                //设置样式
                var itemDatas = [];
                var level = results[0].param.xyz.level;
                var drawer = new LabelDrawer(layerDatas,level,itemDatas);
                dataSource.styleFun.call({}, drawer,level);

                //转换瓦片坐标为屏幕坐标,并构造label数据
                for(var j = 0;j<itemDatas.length;j++){
                    var itemData =  itemDatas[j];
                    itemData.textures = dataSource.textures;
                    labelDatas = labelDatas.concat(this.parseItemData(itemData));
                }
            }
        }

        return labelDatas;
    };

    /**
     * 将注记几何数据转换为相对本地的屏幕坐标
     * Parameters:
     * itemData - 瓦片内坐标的注记数据
     * Returns:
     * labelDatas - 设置过样式,坐标由瓦片内坐标转为屏幕坐标的注记数据
     */
    this.parseItemData = function (itemData){
        var labelDatas = [];
        //点
        if(itemData.type == 1){
            labelDatas =  this.parsePoint(itemData);
        }
        //线
        if(itemData.type == 2){
            if(itemData[0] =='LINESTRING'){
                labelDatas = labelDatas.concat(this.parseLine(itemData));
            }
            //多线
            if(itemData[0] =='MULTILINESTRING'){
                labelDatas = labelDatas.concat(this.parseMultiLine(itemData));
            }
        }
        return labelDatas;
    };

    /**
     * 将点注记几何数据转换为相对本地的屏幕坐标
     * Parameters:
     * itemData - 瓦片内坐标的注记数据
     * Returns:
     * points - 设置过样式,坐标由瓦片内坐标转为屏幕坐标的注记数据
     */
    this.parsePoint = function(itemData){
        var points = [];
        var point = itemData[2];
        var sourceAngleData = [[point,0]];
        var p = this.transformData(sourceAngleData,itemData.xyz);
        var style = itemData.style;
        var label = itemData.fieldValueMap[style.labelfield];
        points.push({id:Math.round(Math.random()*256*256*256),type:itemData.type,datas:p,sourceData:point,sourceAngleData:sourceAngleData,label:label,
            attributes:itemData.fieldValueMap,style:style,textures:itemData.textures,xyz:itemData.xyz});
        return points;
    };

    /**
     * 将线注记几何数据转换为相对本地的屏幕坐标
     * Parameters:
     * itemData - 瓦片内坐标的注记数据
     * Returns:
     * lines - 设置过样式,坐标由瓦片内坐标转为屏幕坐标的注记数据
     */
    this.parseLine = function(itemData){
        var lines = [];
        var style = itemData.style;

        var line = this.getLine(itemData[2]);

        var label = itemData.fieldValueMap[style.labelfield];
        var feature = {id:Math.round(Math.random()*256*256*256),type:itemData.type,sourceData:line,label:label,
            attributes:itemData.fieldValueMap,style:style,textures:itemData.textures,xyz:itemData.xyz};
        lines = lines.concat(this.cutLineFeature(feature,false));
        return lines;
    };

    /**
     * 递归方法，从lineString的多层级数据里面获取line数据
     * Parameters:
     * itemData - 瓦片内坐标的注记数据
     */
    this.getLine = function(itemData){
        if(itemData.length > 2){
            return itemData;
        }else{
            return this.getLine(itemData[0]);
        }
    };

    /**
     * 将多线注记几何数据转换为相对本地的屏幕坐标
     * Parameters:
     * itemData - 瓦片内坐标的注记数据
     * Returns:
     * multiLines - 设置过样式,坐标由瓦片内坐标转为屏幕坐标的注记数据
     */
    this.parseMultiLine = function(itemData){
        var multiLines = [];
        var style = itemData.style;
        for(var i=0;i<itemData[2][0][0].length;i++){
            var line = itemData[2][0][0][i];
            var label = itemData.fieldValueMap[style.labelfield];
            var feature = {id:Math.round(Math.random()*256*256*256),type:itemData.type,sourceData:line,label:label,
                attributes:itemData.fieldValueMap,style:style,textures:itemData.textures,xyz:itemData.xyz};
            multiLines = multiLines.concat(this.cutLineFeature(feature,false));
        }
        return multiLines;
    };

    /**
     * 将线切多段，分为线文字，线编码，线箭头,并转换为屏幕坐标
     * Parameters:
     * feature - 瓦片内坐标的注记数据
     * isLocal - true为本地Feature,false为远程请求的feature
     * Returns:
     * features - 切好的线文字，线编码，线箭头要素集合
     */
    this.cutLineFeature = function (feature,isLocal){
        var features = GAnnoAvoid.cutLineFeature(feature);
        //转换为屏幕坐标
        for(var i = 0;i<features.length;i++){
            var f = features[i];
            if(isLocal){
                f.datas = feature.transformData(this.extent,this.res);
            }else{
                f.datas = this.transformData(f.sourceAngleData,f.xyz);
            }
        }
        return features;
    };

    /**
     * 将瓦片内坐标转换为当前屏幕坐标
     * Parameters:
     * points - 瓦片内坐标数组,item示例：[[12,20],0] [12,20]为点坐标，0为旋转的角度
     * xyz - 瓦片的层行列号
     * Returns:
     * rdata - 本地屏幕内坐标数组
     */
    this.transformData = function(points,xyz){
        //取出当前视口左上角的地理坐标
        var left = this.extent[0];
        var top = this.extent[3];

        //地图最大的范围
        var mLeft = this.maxExtent[0];
        var mTop = this.maxExtent[3];

        //计算坐上角的屏幕坐标
        var x = (left - mLeft) / this.res;
        var y = (mTop - top) / this.res;

        var rPoint = [];

        for(var i = 0;i<points.length;i++){
            var point = points[i][0];
            var gx = point[0] + xyz.col * this.tileSize;
            var gy = point[1] + xyz.row * this.tileSize;
            var p = [gx - x,gy - y];
            rPoint.push([p,points[i][1]]);
        }
        return rPoint;
    };

    /**
     * 将本次请求的注记数据和上次在本视口范围内的要素合并
     * Parameters:
     * labelDatas - 本次请求到注记数据
     * noRequestTiles - 当前视口中不需要请求的瓦片层行列号集合
     * Returns:
     * labelDatas - 合并后的注记数据，当前视口整个屏幕的数据
     */
    this.mergeLabelData = function (labelDatas,noRequestTiles){
        for(var i = 0;i<this.labelDatas.length;i++){
            var labelData = this.labelDatas[i];
            var xyz = labelData.xyz;
            if(xyz){ //排除本地注记要素
                for(var j = 0;j<noRequestTiles.length;j++){
                    var noRequestTile  = noRequestTiles[j];
                    if(xyz.row == noRequestTile.row && xyz.col == noRequestTile.col && xyz.level == noRequestTile.level){
                        //重新计算当前屏幕坐标
                        labelData.datas = this.transformData(labelData.sourceAngleData,labelData.xyz);
                        labelDatas.push(labelData);
                        break;
                    }
                }
            }
        }

        return labelDatas;
    };


    /**
     * 画注记
     * Parameters:
     * features - 设置过样式，转换过为屏幕坐标，避让过的注记数据
     */
    this.draw = function(features){
        this.clean();
        this.features = [];
        for(var i = 0;i<features.length;i++){
            var feature = features[i];
            this.features[feature.id] = feature;
            //画点注记
            if(feature.type == 1){
                Custom.GDrawGeomerty.drawPointIcon(this.canvas,this.hitContext, this.hitDetection, feature,feature.textures);
                Custom.GDrawGeomerty.drawPoint(this.canvas,this.hitContext, this.hitDetection,feature);
                continue;
            }
            //画线注记
            if(feature.type == 2){
                Custom.GDrawGeomerty.drawLine(this.canvas,feature);
            }
        }
    };

    /**
     * 根据屏幕坐标获取feature
     * Parameters :
     * x
     * y
     */
    this.getFeatureByXY = function(x,y) {
        var feature = null;
        if (this.hitDetection) {
            var featureId;
            var data = this.hitContext.getImageData(x, y, 1, 1).data;
            if (data[3] === 255) { // antialiased
                var id = data[2] + (256 * (data[1] + (256 * data[0])));
                if (id) {
                    featureId = id - 1 ;
                    try {
                        feature = this.features[featureId];
                    } catch(err) {
                    }
                }
            }
        }
        return feature;
    }

}