/**
 * 业务工具类，命名空间为Bus
 * @see 使用方法：Bus.windowOpen()
 * @type {Function}
 * @Auth Qiyh
 * @Date 2018-6-01
 */
var Bus = window.Bus || (function() {
    // 打开一个新模态窗口
    var windowOpen = function(url, name, width, height){
        var top=parseInt((window.screen.height-height)/2,10),left=parseInt((window.screen.width-width)/2,10);
        var options="location=no,menubar=no,toolbar=no,dependent=yes,minimizable=no,modal=yes,alwaysRaised=yes,"+
                "resizable=yes,scrollbars=yes,"+"width="+width+",height="+height+",top="+top+",left="+left;
        if(window.showModalDialog) {
            window.showModalDialog(url, name, options);
        }else{
            // 在Chrome中弹出窗口不论想要设定宽高或位置中的一个或几个值,都必须将他们全部赋值,否则都将不起作用。
            if(width&&height){ //新窗口
                window.open(url, name, options);
            }else{  //新页签
                window.open(url, name)
            }
        }
    };

	//打开一个新窗口，支持json格式参数
    var windowOpenPost = function(url, params, target){
        var tempform = document.createElement("form");
        tempform.action = url;
        tempform.method = "post";
        tempform.style.display="none";
        if(target) {
            tempform.target = target;
        };
        if(params){
            for (var x in params) {
                var opt = document.createElement("input");
                opt.name = x;
                opt.value = params[x];
                tempform.appendChild(opt);
            }
        }
        // var opt = document.createElement("button");
        // opt.type = "submit";
        // tempform.appendChild(opt);
        document.body.appendChild(tempform);
        tempform.submit();
        document.body.removeChild(tempform);
    };

    /**
     * 打开页签窗口
     * @param {*} title 
     * @param {*} url 
     * @param {*} isNew 
     */
    var openTab = function(title, url, isNew){
        if(Mom.crossOrigin){
            if(isNew){
                window.open(url);
            }else{
                location.href = url;
            }
            return;
        }
        Mom.top().TabsNav.openTab(title, url, isNew);
    };

    var openDialog = function(title, url, width, height, btnFns){
        if(undefined==width || width==''){
            width = '800px';
        }
        if(undefined==height || height==''){
            height = '500px';
        }
        var btnArr = [];
        if(btnFns){
            if(Object.prototype.toString.call(btnFns) === '[object Array]'){
                btnArr = btnFns;
            }else {
                btnArr.push({ btn: '确定', fn: btnFns });
            }
        }
        var options = {
            btnArr : btnArr
        };
        return openDialogCfg(title, url, width, height, options);
    };

    /** 
	 * 打开layer窗口，含‘确定’按钮
     * @param title
     * @param url
     * @param width
     * @param height
     * @param callback(index,layero): return false时不会自动关闭窗口，需手动使用top.layer.close(index);关闭
     * @returns {*}
     */
    var openEditDialog = function(title, url, width, height, btnFns){
        if(title==null || title==''){
            title = '修改';
        }
        var layIndex=openDialog(title, url, width, height, btnFns || function(layerIdx,layero){
            var p_ = Mom.top();//window.parent?window.parent:top;
            var iframeBody = p_.layer.getChildFrame('body', layerIdx);
            var iframeWin = layero.find('iframe')[0].contentWindow; //得到iframe页的窗口对象，执行iframe页的方法：iframeWin.method();
            var flag_ = false;
            try{
                //默认回调父窗口的doSubmit()方法
                flag_=iframeWin.doSubmit(layerIdx, layero);
				console.warn("%cYou need to customize a callback function instead of using the default: %cdoSubmit()","color:red;font-size:16px","color:blue");
            }catch(e){window.alert(e.message);}
            return flag_;
            // return false;
        });
        return layIndex;
    };
    /**
     * 弹出侧边栏窗口
     */
    var openSideWin = function(title, url, width, shade, btnFns, layOptions) {
        var offsetTop = 71; //距离顶部
        var offsetLeft = $(body).outerWidth(true) - Number(String(width).replace('px',''));
        var height = ($(body).outerHeight(true) - offsetTop-1) + 'px';
        var btnArr = [];
        if(btnFns){
            if(Object.prototype.toString.call(btnFns) === '[object Array]'){
                btnArr = btnFns;
            }else {
                btnArr.push({ btn: '确定', fn: btnFns });
            }
        }
        var opsions = {
            btnAlign: 'c'
            ,closeBtn: title!=null?1:0
            ,shade: shade
            ,shadeClose: false
            ,maxmin: false
            ,move: false
            ,anim: 2 //0~6
            ,skin: ''
            ,offset: [offsetTop+'px', offsetLeft+'px']
            ,btnArr: btnArr
        };
        if(layOptions){
            opsions = $.extend(true, {}, opsions, layOptions);
        }
        return openDialogCfg(title, url, width, height, opsions);
    }

	/**
	 * 打开layer窗口（高级）
	 * options：原生layer配置参数
	**/
    var openDialogCfg = function(title, url, width, height, options){
        options = options||{};
        var p_ = options._target || Mom.top();
        var config = {
            type: 2,
            area: [width, height],
            title: title!=null?title:false,
            maxmin: true, //开启最大化最小化开关
            content: url,
            skin: Const.layerSkin() || '',
            btn: []
        };
        //close-btn
        var appendCloseBtn=true;
        var btnArr_=[];
        // $.isEmptyObject(options)  判断是否是空对象  返回值：true(空对象) | false(非空对象)
        if($.isEmptyObject(options) == false){
            config = $.extend(true,{},config,options);
            //获取按钮数组对象
            if(options.btnArr && options.btnArr.length>0){
                btnArr_ = options.btnArr.concat();
            }
            else if(options.btnArr === false){
                appendCloseBtn = false;
            }
        }
        if(config.type =='2'){
            config.success = config.success || function(layero, index){
                //得到iframe页的窗口对象，执行iframe页的方法：iframeWin.method();
                //var iframeWin = p_.window[layero.find('iframe')[0]['name']];//外部窗口
                var iframeWin = layero.find('iframe')[0].contentWindow; //内部窗口
                //自动高度
                if(height=='auto'){
                    p_.layer.iframeAuto(index);
                }
                //加载完成后设置内部的关闭按钮
                $('.closeBtn',iframeWin.document).each(function(i,o){
                    var closeBtnStr = $(o).prop("outerHTML");
                    var _fun = closeBtnStr.match(/\([^\)]*\)/g);
                    if(_fun==null || _fun=='()'){
                        $(o).unbind("click").click(function(){p_.layer.close(index);return false;});
                    }
                });
            };
        }

		if(appendCloseBtn){
			$(btnArr_).each(function(i,o){
				if(o.cancel==true){
					o.btn = o.btn||'关闭';
					appendCloseBtn = false;
				}
			});
			if(appendCloseBtn == true){
				btnArr_.push({ btn:'关闭'});
			}
		}
        $(btnArr_).each(function(i,o){
            config.btn.push(o.btn);
            config['btn'+(i+1)]=function(index, layero){
                var fn = o.fn;
                if(fn){
                    var iframeWin = window;
                    if(config.type == '2'){
                        iframeWin = layero.find('iframe')[0].contentWindow; //内部窗口
                    }
                    if(typeof fn == 'string'){
                        fn = iframeWin[fn];
                    }
                    var flag = fn(index, layero);
                    if(flag == false){
                        return false;
                    }else{
                        setTimeout(function(){p_.layer.close(index)}, 200);//延时0.1秒，对应360 7.1版本bug
                    }
                }else{
                    p_.layer.close(index);
                }
            };
        });
        var layIndex=p_.layer.open(config);
        return layIndex;
    };

    /**
     * 打开选择机构窗口
     * @param title 标题
     * @param data 获取机构传参
     * @param options  详细参数项请参考openTreeSelect方法中的options
     * @param okFn  "确定"按钮的回调函数
     * @param clearFn "清空"按钮的回调函数。即当参数是函数时将显示"清空"按钮
     */
    var openOrgSelect = function(title, data, options, okFn, clearFn){
        var apiCfg = { url: Const.admin+'/api/sys/SysOrg/orgTree', data: data||{} };
        return openTreeSelect(title||'选择机构', apiCfg, options, okFn, clearFn);
    };

    /**
     * 打开树选择窗口，支持弹出框选择树
     * @param title[必填]：标题
     * @param apiCfg[必填]：获取tree参数对象{url:'',data:{}}
     * @param options[必填]：参考@see openTreeDataSelect
     */
    var openTreeSelect = function(title, apiCfg, options, okFn, clearFn){
        var url = apiCfg.url,
            data = apiCfg.data||{},
            contentType = apiCfg.contentType;
        if(contentType == 'Json'){
            data = JSON.stringify(data);
        }else{
            contentType = 'Form';
        }
        if(url){
            Api['ajax'+contentType](url, data, function(result){
                if(result.success){
                    openTreeDataSelect(title, result.rows, options, okFn, clearFn);
                }else{
                    Mom.layAlert(result.message);
                }
            });
        }else{
            Mom.layAlert('url不能为空');
        }
    };

    /**
     * 打开树选择窗口，支持弹出框选择树
     * @param title[必填]：标题
     * @param rows[必填]：tree结构数据
     * @param options[必填]：树选择配置参数对象
     *      {
     *          width[非必填]：弹出框的宽度（默认300px）
     *          height[非必填]：弹出框高度（默认424px）
     *          htmlUrl[非必填]：要打开的树选择的html
     *          defaultVals[非必填]：默认值对象{value:'',prop:''}（值和字段）
     *          multiple[非必填]：是否多选（true/false） 默认值：false
     *          noRoot[非必填]：不能选择根节点吗？（true/false）默认值：false
     *          onlyLeaf[非必填]：是否只能选择叶子节点（true/false） 默认值：false
     *          showSearch[非必填]：是否显示搜索框（true/false）
     *          saveApi: {
     *              url: 保存（新增、编辑节点）接口地址,
     *              contentType: 'Form'/'Json'
     *          },
     *          deleteApi: {
     *              url: 删除节点接口地址
     *              contentType: 'Form'/'Json'
     *          },
     *          setting:[非必填]：参照ztree官方api的setting配置
     *      }
     * @param okFn[必填]：点‘确定’的回调函数，返回选中的值
     * @param clearFn[非必填]： 无此参数时，不显示"清空"按钮。
     */
    var openTreeDataSelect = function(title, rows, options, okFn, clearFn){
        var win = Mom.top();
        var btnArr = ['确定'];
        if(clearFn){
            btnArr.push('清空');
        }
        btnArr.push('关闭');
        var width = options.width||'300px', height = options.height||'424px';
        var htmlUrl = options.htmlUrl||(cdnDomain+'/pages/common/treeSelect.html');
        var param = {
            multiple: options.multiple==undefined?false:options.multiple,
            noRoot: options.noRoot==undefined?false:options.noRoot,
            onlyLeaf: options.onlyLeaf==undefined?false:options.onlyLeaf,
            showSearch: options.showSearch==undefined?true:options.showSearch
        };
        var layerCfg = {
            type: 2,
            btn: btnArr,
            maxmin: false, //开启最大化最小化按钮
            shade: [0.4, '#000'], //0.4透明度的白色背景
            title: title||'请选择',
            skin:Const.layerSkin() || '',
            area: [width, height],
            content: Mom.extractUrl(htmlUrl,param),
            success: function(layero, index){
                var iframeWin = layero.find('iframe')[0].contentWindow;
                //使用url调接口渲染ztree（已过期，替换为在外层自行调用接口后直接用数据渲染ztree）
                // iframeWin.setConfig(apiCfg.url, apiCfg.data, options.defaultVals||'', options.setting, options.saveApi||{}, options.deleteApi||{});
                //使用已有数据渲染ztree
                iframeWin.setConfigData(rows, options.defaultVals||'', options.setting, options.saveApi||{}, options.deleteApi||{});
                iframeWin.load();
            },
            yes:function (layIdx,layero) {
                var iframeWin = layero.find('iframe')[0].contentWindow;
                var selResult=iframeWin.getCheckValues();//在layer中运行当前弹出页内的getSelectVal方法
                if(selResult.success){
                    var ret = true;
                    if(okFn){
                        //如果有‘确定’的回调函数，则执行自定义回调函数
                        //其他一些自定义校验也可以放在回调函数中，不满足条件返回false即可
                        ret = okFn(selResult, layIdx, layero);
                    }
                    if(ret){
                        win.layer.close(layIdx);
                    }
                }
            }
        };
        if(clearFn){
            layerCfg.btn2 = function(layIdx, layero){
                clearFn(layIdx, layero);
                return true;//关闭
            }
        }
        return win.layer.open(layerCfg);
    };

    /**
     * 用户选择窗口（列表方式）
     * @param title：标题
     * @param apiCfg：可为空，查询用户接口对象{url:'',data:{}}，默认为:Const.admin+"/api/sys/SysUser/page"
     * @param options：可为空，配置项（宽度、高度、默认值、layer配置项可参考layer的api）
     * @param okFn：点击确定按钮回调函数，参数：selResult, layIdx, layero
     * @param clearFn：可为空，点击清空回调函数，为空时不显示清空按钮
     */
    var openSelUserWin = function(title, apiCfg, options, okFn, clearFn){
        var win = Mom.top();
        var btnArr = ['确定'];
        if(clearFn){
            btnArr.push('清空');
        }
        btnArr.push('关闭');
        var width = options.width||'840px', height = options.height||'600px';
        var htmlUrl = options.htmlUrl||(cdnDomain+'/pages/common/userSelect.html');
        var param = {
            multiple: options.multiple==undefined?false:options.multiple
        };
        $.extend(apiCfg||{},{
            url:Const.admin+"/api/sys/SysUser/page", data:{}
        });
        var layerCfg = {
            type: 2,
            btn: btnArr,
            maxmin: false, //开启最大化最小化按钮
            shade: [0.4, '#000'], //0.4透明度的白色背景
            title: title||'选择用户',
            area: [width, height],
            skin:Const.layerSkin() || '',
            content: Mom.extractUrl(htmlUrl, param),
            success: function(layero, index){
                var iframeWin = layero.find('iframe')[0].contentWindow;
                iframeWin.setConfig(apiCfg.url, apiCfg.data, options.defaultVals||'');
                iframeWin.load();
            },
            yes:function (layIdx,layero) {
                var iframeWin = layero.find('iframe')[0].contentWindow;
                var selResult=iframeWin.getCheckValues();//在layer中运行当前弹出页内的getSelectVal方法
                if(selResult.success){
                    var ret = true;
                    if(okFn){
                        //如果有‘确定’的回调函数，则执行自定义回调函数
                        //其他一些自定义校验也可以放在回调函数中，不满足条件返回false即可
                        ret = okFn(selResult, layIdx, layero);
                    }
                    if(ret){
                        win.layer.close(layIdx);
                    }
                }
            }
        };
        if(clearFn){
            layerCfg.btn2 = function(layIdx, layero){
                clearFn(layIdx, layero);
                return true;//关闭
            }
        }
        return win.layer.open(layerCfg);
    };

    /**
     * 用户选择2（机构树方式）
     * @param title: 标题
     * @param multiple: 是否多选
     * @param checkedVals: 默认选中值
     * @param okFn：点击确定按钮回调函数，参数：selResult, layIdx, layero
     * @param clearFn：可为空，点击清空回调函数，为空时不显示清空按钮
     */
    var openSelUserWin2 = function(title, multiple, checkedVals, okFn, clearFn){
        multiple = multiple!=undefined?multiple:false;
        var options = {
            noRoot: true,
            multiple: multiple,
            defaultVals: checkedVals,
            htmlUrl: cdnDomain+'/pages/common/treeSelect.html?oper=user'
        };
        return openOrgSelect(title, {}, options, okFn, clearFn);
    };

    /**
     * 用户选择3（三个树选择方式）
     * @param title 标题
     * @param options: 配置项，包含以下：
     *          width：宽度，可为空，默认为800px
     *          height：高度，可为空，默认为545px
     *          multiple：是否允许多选(true/false)，默认为true
     *          checkType：按什么选择（0角色/1部门/2人员）默认是部门
     *          checkChange：选择类型是否可修改（true/false）,默认为true
     *          showSearch：是否显示搜索框(true/false)，默认为true
     *          html：要打开的页面，可为空，默认为:userSelect3.html
     *          orgOptions:{ //部门树配置项
     *              apiCfg: {}, //接口配置对象，包含：接口url、接口参数data、接口调用方式contentType（Json/Form）
     *              settting: {} //ztree配置项，详情参考ztree的api
     *          }
     *          waitUserOptions:{ //待选用户配置项
     *              apiCfg: {}, //接口配置对象，包含：接口url、接口参数data、接口调用方式contentType（Json/Form）
     *              settting: {} //ztree配置项，详情参考ztree的api
     *          }
     *          hasUserOptions:{ //已选用户配置项
     *              apiCfg: {}, //接口配置对象，包含：接口url、接口参数data、接口调用方式contentType（Json/Form）
     *              settting: {} //ztree配置项，详情参考ztree的api,
     *              checkDefaultVal: //默认值，可为对象、数组、字符串，默认为空
     *          }
     * @param okFn 点击确定按钮回调函数，参数：selResult, layIdx, layero
     * @param clearFn：可为空，点击清空回调函数，为空时不显示清空按钮
	 * return selResult:{
	 *	   success: true,
     *     oldValues: oldValues, //老值数组
     *     newValues: newValues, //新值数组
     *     message: '' //错误信息
	 * }
     */
    var openSelUserWin3 = function(title, options, okFn, clearFn){
        var win = Mom.top();
        var btnArr = ['确定'];
        if(clearFn){
            btnArr.push('清空');
        }
        btnArr.push('关闭');
        var width = options.width||'800px', height = options.height||'545px';
        var htmlUrl = options.htmlUrl||(cdnDomain+'/pages/common/userSelect3.html');
        var param = {
            multiple: options.multiple==undefined?true:options.multiple,
            showSearch: options.showSearch==undefined?true:options.showSearch,
            checkType: options.checkType==undefined?'0':options.checkType,
            checkChange: options.checkChange==undefined?true:options.checkChange
        };
        options.orgOptions={
            apiCfg:$.extend(true,{},{
                url: Const.admin+"/api/sys/SysOrg/orgTree",
                data: {},
                contentType: 'Json'
            },(options.orgOptions||{}).apiCfg),
            settting:(options.orgOptions||{}).settting
        };
        options.waitUserOptions={
            apiCfg:$.extend(true,{},{
                url: Const.admin+"/api/sys/SysUser/list",
                data: {},
                contentType: 'Json'
            },(options.waitUserOptions||{}).apiCfg),
            settting:(options.waitUserOptions||{}).settting
        };
        var layerCfg = {
            type: 2,
            btn: btnArr,
            maxmin: false, //开启最大化最小化按钮
            shade: [0.4, '#000'], //0.4透明度的白色背景
            title: title||'请选择',
            skin:Const.layerSkin() || '',
            area: [width, height],
            content: Mom.extractUrl(htmlUrl,param),
            success: function(layero, index){
                var iframeWin = layero.find('iframe')[0].contentWindow;
                iframeWin.setConfig(options.orgOptions, options.waitUserOptions, options.hasUserOptions);
                iframeWin.load();
            },
            yes:function (layIdx,layero) {
                var iframeWin = layero.find('iframe')[0].contentWindow;
                var selResult=iframeWin.getCheckValues();//在layer中运行当前弹出页内的getSelectVal方法
                if(selResult.success){
                    var ret = true;
                    if(okFn){
                        //如果有‘确定’的回调函数，则执行自定义回调函数
                        //其他一些自定义校验也可以放在回调函数中，不满足条件返回false即可
                        ret = okFn(selResult, layIdx, layero);
                    }
                    if(ret){
                        win.layer.close(layIdx);
                    }
                }else{
                    Mom.layMsg(selResult.message);
                }
            }
        };
        if(clearFn){
            layerCfg.btn2 = function(layIdx, layero){
                clearFn(layIdx, layero);
                return true;//关闭
            }
        }
        return win.layer.open(layerCfg);
    };

    /**
     * 选择图标
     * @param selVal
     * @param callback
     */
    var openIconSelect = function(selVal, callback){
        var win = Mom.top();
        selVal = selVal||'';
        var layerCfg = {
            type: 2,
            maxmin: true,
            title:"选择图标",
            skin:Const.layerSkin() || '',
            area: ['860px',  '70%'],
            content: cdnDomain+'/pages/common/iconSelect.html?selVal='+selVal,
            btn: ['确定', '关闭']
        };
        if(callback){
            layerCfg.yes = function(layerIdx, layero){
                var iframeWin = layero.find("iframe")[0].contentWindow;
                var selResult = $("#iconSelected", iframeWin.document).val();
                var flag = false;
                if(selResult != ''){
                    flag = callback(selResult, layerIdx, layero);
                }else{
                    Mom.layMsg('请选择图标');
                }
                if(flag){
                    win.layer.close(layerIdx);
                }
            }
        }
        return win.layer.open(layerCfg);
    };

    /**
     * 回调函数，在修改和添加时，供openEditDialog调用提交表单。
     * 注意：需要在form的action中写上提交的接口地址
     *      地址的Domain地址可以使用$Api.domain$进行定义
     *      如：action="$Const.admin$/api/User/save"
     */
    // ??  前期项目中页面"新增、编辑"保存时都需要改为回调函数方式。因为在小程序融合时是获取不到top.TabsNav方法的。
    // 没改 by lhy
    window.doSubmit = function(layerIdx, layero){
        if(!Validator.valid(document.forms[0],1.3)){
            return false;
        }
        //自定义校验
        var formObj = $('#inputForm');
        var url = formObj.attr('action');
        var formdata = formObj.serializeJSON();
        Api.ajaxJson(url,JSON.stringify(formdata),function(result){
            if(result.success == true){
                Mom.layMsg('操作成功', 1000);
                setTimeout(function(){
                    //刷新父层
                    var frameActive = Mom.top().TabsNav.getActiveTab();
                    var obj = $('#search-btn,#btn-search', frameActive[0].contentDocument);
                    if (obj.length == 0) {
                        obj = $('#refresh-btn', frameActive[0].contentDocument);
                        if (obj.length == 0) {
                            Mom.top().TabsNav.refreshActiveTab();
                        }
                    }
                    obj.trigger('click');
                    Mom.top().layer.close(layerIdx);
                },500);
            }else{
                Mom.layAlert(result.message);
            }
        });
        return false;
    };
    
    /*
     * 修改数据
     */
    var editCheckedTable = function(title,url,width,height,tableId,callbackFn){
        var idArr=[];
        $(tableId + " tbody tr").each(function(i,o){
            var firstTdInput = $(o).find('td:first input.i-checks');
            if(firstTdInput && firstTdInput.is(':checked') == true){
                var inputVal = firstTdInput.attr('id')||firstTdInput.val();
                idArr.push(inputVal)
            }
        });
        if(idArr.length != 1){
            Mom.layMsg('请选择一条数据');
            return false;
        }
        var url = Mom.extractUrl(url, "id="+idArr[0]);
        openEditDialog(title, url, width, height, callbackFn);
    };
    // 没改 by lhy
    var postFormConfirm = function(message,url,data,callbackFn,cancelFn){
        var win = Mom.top();
        Mom.layConfirm(message,function(layerIndex){
           win.layer.close(layerIndex);
            layer.close(layerIndex);
            Api.ajaxForm(url,data||{},function(result){
                if(callbackFn){
                    callbackFn(result, layerIndex, data);
                }else {
                    if (result.success == true) {
                        Mom.layMsg('操作成功');
                        //刷新父层
                        var frameActive = win.TabsNav.getActiveTab();
                        var obj = $('#search-btn,#btn-search', frameActive[0].contentDocument);
                        if (obj.length == 0) {
                            obj = $('#refresh-btn', frameActive[0].contentDocument);
                            if (obj.length == 0) {
                                win.TabsNav.refreshActiveTab();
                            }
                        }
                        obj.trigger('click');

                    }else{
                        Mom.layAlert(result.message);
                    }
                }
            });
        },cancelFn);
    };
    var deleteItem = function(message,url,data,callbackFn){
        postFormConfirm(message,url,data,callbackFn);
        return false;
    };
    // 删除多条数据
    function delCheckTable(message,url,tableId,callbackFn){
        var idArr=[];
        $(tableId + " tbody tr").each(function(i,o){
            var firstTdInput = $(o).find('td:first input.i-checks');
            if(firstTdInput && firstTdInput.is(':checked') == true){
                var inputVal = firstTdInput.attr('id')||firstTdInput.val();
                idArr.push(inputVal)
            }
        });
		if(idArr.length>0){
			var data = {
				ids:idArr.join(",")
			};
			postFormConfirm(message,url,data,callbackFn);
        }else{
            Mom.layMsg('请至少选择一条数据');
        }
    }

    //一次性传递多条数据信息  主要用与table表格中，获取tableId容器下与勾选元素的id，并将apiCfg中的信息合并之后传递给后端
    /**
     *
     * @param message  String 操作前的提示信息
     * @param apiCfg  Object  与接口相关的信息
     * @param tableId  String  容器ID
     * @param callbackFn   Function  操作成功之后的回调函数
     */
    function postCheckData(message,apiCfg,tableId,callbackFn){
        var idArr=[];
        $(tableId + " tbody tr").each(function(i,o){
            var firstTdInput = $(o).find('td:first input.i-checks');
            if(firstTdInput && firstTdInput.is(':checked') == true){
                var inputVal = firstTdInput.attr('id')||firstTdInput.val();
                idArr.push(inputVal)
            }
        });
        if(idArr.length>0){
            var data = $.extend(true,{},{
                ids:idArr.join(",")
            },apiCfg.data);
            postFormConfirm(message,apiCfg.url,data,callbackFn);
        }else{
            Mom.layMsg('请至少选择一条数据!');
        }
    }

    //获取字典标签
    var getDictLabel = function(data, value, defaultValue){
        for (var i=0; i<data.length; i++){
            var row = data[i];
            if (row.value == value){
                return row.label;
            }
        }
        if(defaultValue){
            return defaultValue;
        }
        return value;
    };

    /**
     * 动态添加Select的option
     * @param url  接口地址
     * @param appendEl  承载返回数据的容器
     * @param valueField  字段名称，默认值：value   注释：返回数据(rows)中哪个字段的值作为option的value值
     * @param textFile   字段名称，默认值：label   注释：返回数据(rows)中哪个字段的值作为option的label值
     * * @param callback (string/function) 字符串：设置select中第一个option的label值   默认值：请选择
     */
    function createSelect(url,appendEl,valueField, textFile, callback){
        $(appendEl).empty();
        var initLable = "- 请选择 -";
        if(typeof(callback) == 'string'){
            initLable = callback;//兼容老版本
        }
        $(appendEl).append('<option value="">'+initLable+'</option>');
        Api.ajaxJson(url, '{}', function(result){
            if(result.success){
                var rows = result.rows;
                appendOptionsValue($(appendEl),rows,valueField,textFile);
                if(typeof(callback) == 'function'){
                    callback($(appendEl), rows);
                }
            }else{
                Mom.layAlert(result.message);
            }
        });
    }
    // 重置select
    function resetSelect(obj, blankLabel){
        $(obj).empty();
        blankLabel = blankLabel || '-- 全部 --';
        $(obj).append("<option value=''>"+blankLabel+"</option>");
    }
    /**
     * 动态添加Select的option
     */
    function appendOptionsValue(obj, rows, valueField, textFile){
        if(typeof(obj) == "string"){
            obj = $(obj);
        }
        if(rows && rows.length > 0){
            var options = new Array();
            valueField = valueField||'value';
            textFile = textFile||'label';
            $(rows).each(function(i,o){
                options.push({'value':o[valueField], 'label':o[textFile]});
            });
            appendOptions(obj, options);
        }
    }
    // 追加select的options
    function appendOptions(obj, options){
        if(options){
            $(options).each(function(i,o){
                $(obj).append("<option value='"+o.value+"'>"+o.label+"</option>");
            });
        }
    }

    /**
     * 权限控制通用方法，若无权限则元素被隐藏
     * @param code_  鉴权类编码
     * @param arr ,格式[{}],如[{selector:'.btn-delete,code:'USER_DEL'}]
     * selector:要赋予权限的按钮，code:操作编码（操作管理页面）
     * @param permitCtrlCallback
     */
   /* function permissionContorl(code_, arr, permitCtrlCallback) {
        getOperPermit(code_, arr, function(retObj,rows){
            for (var k in retObj) {
                if(retObj[k].permit){
                    for(var j=0; j<arr.length; j++){
                        //找到与之相匹配的元素
                        if(arr[j].code == k){
                            $(arr[j].selector).removeClass('hidden').css({'display':'inline-block'});
                            // break;
                        }
                    }
                }
            }
            if(permitCtrlCallback){
                permitCtrlCallback(retObj,rows);
            }
        });
    }*/

    /**获取权限工具类*/
    /**
     * 获取用户分配的操作权限（btns权限：所有+已分配）
     * @param authClassCode 鉴权类编码
     * 此场景适用于控制页面的功能按钮，前提是功能按钮有privileges类名且最好将页面中的功能按钮都添加上privileges，以便后续删除或添加按钮权限
     * 注释：result中将返回rows与hasRows. rows:与该鉴权类编码关联的所有操作的"按钮元素"数据集合，hasRows:当前用户已分配的"按钮元素"数据集合
     */
    function getOperPermit(authClassCode){
        if($('.privileges').length){
            Api.ajaxForm(Const.admin+'/api/imp/sys/UserPermission/currentUserElements/'+authClassCode,{},function(result){
                if(result.success){
                    // $('.privileges').removeClass('privileges');
                    //显示：1.rows里没有的元素；2.hasRows存在的元素；其他都不显示
                    //1:不在rows中的要显示出来
                    // debugger
                    $('.privileges').each(function(i,o){
                        var exists = false;
                        for(var f=0; f<result.rows.length; f++){
                            if($(o).prop("outerHTML") == $(eval(result.rows[f])).prop("outerHTML")){
                                exists = true;
                                break;
                            }
                        }
                        if(!exists){
                            $(o).removeClass('privileges');
                        }
                    });
                    //2:
                    $(result.hasRows||[]).each(function(i,o){
                        // console.log(o+": "+$(eval(o)).length)
                        $(eval(o)).removeClass('privileges');
                    });
                }else{
                    Mom.layAlert(result.message)
                }
            })
        }else{
            Mom.layMsg('请在要权限控制的元素上添加privileges类名');
        }
    };

    /**
     * 获取用户的操作权限升级版 （只有已分配的可操作的集合）
     * @param authClassCode 鉴权类编码
     * @param callbackFn
     * 使用情景：对页面的非按钮元素进行权限控制时使用。如同一个form表单（a、b两个部分），A用户有权限编辑a部分的内容，其余部分只读。B用户有权编辑b部分的内容，其余部分只读。这时可以根据返回的数据利用有用字段进行内容的权限控制。
     */
    function getOperPermitPlus(authClassCode, callbackFn){
        var url = Const.admin + "/api/imp/sys/UserPermission/currentUserOperation";
        var data = {
            authClassCode: authClassCode
        };
        Api.ajaxForm(url, data ,function (result) {
            if(result.success){
                if(callbackFn){
                    callbackFn(result.rows);
                }
            }else{
                Mom.layAlert("查询属性权限失败！"+result.message)
            }
        });
    }

    /**
     * 通用获取用户的属性值（菜单、数据源）权限  （单一层级）
     * @param authClassCode   鉴权类编码
     * @param apCode   属性编码
     * @param callbackFn   返回的数据是单一层级的，即非树结构类型
     */
    function getAttrPermit(authClassCode,apCode,callbackFn){
        Api.ajaxForm(Const.admin+'/api/imp/sys/UserPermission/permissionList',{authClassCode:authClassCode,apCode:apCode},function(result){
           if(result.success){
               callbackFn(result.rows)
           }else{
               Mom.layAlert(result.message);
           }
        })
    };

    /**
     * 通用获取用户的属性值权限 （多层级结构|| 树层）
     * @param authClassCode   鉴权类编码
     * @param apCode   属性编码
     * @param callbackFn   返回的数据是树层结构
     */
    function getAtrrTreePermit(authClassCode,apCode,callbackFn){
        Api.ajaxForm(Const.admin+'/api/imp/sys/UserPermission/permissionTree',{authClassCode:authClassCode,apCode:apCode},function(result){
            if(result.success){
                callbackFn(result.rows)
            }else{
                Mom.layAlert(result.message);
            }
        })
    };


    /* function getOperPermit(authClassCode,arr,callbackFn){
         var retObj = {};
         var retCoderArr = [], operArr = [];
         $.each(arr,function(j,o){
             $(o.selector).hide();
             operArr.push(o.code);
         });
         // 20190822  最新url地址，待相关jar包更新到服务器之后方可使用
         // 新版本
         var url = Const.admin + "/api/imp/sys/UserPermission/currentUserOperation";
         // 老版本
         // var url = Const.admin + "/api/sys/SysOperation/currentUserOperation/"+code;
         Api.ajaxForm(url, {authClassCode:authClassCode} ,function (result) {
             if(result.success){
                 for(var i=0;i<result.rows.length;i++){
                     retCoderArr.push(result.rows[i].code);
                 }
                 for(var j = 0;j<operArr.length;j++){
                     var o = operArr[j], permit = false;
                     if(retCoderArr.contains(o)){
                         permit = true;
                     }
                     retObj[o] = {'permit':permit};
                     /!*retObj[o].permit = permit;
                      retObj[o] = {'permit':permit};*!/
                 }
                 if(callbackFn){
                     callbackFn(retObj,result.rows);
                 }
             }else{
                 Mom.layAlert("查询操作权限失败！"+result.message)
             }
         });
     }*/
    //设置页面为只读状态
    var setPageView = function(oper, formDom){
        if(oper == 'view'){
            if(!formDom){
                formDom = $(document.forms[0]);
            }
            $(formDom).find('input[type!=hidden],select,textarea,radio,checkbox').attr('disabled','true').addClass('disabled');
            //获取当前页面富文本元素
            var iobj = document.getElementById('ueditor_0');
            if(iobj){
                var fd = iobj.contentDocument || iobj.contentWindow.document;
                $(fd.body).attr('contenteditable','false');
            }
        }
    };

    // 获取附件后缀名
    function getAttaType(typeFull){
        if(typeFull.indexOf('image')>-1){
            return 'image';
        }
        if(typeFull.indexOf('doc')>-1 || typeFull.indexOf('docx') >-1 ){
            return 'doc';
        }
        if(typeFull.indexOf('xls')>-1 || typeFull.indexOf('xlsx') >-1 ){
            return 'xls';
        }
        if(typeFull.indexOf('ppt')>-1 || typeFull.indexOf('pptx') >-1 ){
            return 'ppt';
        }
        if(typeFull.indexOf('pdf')>-1){
            return 'pdf';
        }
        if(typeFull.indexOf('zip')>-1 || typeFull.indexOf('rar')>-1){
            return 'rar';
        }
        else if(typeFull.indexOf('audio')>-1){
            return 'audio';
        }
        else if(typeFull.indexOf('video')>-1){
            return 'video';
        }
        else if(typeFull.indexOf('txt')>-1){
            return 'txt';
        }
        return "file";
    };

    function loadSkin(skin){
        if(skin == ''){
            skin = 'default';
        }
        var skinUrl = cdnDomain+'/skin/'+skin+'/css/'+skin+'.css';
        if($('#skin').length > 0){
            var win = Mom.top();
            $('#skin').attr('href', skinUrl);
            $('#skin',win.document).attr('href', skinUrl);
            var tabs = $(".J_iframe",win.document);
            $.each(tabs,function(i,o){
                $('#skin',o.contentWindow.document).attr('href', skinUrl);
            });
        }else{
            include([
                {id:'skin', url: skinUrl}
            ]);
        }
    }

    return {
        //打开模态窗口
        windowOpen: windowOpen,
        windowOpenPost: windowOpenPost,
        openTab: openTab,
        //打开layer窗口
        openDialog: openDialog,
        openEditDialog: openEditDialog,
        openSideWin: openSideWin,
        openDialogCfg: openDialogCfg,
        //选择机构
        openOrgSelect: openOrgSelect,
        //树选择窗口
        openTreeSelect: openTreeSelect,
        openTreeDataSelect: openTreeDataSelect,
        //用户选择窗口
        openSelUserWin: openSelUserWin,
        openSelUserWin2: openSelUserWin2,
        openSelUserWin3: openSelUserWin3,
        //选择图标
        openIconSelect: openIconSelect,

        deleteItem: deleteItem,
        delCheckTable: delCheckTable,
        editCheckedTable: editCheckedTable,
        postCheckData:postCheckData,
        postFormConfirm:postFormConfirm,

        //获取字典的label
        getDictLabel: getDictLabel,

        //下拉框操作方法
        createSelect: createSelect,
        resetSelect: resetSelect,
        appendOptionsValue: appendOptionsValue,
        appendOptions: appendOptions,

		//权限控制
		// permissionContorl: permissionContorl,
        //获取操作（按钮）权限（改方法主要是对拥有privileges类型的元素进行权限控制）
        getOperPermit: getOperPermit,
        //获取操作权限升级版（可以页面中的任意DOM元素进行权限控制）
        getOperPermitPlus:getOperPermitPlus,
        // 获取用户属性值权限（单层结构）
        getAttrPermit:getAttrPermit,
        // 获取用户属性值权限（树层结构）
        getAtrrTreePermit:getAtrrTreePermit,
        /*（2）获取用户的属性值（单层，字典定制化）  属性值是从字典管理中同步时使用。
          接口地址：  Const.admin+'/api/imp/sys/UserPermission/dictList'
          参数： {authClassCode:鉴权类编码，apCode:属性编码}
        */

    //设置页面为只读状态
        setPageView:setPageView,
        // 获取附件类型
        getAttaType: getAttaType,
        //加载皮肤
        loadSkin: loadSkin

    }
})();