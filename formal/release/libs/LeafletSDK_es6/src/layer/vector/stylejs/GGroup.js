class GGroup{
    constructor(groupName) {
        this.group = {};
        this.group.id = groupName;
        this.group.type = 'group';
        this.group.children = [];
    }

    /**
     * 添加样式
     * Parameters : gStyleItem  GStyleItem对象实例
     */
    addStyle(gStyleItem){
        this.group.children.push(gStyleItem.style);
    }
}

module.exports = GGroup;