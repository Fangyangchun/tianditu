/**
 * Class: GAnnoAvoid
 * 避让策略类
 *
 * Inherits:
 *  - <Object>
 */
var GAnnoAvoid = {
    //避让
    defaultAvoid:function(features_,hasImportant){
        if(features_== null || features_.length<1) return [];
        //设置box,如果有线编码或者线箭头，则会新增要素
        features_ = this.setBox(features_);
        //权值排序
        this.sort(features_,hasImportant);
        for(var i=0 ;i<features_.length-1;i++){
            var fristFeature  = features_[i];
            if(fristFeature.hidden == true) continue;
            for(var j=i+1 ;j<features_.length;j++){
                var nextFeature = features_[j];
                if(nextFeature.hidden == true) continue;

                // 两个要素是否相交
                if(this.crashFeatures(fristFeature,nextFeature,j,features_)){
                    if(hasImportant){
                        if(nextFeature.style.isImportant){
                            nextFeature.hidden =false;
                        }else{
                            nextFeature.hidden =true;
                        }
                    }else{
                        nextFeature.hidden =true;
                    }

                }else{
                    //如果同名的注记相隔很近，则隐藏一个
                    if(fristFeature.label && nextFeature.label
                        && fristFeature.style.distance && nextFeature.style.distance
                        && fristFeature.type ==1 && nextFeature.type ==1){
                        //求两个点注记之间的距离
                        var dis = this.getDistance(fristFeature.style.textPoint,nextFeature.style.textPoint);
                        if(dis < nextFeature.style.distance){
                            nextFeature.hidden =true;
                        }
                    }

                    //线注记同名的注记相隔很近，则隐藏一个
                    if(fristFeature.type ==2 && nextFeature.type ==2){
                        //线文字注记
                        if(fristFeature.lineType =='text' &&  nextFeature.lineType == 'text'){
                            if(fristFeature.label && nextFeature.label
                                && fristFeature.style.lineTextDistance && nextFeature.style.lineTextDistance){
                                //求两个点注记之间的距离
                                var dis = this.getDistance(fristFeature.centerPoint,nextFeature.centerPoint);
                                if(dis < nextFeature.style.lineTextDistance){
                                    nextFeature.hidden =true;
                                }
                            }
                        }

                        //线编码注记
                        if(fristFeature.lineType =='code' &&  nextFeature.lineType == 'code'){
                            if(fristFeature.label && nextFeature.label
                                && fristFeature.style.lineCodedistance && nextFeature.style.lineCodedistance){
                                //求两个点注记之间的距离
                                var dis = this.getDistance(fristFeature.centerPoint,nextFeature.centerPoint);
                                if(dis < nextFeature.style.lineCodedistance){
                                    nextFeature.hidden =true;
                                }
                            }
                        }
                    }
                }
            }
        }
        return this.filterFeature(features_);
    },

    /**
     * 两个要素的boxs是否相交.
     */
    crashFeatures :function(fristFeature,nextFeature,index,features_){
        if(fristFeature.type == 2 && nextFeature.type == 1){
            return this.crashLinePoint(fristFeature,nextFeature,index,features_);
        }
        if(fristFeature.type == 1 && nextFeature.type == 2){
            return this.crashPointLine(fristFeature,nextFeature);
        }
        if(fristFeature.type == 1 && nextFeature.type == 1){
            return this.crashPointPoint(fristFeature,nextFeature,index,features_);
        }
        if(fristFeature.type == 2 && nextFeature.type == 2){
            return this.crashLineLine(fristFeature,nextFeature);
        }
        return false;
    },

    /**
     * 线和点是否相交.
     */
    crashLinePoint:function(fristFeature,nextFeature,index,features_){
            for(var i = 0;i<fristFeature.boxs.length;i++){
            var lineBox = fristFeature.boxs[i];
            //两个矩形是否相交
            if(this.crashBox(lineBox,nextFeature.box)){
                var isCrash = true;
                var isFourDirections = nextFeature.style.isFourDirections;
                if(isFourDirections == true) {
                    //四个方向检测是否碰撞
                    for (var k = 1; k < 4; k++) {
                        var b = this.avoidOldFeatures(features_, index, nextFeature.boxs[k]);
                        if (!b) {
                            nextFeature.box = nextFeature.boxs[k];
                            nextFeature.style.textPoint = nextFeature.fourPoints[k];
                            isCrash = false;
                            break;
                        }
                    }
                }
                if(isCrash){
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * 求两点之间的距离
     */
    getDistance:function(p1,p2){
        var calX = p2[0] - p1[0];
        var calY = p2[1] - p1[1];
       return Math.pow((calX *calX + calY * calY), 0.5);
    },

    /**
     * 已知两点，延长距离，获取延长线上的点坐标
     */
    getPoint:function(p1,p2,d){
        var xab = p2[0] - p1[0];
        var yab = p2[1] - p1[1];
        var xd = p2[0];
        var yd = p2[1];
        if(xab == 0){
            if(yab > 0){
                yd = p2[1] + d;
            }else{
                yd = p2[1] - d;
            }
        }else{
            var xbd = Math.sqrt((d * d)/((yab/xab) * (yab/xab) + 1));
            if (xab < 0) {
                xbd = -xbd
            }

            xd = p2[0] + xbd;
            yd = p2[1] + yab / xab * xbd;
        }
        return [xd,yd];
    },

    /**
     * 点注记变换box位置后，和之前优先级较高的已经算过避让的要素进行碰撞检测,有压盖返回true
     */
    avoidOldFeatures:function(features_,index,box){
        for(var i = 0;i<index;i++){
            var item = features_[i];
            //点注记
            if(item.type == 1){
                //两个矩形是否相交
                if(this.crashBox(item.box,box)){
                    return true;
                }
            }

            //线注记
            if(item.type == 2){
                for(var j = 0;j<item.boxs.length;j++){
                    var jbox = item.boxs[j];
                    //两个矩形是否相交
                    if(this.crashBox(jbox,box)){
                        return true;
                    }
                }

            }
        }
        return false;
    },


    /**
     * 点和线是否相交.
     */
    crashPointLine:function(fristFeature,nextFeature){
        for(var i = 0;i<nextFeature.boxs.length;i++){
            var ibox = nextFeature.boxs[i];
            //两个矩形是否相交
            if(this.crashBox(ibox,fristFeature.box)){
                return true;
            }
        }
        return false;
    },

    /**
     * 点点是否相交
     */
    crashPointPoint:function(fristFeature,nextFeature,index,features_){
        if(this.crashBox(fristFeature.box,nextFeature.box)){
            var isCrash = true;
            var isFourDirections = nextFeature.style.isFourDirections;
            if(isFourDirections == true){
                //四个方向检测是否碰撞
                for(var k = 1;k<4;k++){
                    var b = this.avoidOldFeatures(features_,index,nextFeature.boxs[k]);
                    if(!b){
                        nextFeature.box = nextFeature.boxs[k];
                        nextFeature.style.textPoint = nextFeature.fourPoints[k];
                        isCrash = false;
                        break;
                    }
                }
            }


            if(isCrash){
                return true;
            }
        }
        return false;
    },

    /**
     * 线线是否相交
     */
    crashLineLine:function(fristFeature,nextFeature){
        for(var i = 0;i<fristFeature.boxs.length;i++){
            var ibox = fristFeature.boxs[i];
            for(var j = 0;j<nextFeature.boxs.length;j++){
                var jbox = nextFeature.boxs[j];
                //两个矩形是否相交
                if(this.crashBox(ibox,jbox)){
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * 设置要素的box，不满足显示条件的剔除
     *  Parameters :
     *  features_ - 要素集合
     */
    setBox:function(features_){
        var canvas = document.createElement('CANVAS');
        var ctx =  canvas.getContext('2d',{isQuality:true});
        features_.forEach(function(f, index) {
            f.hidden =false;
            //如果要素不显示,没字就不画
            if(f.style.show == false){
                f.hidden =true;
                return;
            }
            if(f.type == 1){
                //构造点盒子
                this.setPointBox(f,ctx);
            }
            if(f.type == 2){
                //如果是线文本注记
                if(f.lineType == 'text'){
                    this.setTextLineBox(f);
                }

                //如果是线编码注记
                if(f.lineType == 'code') {
                    this.setCodeLineBox(f);
                }

                //如果是线箭头注记
                if(f.lineType == 'arrow') {
                    this.setArrowLineBox(f);
                }
            }
        }.bind(this));
        return this.filterFeature(features_);
    },

    /**
     * 将线要素根据是否显示编号，是否显示箭头，进行切割多段
     *  Parameters :
     *  feature - 单个线注记要素,要素的坐标是没有转换过的原始坐标
     */
    cutLineFeature:function(feature){
            var fs = [];
            var style = feature.style;
            var line = feature.sourceData;

            //文本的线段数组
            var textPoints = [];
            //道路编码的线段数组
            var codePoints =[];
            //箭头的线段数组
            var arrowPoints = [];
            var d = new GDistance();

            //可用的line的index位置
            var index = 0;
            //线段间距数组
            var gaps = [];
            if(this.isNotNull(feature.label)) {
                //线注记的文字内容
                feature.label = feature.label+ '';
                //多切一个字的宽度，防止文字方向反转时，线段不够长
                for (var count = 0; count < feature.label.length + 1; count++) {
                    gaps.push(style.lineHeight*1.2 +2+ style.gap);
                }

                var cloneGaps = [].concat(gaps);
                var points = d.getNodePath(line, gaps);
                textPoints = points.pointList;

                if(textPoints.length > 0){
                    index = points.index;
                    //改变方向
                    //判断是否应该换方向
                    var showChanged = this.isChangeDirection(feature.label,[line[0], line[1]], textPoints[textPoints.length - 1][0]);
                    if (showChanged) {
                        textPoints = this.changeDirection(line, textPoints, cloneGaps,index);
                    }


                    var textFeature =  this.cloneFeature(feature);
                    textFeature.sourceAngleData = textPoints;
                    textFeature.lineType = 'text';
                    textFeature.primaryId = feature.primaryId;

                    //如果文字放不下，则增加延长线
                    if(textPoints.length < feature.label.length){
                        this.delayTextPoint(line,textPoints,feature.label,style.chinaLabelWidth + style.gap);
                    }

                    //求线段的中心点
                    var centerIndex = Math.floor(textPoints.length/2);
                    textFeature.centerPoint = textPoints[centerIndex][0];
                    fs.push(textFeature);
                }
            }

            var roadLabel = feature.attributes[style.roadCodeLabel];
            //如果有道路编码
            if(style.showRoadCode && this.isNotNull(roadLabel) && index < line.length){
                gaps = [];
                var codeLine = line.slice(index,line.length -1);
                //默认是30个像素
                gaps.push(30);
                var cPoints = d.getNodePath(codeLine, gaps);

                codePoints = cPoints.pointList;
                if(codePoints.length  == 1){
                    index = index + cPoints.index;
                    var codeFeature =  this.cloneFeature(feature);
                    codeFeature.sourceAngleData = codePoints;
                    codeFeature.lineType = 'code';
                    codeFeature.primaryId = feature.primaryId;
                    codeFeature.label = roadLabel+'';
                    codeFeature.centerPoint = codePoints[0][0];
                    fs.push(codeFeature);
                }
            }

            //如果有箭头
            if(style.showArrow && index < line.length){
                gaps = [];
                var arrowLine = line.slice(index,line.length -1);
                gaps.push(16);
                gaps.push(16);
                var aPoints = d.getNodePath(arrowLine, gaps);
                arrowPoints = aPoints.pointList;

                if(arrowPoints.length == 2){
                    var arrowFeature =  this.cloneFeature(feature);
                    arrowFeature.sourceAngleData = arrowPoints;
                    arrowFeature.lineType = 'arrow';
                    arrowFeature.primaryId = feature.primaryId;
                    fs.push(arrowFeature);
                }
            }
            return fs;
    },

    /**
     * 判断文本是否不为空
     *  Parameters :
     *  label - 要显示的文本
     *
     */
    isNotNull:function(label){
        if(!label && label !=0){
            return false;
        }

        //如果是字符串
        if(typeof(label) == 'string'){
            label = label.toLowerCase();
            if(label == ''|| label == 'undefined' || label == 'null'){
                return false;
            }
        }
        return true;
    },

    /**
     * 当线文字放不下时，获取延长线上的点
     *  Parameters :
     *  line - 原始线坐标
     *  textPoints - 切割之后的点坐标
     *  label - 线注记
     *  gap - 每个字之间的间隔
     *
     */
    delayTextPoint:function(line,textPoints,label,gap){
        var fristPoint = null;
        var secondPoint = null;
        //如果只能放下一个字
        if(textPoints.length == 1){
            fristPoint = [line[0],line[1]];
        }else{
            fristPoint = textPoints[textPoints.length-2][0];
        }
        secondPoint = textPoints[textPoints.length-1][0];
        var angle = textPoints[textPoints.length-1][1];

        for(var i = 1;i<label.length -textPoints.length+1;i++){
            var p = this.getPoint(fristPoint,secondPoint,gap*i);
            var textPoint = [p,angle];
            textPoints.push(textPoint);
        }
    },


    /**
     * 设置线文字的box
     *  Parameters :
     *  feature - 单个线注记要素
     */
    setTextLineBox:function(feature){
        var label = feature.label;
        var textPoints = feature.datas;
        if(textPoints.length == 0 || textPoints.length < label.length){
            feature.hidden = true;
            return;
        }

        var style = feature.style;
        //如果文字需要旋转
        if(style.lineTextRotate){
            for(var m = 0;m<textPoints.length;m++){
                textPoints[m][1] = style.lineTextRotate;
            }
        }else{
            //判断线文字之间的最大夹角是否大于指定的阈值
            if(this.isMessy(textPoints,style,label)){
                feature.hidden = true;
                return;
            }
        }

        //将分段的点数据和角度数据保留，留给后面绘制
        feature.textPoints = textPoints;
        //线的boxs
        var lineBoxs = [];

        //如果线注记带底色
        if(style.lineHashBackground == true){
            //获取线段的中间点
            var index = Math.floor(label.length/2);
            var p = textPoints[index][0];
            var w = label.length * style.lineHeight;

            var minX = p[0] - w/2 -style.lineBackgroundGap;
            var maxX =  p[0]+ w/2 +style.lineBackgroundGap;
            var minY = p[1] -style.lineBackgroundGap;
            var maxY = p[1]+style.lineHeight +style.lineBackgroundGap;
            var box = [minX,minY,maxX,maxY];
            lineBoxs.push(box);
        }else{
            //获取每个字的box,判断每个字之前是否有压盖
            var boxs = this.ownCrash(label,textPoints,style);
            if(boxs){
                lineBoxs =lineBoxs.concat(boxs);
            }else{
                feature.hidden = true;
                return;
            }
        }
        feature.boxs = lineBoxs;
    },

    /**
     * 设置线编码的box
     *  Parameters :
     *  feature - 单个线注记要素
     */
    setCodeLineBox:function(feature){
        var codePoints = feature.datas;
        if(codePoints.length == 0){
            feature.hidden = true;
            return;
        }

        var style = feature.style;
        //如果要显示道路编号
        var p = codePoints[0][0];
        var w = feature.label.length * style.codeLineHeight;

        var minX = p[0] - w/2 -style.codeLineBackgroundGap;
        var maxX =  p[0]+ w/2 +style.codeLineBackgroundGap;
        var minY = p[1] -style.codeLineBackgroundGap;
        var maxY = p[1]+style.codeLineHeight +style.codeLineBackgroundGap;
        var box = [minX,minY,maxX,maxY];
        feature.boxs = [box];
        feature.codePoint = p;
    },


    /**
     * 设置线箭头的box
     *  Parameters :
     *  feature - 单个线注记要素
     */
    setArrowLineBox:function(feature){
        var arrowPoints = feature.datas;
        if(arrowPoints.length != 2){
            feature.hidden = true;
            return;
        }

        var p = arrowPoints[0][0];
        var p1 = arrowPoints[1][0];

        var minX = p[0]<p1[0]?p[0]:p1[0];
        var maxX = p[0]>p1[0]?p[0]:p1[0];
        var minY = p[1]<p1[1]?p[1]:p1[1];
        var maxY = p[1]>p1[1]?p[1]:p1[1];
        var box = [minX,minY,maxX,maxY];
        feature.boxs = [box];
        feature.arrowPoint = arrowPoints;
    },

    /**
     * 克隆feature
     *  Parameters :
     *  feature - 单个线注记要素
     */
    cloneFeature:function(feature){
        return {type:feature.type,datas:feature.datas,sourceData:feature.sourceData,label:feature.label,
            attributes:feature.attributes,style:feature.style,textures:feature.textures,xyz:feature.xyz,
            lineType:feature.lineType};
    },

    /**
     *  改变文本线段的方向
     *  Parameters :
     *  line - 原始线数据
     *  textPoints - 未改方向前的文本线段数组
     *  gaps - 要切割的线段的数据间距
     *  index - 文本在原始线段中，能写到line的那个index索引位置
     */
    changeDirection:function(line,textPoints,gaps,index){
        //判断是否应该换方向
        index = index >=line.length? line.length:index;
        var textLine = line.slice(0,index);
        var linePoint = [];
        for(var i = 0;i<textLine.length-1;i++){
            linePoint.push([textLine[i],textLine[i+1]]);
            i++;
        }
        linePoint = linePoint.reverse();

        var lastPoint = textPoints[textPoints.length -1][0];
        textLine = [lastPoint[0],lastPoint[1]];
        for(var j = 0;j<linePoint.length;j++){
            textLine.push(linePoint[j][0]);
            textLine.push(linePoint[j][1]);
        }
        var d = new GDistance();
        textPoints = d.getNodePath(textLine,gaps).pointList;
        return textPoints;
    },


    /**
     * 是否需要改变线的方向
     *  Parameters :
     *  p1 - 线段起点
     *  p2 -线段的重点
     */
    isChangeDirection:function(label,p1,p2){
        var showChange = false;
        //判断是否包含汉字
        if(/.*[\u4e00-\u9fa5]+.*$/.test(label)) {
            //优先文字从上往下排
            if(p1[1]>p2[1]){
                showChange = true;
            }
            //如果是水平线
            if(p1[1] == p2[1]){
                if(p1[0] > p2[0]){
                    showChange = true;
                }
            }

            //获取两点连线与y轴的夹角
            var angle = this.getAngle(p1,p2);
            //如果是反斜线，并且夹角与x轴的夹角小于40度
            if(angle>-45 && angle<0 ){
                if(p1[1]<p2[1]){
                    showChange = true;
                }else{
                    showChange = false;
                }
            }
        }else{
            if(p1[0] > p2[0]){
                showChange = true;
            }
        }
        return showChange;
    },


    /**
     * 判断线文字之间的最大夹角是否大于指定的阈值
     *  Parameters :
     * textPoints - 文本注记的线段数组
     *  style -要素的样式
     */
    isMessy:function(textPoints,style,label){
        var firstPoint = textPoints[0][0];
        var minX = firstPoint[0];
        var minY = firstPoint[1];
        var maxX = firstPoint[0];
        var maxY = firstPoint[1];

        var minAngle = textPoints[0][1];
        var maxAngle = textPoints[0][1];
        for(var i = 0;i<label.length;i++){
            var currPoint = textPoints[i][0];
            var currAngle = textPoints[i][1];
            if(currPoint[0]>maxX)   // 判断最大值
                maxX=currPoint[0];
            if(currPoint[0]<minX)   // 判断最小值
                minX=currPoint[0];

            if(currPoint[1]>maxY)   // 判断最大值
                maxY=currPoint[1];
            if(currPoint[1]<minY)   // 判断最小值
                minY=currPoint[1];

            if(currAngle>maxAngle)   // 判断最大值
                maxAngle=currAngle;
            if(currAngle<minAngle)   // 判断最小值
                minAngle=currAngle;
        }

            //如果文字之间，相差的最大角度大于配置的角度度则不画
                if(maxAngle -minAngle > style.angle){
                    if(style.angleSwitch ==false  && style.angleColor){
                        style.lineFillStyle = style.angleColor;
                    }else{
                        return true;
                    }
                }
        return false;
    },


    /**
     * 检测线文字之间是否有自压盖
     *  Parameters :
     * boxs -
     *  style -要素的样式
     */
    ownCrash:function(label,textPoints,style){
        //和其它注记避让的boxs
        var boxs = [];
        //自相交避让的boxs
        var owmCrashBoxs = [];
        for(var i = 0;i<label.length;i++){
            var pt = textPoints[i][0];
            //考虑到线文字注记有角度偏转，box统一增加1.2倍
            var labelBox = [pt[0]-(style.lineHeight*1.2)*0.5,pt[1],pt[0]+(style.lineHeight*1.2)*0.5,pt[1]+style.lineHeight*1.2];
            var owmCrashBox = [pt[0]-(style.lineHeight)*0.5,pt[1],pt[0]+(style.lineHeight)*0.5,pt[1]+style.lineHeight];
            owmCrashBoxs.push(owmCrashBox);
            boxs.push(labelBox);
        }

        for(var j = 0;j<owmCrashBoxs.length-1;j++){
            var box1 = owmCrashBoxs[j];
            for(var k=j+1 ;k<owmCrashBoxs.length ;k++){
                var box2 = owmCrashBoxs[k];
                if(this.crashBox(box1,box2)){
                    return null;
                }
            }
        }
        return boxs;
    },

    //获取两点连线与y轴的夹角
    getAngle :function( p1,p2){
        if(p2[0]-p1[0] == 0){
            if(p2[1]>p1[0]){
                return 90;
            }else{
                return -90;
            }
        }
        var k = (p2[1]-p1[1])/(p2[0]-p1[0]);
        var angle = 360*Math.atan(k)/(2*Math.PI);
        return angle;
    },

    // 两个盒子是否相交.
    crashBox :function(ibox,jbox){
        return ibox[0] <= jbox[2] &&
            ibox[2]  >= jbox[0] &&
            ibox[1]  <= jbox[3] &&
            ibox[3]  >= jbox[1] ;
    },

    boxScale:function(box,pointBoxDisance){
        box[0] = box[0]-pointBoxDisance*0.5;
        box[1] = box[1]-pointBoxDisance*0.5;
        box[2] = box[2]+pointBoxDisance*0.5;
        box[3] = box[3]+pointBoxDisance*0.5;
        return box;
    },

    //构造点注记的boxs,上下左右四个方向
    setPointBox:function(feature,ctx){
        var style = feature.style;
        var currPara = {};

        var graphicWidth = style.graphicWidth;
        var graphicHeight = style.graphicHeight;

        //如果用户没有显示的给图标赋值宽高
        if(!graphicWidth || !graphicHeight){
            var textureKey = style.texture;
            var img = feature.textures[textureKey];
            if(img){
                graphicWidth = img.width;
                graphicHeight = img.height;
            }else{
                graphicWidth = 0;
                graphicHeight = 0;
            }
        }

        currPara.fontwidth = graphicWidth;
        currPara.fontheight = graphicHeight;

        //对要显示的点注记内容按照用户的转换函数进行转换
        if(style.labelFunction){
           var labelFunction = new Function("label", style.labelFunction);
           try{
               feature.label = labelFunction.call({}, feature.label);
           }catch (e){
               console.warn(feature.label + ': 调用labelFunction失败!');
           }
        }

        var labelIsNotNull = this.isNotNull(feature.label);
        //如既没有文字，又没有图标,则不显示
        if(!labelIsNotNull && (graphicWidth == 0  || graphicHeight == 0)){
            feature.hidden =true;
            return;
        }


        var tmpLabels = 0;
        //设置当前注记的宽度和高度
        //注记分行
        if(labelIsNotNull){
            //转换为字符串
            feature.label = feature.label +'';
            tmpLabels = feature.label.split(' ');
            var tmpLabelWidth=0;
            ctx.save();
            ctx.font = style.pointFillFont;
            for(var i = 0;i<tmpLabels.length;i++ ){
                var oneRowLabelWidth = ctx.measureText(tmpLabels[i]).width;
                tmpLabelWidth = oneRowLabelWidth > tmpLabelWidth?oneRowLabelWidth:tmpLabelWidth;
            }
            ctx.restore();
            //各行的最宽宽度
            currPara.fontwidth =  tmpLabelWidth;
            //文字的高度 * 文字的行数+  行间距
            currPara.fontheight = style.pointHeight *  tmpLabels.length  + 2*(tmpLabels.length -1);
            // 如果点符号高度（用点符号宽度代替）高于文字高度 则用点符号高度替换文字高度
            currPara.fontheight = currPara.fontheight> graphicHeight ? currPara.fontheight: graphicHeight;
        }

        //包括点图标的box,用于避让
        var pt = feature.datas[0][0];
        if(style.pointHashBackground != true){
            style.pointBackgroundGap = 0;
        }
        //如果有换行时，保证图标在换行文字的中间所需的高度差值
        var partHieght = 0;
        if(graphicHeight != 0 && graphicWidth !=0){
            partHieght = (currPara.fontheight - graphicHeight)*0.5;
        }else{
            style.graphicDistance = 0;
        }

        var rightBox = [ pt[0] - graphicWidth*0.5 ,
            pt[1] - style.pointBackgroundGap -partHieght,
            pt[0] +graphicWidth*0.5 +style.graphicDistance+ currPara.fontwidth + style.pointBackgroundGap*2,
            pt[1] +currPara.fontheight + style.pointBackgroundGap -partHieght];
        var leftBox = [pt[0] -graphicWidth*0.5 -style.graphicDistance- currPara.fontwidth - style.pointBackgroundGap*2,
            rightBox[1],pt[0] + graphicWidth*0.5,
            rightBox[3]];

        var bottomBox = [pt[0]-currPara.fontwidth*0.5-style.pointBackgroundGap,
            pt[1], pt[0]+currPara.fontwidth*0.5+style.pointBackgroundGap,
            pt[1]+graphicHeight + style.graphicDistance+style.pointBackgroundGap*2 +currPara.fontheight] ;

        var topBox = [bottomBox[0],pt[1]  -style.graphicDistance - style.pointBackgroundGap*2 - currPara.fontheight ,
            bottomBox[2],pt[1]+graphicHeight];


        if(!style.pointBoxDisance){
            style.pointBoxDisance = 0;
        }
        rightBox = this.boxScale(rightBox,style.pointBoxDisance);
        leftBox = this.boxScale(leftBox,style.pointBoxDisance);
        bottomBox = this.boxScale(bottomBox,style.pointBoxDisance);
        topBox = this.boxScale(topBox,style.pointBoxDisance);
        var boxs = [rightBox,leftBox,bottomBox,topBox];
        if(!style.direction){
            style.direction = 0;
        }

        feature.boxs = boxs;
        feature.box = boxs[style.direction];


        //不包括点图标,用于文字绘制的起点坐标
        var rPoint = [pt[0] + graphicWidth*0.5 + style.graphicDistance + style.pointBackgroundGap,
            pt[1]-partHieght];
        var lPoint = [pt[0] -graphicWidth*0.5 - style.graphicDistance - style.pointBackgroundGap -currPara.fontwidth,
            pt[1]-partHieght];
        var bPoint = [pt[0]- currPara.fontwidth*0.5,
            pt[1] + style.graphicDistance + style.pointBackgroundGap + graphicHeight];
        var tPoint = [bPoint[0],
            pt[1]-style.graphicDistance-style.pointBackgroundGap - currPara.fontheight];
        var fourPoints = [rPoint ,lPoint  ,bPoint  ,tPoint ];
        feature.fourPoints = fourPoints;
        feature.style.textPoint = fourPoints[style.direction];
    },

    //要素排序.
    sort:function(features,hasImportant){
        if(features.length > 0) {
            var avoidField = features[0].style.avoidField;
            //从大到少排序
            return  features.sort(function (a, b) {

                if(hasImportant){
                    if(a.style.isImportant && !b.style.isImportant){
                        return -1;
                    }
                    if(b.style.isImportant && !a.style.isImportant){
                        return 1;
                    }
                }

                var aAttr = a.attributes[avoidField];
                var bAttr = b.attributes[avoidField];

                var aId = a.attributes.primaryId;
                var bId = b.attributes.primaryId;


                if(!aAttr){
                    aAttr = -1;
                }
                if(!bAttr){
                    bAttr = -1;
                }
                if (aAttr < bAttr) {
                    return 1;
                } else if (aAttr == bAttr){
                    if(aId < bId){
                        return 1;
                    }else if(aId ==  bId){
                        if(hasImportant) {
                            if (a.style.isImportant && b.style.isImportant) {
                                a.hidden = true;
                            }
                        }
                        return 0;
                    }else{
                        return -1;
                    }
                } else {
                    return -1;
                }
            });
        }
    },

    // 获取过滤后的要素.
    filterFeature:function(features_){
        var returnFeatures = [];
        //剔除需避让的要素
        for(var i= features_.length-1 ;i>-1;i--){
            if( ! features_[i].hidden ) {
                returnFeatures.push(features_[i]);
            }
        }
        return returnFeatures;
    }
}