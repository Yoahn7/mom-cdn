require([cdnDomain+'/js/zlib/app.js'], function(App) {
    var PageModule = {
        init: function(){
            require(['artTemplate'],function (template) {
                template.config("escape",false);
                Api.ajaxForm('/fapp_main/static/json/version.json',{},function(result){
                    var data={
                        list: result.rows
                    };
                    var htmlDom = template("versionTpl", data);
                    $('#version-con').html(htmlDom);
                });
            })
        },
    };
    $(function(){
        PageModule.init();
    });
});