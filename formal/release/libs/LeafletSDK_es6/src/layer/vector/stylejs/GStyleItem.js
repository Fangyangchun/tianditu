class GStyleItem{
    constructor(styleId,layerId) {
        this.style = {};
        this.style.id = styleId;
        this.style.layer = layerId;
        this.style.type = 'style';
        this.style.children = [];
    }

    /**
     * 设置sql查询条件
     * Parameters : sqlFilter  示例： fcode  = "2602000500" or fcode  = "2507000500"
     *  fileds 示例： {"gid":{"name":"gid","type":"String"}}
     */
    queryFilter(sqlFilter,fileds){
        if(sqlFilter){
            this.style.query = sqlFilter;
            this.style.fields = fileds;
        }else{
            this.style.query = '';
        }
    }

    /**
     * 设置样式
     * Parameters : styleArr  示例：[{
	 *			"text": "省界",
	 *			"name": "省界",
	 *			"filter": "fcode  = \"6302011314\"",
	 *			"query": "Q_fcode_S_EQ=6302011314",
	 *			"isleaf": true,
	 *			"type": "style",
	 *			"iconCls": "icon-line",
	 *			"id": "11_境界线_省界",
	 *			"style": [{
	 *				"stroke": false,
	 *				"strokeWidth": 0,
	 *				"strokeColor": "#ED22AB",
	 *				"strokeOpacity": 1,
	 *				"dash": null,
	 *				"lineCap": "butt",
	 *				"lineJoin": "miter",
	 * 				"sparsity": 1
	 *			}]
     */
    setStyle(styleArr){
        this.style.style=styleArr;
    }

    /**
     * 添加子样式
     * Parameters : gStyleItem  GStyleItem对象实例
     */
    addSubStyle(gStyleItem){
        this.style.children.push(gStyleItem.style);
    }
}
module.exports = GStyleItem;