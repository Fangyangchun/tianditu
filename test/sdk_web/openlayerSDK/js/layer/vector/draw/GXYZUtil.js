/**
 * Created by kongjian on 2017/6/26.
 */
Custom.GXYZUtil =function() {
    tileSize:256,
    /**
     * 设置过滤条件
     */
    this.setFilter = function(filter,callback){
        for(var i = 0;i<filter.layers.length;i++){
            var filterLayer = filter.layers[i];
            if(!filterLayer.id){
                filter.layers.splice(i,1);
            }
        }

        var control = JSON.stringify(filter);
        if(this.isIE()){
            //设置过滤条件
            Custom.getJSON({type:'post',url:this.host + '/mapserver/vmap/'+this.servername+'/setControl',
                data:'control= '+ control,
                dataType:'json'}).then(function(result){
                    result.isIE = true;
                    callback(result);
                }.bind(this));
        }else{
            var result = {isIE:false,id:control};
            callback(result);
        }
    };


    /**
     * 解析url
     */
    this.parseUrl = function(url){
        var urlParts = url.split('?');
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
     * 拾取要素
     * Parameters :
     * row - 要拾取的要素所在的行
     * col - 要拾取的要素所在的列
     * level - 要拾取的要素所在的层级
     * x - 要拾取的要素所在瓦片内的x坐标
     * y - 要拾取的要素所在瓦片内y坐标
     * control - 过滤的json对象
     * controlId - 过滤对象在服务器上存的key
     * callback - 拾取到要素后的回调函数
     */
    this.pickupFeatures = function(row,col,level,x,y,control,controlId,callback) {
        var url = this.host + '/mapserver/pickup/'+this.servername+'/getData?x='+col +'&y='+row+'&l='+level+
            '&pixelX='+x+'&pixelY='+y+'&styleId='+this.styleId+'&tilesize='+this.tileSize+'&clientVersion='+Custom.Version;
        if(control){
            url = url + '&control='+control;
        }
        if(controlId){
            url = url + '&controlId='+controlId;
        }

        Custom.getJSON({
            url:url,
            dataType: "json"}).then(function (features) {
                callback(features);
            },function(){
                callback([]);
            })
    };

    /**
     * 构造高亮的filter
     * Parameters :
     * features - 要素数组
     * style - 高亮样式 如：{color:"red",opacity:0.8};
     */
    this.CreateHighlightFilter = function(layerFeatures,style){
        var filter = new Custom.Filter();
        filter.otherDisplay = false;

        for(var layerId in layerFeatures){
            var fs = layerFeatures[layerId];
            var hasFid = false;
            for(var fid in fs){
                var filterLayer = new Custom.FilterLayer();
                filterLayer.id = layerId;
                filterLayer.idFilter = fid;
                filterLayer.color = style;
                filter.addFilterLayer(filterLayer);
                hasFid = true;
            }
            if(!hasFid){
                var filterLayer = new Custom.FilterLayer();
                filterLayer.id = layerId;
                filterLayer.color = style;
                filter.addFilterLayer(filterLayer);
            }
        }
        return filter;
    };

    /**
     * 构造高亮的filter,每个要素都有高亮样式
     * Parameters :
     * layerFeatures - 要素数组
     */
    this.CreateEveryHighlightFilter = function(layerFeatures){
        var filter = new Custom.Filter();
        filter.otherDisplay = false;

        for(var layerId in layerFeatures){
            var fs = layerFeatures[layerId];
            var layerStyle = fs.style;
            var hasFid = false;
            for(var fid in fs){
                var style = fs[fid].style;
                style.color = style.color.replace('#','%23');
                var filterLayer = new Custom.FilterLayer();
                filterLayer.id = layerId;
                filterLayer.idFilter = fid;
                filterLayer.color = style;
                filter.addFilterLayer(filterLayer);
                hasFid = true;
            }
            if(!hasFid && layerStyle){
                layerStyle.color = layerStyle.color.replace('#','%23');
                var filterLayer = new Custom.FilterLayer();
                filterLayer.id = layerId;
                filterLayer.color = layerStyle;
                filter.addFilterLayer(filterLayer);
            }
        }
        return filter;
    };

    /**
     * 是否为ie浏览器
     */
    this.isIE = function () {
        if (!!window.ActiveXObject || "ActiveXObject" in window)
            return true;
        else
            return false;
    };
}