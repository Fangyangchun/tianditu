/**
 * Created by kongjian on 2017/6/26.
 */
   function AbstractVTileProcess(config) {
    if(config){
        //放数据的容器
        this.featuresArr = [];
        //属性构造器
        this.propertyGetter = config.propertyGetter;
        //网格
        this.extent = config.extent;
        /**
         * 缩放比例
         * @type {*|number}
         */
        this.ratio = config.ratio;
        this.resize = false;
        if(this.ratio != 1){
            this.resize = true;
        }

        /**
         * 等级
         */
        this.level = this.extent.level;
        /**
         * 数据层级ID
         */
        this.dataLayerID = config.dataLayerID;
        /**
         * 样式层级ID
         */
        this.styleLayerID = config.styleLayerID;
        /**
         * 过滤器
         * @type {*|null}
         */
        this.control = config.control;
    }


    /**
     * 加入处理数据
     * @param features
     */
    this.addFeatures = function(features){
        this.featuresArr.push(features);
    }

    /**
     * 加入处理样式
     * @param fn
     */
    this.setStyle = function(fn){
        this.styleOperator = fn;
    }


    /**
     *处理
     */
    this.process = function(){
        var queryFilter = null;


        if (this.featuresArr == null) {
            return;
        }
        var length = this.featuresArr.length;
        if (length == 0) {
            return;
        }
        for (var i = 0; i < length; i++) {
            var features = this.featuresArr[i];
            this._processFeatures(features);
        }


    }



    this._processFeature = function(gjson){
        throw "抽象方法"
    }

    this._processFeatures = function(features) {
        for (var i = 0; i < features.length; i++) {
            var gjson = features[i];
            this._processFeature(gjson);
        }
        return;
    }

    this._getProperty = function(data){
        return data[1];
    }

    this._getPoints = function(data){
        return data[2];
    }
    this._getType = function(data){
        return data[0];
    }
    this._filterByStyle = function(gjson) {
        var type = this._getType(gjson);
        var points = this._getPoints(gjson);
        var property = this._getProperty(gjson);
        if(points == null){
            throw "绘制失败,数据中缺少Geometry";
        }
        if(type == null){
            type = "POLYGON";
        }
        var controlRes = null;
        if(this.styleOperator == null){
            return null;
        }else {
            this.propertyGetter;
            var id = this.propertyGetter.getId(property);
            var _propertyGetter = this.propertyGetter;
            var get = function(fieldName){
                return _propertyGetter.get(property,fieldName);
            }
            if(this.control) {
                if(typeof this.control.controlFn == "function") {
                    controlRes = this.control.controlFn.call({}, id, get, this.styleLayerID);
                    if (controlRes == false || controlRes == null) {
                        return {
                            display:false
                        };
                    }
                }
            }
            var style = this.styleOperator.call({},this.level,get);
            //   } catch (e) {
            //        throw e;
            //    }
        }
        if(style == null){
            return null;
        }
        if(style.display != null){
            if (style.display == false) {
                return {
                    display:false
                };
            }
        }
        if(controlRes != null) {
            style.customeColor = controlRes;
        }
        return style;
    }

}