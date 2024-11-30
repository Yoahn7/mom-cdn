define(function(require){
    require('js/plugins/datatables/js/jquery.dataTables.min');
    //dataTable样式
    var cssArr = [
        cdnDomain+"/js/plugins/datatables/css/jquery.dataTables.min.css",  //需引入，否则固定列样式错乱
        // "/css/customDataTable.css",
        cdnDomain+"/js/plugins/datatables/css/dataTables_my.css"

    ];
    $.each(cssArr,function(i,o){
        var head = document.getElementsByTagName('head')[0],
            linkTag = document.createElement('link');
        linkTag.href = o;
        linkTag.setAttribute('rel','stylesheet');
        linkTag.setAttribute('type','text/css');
        // head.appendChild(linkTag);
        $(linkTag).insertBefore('title');
    });
    /*if(!$.fn.dataTable){
        alert('插件未加载完成，请刷新后重试.');
    }*/
    //dataTable默认配置
    /*
    console.log('正在加载datatable插件...');//最多只等6秒
    $.fn.dataTable = null;
    var startSec = new Date().getTime();
    while($.fn.dataTable == undefined && (new Date().getTime()-startSec)<6000){
        require('datatables');
        console.log('2..');
    }
    */
    if($.fn.dataTable){
        // console.log('datatable插件加载成功！');
        $.fn.dataTable.defaults.bSort = true;
        /* $.fn.dataTable.defaults.sScrollX = '100%';
         $.fn.dataTable.defaults.sScrollXInner = '100%';*/
        // $.fn.dataTable.defaults.ordering=true;
        $.fn.dataTable.defaults.order = [];
        $.fn.dataTable.defaults.paging = false;
        $.fn.dataTable.defaults.bPaginate = false;
        $.fn.dataTable.defaults.pagingType = "full_numbers";
        $.fn.dataTable.defaults.info = false; //底部文字
        $.fn.dataTable.defaults.bAutoWidth = false;
        $.fn.dataTable.defaults.bDestroy = true;
        $.fn.dataTable.defaults.bProcessing = true;
        $.fn.dataTable.defaults.searching = false;
        $.fn.dataTable.defaults.bFilter = false; //是否启动过滤、搜索功能

        $.fn.dataTable.defaults.colReorder = false; //交换列

        $.fn.dataTable.defaults.oLanguage = {
            "sProcessing": "处理中...",
            "sLengthMenu": "每页显示 _MENU_ 条记录",
            "sZeroRecords": "没有找到符合条件的数据",
            "sInfo": "显示第 _START_ ~ _END_ 项结果，共 _TOTAL_ 项",
            "sInfoEmpty": "没有数据",
            "sInfoFiltered": "(从 _MAX_ 条数据中检索)",
            "sInfoPostFix": "",
            "sUrl": "",
            "sSearch": "搜索：",
            "sSearchPlaceholder": "关键字筛选",
            "sEmptyTable": "没有找到符合条件的数据",
            "sLoadingRecords": "载入中...",
            "sInfoThousands": ",",
            "oPaginate": {
                "sFirst": "首页",
                "sPrevious": "上页",
                "sNext": "下页",
                "sLast": "末页"
            },
            "oAria": {
                "sSortAscending": ": 以升序排列此列",
                "sSortDescending": ": 以降序排列此列"
            }
        };
    }

    $.extend(true, $.fn.DataTable, {
        addRows3: function(dataRows, index){
            var dt = this;
            if(index != null){
                for(var i=dataRows.length-1; i>-1; i--){
                    var retRow = dt.row.add(dataRows[i]);
                    var aiDisplayMaster = dt.fnSettings().aiDisplay;
                    // var aiDisplayMaster = table.fnSettings()['aiDisplayMaster'];
                    var moveRow = aiDisplayMaster.pop();
                    aiDisplayMaster.splice(index, 0, moveRow);
                }
            }
            else{
                dt.rows.add(dataRows);
            }
            return dt.draw(false);
        }
    });


    //internal
    // $.fn.dataTable.ext.search.push(
    //     function( settings, data, dataIndex ) {
    //         var min = parseInt( $('#min').val(), 10 );
    //         var max = parseInt( $('#max').val(), 10 );
    //         var age = parseFloat( data[3] ) || 0; // use data for the age column
    //
    //         if ( ( isNaN( min ) && isNaN( max ) ) ||
    //             ( isNaN( min ) && age <= max ) ||
    //             ( min <= age   && isNaN( max ) ) ||
    //             ( min <= age   && age <= max ) )
    //         {
    //             return true;
    //         }
    //         return false;
    //     }
    // );

    /**
     *
     * @param dataRows 要添加的数组对象
     * @param index   要插入的位置，默认为空（即添加到末尾）
     * @param dt  dataTable()返回的实例对象
     * @returns {*}
     */
    window.dt_addRows = function(dataRows, index,dt_){
        dt = dt_?dt_:dt;
        var dtApi = dt.api();
        if(index != null){
            var aiDisplayMaster = dt.fnSettings()['aiDisplayMaster'];
            // var aiDisplayMaster = dtApi.aiDisplayMaster;
            for(var i=dataRows.length-1; i>-1; i--){
                dtApi.row.add(dataRows[i]);
                var moveRow = aiDisplayMaster.pop();
                aiDisplayMaster.splice(index, 0, moveRow);
            }

        }
        else{
            dtApi.rows.add(dataRows);
        }
        dtApi.draw(false);
        if($.fn.iCheck){
            renderIChecks();
        }
        if($.fn.select2){
            renderSelect2($('.select2'));
        }
        return dtApi.rows();
    };

    /**
     * 隐藏列
     * @param colArr 列索引数组
     * @param reDraw 是否重绘，默认为false
     * @param dt  dataTable()返回的实例对象
     */
    window.dt_hideCols = function( colArr, reDraw,dt_){
        dt = dt_?dt_:dt;
        var dtApi = dt.api();
        for (var i=0 ; i<colArr.length ; i++ ) {
            dtApi.column(colArr[i]).visible( false, false );
        }
        reDraw = reDraw==undefined?false:true;
        dtApi.columns.adjust().draw( reDraw ); // adjust column sizing and redraw
    };


    /**
     * 获取选中的数据集合，返回值：数组对象  [{id:选中行ID,rownum:选中行索引}]
     * @param tableId
     * @returns {Array}
     */
    window.dt_getCheckRows = function(tableId){
        var idArr = [];
        var table = $(tableId).closest('.dataTables_wrapper');
        var t_scrollHead = $(table).find('.dataTables_scrollHead'),
            t_scrollBody = $(table).find('.dataTables_scrollBody tbody'),
            t_dtfcHead = $(table).find('.DTFC_LeftHeadWrapper'),
            t_dtfcBody = $(table).find('.DTFC_LeftBodyWrapper tbody');
        if(t_scrollBody.length){
            var t_body = t_dtfcBody.length>0?t_dtfcBody:t_scrollBody;
            var dt_body_checkboxs = $(t_body).find('input.i-checks');
            $.each(dt_body_checkboxs,function(i,cb){
                if ($(cb).is(":checked")) {
                    var id = $(cb).attr('id');
                    idArr.push({id:id||'', rownum:i});
                }
            });
        }else{
            $(tableId).find("tr td input.i-checks:checkbox").each(function (i, item) {
                if ($(this).is(":checked")) {
                    var id = $(this).attr('id');
                    idArr.push({id:id||'', rownum:i});
                }
            });
        }
        return idArr;
    };
    /**
     * 删除选中行，（1）动态添加的行且数据未保存的情况下将使用remove()方式移除。（2）勾选的数据为后端返回的数据将通过接口的方式删除
     * @param tableId table的id, 必选参数。
     * @param url 后端删除接口, 必选参数。
     * @param callback  回调函数，接收两个参数(result,index),result: 删除成功时返回的结果,index:弹出层的索引。可选参数,只有删除所有数据才调用该函数。
     *
     */

    window.dt_deleteRows = function(tableId,url,callback) {
        var win = Mom.top();
        var checkRowArr = dt_getCheckRows(tableId);
        if (checkRowArr.length) {
            Mom.layConfirm('请您确认是否要删除勾选数据?', function (layIdx) {
                // var scrollHead = $(tableId).closest('.dataTables_scrollHead');
                var table = $(tableId).closest('.dataTables_wrapper');
                var tbody = $(table).find('.dataTables_scrollBody tbody'),
                    thead = $(table).find('.dataTables_scrollHead');
                var dtfcHead = $(table).find('.DTFC_LeftHeadWrapper'),
                    dtfcBody = $(table).find('.DTFC_LeftBodyWrapper tbody');
                if(tbody && tbody.length){

                }else{
                    thead = $(tableId).find('thead');
                    tbody = $(tableId).find('tbody');
                }
                var trueIdArr = [], rownumArr = [];
                $.each(checkRowArr, function (i, r) {
                    rownumArr.push(r.rownum);
                    if (r.id != '' && r.id >0 ) {
                        trueIdArr.push(r.id);
                    }
                });
                if (trueIdArr.length) {
                    //调用接口，删除
                    var data = {
                        ids: trueIdArr.join(',')
                    };
                    Api.ajaxForm(url, data, function (result) {
                        if(result.success== true){
                            var coutObj = $(tableId).closest('.dataTable-item').find('span.count');
                            $(coutObj).text(parseInt(coutObj) - trueIdArr.length);

                            if (callback) {
                                callback(result, layIdx, thead, tbody, checkRowArr,dtfcBody);
                            }
                            else {
                                $(thead).find('input').iCheck('uncheck');// 把input设置为不勾选，如果不设置,刷新列表会一直显示勾选。
                                if(dtfcHead){
                                    $(dtfcHead).find('input').iCheck('uncheck');// 把input设置为不勾选，如果不设置,刷新列表会一直显示勾选。
                                }
                                if(dtfcBody){
                                    $(dtfcBody).find('input').iCheck('uncheck');
                                }

                                //动态移除
                                $.each(tbody.find('tr'), function (j, tr) {
                                    if (rownumArr.contains(j)) {
                                        $(tr).remove();
                                        if(dtfcBody){
                                            dtfcBody.find('tr').eq(j).remove();
                                        }
                                    }
                                });
                                win.layer.close(layIdx);
                            }
                        }else{
                            Mom.layMsg(result.message);
                        }

                    });
                } else {
                    //动态移除
                    $.each(tbody.find('tr'), function (j, tr) {
                        if (rownumArr.contains(j)) {
                            $(tr).remove();
                        }
                    });
                    win.layer.close(layIdx);
                }
            });
        } else {
            Mom.layMsg("请选择至少一条数据！");
        }
    };

    /**
     * 渲染数据，通过option参数来加载不同的js
     * @param tableId table的id
     * @param option 对象 参数如下{
     * @param 拖拽列 colReorder: boolean || {
     *                  fixedColumnsLeft: 从左边开始有几列不能拖拽
     *                  fixedColumnsRight: 从右边开始有几列不能拖拽
     *              },
     * @param 冻结列 fixedColumns: boolean || {
     *                  leftColumns: 从左边开始有几列冻结
     *                  rightColumns: 从右边开始有几列冻结
     *              }
     * @param fixedHeader: true,//固定表头，可选
     * @param colResizable:true|{} //列的宽度拖拽，可选
     * @param fixedColumns:true|{}  //冻结列
     * @param initFilterSelect:ture|[]|{}  //显示|隐藏列  值为数组时，数组中表示的是不包含的操作的"显示|隐藏"列
     * @param config:{} 对象，datatable的配置项， 必须有。
     * }
     */
    $.fn.dt_renderData=function(settings){
        var tableId ='#'+$(this).attr('id');
        if($(tableId).length){
            // 动态设置table容器的高度，使表格最大的高度为"窗口的高度 - 非table区域的高度"
            if(settings.scrollY =='auto'){
                var container = $(tableId+'_wrapper').length==1?$(tableId+'_wrapper'):$(tableId);
                var theadH = container.find('.dataTables_scrollHead').find('thead').outerHeight()||container.find('thead').outerHeight()||0,
                    pageBoxH = container.next('div.pagination-box').outerHeight(true)||0;
                if($(window).outerHeight()>0){
                    settings.scrollY = $(window).outerHeight()-Math.ceil(container.offset().top)-theadH-pageBoxH-20;
                    settings.scrollX =true;
                    settings.scrollCollapse =true;
                }
            }

            var dt_req_plugins = [];
            //列交换
            if(settings.colReorder){
                dt_req_plugins.push('dataTable_colReorder');
            }
            //固定表头
            if(settings.fixedHeader){
                dt_req_plugins.push('dataTable_fixedHeader');
            }
            //冻结列
            if(settings.fixedColumns){
                dt_req_plugins.push('dataTable_fixedColumns');
                //冻结的列同样不能拖拽
                var leftColumns = settings.fixedColumns.leftColumns || 0;
                var rightColumns = settings.fixedColumns.rightColumns || 0;
                //如果定义了拖拽
                if(settings.colReorder){
                    var fixedColumnsLeft = settings.colReorder.fixedColumnsLeft || 0;
                    if(fixedColumnsLeft < leftColumns){
                        fixedColumnsLeft = leftColumns;
                    }
                    var fixedColumnsRight = settings.colReorder.fixedColumnsRight || 0;
                    if(fixedColumnsRight < rightColumns){
                        fixedColumnsRight = rightColumns;
                    }
                    if(typeof settings.colReorder == "object"){
                        settings.colReorder.fixedColumnsLeft = fixedColumnsLeft;
                        settings.colReorder.fixedColumnsRight = fixedColumnsRight;
                    }else{
                        settings.colReorder = {fixedColumnsLeft:fixedColumnsLeft,fixedColumnsRight:fixedColumnsRight};

                    }
                }
            }
            //列宽可调整
            if(settings.colResizable){
                dt_req_plugins.push('dataTable_colResizable');
            }
            if(dt_req_plugins.length){
                require(dt_req_plugins, function(){
                    dt = renderTableData(tableId,settings);
                    //列宽可调整
                    if(settings.colResizable){
                        $(tableId).colResizable({
                            liveDrag:true,
                            gripInnerHtml:"<div class='grip'></div>",
                            draggingClass:"dragging",
                            resizeMode:'flex',
                        });
                    }
                    if(settings.initFilterSelect){
                        initFilterSelect(dt,settings);
                    }
                    return dt;
                });
            }else{
                dt = renderTableData(tableId,settings);
                if(settings.initFilterSelect){
                    initFilterSelect(dt,settings);
                }
                return dt;
            }

        }
    };

    //暂不使用
    /* window.dt_renderData = function(tableId,config){
         var settings = config.settings;
         var dt_req_plugins = [];
         //列交换
         if(settings.colReorder){
             dt_req_plugins.push('dataTable_colReorder');
         }
         //固定表头
         if(settings.fixedHeader){
             dt_req_plugins.push('dataTable_fixedHeader');
         }
         //冻结列
         if(settings.fixedColumns){
             dt_req_plugins.push('dataTable_fixedColumns');
             //冻结的列同样不能拖拽
             // 获取冻结列的个数
             var leftColumns = settings.fixedColumns.leftColumns || 0;
             var rightColumns = settings.fixedColumns.rightColumns || 0;
             //如果定义了拖拽
             if(settings.colReorder){
                 var fixedColumnsLeft = settings.colReorder.fixedColumnsLeft || 0;
                 if(fixedColumnsLeft < leftColumns){
                     fixedColumnsLeft = leftColumns;
                 }
                 var fixedColumnsRight = settings.colReorder.fixedColumnsRight || 0;
                 if(fixedColumnsRight < rightColumns){
                     fixedColumnsRight = rightColumns;
                 }
                 if(typeof settings.colReorder == "object"){
                     settings.colReorder.fixedColumnsLeft = fixedColumnsLeft;
                     settings.colReorder.fixedColumnsRight = fixedColumnsRight;
                 }else{
                     settings.colReorder = {fixedColumnsLeft:fixedColumnsLeft,fixedColumnsRight:fixedColumnsRight};
                 }
             }
         }
         //列宽可调整
         if(settings.colResizable){
             dt_req_plugins.push('dataTable_colResizable');
         }
         if(dt_req_plugins.length){
             require(dt_req_plugins, function(){
                 var dt = renderTableData(tableId,settings);
                 //列宽可调整
                 if(settings.colResizable){
                     $(tableId).colResizable({
                         liveDrag:false,
                         gripInnerHtml:"<div class='grip'></div>",
                         draggingClass:"dragging",
                         resizeMode:'overflow',
                     });
                 }
                 initFilterSelect(dt,settings);
             });
         }else{
             var dt = renderTableData(tableId,settings);
             initFilterSelect(dt,settings);
         }

     };*/

    //显示|隐藏列函数
    function initFilterSelect(dt,settings){
        if(dt){
            var tableId = dt.selector;
            var leftColumns, rightColumns;
            var initArr = [], bindDom;
            //初始化
            initFilter();
            function initFilter(){
                //获取 显示|隐藏列 参数项
                if(settings.initFilterSelect instanceof Array){
                    initArr=settings.initFilterSelect || [];
                }else if(settings.initFilterSelect instanceof Object){
                    initArr=settings.initFilterSelect.debarColumns || [],
                        bindDom = $.trim(settings.initFilterSelect.bindDom)|| '';
                }
                if(settings.fixedColumns){
                    leftColumns = settings.fixedColumns.leftColumns || 0;
                    rightColumns = settings.fixedColumns.rightColumns || 0;
                }
                var tableTh=$(tableId).find("thead").find("th");
                var thInput = tableTh.find('input.i-checks');
                // 判断表头（thead）是否有input.i-checks的元素，如果有将其放入initArr数组中。（默认排除掉input.i-checks元素）
                if(thInput){
                    var thInputInd = thInput.index();
                    if(initArr.indexOf(thInputInd)==-1){
                        initArr.push(tableTh.index());
                    }
                }
                //若filSelIncludeFixCol:true 则将冻结列的列信息（索引值）放入到initArr中，'显示|隐藏'的下拉选项中将包含被冻结的列表头名称
                if(settings.filSelIncludeFixCol == false){
                    var fixedColumnsArr = [];
                    for(var i=0;i<leftColumns;i++){
                        fixedColumnsArr.push(i);
                    }
                    for(var j=1;j<=rightColumns;j++){
                        fixedColumnsArr.push(tableTh.length-j);
                    }
                    concatArr = initArr.concat(fixedColumnsArr);
                    $(concatArr).each(function(i,o){
                        if(initArr.indexOf(o)==-1){
                            initArr.push(o)
                        }
                    });
                }
                fillterInitArr();
            }

            //获取即将存放在"显示|隐藏"列中的数据
            function fillterInitArr(){
                var strHtml='',tableTh=$(tableId).find("thead").find("th");
                //循环tableTh，排除掉initArr中的数据，将其余项放入str中。
                if(tableTh.length-initArr.length ==1){
                    strHtml += ' <li  class="toggle-vis" data-column="' + i + '"><label><input type="checkbox"  class="i-checks aa" checked disabled="disabled" />' + $(tableId).find("thead").find("th").eq(i).text() + '</label></li>'
                }else{
                    $(tableTh).each(function (i, o) {
                        if (initArr.indexOf(i) == -1) {
                            strHtml += ' <li  class="toggle-vis" data-column="' + i + '"><label><input type="checkbox"  class="i-checks" checked />' + $(tableId).find("thead").find("th").eq(i).text() + '</label></li>'
                        }
                    });
                }
                appendStrHtml(strHtml)
            }

            //将获取的"显示|隐藏"列的数据放入到绑定的DOM元素中
            function appendStrHtml(strHtml){
                var tableBox = $(tableId).closest('.dataTable-item');
                //判断"显示|隐藏"列
                if(bindDom == undefined || bindDom==''){
                    bindDom = '.tableSelect';
                }
                if(bindDom != 'header' && $(bindDom).length > 0){
                    $(bindDom).html(strHtml);
                }else{
                    var tableSelectBox = $('<ul class="tableSelect"></ul>').html(strHtml);
                    tableSelectBox.prependTo($(tableBox));
                    $('.tableSelect').click(function(event){
                        window.event? window.event.cancelBubble = true : event.stopPropagation();
                        window.event?window.event.returnValue == false:event.preventDefault();
                    });
                    $('body').click(function(){
                        var display = $('.tableSelect').css('display');
                        if(display !=='none'){
                            $('.tableSelect').fadeOut('500');
                        }
                    });
                }
                renderIChecks();
            }

            //选中下拉框中的某项，"显示|隐藏"列
            $(bindDom).find('li').on('ifClicked','input.i-checks:first',function(event){
                if($(this).prop("checked")){
                    $(this).prop("checked",false);
                }else{
                    $(this).prop("checked",true)
                }
                var checkedLen = $(bindDom).find('input.i-checks:checked').length;
                var input=$(this).closest('.tableSelect').find("input.i-checks");

                // 方法一：显示|隐藏列
                dt.fnSetColumnVis($(this).closest('li').attr('data-column'),$(this).prop("checked"),true);

                // 方法二：显示|隐藏列
                /*  var column = dt.api().column( $(this).closest('li').attr('data-column'));
                  column.visible( ! column.visible());*/

                // 一个列表有n个列，不可能让所有的列都消失，所以当出现只有一个列显示的时候，这个下拉选择框不可以选
                if(checkedLen>1){
                    $.each(input,function(i,o){
                        if($(o).hasClass('aa')){
                            $(o).iCheck('enable');
                        }
                    });
                }else{
                    $.each(input,function(i,o){
                        if($(o).is(':checked')){
                            $(o).iCheck('disable').addClass('aa');
                        }
                    });
                }

            });

            //右键单击表头时，根据鼠标位置"显示|隐藏"下拉框
            $(tableId).find('thead th').each(function(i,o){
                $(o)[0].oncontextmenu = function(event){
                    var e = event || window.event;
                    var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
                    var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
                    var x = e.pageX || e.clientX + scrollX;
                    var y = e.pageY || e.clientY + scrollY;
                    //ul显示的位置
                    $('.tableSelect').fadeIn('500').css({top:y,left:x});
                    return false;
                }
            });
        }
    }

    // 渲染表格调用
    function renderTableData(tableId,config) {
        $(tableId).dataTable().fnDraw();
        try {
            dt = $(tableId).dataTable(config);
            $(window).resize(function () {
                dt.api().columns.adjust().draw();
            });
            renderSelect2();
            renderIChecks();
        }catch (e) {
            console.error(e)
            Mom.layAlert('表格数据渲染异常，请检查');
        }
        return dt;
    }


    /**
     * 获取修改的数据，需要在th上定义自定义属性 data-name，它的值为datatable配置项中的aoColumns的data的值相对应。必须的。参考0_0/newDataTables.html页面中的table。
     *  @param tableId table的id
     *  @param idArr：数组， 保存修改后的行的id,需要配合window.dt_renderData 一起使用。idArr全局定义。
     *  返回值:dataArr 数组对象，修改的行的所有数据。
     */
    window.dt_getData = function(tableId){
        var jsonArr = [];
        $(tableId).find('tbody tr').each(function (i,o) {
            var data = $(o).serializeJSON();
            delete data[''];
            jsonArr.push(data);
        });
        return jsonArr;

    };
});
