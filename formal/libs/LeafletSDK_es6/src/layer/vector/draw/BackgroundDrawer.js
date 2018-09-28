/**
 * Created by kongjian on 2017/6/26.
 */

class BackgroundDrawer{
    constructor(config) {
        this.ratio = config.ratio;
        this.datasArr = [];

        this.ctx = config.ctx;
        this.extent = config.extent;
        this.control = config.control;
        this.styleFn = null;
        this.drawable = false;
    }

    getName(){
        return this.name;
    }

    /**
     * 加入样式队列
     * @param fn
     */
    setStyle(fn){
        this.styleFn = fn;
    }


    draw(){
        this.drawable = true;
        this.doDraw();
    }

    /**
     * 绘制
     */
    doDraw(layerFilter) {
        if(this.drawable) {
            // console.log(this.control.controlObj)
            if(this.control != null) {
                if(this.control.controlObj != null) {
                    if (this.control.controlObj.otherDisplay == false) {

                        return;
                    }
                }
            }

            let style = null;
            style = this.styleFn.call({}, this.level);
            if(style.backgroundColor == "undefined"){
                return;
            }
            if(style.backgroundColor) {
                this.ctx.fillStyle = style.backgroundColor;
            }
            if(style.fillOpacity) {
                this.ctx.globalAlpha = style.fillOpacity/100;
            }else{
                this.ctx.globalAlpha = 1;
            }

            this.ctx.fillRect(0, 0, 512 * this.ratio, 512 * this.ratio);

        }
    }
}
module.exports = BackgroundDrawer;