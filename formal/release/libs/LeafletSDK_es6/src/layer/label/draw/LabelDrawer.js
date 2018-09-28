/**
 * Created by kongjian on 2017/5/1.
 */
class LabelDrawer{
    constructor(layerDataMap,level,features) {
        this.layerDataMap = layerDataMap;
        this.level = level;
        this.features = features;
    }

    getLayer(layername){
        this.labelDatas = [];

        let data = this.layerDataMap[layername];
        if(data == null || data.features == null){
            return this;
        }

        for(let j=0;j<data.features.length;j++){
            let labelData = data.features[j];
            labelData.layerName = layername;
            labelData.xyz = data.xyz;
            labelData.type = data.type;
            if(!labelData.fieldValueMap){
                labelData.fieldValueMap = this.getFieldValueMap(data,labelData);
            }
            this.labelDatas.push(labelData);
        }
        return this;
    }

    getGroupLayer(layername,value){
        this.labelDatas = [];

        let valueArr = value.split(',');
        let length = valueArr.length;
        if(length == 0){
            return this;
        }

        let data = this.layerDataMap[layername];
        if(data == null || data.features == null){
            return this;
        }

        for(let j = 0 ; j < length ; j ++){
            let dataArr = data.features[valueArr[j]];
            if(dataArr == null){
                continue;
            }

            let labelData = data.features[i];
            labelData.layerName = layername;
            labelData.xyz = data.xyz;
            labelData.type = data.type;
            if(!labelData.fieldValueMap){
                labelData.fieldValueMap = this.getFieldValueMap(data,labelData);
            }
            this.labelDatas.push(labelData);
        }
        return this;
    }

    setStyle(fn){
        for(let i=0;i<this.labelDatas.length;i++){
            let labelData = this.labelDatas[i];
            let get = function(key){
                return labelData.fieldValueMap[key];
            };
            let style = fn.call({},this.level,get);
            if(style && style.show == true){
                labelData.style = style;
                labelData.fieldValueMap['avoidWeight']=style.avoidWeight;
                this.features.push(labelData);
            }
        }
    }

    getFieldValueMap(data,labelData){
        let  fieldValueMap=  {};
        for(let i = 0;i<data.fieldsConfig.length;i++){
            let fieldName = data.fieldsConfig[i]['name'];
            let index = data.fieldsConfig[i]['index'];
            let id = data.fieldsConfig[i]['id'];
            if(id == true){
                //图层名和数据的主键构成唯一id
                fieldValueMap['attributeId'] =labelData.layerName+labelData[1][index];
            }
            fieldValueMap[fieldName] = labelData[1][index];
        }
        return fieldValueMap;
    }

    draw(){

    }
}

module.exports = LabelDrawer;

