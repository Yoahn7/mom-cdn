
/**
 * ztree自定义组件
 * 理论上支持所有用到ztree的地方，只需要传入相关配置即可，详情查看ztree的api
 * @author Qiyh
 * @date 2018-09-23
 */
define([
    'js/plugins/ztree/js/jquery.ztree.exhide.min'
],function(require, exports, module){
    /**
     * 使用同步加载依赖
     * zTree.all.js是完整的js库，可单纯加载此文件实现所有zTree功能，包含：
     * ztree.core：基本功能
     * ztree.excheck：复选功能
     * ztree.exedit：编辑功能
     */
    Mom.include('myCss_ztree', cdnDomain, [
        //'../js/plugins/ztree/css/zTreeStyle/zTreeStyle.css',
        'js/plugins/ztree/css/metroStyle/metroStyle.css'    ///metro主题
    ]);

    var ZTree = function(){
        that = this;
        this.lastValue;
        this.treeObj={};
        this.nodataHtml="<p class='nodata mgt-20'>暂无数据</p>";
        this.getNodataDom = function(ztreeDom){
            var nodataDom = $(ztreeDom).find('.nodata');
            if(nodataDom.length){
                return nodataDom;
            }
            $(ztreeDom).append(this.nodataHtml);
            return $(ztreeDom).find('.nodata');
        };

        /**
         * 使用json数据渲染ztree
         * @param ztreeDom
         * @param jsonNodes
         * @param multiple: 是否多选
         * @param settings：自定义配置，请参照ztree的api
         * @returns treeObj
         */
        this.loadData = function(ztreeDom, jsonNodes, multiple, settings){
            settings = settings ||{};
            var ztreeSt = this.ztreeSetting(multiple, settings);
            that.treeObj = $.fn.zTree.init(ztreeDom, ztreeSt, jsonNodes);
            that.getNodataDom(ztreeDom).hide();
            var keyName = 'name';
            if(jsonNodes && jsonNodes.length > 0){
                if(settings.defaultVals){
                    that.checkDefaultVal(that.treeObj,settings.defaultVals);
                }
                if(settings.data && settings.data.key){
                    keyName = settings.data.key.name;
                }
            }else{
                that.getNodataDom(ztreeDom).show();
            }
            var searchDom = settings.searchDom?settings.searchDom:'#ztree_searchText';
            that.registerSearch(that.treeObj, $(searchDom), keyName);
            return that.treeObj;
        };
        /**
         * 异步加载ztree
         * @param ztreeDom
         * @param asyncUrl：接口url:''，如果需要传参请在setting配置autoParam或otherParam，详情查看api
         * @param multiple: 是否多选
         * @param settings：自定义配置，请参照ztree的api
         * @returns treeObj
         */
        this.loadJsonAsync = function(ztreeDom, asyncUrl, multiple, settings){
            var ztreeSt = that.ztreeSettingAsync(multiple, asyncUrl, {
                async: {contentType: "application/json"}
            },settings.defaultVals);
            var keyName = 'name';
            ztreeSt = $.extend(true,{},ztreeSt,settings);
            that.treeObj = $.fn.zTree.init(ztreeDom, ztreeSt);
            if(settings){
                if(settings.defaultVals){
                    that.checkDefaultVal(that.treeObj,settings.defaultVals);
                }
                if(settings.data && settings.data.key){
                    keyName = settings.data.key.name;
                }
            }
            var searchDom = settings.searchDom?settings.searchDom:'#ztree_searchText';
            that.registerSearch(that.treeObj, $(searchDom), keyName);
            return that.treeObj;
        };
        /**
         * 异步加载ztree
         * @param ztreeDom
         * @param asyncUrl：接口url:''，如果需要传参请在setting配置autoParam或otherParam，详情查看api
         * @param multiple: 是否多选
         * @param settings：自定义配置，请参照ztree的api
         * @returns treeObj
         */
        this.loadFormAsync = function(ztreeDom, asyncUrl, multiple, settings){
            var ztreeSt = that.ztreeSettingAsync(multiple, asyncUrl, {
                async: {contentType: "application/x-www-form-urlencoded"}
            },settings.defaultVals);
            var keyName = 'name';
            ztreeSt = $.extend(true,{},ztreeSt,settings);
            that.treeObj = $.fn.zTree.init(ztreeDom, ztreeSt);
            if(settings){
                if(settings.defaultVals){
                    that.checkDefaultVal(this.treeObj,settings.defaultVals);
                }
                if(settings.data && settings.data.key){
                    keyName = settings.data.key.name;
                }
            }
            var searchDom = settings.searchDom?settings.searchDom:'#ztree_searchText';
            that.registerSearch(that.treeObj, $(searchDom), keyName);
            return that.treeObj;
        };
        /**
         * 查询/搜索节点
         * @param treeObj_
         * @param prop：字段
         * @param value：值
         */
        this.searchNodes = function(treeObj_, prop, value){
            var ztreeDom = $('#'+treeObj_.setting.treeId);
            // 如果和上次一样，就退出不查了。
            if (that.lastValue === value) {
                return;
            }
            // 保存最后一次输入的值
            that.lastValue = value;

            var nodes = treeObj_.getNodes();
            // 如果要查空字串，就退出不查了。
            if (value == "") {
                that.showNodesAndChild(treeObj_, nodes);
            }else{
                that.hideAllNodes(treeObj_, nodes);
                nodes = treeObj_.getNodesByParamFuzzy(prop, value);
            }
            if(nodes.length == 0){
                that.getNodataDom(ztreeDom).show();
            }else{
                that.getNodataDom(ztreeDom).hide();
                that.showNodesAndParent(treeObj_, nodes);
            }
        };
        //显示节点及其所有子节点
        this.showNodesAndChild = function(treeObj_, nodes){
            var nodes = treeObj_.transformToArray(nodes);
            for(var i=nodes.length-1; i>=0; i--) {
                /* if(!nodes[i].isParent){
                 treeObj_.showNode(nodes[i]);
                 }else{ */
                if(nodes[i].getParentNode()!=null){
                    treeObj_.expandNode(nodes[i],false,false,false,false);
                }else{
                    treeObj_.expandNode(nodes[i],true,true,false,false);
                }
                treeObj_.showNode(nodes[i]);
                that.showNodesAndChild(treeObj_, nodes[i].children);
                // }
            }
        };
        //显示节点及其所有父节点
        this.showNodesAndParent=function (treeObj_, nodeList) {
            treeObj_.showNodes(nodeList);
            for(var i=0, l=nodeList.length; i<l; i++) {
                //展开当前节点的父节点
                treeObj_.showNode(nodeList[i].getParentNode());
                //treeObj_.expandNode(nodeList[i].getParentNode(), true, false, false);
                //显示展开符合条件节点的父节点
                while(nodeList[i].getParentNode()!=null){
                    treeObj_.expandNode(nodeList[i].getParentNode(), true, false, false);
                    nodeList[i] = nodeList[i].getParentNode();
                    treeObj_.showNode(nodeList[i].getParentNode());
                }
                //显示根节点
                treeObj_.showNode(nodeList[i].getParentNode());
                //展开根节点
                treeObj_.expandNode(nodeList[i].getParentNode(), true, false, false);
            }
        };

        /*//递归查询当前节点下面的全部子节点（一）
        this.getNodeChildren = function (treeNode, result) {
            if(result==undefined){
                result = new Array();
            }
            //检测是否为父节点
            if (treeNode.isParent) {
                var childrenNodes = treeNode.children;//查询子节点
                if (childrenNodes.length) {
                    for (var i = 0 ; i<childrenNodes.length ; i++){
                        result.push(childrenNodes[i]);
                        that.getNodeChildren(childrenNodes[i], result);//递归调用
                    }
                }
            }
            return result;
        };*/

        //隐藏所有节点
        this.hideAllNodes = function(treeObj_, nodes){
            var nodes = treeObj_.transformToArray(nodes);
            treeObj_.hideNodes(nodes);
        };

        /**
         * ztree配置
         * @param multiple: 是否多选
         * @param settings
         * @returns
         */
        this.ztreeSetting = function(multiple, settings){
            that.multiple = multiple==true||multiple=='true';
            var setting = {
                check: {enable:that.multiple},
                view: {selectedMulti:false, dblClickExpand:false, nameIsHTML:true},
                data: { simpleData:{enable:true, idKey:'id', pIdKey:'pId'} },
                callback:{
                    beforeClick:function(treeId, node, clickFlag){
                        // treeObj = $.fn.zTree.getZTreeObj(treeId);
                        // if(that.multiple == true){
                        //     treeObj.checkNode(node, !node.checked, true, true);
                        //     return false;
                        // }
                    }
                    ,onClick:function(event, treeId, treeNode){
                        // treeObj = $.fn.zTree.getZTreeObj(treeId);
                        // treeObj.expandNode(treeNode);
                    }
                    ,onCheck: function(event, treeId, treeNode){
						var treeObj = $.fn.zTree.getZTreeObj(treeId);
						if(treeNode.checked){
							//勾选时展开当前节点
							treeObj.expandNode(treeNode, true, true, false);
						}
                        return false;
                    }
                }
            };
            if(that.multiple){
                setting.check.chkboxType = { "Y":"p", "N":"s" };
            }
            if(settings){
                setting = $.extend(true,{},setting,settings);
            }
            return setting;
        };

        /**
         * ztree异步配置
         * @param multiple: 是否多选
         * @param asyncUrl
         * @param settings
         */
        this.ztreeSettingAsync = function(multiple, asyncUrl, settings, defaultVals){
            var asyncSetting = this.ztreeSetting(multiple, {
                async: {
                    enable:true, url:asyncUrl, autoParam:["id"],
                    headers:{
                        Accept: "application/json; charset=utf-8",
                        Authorization: Mom.getAuthInfo()
                    }
                },
                callback: {
                    onAsyncSuccess: function(event, treeId, treeNode, msg){
                        var treeObj = $.fn.zTree.getZTreeObj(treeId);
                        if(treeNode){
                            var nodes = treeNode.children;
                            for (var i=0; i<nodes.length; i++) {
                                try{treeObj.checkNode(nodes[i], treeNode.checked, true);}catch(e){}
                            }
                            //展开时设置子节点选中状态
                            that.checkDefaultVal(treeObj, defaultVals);
                        }
                    }
                }
            });
            if(settings){
                asyncSetting = $.extend(true,{},asyncSetting,settings);
            }
            return asyncSetting;
        };

        this.registerSearch = function(treeObj, searchDom, prop){
            if(searchDom.length == 0){
                return;
            }
            // 注释掉by lhy 20191019   注释原因：触发keyup事件查询搜索条件时，在IE环境中常出现浏览器卡死问题。
            /* $(searchDom).keyup(function(e){
                 searchNodes(treeObj, prop, $(this).val());
             });*/
             var eleType = searchDom.prop('type')||'';
             if(eleType.toLowerCase() == 'text'){
                $(searchDom).keydown(function(e){
                    if(e.keyCode == 13) {
                        that.searchNodes(treeObj, prop, $(this).val());
                        return false;
                    }
                });
                $(searchDom).parent().find('.searchAll').click(function(){
                    that.searchNodes(treeObj, prop, $(searchDom).val());
                });
             }else{
                 $(searchDom).click(function(){
                     var val = $(searchDom).parent().find('input[type="text"]').val();
                     that.searchNodes(treeObj, prop, val);
                 });
             }
			
        };

        /**
         * 设置选中默认值
         * @param defaultVals：以下三种方式
         * （1）字符串：1,2,3  根据id匹配数据
         * （2）字符串数组：[1,2,3] 根据id匹配数据
         * （3）对象：{value:'1,2,3',prop:'id'}，根据prop匹配数据
         */
        this.checkDefaultVal = function(treeObj, defaultVals){
            if(!defaultVals)return;
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
            if(valueArr.length > 0){
                var nodeArr = [];
                for(var j=0; j<valueArr.length; j++){
                    if(0 <valueArr[j].length){
                        var nodes = treeObj.getNodesByParam(param, valueArr[j], null);
                        if(nodes.length > 0){
                            nodeArr.push(nodes[0]);
                        }
                    }
                }
                for (var i=0; i<nodeArr.length; i++) {
                    if(nodeArr[i]){
                        if(treeObj.setting.check.enable == true){
                            treeObj.checkNode(nodeArr[i], true, false);
                        }else{
                            treeObj.selectNode(nodeArr[i]);
                        }
                        treeObj.expandNode(nodeArr[i].getParentNode(), true, false, true);
                    }

                }
            }
        }

        /**
         * 在外部窗口中获取treeSelect页面选中的值
         *
         * noRoot:不能选择根节点？默认值：false （true/false）
         * onlyLeaf:是否只能选择叶子节点, 默认值：false（true/false）
         * @return:
         *    success:[boolean]成功/失败
         *    id: 选择的id，多个时用逗号隔开
         *    name: 选择的name，多个时用逗号隔开
         */
            // var treeObj;
        this.getCheckValues=function(noRoot, onlyLeaf){
                onlyLeaf = onlyLeaf==true||onlyLeaf=='true';
                noRoot = noRoot==true||noRoot=='true';

                var ids=[], names=[], selNodes=[], retNodes=[], success=true;
                if (that.treeObj.setting.check.enable == true) {
                    selNodes = that.treeObj.getCheckedNodes(true);
                } else {
                    selNodes = that.treeObj.getSelectedNodes();
                }
                for (var i = 0; i < selNodes.length; i++) {
                    var selNode = selNodes[i];
                    if (onlyLeaf == true && selNode.isParent) {
                        // 如果为复选框选择，则过滤掉父节点
                        Mom.layMsg("不能选择父节点（" + selNode.name + "）请重新选择。");
                        success=false;
                        break;
                    }
                    if (noRoot == true && selNode.level == 0) {
                        Mom.layMsg("不能选择根节点（" + selNode.name + "）请重新选择。");
                        success=false;
                        break;
                    }
                    ids.push(selNode.id);
                    names.push(selNode.name);
                    retNodes.push(selNode);
                    if (that.multiple != true) { //如果不是复选框选择，则返回第一个选择
                        break;
                    }
                }
                /*if(success && ids.length == 0){
                    Mom.layMsg("您没有选择任何数据.");
                    success = false;
                }*/
                var selResult = {
                    success: success,
                    id: ids.join(",").replace(/u_/ig, ""),
                    name: names.join(","),
                    nodes: retNodes,
                    zTreeObj: that.treeObj
                };
                console.log('选中结果：', selResult);
                return selResult;
            };
    };
    return ZTree;
});