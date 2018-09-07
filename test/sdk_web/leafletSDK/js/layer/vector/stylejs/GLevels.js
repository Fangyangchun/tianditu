Custom.GLevels = function(startLevel,endLevel){
    this.levelsData = [];
    this.levelsKey = startLevel+'-'+endLevel;
    /**
     * 添加组
     * Parameters : gGroup  GGroup对象实例
     */
    this.addGroup = function(gGroup){
        this.levelsData.push(gGroup.group);
    }

    /**
     * 添加组
     * Parameters : gGroup  GGroup对象实例
     */
    this.addStyleItem = function(gStyleItem){
        this.levelsData.push(gStyleItem.style);
    }
}