require([cdnDomain+'/js/zlib/app.js'], function(App) {
    //获取参数:是否多选
    var multiple = Mom.getUrlParam('multiple')||'false';
    multiple = multiple==true||multiple=='true';

    require(['Page'],function(){
        var page = new Page({
            pageShowNum:0
        });
        window.pageLoad = function () {
            $.extend(data||{},{
                companyId: $("#companyId").val(),
                loginNameParam: $('#loginName').val(),
                deptId: $('#officeId').val(),
                nameParam: $('#name').val(),
                treeId: $('#treeId').val()
            });
            page.init(Const.admin+"/api/sys/SysUser/page", data, true, function (tableData, result) {
                dataout(tableData);
            });
        };
        //点击重置按钮
        $("#reset-btn").click(function () {
            Mom.clearForm('.toolbar-form');
            page.reset(["nameParam","deptId","loginNameParam","companyId"]);
        });

        pageLoad();

        //ajax请求渲染datatable数据
        function dataout(dataTable) {
            $('#treeTable').dataTable({
                "data":dataTable,
                //定义列 宽度 以及在json中的列名
                "aoColumns": [
                    {"data": null, "defaultContent":"",'sClass':"autoWidth center",
                        "render":function(data, type, row, meta) {
                            var inputType = multiple?"checkbox":"radio";
                            return "<input type='"+inputType+"' class='i-checks' name='id' value='"+row.id+"' data-name='"+data.name+"' data-row='"+JSON.stringify(row)+"'>"
                        }
                    },
                    {"data": "loginName", "width": "auto",'sClass':"center loginName"},
                    {"data": "name", "width": "auto",'sClass':"center name"},
                    {"data": "phone", "width": "auto",'sClass':"center"},
                    {"data": "mobile", "width": "auto",'sClass':"center"}
                ]
            });
            renderIChecks();
            if(defaultVals){
                var valueArr=[], param='id';
                if(Object.prototype.toString.call(defaultVals) === '[object Array]'){
                    valueArr = defaultVals;
                }
                else if(typeof(defaultVals) == 'object'){
                    valueArr = (defaultVals.value||'').split(',');
                    param = defaultVals.prop||'id';
                }else{
                    valueArr = defaultVals.split(',');
                }
                Validator.setCheckboxValue(param, valueArr.join(','));
            }
        }
    });

    //绑定事件：选择公司
    $('#companyName').on('dblclick',selCompany);
    $('#companyButton').on('click',selCompany);
    //绑定事件：选择部门
    $('#officeName').on('dblclick',selOffice);
    $('#officeButton').on('click',selOffice);

    //选择公司
    function selCompany(){
        var options = {defaultVals: $('#parentId').val()};//配置选中的值
        Bus.openOrgSelect('选择公司',{type:'1'},options,function(selResult, layIdx, layero){
            $('#companyId').val(selResult.id);
            $('#companyName').val(selResult.name);
            return true;
        },function(){
            $('#companyId').val('');
            $('#companyName').val('');
        });
    }
    //选择部门
    function selOffice(){
        var options =  {
            defaultVals: $('#parentId').val(),  //配置默认选中的值
            noRoot: true
        };
        var data = {companyId:$('#companyId').val() };
        Bus.openOrgSelect('选择公司',data,options,function(selResult, layIdx, layero){
            var nodes = selResult.nodes;
            if(nodes && nodes.length){
                for(var i=0; i<nodes.length; i++){
                    if(nodes[i].type==0 || nodes[i].type==1){//集团、公司
                        Mom.layMsg("只能选择部门");
                        return false;
                    }
                }
            }
            $('#officeId').val(selResult.id);
            $('#officeName').val(selResult.name);
            return true;
        },function(){
            $('#officeId').val('');
            $('#officeName').val('');
        });
    }

    //获取选中的数据
    window.getCheckValues = function(){
        var ids=[], names=[], selRows=[], success=true;
        $("#datainner tr td .i-checks").each(function (index,item) {
            if($(item).is(":checked")) {
                ids.push($(item).val());
                names.push($(item).attr('data-name'));
                var dataRowStr = $(this).attr('data-row');
                var jsonData = $.parseJSON(dataRowStr);
                selRows.push(jsonData);
            }
        });
        if(ids.length == 0){
            success = false;
            Mom.layMsg('请选择数据');
        }
        return {
            success: success,
            id: ids.join(",").replace(/u_/ig, ""),
            name: names.join(","),
            selRows: selRows
        };
    }

});