/**
 * 工具类，命名空间为Mom
 * @see 使用方法：basePath()
 * @type {Mom|*|Function}
 * @Auth Qiyh
 * @Date 2017-12-01
 */

var Mom = window.Mom || (function() {
	//如果有iframe嵌套时获取当前域的根window
	//解决页面被其他系统嵌套时用window.top为其它项目的问题
	var top = function(){
		function getDomain(w){
			return w.location.protocol+"//"+w.location.host;
		}
		var win = window;
		var curDomain = getDomain(win);
		try{
            while(win.parent && win.location!=win.parent.location){
                if(curDomain != getDomain(win.parent)){
                    break;
                }
                win = win.parent;
            }
        }catch(e){}
		return win;
	};

    //获取上下文路径
    var basePath = function(){
        var obj=window.location;
        var contextPath=obj.pathname.split("/")[1];
        // var path=obj.protocol+"//"+obj.host+"/"+contextPath;
        var path=obj.protocol+"//"+obj.host;
        return path;
    };

    var crossOrigin = function(){
        //如果页面被其它系统嵌套
        var thisWin = window.location,
             topWin = top.window.location;
        return thisWin.protocol+"//"+thisWin.host != topWin.protocol+"//"+topWin.host;
    },

    var refresh = function(){
        location.href=location.href;
    };

    //生成随机唯一id字符串，利用对数字进行toString(36)
    var idStr = function(){
        return Number(Math.random().toString().substr(3,length) + Date.now()).toString(36);
    };

    var resolveUrl = function(url){
        if(url.indexOf('${token}') > -1){
            // 兼容第三方单点登录  tokenKey：第三方应用名称
            // url='www.baidu.com?tokenKey=IEAM&__Token=${token}';
            var tokenKey = getUrlParam("tokenKey",url);
            if(tokenKey){
                var thirdToken = sessionStorage.getItem('thirdToken_'+tokenKey+'_'+getAuthInfo("loginName"));
                // 缓存中不存在third_Key
                if(!thirdToken){
                    var apiCfg={
                        url:Const.admin+'/api/oauth/token3rd/'+tokenKey,
                        data:{},
                        async:false
                    };
                    Api.ajaxAdvance(apiCfg,function(result){
                        if(result.success){
                            thirdToken =result.AccessToken3rd;
                            sessionStorage.setItem('thirdToken_'+tokenKey+'_'+getAuthInfo("loginName"),thirdToken);
                        }else{
                            Mom.layMsg(result.message);
                            return url;
                        }
                    })
                }
                url = url.replace('${token}', thirdToken);
            }else{
                // 将${token}替换为当前登录的token;
                url = url.replace('${token}', getAuthInfo('authorization'));
            }
            url = url.replace('${tokenType}', getAuthInfo('tokenType'));
        }
        if(url.indexOf('${userId}') > -1){
            var loginUserid = getAuthInfo("loginUserid");
            url = url.replace('${userId}', loginUserid);
        }
        if(url.indexOf('${loginName}') > -1){
            var loginName = getAuthInfo("loginName");
            url = url.replace('${loginName}', loginName);
        }
        var reg = /\$\{((\w|\.)+)}/g;
        var rr = [];
        while(rr = reg.exec(url)) {
            try{
                url = url.replace(rr[0],eval(rr[1]));
            }catch(e){console.error(e);}
        }
        return url;
    };

    /**
     * 拼接参数到url中
     * params:参数，支持字符串、字符串数组、json对象
     */
    var extractUrl = function(url, param){
        if(!param || !url){
            return url;
        }
        var paramStr = '';
        if (typeof param == "string") {
            if(param.indexOf('?')==0){
                param = param.substr(1);
            }
            if(param.indexOf('&')!=0){
                param = '&'+param;
            }
            paramStr = param;
        }
        else if(Object.prototype.toString.call(param) === '[object Array]'){
            //数组参数
            var paramArr = typeof(param) == "string" ? [param] : param;
            for(var i=0; i<paramArr.length; i++){
                paramStr += '&'+paramArr[i];
            }
        }
        else{
            //对象参数
            for(var key in param){
                var value = param[key];
                paramStr += '&'+key+'='+value;
            }
        }
        if(0 < paramStr.length){
            paramStr = (url.indexOf('?')<0?'?':'&')+encodeURI(paramStr.substr(1));
        }
        return url+paramStr;
    };
    /**
     * 解析URL中的参数
     * @param {url路径} string
     * @returns {返回object<key,value>}
     */
    var getUrlParam = function(name, url) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        if (!url || url == ""){
            url = window.location.search;
        }else{
            url = url.substring(url.indexOf("?"));
        }
        r = url.substr(1).match(reg);
        if (r != null) return decodeURIComponent(r[2]);
        return null;
    };

    //判断浏览器是否支持html5本地存储
    var localStorageSupport = function() {
        return ('localStorage' in window) && window['localStorage'] !== null;
    };

    //获取文件后缀名
    var getFileExt = function(FileName){
        if(FileName){
            return FileName.substring(FileName.lastIndexOf('.')+1, FileName.length).toLowerCase();
        }else{
            return '';
        }
    };

    var getOpener = function(){
        var callerWindowObj = window.dialogArguments;
        if(callerWindowObj != undefined){
            return callerWindowObj;
        }
        return window.parent;
    };
    //窗口返回
    var winBack = function(url){
        if(url!=undefined && url!=null){
            location.href = url;
        }
        else{
            var opener = getOpener();
            if(opener.opener == null){
                history.go(-1);
            }else{
                opener.close();
            }
        }
    };

    var postcall = function( url, params, target){  //跳转到第三方系统事件
        var tempform = document.createElement("form");
        tempform.action = url;
        tempform.method = "post";
        tempform.style.display="none";
        if(target) {
            tempform.target = target;
        };
        for (var x in params) {
            var opt = document.createElement("input");
            opt.name = x;
            opt.value = params[x];
            tempform.appendChild(opt);
        };
        // var opt = document.createElement("button");
        // opt.type = "submit";
        // tempform.appendChild(opt);
        document.body.appendChild(tempform);
        tempform.submit();
        document.body.removeChild(tempform);
    };

    /**
     * 判断浏览器类型，如果要判断IE版本直接传参版本号，参数为空时返回浏览器类型
     * @param v
     * @returns {*}
     * @constructor
     */
    var BrowserType =  function (v) {
        var userAgent = navigator.userAgent;
        var isOpera = userAgent.indexOf("Opera") > -1;
        var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera;
        var isEdge = userAgent.indexOf("Trident/7.0;") > -1 && userAgent.indexOf("Windows NT 6.1") > -1 && !isIE;
        var isFF = userAgent.indexOf("Firefox") > -1;
        var isSafari = userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1;
        var isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1;
        var isIE11  = userAgent.toLowerCase().indexOf("trident") > -1 && userAgent.indexOf("rv") > -1;
        if(isIE && v) {
            var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
            reIE.test(userAgent);
            var fIEVersion = parseFloat(RegExp["$1"]);
            return v == fIEVersion ? true:false;
        }
        if(isIE11){
            return "ie11";
        }
        if(isFF) { return "FF"; }
        if(isOpera) { return "Opera"; }
        if(isSafari) { return "Safari"; }
        if(isChrome) { return "Chrome"; }
        if(isEdge) { return "Edge"; }
    };

    /***** 判断是否为移动设备 ******/
    var isMobileAgent = function() {
        var sUserAgent = navigator.userAgent.toLowerCase();
        var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
        var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
        var bIsMidp = sUserAgent.match(/midp/i) == "midp";
        var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
        var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
        var bIsAndroid = sUserAgent.match(/android/i) == "android";
        var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
        var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
        if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
            return true;
        }
        return false;
    };


    /*
     *添加到收藏夹
     */
    var AddFavorite = function(sURL, sTitle){
        sURL = sURL!=undefined?sURL:window.location;
        sTitle = sTitle!=undefined?sTitle:document.title;
        try {
            if (document.all) {
                window.external.addFavorite(sURL, sTitle);
            }
            else if (window.sidebar) {
                window.sidebar.addPanel(sTitle, sURL, "");
            }
        }catch(e){
            window.alert("加入收藏失败，请使用Ctrl+D进行添加!");
        }
    };
    // Find the right method, call on correct element
    var launchFullscreen = function(element) {
        element = element||document.documentElement;
        if (!$("body").hasClass("full-screen")) {
            $("body").addClass("full-screen");
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        } else {
            $("body").removeClass("full-screen");
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    };

    /*
     * 根据身份证号获取信息：出生日期、性别、年龄
     */
    var getInfoByCardId = function(iIdNo){
        var info = {};
        //出生日期、性别、年龄
        var birthday='', sex='', age=0;
        if(undefined != iIdNo && iIdNo.length>14){
            iIdNo = iIdNo.trim();
            var last = iIdNo[iIdNo.length - 2];
            sex = last%2!=0 ? '男' : '女';
            if(iIdNo.length == 15){
                birthday = iIdNo.substring(6, 12);
                birthday = "19" + birthday;
                birthday = birthday.substring(0, 4) + "-" + birthday.substring(4, 6) + "-" + birthday.substring(6);
            }else if(iIdNo.length > 15){
                birthday = iIdNo.substring(6, 14);
                birthday = birthday.substring(0, 4) + "-" + birthday.substring(4, 6) + "-" + birthday.substring(6);
            }
            if(birthday.length > 3){
                var yy = new Date().getYear();
                if (yy < 1900) yy = yy + 1900;
                age = yy-birthday.substring(0,4);
            }
        }
        info['sex']=sex;
        info['birthday']=birthday;
        info['age']=age;
        return info;
    };

    //清空form（也可以是容器）的值
    var clearForm = function(theForm,clearHidden){
        if(theForm==undefined || theForm==null)
            theForm = document.forms[0];
        var el = theForm.elements;

        if(!el){
            el = $(theForm).find("input,textarea,select");
        }
        for(var i=0, m=el.length; i<m; i++){
            if(el[i].type=="hidden"){
                if(clearHidden == true) el[i].value = "";
            }
            else if(el[i].type=="text" || el[i].type=="textarea" ||el[i].type=="number" ){
                el[i].value = "";
            }else if(el[i].type=="select-one" ||el[i].type=="select-multiple"){
                // 20191101 by lihy   判断下拉框是原生的还是基于select2的
                if(el[i].className.indexOf('select2')>-1){
                    try{
                        var width = $(el[i]).attr('data-width')||'100%';
                        var height = $(el[i]).attr('data-height')||'200px';  //设置高度
                        var allowClear = $(el[i]).attr('data-allowClear')||'true';  //是否可清除
                        var options = {
                            language: "zh-CN",
                            placeholder: "请选择",
                            allowClear: allowClear=='true',
                            minimumResultsForSearch: 15, //数据超过15条自动显示搜索框
                            //tags: true,  //可以手动添加数据
                            width: width, //设置宽度，也可以在ui中加入data-width属性进行个性化设置
                            height: height,
                            // dropdownAutoWidth: true,
                        };
                        //多选
                        if($(el[i]).hasClass('multiple')){
                            options.allowClear = allowClear=='true';
                            options.multiple =  true;
                            options.closeOnSelect = false;
                        }
                        $(el[i]).select2(options).val('').trigger('change');
                    }catch (e) { }
                }else{
                    el[i].value = "";
                    try {
                        $(el[i]).trigger('change');
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
            else if(el[i].type=="checkbox" && el[i].checked){
                if($(el[i]).hasClass('i-checks')){
                    $(el[i]).iCheck('unCheck');
                }else{
                    $(el[i]).attr('checked',false);
                }
            }
        }
    };

    //获取当前日期
    function getShortDate(){
        return getLocalDate().replace('年','-').replace('月','-').replace('日','');
    }
    function getLocalDate(){
        var objD = new Date();
        var yy = objD.getFullYear();
        if (yy < 1900) yy = yy + 1900;
        var MM = objD.getMonth() + 1;
        if (MM < 10) MM = '0' + MM;
        var dd = objD.getDate();
        if (dd < 10) dd = '0' + dd;
        return yy + "年" + MM + "月" + dd + "日";
    }
    function getLocalTime(){
        var objD = new Date();
        var hh = objD.getHours();
        if (hh < 10) hh = '0' + hh;
        var mm = objD.getMinutes();
        if (mm < 10) mm = '0' + mm;
        var ss = objD.getSeconds();
        if (ss < 10) ss = '0' + ss;
        return hh + ":" + mm + ":" + ss;
    }
    // 添加了多语言功能之后再使用此方法
    /* function getLocalWeek(){
         var objD = new Date();
         var ww = LANG_WEEKS[objD.getDay()];
         return ww;
     }*/
    function getLocalWeek(){
        var weeksArr=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
            objD = new Date();
        var ww = weeksArr[objD.getDay()];
        return ww;
    }


    //前后日期比较, 参数可以是字符串OR日期格式
    /**
     * var i = dateCompare(d1,d2);
     * if(i==0){d1==d2} else if(i>0){d1>d2} else{d1<d2}
     * @param param1
     * @param param2
     * @returns {number}
     */
    var dateCompare = function(param1,param2) {
        if(param1 && param2) {
            var time1 =0,time2=0;
            if(typeof(param1) == "string"){
                if(param1.indexOf('-')<0 && param1.indexOf(':')>-1){
                    time1 = Number(param1.replace(/:/g,""));
                }else{
                    param1 = new Date(param1.replace(/-/g,"\/"));//将字符串转化为时间   将"-"替换成"/"是考虑到浏览器的兼容性
                    time1 = param1.getTime();
                }
            }else{
                time1 = param1.getTime();
            }

            if(typeof(param2) == "string"){
                if(param2.indexOf('-')<0 && param2.indexOf(':')>-1){
                    time2 = Number(param2.replace(/:/g,""));
                }else{
                    param2 = new Date(param2.replace(/-/g,"\/"));//将字符串转化为时间
                    time2 = param2.getTime();
                }
            }else{
                time2 = param2.getTime();
            }
            return time1-time2;
        }
        return 0;
    };

    // 日期是否有交集
    var isDateCross = function(startDate1, endDate1, startDate2, endDate2){
        if(typeof(startDate1) == "string")startDate1=new Date(startDate1.replace(/-/g,"/"));
        if(typeof(endDate1) == "string")endDate1=new Date(endDate1.replace(/-/g,"/"));
        if(typeof(startDate2) == "string")startDate2=new Date(startDate2.replace(/-/g,"/"));
        if(typeof(endDate2) == "string")endDate2=new Date(endDate2.replace(/-/g,"/"));
        if(startDate1<=startDate2 && endDate1>=startDate2){
            return true;
        }
        if(startDate1>=startDate2 && startDate1<=endDate2){
            return true;
        }
        return false;
    };

    //日期加上指定的天数
    var dateAddDay = function(sdate, days) {
        if(typeof(sdate) == "string"){
            sdate=new Date(sdate.replace(/-/g,"/"));   //js不认2011-11-10,只认2011/11/10
        }
        var dt = sdate;
        var t1 = new Date(new Date(dt).valueOf() + days*24*60*60*1000);
        var month;
        var day;
        if((t1.getMonth() + 1)<10) {
            month="0"+(t1.getMonth() + 1);
        }
        else {
            month=t1.getMonth() + 1;
        }
        if(t1.getDate()<10) {
            day="0"+t1.getDate();
        }
        else {
            day=t1.getDate();
        }
        return t1.getFullYear() + "-" + month + "-" + day;
    };
    // 时间戳加、减指定的秒数  param1:默认传时间戳，也可以单独只传时间， param2:加|减的秒数（只能是秒）
    var timeStampAddSub = function(timeStamp,AddSub){
        if(timeStamp.indexOf(' ')<0){
            timeStamp = getShortDate()+' '+timeStamp;
        }
        var date = timeStamp.substring(0,19);
        date = date.replace(/-/g,'/');
        var m = new Date(date);
        var timeNew = new Date(m.getTime() + 1000 * Number(AddSub));
        var dateNew = new Date(timeNew),
            year = dateNew.getFullYear(),
            month= dateNew.getMonth()+ 1,
            day = dateNew.getDate(),
            hh = dateNew.getHours(),       //获取当前小时数(0-23)
            mm = dateNew.getMinutes(),     //获取当前分钟数(0-59)
            ss = dateNew.getSeconds();     //获取当前秒数(0-59)
        return (year+'-'+(month<10?('0'+month):month)+'-'+(day<10?('0'+day):day)+' '+(hh<10?('0'+hh):hh)+':'+(mm<10?('0'+mm):mm)+':'+(ss<10?('0'+ss):ss));
    };

    //判断日期是否是指定月份最后一天  返回值为true则表示为指定月的最后一天
    var isLastDay = function(inputDate){
        var d = inputDate?inputDate:getShortDate();
        if(typeof (d) == 'string'){
            d= new Date(d.replace(/\-/g, "/"));
        }
        var nd = new Date(new Date(d).valueOf()+24*60*60*1000); //next day
        return (d.getMonth()!=nd.getMonth())
    };
    // 日期加年
    var dateAddYear = function(beginDate, y){
        if(typeof(beginDate) == "string"){
            beginDate=new Date(beginDate.replace(/-/g,"/"));
        }
        var a = beginDate;
        var b = new Date(a.getFullYear()+y, a.getMonth(), a.getDate());
        //转换为10-18-2004格式
        return b;
    };

    //给对象添加事件
    var addEvent = function(obj, evType, fn) {
        if (obj.addEventListener) {
            obj.addEventListener(evType, fn, false);
            return true;
        } else if (obj.attachEvent) {
            var r = obj.attachEvent("on" + evType, fn);
            return r;
        } else {
            return false;
        }
    };

    /**
     * json对象转字符串形式
     */
    var json2str = function(o) {
        var arr = [];
        var fmt = function (s) {
            if (typeof s == 'object' && s != null)
                return json2str(s);
            return /^(string|number)$/.test(typeof s) ? "'" + s + "'" : s;
        };
        for (var i in o) {
            arr.push("'" + i + "':" + fmt(o[i]));
        }
        return '{' + arr.join(',') + '}';
    };
    //将对象中的key进行反序列化  如 反序列化前：var obj={"a.b.c":"3"}   反序列化后：obj={a:{b:{c:"3"}}}
    var serializeJSON_KEY = function(param){
        var o = {},arr=[];
        var _this =null;
        var isArray = Object.prototype.toString.call(param) === '[object Array]',
            isObj = Object.prototype.toString.call(param) === '[object Object]';
        if(!param) return o;
        if( isArray && param.length){
            $(param).each(function(i,item){
                _this = item;
                o={};
                arr.push(changeJSON(_this));
            })
        }else if(isObj){
            _this = param;
            return changeJSON(_this);
        }
        function changeJSON(_this){
            var keys = Object.getOwnPropertyNames(_this);

            for(var i=0;i<keys.length;i++){
                var name = keys[i];
                if(name == ''){
                    continue;
                }else{
                    var value = _this[name];
                    var paths = name.split(".");
                    var len = paths.length;
                    var obj = o;
                    $.each(paths,function(i,e){
                        if(i == len-1){
                            if (obj[e]) {
                                if (!obj[e].push) {
                                    obj[e] = [obj[e]];
                                }
                                obj[e].push(value || '');
                            } else {
                                obj[e] = value || '';
                            }
                        }else{
                            if(!obj[e]){
                                obj[e] = {};
                            }
                        }
                        obj = obj[e];
                    });
                }
            }
            return o;
        }
        return arr;
    };

    /*********** cookie ************/
    var setCookie = function(name,value,expire,path) {
        // 设置cookie过期时间，默认30天
        if(expire === null || expire === undefined){
            expire = 30*24*60*60;
        }
        var exp = new Date();
        exp.setTime(exp.getTime() + expire*1000);
        var pathTmp = path!=undefined?path:'/';
        document.cookie=name+"="+encodeURI(value)+";expires="+exp.toGMTString()+";path="+pathTmp;
    };
    //读取cookies
    var getCookie = function(name) {
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
        if(arr=document.cookie.match(reg)){
            var cookieVal = decodeURI(arr[2]);
            if(cookieVal == 'undefined')
                cookieVal = '';
            return cookieVal;
        }
        else
            return '';
    };
    //删除cookies
    var delCookie = function(name,path) {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval=getCookie(name);
        if(cval!=null){
            var pathTmp = path!=undefined?path:'/';
            document.cookie=name+"="+cval+";expires="+exp.toGMTString()+";path="+pathTmp;
        }
    };

    //加载css/js
    var include = function(id, path, file){
        if(path.lastIndexOf('/') != path.length-1){
            path += '/';
        }
        if(document.getElementById(id)==null){
            var files = typeof file == "string" ? [file] : file;
            for (var i = 0; i < files.length; i++){
                var name = files[i].replace(/^\s|\s$/g, "");
                var ext = getFileExt(files[i]).toLowerCase();
                var fileref;
                var fullName = extractUrl(path + name, window.devMode?('r='+(new Date()).getTime()):'');
                if(ext == "css"){
                    fileref = document.createElement('link');
                    fileref.setAttribute("rel", "stylesheet");
                    fileref.setAttribute("type", "text/css");
                    fileref.setAttribute("href", fullName);
                }else{
                    fileref = document.createElement('script');
                    fileref.setAttribute("type", "text/javascript");
                    fileref.setAttribute("src", fullName);
                }
                if(fileref){
                    fileref.setAttribute("id", id);
                    // document.getElementsByTagName("head")[0].appendChild(fileref);
                    $(fileref).insertBefore("title");
                }
            }
        }
    };

	/**
	 * 在dom中显示信息，dom为空时默认为body
	 * @param: clearBefore(true/false)多次调用是否先清空上次的信息，为false时表示追加信息
	 * @param: msg 文本信息
	 * @param: dom 信息显示在哪个dom容器
	 * @param: type 类型（success/info/warning/danger）
	 * 依赖bootstrap
	 */
	function showMsg(clearBefore, msg, dom, type){
		if(!dom){
			dom = 'body';
		}
		if($(dom).length){
			var subTitle = '';
			if(!type){
				if(msg.indexOf('失败')>-1 || msg.indexOf('异常')>-1 || msg.indexOf('错误')>-1){
					type='danger', subTitle='<strong>失败!</strong> ';
				}else{
					type='info';
				}
				if(msg.indexOf('成功')>-1){
					subTitle='<strong>成功!</strong> ';
				}
			}
			if(clearBefore){
				$(dom).children('.alert-dismissible').remove();
			}
			if($(dom).children(".alert-"+type).length==0){
				$(dom).prepend("<div class='alert alert-"+type+" alert-dismissible fade show'>"+
	"<button type='button' class='close' data-dismiss='alert'>&times;</button>"+
	subTitle+"<span class='alert-content'></span></div>");
			}
			var oldMsg = $(dom).children(".alert-"+type).children('.alert-content').html();
			if(oldMsg) oldMsg += "<br/>";
			$(dom).children(".alert-"+type).children('.alert-content').html(oldMsg+msg);
		}
	}
    /**
     * 弹出通知
     * type: success|info|warning|error
     */
    function notify(msg, type, title, option){
		if(type==undefined || type==''){
            if(msg.indexOf('失败')>-1 || msg.indexOf('异常')>-1 || msg.indexOf('错误')>-1){
                type = 'error';
            }else{
                type = 'success';
            }
        }
        if(title==undefined || title==''){
            title = '系统提示:';
        }
        var win = top();
		if(!win.toastr){
			layAlert(msg);
			return;
		}
        win.toastr.options =$.extend(true,{},{
            "closeButton": true,
            "debug": false,
            "progressBar": true,
            "preventDuplicates": false,
            "positionClass": "toast-top-right mgt-58",
            "onclick": null,
            "showDuration": "400",
            "hideDuration": "1000",
            "timeOut": "7000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        },option);
        var $toast = win.toastr[type](msg, title); // Wire up an event handler to a button in the toast, if it exists
        if ($toast.find('#okBtn').length) {
            $toast.delegate('#okBtn', 'click', function () {
                $toast.remove();
            });
        }
        if ($toast.find('#surpriseBtn').length) {
            $toast.delegate('#surpriseBtn', 'click', function () {

            });
        }
    };
	//加载中...
	var layLoading = function(msg){
		if(msg){
			return layer.msg(msg, {icon:16,shade:0.01,shadeClose:false,time:-1,skin:'loading-text' });
		}
		return layer.load(2); //风格2的加载
	};
    //弹出信息框，自动关闭（icon:16为加载中）
    var layMsg = function(info, time, icon){
        var cfg = {time:time||1800, shade:0.01};
        if(icon){
            cfg.icon = icon;
        }
        var p_ = top();//window.parent?window.parent:top;
        return p_.layer.msg(info, cfg);
    };
    /**
     * 弹出警告信息，消息换行请使用<br/>
     * @param {*} info 
     * @param {*} icon 1:对号; 2:叉号; 3:问号; 4:锁; 5:苦脸; 6:笑脸; 7:感叹号
     * @param {*} okFn 
     * @param {*} options 配置项，参考layer官网
     */
    var layAlert = function(info, icon, okFn, options){
        icon = icon||0;
        var title = icon==0?'警告':'消息';
        var p_ = top();
        var opts = $.extend(true, {}, {skin:Const.layerSkin() || '', icon:icon, title:title}, options);
        var layerIndex = p_.layer.alert(info, opts, function(index){
            if(okFn){
                okFn(index);
            }
            p_.layer.close(index);
        });
        return layerIndex;
    };
    //弹出确认框
    var layConfirm = function(info, callback, cancelFn){
        var p_ = top();//window;
        p_.layer.confirm(info, {skin:Const.layerSkin() || '',icon:3, title:'系统提示'}, function(index, layero){
            p_.layer.close(index);
            if(callback){
                callback(index, layero);
            }
        },function(index){
            p_.layer.close(index);
            if(cancelFn){
                cancelFn(index);
            }
        });
    };

    var jsGetVal = function(objectString){
        var result='', val='';
        var vals = objectString.split(".");
        for (var i=0; i<vals.length; i++){
            val += ("." + vals[i]);
            result += ("!"+(val.substring(1))+"?'':");
        }
        result += val.substring(1);
        return result;
    };

    //倒计时读秒（ss：剩余秒数；fn：回调函数）
    var countDownSecond = function(ss, fn){
        var timer = setInterval(function() {
            if (ss > 0) {
                --ss;
                fn(ss);
            }
            else {
                clearInterval(timer);
                // fn(ss);
            }
        }, 1000);
        return timer;
    };

    //时间倒计时：今天距离指定时间还有多久
    var countDownDate = function(datetime, fn){
        var maxtime = (new Date(datetime) - new Date()) / 1000;//剩余秒
        var timer = setInterval(function () {
            if (maxtime > 0) {
                var dd = parseInt(maxtime / 60 / 60 / 24, 10);//计算剩余的天数
                var hh = parseInt(maxtime / 60 / 60 % 24, 10);//计算剩余的小时数
                var mm = parseInt(maxtime / 60 % 60, 10);//计算剩余的分钟数
                var ss = parseInt(maxtime % 60, 10);//计算剩余的秒数
                hh = hh<10?('0'+hh):hh;
                mm = mm<10?('0'+mm):mm;
                ss = ss<10?('0'+ss):ss;
                //msg = "剩余时间 " + dd + "天" + hh + "时" + mm + "分" + ss + "秒";
                fn(dd,hh,mm,ss);
                --maxtime;
            }
            else {
                clearInterval(timer);
                fn(0,0,0,0);
            }
        }, 1000);
        return timer;
    };

    /**
     * 动态创建iframe
     * @param frameDivID
     * @param frameId
     * @param action
     * @returns {Element}
     */
    function createTagFrame(frameDivID,action,frameId){
        frameId = (frameId || action).replaceAll("\\.","\\.");
        var frameDivCont = document.getElementById(frameDivID);
        var frames=frameDivCont.getElementsByTagName("iframe");
        var tabFrame = document.getElementById(frameId);
        for(var i=0;i<frames.length;i++){
            if(frames[i].id != action){
                frames[i].style.display="none";
            }
        }
        if(tabFrame==null || tabFrame==undefined){
            tabFrame = document.createElement("iframe");
            tabFrame.id=frameId;
            tabFrame.style.height="100%";
            tabFrame.style.width="100%";
            tabFrame.marginWidth="0";
            tabFrame.frameBorder="0";
            tabFrame.frameSpacing="0";
            tabFrame.scrolling="no";
            tabFrame.style.overflow = "hidden";
            frameDivCont.appendChild(tabFrame);
        }
        if(action!=undefined && action!='' && tabFrame.src==""){
            tabFrame.src = action;
        }
        /* if(tabFrame.attachEvent){
             tabFrame.attachEvent("onload",setFrameHeight);
         }else{
             tabFrame.oncload=setFrameHeight;
         }*/
        tabFrame.style.display="inline";
        return frameDivCont;
    }

    /**
     * 设置iFrame高度，在iframe内部页面调用  切记使用该方法的时候不应设置body,html的高度
     */
    function setFrameHeight(offsetHeight_, fn){
        var frames = window.parent.document.getElementsByTagName("iframe");
        for(var i = 0; i < frames.length; i++) {
            var f = frames[i];
            if (null != f && f.style.display != "none") {
                var h = document.body.scrollHeight+(offsetHeight_||0);
                var blankHeight = 20;
                if($(f).css('height').replace('px','') < h){
                    if(fn){
                        fn(f, h+blankHeight);
                    }else{
                        f.style.height = (h+blankHeight)+"px";
                    }
                }
            }
        }
    }

    /**
     * 获取用户信息,先从session中获取，如果session中没有则从cookie中获取；
     * 如果key不为空取相应的key对应的值；如果key为空则获取auth字符串。
     */
    var getAuthInfo = function(key){
        if(key){
            var value;
            var userStr = sessionStorage.getItem('userInfo')||getCookie("userInfo");
            var userInfo = JSON.parse(userStr==''?'{}':userStr);
            value = userInfo[key]||'';
            if(value == ''){
                value = sessionStorage.getItem(key)||'';
                if(value==''){
                    value = getCookie(key)|| '';
                }
            }
            return value;
        }else{
            var tokenType = sessionStorage.getItem('tokenType') || '';
            if(tokenType == ''){
                tokenType = getCookie("tokenType");
            }
            var authorization = sessionStorage.getItem("authorization") || '';
            if(authorization == ''){
                authorization = getCookie("authorization");
            }
            return $.trim(tokenType + ' '+authorization);
        }
    };

    //加载语言文件
    var localize = function(callback){
        // console.log(callback);
        var dom = document.getElementById('lang');
        if(dom)dom.parentNode.removeChild(dom);
        var cookieLang = getCookie('somoveLanguage')||'';
        if(cookieLang==undefined || cookieLang==''){
            cookieLang = navigator.language || navigator.browserLanguage;
        }
        cookieLang = cookieLang.toLowerCase();
        window.include([{id:'lang',url:'/i18n/lang/js/'+cookieLang+'.js'}],function(){
            if(callback)callback();
        });
    };



    return {
        // 获取主题窗口
		top: top,
        getTop: top,
        //获取上下文路径
        basePath: basePath(),
        //判断是否跨域
        crossOrigin: crossOrigin(),
        //刷新
        refresh: refresh,
        //生成唯一随机id
        idStr: idStr,
        //解析url，使url支持变量
        resolveUrl: resolveUrl,
        //将参数拼接到url后边
        extractUrl: extractUrl,
        //解析URL中的参数
        getUrlParam: getUrlParam,
        //判断是否为移动设备
        isMobileAgent: isMobileAgent(),
        BrowserType: BrowserType,
        //判断浏览器是否支持html5本地存储
        localStorageSupport: localStorageSupport(),
        //获取文件后缀名
        getFileExt: getFileExt,
        //获取父窗口
        getOpener: getOpener,
        //窗口返回
        winBack: winBack,
        postcall: postcall,
        //添加到收藏夹
        AddFavorite: AddFavorite,
        //全屏
        launchFullscreen:launchFullscreen,
        //根据身份证号获取信息
        getInfoByCardId: getInfoByCardId,
        //清空Form表单
        clearForm: clearForm,
        //获取当前日期
        shortDate: getShortDate(),
        localDate: getLocalDate(),
        localTime: getLocalTime, //这地方不能加括号，否则取值始终是页面初始化时编译的时间
        localWeek: getLocalWeek,
        //前后日期比较
        dateCompare: dateCompare,
        // 日期是否有交集
        isDateCross: isDateCross,
        //日期加上指定的天数
        dateAddDay: dateAddDay,
        //时间戳加减指定的秒数  参数可以是时间戳（如期+时间） 也可以单独是时间
        timeStampAddSub:timeStampAddSub,    //by lhy
        // 判断日期是否是指定月份最后一天  //by lhy
        isLastDay:isLastDay,
        // 日期加年
        dateAddYear: dateAddYear,
        //给对象添加事件
        addEvent: addEvent,
        //json对象转字符串形式
        json2str: json2str,
        //将对象中的key进行反序列化  如：var (a.b.c)
        serializeJSON_KEY:serializeJSON_KEY,
        //cookie
        setCookie: setCookie,
        getCookie: getCookie,
        delCookie: delCookie,
        //加载js/css
        include: include,

		//在dom中显示提示信息
		showMsg: showMsg,
        //弹出通知
        notify: notify,
        //加载中
		layLoading: layLoading,
		//弹出框
        layMsg: layMsg,
        layAlert: layAlert,
        layConfirm: layConfirm,

        //生成三目运算字符串
        jsGetVal: jsGetVal,
        //倒计时，计时器(读秒)
        countDownSecond: countDownSecond,
        //日期倒计时
        countDownDate: countDownDate,
        //动态创建iframe
        createTagFrame: createTagFrame,
        //设置iframe高度
        setFrameHeight: setFrameHeight,
        //获取用户信息
        getAuthInfo: getAuthInfo,
        //加载语言文件
        localize:localize,

    }
})();