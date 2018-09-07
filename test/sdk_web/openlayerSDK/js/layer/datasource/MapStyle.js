/**
 * Created by kongjian on 2017/6/30.
 */
Custom.MapStyle = function() {
    //继承DataSource
    Custom.DataSource.apply(this);

    //数据源类型
    this.type = 'MapStyle';
    //样式文件的请求接口url
    this.styleUrl = null;
    //样式文件Id
    this.styleId = 'style';
    //过滤条件
    this.filter = null;
    //纹理
    this.textures = {};
    // 不带过滤条件的url
    var sourceUrl = null;

    /**
     * 加载样式文件和纹理数据
     */
    this.loadStyle = function(){
        var def0 = $.Deferred();
        var def1 = $.Deferred();

        //请求样式文件
        $.ajax({url:this.styleUrl + '/'+this.styleId+'/layer/style.js',dataType:'text',success:function(result){
            this.styleFun = new Function("drawer","level", result);
            def0.resolve();
        }.bind(this)});

        //请求图标纹理
        $.ajax({url:this.styleUrl + '/'+this.styleId+'/label/texture.js',dataType:'text',success:function(result){
            var textures = JSON.parse(result);
            var totalCount = 0;
            for(var i in textures){
                totalCount++;
            }

            if(totalCount == 0){
                def1.resolve();
                return;
            }

            var count = 0;
            for(var key in textures){
                var img = new Image();
                img.name = key;
                 img.onload = function(data) {
                    count++;
                    var name = data.target.name;
                    this.textures[name] =data.target;
                    if(count == totalCount){
                        def1.resolve();
                    }
                }.bind(this);
                img.src = textures[key];
            }
        }.bind(this)});

        return [def0,def1];
    }

    /**
     * 设置过滤条件
     */
    this.setFilter = function(filter){
        if(!this.url ||  !filter || (filter.layers.length == 0 && filter.order.length == 0)){
            return;
        }

        if(!sourceUrl){
            sourceUrl = this.url;
        }

        var filterStr = '&control=';
        for(var i = 0;i<filter.layers.length;i++){
            var filterLayer = filter.layers[i];
            if(!filterLayer.id){
                filter.layers.splice(i,1);
            }
        }

        var json = JSON.stringify(filter);
        filterStr = filterStr+json;
        this.url = sourceUrl + filterStr;
    }

    this.getTexture = function(key) {
        return this.textures[key];
    }
    this.addTexture = function(key,texture) {
        this.textures[key] = texture;
    }
    this.getPattern = function(key,ratio){
        if(ratio == null){
            ratio = 1;
        }
        if(ratio == 1){
            return this.getTexture(key);
        }
        if(image){
            return image;
        }

        var width = this.getTexture(key).width;
        var height = this.getTexture(key).height;
        var canvas = document.createElement("canvas");
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = width * ratio + "px";
        canvas.style.height = height * ratio + "px";
        var ctx = canvas.getContext('2d');
        ctx.drawImage(this.getTexture(key),0,0,width,height,0,0,width * ratio,height * ratio);
        var image = new Image();
        image.src = canvas.toDataURL("image/png");
        return image;
    }
};