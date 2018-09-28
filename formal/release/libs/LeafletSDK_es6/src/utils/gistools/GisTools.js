/**
 * Created by matt on 2017/7/16.
 */
//几个像素可以算是命中
let _dis =  3;

class GisTools{
    static pointDistToLine(x, y, startx, starty, endx, endy) {
        let se =  (startx - endx) * (startx - endx) + (starty - endy) * (starty - endy);
        let p = ((x - startx) * (endx - startx) + (y - starty) * (endy - starty));
        let r = p / se;
        let outx = startx + r * (endx - startx);
        let outy = starty + r * (endy - starty);
        let des = Math.sqrt((x - outx) * (x - outx) + (y - outy) * (y - outy));

        //console.log(des);
        return des;
    }
    static isPointOnSegment(px,py,p1x,p1y,p2x,p2y) {

        if ((px - _dis > p1x && px + _dis > p2x) || (px + _dis < p1x && px - _dis < p2x)) {
            return 0;
        }
        if ((py - _dis > p1y && py + _dis > p2y) || (py + _dis < p1y && py - _dis < p2y)) {
            return 0;
        }
        let d = GisTools.pointDistToLine(px,py,p1x,p1y,p2x,p2y);
        if(d < _dis){
            return 1;
        }else{
            return 0;
        }
    }
    static pointInLine(px,py, polyline) {
        let flag = 0;
        let line = [];
        if(Array.isArray(polyline[0])) {
            line = polyline;
        }else{
            line.push(polyline);
        }
        for(var polyIndex = 0 ; polyIndex < line.length ; polyIndex++){
            let subpoly = line[polyIndex];
            let length = subpoly.length / 2;
           // for (var i = 0, l = length, j = l - 1; i < l; j = i, i++) {

            for (var i = 0; i < length - 1 ; i++) {
                let j;
                j = i + 1;
                let sx = subpoly[2 * i],
                    sy = subpoly[2 * i + 1],
                    tx = subpoly[2 * j],
                    ty = subpoly[2 * j + 1]
                if(GisTools.isPointOnSegment(px,py,sx,sy,tx,ty) == 1){
                    return 1;
                }else{

                }
            }
        }
        return 0;
    }
    static pointInPolygon(px,py, polygen) {
        let flag = 0;
        let poly = [];
        if(Array.isArray(polygen[0])) {
            poly = polygen;
        }else{
            poly.push(polygen);
        }

        for(var polyIndex = 0 ; polyIndex < poly.length ; polyIndex++){
            let subpoly = poly[polyIndex];
            let length = subpoly.length / 2;


            for (var i = 0, l = length, j = l - 1; i < l; j = i, i++) {
                let sx = subpoly[2 * i],
                    sy = subpoly[2 * i + 1],
                    tx = subpoly[2 * j],
                    ty = subpoly[2 * j + 1]

                // 点与多边形顶点重合
                if ((sx === px && sy === py) || (tx === px && ty === py)) {
                    return 1
                }

                // 判断线段两端点是否在射线两侧
                if ((sy < py && ty >= py) || (sy >= py && ty < py)) {
                    // 线段上与射线 Y 坐标相同的点的 X 坐标
                    let x = sx + (py - sy) * (tx - sx) / (ty - sy)

                    // 点在多边形的边上
                    if (x === px) {
                        return 1
                    }
                    if (x > px) {
                        flag = !flag
                    }
                }
            }
        }
        return flag ? 1 : 0;

    }

    static lineIntersects(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
        var denominator,
            a,
            b,
            numerator1,
            numerator2,
            onLine1= false,
            onLine2= false,
            res = [null, null];

        denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
        if (denominator === 0) {
            if(res[0] !== null && res[1] !== null) {
                return res;
            } else {
                return false;
            }
        }
        a = line1StartY - line2StartY;
        b = line1StartX - line2StartX;
        numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
        numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
        a = numerator1 / denominator;
        b = numerator2 / denominator;

        // if we cast these lines infinitely in both directions, they intersect here:
        res[0] = line1StartX + (a * (line1EndX - line1StartX));
        res[1] = line1StartY + (a * (line1EndY - line1StartY));


        // if line2 is a segment and line1 is infinite, they intersect if:
        if (b > 0 && b < 1) {
            return res;
        }
        else {
            return false;
        }
    }

    /**
     * 判断两个poly的关系
     * @param polyOut
     * @param polyIn
     * @returns {1,相交，2包涵，3，没关系}
     */
    static polyWith(polyOut, polyIn) {
        let lengthOut = polyOut.length / 2;
        let lengthIn = polyIn.length / 2;
        let flag = false;
        let bY;
        let aX;
        let aY;
        let bX;
        let dY;
        let cX;
        let cY;
        let dX;
        for (let i = 0; i < lengthOut; i++) {

            if (i != lengthOut - 1) {
                aX = polyOut[(i * 2)];
                aY = polyOut[(i * 2 + 1)];
                bX = polyOut[(i * 2 + 2)];
                bY = polyOut[(i * 2 + 3)];
            } else {
                aX = polyOut[(i * 2)];
                aY = polyOut[(i * 2 + 1)];
                bX = polyOut[0];
                bY = polyOut[1];
            }
            for (let j = 0; j < lengthIn; j++) {

                if (j != lengthIn - 1) {
                    cX = polyIn[(j * 2)];
                    cY = polyIn[(j * 2 + 1)];
                    dX = polyIn[(j * 2 + 2)];
                    dY = polyIn[(j * 2 + 3)];
                } else {
                    cX = polyIn[(j * 2)];
                    cY = polyIn[(j * 2 + 1)];
                    dX = polyIn[0];
                    dY = polyIn[1];
                }

                if (GisTools.lineIntersects(aX, aY, bX, bY, cX, cY, dX, dY) != false) {
                    return 1;
                }
            }
        }

        let firstX = polyIn[0];
        let firstY = polyIn[1];
        if (GisTools.pointInPolygon(firstX, firstY,  polyOut )) {
            return 2;
        }
        return 3;
    }

    /**
     * 把bbox转成double Array
     * @param left
     * @param bottom
     * @param right
     * @param top
     * @returns {Array}
     */
    static boxToPolyArr(left, bottom, right, top){
        let arr = [];
        arr.push(left);
        arr.push(bottom);

        arr.push(left);
        arr.push(top);

        arr.push(right);
        arr.push(top);

        arr.push(right);
        arr.push(bottom);

        arr.push(left);
        arr.push(bottom);

        return arr;
    }

    static getExtensionPoint(p1,p2,d){
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
module.exports = exports = GisTools;



