/**
 * Created by kongjian on 2017/6/26.
 */
function DataHolder(config) {
    AbstractDataHolder.apply(this,[config,Drawer]);

    this.getBackground = function(){
        var backgroundDrawer = new BackgroundDrawer({
            extent:this.extent,
            ctx:this.ctx,
            control:this.control,
            ratio:this.ratio
        })
        return backgroundDrawer;
    };

    this.getWatermark = function(){

    }
}