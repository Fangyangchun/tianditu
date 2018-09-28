/**
 * Created by kongjian on 2017/6/26.
 */
const GXYZUtil = require('./GXYZUtil');
const {Deferred,getJSON} = require('./../../../utils/es6-promise');
class GVMapGridUtil extends GXYZUtil{
    constructor(isDynamicMap) {
        super();
        //纹理
        this.textures = {};

        this.isDynamicMap = isDynamicMap;

        this.styleObj = {};
    }

    /**
     * 设置样式文件
     */
    setStyle(styleObj){
        this.styleObj = styleObj;
        // this.styleFun = new Function("drawer","level", styleStr);
        // if(this.styleDef){
        //     this.styleDef.resolve();
        // }
    }

    formatStyle(styleObj,successFun){
        this.styleObj = styleObj;
        var styleJson = JSON.stringify(this.styleObj);
        getJSON({type:'post',url:this.host + '/mapserver/styleInfo/format.do',
            data:'styleJson= '+ styleJson,
            dataType:'json'}).then(function(result){
            this.styleFun = new Function("drawer","level", result.styleJs);
            successFun();
        }.bind(this));
    }

    /**
     * 加载样式文件和纹理数据
     */
    loadStyle(styleType){
        var def1 = new Deferred();
        var def2 = new Deferred();


        if(!styleType){
            styleType = 'label';
        }

        if(this.isDynamicMap){
            var styleJson = JSON.stringify(this.styleObj);
            getJSON({type:'post',url:'http://127.0.0.1/mapserver/styleInfo/format.do',
                data:'styleJson= '+ styleJson,
                dataType:'json'}).then(function(result){
                this.styleFun = new Function("drawer","level", result.styleJs);
                def1.resolve();
            }.bind(this));

        }else{
            //请求样式文件
            getJSON({url:this.host + '/mapserver/styleInfo/'+this.servername+'/'+this.styleId+'/'+styleType+'/style.js',dataType:'text'})
                .then(function(result) {
                    this.styleFun = new Function("drawer","level", result);
                    def1.resolve();
                }.bind(this));
        }


        //请求图标纹理
        getJSON({url:this.host+ '/mapserver/styleInfo/'+this.servername+'/'+this.styleId+'/label/texture.js',dataType:'text'}).then(function(result){
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

        return [def1,def2];
    }

}

module.exports = GVMapGridUtil;