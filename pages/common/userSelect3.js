require([cdnDomain+'/js/zlib/app.js'], function(App) {
    //获取参数
    var multiple = Mom.getUrlParam('multiple')||'false';//是否多选
    var showSearch = Mom.getUrlParam('showSearch')||'true';//是否显示搜索框
    if(showSearch != 'true'){
        $('#has_searchText').parent().hide();
    }
    require(['ztree_my'],function(ZTree){
        /**
         * 部门
         */
        var orgTree, curClickTreeNode;
        var orgZtreeSetting = $.extend(true,{},{
            callback: {onClick: orgOnClick}
        },orgOptions.settting||{});
        var orgApiCfg = orgOptions.apiCfg||{};
        var orgConType = orgApiCfg.contentType||'Json';
        var orgData = orgApiCfg.data||{};
        var dataParam = orgConType=='Json'?JSON.stringify(orgData):orgData;
        function loadOrgData(){
            Api['ajax'+orgConType](orgApiCfg.url, dataParam, function(result){
                if (result.success) {
                    renderOrgTree(result.rows);
                } else {
                    Mom.layAlert(result.message);
                }
            });
        }
        function renderOrgTree(rows){
            var ztree1 = new ZTree();
            orgTree = ztree1.loadData($("#officeTree"),rows,false,orgZtreeSetting);
            ztree1.registerSearch(orgTree, $('#org_searchText'), 'name');
        }
        function orgOnClick(event, treeId, treeNode, clickFlag){
            if(orgTree){
                curClickTreeNode = treeNode;
                orgTree.expandNode(treeNode);
                loadWaitUserData();
            }
        }

        /**
         * 待选
         */
        var waitUserTree;
        var waitZtreeSetting = $.extend(true,{},{
            view : {
                selectedMulti: multiple == 'true'
            },
            edit: {
                enable:true, showRemoveBtn:false, showRenameBtn:false,
            },
            callback: {
                onDblClick: waitDbClick,    //双击添加到已选列表
                beforeDrop: waitBeforeDrop
            }
        },waitUserOptions.settting||{});
        function loadWaitUserData(){
            var defaultDataParam = {};
            if(curClickTreeNode){
                var treeNode=curClickTreeNode, orgId=curClickTreeNode.id;
                defaultDataParam = treeNode.type=='1'?{companyId:orgId}:{deptId:orgId};
            }else{
                return;
            }
            var waitApiCfg = waitUserOptions.apiCfg||{};
            var waitConType = waitApiCfg.contentType||'Json';
            var waitData = defaultDataParam||waitApiCfg.data||{};
            var dataParam = waitConType=='Json'?JSON.stringify(waitData):waitData;
            //获取部门下的用户
            Api['ajax'+waitConType](waitApiCfg.url, dataParam, function(result){
                if (result.success) {
                    var rows = result.rows;
                    if(curClickTreeNode){
                        $.each(rows,function(i,o){
                            o.orgId = curClickTreeNode.id;
                            o.nameLabel = o.name;
                        });
                    }
                    loadWaitUserTree(rows);
                } else {
                    Mom.layAlert(result.message);
                }
            });
        }
        //加载待选用户树
        function loadWaitUserTree(rows){
            var ztree2 = new ZTree();
            var newIds = [];//已选用户id数组
            if(hasUserTree.getNodes()){
                $.each(hasUserTree.getNodes(),function(i2,o2){
                    newIds.push(o2.id);
                });
            }
            var dataArr = [];
            //过滤掉已选用户
            $.each(rows, function(i,o){
                if($.inArray(o.id, newIds) < 0){
                    dataArr.push(o);
                }
            });
            waitUserTree = ztree2.loadData($("#userTree"),dataArr,false,waitZtreeSetting);
            ztree2.registerSearch(waitUserTree, $('#wait_searchText'), 'name');
            selectAllBtnClick();
        }
        function waitDbClick(event, treeId, treeNode, clickFlag){
            if(!treeNode) return;
            var newValues = hasUserTree.transformToArray(hasUserTree.getNodes());
            if(multiple != 'true'){
                if(newValues && newValues.length > 0){
                    Mom.layMsg('只能选择一个用户');
                    return false;
                }
            }
            var newIds = [];//已选用户id数组
            $.each(newValues,function(i2,o2){
                newIds.push(o2.id);
            });
            //如果存在则不添加
            if($.inArray(treeNode.id, newIds) > -1){
                return false;
            }
            var waitNodes = waitUserTree.transformToArray(waitUserTree.getNodes());
            waitUserTree.removeNode(treeNode);
            hasUserTree.addNodes(null, treeNode);
            newValues.push(treeNode);
            changeNodata(waitNodes.length-1, "#userTree");
            changeNodata(newValues.length, "#selectedTree");
            return true;
        }
        function waitBeforeDrop(treeId, treeNodes, targetNode, moveType, isCopy){
            //只能拖拽到根节点
            if(targetNode==null && treeNodes.length>0){
                for(var i=0; i<treeNodes.length; i++){
                    waitDbClick(null,treeId,treeNodes[i]);
                }
            }
            return false;
        }
        function selectAllBtnClick(){
            $('.selectAll').unbind('click').bind('click',function() {
                var showNodesArr = [];//显示的节点
                var allNodes = waitUserTree.getNodes();
                $.each(allNodes,function(i,o){
                    if(o.isHidden==null || o.isHidden==false){
                        showNodesArr.push(o);
                    }
                });
                var len = showNodesArr.length;
                if (len > 0) {
                    Mom.layConfirm('确定将（' + len + "）个用户添加到已选列表中吗?", function (layIdx, layero) {
                        for (var i = 0; i < len; i++) {
                            waitDbClick(null, 'userTree', showNodesArr[i]);
                        }
                        return true;
                    });
                }
            });
        }


        /**
         * 已选列表
         */
        var oldValues=[];
        var hasUserTree;
        var hasZtreeSetting = $.extend(true,{},{
            data: {
                key: {name: 'nameLabel'}
            },
            edit: {
                enable:true, showRemoveBtn:false, showRenameBtn:false,
                drag: {
                    isCopy:false, isMove:false  //不允许拖拽
                }
            },
            callback: {
                onDblClick: hasDbClick     //双击移除
            }
        },hasUserOptions.settting||{});
        var hasApiCfg = $.extend(true,{},{
            url: '',
            data: {},
            contentType: 'Json'
        },hasUserOptions.apiCfg||{});
        var defaultVals = hasUserOptions.checkDefaultVal;
        var hasConType = hasApiCfg.contentType||'Json';
        var hasData = hasApiCfg.data||{};
        var dataParam = hasConType=='Json'?JSON.stringify(hasData):hasData;
        function loadHasUserData(loadOrgFlag) {
            var defaultValArr=[], oldValues=[];
            if(defaultVals && defaultVals!=''){
                //格式：[{id:1,name:'zhangsan'},{id:2,name:'lisi'}]
                if(Object.prototype.toString.call(defaultVals) === '[object Array]'){
                    defaultValArr = defaultVals;
                }
                //格式：{id:1,name:'zhangsan'}
                else if(typeof(defaultVals) == 'object'){
                    if(defaultVals.id){
                        defaultValArr = [defaultVals];
                    }
                }else{
                    var defaultValArrTmp = defaultVals.split(',');
                    $.each(defaultValArrTmp, function(i,o){
                        defaultValArr.push({id:o, name:o});
                    });
                }
                loadHasUserTree(defaultValArr);
                if(loadOrgFlag==true){
                    loadOrgData();
                    // loadWaitUserData();
                }
            }
            if(hasApiCfg.url && hasApiCfg.url!='') {
                Api['ajax'+hasConType](hasApiCfg.url, dataParam, function(result){
                    if (result.success) {
                        loadHasUserTree(result.rows);
                    }else{
                        Mom.layAlert(result.message);
                    }
                    if(loadOrgFlag==true){
                        loadOrgData();
                        // loadWaitUserData();
                    }
                });
            }else if(defaultValArr.length == 0){
                loadHasUserTree([]);
                if(loadOrgFlag==true){
                    loadOrgData();
                }
			}
        }
        //加载已选择的用户树
        function loadHasUserTree(rows){
            var hasList=[];
            $.each(rows,function(i,o){
                hasList.push({
                    id: o.id,
                    name: o.name,
                    nameLabel: "<font color='red'>"+o.name+"</font>"
                });
                oldValues.push(o);
            });
            if(hasUserTree){
                hasUserTree.addNodes(null,hasList);
                changeNodata(hasList.length, "#selectedTree");
            }else{
                var ztree3 = new ZTree();
                hasUserTree = ztree3.loadData($('#selectedTree'),hasList,false,hasZtreeSetting);
                ztree3.registerSearch(hasUserTree, $('#has_searchText'), 'name');
            }
            hasRevertBtn();
        }
        function hasDbClick(event, treeId, treeNode, clickFlag){
            if(!treeNode) return;
            if(waitUserTree){
                //判断用户所属机构id是否和左侧选中的机构id相同
                if(curClickTreeNode && treeNode.orgId==curClickTreeNode.id || treeNode.orgId==undefined ){
                    waitUserTree.addNodes(null,[treeNode]);
                }
                var waitNodes = waitUserTree.transformToArray(waitUserTree.getNodes());
                changeNodata(waitNodes.length, "#userTree");
            }
            hasUserTree.removeNode(treeNode);
            var hasNodes = hasUserTree.transformToArray(hasUserTree.getNodes());
            changeNodata(hasNodes.length, "#selectedTree");
        }
        function hasRevertBtn(){
            $('.hasRevertBtn').unbind('click').bind('click',function(){
                Mom.layConfirm('所做的人员调整将被还原<br>确定继续吗?',function(layIdx, layero){
                    var nodes = hasUserTree.transformToArray(hasUserTree.getNodes());
                    $.each(nodes,function(i,o){
                        hasUserTree.removeNode(o);
                    });
                    loadHasUserData(false);
                    loadWaitUserData();
                    return true;
                });
            });
        }


        /**
         * 在外部获取选中的值
         */
        window.getCheckValues = function() {
            var newValues = hasUserTree.transformToArray(hasUserTree.getNodes());
            if(newValues.length == 0){
                Mom.layMsg('请选择用户');
                return {
                    success: false,
                    message: '请选择用户'
                }
            }
            else if(newValues.length > 1){
                if(multiple != 'true'){
                    Mom.layMsg('只能选择一个用户');
                    return {
                        success: false,
                        message: '只能选择一个用户'
                    }
                }
            }
            //判断已选用户是否有变化
            if(oldValues.length == newValues.length){
                var oldIds=[];
                $.each(oldValues,function(i,o){
                    oldIds.push(o.id);
                });
                //如果新选择的值都在oldIds（初始值）中存在，说明没有变化
                var existLen = 0;
                for(var i=0; i<newValues.length; i++){
                    if($.inArray(newValues[i].id, oldIds) > -1){
                        existLen ++;
                    }
                }
                if(existLen == oldValues.length){
                    return {
                        success: false,
                        oldValues: oldValues,
                        newValues: newValues,
                        message: '选择的用户没有发生变化'
                    }
                }
            }
            return {
                success: true,
                oldValues: oldValues,
                newValues: newValues,
                message: ''
            }
        };
        function changeNodata(dataLen,domId) {
            if(dataLen>0){
                $(domId).find('.nodata').hide();
            }else{
                $(domId).find('.nodata').show();
            }
        }


        //立即执行：加载已选人员数据
        loadHasUserData(true);



    });
});