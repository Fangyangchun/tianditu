/**
 * Created by kongjian on 2017/6/30.
 */
Custom.LocalDataSource = function() {
    //继承DataSource
    Custom.DataSource.apply(this);
    //数据源类型
    this.type = 'LocalDataSource';
    //本地要素集合
    this.features = [];
    //图标url Map：{name:1.png,value:'http://localhost:8080/mapserver/1.png'}
    this.textureUrls = {};

    /**
     * 添加feature
     * Parameters :
     * feature
     */
    this.addFeature = function(feature){
        this.features.push(feature);
    };

    /**
     * 添加url图标
     * Parameters :
     * name 图标名称,如：1.png
     * url 图标的请求地址
     */
    this.addTextureUrl = function(name,url){
        this.textureUrls[name] = url;
    };

    /**
     * 移除url图标
     * Parameters :
     * name 图标名称,如：1.png
     */
    this.removeTextureUrl = function(name){
       delete this.textureUrls[name];
    };

    /**
     * 加载纹理
     */
    this.loadTexture = function(){
        var def = new Deferred();
        var totalCount = 0;
        for(var i in this.textureUrls){
            totalCount++;
        }

        if(totalCount == 0){
            def.resolve();
            return;
        }

        var count = 0;
        for(var key in this.textureUrls){
            var img = new Image();
            img.name = key;
            img.onload = function(data) {
                count++;
                var name = data.target.name;
                this.textures[name] =data.target;
                if(count == totalCount){
                    def.resolve();
                }
            }.bind(this);
            img.src = this.textureUrls[key];
        }
        return def;
    };

    /**
     * 通过featureId移除feature
     * Parameters :
     * featureId
     */
    this.removeFeatureById = function(featureId){
        for(var i = 0;i<this.features.length;i++){
            var feature = this.features[i];
            if(feature.id == featureId){
                this.features.splice(i,1);
            }
        }
    }

};