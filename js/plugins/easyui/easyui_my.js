define([cdnDomain+'/js/plugins/easyui/easyui-lang-zh_CN.js'],function(require){
    var theme = 'default';
   /* window.include([
        cdnDomain+'/js/plugins/easyui/themes/default/easyui.css',
        cdnDomain+'/js/plugins/easyui/themes/icon.css',
        cdnDomain+'/js/plugins/easyui/themes/easyui_my.css'
    ]);*/
    Mom.include('easyui_css',cdnDomain+'/js/plugins/easyui/themes/',[
        theme+'/easyui.css',
        'icon.css',
        'easyui_my.css'
    ]);
    $.parser.parse();
	/*
    $(window).resize(function(){
        $('.easyui-treegrid .autoSize').datagrid('resize', {
            width:function(){return document.body.clientWidth;},
            height:function(){return document.body.clientHeight;}
        });
    });
	*/

    //扩展datagrid:动态添加删除editor
    $.extend(jQuery.fn.datagrid.methods, {
        addEditor : function(jq, param) {
            if (param instanceof Array) {
                $.each(param, function(index, item) {
                    var e = $(jq).datagrid('getColumnOption', item.field);
                    e.editor = item.editor;
                });
            } else {
                var e = $(jq).datagrid('getColumnOption', param.field);
                e.editor = param.editor;
            }
        },
        removeEditor : function(jq, param) {
            if (param instanceof Array) {
                $.each(param, function(index, item) {
                    var e = $(jq).datagrid('getColumnOption', item);
                    e.editor = {};
                });
            } else {
                var e = $(jq).datagrid('getColumnOption', param);
                e.editor = {};
            }
        }
    });
    $.extend($.fn.datagrid.defaults.editors, {
        checkbox: {//调用名称
            init: function (container, options) {//container 用于装载编辑器 options,提供编辑器初始参数
                var inputStr = '';
                if(options){
                    for(var o in options){
                        if(typeof(o) == 'object'){
                        }

                    }
                    $(options).each(function(i,o){
                        inputStr += "<label><input type='checkbox' name='"+(o.name||'')+"' value='"+(o.value||'')+"'/>"+o.text+"</label>";
                    });
                }
                //这里我把一个 checkbox类型的输入控件添加到容器container中
                // 需要渲染成easyu提供的控件，需要时用传入options,我这里如果需要一个combobox，就可以 这样调用 input.combobox(options);
                return $(inputStr).appendTo(container);
            },
            getValue: function (target) {
                //datagrid 结束编辑模式，通过该方法返回编辑最终值
                //这里如果用户勾选中checkbox返回1否则返回0
                return $(target).prop("checked") ? 1 : 0;
            },
            setValue: function (target, value) {
                //datagrid 进入编辑器模式，通过该方法为编辑赋值
                //我传入value 为0或者1，若用户传入1则勾选编辑器
                if (value)
                    $(target).prop("checked", "checked")
            },
            resize: function (target, width) {
                //列宽改变后调整编辑器宽度
                var input = $(target);
                if ($.boxModel == true) {
                    input.width(width - (input.outerWidth() - input.width()));
                } else {
                    input.width(width);
                }
            }
        }
    });


    /**
     * Created by mac on 18/3/28.
     */
    var dataGridObj = {
        td0EditIndex:undefined,
        td1EditIndex:undefined,
        td2EditIndex:undefined,
        td3EditIndex:undefined,
        td4EditIndex:undefined,
        saveItemArr:[],
        saveAllItemArr:[],
        arrIndex:-1,
        getEditIndex:function (id) {  //获取到td#EditIndex的值
            id = id.substr(1);
            return eval("this."+id+"EditIndex");
        },
        setEditIndex:function(id, val){  ////设置td#EditIndex的值
            id = id.substr(1);
            eval("this."+id+"EditIndex="+val);
        },
        startEditing:function(index,id){  //开始编辑
            if (dataGridObj.getEditIndex(id) != index) {
                if (dataGridObj.endEditing(id)) {
                    $(id).datagrid('selectRow', index)
                        .datagrid('beginEdit', index);
                    dataGridObj.setEditIndex(id,index);
                } else {
                    $(id).datagrid('selectRow', dataGridObj.editIndex);
                }
            }
        },
        endEditing:function(gridTableId){  //结束编辑
            var editIndex = dataGridObj.getEditIndex(gridTableId);
            if ( editIndex == undefined) { return true }
            if ($(gridTableId).datagrid('validateRow', editIndex)) {
                $(gridTableId).datagrid('endEdit', editIndex);
                dataGridObj.setEditIndex(gridTableId,undefined);
                return true;
            } else {
                return false;
            }
        },
        pushRowData:function(rowData){ //编辑过的元素如果不存在就push到数组中，如果已存在新的数据会替换原有的数据
            if(dataGridObj.saveItemArr.length>0){
                dataGridObj.filterItem(dataGridObj.saveItemArr,rowData);
                if(dataGridObj.arrIndex == -1){
                    dataGridObj.saveItemArr.push(rowData);
                }else{
                    dataGridObj.saveItemArr.splice(dataGridObj.arrIndex,1,rowData);
                }
            }else{
                dataGridObj.saveItemArr.push(rowData);
            }
        },
        filterItem:function (arr,item) { //判断元素是否存在于数组中
            for( var i=0;i<arr.length;i++){
                var filterEle = arr[i].id==""?"itemCode":"id";
                if( (arr[i][filterEle])===(item[filterEle])){
                    dataGridObj.arrIndex = i;
                    return ;
                }else{
                    dataGridObj.arrIndex = -1;
                }
            }
        },
        mergeCells:function(data,id,field){  //合并单元格功能
            var mark=1;
            for (var i=1; i <data.rows.length; i++) {
                if (data.rows[i][field] == data.rows[i-1][field]) {
                    mark += 1;
                    $(id).datagrid('mergeCells',{
                        index: i+1-mark,
                        field: field,
                        rowspan:mark
                    });
                }else{
                    mark=1;
                }
            }
        },
        getAllData:function(ids){ //获取当前页的所有行 参数：dataGrid表格id的集合
            dataGridObj.getAllTablesSave();
            var idLen = ids?ids.length:$(".tableItem").length;
            if(idLen>0){
                dataGridObj.saveAllItemArr =[];
                for(var i= 0;i<idLen;i++){
                    var id = ids?ids[i]:".tableItem";
                    var rows = $(id).datagrid("getRows");
                    dataGridObj.saveAllItemArr = dataGridObj.saveAllItemArr.concat(rows);

                }
            }
            return dataGridObj.saveAllItemArr;
        },
        getSaveItemArr:function(){  //获取修改过的数据的集合
            dataGridObj.getAllTablesSave();
            return dataGridObj.saveItemArr;
        },
        getAllTablesSave:function(){ //触发当前页面中的所有dataGrid table中的保存按钮，默认dataGrid保存时只保存编辑过且失去焦点的元素的数值。

            var len = $(".tableItemBox").length;
            for(var i = 0; i<len;i++){
                //触发每个table隐藏的保存按钮，从而获取到表格中最后一条被修改的数据并将其放入到saveItemArr中。
                $("#td"+i).parents('.datagrid-view').siblings(".datagrid-toolbar").find(".icon-save").trigger('click');
            }

        },
        checkDatagridNotNull:function(dgName, dgId, checkRowArr, checkFieldArr){ //校验datagrid中指定的列是否为空 dgName指dataGrid的描述  dgId指dataGrid  checkColArr指要检查的列名称
            var rows = $(dgId).datagrid('getRows');
            for(var i=0; checkRowArr&&i<rows.length; i++){
                if(checkRowArr.contains(i)){
                    $(dgId).datagrid('endEdit', i);
                    var row = rows[i];
                    for(var j=0; checkFieldArr&&j<checkFieldArr.length; j++){
                        var fieldName = checkFieldArr[j];
                        var fieldTitle = $(dgId).datagrid('getColumnOption',fieldName).title;
                        var colVal = $.trim(row[fieldName]);
                        if(!colVal){
                            var rowName = row.pName?row.pName:row.itemName?row.itemName:'';
                            // layerAlert(dgName+' 第'+(i+1)+'行:'+fieldTitle+' 的值不能为空!');
                            Mom.layAlert('"'+dgName+'":"'+rowName+'--'+fieldTitle+'" 的值不能为空!');
                            return false;
                        }
                    }
                }
            }
            return true;
        },
        eachCheckDataGrid:function(checkDGArr){   //对要进行核对操作的dataGrid进行遍历
            var checkFlag='';
            for(var i=0; i<checkDGArr.length; i++){
                var item = checkDGArr[i];

                if(!item.dgId){
                    return false;
                }else{
                    checkFlag = dataGridObj.checkDatagridNotNull(item.dgName, item.dgId, item.checkRowArr, item.checkFieldArr);
                }
                //var checkFlag = dataGridObj.checkDatagridNotNull(item.dgName, item.dgId, item.checkRowArr, item.checkFieldArr);
                if(checkFlag == false){
                    return false;
                }
            }
        },
        dataGridResize:function(resizeDiv){  //浏览器窗口改变时dataGrid数据宽度重置
            $(window).resize(function(){
                $(resizeDiv).datagrid('resize');

            });
        },
        // dataGridOptions：容器的id,titleName:标题名称，columns:容器columns的配置，mergeCellArr：要合并的单元格Field名称
        dataGridOptions:function(tableId, titleName, columns,mergeCellArr){  //动态配置dataGrid的参数配置
            var mergeCellArr = mergeCellArr || [];  //例如mergeCellGroupObj={flag:true,groupNameArr:['groupName']};
            var that_ = this;
            return {
                fitColumns: true,
                rownumbers: false,
                collapsible: true,
                singleSelect: true,
                selectOnCheck:false,  // 可以选取多行  为true时只能选取一行
                checkOnSelect:false,  // 选中当前行时当前行的复选框状态不被选中 为true时反之。

                title: titleName,
                onClickRow: function (index) {
                    that_.dg_startEditing(index, tableId)
                },
                columns: columns||[[]],
                onAfterEdit: function (rowIndex, rowData) {
                    that_.dg_pushRowData(rowData);
                    that_.dg_setEditIndex(tableId, undefined);
                    that_.dg_forMergeCells(tableId,mergeCellArr);
                },
                //合并单元格
                onLoadSuccess: function (data) {
                    loadedData = data;
                    $(tableId).datagrid('resize');
                    that_.dg_forMergeCells(tableId,mergeCellArr);
                },
                toolbar: [{
                    text: '存1', iconCls: 'icon-save', handler: function () {
                        //保存时结束当前编辑的行，自动触发onAfterEdit事件如果要与后台交互可将数据通过Ajax提交后台
                        $(tableId).datagrid('endEdit', dataGridObj.getEditIndex(tableId));
                    }
                }]
            }
        },
        forMergeCells:function(tableId,mergeCellArr){//循环要合并的多组单元格项
            var len = mergeCellArr.length;
            if(len>0){
                for(var i =0;i<len;i++){
                    dataGridObj.mergeCells(loadedData, tableId, mergeCellArr[i]);
                }

            }
        },


    };
    // treegrid公共方法
    var treeGridObj = {
        //展开节点之前
        onBeforeExpand:function(row){
        },
            //移除节点和它的子节点。
        removeTreegridNode:function(tableId,id){
            //tableId 为table的id
            // id 为要删除的节点id
            $(tableId).treegrid('remove', id);
        },
        //添加节点
        appendTreegridNode:function(tableId,parentId,dataArr){
            //tableId 为table的id
            //判断是否是数组
            if(Object.prototype.toString.call(dataArr) != '[object Array]'){
                dataArr =[dataArr];
            }
            $(tableId).treegrid('append',{
                parent: parentId,  //父id,如果为空，则添加到根节点
                data: dataArr  //data为数组对象,字段对应filed字段，格式[{},...] 可以添加多个 每个对象里面的id必传
            });
            if(parentId){
                $(tableId).treegrid("refresh", parentId);
                $(tableId).treegrid("expand", parentId);
            }


        },

        //更新状态(如果没有子节点则显示file图标，并且去掉展开和折叠的小三角图标)
        updateNodeState: function(row, children){
            if(!row)return;
            if(!children || children.length==0){
                $("tr[node-id='"+row.id+"']").find('.tree-expanded').removeClass('tree-expanded').addClass('tree-indent');
                $("tr[node-id='"+row.id+"']").find('.tree-folder').removeClass('tree-folder').removeClass('tree-folder-open').addClass('tree-file');
                row.state='open';
            }
        },
        //修改节点
        editTreegridNode:function(tableId,id,data){
            delete data['children'];
            //tableId 为table的id
            $(tableId).treegrid('update',{
                id: id, //表示要被更新的节点的 id
                row: data //新的行数据对象，格式为 {},
            });
            $(tableId).treegrid("refresh", id);
        },
       treeGridResize:function(resizeDiv){  //浏览器窗口改变时treeGrid数据宽度重置
            $(window).resize(function(){
                $(resizeDiv).datagrid('resize');
            });
        },
    };


    return {
        //dataGrid方法
        dg_getEditIndex : dataGridObj.getEditIndex,
        dg_setEditIndex: dataGridObj.setEditIndex,
        dg_startEditing: dataGridObj.startEditing,
        dg_endEditing: dataGridObj.endEditing,
        dg_pushRowData: dataGridObj.pushRowData,
        dg_filterItem: dataGridObj.filterItem,
        dg_mergeCells: dataGridObj.mergeCells,
        dg_getAllData: dataGridObj.getAllData,
        dg_getSaveItemArr: dataGridObj.getSaveItemArr,
        dg_getAllTablesSave: dataGridObj.getAllTablesSave,
        dg_checkDatagridNotNull: dataGridObj.checkDatagridNotNull,
        dg_eachCheckDataGrid: dataGridObj.eachCheckDataGrid,
        dg_dataGridResize: dataGridObj.dataGridResize,
        dg_dataGridOptions: dataGridObj.dataGridOptions,
        dg_forMergeCells: dataGridObj.forMergeCells,

        //treeGrid方法
        tg_removeTreegridNode : treeGridObj.removeTreegridNode,
        tg_appendTreegridNode : treeGridObj.appendTreegridNode,
        tg_editTreegridNode : treeGridObj.editTreegridNode,
        tg_updateNodeState : treeGridObj.updateNodeState,
        tg_treeGridResize :treeGridObj.treeGridResize

    }


});

/**
 * 通用格式化显示
 * @param value
 * @param row
 */
//是、否
window.yesNoFmt = function(value,rowData,rowIndex){
    return value=='1'?'是':'否';
};
