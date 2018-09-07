/**
 * Created by kongjian on 2017/6/27.
 */
Custom.Feature = function(){
    this.id = Math.round(Math.random()*256*256*256);
    //要素类型，1代表点，2代表线
    this.type = 1;
    //数据一维数组，里面依次存放x,y地理坐标
    this.sourceData =[];
    //根据sourceAngleData转换为屏幕坐标的集合
    this.datas = [];
    //由原始sourceData切断过，带角度的数据
    this.sourceAngleData = [];
    this.attributes ={};
    //单个注记的样式
    this.style ={};

    /**
     * 添加属性字段
     * Parameters :
     * key
     * value
     */
    this.addAttribute = function(key,value){
        this.attributes[key] = value;
    };

    /**
     * 根据字段名删除属性
     * Parameters :
     * key
     * value
     */
    this.removeAttributeByKey = function(key){
       delete this.attributes[key];
    };

    /**
     * 计算feature的最大外接矩形
     */
    this.getMaxExtent = function(){
        if(this.sourceData.length == 0 ){
            return null;
        }
        var minX = this.sourceData[0];
        var maxX = this.sourceData[0];
        var minY = this.sourceData[1];
        var maxY = this.sourceData[1];
        for(var i = 2;i< this.sourceData.length;i++){
            var tempX = this.sourceData[i];
            var tempY = this.sourceData[i+1];
            if(tempX>maxX)   // 判断最大值
                maxX=tempX;
            if(tempX<minX)   // 判断最小值
                minX=tempX;

            if(tempY>maxY)   // 判断最大值
                maxY=tempY;
            if(tempY<minY)   // 判断最小值
                minY=tempY;
            i++;
        }
        return [minX,minY,maxX,maxY];
    };

    /**
     * 判断feature是否在当前视口中
     * Parameters :
     * srceenBounds - 当前视口的外接矩形
     */
    this.inBounds = function (srceenBounds){
        var featureBounds = this.getMaxExtent();
        if(!featureBounds){
            return false;
        }

        return featureBounds[0] <= srceenBounds[2] &&
            featureBounds[2]  >= srceenBounds[0] &&
            featureBounds[1]  <= srceenBounds[3] &&
            featureBounds[3]  >= srceenBounds[1] ;
    };


    /**
     * 将要素的地理坐标转换为当前的屏幕坐标
     * Parameters:
     * srceenBounds - 当前视口的外接矩形
     * res - 当前地图的分辨率
     */
    this.transformData = function(srceenBounds,res){
        this.datas = [];
        if(this.sourceData.length == 0){
            return;
        }
        //取出当前视口左上角的地理坐标
        var left = srceenBounds[0];
        var top = srceenBounds[3];

        // for(var i = 0;i< this.sourceData.length;i++){
        //     var sx = this.sourceData[i];
        //     var sy = this.sourceData[i+1];
        //     this.datas.push((sx - left)/res);
        //     this.datas.push((top - sy)/res);
        //     i++;
        // }

        var rPoints = [];
        for(var i = 0;i<this.sourceAngleData.length;i++){
            var point = this.sourceAngleData[i][0];
            var gx = (point[0] - left)/res;
            var gy = (top - point[1])/res;
            var p = [gx,gy];
            rPoints.push([p,this.sourceAngleData[i][1]]);
        }
        this.datas = rPoints;
    };


    /**
     * 获取要素要显示的文字内容
     */
    this.getFeatureLabel = function(){
        var labelField = this.style['labelfield'];
        if(labelField){
            if(this.attributes[labelField]){
                return this.attributes[labelField]+'';
            }
        }
        return null;
    }
}