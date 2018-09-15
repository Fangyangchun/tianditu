/**
 * Created by kongjian on 2017/6/26.
 * 绘制点，线面的工具类
 */
Custom.GDrawGeomerty ={
    /**
     * 画点注记图标
     * Parameters:
     *  ctx - 画布对象
     *  hitCtx - 画拾取box的画布对象
     * hitDetection - 是否绘制拾取的box
     * feature - 设置过样式，转换过为屏幕坐标，避让过的注记数据
     */
    drawPointIcon:function(ctx,hitCtx,hitDetection,feature,textures){
        var style = feature.style;
        if(!style.texture){
            return;
        }

        var width = style.graphicWidth;
        var height = style.graphicHeight;


        var textureKey = style.texture;
        var img = textures[textureKey];
        if(!img){
            return ;
        }

        if(!width || !height){
            width = img.width;
            height = img.height;
        }

        var xOffset =  style.graphicXOffset -0.5 * width;
        var yOffset =  style.graphicYOffset -0.5 * height;

        var point = feature.datas[0][0];
        var x = point[0] + xOffset;
        var y = point[1] + yOffset;
        var opacity = style.pointFillAlpha || 1;
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.drawImage(img, x, y, width, height);
        ctx.restore();

        //拾取检测用的矩形
        if (hitDetection) {
            this.setHitContextStyle(hitCtx,feature.id);
            hitCtx.fillRect(x,y,width,height);
        }
    },

    /**
     * 画点注记
     * Parameters:
     *  ctx - 画布对象
     *  hitCtx - 画拾取box的画布对象
     * hitDetection - 是否绘制拾取的box
     * feature - 设置过样式，转换过为屏幕坐标，避让过的注记数据
     */
    drawPoint:function(ctx,hitCtx,hitDetection,feature){
        if(!feature.label){
            return;
        }

        var style = feature.style;
        var pt = style.textPoint;
        var labelRows = feature.label.split(' ');
        var numRows = labelRows.length;
        var lineHeight = style.pointHeight;
        lineHeight =lineHeight +2;
        if(style.pointHashBackground == true){
            ctx.save();
            ctx.globalAlpha = style.pointBackgroundAlpha;
            ctx.strokeStyle = style.pointBackgroundLineColor;
            ctx.lineWidth = style.pointBackgroundLineWidth;
            ctx.fillStyle = style.pointBackgroundColor;
            ctx.font = style.pointFillFont;
            var rectX= pt[0] - style.pointBackgroundGap;
            var rectY = pt[1]-style.pointBackgroundGap - style.pointHeight/2;

            var maxWidth = 0;
            for (var i = 0; i < numRows; i++) {
                var itemWdith = ctx.measureText(labelRows[i]).width;
                if(itemWdith > maxWidth){
                    maxWidth = itemWdith;
                }
            }
            this.drawRoundRect(ctx,rectX,rectY,maxWidth+style.pointBackgroundGap*2,
                style.pointHeight*numRows+style.pointBackgroundGap*2+(numRows-1)*2,style.pointBackgroundRadius);
            ctx.fill();
            ctx.restore();

            for (var j = 0; j < numRows; j++) {
                if (style.pointHashOutline == true) {
                    ctx.save();
                    ctx.textBaseline = "middle";
                    ctx.globalAlpha = style.pointStrokeAlpha;
                    ctx.strokeStyle = style.pointStrokeStyle;
                    ctx.lineWidth = style.pointLineWidth;
                    ctx.font = style.pointStrokeFont;
                    ctx.strokeText(labelRows[j], pt[0], pt[1]+ (lineHeight * j) );
                    ctx.restore();
                }

                ctx.save();
                ctx.textBaseline = "middle";
                ctx.globalAlpha = style.pointFillAlpha;
                ctx.fillStyle = style.pointFillStyle;
                ctx.font = style.pointFillFont;
                ctx.fillText(labelRows[j], pt[0], pt[1]+ (lineHeight * j) );
                ctx.restore();
            }

            //拾取检测用的矩形
            if (hitDetection) {
                this.setHitContextStyle(hitCtx,feature.id);
                this.drawHitRoundRect(hitCtx,rectX,rectY,maxWidth+style.pointBackgroundGap*2,style.pointHeight+style.pointBackgroundGap*2,style.pointBackgroundRadius);
                hitCtx.fill();
            }
        }else{
            var maxWidth = 0;
            for (var i = 0; i < numRows; i++) {
                if (style.pointHashOutline == true) {
                    ctx.save();
                    ctx.textBaseline = "middle";
                    ctx.globalAlpha = style.pointStrokeAlpha;
                    ctx.strokeStyle = style.pointStrokeStyle;
                    ctx.lineWidth = style.pointLineWidth;
                    ctx.font = style.pointStrokeFont;
                    ctx.strokeText(labelRows[i], pt[0], pt[1]+ (lineHeight * i) );
                    ctx.restore();
                }

                ctx.save();
                ctx.textBaseline = "middle";
                ctx.globalAlpha = style.pointFillAlpha;
                ctx.fillStyle = style.pointFillStyle;
                ctx.font = style.pointFillFont;
                ctx.fillText(labelRows[i], pt[0], pt[1]+ (lineHeight * i) );
                maxWidth = ctx.measureText(labelRows[i]).width > maxWidth?  ctx.measureText(labelRows[i]).width : maxWidth ;
                ctx.restore();
            }


            //拾取检测用的矩形
            if (hitDetection) {
                this.setHitContextStyle(hitCtx,feature.id);
                hitCtx.textBaseline = "middle";
                hitCtx.fillRect(pt[0],pt[1]- style.pointHeight/2,maxWidth,lineHeight * numRows);
            }
        }
    },


    /**
     * 画线注记
     * Parameters:
     *  ctx - 画布对象
     * feature - 设置过样式，转换过为屏幕坐标，避让过的注记数据
     */
    drawLine : function(ctx,feature){

        if(feature.lineType == 'text'){
            this.drawLineText(ctx,feature);
        }

        if(feature.lineType == 'code'){
            this.drawLineCode(ctx,feature);
        }

        if(feature.lineType == 'arrow'){
            this.drawLineArrow(ctx,feature);
        }
    },


    /**
     * 画线文本注记
     * Parameters:
     *  ctx - 画布对象
     * feature - 设置过样式，转换过为屏幕坐标，避让过的注记数据
     */
    drawLineText : function(ctx, feature){
        var style = feature.style;
        var label = feature.label;
        var textPoints =  feature.textPoints;

        if(style.lineHashBackground == true){
            var index = Math.floor(textPoints.length/2);
            var localPoint = textPoints[index][0];
            this.drawBgText(ctx,label,localPoint,style.backgroundAlpha,
                style.backgroundLineColor,style.backgroundLineWidth,
                style.backgroundColor,style.lineFillFont,style.lineBackgroundGap,
                style.lineHeight,style.lineBackgroundRadius,style.lineHashOutline,
                style.lineStrokeAlpha,style.lineStrokeStyle,style.lineLineWidth,
                style.lineStrokeFont,style.lineFillAlpha,style.lineFillStyle);

        }else {
            //开始绘制线注记
            for (var j = 0; j < textPoints.length; j++) {
                var pa = textPoints[j];
                var angle = pa[1];
                var point = pa[0];
                var labelChar = label.charAt(j);

                if(style.lineHashOutline == true){
                    ctx.save();
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.globalAlpha = style.lineStrokeAlpha;
                    ctx.strokeStyle = style.lineStrokeStyle;
                    ctx.lineWidth = style.lineLineWidth;
                    ctx.font = style.lineStrokeFont;
                    ctx.translate(point[0], point[1]);
                    ctx.rotate(angle * Math.PI / 180);
                    ctx.strokeText(labelChar, 0, 0);
                    ctx.restore();
                }

                ctx.save();
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.globalAlpha = style.lineFillAlpha;
                ctx.fillStyle = style.lineFillStyle;
                ctx.font = style.lineFillFont;
                ctx.translate(point[0], point[1]);
                ctx.rotate(angle * Math.PI / 180);
                ctx.fillText(labelChar, 0, 0);
                ctx.restore();
            }
        }
    },

    /**
     * 画线编码注记
     * Parameters:
     *  ctx - 画布对象
     * feature - 设置过样式，转换过为屏幕坐标，避让过的注记数据
     */
    drawLineCode : function(ctx,feature){
        var style = feature.style;
        var localPoint =  feature.codePoint;
        // var codeLabel = feature.attributes[style.roadCodeLabel]+'';
        var codeLabel = feature.label;
        if(style.showRoadCode == true && codeLabel && codeLabel.length > 0){
            this.drawBgText(ctx,codeLabel,localPoint,style.codeBackgroundAlpha,
                style.codeBackgroundLineColor,style.codeBackgroundLineWidth,
                style.codeBackgroundColor,style.codeLineFillFont,style.codeLineBackgroundGap,
                style.codeLineHeight,style.codeLineBackgroundRadius,style.codeLineHashOutline,
                style.codeLineStrokeAlpha,style.codeLineStrokeStyle,style.codeLineLineWidth,
                style.codeLineStrokeFont,style.codeLineFillAlpha,style.codeLineFillStyle);
        }
    },


    /**
     * 画线箭头
     * Parameters:
     *  ctx - 画布对象
     * feature - 设置过样式，转换过为屏幕坐标，避让过的注记数据
     */
    drawLineArrow : function(ctx,feature){
        var points = feature.arrowPoint;
        var style = feature.style;
        var p1 = points[0][0];
        var p2 =  points[1][0];
        ctx.save();
        ctx.lineWidth=2;
        ctx.strokeStyle="#666666";
        ctx.fillStyle="#666666";
        //画线
        ctx.beginPath();
        ctx.moveTo(p1[0],p1[1]);
        ctx.lineTo(p2[0],p2[1]);
        ctx.stroke();
        //画箭头
        if(style.arrowDirectionValue == 0){
            var startRadians=Math.atan((p2[1]-p1[1])/(p2[0]-p1[0]));
            startRadians+=((p2[0]>p1[0])?-90:90)*Math.PI/180;
            this.drawArrowhead(ctx,p1[0],p1[1],startRadians);
        }else{
            var startRadians=Math.atan((p2[1]-p1[1])/(p2[0]-p1[0]));
            startRadians+=((p2[0]>p1[0])?90:-90)*Math.PI/180;
            this.drawArrowhead(ctx,p2[0],p2[1],startRadians);
        }
        ctx.restore();
    },

    /**
     * 画箭头的头
     * Parameters:
     */
    drawArrowhead : function(ctx,x,y,radians){
        ctx.beginPath();
        ctx.translate(x,y);
        ctx.rotate(radians);
        ctx.moveTo(0,0);
        ctx.lineTo(3,6);
        ctx.lineTo(0,5);
        ctx.lineTo(-3,6);
        ctx.closePath();
        ctx.fill();
    },

    /**
     * 画圆角矩形
     */
    drawRoundRect : function(ctx, x, y, width, height, radius){
        ctx.beginPath();
        ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
        ctx.lineTo(width - radius + x, y);
        ctx.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
        ctx.lineTo(width + x, height + y - radius);
        ctx.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
        ctx.lineTo(radius + x, height +y);
        ctx.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
        ctx.closePath();
    },

    /**
     * 绘制带背景的线文本
     */
    drawBgText : function(ctx,label,localPoint,backgroundAlpha,
                               backgroundLineColor,backgroundLineWidth,
                               backgroundColor,lineFillFont,lineBackgroundGap,
                               lineHeight,lineBackgroundRadius,lineHashOutline,
                               lineStrokeAlpha,lineStrokeStyle,lineLineWidth,
                               lineStrokeFont,lineFillAlpha,lineFillStyle){
        ctx.save();
        ctx.globalAlpha = backgroundAlpha;
        ctx.strokeStyle = backgroundLineColor;
        ctx.lineWidth = backgroundLineWidth;
        ctx.fillStyle = backgroundColor;
        ctx.font = lineFillFont;
        var w = ctx.measureText(label).width;
        var rectX= localPoint[0] - w/2-lineBackgroundGap;
        var rectY = localPoint[1]-lineHeight/2-lineBackgroundGap;
        this.drawRoundRect(ctx,rectX,rectY,w+lineBackgroundGap*2,lineHeight+lineBackgroundGap*2,lineBackgroundRadius);
        ctx.fill();
        ctx.restore();

        if(lineHashOutline == true){
            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.globalAlpha = lineStrokeAlpha;
            ctx.strokeStyle = lineStrokeStyle;
            ctx.lineWidth = lineLineWidth;
            ctx.font = lineStrokeFont;
            ctx.translate(localPoint[0], localPoint[1]);
            ctx.strokeText(label, 0, 0);
            ctx.restore();
        }

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = lineFillAlpha;
        ctx.fillStyle = lineFillStyle;
        ctx.font = lineFillFont;
        ctx.translate(localPoint[0], localPoint[1]);
        ctx.fillText(label, 0, 0);
        ctx.restore();
    },

    /**
     * 根据featureId生成颜色值
     */
    featureIdToHex : function(featureId) {
        var id = Number(featureId) + 1;
        return "#" + id.toString(16);
    },

    setHitContextStyle:function(hitCtx,featureId){
        var hex = this.featureIdToHex(featureId);
        hitCtx.globalAlpha = 1;
        hitCtx.fillStyle = hex;
    },

    /**
     * 绘制拾取背景框
     */
    drawHitRoundRect : function(hitCtx, x, y, width, height, radius){
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