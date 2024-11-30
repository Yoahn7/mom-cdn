/**
 * Created by mac on 18/2/9.
 * 用户校验是否登录
 */

define(['Common'],function(require){
    var tokenType = Mom.getCookie("tokenType"),
        authorization = Mom.getCookie("authorization");
    if(tokenType=null || tokenType == "" || authorization ==null || authorization == "") {
        var checkAlertKey = 'checkAlert_'+top.location.href;
        var checkAlert = Mom.getCookie(checkAlertKey)||0;
        if(checkAlert == 0){
            Mom.setCookie(checkAlertKey, checkAlert+1);
            alert('未登录或登录超时。请重新登录，谢谢！');
            top.location.href = Mom.basePath+"/login.html";
        }
    }
});
