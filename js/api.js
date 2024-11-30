/**
 * 接口配置文件，提交svn时请勿修改
 * @auth: qiyh
 */
var Api = window.Api || (function() {
    var devMode = false; //开发模式
    var loadIndexCount=0;
    var loadIndexLast;
    var Crypto;
    /**
     * 传参类型为：application/json
     * @param url   地址
     * @param data  参数, 需要JSON.stringfy包装
     * @param okFun 请求成功时回调函数
     * @param errorFn 请求失败时回调函数
     * @param checkUser 是否检查登录用户，默认为true
     * 地址的Domain地址可以使用$Api.domain$进行定义
     *      如："$Const.admin$/api/User/save"
     */
    jQuery.support.cors = true;
    var ajaxJson = function(url, data, okFun,errorFn,checkUser, loading){
        var apiCfg = {
            url: url,
            data: data||'{}',
            contentType: 'Json',
            checkUser: checkUser
        };
        ajaxAdvance(apiCfg, okFun, errorFn, loading);
    };

    /**
     * 传参类型为：x-www-form-urlencoded
     * @param url   地址
     * @param data  参数
     * @param okFun 请求成功时回调函数
     * @param errorFn 请求失败时回调函数
     * @param checkUser 是否检查登录用户，默认为true
     * 地址的Domain地址可以使用$Api.domain$进行定义
     *      如：action="$Const.admin$/api/User/save"
     */
    var ajaxForm = function(url, data, okFun, errorFn, checkUser, loading){  //传送的参数是string时
        var apiCfg = {
            url: url,
            data: data||{},
            contentType: 'Form',
            checkUser: checkUser
        };
        ajaxAdvance(apiCfg, okFun, errorFn, loading);
    };

    /**
     * 调用接口高级定制版
     * @param apiCfg 接口相关配置：
     *      url: |string| 接口地址
     *      data: |json| 接口参数
     *      contentType: [string] 接口请求方式，默认为Json（Json/Form）
     *      checkUser: [bool] 是否校验登录用户，默认为true,
     *      async: 是否异步调用（默认为true）
     * @param okFun：接口调用成功时的回调
     * @param [errorFn]：接口调用失败的回调，默认为空
     * @param [loading]：|bool|是否显示loading效果，默认为true
     */
    var ajaxAdvance = function(apiCfg,okFun,errorFn,loading){
        var url = apiCfg.url, data=apiCfg.data, contentType=apiCfg.contentType;
        var authInfo = Mom.getAuthInfo();
        var win= Mom.top();//window
        var __noauth = Mom.getUrlParam('__noauth', url);
        if(__noauth){//如果url上有__noauth则优先选择
            apiCfg.checkUser = __noauth=='false';
        }
        if(apiCfg.checkUser==undefined || apiCfg.checkUser==true){
            if(authInfo == "" ) {
                var checkAlertKey = 'checkAlert_'+win.location.href.substr(win.location.href.lastIndexOf('/')+1);
                var checkAlert = Mom.getCookie(checkAlertKey)||'';
                if(checkAlert==''){
                    checkAlert = 0;
                }
                if(checkAlert === 0){
                    Mom.setCookie(checkAlertKey, checkAlert+1);
                    alert('未登录或登录超时。请重新登录，谢谢！');
                }else{
                    console.error('token已失效!');
                }
				Mom.top().location.href = Mom.basePath+"/login.html";
                return;
            }
        }
        if(url && url.length>0){
            url = Mom.resolveUrl(url);
        }
        // 20190618 演示账号功能start
        var loginName = Mom.getAuthInfo("loginName");
        if(loginName =='demo1') {
            var operDeinedArr = ['delete', 'save', 'resetPassword', 'updatePassword', 'addTempDetail','delTempDetail', 'ajaxSaveDist', 'addUser', 'saveGroupTile', 'ajaxSave','del/','addApp'];
            for(var i=0; i<operDeinedArr.length; i++){
                if (url.indexOf(operDeinedArr[i]) > -1) {
                    Mom.layMsg('演示账号，禁止操作！');
                    return false;
                }
            }
        }
        // 20190618 演示账号功能end

        if(Crypto){
            doAjax({
                headers: {
                    Authorization: authInfo
                },
                url: url,
                data: data,
                contentType: contentType,
                async: apiCfg.async
            },okFun,errorFn,loading);
        }else{
            require([cdnDomain+'/js/plugins/crypto/crypto-my.min.js'], function(CryptoMy_) {
                Crypto = CryptoMy_;
                doAjax({
                    headers: {
                        Authorization: authInfo
                    },
                    url: url,
                    data: data,
                    contentType: contentType,
                    async: apiCfg.async
                },okFun,errorFn,loading);
            });
        }
    };
    /**
     * 在线api。需要先在‘在线api’模块中添加
     * @param contentType
     * @param apiCode 支持斜杠:/
     * @param data
     * @param okFun
     * @param errorFn
     */
    var webApi = function(contentType,apiCode,data,okFun,errorFn){
        if(apiCode){
			//apiCode = encodeURIComponent(apiCode);
            ajaxForm(Const.admin+'/api/sys/WebapiInfo/call/'+contentType+'/'+apiCode,data,okFun,errorFn,false);
        }
    };

    var doAjax = function(options, okFun, errorFn, loading){
        var reqType = 'post';
        var url = options.url ||'';
        if(url.toLowerCase().endWith('\\.json')){
            reqType = 'get';
        }
        if(devMode) console.log("发起ajaxForm请求：", url, '参数：',data);
        if(loading==undefined)loading=true;
        if(loading){
            var win= Mom.top();//window
            loadIndexLast = win.layer.load(1);
            loadIndexCount++;
        }
        var opt = $.extend(true,{},{
            headers:{
                Accept: "application/json; charset=utf-8",
                Sign: Crypto.encrypt(Math.random().toString(36).substring(2)+'.'+Mom.getAuthInfo('id')+'.'+Date.now())
            },
            url: url,
            dataType: 'json',   //返回的数据类型
            type: reqType,
            // timeout: 5000,
            crossDomain: true,
            async: options.async==undefined||options.async==true,
            success: function(result){
                if(devMode) console.log("返回：",result);
                closeLoading();
                if(result.success == false){
                    // Mom.layAlert(result.message);
                    // if(result.retCode == "30009"){  //用户登录信息失效
                    //     alert('用户登录信息失效,请重新登录');
                    //     //$("#quit-btn",win.document).children("i").trigger("click");
                    //     win.location.href='../login.html';
                    //     return;
                    // }
                }
                if(okFun){
                    okFun(result);
                }
            },
            //请求完成后最终执行参数
            complete : function(XMLHttpRequest,status) {},
            error:function(e){
                console.error(e);
                closeLoading();
                if(errorFn){
                    errorFn(e);
                }else{
                    Mom.layMsg('请求服务器异常.'+(e.responseText||''));
                }
            }
        },options);
        var contentType = opt.contentType || 'Json';
        if(contentType == 'Json'){
            contentType = 'application/json';
        }else if(contentType == 'Form'){
            contentType = 'application/x-www-form-urlencoded';
        }
        opt.contentType=contentType;
        $.ajax(opt);
        // 优化：（1）loading：true时才执行下面方法。原因：如页面有两个（以上）接口（a:有loading,b:无loading），请求a、b接口且b先请求完成a未请求完成。那么b请求完成时就会执行下面方法，直接关闭a接口的loading效果。故根据接口参数loading值（true）再执行。
        function closeLoading(){
            if(loading){
                loadIndexCount--;
                if(loadIndexLast && loadIndexCount==0){
                    win.layer.close(loadIndexLast);
                }
            }
        };
    }

    return{
        //ajax请求
        ajaxJson: ajaxJson,
        ajaxForm: ajaxForm,
        ajaxAdvance: ajaxAdvance,
        webApi: webApi
    }
})();