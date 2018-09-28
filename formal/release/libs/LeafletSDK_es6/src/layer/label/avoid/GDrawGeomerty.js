/**
 * Created by kongjian on 2017/6/26.
 * 绘制点，线面的工具类
 */
const BoxSet = require('../../../utils/gistools/BoxSet');
const _boxSet512 = new BoxSet(0,512,0,512,512,5);
const _boxSet256 = new BoxSet(0,256,0,256,256,5);

const GisTools = require('../../../utils/gistools/GisTools');
const Util = require('./Util');
class GDrawGeomerty{
    /**
     * 画注记
     * Parameters:
     * features - 设置过样式，转换过为屏幕坐标，避让过的注记数据
     */
    static draw(ctx,features,ratio,checkDraw,isChangeFont,hitCtx,hitDetection){
        let drewMap = null;
        if(checkDraw){
            drewMap = new Map();
        }

        for(let i = 0;i<features.length;i++){
            let feature = features[i];
            //画点注记
            if(feature.type == 1){
                this.drawPointIcon(ctx,feature,ratio,drewMap,hitCtx,hitDetection);
                this.drawPoint(ctx,feature,ratio,drewMap,isChangeFont,hitCtx,hitDetection);
                continue;
            }
            //画线注记
            if(feature.type == 2){
                this.drawLine(ctx,feature,ratio,drewMap,isChangeFont,hitCtx,hitDetection);
            }
        }
        drewMap = null;
    };

    /**
     * 画点注记图标
     * Parameters:
     *  ctx - 画布对象
     *  hitCtx - 画拾取box的画布对象
     * hitDetection - 是否绘制拾取的box
     * feature - 设置过样式，转换过为屏幕坐标，避让过的注记数据
     */
    static drawPointIcon(ctx,feature,ratio,drewMap,hitCtx,hitDetection){
        let style = feature.style;
        if(!style.texture){
            return;
        }

        let width = style.graphicWidth;
        let height = style.graphicHeight;


        let img = feature.iconImg;
        if(!img){
            return ;
        }

        if(!width || !height){
            width = img.width;
            height = img.height;
            if(drewMap){
                width = width/ratio;
                height = height/ratio;
            }
        }

        let xOffset =  style.graphicXOffset -0.5 * width;
        let yOffset =  style.graphicYOffset -0.5 * height;

        let pointOffsetX = style.pointOffsetX;
        let pointOffsetY = style.pointOffsetY;
        if(!pointOffsetX){
            pointOffsetX = 0;
        }
        if(!pointOffsetY){
            pointOffsetY = 0;
        }
        //包括点图标的box,用于避让
        let point = [feature.datas[0][0][0],feature.datas[0][0][1]];
        point[0] = point[0]+pointOffsetX;
        point[1] = point[1]+pointOffsetY;

        let x = point[0] + xOffset;
        let y = point[1] + yOffset;
        let opacity = style.pointFillAlpha || 1;

        // 画过的不画
        if(drewMap){
            let drewMark = style.texture + "_" + x + "_" + y;
            if(drewMap.get(drewMark) == null) {
                drewMap.set(drewMark,true);
            }else{
                return;
            }
        }

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.drawImage(img, x*ratio, y*ratio, width*ratio, height*ratio);
        ctx.restore();

        //拾取检测用的矩形
        if (hitDetection) {
            hitCtx.save();
            this.setHitContextStyle(hitCtx,feature.id);
            hitCtx.fillRect(x,y,width,height);
            hitCtx.restore();
        }
    }

    /**
     * 画点注记
     * Parameters:
     *  ctx - 画布对象
     *  hitCtx - 画拾取box的画布对象
     * hitDetection - 是否绘制拾取的box
     * feature - 设置过样式，转换过为屏幕坐标，避让过的注记数据
     */
    static drawPoint(ctx,feature,ratio,drewMap,isChangeFont,hitCtx,hitDetection){
        if(!feature.label){
            return;
        }

        let style = feature.style;
        //不在范围内的不绘制
        let pt = style.textPoint;
        if(drewMap){
            //如果这个注记不在渲染格网里面，则不绘制；
            let polyIn = GisTools.boxToPolyArr(feature.box[0],feature.box[1],feature.box[2],feature.box[3]);
            let polyOut;
            if(ctx.canvas.width / ratio == 512){
                polyOut = GisTools.boxToPolyArr(-20,-20,532,532);
            }else if(ctx.canvas.width / ratio == 256){
                polyOut = GisTools.boxToPolyArr(-15,-15,271,271);
            }
            if(GisTools.polyWith(polyOut,polyIn) == 3 ){
                return;
            }

            let drewKey = feature.label + "_" + pt[0] + "_" + pt[1];
            if(drewMap.get(drewKey) == null){
                drewMap.set(drewKey,true);
            }else{
                return;
            }
        }


        let labelRows = feature.label.split(' ');
        let numRows = labelRows.length;
        let lineHeight = style.pointHeight;
        lineHeight =lineHeight +2;

        let pointFillFont = Util.formatFont(style.pointFillFont,ratio,isChangeFont);
        let pointStrokeFont = Util.formatFont(style.pointStrokeFont,ratio,isChangeFont);

        if(style.pointHashBackground == true){
            ctx.save();
            ctx.globalAlpha = style.pointBackgroundAlpha;
            ctx.strokeStyle = style.pointBackgroundLineColor;
            ctx.lineWidth = style.pointBackgroundLineWidth;
            ctx.fillStyle = style.pointBackgroundColor;
            ctx.font = style.pointFillFont;
            let rectX= pt[0] - style.pointBackgroundGap;
            let rectY = pt[1]-style.pointBackgroundGap - style.pointHeight/2;

            let maxWidth = 0;
            for (let i = 0; i < numRows; i++) {
                let itemWdith = ctx.measureText(labelRows[i]).width;
                if(itemWdith > maxWidth){
                    maxWidth = itemWdith;
                }
            }
            this.drawRoundRect(ctx,rectX,rectY,maxWidth+style.pointBackgroundGap*2,
                style.pointHeight*numRows+style.pointBackgroundGap*2+(numRows-1)*2,style.pointBackgroundRadius,ratio);
            ctx.fill();
            ctx.restore();

            for (let j = 0; j < numRows; j++) {
                if (style.pointHashOutline == true){
                    ctx.save();
                    ctx.textBaseline = "middle";
                    ctx.globalAlpha = style.pointStrokeAlpha;
                    ctx.strokeStyle = style.pointStrokeStyle;
                    ctx.lineWidth = style.pointLineWidth;
                    ctx.font = pointStrokeFont;
                    ctx.strokeText(labelRows[j], pt[0]*ratio, (pt[1]+ (lineHeight * j))*ratio);
                    ctx.restore();
                }

                ctx.save();
                ctx.textBaseline = "middle";
                ctx.globalAlpha = style.pointFillAlpha;
                ctx.fillStyle = style.pointFillStyle;
                ctx.font = pointFillFont;
                ctx.fillText(labelRows[j], pt[0]*ratio, (pt[1]+ (lineHeight * j))*ratio);
                ctx.restore();
            }

            //拾取检测用的矩形
            if (hitDetection) {
                hitCtx.save();
                this.setHitContextStyle(hitCtx,feature.id);
                this.drawHitRoundRect(hitCtx,rectX,rectY,maxWidth+style.pointBackgroundGap*2,style.pointHeight+style.pointBackgroundGap*2,style.pointBackgroundRadius);
                hitCtx.fill();
                hitCtx.restore();
            }
        }else{
            let maxWidth = 0;
            for (let i = 0; i < numRows; i++) {
                if (style.pointHashOutline == true) {
                    ctx.save();
                    ctx.textBaseline = "middle";
                    ctx.globalAlpha = style.pointStrokeAlpha;
                    ctx.strokeStyle = style.pointStrokeStyle;
                    ctx.lineWidth = style.pointLineWidth;
                    ctx.font = pointStrokeFont;
                    ctx.strokeText(labelRows[i], pt[0]*ratio, (pt[1]+ (lineHeight * i))*ratio);
                    ctx.restore();
                }

                ctx.save();
                ctx.textBaseline = "middle";
                ctx.globalAlpha = style.pointFillAlpha;
                ctx.fillStyle = style.pointFillStyle;
                ctx.font = pointFillFont;
                ctx.fillText(labelRows[i], pt[0]*ratio, (pt[1]+ (lineHeight * i))*ratio);
                maxWidth = ctx.measureText(labelRows[i]).width > maxWidth?  ctx.measureText(labelRows[i]).width : maxWidth ;
                ctx.restore();
            }


            //拾取检测用的矩形
            if (hitDetection) {
                hitCtx.save();
                this.setHitContextStyle(hitCtx,feature.id);
                hitCtx.textBaseline = "middle";
                hitCtx.fillRect(pt[0],pt[1]- style.pointHeight/2,maxWidth,lineHeight * numRows);
                hitCtx.restore();
            }
        }
    }


    /**
     * 画线注记
     * Parameters:
     *  ctx - 画布对象
     * hitCtx - 画拾取box的画布对象
     * hitDetection - 是否绘制拾取的box
     * feature - 设置过样式，转换过为屏幕坐标，避让过的注记数据
     */
    static drawLine(ctx,feature,ratio,drewMap,isChangeFont,hitCtx,hitDetection){

        if(feature.lineType == 'text'){
            this.drawLineText(ctx,feature,ratio,drewMap,isChangeFont,hitCtx,hitDetection);
        }

        if(feature.lineType == 'code'){
            this.drawLineCode(ctx,feature,ratio,drewMap,isChangeFont,hitCtx,hitDetection);
        }

        if(feature.lineType == 'arrow'){
            this.drawLineArrow(ctx,feature,ratio,drewMap,hitCtx,hitDetection);
        }
    }


    /**
     * 画线文本注记
     * Parameters:
     *  ctx - 画布对象
     * hitCtx - 画拾取box的画布对象
     * hitDetection - 是否绘制拾取的box
     * feature - 设置过样式，转换过为屏幕坐标，避让过的注记数据
     */
    static drawLineText(ctx,feature,ratio,drewMap,isChangeFont,hitCtx,hitDetection){
        let style = feature.style;
        let label = feature.label;
        let textPoints =  feature.textPoints;

        let lineBoxSet;
        if(drewMap){
            // 如果是512 则使用boxset 512
            if(ctx.canvas.width / ratio == 512){
                lineBoxSet = _boxSet512;
            }else if(ctx.canvas.width / ratio == 256){
                lineBoxSet = _boxSet256;
            }
        }

        let lineFillFont = Util.formatFont(style.lineFillFont,ratio,isChangeFont);
        let lineStrokeFont = Util.formatFont(style.lineStrokeFont,ratio,isChangeFont);

        //去掉尾部的空格
        //只有一个点，或者是有线背景矩形框
        if(style.lineHashBackground == true || textPoints.length == 1){
            let index = Math.floor(textPoints.length/2);
            let localPoint = textPoints[index][0];
            if(textPoints.length == 1){
                this.drawBgText(ctx,label,ratio,localPoint,style.backgroundAlpha,
                    style.backgroundLineColor,style.backgroundLineWidth,
                    style.backgroundColor,style.lineFillFont,style.lineBackgroundGap,
                    style.lineHeight,style.lineBackgroundRadius,style.lineHashOutline,
                    style.lineStrokeAlpha,style.lineStrokeStyle,style.lineLineWidth,
                    style.lineStrokeFont,style.lineFillAlpha,style.lineFillStyle,
                    hitCtx,hitDetection,feature.id,false,isChangeFont);
            }else{
                this.drawBgText(ctx,label,ratio,localPoint,style.backgroundAlpha,
                    style.backgroundLineColor,style.backgroundLineWidth,
                    style.backgroundColor,style.lineFillFont,style.lineBackgroundGap,
                    style.lineHeight,style.lineBackgroundRadius,style.lineHashOutline,
                    style.lineStrokeAlpha,style.lineStrokeStyle,style.lineLineWidth,
                    style.lineStrokeFont,style.lineFillAlpha,style.lineFillStyle,
                    hitCtx,hitDetection,feature.id,true,isChangeFont);
            }

        }else {
            //开始绘制线注记
            for (let j = 0; j < label.length; j++) {
                let pa = textPoints[j];
                let angle = pa[1];
                let point = pa[0];
                let labelChar = label.charAt(j);

                if(drewMap){
                    let drewKey = labelChar + "_" + point[0] + "_" + point[1] + "_" + angle;
                    if(drewMap.get(drewKey) != null){
                        continue;
                    }
                    drewMap.set(drewKey,true);
                    if(!lineBoxSet.in([point[0] / ratio, point[1] / ratio])){
                        continue;
                    }
                }


                if(style.lineHashOutline == true){
                    ctx.save();
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.globalAlpha = style.lineStrokeAlpha;
                    ctx.strokeStyle = style.lineStrokeStyle;
                    ctx.lineWidth = style.lineLineWidth;
                    ctx.font = lineStrokeFont;
                    ctx.translate(point[0]*ratio, point[1]*ratio);
                    ctx.rotate(angle * Math.PI / 180);
                    ctx.strokeText(labelChar, 0, 0);
                    ctx.restore();
                }

                ctx.save();
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.globalAlpha = style.lineFillAlpha;
                ctx.fillStyle = style.lineFillStyle;
                ctx.font = lineFillFont;
                ctx.translate(point[0]*ratio, point[1]*ratio);
                ctx.rotate(angle * Math.PI / 180);
                ctx.fillText(labelChar, 0, 0);
                ctx.restore();


                //拾取检测用的矩形
                if (hitDetection) {
                    hitCtx.save();
                    this.setHitContextStyle(hitCtx,feature.id);
                    hitCtx.translate(point[0], point[1]);
                    hitCtx.rotate(angle * Math.PI / 180);
                    hitCtx.fillRect(-style.lineHeight*1.2*0.5, -style.lineHeight*1.2*0.5,style.lineHeight*1.2,style.lineHeight*1.2);
                    hitCtx.restore();
                }
            }
        }
    }

    /**
     * 画线编码注记
     * Parameters:
     *  ctx - 画布对象
     * hitCtx - 画拾取box的画布对象
     * hitDetection - 是否绘制拾取的box
     * feature - 设置过样式，转换过为屏幕坐标，避让过的注记数据
     */
    static drawLineCode(ctx,feature,ratio,drewMap,isChangeFont,hitCtx,hitDetection){
        let style = feature.style;
        let localPoint =  feature.codePoint;
        let codeLabel = feature.label;


        if(style.showRoadCode == true && codeLabel && codeLabel.length > 0){
            this.drawBgText(ctx,codeLabel,ratio,localPoint,style.codeBackgroundAlpha,
                style.codeBackgroundLineColor,style.codeBackgroundLineWidth,
                style.codeBackgroundColor,style.codeLineFillFont,style.codeLineBackgroundGap,
                style.codeLineHeight,style.codeLineBackgroundRadius,style.codeLineHashOutline,
                style.codeLineStrokeAlpha,style.codeLineStrokeStyle,style.codeLineLineWidth,
                style.codeLineStrokeFont,style.codeLineFillAlpha,style.codeLineFillStyle,
                hitCtx,hitDetection,feature.id,true,isChangeFont);
        }
    }

    /**
     * 画线箭头
     * Parameters:
     *  ctx - 画布对象
     * hitCtx - 画拾取box的画布对象
     * hitDetection - 是否绘制拾取的box
     * feature - 设置过样式，转换过为屏幕坐标，避让过的注记数据
     */
    static drawLineArrow(ctx,feature,ratio,drewMap,hitCtx,hitDetection){
        let points = feature.arrowPoint;
        let style = feature.style;
        let p1 = points[0][0];
        let p2 =  points[1][0];
        ctx.save();
        ctx.lineWidth=2;
        ctx.strokeStyle="#666666";
        ctx.fillStyle="#666666";
        //画线
        ctx.beginPath();
        ctx.moveTo(p1[0]*ratio,p1[1]*ratio);
        ctx.lineTo(p2[0]*ratio,p2[1]*ratio);
        ctx.stroke();
        //画箭头
        if(style.arrowDirectionValue == 0){
            let startRadians=Math.atan((p2[1]-p1[1])/(p2[0]-p1[0]));
            startRadians+=((p2[0]>p1[0])?-90:90)*Math.PI/180;
            this.drawArrowhead(ctx,p1[0],p1[1],startRadians,ratio);
        }else{
            let startRadians=Math.atan((p2[1]-p1[1])/(p2[0]-p1[0]));
            startRadians+=((p2[0]>p1[0])?90:-90)*Math.PI/180;
            this.drawArrowhead(ctx,p2[0],p2[1],startRadians,ratio);
        }
        ctx.restore();
    }

    /**
     * 画箭头的头
     * Parameters:
     */
    static drawArrowhead(ctx,x,y,radians,ratio){
        ctx.beginPath();
        ctx.translate(x*ratio,y*ratio);
        ctx.rotate(radians);
        ctx.moveTo(0,0);
        ctx.lineTo(3*ratio,6*ratio);
        ctx.lineTo(0,5);
        ctx.lineTo(-3*ratio,6*ratio);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * 画圆角矩形
     */
    static drawRoundRect(ctx, x, y, width, height, radius,ratio){
        ctx.beginPath();
        ctx.arc((x + radius)*ratio, (y + radius)*ratio, radius*ratio, Math.PI, Math.PI * 3 / 2);
        ctx.lineTo((width - radius + x)*ratio, y*ratio);
        ctx.arc((width - radius + x)*ratio, (radius + y)*ratio, radius*ratio, Math.PI * 3 / 2, Math.PI * 2);
        ctx.lineTo((width + x)*ratio, (height + y - radius)*ratio);
        ctx.arc((width - radius + x)*ratio, (height - radius + y)*ratio, radius*ratio, 0, Math.PI * 1 / 2);
        ctx.lineTo((radius + x)*ratio, (height +y)*ratio);
        ctx.arc((radius + x)*ratio, (height - radius + y)*ratio, radius*ratio, Math.PI * 1 / 2, Math.PI);
        ctx.closePath();
    }

    /**
     * 绘制带背景的线文本
     */
    static drawBgText(ctx,label,ratio,localPoint,backgroundAlpha,
                          backgroundLineColor,backgroundLineWidth,
                          backgroundColor,lineFillFont,lineBackgroundGap,
                          lineHeight,lineBackgroundRadius,lineHashOutline,
                          lineStrokeAlpha,lineStrokeStyle,lineLineWidth,
                          lineStrokeFont,lineFillAlpha,lineFillStyle,hitCtx,hitDetection,featureId,isDrawbg,isChangeFont){
        ctx.save();
        ctx.globalAlpha = backgroundAlpha;
        ctx.strokeStyle = backgroundLineColor;
        ctx.lineWidth = backgroundLineWidth;
        ctx.fillStyle = backgroundColor;
        ctx.font = Util.formatFont(lineFillFont,1,isChangeFont);
        let w = ctx.measureText(label).width;
        let rectX= localPoint[0] - w/2-lineBackgroundGap;
        let rectY = localPoint[1]-lineHeight/2-lineBackgroundGap;
        if(isDrawbg){
            this.drawRoundRect(ctx,rectX,rectY,w+lineBackgroundGap*2,lineHeight+lineBackgroundGap*2,lineBackgroundRadius,ratio);
            ctx.fill();
        }
        ctx.restore();


        lineFillFont = Util.formatFont(lineFillFont,ratio,isChangeFont);
        lineStrokeFont = Util.formatFont(lineStrokeFont,ratio,isChangeFont);
        if(lineHashOutline == true){
            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.globalAlpha = lineStrokeAlpha;
            ctx.strokeStyle = lineStrokeStyle;
            ctx.lineWidth = lineLineWidth;
            ctx.font = lineStrokeFont;
            ctx.translate(localPoint[0]*ratio, localPoint[1]*ratio);
            ctx.strokeText(label, 0, 0);
            ctx.restore();
        }

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = lineFillAlpha;
        ctx.fillStyle = lineFillStyle;
        ctx.font = lineFillFont;
        ctx.translate(localPoint[0]*ratio, localPoint[1]*ratio);
        ctx.fillText(label, 0, 0);
        ctx.restore();


        //拾取检测用的矩形
        if (hitDetection) {
            hitCtx.save();
            this.setHitContextStyle(hitCtx, featureId);
            this.drawHitRoundRect(hitCtx,rectX,rectY,w+lineBackgroundGap*2,lineHeight+lineBackgroundGap*2,lineBackgroundRadius);
            hitCtx.fill();
            hitCtx.restore();
        }
    }

    /**
     * 根据featureId生成颜色值
     */
    static featureIdToHex(featureId) {
        let id = Number(featureId) + 1;
        let hex = "000000" + id.toString(16);
        let len = hex.length;
        hex = "#" + hex.substring(len-6, len);
        return hex;
    }

    static setHitContextStyle(hitCtx,featureId){
        let hex = this.featureIdToHex(featureId);
        hitCtx.globalAlpha = 1;
        hitCtx.fillStyle = hex;
    }

    /**
     * 绘制拾取背景框
     */
    static drawHitRoundRect(hitCtx, x, y, width, height, radius){
        hitCtx.beginPath();
        hitCtx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
        hitCtx.lineTo(width - radius + x, y);
        hitCtx.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
        hitCtx.lineTo(width + x, height + y - radius);
        hitCtx.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
        hitCtx.lineTo(radius + x, height +y);
        hitCtx.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
        hitCtx.closePath();
    }
}
module.exports = GDrawGeomerty;