define([cdnDomain+'/js/plugins/jqGrid/js/grid.locale-cn.js'], function (require) {
    /*window.include([
        cdnDomain + '/js/plugins/jqGrid/css/themes/start/jquery-ui-1.8.20.custom.css',
        cdnDomain + '/js/plugins/jqGrid/css/ui.jqgrid.css',
        cdnDomain + '/js/plugins/jqGrid/css/jqGrid_my.css',
    ]);*/
    Mom.include('jqGrid_css', cdnDomain + '/js/plugins/jqGrid/css/', [
        'themes/start/jquery-ui-1.8.20.custom.css',
        'ui.jqgrid.css',
        'jqGrid_my.css'
    ]);



    /**
     * 加载设置基础配置
     * options ：对象格式 可不传 不传就是只有基础配置，没有特殊操作
     **/
    var settingConfig = function (tableId, options) {
        return $.extend(true,{},{
                cellEdit: false,
                caption: "",               //表格名称
                datatype: "local",
                mtype: "GET",
                height: '100%',         //高度
                width: '100%',
                autowidth: true,    //表格宽度自适应
                forceFit: true,    //当为ture时，调整列宽度不会改变表格的宽度。当shrinkToFit 为false时，此属性会被忽略
                shrinkToFit: true,  //如果为ture，则按比例初始化列宽度(不会显示滚动条)。如果为false，则列宽度使用colModel指定的宽度
                scroll: false,
                autoScroll: true,   //水平滚动
                // cellsubmit: 'clientArray', //表格递交位置
                // editurl: 'clientArray',    //编辑保存地址
                // cellEdit: true,            //编辑单个元格
                viewrecords: true,        //定义是否要显示总记录数
                rownumbers: false,//显示行号
                multiselect: false,//显示多选
                grouping: false,
                rowNum: -1, //后台返回所有记录
                subGridOptions:{
                plusicon: "ui-icon-plus",
                minusicon: "ui-icon-minus",
                openicon: "ui-icon-carat-1-sw",
                expandOnLoad: false,    //当子表格数据加载完毕后不自动展开
                selectOnExpand: false, //点击展开图标不选择父表格中的此行数据
                reloadOnExpand: false //只加载一次子表格，再点击加号时不再加载
            },
            loadComplete:function(_data){
                var nodataHtml = '没有找到符合条件的数据' || options.nodataHtml;
                loadComplete(tableId,_data,nodataHtml);
            }
        },options||{});
    };
    //如果无数据,表格底部显示无数据
    var loadComplete = function(tableId,data,nodataHtml){
        var re_records = data.records;
        if (re_records == 0 || re_records == null) {
            var listCount = $(tableId).find('.jqgfirstrow>td').length - 1;
            $(tableId).find('.jqgfirstrow').empty().html("<td style='border:none;text-align:center;vertical-align:top;line-height:36px;color:#333;' colspan='" + listCount + "'>"+ nodataHtml+"</td>");
        }
    };

    /**
     * 普通表格
     * @param tableId   表ID
     * @param setting   自定义配置
     */
    var regularTables = function (tableId,setting) {
        var settings = settingConfig(tableId, setting);
        $(tableId).jqGrid(settings);
        var parentElement = $(tableId).closest(".jqGridTable-item");
        // 如何autowidth、autoScroll 为false,窗口改变时不调用winResize方法
        if(setting.autowidth == false && setting.autoScroll == false){
            return false;
        }
        if(parentElement.length>0 && setting.data.length>0 ){
            winResize(tableId,parentElement);
        }
    };

    /**
     * 按行合并单元格
     * tableId ：table标签id属性
     * cellNames ：要合并的列  ,参数格式["name","age"]/"name,age"
     * setting ：配置参数
     * 需要再colModel的要合并的列中添加（在js文件中配置的colModel中添加）
     * cellattr: function (rowId, tv, rawObject, cm, rdata) {
     *                   return 'id=(是一个变量：要合并列的name的属性值)' + rowId;
     *                   例：
     *                   return 'id=name' + rowId;       //要合并name列
     *                   return 'id=age' + rowId;       //要合并age列
     *            }
     * */
    var mergerRowCell = function(tableId,cellNames,setting){
        var settings = $.extend(true,{},settingConfig(tableId,setting), {
            gridComplete:function(){
                tableId = tableId.substring(0,1)=="#"?tableId.substring(1):tableId;
                //获取到表格所有行
                var rowsArr = $("#" + tableId + "").getDataIDs(),
                    rowsLength = rowsArr.length;
                var cellNamesArr= typeof cellNames == "string" ? cellNames.split(',') : cellNames,
                    cellNamesLen = cellNamesArr.length,
                    mergerCellName='';
                for(var cellName=0;cellName<cellNamesLen;cellName++){
                    mergerCellName = $.trim(cellNamesArr[cellName]);
                    for(var row=0;row<rowsLength;row++){
                        var currentRowData = $("#" + tableId + "").jqGrid('getRowData', rowsArr[row]);
                        var rowSpanTaxCount = 1;
                        for(var nextRow=row+1;nextRow<rowsLength;nextRow++ ){
                            var nextRowData= $("#" + tableId + "").jqGrid('getRowData', rowsArr[nextRow]);
                            if(currentRowData[mergerCellName] == nextRowData[mergerCellName]){
                                rowSpanTaxCount ++;
                                $("#" + tableId + "").setCell(rowsArr[nextRow], mergerCellName, '', {display: 'none'});
                            }else{
                                break;
                            }
                        }
                        if(rowSpanTaxCount > 1){
                            $("#" + mergerCellName + "" + rowsArr[row] + "").attr("rowspan", rowSpanTaxCount);
                            row += rowSpanTaxCount-1;
                        }
                    }
                }
            }
        });
        $(tableId).jqGrid(settings);
    };


    /**
     * 主从表功能
     *tableId ：table标签id属性
     *mainTableCfg:{
     *    setting:{
     *        data:[{},{},{}]          主表接口返回的数据
     *        colModel：[{},{},{}]     配置渲染主表的方式
     *        colModel：[{},{},{}]     配置渲染主表的方式
     *        ...                      特殊配置可以参照官方文档
     *        },
     *     subApiCfg:{
     *        url:""                    子表接口地址
     *        data:{}                   请求参数
     *        contentType:"Json/Form"   请求格式Json/Form  默认为Json格式
     *        otherParameters:[{字段：colModel的name属性值},{}]  其他参数是一个数组对象key:"后端要求的字段" value:"需要获取的属性"
     *        urlParams:[{"字段":"colModel的name属性值"},{}]     用于拼接在url后边的参数   是一个数组对象  key:"后端要求的字段"  value:"需要获取的属性"
     *         }
     *   }
     * subTableCfg: 子表的配置项 ，可参考主从表中子表的配置项
     * subTableCallback:子表请求数据成功时的回调函数。注释：有回调函数的时候subTableCfg可设置为null
     * */
    var mainfollowTables = function (tableId,mainTableCfg,subTableCfg,subTableCallback) {
        var setting = settingConfig(tableId, mainTableCfg.setting);             //主表配置
        var mainSetting = $.extend(true, {},setting,{
            onSelectRow:function (row_id) {
                loadDetailTable(row_id);
            }
        });
        $(tableId).jqGrid(mainSetting);                                        //加载主表
        //请求子表数据 superficiallyId 当前选择的主表id
        function loadDetailTable(row_id) {
            var subApiOption = mainTableCfg.subApiCfg||{};
            /*将subApiOption的参数做处理，最终返回subApiCfg对象。
            subApiCfg={
                url:url, //请求的url(URL上可能带有参数)
                data:{},  //接口需要的参数。默认值：{}
                contentType:'json'  //请求的方式 json||form。默认值json
            }*/
            var subApiCfg = getDataMsg(tableId,subApiOption,row_id);
            var data = subApiCfg.data,
                contentType =subApiCfg.contentType;
            if( 'Json'== contentType){
                data = JSON.stringify(data);
            }
            Api["ajax"+ contentType](subApiCfg.url,data, function(result){
                if(result.success){
                    if(subTableCallback){
                        subTableCallback(result.rows,row_id);
                        return false;
                    }
                    subTableCfg.setting.data =result.rows;
                    $("#"+subTableCfg.subTableId).jqGrid('GridUnload');
                    regularTables("#"+subTableCfg.subTableId,subTableCfg.setting);
                }else{
                    Mom.layAlert(result.message);
                }
            });

             /*//新添加的方法根据传参数是否要url后拼接参数类型、是否要获取其他参数
            var subSetCfg = getDataMsg(tableId,mainTableCfg,id);
            //判断请求格式
            var data = subSetCfg.data;
            if(mainTableCfg.subApiCfg.contentType.toLocaleLowerCase() == "json" || mainTableCfg.subApiCfg.contentType.toLocaleLowerCase() == undefined || mainTableCfg.subApiCfg.contentType.toLocaleLowerCase() == null){
                mainTableCfg.subApiCfg.contentType = "Json";
                data = JSON.stringify(data);
            }
            Api["ajax"+ mainTableCfg.subApiCfg.contentType](subSetCfg.url,data, function(result){
                if(result.success){
                    if(typeof settingType == "function"){
                        settingType(result.rows,row_id);
                        return;
                    }else if(typeof settingType == "object" ){
                        var html = '<table id="'+settingType.subTableId+'" ></table>';
                        $("#"+settingType.subTableId).parent("div.jqGridTable-item").empty().append(html);
                        var subsetting = settingType.setting;
                        subsetting.data = result.rows;
                        regularTables("#"+settingType.subTableId,subsetting);
                    }
                }else{
                    Mom.layAlert(result.message);
                }
            })*/
        }
    };



    /**
     * 主子表
     *tableId : table标签ID属性值
     * mainTableCfg:{                           主表配置
     *        setting:{
     *            colModel:[{},{},{}],          基础表配置
     *            data:[{},{},{}]               要渲染的数组接口返回的数据
     *         },
     *         subApiCfg:{
     *             url:"",                     请求子表的接口
                   data: {},                    请求的参数
                   contentType:"Json"           请求格式
     *              }
     *          }
     * subTableCfg:{                               子表配置
     *         setting:{
     *             colMolde:[{},{},{}]             子表基础表配置
     *             }
     *        }
     * subTableCallback:子表请求数据成功时的回调函数。注释：有回调函数的时候subTableCfg可设置为null
     * */
    var mainSubTables = function (tableId,mainTableCfg,subTableCfg,subTableCallback) {
        mainTableCfg.setting.data = addSort(mainTableCfg.setting.data,mainTableCfg.setting.setSort);
        //创建主表
        var setting = settingConfig(tableId, mainTableCfg.setting);
        // winResize(tableId,$(tableId).closest('.jqGridTable-item'));
        $(tableId).jqGrid(
            $.extend(true, {}, setting, {
            subGrid : true,   // (1)开启子表格支持
            subGridRowExpanded : function(subgrid_id, row_id) {  //点击"+"  //(2)子表格容器的id和需要展开子表格的行id
                bindSubGrid(subgrid_id, row_id);
            }
        }));
        //如果没有子数据，就隐藏对应的主表"+"且注销点击事件
        judgeDate(tableId,mainTableCfg.setting.data);
        //子表创建以及配置
        function bindSubGrid(subgrid_id, row_id) {
            var subtable = [];
            var subgrid_table_id = subgrid_id + "_t";       // 3)根据subgrid_id定义对应的子表格的table的id
            var subgrid_pager_id = subgrid_id + "_pgr";     // 4)根据subgrid_id定义对应的子表格的pager的id
            subtable.push(subgrid_table_id);
            // (5)动态添加子表的table和pager
            $("#" + subgrid_id).html(
                    "<div class='subTableBox' >" +
                        "<table id='"+subgrid_table_id+"' class='scroll'></table>" +
                        "<div id='"+subgrid_pager_id+"' class='scroll'></div>" +
                "</div>"
            );

            var subApiOption = mainTableCfg.subApiCfg||{};
            /*将subApiOption的参数做处理，最终返回subApiCfg对象。
            subApiCfg={
                url:url, //请求的url(URL上可能带有参数)
                data:{},  //接口需要的参数。默认值：{}
                contentType:'json'  //请求的方式 json||form。默认值json
            }*/
            var subApiCfg = getDataMsg(tableId,subApiOption,row_id);
            var data = subApiCfg.data,
                contentType = subApiCfg.contentType;
            if( 'Json'==contentType){
                data = JSON.stringify(data);
            }
            Api["ajax"+ contentType](subApiCfg.url, data, function(result){
                if(result.success){
                    if(subTableCallback){
                        // param1：子表数据集合  * param2：承载子表数据的容器id   * param3：需要展开子表格的行(tr)id
                        subTableCallback(result.rows, subgrid_table_id, row_id);
                        return;
                    }else{
                        //6) 创建jqGrid对象
                        subTableCfg.setting.data =result.rows;
                        var setting = settingConfig("#"+subgrid_table_id, subTableCfg.setting);
                        $("#" + subgrid_table_id).jqGrid(setting);
                    }

                }else{
                    Mom.layAlert(result.message);
                }
            });
        };
    };

    /**
     * 根据不同参数返回不同的参数类型
     * tableId:获取到table的数
     * subApiCfg是子表的apiCfg
     *subApiCfg{
         *  url:请求子表数据的接口地址
         *  data:{}, //请求接口需要的参数  注释：此参数不放置在url上
         *  otherParameters:[{}],//请求接口需要的参数    注释：需要父级中表中的name值作为参数时需要配置在otherParameters，此参数不放置在url上而是动态的插入到data对象中
         *  urlJoint    //请求接口需要的参数    注释：此参数将拼接到url上
         *  contentType：请求接口的类型   注释：不传此参数的话默认是JSON格式请求

     *  }
     * activeMainId //子表对应的主表（tr）id
     * */
    var getDataMsg = function (tableId,subApiOption,activeMainId) {
        var activeMainData= $(tableId).getRowData(activeMainId) || {};// 获取当前行的数据，返回值是Obj
        var subApiCfg = {
            data:subApiOption.data ||{}
        };
        /**
         * 动态往data（请求的参数对象）中添加参数
         * 需要父级中表中的name值作为参数时需要配置在otherParameters
         * @param otherParameters:[{后端需要的参数名:主表配置的name值}]数组对象  例如：otherParameters：[{id: 'instrId'}]
         *  将id添加到data对象中且获取指主表指定列（instrId）的值  rowData('instrId')
         */
        var mainColNames = subApiOption.otherParameters||[];
        if(mainColNames && mainColNames.length>0){
            var isArrayFlag = (Array == mainColNames.constructor); //校验mainColNames是否是数组
            if( isArrayFlag){
                $(mainColNames).each(function(ind,item){
                    for(var key in item){
                        subApiCfg.data[key] = activeMainData[item[key]];
                    }
                })
            }else{
                Mom.layAlert("参数格式需为数组对象型，如[{key:value}]");
            }
        }

        //url后边需要拼接参数的格式
        //数组:  "http://192.168.100.241:8080/value1/value2"   参数格式[value1,value2]
       //对象:   "http://192.168.100.241:8080?key=value&key1=value1  参数格式{key:value,key1:value1}
       //  将老版本urlJoint改为urlParams
        var urlParams = subApiOption.urlParams;
        if(urlParams instanceof Array){
            var urlParamArr = [];
            $(urlParams).each(function(i,o){
                var colVal = activeMainData[o]||'';
                colVal?urlParamArr.push(colVal):urlParamArr.push(o);
            });
            subApiCfg.url = subApiOption.url + urlParamArr.join('/');
        }else if(urlParams instanceof Object){
            var paramObj={};
            for(var key1 in urlParams){
                var colVal = activeMainData[urlParams[key1]]||'';
                paramObj.key1 = colVal?colVal:urlParams[key1];
            }
            subApiCfg.url = Mom.extractUrl(subApiOption.url,paramObj);
        }else{
            subApiCfg.url = subApiOption.url ||'';
        }
        var old_contentType = subApiOption.contentType?subApiOption.contentType.toLocaleLowerCase():"json";
        subApiCfg.contentType = old_contentType.replace(old_contentType[0],old_contentType[0].toUpperCase());//子表的请求方式。默认json
        return subApiCfg;
    };



    /**如果保存的时候需要获取当前表的所有的数据
     * 获取子表的数据(获取所有的数据)
     * tableId:主表的id
     * 获取展开过的子表的数据
     * */
    var getAllData = function (tableId) {
        //失去焦点输入框的值给td
        $(tableId+" input[type=text].editable").each(function (i, item) {
            $(this).parent('td').text($(this).val());
            $(this).remove();
        });
        return $(tableId).jqGrid("getRowData");
    };
    /**
     * 保存时只保存编辑过的数据
     *editTableId:子表的id数组
     * 通过获取到所有的数据,跟编辑的id;如果所有数据中有编辑的就返回
     * */
    var getEditedData= function (tableId) {
        var rowData = tableArr = [];
        tableArr = getAllData(tableId);
        $.unique(editTableId);
        for(var j=0;j<tableArr.length;j++){
            for(var k=0;k<editTableId.length;k++){
                if(editTableId[k] == tableArr[j].id){
                    rowData.push(tableArr[j]);
                }
            }
        }
        return rowData;
    };

    /**
     * 功能描述:编辑行
     * editTableId :默认值[],是一个数组,当编辑的时候会获取到当前编辑项的id，保存的时候可以根据id获取到编辑后的数据
     * @param tableId  承载jqGrid容器id
     * @param lastsel  是否是最后一行
     * @param isNumber 是否限制输入的是数字
     * @returns {{cellEdit: boolean, cellsubmit: string, editurl: string, onCellSelect: onCellSelect}}
     */
    var editTableId = [];
    var editRowFn=function (tableId,editType) {
        var oldRowId = '';
        return {
            cellEdit:true,
            cellsubmit: 'clientArray', //表格递交位置
            editurl: 'clientArray',    //编辑保存地址
            onCellSelect: function (id,status) {
                editTableId.push(id);
                if (id && id !== oldRowId) {
                    $(tableId).saveRow(oldRowId, false, 'clientArray');
                    $(tableId).restoreRow(oldRowId);
                    $(tableId).editRow(id, false);
                    oldRowId = id;
                };
                if(editType){
                    $("#"+id).find("td").each(function (index,item) {
                        //获取自定义属性，得到colName值
                        var regForEdit=/^\d+(\.\d{0,2})?$/;
                        $(tableId).find('input[type=text]').each(function () {
                            $(this).on('keyup',function () {
                                var ariaAttr = $(this).parent().attr("aria-describedby"),
                                    ariaArrLast = ariaAttr.split('_').pop();
                                var val=$(this).val();
                                for(var i=0;i<editType.length;i++){
                                    if(editType[i] == ariaArrLast && !regForEdit.test(val)){
                                        $(this).val('');
                                        Mom.layMsg('请输入数字,且保留两位小数');
                                    }
                                }
                            });
                        });
                    });
                }
            }
        }
    };


    /***
     * 功能描述：主子表中没有子表，把主表加号隐藏    注意：后端返回的数据对象中移动要带有childNode，否侧该方法无效。
     * @param tableId   承载主子表的容器id
     * @param data       主表数据集合
     * 实现思路：对主表数据循环，查找每条数据中的childNode的值，如果值不为false则表示该主表关联的子表是有数据的，反之无数据。无数据时将主表中的+隐藏掉且注销点击事件
     *
     */
    var judgeDate = function (tableId,mainRows) {
        //获取所有数据
        if(mainRows && mainRows.length>0) {
            for(var i =0;i<mainRows.length;i++){
                // 当childNode为false时，将主表中的+隐藏掉且注销点击事件
                var item= mainRows[i];
                if(item.id && item.childNode ==  false){
                    $(tableId).find('tr#'+item.id).find(".sgcollapsed").empty().unbind("click");
                    continue;
                }
            }
        }
    };
    /**
     * 排序方法
     * @param data
     * @param setSort
     * @returns {*}
     */
    var addSort = function (data,setSort) {
        if(setSort && data){
            for(var i=0;i<data.length;i++){
                data[i].sort = i+1;
            };
        }
        return data;
    };
    /**
     * window.resize时表格重置
     * @param selector  承载jqGrid表格的容器
     */
    var winResize = function(selector,parsId){
        $(window).resize(function(){
            $(selector).setGridWidth(parsId == (undefined || null) ?  $(window).width()*1 : $(parsId).width());


        });
       /* $(window).unbind('resize').bind('resize', function() {
            $(selector).setGridWidth($(window).width()*4);
            /!*$(selector).css("width","100%");
            $(selector).css("width","100%");
            $(selector).find('.ui-jqgrid-hdiv').css("width","100%");
            $(selector).find('.ui-jqgrid-hbox').css("width","100%");
            $(selector).find('.ui-jqgrid-bdiv').css("width","100%");*!/
        }).trigger('resize');*/
    };
    //获取单个选中的行id
    var getCheckId = function(tableId){
        return $(tableId).jqGrid('getGridParam','selrow');
    };
    //获取的选中行的id's(即选中多行) 返回类型array
    var getCheckIds =  function(tableId){
        return $(tableId).jqGrid('getGridParam','selarrrow');
    };
    //获取最后一次选中行的id
    var getLastCkeckId= function(tableId){
        $(tableId).jqGrid('getRowData', slt)
    };

    return {
        loadComplete:loadComplete,                  //加载成功之后校验是否有数据
        regularTables:regularTables,               //普通表
        editRowFn:editRowFn,                       //编辑行
        addSort:addSort,                           //排序方法
        mergerRowCell:mergerRowCell,               //按行合并单元格
        mainSubTables:mainSubTables,               //主子表
        judgeDate:judgeDate,                       //主子表中没有子表，把主表加号隐藏
        mainfollowTables:mainfollowTables,         //主从表
        getEditedData:getEditedData,               //获取编辑过的数据集合
        getAllData:getAllData,                     //获取容器(tableID)中所有数据
        winResize:winResize,                       //窗口重置，表格自适应
        getCheckId:getCheckId,                     //获取单个选中的行id
        getCheckIds:getCheckIds,                   //获取的选中行的id's(即选中多行)
        getLastCkeckId:getLastCkeckId              //获取最后一次选中行的id
    }
});
//注意： 将urlJoint改为urlParam    by lhy