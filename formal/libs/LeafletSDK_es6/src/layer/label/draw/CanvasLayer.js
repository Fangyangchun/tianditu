/**
 * Created by kongjian on 2017/6/26.
 */
const Cache = require('../../../utils/Cache');
const GDrawGeomerty = require('../avoid/GDrawGeomerty');
const {Promise,getParamJSON} = require('./../../../utils/es6-promise');
const LabelDrawer = require('./LabelDrawer');
const GAnnoAvoid = require('./../avoid/GAnnoAvoid');
const GCutLine = require('./../avoid/GCutLine');
class CanvasLayer{
    constructor() {
        this.width = 0;
        this.height= 0;

        //当前屏幕的瓦片层行列号集合
        this.grid =[];
        this.cache = new Cache(256);
        //注记图层对象
        this.gwvtAnno = null;
        //数据源集合
        this.dataSource = [];
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
        // 是否支持有isImportant属性
        this.hasImportant = true;
        //缩放比例
        this.ratio = 1;
        let canvas = document.createElement('CANVAS');
        let ctx =  canvas.getContext('2d',{isQuality:true});
        this.GAnnoAvoid = new GAnnoAvoid(ctx,false);
    }

    /**
     * 初始化
     */
    init(w,h,tileSize,gwvtAnno){
        this.tileSize = tileSize;
        this.gwvtAnno = gwvtAnno;
        this.initCanvas(w,h);
        this.loadResources();
    };

    /**
     * 加载dataSource的样式文件和纹理，所有dataSource的
     * 样式文件和纹理加载完成，则isReady设置为ture
     */
    loadResources(){
        if(this.dataSource.length == 0){
            this.isReady = false;
            return;
        }

        this.cache.clean();
        let reqArr = [];
        for(let i = 0;i<this.dataSource.length;i++){
            let ds = this.dataSource[i];
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
    initCanvas(w,h){
        this.width = w;
        this.height= h;
        if(!this.root){
            this.root = document.createElement("canvas");
        }
        this.root.style.width = this.width + "px";
        this.root.style.height = this.height + "px";
        this.root.width = this.width*this.ratio;
        this.root.height = this.height*this.ratio;
        this.root.id = 'labelCanvas';
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
     * 添加数据源
     * Parameters :
     * dataSource
     */
    addDataSource(dataSource){
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
    removeDataSourceById(dataSoucceId){
        for(let i = 0;i<this.dataSource.length;i++){
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
    getDataSourceById(dataSoucceId){
        for(let i = 0;i<this.dataSource.length;i++){
            if(this.dataSource[i].id == dataSoucceId){
                return this.dataSource[i];
            }
        }
    };

    /**
     * 清空画布
     */
    clean(){
        this.canvas.clearRect(0, 0, this.width*this.ratio, this.height*this.ratio);
        if(this.hitContext){
            this.hitContext.clearRect(0, 0, this.width, this.height);
        }
    };

    /**
     * 重新绘制注记要素，当动态更改DataSouce数据源后，需要调用redraw方法
     */
    redraw(){
        if(this.grid.length == 0){
            return;
        }
        this.cache.clean();
        //重新加载样式，纹理文件
        this.loadResources();
    };

    /**
     * 请求注记瓦片
     * Parameters :
     * grid - 当前视口内，瓦片的层行列号集合
     * zoomChanged - 是否进行了缩放操作
     */
    requestLabelTiles(grid,zoomChanged){
        this.grid = grid;
        //如果数据源没有准备好
        if(!this.isReady){
            return;
        }

        //获取需要请求的url
        let requestTileUrls = this.getRequestTileUrls(grid);
        this.sendRequest(requestTileUrls);
    };

    /**
     * 获取localDataSource中在当前屏幕范围内的注记要素
     */
    getLocalLabelDatas(){
        let localFeatures = [];
        for(let i = 0;i<this.dataSource.length;i++){
            let ds = this.dataSource[i];
            if(ds.type == 'LocalDataSource'){
                for(let j = 0;j<ds.features.length;j++){
                    let feature = ds.features[j];
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
     * 计算需要请求的瓦片的url
     * Parameters :
     * requestTiles - 需要请求的瓦片层行列号集合
     */
    getRequestTileUrls(grid){
        this.hitCacheUrls = [];
        this.currentTileDatas = [];
        //本次需要请求的url
        let requestTileUrls = {};
        //请求队列中找到的url集合
        let findedRequestUrls ={};
        for(let i = 0;i<this.dataSource.length;i++){
            let dataSource = this.dataSource[i];
            //url数据源
            if(dataSource.type == 'URLDataSource'){
                let url = dataSource.url;
                for(let j = 0;j<grid.length;j++){
                    let item = grid[j];
                    let tileUrl  = url.replace('${x}',item.col).replace('{x}',item.col);
                    tileUrl = tileUrl.replace('${y}',item.row).replace('{y}',item.row);
                    tileUrl = tileUrl.replace('${z}',item.level).replace('{z}',item.level);

                    //多域名url
                    if(dataSource.urlArray.length > 0){
                        let len = dataSource.urlArray.length-1;
                        let index = Math.round(Math.random()*len);
                        let domainUrl = dataSource.urlArray[index];

                        let array = tileUrl.split('/mapserver');
                        let partUrl = array[1];
                        tileUrl = domainUrl + '/mapserver'+partUrl;
                    }

                    //判断缓存中有没有该注记
                    let cacheItem = this.cache.getItem(tileUrl);
                    if(cacheItem){
                        this.hitCacheUrls.push(tileUrl);
                    }else{
                        //已经发送的请求队列中找,队列中没找到的需要发送请求
                        if(!this.requestingTiles[tileUrl]){
                            requestTileUrls[tileUrl] = {url:tileUrl,xyz:item,dataSourceId:dataSource.id,dataType:'json'};
                        }else{
                            findedRequestUrls[tileUrl] = true;
                        }
                    }
                }
            }
        }

        // console.log('total count  ================='+ grid.length);
        //关闭上次不需要的请求
        this.cancelRequest(findedRequestUrls);
        return requestTileUrls;
    };

    /**
     * 取消上次不需要的请求
     * Parameters :
     * findedRequestUrls - 请求队列中找到的url集合
     */
    cancelRequest(findedRequestUrls){
        for(let tileUrl in this.requestingTiles) {
            if (!findedRequestUrls[tileUrl]) {
                let requestTile = this.requestingTiles[tileUrl];
                delete this.requestingTiles[tileUrl];
                requestTile.xhr.abort();
                requestTile.requestItem.cancel = true;
            }
        }
    };

    /**
     * 发送请求，取注记瓦片数据
     * Parameters :
     * requestTileUrls - 需要请求的瓦片url集合
     */
    sendRequest(requestTileUrls){
        let count = 0;
        for(let url in requestTileUrls){
            let item = requestTileUrls[url];
            let promise = getParamJSON(item);
            this.requestingTiles[item.url] = {xhr:promise.xhr,requestItem:item};
            promise.then(this.tileSuccessFunction.bind(this),this.tileFailFunction.bind(this));
            count++;
        }
        // console.log('sendRequest count ==============='+count);
        if(count == 0){
            this.sendSuccess([]);
        }
    };

    /**
     * 单个瓦片注记请求成功的回调
     */
    tileSuccessFunction(data){
        if(data.param.cancel == true){
            //请求取消失败的，直接返回
            return;
        }

        let url = data.param.url;
        // console.log('onSuceess url ==='+ url);
        //删除正在请求的url
        delete this.requestingTiles[url];
        let features = this.parseFeature(data);
        //设置boxs
        let labelFeatures = this.GAnnoAvoid.GLabelBox.setBox(features.labelFeatures,true);
        labelFeatures = this.GAnnoAvoid.avoid(labelFeatures,features.avoidLineFeatures);
        this.currentTileDatas.push({url:url,labelFeatures:labelFeatures,avoidLineFeatures:features.avoidLineFeatures});

        //如果所有的瓦片请求成功
        if(this.isEmptyObject(this.requestingTiles)){
            this.sendSuccess(this.currentTileDatas);
        }
    };

    //判断map是否为空
    isEmptyObject(e) {
        for (let t in e)
            return !1;
        return !0
    };

    /**
     * 单个瓦片注记请求失败的回调
     */
    tileFailFunction(data){
        if(data.param.cancel == true){
            //请求取消失败的，直接返回
            return;
        }

        let url = data.param.url;
        // console.log('onfail url ==='+ url);
        delete this.requestingTiles[url];

        //如果所有的瓦片请求成功
        if(this.isEmptyObject(this.requestingTiles)){
            this.sendSuccess(this.currentTileDatas);
        }
    };

    /**
     * 请求成功的回调函数，没有请求url，也会执行该回调
     * Parameters :
     * results - 请求成功的结果
     */
    sendSuccess(results){
        if(this.gwvtAnno.animating){
            return;
        }

        //合并上次在当前视口范围内的注记要素(不包括本地要素)
        let mergeFeatures = this.mergeLabelData(results,this.hitCacheUrls);
        let labelFeatures = mergeFeatures.labelFeatures;

        for(let i = 0;i<results.length;i++){
            let item = results[i];
            this.cache.push(item.url,item);
        }

        //获取localDataSource中在当前屏幕范围内的注记要素
        let localFeatures = this.getLocalLabelDatas();
        labelFeatures = labelFeatures.concat(localFeatures);
        // console.time('avoid time:');
        //进行避让
        this.avoidlabelDatas = this.GAnnoAvoid.defaultAvoid(labelFeatures,this.hasImportant);
        // console.timeEnd('avoid time:');
        //重置图层位置
        this.gwvtAnno.resetCanvasDiv();
        this.clean();
        // this.drawAvoidLine(mergeFeatures.avoidLineFeatures);

        //保持当前屏幕内需要拾取的要素
        if(this.hitDetection){
            this.features = [];
            for(let i = 0;i<this.avoidlabelDatas.length;i++) {
                let feature = this.avoidlabelDatas[i];
                this.features[feature.id] = feature;
            }
        }
        //绘制注记要素
        GDrawGeomerty.draw(this.canvas,this.avoidlabelDatas,this.ratio,false,false,this.hitContext, this.hitDetection);
    };

    drawAvoidLine(avoidLineFeatures){
        this.canvas.save();
        this.canvas.beginPath();
        for(let i =0;i<avoidLineFeatures.length;i++){
            let avoidLineFeature = avoidLineFeatures[i];
            this.canvas.lineWidth=1;
            this.canvas.strokeStyle="#fff000";
            //画线
            this.canvas.moveTo(avoidLineFeature.datas[0],avoidLineFeature.datas[1]);
            for(j = 1;j<avoidLineFeature.datas.length/2;j++){
                this.canvas.lineTo(avoidLineFeature.datas[j*2],avoidLineFeature.datas[j*2+1]);
            }
        }
        this.canvas.stroke();
        this.canvas.restore();
    };

    /**
     * 解析返回的注记信息
     * Parameters:
     * tileData - 请求返回的注记数据
     * Returns:
     * labelDatas - 设置过样式,坐标由瓦片内坐标转为屏幕坐标的注记数据
     */
    parseFeature(tileData){
        let layers = tileData.data;
        let xyz = tileData.param.xyz;
        let count = 0;
        for(let key in layers){
            let layerData = layers[key];
            layerData.xyz = xyz;
            count++;
        }

        let dataSourceId = tileData.param.dataSourceId;

        let labelFeatures = [];
        let dataSource = this.getDataSourceById(dataSourceId);
        if(count > 0 &&  dataSource && dataSource.styleFun){
            //设置样式
            let itemDatas = [];
            let level = tileData.param.xyz.level;
            let drawer = new LabelDrawer(layers,level,itemDatas);
            dataSource.styleFun.call({}, drawer,level);

            //转换瓦片坐标为屏幕坐标,并构造label数据
            for(let j = 0;j<itemDatas.length;j++){
                let itemData =  itemDatas[j];
                itemData.textures = dataSource.textures;
                labelFeatures = labelFeatures.concat(this.parseItemData(itemData));
            }
        }

        let avoidLineFeatures = this.parseAvoidLine(layers['_layerAvoids'],xyz);
        return {labelFeatures:labelFeatures,avoidLineFeatures:avoidLineFeatures};
    };


    /**
     * 解析图元线要素
     * Parameters:
     * layerAvoids - 需要避让的线图层数据
     * xyz - 层行列号对象
     * Returns:
     * avoidLineFeatures - 需要避让的线要素
     */
    parseAvoidLine(layerAvoids,xyz){
        let avoidLineFeatures = [];
        for(let weight in layerAvoids){
            let lines = layerAvoids[weight];
            weight = parseInt(weight);
            for(let i = 0;i<lines.length;i++){
                let feature = {};
                feature.weight = weight;
                feature.sourceDatas = lines[i];
                feature.datas = this.transformAvoidLine(lines[i],xyz);
                feature.xyz =xyz;
                avoidLineFeatures.push(feature);
            }
        }
        return avoidLineFeatures;
    };



    /**
     * 将瓦片内坐标转换为当前屏幕坐标
     * Parameters:
     * line - 原始的需要避让的线
     * xyz - 瓦片的层行列号
     * Returns:
     * rdata - 本地屏幕内坐标数组
     */
    transformAvoidLine(line,xyz){
        //取出当前视口左上角的地理坐标
        let left = this.extent[0];
        let top = this.extent[3];

        //地图最大的范围
        let mLeft = this.maxExtent[0];
        let mTop = this.maxExtent[3];

        //计算坐上角的屏幕坐标
        let x = (left - mLeft) / this.res;
        let y = (mTop - top) / this.res;

        let newLine = [];

        for(let i = 0;i<line.length/2;i++){
            let px = line[2*i];
            let py = line[2*i+1];
            let gx = px + xyz.col * this.tileSize;
            let gy = py + xyz.row * this.tileSize;
            newLine.push(gx-x);
            newLine.push(gy-y);
        }
        return newLine;
    };


    /**
     * 将注记几何数据转换为相对本地的屏幕坐标
     * Parameters:
     * itemData - 瓦片内坐标的注记数据
     * Returns:
     * labelDatas - 设置过样式,坐标由瓦片内坐标转为屏幕坐标的注记数据
     */
    parseItemData(itemData){
        let labelDatas = [];
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
                labelDatas = labelDatas.concat(this.parseMultiLine(itemData,itemData[2][0][0]));
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
    parsePoint(itemData){
        let points = [];
        let point = itemData[2];
        let sourceAngleData = [[point,0]];
        let p = this.transformData(sourceAngleData,itemData.xyz);
        let style = itemData.style;
        let label = itemData.fieldValueMap[style.labelfield];
        let primaryId = itemData.fieldValueMap['attributeId']+ '_row_'+itemData.xyz.row+'_col_'+itemData.xyz.col+'_level_'+itemData.xyz.level+'_x_'+sourceAngleData[0][0][0]+'_y_'+sourceAngleData[0][0][1];
        let weight = 0;
        if(itemData.fieldValueMap[style.avoidField]){
            weight = parseInt(itemData.fieldValueMap[style.avoidField]);
            if(isNaN(weight)){
                weight = 0;
            }
        }

        let directions = {0:1};
        if(style.texture){
            directions = {0:1,1:1,2:1,3:1};
        }

        points.push({id:Math.round(Math.random()*256*256*256),type:itemData.type,datas:p,sourceData:point,sourceAngleData:sourceAngleData,label:label,
            attributeId:itemData.fieldValueMap['attributeId'],primaryId:primaryId,style:style,iconImg:itemData.textures[style.texture],xyz:itemData.xyz,weight:weight,
            directions:directions,attributes:itemData.fieldValueMap});
        return points;
    };

    /**
     * 将线注记几何数据转换为相对本地的屏幕坐标
     * Parameters:
     * itemData - 瓦片内坐标的注记数据
     * Returns:
     * lines - 设置过样式,坐标由瓦片内坐标转为屏幕坐标的注记数据
     */
    parseLine(itemData){
        if(itemData[2].length == 0){
            return [];
        }

        let lines = [];
        if(Array.isArray(itemData[2][0][0])){
            lines = this.parseMultiLine(itemData,itemData[2][0]);
        }else{
            lines = this.parseMultiLine(itemData,itemData[2]);
        }
        return lines;
    };


    /**
     * 将多线注记几何数据转换为相对本地的屏幕坐标
     * Parameters:
     * itemData - 瓦片内坐标的注记数据
     * Returns:
     * multiLines - 设置过样式,坐标由瓦片内坐标转为屏幕坐标的注记数据
     */
    parseMultiLine(itemData,datas){
        let multiLines = [];
        let style = itemData.style;
        for(let i=0;i<datas.length;i++){
            let line = datas[i];
            if(line.length == 0){
                continue;
            }
            let label = itemData.fieldValueMap[style.labelfield];
            let roadCodeLabel = itemData.fieldValueMap[style.roadCodeLabel];
            let weight = 0;
            if(itemData.fieldValueMap[style.avoidField]){
                weight = parseInt(itemData.fieldValueMap[style.avoidField]);
            }
            let feature = {type:itemData.type,sourceData:line,label:label,weight:weight,roadCodeLabel:roadCodeLabel,
                attributeId:itemData.fieldValueMap['attributeId'],style:this.cloneStyle(style),textures:itemData.textures,xyz:itemData.xyz,
                attributes:itemData.fieldValueMap};
            multiLines = multiLines.concat(this.cutLineFeature(feature,false));
        }
        return multiLines;
    };

    /**
     * 克隆样式
     * @param style
     * @returns {{}}
     */
    cloneStyle(style){
        let newStyle = {};
        for(let name in style){
            newStyle[name] = style[name];
        }
        return newStyle;
    }

    /**
     * 将线切多段，分为线文字，线编码，线箭头,并转换为屏幕坐标
     * Parameters:
     * feature - 瓦片内坐标的注记数据
     * isLocal - true为本地Feature,false为远程请求的feature
     * Returns:
     * features - 切好的线文字，线编码，线箭头要素集合
     */
    cutLineFeature(feature,isLocal){
        let features = GCutLine.cutLineFeature(feature);
        for(let i = 0;i<features.length;i++){
            let f = features[i];
            //转换为屏幕坐标
            if(isLocal){
                f.datas = feature.transformData(this.extent,this.res);
            }else{
                f.datas = this.transformData(f.sourceAngleData,f.xyz);
            }

            f.primaryId = f.attributeId+ '_row_'+feature.xyz.row+'_col_'+feature.xyz.col+'_level_'+feature.xyz.level
                +'_x_'+f.sourceAngleData[0][0][0]+'_y_'+f.sourceAngleData[0][0][1];
            //用于拾取的id
            f.id = Math.round(Math.random()*256*256*256);

            //获取注记的中心点
            if(f.lineType == 'text'){
                let centerIndex = Math.floor(f.datas.length/2);
                f.centerPoint = f.datas[centerIndex][0];
            }

            //获取注记的中心点
            if(f.lineType == 'code'){
                f.centerPoint = f.datas[0][0];
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
    transformData(points,xyz){
        //取出当前视口左上角的地理坐标
        let left = this.extent[0];
        let top = this.extent[3];

        //地图最大的范围
        let mLeft = this.maxExtent[0];
        let mTop = this.maxExtent[3];

        //计算坐上角的屏幕坐标
        let x = (left - mLeft) / this.res;
        let y = (mTop - top) / this.res;

        let rPoint = [];

        for(let i = 0;i<points.length;i++){
            let point = points[i][0];
            let gx = point[0] + xyz.col * this.tileSize;
            let gy = point[1] + xyz.row * this.tileSize;
            let p = [gx - x,gy - y];
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
    mergeLabelData(results,hitCacheUrls){
        let labelFeatures = [];
        let avoidLineFeatures = [];
        for(let j = 0;j<results.length;j++){
            let result = results[j];
            labelFeatures = labelFeatures.concat(result.labelFeatures);
            avoidLineFeatures = avoidLineFeatures.concat(result.avoidLineFeatures);
        }

        // let count = 0;
        for(let i =0 ;i<hitCacheUrls.length;i++){
            let cacheLabelFeatures = this.cache.getItem(hitCacheUrls[i]).labelFeatures;
            // if(cacheItem){
            //     count++;
            // }
            for(let j =0;j<cacheLabelFeatures.length;j++){
                let labelFeature = cacheLabelFeatures[j];
                //重新计算当前屏幕坐标
                labelFeature.datas = this.transformData(labelFeature.sourceAngleData,labelFeature.xyz);

                //获取注记的中心点
                if(labelFeature.lineType == 'text'){
                    let centerIndex = Math.floor(labelFeature.datas.length/2);
                    labelFeature.centerPoint = labelFeature.datas[centerIndex][0];
                }

                //获取注记的中心点
                if(labelFeature.lineType == 'code'){
                    labelFeature.centerPoint = labelFeature.datas[0][0];
                }
            }
            labelFeatures = labelFeatures.concat(cacheLabelFeatures);




            let cacheAvoidLineFeatures = this.cache.getItem(hitCacheUrls[i]).avoidLineFeatures;
            for(let j =0;j<cacheAvoidLineFeatures.length;j++){
                let avoidLineFeature = cacheAvoidLineFeatures[j];
                //重新计算当前屏幕坐标
                avoidLineFeature.datas = this.transformAvoidLine(avoidLineFeature.sourceDatas,avoidLineFeature.xyz);
            }
            avoidLineFeatures = avoidLineFeatures.concat(cacheAvoidLineFeatures);
        }



        // console.log('merge cache count =============='+count );
        return {labelFeatures:labelFeatures,avoidLineFeatures:avoidLineFeatures};
    };


    /**
     * 根据屏幕坐标获取feature
     * Parameters :
     * x
     * y
     */
    getFeatureByXY(x,y) {
        let feature = null;
        if (this.hitDetection) {
            let featureId;
            let data = this.hitContext.getImageData(x, y, 1, 1).data;
            if (data[3] === 255) { // antialiased
                let id = data[2] + (256 * (data[1] + (256 * data[0])));
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
module.exports = CanvasLayer;
