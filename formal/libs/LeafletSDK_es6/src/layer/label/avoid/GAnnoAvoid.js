/**
 * Class: GAnnoAvoid
 * 避让策略类
 *
 * Inherits:
 *  - <Object>
 */
const GGridIndex = require('./GGridIndex');
const GLabelBox = require('./GLabelBox');
class GAnnoAvoid{
    constructor(ctx,formatFont) {
        this.grid=null;
        this.GLabelBox = new GLabelBox(ctx,formatFont);
    }

    //注记和线图元进行避让
    avoid(labelFeatures,avoidLineFeatures){
        if(avoidLineFeatures.length  == 0){
            return labelFeatures;
        }

        for(let i =0;i<labelFeatures.length;i++){
            let labelFeature = labelFeatures[i];
            if(labelFeature.type == 1){
                this.avoidPointLine(labelFeature,avoidLineFeatures);
            }

            if(labelFeature.type == 2){
                labelFeature.isCollision = this.avoidLineLine(labelFeature,avoidLineFeatures);
            }
        }

        return labelFeatures;
    }

    //点注记和线图元避让
    avoidPointLine(feature,avoidLineFeatures){
        let startDirection = feature.style.direction;
        let weight = feature.weight;

        //获取需要与注记避让的线图元
        avoidLineFeatures = this.getAvoidLineFeatures(weight,avoidLineFeatures);

        //删除的方向个数
        let delDirectionCount = 0;
        let boxCount = feature.boxs.length;
        for(let i = 0;i<avoidLineFeatures.length;i++){
            let avoidLineFeature = avoidLineFeatures[i];
            for(let j = 0;j<boxCount;j++) {
                let direction = startDirection + j;
                if (direction >= boxCount) {
                    direction = direction - boxCount;
                }

                let box = feature.boxs[direction];
                let b = this.crashBoxLine(box,avoidLineFeature.sourceDatas,false);
                if(b){
                    if(feature.directions[direction]){
                        //点注记的四个方向中减去一个方向
                        delete feature.directions[direction];
                        delDirectionCount++;

                        //如果四个方向都压盖，则压盖
                        if(delDirectionCount == 4){
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }


    //线注记和线图元避让
    avoidLineLine(feature,avoidLineFeatures){
        let weight = feature.weight;

        //获取需要与注记避让的线图元
        avoidLineFeatures = this.getAvoidLineFeatures(weight,avoidLineFeatures);

        for(let j = 0;j<avoidLineFeatures.length;j++){
            let avoidLineFeature = avoidLineFeatures[j];
            let isCollision = false;
            for(let i = 0;i<feature.boxs.length;i++){
                isCollision = this.crashPartLineLine(feature.boxs[i],avoidLineFeature.sourceDatas);
                if(isCollision){
                    return true;
                }
            }
        }

        return false;
    }

    //获取权重比点注记高的先图元要素
    getAvoidLineFeatures(weight,avoidLineFeatures){
        let alFeatures = [];
        for(let i = 0;i<avoidLineFeatures.length;i++){
            let avoidLineFeature = avoidLineFeatures[i];
            let lineWeight = avoidLineFeature.weight;
            if(lineWeight > weight){
                alFeatures.push(avoidLineFeature);
            }
        }
        return alFeatures;
    }

    // box和line是否相交
    crashBoxLine(box,line,isFour){
        let boxLines = [];
        if(isFour){
            boxLines.push([box[0],box[1],box[2],box[1]]);
            boxLines.push([box[2],box[1],box[2],box[3]]);
            boxLines.push([box[2],box[3],box[0],box[3]]);
            boxLines.push([box[0],box[3],box[0],box[1]]);
        }else{
            boxLines.push([box[0],box[1],box[2],box[3]]);
            boxLines.push([box[2],box[1],box[0],box[3]]);
        }


        for(let i = 0;i<boxLines.length;i++){
            let boxLine = boxLines[i];
            for(let j = 0;j<line.length/2-1;j++){
                let partLine = [line[2*j],line[2*j+1],line[2*(j+1)],line[2*(j+1)+1]];
                if(this.crashPartLinePartLine(boxLine,partLine)){
                    return true;
                }
            }
        }
        return false;
    }

    // 两条线是否相交
    crashLineLine(line1,line2){
        for(let i = 0;i<line1.length/2-1;i++){
            let partLine1 = [line1[2*i],line1[2*i+1],line1[2*(i+1)],line1[2*(i+1)+1]];
            for(let j = 0;j<line2.length/2-1;j++){
                let partLine2 = [line2[2*j],line2[2*j+1],line2[2*(j+1)],line2[2*(j+1)+1]];
                if(this.crashPartLinePartLine(partLine1,partLine2)){
                    return true;
                }
            }
        }
        return false;
    }


    // 两条线是否相交
    crashPartLineLine(partLine,line2){
        for(let j = 0;j<line2.length/2-1;j++){
            let partLine2 = [line2[2*j],line2[2*j+1],line2[2*(j+1)],line2[2*(j+1)+1]];
            if(this.crashPartLinePartLine(partLine,partLine2)){
                return true;
            }
        }
        return false;
    }

    // 两条线段是否相交
    crashPartLinePartLine(line1,line2){
        let p0_x = line1[0];
        let p0_y = line1[1];
        let p1_x = line1[2];
        let p1_y = line1[3];

        let p2_x = line2[0];
        let p2_y = line2[1];
        let p3_x = line2[2];
        let p3_y = line2[3];


        let s02_x, s02_y, s10_x, s10_y, s32_x, s32_y, s_numer, t_numer, denom, t;
        s10_x = p1_x - p0_x;
        s10_y = p1_y - p0_y;
        s32_x = p3_x - p2_x;
        s32_y = p3_y - p2_y;

        denom = s10_x * s32_y - s32_x * s10_y;
        if (denom == 0)//平行或共线
            return 0; // Collinear
        let denomPositive = denom > 0;

        s02_x = p0_x - p2_x;
        s02_y = p0_y - p2_y;
        s_numer = s10_x * s02_y - s10_y * s02_x;
        if ((s_numer < 0) == denomPositive)//参数是大于等于0且小于等于1的，分子分母必须同号且分子小于等于分母
            return 0; // No collision

        t_numer = s32_x * s02_y - s32_y * s02_x;
        if ((t_numer < 0) == denomPositive)
            return 0; // No collision

        if (((s_numer > denom) == denomPositive) || ((t_numer > denom) == denomPositive))
            return 0; // No collision
        return 1;
    }

    //避让
    defaultAvoid(features,hasImportant){
        this.grid = new GGridIndex(8192, 16, 0);
        if(features== null || features.length<1) return [];
        // console.time('计算box');
        // //设置box,如果有线编码或者线箭头，则会新增要素
        features = this.GLabelBox.setBox(features,false);
        // console.timeEnd('计算box');

        // console.time('mergeFeatures');
        features = this.mergeFeatures(features);
        // console.timeEnd('mergeFeatures');
        // console.time('排序');
        //权值排序
        this.sort(features,hasImportant);
        // console.timeEnd('排序');

        // console.time('避让');
        //将注记添加到单元格中，进行避让
        for(let i =0;i<features.length;i++){
            this.avoidFeature(features[i]);
        }
        // console.timeEnd('避让');
        features = this.GLabelBox.filterFeature(features);

        // console.time('去重');
        //注记去重
        this.removeRepeat(features);
        // console.timeEnd('去重');
        features = this.filterFeature(features);
        this.prevFeatures = features;
        return features;
    }

    /**
     * 给要素设置避让的box和注记的绘制坐标
     * @param f
     */
    avoidFeature(f){
        if(f.style.show == false || f.hidden == true){
            f.hidden =true;
            return;
        }
        if(f.boxs){
            if(f.type == 1){
                //点注记跟其它注记避让
                this.avoidPoint(f);
            }else{
                if(f.isCollision){
                    f.hidden = true;
                }else{
                    //线注记跟其它注记进行避让
                    this.avoidLine(f);
                }
            }
        }else{
            f.hidden = true;
        }
    }

    /**
     * 将点注记加入到计算出的多个单元格中
     * @param feature
     */
    avoidPoint(feature){
        //如果为重要的，则不避让
        if(feature.style.isImportant == true){
            let box = feature.boxs[feature.style.direction];
            this.addBoxToCells(feature.primaryId,box);
            return;
        }

        //如果前面有小图标，并且开启了四宫格避让
        if(feature.style.isFourDirections && feature.style.texture){
            this.addFourCollisionFeatureToCells(feature,feature.style.direction);
        }else{
            //如果没有指定的方向
            if(!feature.directions[feature.style.direction]){
                feature.hidden = true;
                return;
            }

            let box = feature.boxs[feature.style.direction];
            let isCollision = this.isCollision(box);
            if(isCollision){
                feature.hidden = true;
                return;
            }else{
                this.addBoxToCells(feature.primaryId,box);
            }
        }
    }


    /**
     * 将线注记加入到计算出的多个单元格中
     * @param feature
     */
    avoidLine(feature){
        //如果为重要的，则不避让
        if(feature.style.isImportant == true){
            for(let i = 0 ;i<feature.boxs.length;i++){
                let box = feature.boxs[i];
                this.addBoxToCells(feature.primaryId+'index_'+i,box);
            }
            return;
        }

        //线注记是否与其它注记相交
        let isCollision = false;
        for(let i = 0 ;i<feature.boxs.length;i++){
            let box = feature.boxs[i];
            if(this.isCollision(box)){
                isCollision = true;
                break;
            }
        }

        if(isCollision){
            feature.hidden = true;
        }else{
            for(let i = 0 ;i<feature.boxs.length;i++){
                let box = feature.boxs[i];
                this.addBoxToCells(feature.primaryId+'index_'+i,box);
            }
        }
    }

    /**
     * 将点注记添加到单元格中
     * @param feature 点注记
     * @param index 点注记四宫格的index
     */
    addFourCollisionFeatureToCells(feature,index){
        let isCollision = true;
        let box = [];
        //如果有指定的方向
        if(feature.directions[index]){
            box = feature.boxs[index];
            isCollision = this.isCollision(box);
        }

        // 如果相交,进行四宫格避让
        if(isCollision){
            index ++;
            if(index == 4){
                index = index - 4;
            }

            //四个方向全部避让完成，仍然相交
            if(index == feature.style.direction){
                feature.hidden = true;
                return;
            }else{
                //换个点注记方向的box，再进行递归避让检测
                this.addFourCollisionFeatureToCells(feature,index);
            }
        }else{
            feature.style.textPoint =feature.fourPoints[index];
            this.addBoxToCells(feature.primaryId,box);
        }
    }

    /**
     *  返回注记的box是否与其它注记相交
     * @param row
     * @param col
     * @param feature
     */
    isCollision(box){
        let x1 = box[0];
        let y1 = box[1];

        let x2 = box[2];
        let y2 = box[3];
        let result = this.grid.query(x1,y1,x2,y2);
        return result.length>0;
    }

    /**
     *  注记box所占的单元格标识为true
     */
    addBoxToCells(key,box){
        let x1 = box[0];
        let y1 = box[1];
        let x2 = box[2];
        let y2 = box[3];
        this.grid.insert(key,x1,y1,x2,y2);
    }

    //attributeId当相同时，点注记的四个方向合并。线注记有一个是和图元压盖时，其它的线注记也不显示
    mergeFeatures(features){
        let map = {};
        for(let i = 0;i<features.length;i++){
            let feature = features[i];
            if(!map[feature.attributeId]){
                map[feature.attributeId] = [];
            }
            map[feature.attributeId].push(feature);
        }

        for(let key in map) {
            let array = map[key];
            if (array.length > 1) {
                let fristFeature = array[0];
                //点注记，合并四宫格方向
                if (fristFeature.type == '1') {
                    let directions = array[0].directions;
                    for (let j = 1; j < array.length; j++) {
                        directions = this.getBothDirection(directions, array[j].directions)
                    }

                    let isEmpty = false;
                    for(let dKey in directions){
                        isEmpty = true;
                        break;
                    }


                    for (let k = 0; k < array.length; k++) {
                        if(isEmpty){
                            array[0].hidden = true;
                        }else{
                            array[0].directions = directions;
                        }
                    }
                }

                //是线注记,如果一条线压盖，其它的线也不显示
                if (fristFeature.type == '2') {
                    let isCollision = false;
                    for (let n = 0; n < array.length; n++) {
                        if (array[n].isCollision == true) {
                            isCollision = true;
                            break;
                        }
                    }

                    if (isCollision) {
                        for (let m = 0; m < array.length; m++) {
                            array[m].hidden = true
                        }
                    }
                }
            }
        }

        //去掉隐藏的注记
        return this.GLabelBox.filterFeature(features);
    }

    //要素排序.
    sort(features,hasImportant){
        if(features.length > 0) {
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

                let aAttr = a.weight;
                let bAttr = b.weight;

                let aId = a.primaryId;
                let bId = b.primaryId;

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
                    }
                    else{
                        return -1;
                    }
                } else {
                    return -1;
                }
            }.bind(this));
        }
    }

    //合并两个点注记的方向
    getBothDirection(directions1,directions2){
        let directions = {};
        for(let key in directions1){
            if(directions2[key]){
                directions[key] = 1;
            }
        }
        return directions;
    }


    //去掉重复的注记
    removeRepeat(features){
        let pointsFs = [];
        let lineTextFs = [];
        let lineCodeFs = [];

        let drawedPointFs = [];
        let drawedLineTextFs = [];
        let drawedLineCodeFs = [];
        for(let i = 0;i<features.length;i++){
            let f = features[i];
            if(f.type == 1){
                if(f.drawed == true){
                    drawedPointFs.push(f);
                }else{
                    pointsFs.push(f);
                }

            }else if(f.type == 2){
                if(f.lineType == 'text'){
                    if(f.drawed == true){
                        drawedLineTextFs.push(f);
                    }else{
                        lineTextFs.push(f);
                    }
                }
                if(f.lineType == 'code'){
                    if(f.drawed == true){
                        drawedLineCodeFs.push(f);
                    }else{
                        lineCodeFs.push(f);
                    }
                }
            }
        }


        for(let j = 0;j<pointsFs.length;j++){
            let pf = pointsFs[j];
            this.getShowPointFeatrues(drawedPointFs,pf);
        }

        for(let k = 0;k<lineTextFs.length;k++){
            let ltf = lineTextFs[k];
            this.getShowLineTextFeatrues(drawedLineTextFs,ltf);
        }


        for(let n = 0;n<lineCodeFs.length;n++){
            let lcf = lineCodeFs[n];
            this.getShowLineCodeFeatrues(drawedLineCodeFs,lcf);
        }

        //清除上一屏的注记的绘制状态
        if(this.prevFeatures){
            for(let m = 0;m<this.prevFeatures.length;m++){
                let pf = this.prevFeatures[m];
                pf.drawed = false;
            }
        }
    }

    getShowPointFeatrues(features,feature){
        let hidden =  false;
        for(let i = 0;i<features.length;i++){
            let f = features[i];
            if(f.label == feature.label && f.style.distance && feature.style.distance){
                //求两个点注记之间的距离
                let distance = this.getDistance(f.style.textPoint,feature.style.textPoint);
                if(distance<f.style.distance){
                    hidden = true;
                    feature.hidden = true;
                }
            }
        }

        if(!hidden){
            features.push(feature);
        }
    }

    getShowLineTextFeatrues(features,feature){
        let hidden =  false;
        for(let i = 0;i<features.length;i++){
            let f = features[i];
            if(f.label == feature.label && f.style.lineTextDistance && feature.style.lineTextDistance){
                //求两个点注记之间的距离
                let distance = this.getDistance(f.centerPoint,feature.centerPoint);
                if(distance<f.style.lineTextDistance){
                    hidden = true;
                    feature.hidden = true;
                }
            }
        }

        if(!hidden){
            features.push(feature);
        }
    }

    getShowLineCodeFeatrues(features,feature){
        let hidden =  false;
        for(let i = 0;i<features.length;i++){
            let f = features[i];
            if(f.label == feature.label && f.style.lineCodeDistance && feature.style.lineCodeDistance){
                //求两个点注记之间的距离
                let distance = this.getDistance(f.centerPoint,feature.centerPoint);
                if(distance<f.style.lineCodeDistance){
                    hidden = true;
                    feature.hidden = true;
                }
            }
        }

        if(!hidden){
            features.push(feature);
        }
    }

    /**
     * 求两点之间的距离
     */
    getDistance(p1,p2){
        let calX = p2[0] - p1[0];
        let calY = p2[1] - p1[1];
        return Math.pow((calX *calX + calY * calY), 0.5);
    }

    // 获取过滤后的要素.
    filterFeature(features){
        let returnFeatures = [];
        //剔除需避让的要素
        for(let i= 0 ;i<features.length;i++){
            if(!features[i].hidden ) {
                features[i].drawed = true;
                returnFeatures.push(features[i]);
            }
        }
        return returnFeatures;
    }
}
module.exports = GAnnoAvoid;