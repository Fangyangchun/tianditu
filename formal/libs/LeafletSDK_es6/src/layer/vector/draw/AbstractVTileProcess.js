/**
 * Created by kongjian on 2017/6/26.
 */
class AbstractVTileProcess{
    constructor(config) {
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
    }


    /**
     * 加入处理数据
     * @param features
     */
    addFeatures(features){
        this.featuresArr.push(features);
    }

    /**
     * 加入处理样式
     * @param fn
     */
    setStyle(fn){
        this.styleOperator = fn;
    }


    /**
     *处理
     */
    process(){
        let queryFilter = null;


        if (this.featuresArr == null) {
            return;
        }
        let length = this.featuresArr.length;
        if (length == 0) {
            return;
        }
        for (let i = 0; i < length; i++) {
            let features = this.featuresArr[i];
            this._processFeatures(features);
        }


    }



    _processFeature(gjson){
        throw "抽象方法"
    }

    _processFeatures(features) {
        for (let i = 0; i < features.length; i++) {
            let gjson = features[i];
            this._processFeature(gjson);
        }
        return;
    }

    _getProperty(data){
        return data[1];
    }

    _getPoints(data){
        return data[2];
    }
    _getType(data){
        return data[0];
    }
    _filterByStyle(gjson) {
        let type = this._getType(gjson);
        let points = this._getPoints(gjson);
        let property = this._getProperty(gjson);
        if(points == null){
            throw "绘制失败,数据中缺少Geometry";
        }
        if(type == null){
            type = "POLYGON";
        }
        let controlRes = null;
        if(this.styleOperator == null){
            return null;
        }else {
            this.propertyGetter;
            let id = this.propertyGetter.getId(property);
            let _propertyGetter = this.propertyGetter;
            let get = function(fieldName){
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
            let style = this.styleOperator.call({},this.level,get);
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
module.exports = AbstractVTileProcess;