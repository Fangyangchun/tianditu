Custom.GGroup = function(groupName){
    this.group = {};
    this.group.id = groupName;
    this.group.type = 'group';
    this.group.children = [];

    /**
     * 添加样式
     * Parameters : gStyleItem  GStyleItem对象实例
     */
    this.addStyle = function(gStyleItem){
        this.group.children.push(gStyleItem.style);
    }
}