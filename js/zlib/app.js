requirejs.config({
    baseUrl: cdnDomain,
    paths: {
        // domReady: 'js/zlib/domReady',
        // jquery: 'js/jquery/jquery-3.2.1.min', //jquery3会导致iframe跳出来
        jquery: 'js/jquery/jquery-2.2.4.min',
        bootstrap: 'js/plugins/bootstrap/js/bootstrap.min',
        pace: 'js/plugins/pace/pace.min',
        WdatePicker: 'js/plugins/My97DatePicker/WdatePicker',
        slimscroll: 'js/plugins/slimScroll/jquery.slimscroll.min',

        dataTable_colResizable:'js/plugins/datatables/js/dataTables.colResizable_v1.6.min',//列宽调整
        dataTable_colReorder:'js/plugins/datatables/js/dataTables.colReorder_v1.5.0.min',//拖动列
        dataTable_fixedHeader:'js/plugins/datatables/js/dataTables.fixedHeader_v3.1.4.min',//固定表头
        dataTable_fixedColumns:'js/plugins/datatables/js/dataTables.fixedColumns_v3.2.5.min',//固定列
        // js/plugins/datatables/js/jquery.dataTables.min
        datatables:'js/plugins/datatables/js/jquery.dataTables.min',
        dataTable_my: 'js/plugins/datatables/js/jquery.dataTables_my.min',

        jqGrid_my: 'js/plugins/jqGrid/js/jqGrid_my.min',
        editTable: 'js/common/table/editTable',

        ztree_my: 'js/plugins/ztree/ztree_my.min',
        easyui_my: 'js/plugins/easyui/easyui_my.min',
        summernote_all: 'js/plugins/summernote/lang/summernote-zh-CN',
        select2_all: 'js/plugins/select2/dist/js/select2.full.min',
        icheck: 'js/plugins/icheck/icheck.min',
        layui: 'js/plugins/layui/layui.all',
        CanvasAnimate: 'js/plugins/canvas/CanvasAnimate',
        validator: 'js/validator.min',
        json2: 'js/json2',
        Common: 'js/common.min',
        Bus: 'js/bus.min',
        Api: 'js/api.min',
        Page: 'js/common/page/page.min',
        SmallPage: 'js/common/page/smallPage.min',
        checkUser: 'js/common/checkUser.min',
        artTemplate: 'js/plugins/artTemplate.min',

        echarts: 'js/plugins/echarts/js/echarts.min',
        macarons:'js/plugins/echarts/js/macarons.min',
        echartsv2_my: 'js/plugins/echartsv2/eChartsv2_my.min',

        ueditor_my: 'js/plugins/ueditor/ueditor_my',
        ueditor:'js/plugins/ueditor/ueditor.all',

        webUploader_my:'js/plugins/webUpLoader/webUploader_my.min'

    },
    shim: {
        'bootstrap':{ deps:['jquery'] },
        'validator': { deps:['layui'] },
        'json2': { exports: 'json2' },
        'icheck':{ deps:['jquery'] },
        'ztree_my': { deps:[ 'js/plugins/ztree/js/jquery.ztree.all.min'] },
        'easyui_my': { deps:['js/plugins/easyui/jquery.easyui.min'] },
        'jqGrid_my': { deps:[ 'js/plugins/jqGrid/js/jqGrid','js/plugins/jqGrid/js/jquery.tablednd'] },
        'summernote_all': {deps:[ 'js/plugins/summernote/summernote.min'] },
        'CanvasAnimate': {
            deps:['js/plugins/canvas/EasePack.min','js/plugins/canvas/TweenLite.min']
        },
        'Page': {
            deps:['js/plugins/bootStrapPager/js/extendPagination.min']
        },
        'echartsv2_my':{
            deps:['js/plugins/echartsv2/echarts-all']
        },
        'ueditor_my':{deps:['ueditor']},
        'ueditor': { deps:['js/plugins/ueditor/ueditor.config'] },
    },
    // urlArgs: "r=" + (new Date()).getTime(),
    waitSeconds: 40 //资源加载超时时间（秒）
});

/**
 * define中不包含加载资源的参数，则里边的require()方法使用同步加载，require([])使用异步加载
 */
define(function(require, exports, module){
    //同步加载
    require('bootstrap');
    require('pace');
    require('json2');
    // layui
    require('layui');
    require('Common');
    require('Api');
    require('Bus');
    require('dataTable_my');
    require('WdatePicker');
    require('validator');
    require('slimscroll');

    //异步加载↓↓↓

    //select2
    require('select2_all'); //同步加载select2.js
    window.renderSelect2 = function(os, extCfg){
        if(os==undefined || os==null){
            os = $('.select2');
        }
        var defaultOpts = $.extend(true,{},{
            language: "zh-CN",
            placeholder: "请选择",
            minimumResultsForSearch: 15, //数据超过15条自动显示搜索框
            // theme: 'bootstrap',
            //tags: true,  //可以手动添加数据
            // dropdownAutoWidth: true,
        },extCfg||{});
        $.each(os,function(i,o){
            var width = $(o).attr('data-width')||'100%';
            var height = $(o).attr('data-height')||'200px';  //设置高度
            var allowClear = $(o).attr('data-allowClear')||'true';  //是否可清除
            var options = $.extend(true,{},defaultOpts,{
                width: width, //设置宽度，也可以在ui中加入data-width属性进行个性化设置
                height: height,
                allowClear: allowClear=='true',
            });
            //多选
            if($(o).hasClass('multiple')){
                options.allowClear = allowClear=='true';
                options.multiple =  true;
                options.closeOnSelect = false;
            }
            $(o).select2(options);
        });
    };
    //如果元素使用select2插件实现下拉框，在元素添加.select2的类名即可
    renderSelect2($('.select2'));

    //icheck
    require('icheck');  //同步加载icheck.js
    $.fn.renderIChecks = function(){
        $(this).find('.i-checks').iCheck({
            /* checkboxClass: 'icheckbox_square-green',
             radioClass: 'iradio_square-green'*/
            checkboxClass: 'icheckbox_flat-green',
            radioClass: 'iradio_flat-green'
        });
    }
    window.renderIChecks = function(checkAllDom, checkItemDom){
        $(document).renderIChecks();

        /*//监听全选
        $('th input.i-checks').on('ifChecked', function(event){ //ifCreated 事件应该在插件初始化之前绑定
            $(this).closest('table').find('input.i-checks').iCheck('check');
        });
        //监听全不选
        $('th input.i-checks').on('ifUnchecked', function(event){ //ifCreated 事件应该在插件初始化之前绑定
            $(this).closest('table').find('input.i-checks').iCheck('uncheck');
        });*/

        var dataTables_scrollHeads = $('.dataTables_scrollHead');
        if(dataTables_scrollHeads.length){
            $.each(dataTables_scrollHeads,function(i,dtHead){
                var dataTables_scrollBody = $(dtHead).siblings('.dataTables_scrollBody');
                $(dtHead).find('input.i-checks').on('ifChecked', function(event){ //ifCreated 事件应该在插件初始化之前绑定
                    $(dataTables_scrollBody).find('input.i-checks').iCheck('check');
                });
                //监听全不选
                $(dtHead).find('input.i-checks').on('ifUnchecked', function(event){ //ifCreated 事件应该在插件初始化之前绑定
                    $(dataTables_scrollBody).find('input.i-checks').iCheck('uncheck');
                });
            });
        }else{
            //监听全选
            $('th input.i-checks').on('ifChecked', function(event){ //ifCreated 事件应该在插件初始化之前绑定
                $(this).closest('table').find('input.i-checks').iCheck('check');
            });
            //监听全不选
            $('th input.i-checks').on('ifUnchecked', function(event){ //ifCreated 事件应该在插件初始化之前绑定
                $(this).closest('table').find('input.i-checks').iCheck('uncheck');
            });
        }

        //监听全选/全不选
        if(checkAllDom && $(checkAllDom).length && checkItemDom && $(checkItemDom).length){
            $(checkAllDom).on('ifChecked', function(event){
                $(checkItemDom).iCheck('check');
            });
            $(checkAllDom).on('ifUnchecked', function(event){
                $(checkItemDom).iCheck('uncheck');
            });
        }
    };
    $(function() {
        renderIChecks();
    });


    //Called automatically if you don’t use AMD or CommonJS.
    //Pace.start();
    Pace.start({
        document: false
    });

    // setting the rootPath of layer
    layui.config({
        base: cdnDomain+'/js/plugins/layui/' //此处路径请自行处理, 可以使用绝对路径
    }).extend({
        //formSelects: 'expand/formSelects/formSelects-v4'
    });
    //加载模块，此处与requireJS的依赖加载冲突
    /*layui.use(['layer','formSelects'], function(){
        var layer =layui.layer;
    });*/
    //使用requireJS进行模块加载（新版xmSelect不支持原生select标签）：
    layui.formSelects=require('js/plugins/layui/expand/formSelects/formSelects-v4');

    //数字函数（加法，能解决小数运算失精的问题）
    Number.prototype.Add=function(arg2){
        var arg1 = this, r1, r2, m;
        if(!arg2 ||  isNaN(arg2)){
            return arg1;
        }
        try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0}
        try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0}
        m=Math.pow(10,Math.max(r1,r2));
        return (arg1*m+arg2*m)/m;
    };
    //数字函数（减法，能解决小数运算失精的问题）
    Number.prototype.Sub=function(arg2){
        var arg1 = this, r1, r2, m;
        if(!arg2 ||  isNaN(arg2)){
            return arg1;
        }
        try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0}
        try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0}
        m=Math.pow(10,Math.max(r1,r2));
        return (arg1*m-arg2*m)/m;
    };
    //数字函数（乘法）
    Number.prototype.Mul=function(arg2){
        if(!arg2 ||  isNaN(Number(arg2))){
            return this;
        }
        var m=0,s1=this.toString(),s2=arg2.toString();
        try{m+=s1.split(".")[1].length}catch(e){}
        try{m+=s2.split(".")[1].length}catch(e){}
        return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m);
    };
    //数字除法（除数、精度）
    Number.prototype.Devide=function(n2,scale){
        if(!n2 ||  isNaN(n2)){
            return this;
        }
        if(Number(n2) === 0){
            return NaN;
        }
        var val = this/n2;
        if(scale!=undefined && scale>-1 && String(val).indexOf('.')>-1){
            var valEnd = String(val).split(".")[1];
            if(valEnd.length > scale){
                val = Math.round(val*Math.pow(10,scale))/Math.pow(10,scale);
            }
        }
        return val;
    }

    //去掉空格
    String.prototype.trim = function(){
        return this.replace(/^\s*|\s*$/g,"");
    };
    //是否以?开头
    String.prototype.startWith=function(str){
        var reg=new RegExp("^"+str);
        return reg.test(this);
    };
    //是否以?结尾
    String.prototype.endWith=function(str){
        var reg=new RegExp(str+"$");
        return reg.test(this);
    };
    //字符串替换
    String.prototype.replaceAll = function(reallyDo, replaceWith, ignoreCase) {
        if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
            if(reallyDo=="?") return this.replace(/\?/g,replaceWith);
            return this.replace(new RegExp(reallyDo, (ignoreCase ? "gi": "g")), replaceWith);
        } else {
            return this.replace(reallyDo, replaceWith);
        }
    };
    //字符串转码
    String.prototype.encode=function(){
        return encodeURIComponent(this);
    };
    //字符串转日期
    String.prototype.toDate=function(){
        var ipt1 = this;
        var aDate = ipt1.split("-");
        var dt1 = new Date(aDate[0], aDate[1]-1, aDate[2]);     //转换为10-18-2004格式
        return dt1;
    };
    //字符串转数组
    String.prototype.toArr=function(rex){
        var ret=[], str=this;
        if(null == str || 0==str.length) return ret;
        var arr = str.split(rex||",");
        for(var i=0; i<arr.length; i++){
            var t = arr[i].trim();
            if(t.length > 0){
                ret.push(t);
            }
        }
        return ret;
    };
    //字符串转Json
    String.prototype.toJson=function(){
        return eval('(' + this + ')');
    };
    //字符串转数据库查询类型字符串
    String.prototype.toDbStr=function(regex){
        if(regex==undefined || regex==null){
            regex = "'";
        }
        var str = "", bol = 0;
        var oldVal = this.trim().replaceAll("，",",");
        if(oldVal!="" && regex=="'"){
            if(!oldVal.startWith("'") && !oldVal.endWith("'")){
                for(var n=0;n<oldVal.length;n++){
                    if(oldVal.charCodeAt(n)==44 ||oldVal.charCodeAt(n)==32 || oldVal.charCodeAt(n)==13 || oldVal.charCodeAt(n)==10 || oldVal.charCodeAt(n)==9){
                        if(bol == 0){
                            str += "','";
                            bol =1;
                        }
                        if(bol == 1){
                            continue;
                        }
                    } else{
                        str += oldVal.charAt(n).trim();
                        bol = 0;
                    }
                }
            }else{
                str = oldVal;
            }
            if(!str.startWith("'"))
                str = "'"+str;
            if(!str.endWith("'"))
                str = str+"'";
        }
        else{
            for(var n=0;n<oldVal.length;n++){
                if(oldVal.charCodeAt(n)==44 ||oldVal.charCodeAt(n)==32 || oldVal.charCodeAt(n)==13 || oldVal.charCodeAt(n)==10 || oldVal.charCodeAt(n)==9){
                    if(bol == 0){
                        str += regex+","+regex;
                        bol =1;
                    }
                    if(bol == 1){
                        continue;
                    }
                } else{
                    str += oldVal.charAt(n).trim();
                    bol = 0;
                }
            }
        }
        return str;
    };

    //数组是否包含
    Array.prototype.contains = function(item){
        return RegExp("(^|,)" + item.toString() + "($|,)").test(this);
    };
    //去掉数组中的重复项
    Array.prototype.unique = function() {
        var res = [], hash = {};
        for(var i=0, elem; (elem = this[i]) != null; i++) {
            if (!hash[elem]) {
                res.push(elem);
                hash[elem] = true;
            }
        }
        return res;
    };
    //数组转字符串
    Array.prototype.toStr=function(){
        var str = "", arr = this;
        if(arr == undefined){
            return str;
        }
        for(var i=0; i<arr.length; i++){
            var t = arr[i].trim();
            str += t;
            if(i<arr.length-1){
                str += ",";
            }
        }
        return str;
    };
    // 移除数组中指定元素
    Array.prototype.remove = function(val) {
        var index = this.indexOf(val);
        if (index > -1) {
            this.splice(index, 1);
        }
    };

    /*
     * Jquery扩展：序列化选择器下表单（不仅支持form，而且支持容器）
     * excludeNames: 要排除的name，多个之间逗号隔开  如：$('.searchForm').serializeJSON($('#selTreeId').attr('name'));
     * @see: $(selector).serializeJSON();
     */
    $.fn.serializeJSON=function(excludeNames){
        var o = {};
        var that = this;
        var eNames = [];//元素的name集合
        var formEles = {}; //兼容JQ的form表单
        var elements = $(that).find('input,textarea,select');
        if(0 == elements.length && 'FORM'==that.prop('tagName')){
            elements = that.serializeArray();
        }
        $(elements).each(function(_i,_o){
            var name = '';
            if(_o instanceof jQuery){
                name = $(_o).attr('name');
            }else{
                name = _o.name;
                var formVal = formEles[name];
                if(formVal==null){
                    formVal = _o.value;
                }else{
                    if(Object.prototype.toString.call(formVal) != '[object Array]'){
                        formVal = [formVal];
                    }
                    formVal.push( _o.value);
                }
                formEles[name]=formVal;
            }
            if(name && !eNames.contains(name)){
                //对name进行去重
                eNames.push(name);
            } 
        });

        var a = [];
        //取值
        $.each(eNames,function(i,o){
            var eleValue = null;
            var eles = $("*[_name='"+o+"']", that);//兼容formSelects的情况，原dom的name被改为_name
            if(eles.length == 0){
                eles = $("*[name='"+o+"']", that);
            }
            var eleType = eles.prop('type')||'';
            //处理checkbox的情况
            if('checkbox' == eleType){
                var values = [];
                $("input[name='" + o + "']:checked", that).each(function(r,ro){
                    if($(ro).prop('disabled')!=true){
                        values.push($(ro).val());
                    }
                });
                //一个值时，值类型为字符串；多个值时类型为数组
                if(values.length < 2){
                    eleValue = values.join();
                }else{
                    eleValue = values;
                }
            }
            //处理radio的情况
            else if('radio' == eleType){
                $("input[name='" + o + "']:checked", that).each(function(r,ro){
                    if($(ro).prop('disabled')!=true){
                        eleValue = $(ro).val();
                    }
                });
            }
            //处理select的情况
            else if(eleType.indexOf('select-')>-1){
                if(eles.prop('disabled')!=true){
                    //多选
                    if(eles.attr('xm-select') != undefined){
                        var values = [];
                        if (layui.formSelects) {
                            values = layui.formSelects.value(eles.attr('xm-select'), 'val');
                        }
                        eleValue = values;
                    }
                    else if(eleType=='select-multiple' || eles.hasClass('multiple')){
                        eleValue = eles.val();//数组
                    }
                    //单选
                    else{
                        eleValue = eles.val();
                    }
                }else{
                    return;
                }
            }
            else{
                var values = []; //name相同时，将值设为数组
                $.each(eles,function(eindex,eo){
                    if($(eo).prop('disabled')!=true){
                        values.push($(eo).val());
                    }
                });
                if(values.length == 1){
                    eleValue = values[0];
                }
                else if(values.length > 1){
                    eleValue = values;
                }
            }
            if(eleValue == undefined){
                if(eles.prop('disabled')!=true){
                    eleValue = formEles[o]; //从form序列化中取值
                }
            }
            a.push({name: o, value: eleValue});
        });
        //将a组装成对象o
        for(var i = 0;i<a.length;i++){
            var _this = a[i];
            if(excludeNames){
                if($.inArray(_this.name,excludeNames.split(','))>-1){
                    continue;
                }
            }
            var value = _this.value;
            var paths = _this.name.split(".");
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
        return o;
    };

    window.refresh=function(index){
        // index = index||0;
        // document.forms[index].submit();
        window.location.reload();
    };

    //查询重置
    window.searchAll=function(formInex, clearHidden){
        // formInex = formInex||0;
        // var formObj = document.forms[formInex];
        // Mom.clearForm(formObj,clearHidden);
        // //初始化分页参数
        // formObj['page.pageNo'].value = "1";
        // formObj['page.pageSize'].value = "10";
        // formObj.submit();
    };

    //初始化
    $(function(){
        $('.refresh-link').click(function(){
            window.location.reload();
        });
        //默认查询
        $("#search-btn,#btn-search").unbind('click').click(function(){
            try{
                pageLoad();
            }catch(e){
                console.error(e);
            }
        });


        //折叠ibox
        $('.collapse-link').click(function () {
            var ibox = $(this).closest('div.ibox');
            var button = $(this).find('i');
            var content = ibox.find('div.ibox-content');
            content.slideToggle(200);
            button.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
            setTimeout(function () {
                ibox.resize();
                ibox.find('[id^=map-]').resize();
            }, 50);
        });
        //左右折叠ibox
        $('.collapse-left-link').click(function () {
            var ibox = $(this).closest('div.leftBox');
            var button = $(this).find('i');
            var content = ibox.find('div.leftBox-content');
            content.slideToggle(200);
            button.toggleClass('fa-chevron-left').toggleClass('fa-chevron-right');
            if(button.hasClass('fa-chevron-left')){
                setTimeout(function () {
                    ibox.width("180px");
                    // ibox.find('[id^=map-]').resize();
                }, 200);
            }else{

                setTimeout(function () {
                    ibox.width("10px");
                    // ibox.find('[id^=map-]').resize();
                }, 200);

            }
        });
        //关闭ibox
        $('.close-link').click(function () {
            var content = $(this).closest('div.ibox');
            content.remove();
        });

    });
    module.exports = this;

});

