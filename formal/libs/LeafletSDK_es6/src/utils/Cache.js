/**
 * Created by kongjian on 2018/6/12.
 * 注记瓦片队列缓存工具类
 */
class Cache{
    constructor(size) {
        this.size = size;
        this.map = {};
        this.list = [];
    }

    //往缓存中加入数据
    push(key,item){
        if(this.list.length>this.size-1){
            var removeKey = this.list.shift();
            delete this.map[removeKey];
        }
        this.list.push(key);
        this.map[key] = item;
    }

    //获取缓存数据
    getItem(key){
        return this.map[key];
    }

    //清空缓存
    clean(){
        this.map = {};
        this.list = [];
    }

    //获取缓存的长度
    length(){
        return this.list.length;
    }
}

module.exports = Cache;
