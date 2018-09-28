class Util{
    static getRealLength(str) {
        var length = str.length;
        var realLength = 0
        for (var i = 0; i < length; i++) {
            let charCode = str.charCodeAt(i);
            if (charCode >= 0 && charCode <= 128) {
                realLength += 0.5;
            } else {
                realLength += 1;
            }
        }
        return realLength;
    }

    /**
     * 判断文本是否不为空
     *  Parameters :
     *  label - 要显示的文本
     *
     */
    static isNotNull(label){
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
    }

    /**
     * 统一转为微软雅黑
     */
    static formatFont(font,ratio,isChangeFont){
        var fontArr = font;
        if(isChangeFont){
            var farr = font.split(' ');
            farr[farr.length -1] = 'SimHei';
            fontArr =farr.join(' ');
        }

        return fontArr.replace(
            /(\d+\.?\d*)(px|em|rem|pt)/g,
            function(w, m, u) {
                if(m < 12){
                    m = 12 * ratio;
                }else{
                    m = Math.round(m) * ratio;
                }
                return m + u;
            }
        );
    };

    /**
     * 对注记进行去空格等处理
     */
    static formatLabel(label){
        if(label && label.length >0){
            //去掉不可见字符
            label =  label.replace( /([\x00-\x1f\x7f])/g,'');
            label = label.replace(/(\s*$)/g,"");
            label = label.replace(/<br\/>/g, "");
        }
        return label;
    }

    //获取两点连线与y轴的夹角
    static getAngle( p1,p2){
        if(p2[0]-p1[0] == 0){
            if(p2[1]>p1[0]){
                return 90;
            }else{
                return -90;
            }
        }
        let k = (p2[1]-p1[1])/(p2[0]-p1[0]);
        let angle = 360*Math.atan(k)/(2*Math.PI);
        return angle;
    }
}
module.exports = Util;



