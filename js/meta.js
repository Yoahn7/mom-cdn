var cdnDomain = '/cdnDomain';   //最新版
window.devMode = false; //开发模式
(function(){
    //获取上下文路径
    window.basePath = function(){
        var obj=window.location;
        var pathnameSplit =  obj.pathname.split("/"),
            contextPath='';
        if(obj.pathname.indexOf(cdnDomain)<0){
            if(pathnameSplit.length>1 && pathnameSplit[1].indexOf('fapp_')>-1){
                contextPath ="/"+pathnameSplit[1] ;
            }else{
                contextPath='/fapp_main';
            }
        }else{
            if(obj.pathname.indexOf(cdnDomain+'/pages/')>-1){
                contextPath='/fapp_main';
            }else{
                contextPath=cdnDomain;
            }
        }
        var path=obj.protocol+"//"+obj.host+contextPath;
        return path;
    };
    window.baseStatic = (function(){
        var bp = basePath();
        if(bp.indexOf(cdnDomain)<0){
            return bp + '/static';
        }
        return bp;
    })();
    window.getKVAttr = function(str){
        var res = new Array();
        var reg=/(\S+)\=\'(.*?)\'/g;
        var arr=reg.exec(str);
        if(arr == null){
            reg=reg=/(\S+)\=\"(.*?)\"/g; //支持双引号的属性
            arr=reg.exec(str);
        }
        var i=0;
        while(arr){
            var obj=new Object();
            obj.key=arr[1];
            obj.value=arr[2];
            res[i++]=obj;
            arr=reg.exec(str);
        }
        return res;
    };
    function resolveUrl(url, type){
        if(type == 'js'){
            if(url.toLowerCase().indexOf('.js') < 0){
                url += '.js';
            }
        }
        if(url.indexOf('/')==0 && url.indexOf(cdnDomain)<0 && url.indexOf('/fapp_')<0){
            url = window.baseStatic+url;
        }
        if(window.devMode){
            url += url.indexOf('?')<0?'?':'&';
            //开发模式，增加时间戳避免缓存
            url += Date.now().toString(36);
        }
        return url;
    }
    //引入requireJs文件
    window.includeRJ = function(js){
        js = resolveUrl(js, 'js');
        var oScript = document.createElement('script');
        oScript.type = 'text/javascript';
        oScript.src = cdnDomain+'/js/zlib/require.js';
        oScript.setAttribute("data-main",js);
        document.body.appendChild(oScript);
    };
    window.include = function(file,okFn) {
        var files = typeof file == "string" ? file.split(',') : file;
        var path = window.baseStatic;
        for (var i = 0; i < files.length; i++){
            var f = files[i];
            var url = f, id='';
            if(f instanceof Object){
                url = f.url||'', id = f.id||'';
            }
            var name = url.replace(/^\s|\s$/g, "");
            if(name.length == 0) continue;
            var ext = name.substr(name.lastIndexOf('.')+1).toLowerCase();
            var fileref;
            if(name.toLowerCase().indexOf('<meta')==0){
                var res = getKVAttr(name);
                if(0 < res.length){
                    fileref = document.createElement('meta');
                }
                for(var j=0; j<res.length; j++){
                    fileref.setAttribute(res[j].key, res[j].value);
                }
            }else if(name.toLowerCase().indexOf('<link')==0){
                var res = getKVAttr(name);
                if(0 < res.length){
                    fileref = document.createElement('link');
                }
                for(var j=0; j<res.length; j++){
                    fileref.setAttribute(res[j].key, res[j].value);
                }
            }else{
                var fullName = resolveUrl(name);
                if(ext=='css'){
                    fileref = document.createElement('link');
                    fileref.setAttribute("rel", "stylesheet");
                    fileref.setAttribute("type", "text/css");
                    fileref.setAttribute("href", fullName);
                    fileref.setAttribute("id", id);
                }
                else if(ext == 'js'){
                    fileref = document.createElement('script');
                    fileref.setAttribute("type", "text/javascript");
                    fileref.setAttribute("src", fullName);
                    fileref.setAttribute("id", id);
                }
            }
            if(fileref != null) {
                if (fileref.readyState) { // IE
                    fileref.onreadystatechange = function() {
                        if (fileref.readyState == 'loaded' || fileref.readyState == 'complete') {
                            fileref.onreadystatechange = null;
                            if(okFn) okFn();
                        }
                    };
                } else { // Others: Firefox, Safari, Chrome, and Opera
                    fileref.onload = function() {
                        if(okFn) okFn();
                    };
                }
                document.getElementsByTagName('head')[0].appendChild(fileref);
            }

            /*if(fileref){
                var head = document.getElementsByTagName('head')[0],
                    style= document.getElementsByTagName('style');
                if(style.length>0){
                    head.insertBefore(fileref,style[style.length-1]);
                }else{
                    head.appendChild(fileref);
                }
            }*/
        }
    };

    //先从cookie中获取，如果没有则从session中获取
    window.getStore = function(name){
        var val = getCookie(name) || sessionStorage.getItem(name);
        return val;
    },
    //在cookie和session中都保存
    window.setStore = function(name, value, path){
        setCookie(name, value, path);
        sessionStorage.setItem(name, value);
    },

    // // 存储cookie
    window.setCookie = function(name,value,path) {
        var Days = 365;//30天
        var exp = new Date();
        exp.setTime(exp.getTime() + Days*24*60*60*1000);
        var pathTmp = path!=undefined?path:'/';
        document.cookie=name+"="+encodeURI(value)+";expires="+exp.toGMTString()+";path="+pathTmp;
    };
    //读取cookie
    window.getCookie = function(name) {
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
        if(arr=document.cookie.match(reg)){
            return (decodeURI(arr[2]));
        }
        else{
            return '';
        }
    };

    //添加meta
    include([
        '<link rel="shortcut icon" type="image/x-icon" href="'+window.baseStatic+'/images/logo/favicon.png" media="screen" />',
        "<meta name='viewport' content='width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no' >",
        "<meta http-equiv='X-UA-Compatible' content='IE=Edge,chrome=1' >",
        "<meta http-equiv='Cache-Control' content='no-store' >",
        "<meta http-equiv='Pragma' content='no-cache' >"
    ]);
    //引入公共css
    include([
        cdnDomain+'/js/plugins/bootstrap/css/bootstrap.min.css',
        //统一引入公共字体文件 start
        cdnDomain+'/js/plugins/font-awesome/css/font-awesome.min.css',
        cdnDomain+'/css/iconFont/iconfont.css',
        cdnDomain+'/css/menuIcon/iconfont.css',
        cdnDomain+'/css/widgetFonts/iconfont.css',
        //统一引入公共字体文件 end
        cdnDomain+'/css/animate.css',
        cdnDomain+'/js/plugins/icheck/skins/flat/green.css',
        cdnDomain+'/js/plugins/layui/css/layui.css',
        cdnDomain+'/js/plugins/layui/expand/formSelects/formSelects-v4.css',
        cdnDomain+'/js/plugins/select2/dist/css/select2.min.css',
        cdnDomain+'/css/common.css',
    ]);
    // 添加jQuery
    include([cdnDomain+'/js/jquery/jquery-2.2.4.min.js'],function(){
        // loadLang(); //加载多语言
    });
    include(['/js/Constant.js'], function(){
        //设置标题
        var title = Const&&Const.projectName ? Const.projectName.replace(/<[^>]+>/g,"") : '';
        document.title = document.title.replace('{{title}}', title);
    });
    // 多语言
    function loadLang(){
        include([cdnDomain+'/js/i18n/jquery.localize.js'],function(){
            include([cdnDomain+'/js/i18n/i18n.js'],function(){
                var cookieLang = getCookie('somoveLanguage')||'';
                if(cookieLang==undefined || cookieLang==''){
                    cookieLang = navigator.language || navigator.browserLanguage;
                }
                cookieLang = cookieLang.toLowerCase();
                localize(cookieLang);
                if($('#ddlSomoveLanguage')){
                    $('#ddlSomoveLanguage').val(cookieLang);
                    // 切换语言
                    $('#ddlSomoveLanguage').change(function(){
                        cookieLang = $(this).val();
                        setCookie('somoveLanguage',cookieLang);
                        localize();
                    });
                }
                // 加载相应的语言js文件
                function localize(cookieLang){
                    var dom = document.getElementById('lang');
                    if(dom)dom.parentNode.removeChild(dom);
                    include([{id:'lang',url:'/i18n/lang/js/'+cookieLang+'.js'}],function(){
                        I18N.renderLang(cookieLang);
                    });
                }
            })
        })
    }

    //加载皮肤
    var selSkin = getStore('skin');
    if(!selSkin){
        selSkin = selSkin?selSkin:'default';
        setStore('skin', selSkin);
    }
    
    include([
        {id:'skin', url: cdnDomain+'/skin/'+selSkin+'/css/'+selSkin+'.css'}
    ]);


    //添加js 加载aa.js依赖jq.js
   /* include(['/js/jquery/jquery-2.2.4.min.js',],function(){
        include([
            '/js/aa.js'
        ]);
    });*/

})();
