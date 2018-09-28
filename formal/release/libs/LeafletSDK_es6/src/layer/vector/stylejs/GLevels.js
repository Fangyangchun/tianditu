
class GLevels{
    constructor(startLevel,endLevel) {
        this.levelsData = [];
        this.levelsKey = startLevel+'-'+endLevel;
    }

    /**
     * 添加组
     * Parameters : gGroup  GGroup对象实例
     */
    addGroup(gGroup){
        this.levelsData.push(gGroup.group);
    }

    /**
     * 添加组
     * Parameters : gGroup  GGroup对象实例
     */
    addStyleItem (gStyleItem){
        this.levelsData.push(gStyleItem.style);
    }
}

module.exports = GLevels;
