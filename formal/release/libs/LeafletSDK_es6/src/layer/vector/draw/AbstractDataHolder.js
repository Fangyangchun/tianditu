/**
 * Created by kongjian on 2017/6/26.
 */
class AbstractDataHolder{
    constructor(config,drawerCalss) {
        this.layerDataMap = config.layerDataMap;
        this.extent = config.extent;
        this.ctx = config.ctx;
        this.ratio = config.ratio;
        this.control = config.control;
        this.drawerCalss = drawerCalss;
        this.config = config;
        this.textures = config.textures;
    }

    _emptyDrawer(styleLayerID){
        let drawer = new this.drawerCalss(null);
        return drawer;
    }

    getLayer(dataLayerID,styleLayerID){
        if(styleLayerID == null){
            styleLayerID = dataLayerID;
        }

        if(null == this.layerDataMap){
            return this._emptyDrawer(styleLayerID);
        }


        //判断其他图层是否显示Control otherDisplay,如果是其他图层不显示，则需要在这里处理
        if(this.control != null) {
            //      console.log(this.control.controlObj.otherDisplay);
            if (this.control.controlObj.otherDisplay == false) {
                if (this.control.controlObj.controlLayersArr.indexOf(styleLayerID) == -1) {
                    return this._emptyDrawer(styleLayerID);
                }
            }
        }


        let data = this.layerDataMap[dataLayerID];

        if(data == null){
            return this._emptyDrawer(styleLayerID);
        }else{
            //修正一个十分傻逼的错误,好吧，我英语不好
            if(data.datas){
                data.features = data.datas;
            }
            // delete data.datas;

            if(data.features == null){
                return this._emptyDrawer(styleLayerID);
            }
            let propertyGetter = null;
            if(null !== data.fieldsConfig){
                propertyGetter = new PropertyGetter(data.fieldsConfig);
            }

            this.config['dataLayerID'] = dataLayerID;
            this.config['styleLayerID'] = styleLayerID;
            this.config['propertyGetter'] = propertyGetter;
            this.config['control'] = this.control;
            this.config['textures'] = this.textures;


            let drawer = new this.drawerCalss(this.config);



            if(!Array.isArray(data.features)){
                for(let index in data.features){
                    let feature = data.features[index];
                    feature.type = data.type;
                    drawer.addFeatures(feature);
                }
            }else {
                let feature = data.features;
                feature.type = data.type;
                drawer.addFeatures(feature);
            }
            return drawer;
        }
    }

    getGroupLayer(dataLayerID,value,styleLayerID){

        if(this.layerDataMap == null){
            return this._emptyDrawer(styleLayerID);
        }
        if(styleLayerID == null){
            styleLayerID = dataLayerID;
        }
        //判断其他图层是否显示Control otherDisplay,如果是其他图层不显示，则需要在这里处理
        if(this.control != null) {
            //      console.log(this.control.controlObj.otherDisplay);
            if (this.control.controlObj.otherDisplay == false) {
                if (this.control.controlObj.controlLayersArr.indexOf(styleLayerID) == -1) {
                    return this._emptyDrawer(styleLayerID);
                }
            }
        }

        let data = this.layerDataMap[dataLayerID];
        if(this.layerDataMap == null){
            return this._emptyDrawer(styleLayerID);
        }
        if(data == null){
            return this._emptyDrawer(styleLayerID);
        }
        if(data.datas == null && data.data == null ){
            return this._emptyDrawer(styleLayerID);
        }

        let valueArr = value.split(',');
        let length = valueArr.length;
        if(length == 0){
            return this._emptyDrawer(styleLayerID);
        }
        let propertyGetter = null;
        if(data.fieldsConfig != null){
            propertyGetter = new PropertyGetter(data.fieldsConfig);
        }
        this.config['dataLayerID'] = dataLayerID;
        this.config['styleLayerID'] = styleLayerID;
        this.config['propertyGetter'] = propertyGetter;
        this.config['control'] = this.control;
        this.config['textures'] = this.textures;

        let drawer = new this.drawerCalss(this.config);

        if(data.data == null){
            data.features = data.datas;
        }else{
            data.features = data.data;
        }
        for(let i = 0 ; i < length ; i ++){
            let dataArr = data.features[valueArr[i]]
            if(dataArr == null){
                continue;
            }
            dataArr.type = data.type;
            drawer.addFeatures(dataArr);
        }
        return drawer;
    }

}

module.exports = AbstractDataHolder;