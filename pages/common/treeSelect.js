require([cdnDomain+'/js/zlib/app.js'], function(App) {
    //获取参数
    var multiple = Mom.getUrlParam('multiple')||'false';//是否多选
    var noRoot = Mom.getUrlParam('noRoot')||'false';//是否不能选择根节点
    var onlyLeaf = Mom.getUrlParam('onlyLeaf')||'false';//是否只能选择叶子节点
    var contentType = Mom.getUrlParam('contentType')||'Form';//接口调用方式
    var oper = Mom.getUrlParam('oper')||''; //Bus.openSelUserWin2()
    var showSearch = Mom.getUrlParam('showSearch')||'true';//是否显示搜索框
    if(showSearch!='true' || oper=='user'){
        $('.searchGroup').hide();
    }
    //加载ztree插件
    require(['ztree_my'], function(ZTree) {
        var ztree = new ZTree();
        //调用接口渲染ztree
        window.loadDataUrl = function (url, data, defaultVals, setting) {
            if(contentType == 'Json'){
                data = JSON.stringify(data);
            }
            Api['ajax'+contentType](url, data, function (result) {
                if (result.success) {
                    renderData(result.rows, defaultVals, setting);
                } else {
                    Mom.layAlert(result.message);
                }
            });
        };
        //根据数据渲染ztree
        window.renderData = function(rows, defaultVals, setting){
            if(oper == 'user'){
                //异步获取部门下的用户
                setting = $.extend(true,{},setting||{},{
                    callback: {
                        beforeExpand: function(treeId, treeNode){
                            var treeObj = $.fn.zTree.getZTreeObj(treeId);
                            if(treeNode.type!='1'){
                                var queryUserParam = JSON.stringify({
                                    deptId: treeNode.id
                                });
                                Api.ajaxJson(Const.admin+"/api/sys/SysUser/list",queryUserParam,function(userResult){
                                    if(userResult.success){
                                        if(userResult.rows.length > 0){
                                            $.each(userResult.rows, function(i2,o2){
                                                o2.isParent = false;
                                            });
                                            treeObj.addNodes(treeNode, userResult.rows);
                                            ztree.checkDefaultVal(treeObj, defaultVals);
                                        }else{
                                            treeNode.isParent = false;
                                            treeObj.updateNode(treeNode);
                                        }
                                    }else{
                                        Mom.layAlert(userResult.message);
                                    }
                                });
                            }
                        }
                    }
                });
                if(multiple == 'false'){
                    setting.check = {
                        enable: true,
                        chkStyle: "radio"
                    }
                }
            }else{
                setting = editInit(setting);
            }
            var treeObj = ztree.loadData($('#tree'), rows, multiple, setting);
            if(oper == 'user'){
                //如果是选择用户，默认初始化加载出来的是机构不允许勾选
                var nodes = treeObj.transformToArray(treeObj.getNodes());
                for (var i=0; i<nodes.length; i++) {
                    nodes[i].isParent = true;
                    nodes[i].nocheck = true;
                    treeObj.updateNode(nodes[i]);
                }
            }
            ztree.checkDefaultVal(treeObj, defaultVals);
        };

        //获取选中的值
        window.getCheckValues = function() {
            var treeObj = ztree.treeObj;
            return ztree.getCheckValues(noRoot, onlyLeaf);
        };

        //打开节点编辑窗口
        var editInit = function(ztreeSetting){
            var editable = 0;
            var viewOption={}, editOption={}, callbackOption={};
            //可新增、编辑
            if(saveApi && saveApi.url){
                editable ++;
                $('.searchGroup').find('.btn.searchAll').css('right', '26px');
                $('.addRoot').removeClass('hide').click(function(){
                    addWin(saveApi, null, null);
                });
                viewOption.addHoverDom = function(treeId, treeNode){
                    if(treeNode.id != 0){
                        var sObj = $("#" + treeNode.tId + "_span");
                        if (treeNode.editNameFlag || $("#addBtn_"+treeNode.tId).length>0) return;
                        var addStr = "<span class='button add' id='addBtn_" + treeNode.tId + "' title='添加子级' onfocus='this.blur();'></span>";
                        sObj.after(addStr);
                        var btn = $("#addBtn_"+treeNode.tId);
                        if (btn) btn.bind("click", function(){
                            addWin(saveApi, null, treeNode);
                        });
                    }
                }
                //编辑
                editOption.enable = true;
                editOption.renameTitle = "编辑";
                editOption.showRenameBtn = function(treeId, treeNode){
                    return treeNode.id!=0;
                }
                callbackOption.beforeEditName = function(treeId, treeNode){
                    addWin(saveApi, treeNode, treeNode.getParentNode());
                    return false;
                }
            }
            //可删除
            if(deleteApi && deleteApi.url){
                editable ++;
                viewOption.removeHoverDom = function(treeId, treeNode) {
                    $("#addBtn_"+treeNode.tId).unbind().remove();
                }
                editOption.enable = true;
                editOption.removeTitle = "删除";
                editOption.showRemoveBtn = function(treeId, treeNode){
                    return treeNode.id!=0;
                }
                callbackOption.beforeRemove = function(treeId, treeNode){
                    var confirmMsg = "确认删除当前节点";
                    var nodes = treeNode.children;
                    if(nodes && nodes.length){
                        confirmMsg += "及所有子节点";
                    }
                    Mom.layConfirm(confirmMsg+"吗？",function(index, layero){
                        var delData = {
                            ids: treeNode.id
                        };
                        if(deleteApi.contentType=='Json'){
                            delData = JSON.stringify(delData);
                        }
                        Api['ajax'+deleteApi.contentType||'Form'](deleteApi.url,delData,function(result){
                            if(result.success){
                                var treeObj = $.fn.zTree.getZTreeObj(treeId);
                                treeObj.removeNode(treeNode);
                            }else{
                                Mom.layAlert(result.message);
                            }
                        });
                    });
                    return false;
                }
            }

            if(editable > 0){
                ztreeSetting = $.extend(true,{},ztreeSetting||{},{
                    view: viewOption,
                    edit: editOption,
                    callback: callbackOption
                });
            }
            return ztreeSetting;
        };
        //打开节点新增窗口
        var addWin = function(apiCfg, treeNode, parentNode){
            layer.prompt(
                {title:'维护',placeholder:'', value:treeNode?treeNode.name:''}
                ,function(value, index, elem){
                    var saveData = {
                        id: treeNode?treeNode.id:null, name: value,
                        parent: {id: parentNode?parentNode.id:null}
                    };
                    if(apiCfg.contentType=='Json'){
                        saveData = JSON.stringify(saveData);
                    }
                    Api['ajax'+apiCfg.contentType||'Form'](apiCfg.url,saveData,function(result){
                        var treeObj = $.fn.zTree.getZTreeObj("tree");
                        if(saveApi.callback){
                            saveApi.callback(result, treeObj, parentNode, treeNode);
                        }else{
                            if(treeNode){
                                //更新
                                treeNode.name = value;
                                treeObj.updateNode(treeNode);
                            }else{
                                //新增
                                var WebapiTypeTree = result.WebapiTypeTree;
                                var newNodes = [{id:WebapiTypeTree.id, name:WebapiTypeTree.name}];
                                treeObj.addNodes(parentNode, newNodes);
                            }
                        }
                    });
                    layer.close(index);
                });
        };

        //立即调用接口，加载数据
        if(url){
            loadDataUrl(url, data, defaultVals, setting);
        }
        //根据已有数据渲染ztree
        else if(rows){
            renderData(rows, defaultVals, setting);
        }
    });

});