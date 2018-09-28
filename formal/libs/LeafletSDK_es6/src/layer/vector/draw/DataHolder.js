/**
 * Created by kongjian on 2017/6/26.
 */
class DataHolder extends AbstractDataHolder{
    constructor(config) {
        super(config,Drawer);
    }

    getBackground(){
        let backgroundDrawer = new BackgroundDrawer({
            extent:this.extent,
            ctx:this.ctx,
            control:this.control,
            ratio:this.ratio
        })
        return backgroundDrawer;
    };

    getWatermark(){

    }

}
module.exports = DataHolder;