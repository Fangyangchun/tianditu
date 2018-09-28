const GDistance = require('./GDistance');
const Util = require('./Util');
class GCutLine{
    static cutLineFeature(feature){
        let fs = [];
        let index = 0;
        if(feature.sourceData.length < 4){
            return fs;
        }



        let lineText = this.createLineTextFeatrue(feature,index);
        index = lineText.index;
        if(lineText.feature){
            fs.push(lineText.feature);
        }

        let lineCode= this.createLineCodeFeatrue(feature,index);
        index = lineCode.index;
        if(lineCode.feature){
            fs.push(lineCode.feature);
        }

        let lineArrow= this.createLineArrowFeatrue(feature,index);
        if(lineArrow.feature){
            fs.push(lineArrow.feature);
        }
        return fs;
    }

    /**
     * 创建线文字注记
     *  Parameters :
     *  feature
     *  index - 可用的line的index位置
     */
    static createLineTextFeatrue(feature,index){
        let style = feature.style;
        let line = feature.sourceData;
        let d = new GDistance();
        let gaps = [];
        let textFeature =null;

        if(Util.isNotNull(feature.label)) {
            //获取线段长度
            // let lineDis = this.getLineDistance(line);
            //如果线段长度小于100个像素,则只取首尾两个点
            // if(lineDis < 100 && lineDis >0){
            //     line = [line[0],line[1],line[line.length-2],line[line.length-1]];
            // }

            //线注记的文字内容
            feature.label = feature.label+ '';
            //多切一个字的宽度，防止文字方向反转时，线段不够长
            for (let count = 0; count < feature.label.length + 1; count++) {
                gaps.push(style.lineHeight*1.2 +2+ style.gap);
            }

            let cloneGaps = [].concat(gaps);
            let points = d.getNodePath(line, gaps);
            let textPoints = points.pointList;

            if(textPoints.length > 1){
                index = points.index;
                let showChanged = false;
                let endLength = feature.label.length > textPoints.length ? textPoints.length -1:feature.label.length-1;
                let p1 = [textPoints[0][0][0], textPoints[0][0][1]];
                let p2 = textPoints[endLength][0];

                //获取两点连线与x轴的夹角
                let angle = Util.getAngle(p1,p2);
                textFeature =  this.cloneFeature(feature);
                textFeature.angle = angle;

                if(style.changeDirection != false){
                    //改变方向
                    //判断是否应该换方向
                    showChanged = this.isChangeDirection(feature.label,p1, p2,angle);
                    if (showChanged) {
                        textPoints = this.changeDirection(line, textPoints, cloneGaps,index,endLength);
                    }
                }

                textFeature.attributeId = textFeature.attributeId+'_text';
                textFeature.sourceAngleData = textPoints;
                textFeature.lineType = 'text';

                if(textPoints.length < feature.label.length){
                    index = feature.sourceData.length;
                    //如果文字放不下，则增加延长线
                    if(textPoints.length > feature.label.length*0.5){
                        this.delayTextPoint(line,textPoints,feature.label,style.chinaLabelWidth + style.gap,showChanged);
                    }else{
                        textFeature = null;
                    }
                }
            }else{
                if(!style.showRoadCode){
                    textFeature =  this.cloneFeature(feature);
                    textFeature.attributeId = textFeature.attributeId+'_text';
                    textFeature.sourceAngleData = [[[line[0],line[1]],0]];
                    textFeature.lineType = 'text';
                    index =2;
                }
            }
        }
        return {feature:textFeature,index:index};
    }

    /**
     * 创建线编码注记
     *  Parameters :
     *  feature
     *  index - 可用的line的index位置
     */
    static createLineCodeFeatrue(feature,index){
        let style = feature.style;
        let line = feature.sourceData;
        let d = new GDistance();
        let gaps = [];
        let codeFeature =null;

        let roadLabel = feature.roadCodeLabel;
        //如果有道路编码
        if(style.showRoadCode && Util.isNotNull(roadLabel) && index < line.length){
            let codeLine = line.slice(index,line.length -1);
            //默认是30个像素
            gaps.push(30);
            let cPoints = d.getNodePath(codeLine, gaps);
            let codePoints = cPoints.pointList;
            if(codePoints.length  == 1){
                index = index + cPoints.index;
                codeFeature =  this.cloneFeature(feature);
                codeFeature.attributeId = codeFeature.attributeId+'_code';
                codeFeature.sourceAngleData = codePoints;
                codeFeature.lineType = 'code';
                codeFeature.label = roadLabel+'';
            }

            if(codePoints.length ==0){
                codeFeature =  this.cloneFeature(feature);
                codeFeature.attributeId = codeFeature.attributeId+'_code';
                codeFeature.sourceAngleData = [[line,0]];
                codeFeature.lineType = 'code';
                codeFeature.label = roadLabel+'';
                index = 2;
                return {feature:codeFeature,index:index};
            }
        }
        return {feature:codeFeature,index:index};
    }

    /**
     * 创建线箭头注记
     *  Parameters :
     *  feature
     *  index - 可用的line的index位置
     */
    static createLineArrowFeatrue(feature,index){
        let style = feature.style;
        let line = feature.sourceData;
        let d = new GDistance();
        let gaps = [];
        let arrowFeature =null;

        //如果有箭头
        if(style.showArrow && index < line.length){
            let arrowLine = line.slice(index,line.length -1);
            gaps.push(16);
            gaps.push(16);
            let aPoints = d.getNodePath(arrowLine, gaps);
            let arrowPoints = aPoints.pointList;

            if(arrowPoints.length == 2){
                arrowFeature =  this.cloneFeature(feature);
                arrowFeature.attributeId = arrowFeature.attributeId+'_arrow';
                arrowFeature.sourceAngleData = arrowPoints;
                arrowFeature.lineType = 'arrow';
            }
        }
        return {feature:arrowFeature,index:index};
    }

    /**
     * 当线文字放不下时，获取延长线上的点
     *  Parameters :
     *  line - 原始线坐标
     *  textPoints - 切割之后的点坐标
     *  label - 线注记
     *  gap - 每个字之间的间隔
     *  showChanged
     *
     */
    static delayTextPoint(line,textPoints,label,gap,showChanged){
        let fristPoint = null;
        let secondPoint = null;
        //如果只能放下一个字
        if(textPoints.length == 1){
            if(showChanged){
                fristPoint = [line[line.length -2],line[line.length -1]];
            }else{
                fristPoint = [line[0],line[1]];
            }
        }else{
            fristPoint = textPoints[textPoints.length-2][0];
        }
        secondPoint = textPoints[textPoints.length-1][0];
        let angle = textPoints[textPoints.length-1][1];

        let len = textPoints.length;
        for(let i = 1;i<label.length - len +1;i++){
            let p = this.getPoint(fristPoint,secondPoint,gap*i);
            let textPoint = [p,angle];
            textPoints.push(textPoint);
        }
    }

    /**
     * 克隆feature
     *  Parameters :
     *  feature - 单个线注记要素
     */
    static cloneFeature(feature){
        return {type:feature.type,datas:feature.datas,sourceData:feature.sourceData,label:feature.label,roadCodeLabel:feature.roadCodeLabel,
            attributeId:feature.attributeId,style:feature.style,textures:feature.textures,xyz:feature.xyz,
            lineType:feature.lineType,weight:feature.weight,attributes:feature.attributes};
    }

    /**
     *  改变文本线段的方向
     *  Parameters :
     *  line - 原始线数据
     *  textPoints - 未改方向前的文本线段数组
     *  gaps - 要切割的线段的数据间距
     *  index - 文本在原始线段中，能写到line的那个index索引位置
     */
    static changeDirection(line,textPoints,gaps,index,endLength){
        //判断是否应该换方向
        index = index >=line.length? line.length:index;
        let textLine = line.slice(0,index);
        let linePoint = [];
        for(let i = 0;i<textLine.length-1;i++){
            linePoint.push([textLine[i],textLine[i+1]]);
            i++;
        }
        linePoint = linePoint.reverse();

        let lastPoint = textPoints[endLength][0];
        textLine = [lastPoint[0],lastPoint[1]];
        for(let j = 0;j<linePoint.length;j++){
            textLine.push(linePoint[j][0]);
            textLine.push(linePoint[j][1]);
        }
        let d = new GDistance();
        textPoints = d.getNodePath(textLine,gaps).pointList;
        return textPoints;
    }


    /**
     * 是否需要改变线的方向
     *  Parameters :
     *  p1 - 线段起点
     *  p2 -线段的重点
     *  angle - 两点连线与x轴的夹角
     */
    static isChangeDirection(label,p1,p2,angle){
        let showChange = false;
        //判断是否包含汉字
        if(/.*[\u4e00-\u9fa5]+.*$/.test(label)) {
            //如果是垂直线
            if(p1[0] == p2[0]){
                if(p1[1]>p2[1]){
                    showChange = true;
                    return showChange;
                }
            }

            //如果是反斜线，并且夹角与x轴的夹角大于45度
            if(angle<-45 && angle>-90 ){
                if(p1[0]< p2[0]){
                    showChange = true;
                }
            }else{
                if(p1[0]> p2[0]){
                    showChange = true;
                }
            }
        }else{
            if(p1[0] > p2[0]){
                showChange = true;
            }
        }
        return showChange;
    }




    /**
     * 求两点之间的距离
     */
    static getDistance(p1,p2){
        let calX = p2[0] - p1[0];
        let calY = p2[1] - p1[1];
        return Math.pow((calX *calX + calY * calY), 0.5);
    }

    /**
     * 获取线的长度
     */
    static getLineDistance(line){
        if(line.length <4){
            return 0;
        }

        let dis = 0;
        for(let i = 0;i<line.length/2-1;i++){
            let p1 = [line[2*i],line[2*i+1]];
            let p2 = [line[2*(i+1)],line[2*(i+1)+1]];
            dis = dis + this.getDistance(p1,p2);
        }
        return dis;
    }

    /**
     * 已知两点，延长距离，获取延长线上的点坐标
     */
    static getPoint(p1,p2,d){
        let xab = p2[0] - p1[0];
        let yab = p2[1] - p1[1];
        let xd = p2[0];
        let yd = p2[1];
        if(xab == 0){
            if(yab > 0){
                yd = p2[1] + d;
            }else{
                yd = p2[1] - d;
            }
        }else{
            let xbd = Math.sqrt((d * d)/((yab/xab) * (yab/xab) + 1));
            if (xab < 0) {
                xbd = -xbd
            }

            xd = p2[0] + xbd;
            yd = p2[1] + yab / xab * xbd;
        }
        return [xd,yd];
    }
}

module.exports = GCutLine;