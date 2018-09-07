/**
 * Created by kongjian on 2017/5/1.
 */
function LabelDrawer(layerDataMapArr,level,features){
    this.layerDataMapArr = layerDataMapArr;
    this.level = level;
    this.features = features;
    this.getLayer = function(layername){
        this.labelDatas = [];

        for(var i = 0;i<this.layerDataMapArr.length;i++){
            var data = this.layerDataMapArr[i][layername];
            if(data == null){
                continue;
            }else{
                if(data.features == null){
                    continue;
                }

                for(var j=0;j<data.features.length;j++){
                    var labelData = data.features[j];
                    labelData.layerName = layername;
                    labelData.xyz = data.xyz;
                    labelData.type = data.type;
					if(!labelData.fieldValueMap){
                    		labelData.fieldValueMap = this.getFieldValueMap(data,labelData);
					}
                    this.labelDatas.push(labelData);
                }
            }
        }
        return this;
    };

    this.getGroupLayer = function(layername,value){
        this.labelDatas = [];

        var valueArr = value.split(',');
        var length = valueArr.length;
        if(length == 0){
            return this;
        }

        for(var i = 0;i<this.layerDataMapArr.length;i++){
            var data = this.layerDataMapArr[i][layername];
            if(data == null || data.features == null){
                continue;
            }

            for(var j = 0 ; j < length ; j ++){
                var dataArr = data.features[valueArr[j]];
                if(dataArr == null){
                    continue;
                }

                var labelData = data.features[i];
                labelData.layerName = layername;
                labelData.xyz = data.xyz;
                labelData.type = data.type;
                if(!labelData.fieldValueMap){
                	labelData.fieldValueMap = this.getFieldValueMap(data,labelData);
				}
                this.labelDatas.push(labelData);
            }
        }
        return this;
    }

    this.setStyle=function(fn){
        for(var i=0;i<this.labelDatas.length;i++){
            var labelData = this.labelDatas[i];
            var get = function(key){
                return labelData.fieldValueMap[key];
            };
            var style = fn.call({},this.level,get);
            if(style && style.show == true){
                labelData.style = style;
				labelData.fieldValueMap['avoidWeight']=style.avoidWeight;
                this.features.push(labelData);
            }
        }
    }

    this.getFieldValueMap = function(data,labelData){
        var  fieldValueMap=  {};
        for(var i = 0;i<data.fieldsConfig.length;i++){
            var fieldName = data.fieldsConfig[i]['name'];
            var index = data.fieldsConfig[i]['index'];
            var id = data.fieldsConfig[i]['id'];
            if(id == true){
                //图层名和数据的主键构成唯一id
                fieldValueMap['primaryId'] =labelData.layerName+labelData[1][index];
            }
            fieldValueMap[fieldName] = labelData[1][index];
        }
        return fieldValueMap;
    }

    this.draw = function (){

    }

}