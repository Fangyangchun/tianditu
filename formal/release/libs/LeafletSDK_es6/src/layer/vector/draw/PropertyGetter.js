/**
 * Created by kongjian on 2017/6/26.
 */
class PropertyGetter{
    constructor(propertyConfig) {
        this.propertyConfig = {};

        for(var i = 0 ;i < propertyConfig.length; i ++){
            if(propertyConfig[i].id == 'true' || propertyConfig[i].id == true){

                this.idIndex = propertyConfig[i].index;
            }
            this.propertyConfig[propertyConfig[i].name] = parseInt(propertyConfig[i].index);
        }
    }

    get(data, propertyName){

        var value = data[this.propertyConfig[propertyName]];
        return value;
    };

    getId(data){
        return data[this.idIndex];
    }
}

module.exports = PropertyGetter;

