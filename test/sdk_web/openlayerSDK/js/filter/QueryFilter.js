
function QueryFilter(queryfilters,idFilter) {

    this.filterCells = [];
    if(idFilter){
        this.idFilter = idFilter.split(',');
    }

    if(typeof queryfilters == "object") {

        for (var key in queryfilters) {

            var filterCell = this._buildFilter(key, queryfilters[key]);
            this.filterCells.push(filterCell);
        }
    }


    this.setPropertyGetter = function(propertyGetter){
        this.propertyGetter = propertyGetter;
    }

    this.filter = function(data){

        var save = true;
        if(this.idFilter != null){

            var id =  this.propertyGetter.getId(data);
            if(this.idFilter.indexOf(id.toString()) == -1){
                return false;
            }

        }
        for(var index in this.filterCells){
            save = this.filterCells[index].filter.call(this,data);
            if(!save){
                return save;
            }
        }
        return save;

    }
    this._buildFilter = function(queryfilter,value) {
        var filterCell = {};
        var info = queryfilter.split('_');
        filterCell['field'] = info[1];
        filterCell['type'] = info[2];
        filterCell['operation'] = info[3];
        filterCell.filter = function (data) {

            if(filterCell.type == 'D'){
                value = new Date(value).getTime();
            }
            var compareValue =  this.propertyGetter.get(data,filterCell.field);
            if (compareValue == null) {
                return null;
            }

            switch (filterCell.operation.toUpperCase()) {
                case 'LT':
                    compareValue = this._convertType(filterCell.type,compareValue);
                    value = this._convertType(filterCell.type,value);
                    return (compareValue < value);
                case 'NE':
                    compareValue = this._convertType(filterCell.type,compareValue);
                    value = this._convertType(filterCell.type,value);
                    return (compareValue != value);
                case 'GT':
                    compareValue = this._convertType(filterCell.type,compareValue);
                    value = this._convertType(filterCell.type,value);
                    return (compareValue > value);
                case 'LE':
                    compareValue = this._convertType(filterCell.type,compareValue);
                    value = this._convertType(filterCell.type,value);
                    return (compareValue <= value);

                case 'GE':
                    compareValue = this._convertType(filterCell.type,compareValue);
                    value = this._convertType(filterCell.type,value);
                    return (compareValue >= value);
                case 'NULL':
                    return (compareValue == null);
                case 'NOTNULL':
                    return (compareValue != null);
                case 'LK':
                    compareValue = this._convertType(filterCell.type,compareValue);
                    value = this._convertType(filterCell.type,value);
                    return (compareValue.indexOf(value) != -1);
                case 'LFK':
                    compareValue = this._convertType(filterCell.type,compareValue);
                    value = this._convertType(filterCell.type,value);
                    return (compareValue.startsWith(value));
                case 'RHK':
                    compareValue = this._convertType(filterCell.type,compareValue);
                    value = this._convertType(filterCell.type,value);
                    return (compareValue.endsWith(value));
                case 'IN':
                    compareValue = this._convertType("S",compareValue);
                    var values = value.split(',');
                    return (values.indexOf(compareValue) != -1);
                case 'EQ':
                    compareValue = this._convertType(filterCell.type,compareValue);
                    value = this._convertType(filterCell.type,value);
                    if(value == compareValue){
                        return true;
                    }else{
                        return false;
                    }

            }

        }
        return filterCell;
    }
    this._convertType = function(type,value){
        switch (type) {
            case 'S':
                value = this._dealWithString(value);
                break;
            case 'N':
                value = this._dealWithNumber(value);
                break;
            case 'L':
                value = this._dealWithNumber(value);
                break;
            case 'FT':
                value = this._dealWithDateFloat(value);
                break;
            case 'D':
                value = this._dealWithDate(value);
                break;
        }
        return value;
    }


    this._dealWithString  = function(value){
        return value.toString();
    }
    this._dealWithNumber = function(value){
        return parseInt(value);
    }
    this._dealWithDate = function(value){

        //应该写成与1970年的差别
        return value
      //  return value.toString();
    }
    this._dealWithDateFloat = function(value){
        return parseFloat(value);
    }





}


