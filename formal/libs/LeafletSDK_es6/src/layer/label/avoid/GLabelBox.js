/**
 * Class: GLabelBox
 *  计算注记避让box类
 *
 * Inherits:
 *  - <Object>
 */
const Util =  require('./Util');
class GLabelBox{
    constructor(ctx,formatFont) {
        this.boxDistance = 0;
        this.ctx =  ctx;
        this.formatFont = formatFont;
    }

    setBox(features,isSource){
        features.forEach(function(f, index) {
            f.hidden =false;
            //去掉尾部的空格
            f.label = Util.formatLabel(f.label);

            //如果要素不显示,没字就不画
            if(f.style.show == false){
                f.hidden =true;
                return;
            }
            if(f.type == 1){
                //构造点盒子
                if(isSource){
                    this.setPointBox(f,f.sourceAngleData,this.ctx);
                }else{
                    this.setPointBox(f,f.datas,this.ctx);
                }
            }
            if(f.type == 2){
                //如果是线文本注记
                if(f.lineType == 'text'){
                    if(isSource){
                        this.setTextLineBox(f,f.sourceAngleData,this.ctx);
                    }else{
                        this.setTextLineBox(f,f.datas,this.ctx);
                    }
                }

                //如果是线编码注记
                if(f.lineType == 'code') {
                    if(isSource){
                        this.setCodeLineBox(f,f.sourceAngleData,this.ctx);
                    }else{
                        this.setCodeLineBox(f,f.datas,this.ctx);
                    }
                }

                //如果是线箭头注记
                if(f.lineType == 'arrow') {
                    if(isSource){
                        this.setArrowLineBox(f,f.sourceAngleData);
                    }else{
                        this.setArrowLineBox(f,f.datas);
                    }
                }
            }
        }.bind(this));
        return this.filterFeature(features);
    }

    //构造点注记的boxs,上下左右四个方向
    setPointBox(feature,datas,ctx){
        let style = feature.style;
        let currPara = {};

        let graphicWidth = style.graphicWidth;
        let graphicHeight = style.graphicHeight;

        let img = feature.iconImg;
        if(img){
            //如果没有
            if(!graphicWidth || !graphicHeight) {
                graphicWidth = img.width;
                graphicHeight = img.height;
            }
        }else{
            graphicWidth = 0;
            graphicHeight = 0;
        }

        currPara.fontwidth = graphicWidth;
        currPara.fontheight = graphicHeight;

        //对要显示的点注记内容按照用户的转换函数进行转换
        if(style.labelFunction){
            let labelFunction = new Function("label", style.labelFunction);
            try{
                feature.label = labelFunction.call({}, feature.attributes[style.labelfield]);
            }catch (e){
                console.warn(feature.label + ': 调用labelFunction失败!');
            }
        }

        let labelIsNotNull = Util.isNotNull(feature.label);
        //如既没有文字，又没有图标,则不显示
        if(!labelIsNotNull && (graphicWidth == 0  || graphicHeight == 0)){
            feature.hidden =true;
            return;
        }


        let tmpLabels = 0;
        //设置当前注记的宽度和高度
        //注记分行
        if(labelIsNotNull){
            //转换为字符串
            feature.label = feature.label +'';
            tmpLabels = feature.label.split(' ');
            let tmpLabelWidth=0;
            ctx.save();
            if(this.formatFont){
                ctx.font = Util.formatFont(style.pointFillFont,1,true);
            }else{
                ctx.font = style.pointFillFont;
            }

            for(let i = 0;i<tmpLabels.length;i++ ){
                let oneRowLabelWidth = ctx.measureText(tmpLabels[i]).width;
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


        let pointOffsetX = style.pointOffsetX;
        let pointOffsetY = style.pointOffsetY;
        if(!pointOffsetX){
            pointOffsetX = 0;
        }
        if(!pointOffsetY){
            pointOffsetY = 0;
        }
        let pt = [datas[0][0][0],datas[0][0][1]];
        pt[0] = pt[0]+pointOffsetX;
        pt[1] = pt[1]+pointOffsetY;
        if(style.pointHashBackground != true){
            style.pointBackgroundGap = 0;
        }
        if(graphicHeight == 0 || graphicWidth ==0){
            style.graphicDistance = 0;
        }


        if(!style.direction){
            style.direction = 0;
        }
        let boxs = [];
        let fourPoints = [];

        //最大单行高度
        let maxOneLineHeight = graphicHeight;
        if(style.pointHeight > graphicHeight){
            maxOneLineHeight = style.pointHeight;
        }

        //如果有图标
        if(feature.style.texture){
            let rightBox = [ pt[0] - graphicWidth*0.5 ,
                pt[1] - style.pointBackgroundGap -currPara.fontheight*0.5,
                pt[0] +graphicWidth*0.5 +style.graphicDistance+ currPara.fontwidth + style.pointBackgroundGap*2,
                pt[1] +currPara.fontheight*0.5 + style.pointBackgroundGap];
            let leftBox = [pt[0] -graphicWidth*0.5 -style.graphicDistance- currPara.fontwidth - style.pointBackgroundGap*2,
                rightBox[1],pt[0] + graphicWidth*0.5,
                rightBox[3]];

            let bottomBox = [pt[0]-currPara.fontwidth*0.5-style.pointBackgroundGap,
                pt[1] -graphicHeight*0.5 , pt[0]+currPara.fontwidth*0.5+style.pointBackgroundGap,
                pt[1]+graphicHeight*0.5 + style.graphicDistance+style.pointBackgroundGap*2 +currPara.fontheight] ;

            let topBox = [bottomBox[0],pt[1]  -style.graphicDistance - style.pointBackgroundGap*2 - currPara.fontheight-graphicHeight*0.5 ,
                bottomBox[2],pt[1]+graphicHeight*0.5];

            rightBox = this.boxScale(rightBox,style.pointBoxDisance);
            leftBox = this.boxScale(leftBox,style.pointBoxDisance);
            bottomBox = this.boxScale(bottomBox,style.pointBoxDisance);
            topBox = this.boxScale(topBox,style.pointBoxDisance);
            boxs = [rightBox,leftBox,bottomBox,topBox];

            //不包括点图标,用于文字绘制的起点坐标
            let rPoint = [pt[0] + graphicWidth*0.5 + style.graphicDistance + style.pointBackgroundGap,
                pt[1]-currPara.fontheight*0.5+maxOneLineHeight*0.5];
            let lPoint = [pt[0] -graphicWidth*0.5 - style.graphicDistance - style.pointBackgroundGap -currPara.fontwidth,
                pt[1]-currPara.fontheight*0.5+maxOneLineHeight*0.5];
            let bPoint = [pt[0]- currPara.fontwidth*0.5,
                pt[1] + style.graphicDistance + style.pointBackgroundGap + maxOneLineHeight*0.5+graphicHeight*0.5];
            let tPoint = [bPoint[0],
                pt[1]-style.graphicDistance-style.pointBackgroundGap - currPara.fontheight+ maxOneLineHeight*0.5-graphicHeight*0.5];
            fourPoints = [rPoint ,lPoint  ,bPoint  ,tPoint ];

        }else{
            //强制只有一个方向
            style.direction = 0;

            let middleBox = [pt[0] - currPara.fontwidth*0.5 - style.pointBackgroundGap,pt[1]- style.pointBackgroundGap -currPara.fontheight*0.5,
                pt[0] + currPara.fontwidth*0.5 + style.pointBackgroundGap,pt[1]+style.pointBackgroundGap +currPara.fontheight*0.5  ];
            middleBox = this.boxScale(middleBox,style.pointBoxDisance);
            boxs = [middleBox];

            let mPoint = [pt[0] - currPara.fontwidth*0.5,pt[1]-currPara.fontheight*0.5+maxOneLineHeight*0.5];
            fourPoints = [mPoint];
        }

        feature.boxs = boxs;
        feature.box = boxs[style.direction];

        feature.fourPoints = fourPoints;
        feature.style.textPoint = fourPoints[style.direction];
    }

    /**
     * 设置线文字的box
     *  Parameters :
     *  feature - 单个线注记要素
     */
    setTextLineBox(feature,datas,ctx){
        let label = feature.label;
        let textPoints = datas;
        if(textPoints.length == 0){
            feature.hidden = true;
            return;
        }

        let style = feature.style;
        //将分段的点数据和角度数据保留，留给后面绘制
        feature.textPoints = textPoints;
        //线的boxs
        let lineBoxs = [];
        //如果线注记带底色
        if(style.lineHashBackground == true || textPoints.length ==1){
            let p = textPoints[0][0];
            if(textPoints.length >1){
                //获取线段的中间点
                let index = Math.floor(label.length/2);
                p = textPoints[index][0];
            }

            ctx.save();
            if(this.formatFont){
                ctx.font = Util.formatFont(style.lineFillFont,1,true);
            }else{
                ctx.font = style.lineFillFont;
            }

            let w = ctx.measureText(feature.label).width;
            ctx.restore();

            let minX = p[0] - w/2 -style.lineBackgroundGap;
            let maxX =  p[0]+ w/2 +style.lineBackgroundGap;
            let minY = p[1] -style.lineHeight*0.5-style.lineBackgroundGap;
            let maxY = p[1]+style.lineHeight*0.5 +style.lineBackgroundGap;
            let box = [minX,minY,maxX,maxY];
            this.boxScale(box,style.lineTextBoxDisance);
            lineBoxs.push(box);
        }else{
            //如果文字需要旋转
            if(style.lineTextRotate || style.lineTextRotate == 0){
                for(let m = 0;m<textPoints.length;m++){
                    textPoints[m][1] = style.lineTextRotate;
                }
            }else{
                //如果文字注记旋转角度方向不一致(有的字向左，有的字向右旋转)，则调整为一致
                this.textToSameBearing(feature.angle,textPoints);

                if(!style.isImportant){
                    //判断线文字之间的最大夹角是否大于指定的阈值
                    if(this.isMessy(textPoints,style,label)){
                        feature.hidden = true;
                        return;
                    }
                }
            }

            //获取每个字的box,判断每个字之前是否有压盖
            let boxs = this.getLineBoxs(label,textPoints,style);
            if(boxs){
                lineBoxs =lineBoxs.concat(boxs);
            }else{
                feature.hidden = true;
                return;
            }
        }
        feature.boxs = lineBoxs;
    }

    /**
     * 设置线编码的box
     *  Parameters :
     *  feature - 单个线注记要素
     */
    setCodeLineBox(feature,datas,ctx){
        let codePoints = datas;
        if(codePoints.length == 0){
            feature.hidden = true;
            return;
        }

        let style = feature.style;
        //如果要显示道路编号
        let p = codePoints[0][0];

        ctx.save();
        if(this.formatFont){
            ctx.font = Util.formatFont(style.codeLineFillFont,1,true);
        }else{
            ctx.font = style.codeLineFillFont;
        }

        let w = ctx.measureText(feature.label).width;
        ctx.restore();


        let minX = p[0] - w/2 -style.codeLineBackgroundGap;
        let maxX =  p[0]+ w/2 +style.codeLineBackgroundGap;
        let minY = p[1] -style.codeLineHeight*0.5-style.codeLineBackgroundGap;
        let maxY = p[1]+ style.codeLineHeight*0.5 +style.codeLineBackgroundGap;
        let box = [minX,minY,maxX,maxY];
        this.boxScale(box,style.lineCodeBoxDisance);
        feature.boxs = [box];
        feature.codePoint = p;
    }

    /**
     * 设置线箭头的box
     *  Parameters :
     *  feature - 单个线注记要素
     */
    setArrowLineBox(feature,datas){
        let arrowPoints = datas;
        if(arrowPoints.length != 2){
            feature.hiden = true;
            return;
        }

        let p = arrowPoints[0][0];
        let p1 = arrowPoints[1][0];

        let minX = p[0]<p1[0]?p[0]:p1[0];
        let maxX = p[0]>p1[0]?p[0]:p1[0];
        let minY = p[1]<p1[1]?p[1]:p1[1];
        let maxY = p[1]>p1[1]?p[1]:p1[1];
        let box = [minX,minY,maxX,maxY];
        this.boxScale(box,feature.style.lineArrowBoxDisance);
        feature.boxs = [box];
        feature.arrowPoint = arrowPoints;
    }


    // 获取过滤后的要素.
    filterFeature(features){
        let returnFeatures = [];
        //剔除需避让的要素
        for(let i= 0 ;i<features.length;i++){
            if(!features[i].hidden ) {
                returnFeatures.push(features[i]);
            }
        }
        return returnFeatures;
    }

    /**
     * 判断线文字之间的最大夹角是否大于指定的阈值
     *  Parameters :
     * textPoints - 文本注记的线段数组
     *  style -要素的样式
     */
    isMessy(textPoints,style,label){
        let firstPoint = textPoints[0][0];
        let minX = firstPoint[0];
        let minY = firstPoint[1];
        let maxX = firstPoint[0];
        let maxY = firstPoint[1];

        let minAngle = textPoints[0][1];
        let maxAngle = textPoints[0][1];
        for(let i = 0;i<label.length;i++){
            let currPoint = textPoints[i][0];
            let currAngle = textPoints[i][1];
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
    }

    /**
     * 检测线文字之间是否有自压盖
     *  Parameters :
     * boxs -
     *  style -要素的样式
     */
    getLineBoxs(label,textPoints,style){
        //和其它注记避让的boxs
        let boxs = [];
        //自相交避让的boxs
        let owmCrashBoxs = [];
        for(let i = 0;i<label.length;i++){
            let pt = textPoints[i][0];
            //解决旋转后的注记和不旋转的注记样式不一致的问题
            if(textPoints[i][1] == 0){
                textPoints[i][1] = 0.5;
            }
            //考虑到线文字注记有角度偏转，box统一增加1.2倍
            let labelBox = [pt[0]-(style.lineHeight*1.2)*0.5,pt[1]-style.lineHeight*1.2*0.5,pt[0]+(style.lineHeight*1.2)*0.5,pt[1]+style.lineHeight*1.2*0.5];
            this.boxScale(labelBox,style.lineTextBoxDisance);
            let owmCrashBox = [pt[0]-style.lineHeight*0.5,pt[1]-style.lineHeight*1.2*0.5,pt[0]+style.lineHeight*0.5,pt[1]+style.lineHeight*0.5];
            owmCrashBoxs.push(owmCrashBox);
            boxs.push(labelBox);
        }


        if(!style.isImportant){
            for(let j = 0;j<owmCrashBoxs.length-1;j++){
                let box1 = owmCrashBoxs[j];
                for(let k=j+1 ;k<owmCrashBoxs.length ;k++){
                    let box2 = owmCrashBoxs[k];
                    if(this.crashBox(box1,box2)){
                        return null;
                    }
                }
            }
        }
        return boxs;
    }

    // 两个盒子是否相交.
    crashBox(ibox,jbox){
        return ibox[0] <= jbox[2] &&
            ibox[2]  >= jbox[0] &&
            ibox[1]  <= jbox[3] &&
            ibox[3]  >= jbox[1] ;
    }

    boxScale(box,pointBoxDisance){
        if(!pointBoxDisance && pointBoxDisance!=0){
            pointBoxDisance = this.boxDistance;
        }

        box[0] = box[0]-pointBoxDisance*0.5;
        box[1] = box[1]-pointBoxDisance*0.5;
        box[2] = box[2]+pointBoxDisance*0.5;
        box[3] = box[3]+pointBoxDisance*0.5;
        return box;
    }


    /**
     * 如果文字注记旋转角度方向不一致(有的字向左，有的字向右旋转)，则调整为一致
     * @param textPoints
     */
    textToSameBearing(angle,textPoints){
        //保证竖方向的字是正的
        if(angle >= 45){
            angle = angle - 90;
        }else{
            if(angle <= - 45){
                angle = angle + 90;
            }
        }


        for(let i = 0;i<textPoints.length;i++){
            let p = textPoints[i][1];
            let offsetAngle = angle - p;
            if(offsetAngle > 45){
                textPoints[i][1] = p +90;
            }
            if(offsetAngle < -45){
                textPoints[i][1] = p -90;
            }
        }
    }

    // /**
    //  * 如果文字注记旋转角度方向不一致(有的字向左，有的字向右旋转)，则调整为一致
    //  * @param textPoints
    //  */
    // textToSameBearing(textPoints){
    //     let indexs = [];
    //     for(let m = 0;m<textPoints.length-1;m++){
    //         let p1 = textPoints[m][1];
    //         let p2 = textPoints[m+1][1];
    //         if(Math.abs(p1 -p2) >= 45){
    //             indexs.push(m+1);
    //         }
    //     }
    //
    //     if(indexs.length == 0){
    //         return;
    //     }
    //
    //     let leftIndexDis = indexs[0];
    //     let rightIndexDis = textPoints.length  - indexs[indexs.length - 1];
    //
    //     //从线头方向开始更换文字的角度
    //     if(leftIndexDis > rightIndexDis){
    //         for(let i = leftIndexDis-1;i<textPoints.length-2;i++){
    //             let p1 = textPoints[i][1];
    //             let p2 = textPoints[i+1][1];
    //             if(p1 -p2 >= 45){
    //                 textPoints[i+1][1] = p2 + 90;
    //             }
    //
    //             if(p1 -p2 <= -45){
    //                 textPoints[i+1][1] = p2 - 90;
    //             }
    //         }
    //     }else{
    //         //从线尾方向开始更换文字方向
    //         for(let j = indexs[indexs.length - 1];j>0;j--){
    //             let p1 = textPoints[j][1];
    //             let p2 = textPoints[j-1][1];
    //             if(p1 -p2 >= 45){
    //                 textPoints[j-1][1] = p2 + 90;
    //             }
    //
    //             if(p1 -p2 <= -45){
    //                 textPoints[j-1][1] = p2 - 90;
    //             }
    //         }
    //     }
    // }
}

module.exports = GLabelBox;