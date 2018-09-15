/**
 * Created by kongjian on 2017/6/30.
 */
Custom.URLDataSource = function() {
    //继承DataSource
    Custom.DataSource.apply(this);
    //多个服务器url的域名，用于解决一个域名只有6条请求管线的限制
    this.urlArray=[];
    //数据源类型
    this.type = 'URLDataSource';
    //注记数据的请求url
    this.url = null;
    //样式文件的请求接口url
    this.styleUrl = null;
    //样式文件Id
    this.styleId = 'style';
    //过滤条件
    this.filter = null;
    //纹理
    this.textures = {};
    //过滤条件字符
    this.control = null;
    //过滤的id
    this.controlId = null;
    // 不带过滤条件的url
    var sourceUrl = null;
    //域名
    this.host = '';
    //服务名
    this.servername = '';

    /**
     * 加载样式文件和纹理数据
     */
    this.loadStyle = function(styleType){
        var def0 = new Deferred();
        var def1 = new Deferred();
        var def2 = new Deferred();

        //解析url，获取servername,styleId
        this.parseUrl();

        if(!sourceUrl){
            sourceUrl = this.url +'&clientVersion='+Custom.Version;
            this.url = this.url +'&clientVersion='+Custom.Version;
        }

        if(this.control && this.isIE()){
            //设置过滤条件
            Custom.getJSON({type:'post',url:this.host + '/mapserver/vmap/'+this.servername+'/setControl',
                data:'control='+this.control,
                dataType:'json'})
                .then(function(result) {
                    this.controlId = result.id;
                    this.url = sourceUrl + '&controlId='+result.id;
                    def0.resolve();
                }.bind(this));
        }else{
            if(this.control){
                this.url = sourceUrl + '&control='+this.control;
            }else{
                this.url = sourceUrl;
            }
            def0.resolve();
        }

        if(!styleType){
            styleType = 'label';
        }

        //请求样式文件
        Custom.getJSON({url:this.host + '/mapserver/styleInfo/'+this.servername+'/'+this.styleId+'/'+styleType+'/style.js',dataType:'text'})
            .then(function(result) {
                this.styleFun = new Function("drawer","level", result);
                def1.resolve();
        }.bind(this));

        //请求图标纹理
        Custom.getJSON({url:this.host+ '/mapserver/styleInfo/'+this.servername+'/'+this.styleId+'/label/texture.js',dataType:'text'}).then(function(result){
            var textures = JSON.parse(result);
            var totalCount = 0;
            for(var i in textures){
                totalCount++;
            }

            if(totalCount == 0){
                def2.resolve();
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
                        def2.resolve();
                    }
                }.bind(this);
                img.src = textures[key];
            }
        }.bind(this));

       return [def0,def1,def2];
    }

    /**
     * 解析url
     */
    this.parseUrl = function(){
        var urlParts = this.url.split('?');
        var urlPartOne = urlParts[0].split('/mapserver/');
        this.host = urlPartOne[0];
        this.servername = urlPartOne[1].split('/')[1];
        var params = urlParts[1].split('&');
        for(var i = 0;i<params.length;i++){
            var param = params[i];
            var keyValue = param.split('=');
            if(keyValue[0] == 'styleId'){
                this.styleId = keyValue[1];
                return;
            }
        }
    };


    /**
     * 设置过滤条件
     */
    this.setFilter = function(filter){
        this.control = null;
        if(!this.url ||  !filter || (filter.layers.length == 0 && filter.order.length == 0)){
            return;
        }

        for(var i = 0;i<filter.layers.length;i++){
            var filterLayer = filter.layers[i];
            if(!filterLayer.id){
                filter.layers.splice(i,1);
            }
        }

        this.control = JSON.stringify(filter);
    }

    this.getTexture = function(key) {
        return this.textures[key];
    }
    this.addTexture = function(key,texture) {
        this.textures[key] = texture;
    }


    /**
     * 是否为ie浏览器
     */
    this.isIE = function () {
        if (!!window.ActiveXObject || "ActiveXObject" in window)
            return true;
        else
            return false;
    };
};