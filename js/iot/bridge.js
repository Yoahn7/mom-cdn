require([cdnDomain+'/js/zlib/app.js'], function(App) {
        $(function(){
            var iotToken = Mom.getUrlParam('token');
                    var userId = Mom.getUrlParam('userid');
                    var bearerToken = "Bearer "+iotToken;
                    var userToken = sessionStorage.getItem(userId);
                    if( !userToken ){
                            iotToMesAuthorization(iotToken);
                    }
                    /**
                     * IOT==>>MES系统token转换
                     * @param {} token 
                     */
                    function iotToMesAuthorization(token){
                            var oauthThrdConvertUrl = Const.admin+"/oauth/thrdConvert";
                            oauthThrdConvertUrl = oauthThrdConvertUrl +"?__Token="+token+"&plType="+"IOT";
                            $.ajax({
                                      url :oauthThrdConvertUrl,
                                      type : "POST",
                                    dataType: "json",
                                    async: false,
                                      contentType: "application/json;charset=utf-8",
                                      success : function(result) {
                                                    if(true == result.success){
                                                            sessionStorage.setItem("userInfo",JSON.stringify(result.user));
                                                            sessionStorage.setItem(Const.authorization, result.accessToken);
                                                            sessionStorage.setItem(Const.tokenType, result.tokenType);
                                                            sessionStorage.setItem(userId,iotToken);
                                                            sessionStorage.setItem("plTypeFlag","IOT");
                                                    }else{
                                                            alert("平台账号没有同步");
                                                    }
                                      },
                                      error:function(msg){
                                                    alert("平台账号没有同步错误");
                                      }
                            })
                    }
        });
    
    });