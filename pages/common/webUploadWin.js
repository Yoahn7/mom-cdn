require([cdnDomain+'/js/zlib/app.js'], function (App) {
    var PageModule = {
        init:function(){
            require(['webUploader_my'],function(uploader){
                uploader.init();
            })
        }
    };
    $(function(){
        if($('#fileUploadWin').length > 0){
            PageModule.init();
        }
    });

});