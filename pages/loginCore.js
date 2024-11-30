require([cdnDomain+'/js/zlib/app.js'], function(App) {
    $('#loginPage').attr('src', window.baseStatic+Const.loginUrl);

    window.doLoginSubmit = function(win, data, callFn){
        Api.ajaxJson(Const.admin+"/oauth/token", data, function(result) {
            Mom.setCookie('rememberMe',$('#rememberMe',win.document).is(':checked'));
            var remMeState = $('#rememberMe',win.document).is(':checked');
            if (result.success == true) {
                sessionStorage.setItem("userInfo",JSON.stringify(result.user));
                sessionStorage.setItem(Const.authorization, result.accessToken);
                sessionStorage.setItem(Const.tokenType, result.tokenType);
                token = $.trim( result.tokenType + ' '+result.accessToken);
                if(remMeState == true){ //勾选"记住我"状态
                    token = $.trim( result.tokenType + ' '+result.accessToken);
                    Mom.setCookie(Const.authorization, result.accessToken,result.tokenExpire);
                    Mom.setCookie(Const.tokenType, result.tokenType,result.tokenExpire);
                }
                Mom.top().location.href = Mom.basePath+"/index.html";
            } else {
                Mom.setCookie(Const.authorization, '');
                Mom.setCookie(Const.tokenType, '');
                sessionStorage.clear();
                $(".login-error",win.document).empty().fadeIn(1000).html(result.message);
                if(result.retCode=='-4001'){
                    Mom.layAlert(result.message,0,function(){
                        Mom.top().location.href = "/fapp_imp_sys/static/pages/licence/licence.html";
                    })
                }
            }
            if(callFn){
                callFn(result);
            }
        },null,false);
    }
});

