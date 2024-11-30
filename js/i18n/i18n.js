/*define(function(require, exports, module){
    var name = "somoveLanguage";
    /!*server*!/
    var ctx = window.document.location.href.substring(0,window.document.location.href.indexOf(window.document.location.pathname));
   /!* function renderLang(cookieLang){
        var zh=cookieLang.split('-')[0], lang=cookieLang.split('-')[1];
        var tabs = $(".J_iframe",top.document);
        $("[data-localize]").localize(zh, {pathPrefix: ctx+"/i18n/lang", language: lang});
        $.each(tabs,function(i,o){
            o.contentWindow.$("[data-localize]").localize(zh, {pathPrefix: ctx+"/i18n/lang", language: lang});
        });

    }*!/
    function renderLang(cookieLang){
        var zh=cookieLang.split('-')[0], lang=cookieLang.split('-')[1];
        $("[data-localize]").localize(zh, {pathPrefix: ctx+"/i18n/lang", language: lang});
    }

    return {
        renderLang:renderLang
    }
});*/

(function(){

    /**
     * 类似java中的hashmap的类，key必须为字符串，如果是数字，key中的 1和"1"被认为是相等的
     引用该类的时候，不能同时引用自定义创建的Object原形方法。这样会导致for(var key in object)
     这样遍历的时候将会把自定义的Object的原型方法加入。
     * @class
     */
    function Map(content, sep, equal) {
        this.elements = {};
        this.len = 0;
        this.separator = sep ? sep : ";";
        this.equal = equal ? equal : "=";
        this.merge(content);
    }

    Map.prototype.merge = function(str) {
        var s = str;
        //add by jzp 如果s为undefine会到只js异常,所以改成!s
        if (!s || s.length == 0) {
            return;
        }
        var sep = this.separator;
        if (sep == "\r\n") {
            sep = "\n";
        } else if (sep == null || sep.length == 0) {
            sep = ";";
        }
        var equal = this.equal;
        var i1 = 0;
        var i2 = s.indexOf(equal, i1);
        while (i2 != -1) {
            while (i1 < i2 && (s.charAt(i1) == sep || s.charAt(i1) == '\r'))
                i1++;// 支持:a=1\r\n\r\nb=2\r\n
            var key = s.substring(i1, i2);
            var value;
            i1 = i2 + equal.length;
            if (i1 < s.length && s.charAt(i1) == '"') {
                var func = new extractQuotedStr(s, "\"", i1);
                value = func.getValue();
                i1 = func.getEndIndex() + sep.length;
            } else {
                i2 = s.indexOf(sep, i1);
                if (i2 == -1) {
                    i2 = s.length;
                }
                value = s.substring(i1,
                    sep == '\n' && s.charAt(i2 - 1) == '\r' ? i2 - 1 : i2);
                i1 = i2 + sep.length;
            }
            i2 = s.indexOf(equal, i1);
            this.setValue(key, value);
        }
    }
    /**向map中加入一个key与value的对应，如果value = undefined 则value=null;
     key和value都允许为空，如果map中已经存在了key对应的value则替换原来的value
     并返回旧的value*/
    Map.prototype.put = function(key, value) {
        if (I18N.isUndefined(value))
            value = null;
        var v = this.elements[key];
        this.elements[key] = value;
        if (I18N.isUndefined(v)) { // 是undefined,说明map里面不存在key
            this.len++;
            return value;
        } else {
            return v;
        }
    }
    Map.prototype.push = Map.prototype.put;

    /**修改key的名字*/
    Map.prototype.renameKey = function(oldKey, newKey) {
        if (this.containsKey(oldKey)) {
            var oldValue = this.removeValue(oldKey);
            if (!this.containsKey(newKey)) { // //如果新的key已经存在,则不覆盖
                this.setValue(newKey, oldValue);
            }
        }
    }

    Map.prototype.containsKey = function(key) {
        // 使用in运算符的效率
        // 10000个属性查找10000次用时15毫秒
        // 10000个属性查找100000次用时172毫秒
        // 100000个属性查找10000次用时15毫秒
        // 100000个属性查找100000次用时172毫秒
        // return !isUndefined(this.elements[key]);此方法无法正确判断,因为如果加入的数据为put("abc",null),则调用containsKey("abc")返回false
        return key in this.elements;
    }

    /**
     * 将map中的key与value复制到自己中
     * */
    Map.prototype.putMap = function(map) {
        for ( var key in map.elements) {
            this.put(key, map.elements[key]);
        }
    }

    /**
     * 将map中的key和value复制到自己的Map中，忽略key的大小写，以map中的key覆盖当前Map中的key
     * @param {} map
     */
    Map.prototype.putMapIgnoreCase = function(map) {
        var keys = this.keySet();
        for ( var key in map.elements) {
            /**
             * 存在相同的key就直接覆盖，如果不存在，那么就查找是否有忽略大小写key相同的项，查找到后删除
             */
            if (this.contains(key)) {
                this.put(key, map.elements[key]);
            } else {
                var idx = keys.indexOfIgnoreCase(key);
                if (idx > -1) {
                    this.remove(keys[idx]);
                }
                this.put(key, map.elements[key]);
            }

        }
    }

    /**删除一个元素，并且返回这个元素的值*/
    Map.prototype.remove = function(_key) {
        var value = this.elements[_key];
        if (I18N.isUndefined(value))
            return null;
        delete this.elements[_key];
        this.len--;
        return value;
    }

    /**返回map中的元素个数*/
    Map.prototype.size = function() {
        return this.len;
    }
    Map.prototype.length = Map.prototype.size;

    /**获得一个key对应的值，并返回，如果key不存在，返回null*/
    Map.prototype.get = function(_key) {
        var i = 0;
        var value = null;
        if(!isNaN(_key)){
            for ( var key in this.elements) {
                if (i++ == _key) {
                    value = this.elements[key];
                    break;
                }
            }
        } else
            value = this.elements[_key];
        return value==undefined ? null : value;
    }

    /**判断key是否在map中存在*/
    Map.prototype.contains = function(_key) {
        var value = this.elements[_key];
        return value != undefined;
    }

    /**清除map中的所有类容*/
    Map.prototype.clear = function() {
        for ( var key in this.elements) {
            delete this.elements[key];
        }
        this.len = 0;
    }

    /**清除map中的所有的key的数组*/
    Map.prototype.keySet = function() {
        var keys = new Array();
        for ( var key in this.elements) {
            if (!I18N.isUndefined(key))
                keys.push(key);
        }
        return keys;
    }
    Map.prototype.valueSet = function() {
        var rs = new Array();
        for ( var key in this.elements) {
            if (I18N.isUndefined(key))
                continue;
            var s = this.elements[key];
            rs.push(s);
        }
        return rs;
    }

    Map.prototype.export2str2 = function(isKey, sep) {
        var arr = new Array();
        for ( var key in this.elements) {
            if (I18N.isUndefined(key))
                continue;
            if (isKey) {
                arr.push(key);
            } else {
                arr.push(this.elements[key]);
            }
        }
        return arr.join(sep ? sep : ";");
    }

    /**将所有的key和其对应的value导出到返回的字符串中
     key1=value1+separator+key2=value2.....*/
    Map.prototype.export2str = function(separator, equal) {
        var arr = new Array();
        var value = "";
        if (!equal)
            equal = "=";
        for ( var key in this.elements) {
            value = key;
            value += equal;
            var s = this.elements[key];
            if (s == null) {
                s = "";
            }
            if (I18N.isString(s)
                && ((s.indexOf(separator) != -1) || (s.indexOf(equal) != -1) || (s
                    .indexOf("\"") != -1))) {
                s = I18N.quotedStr(s, "\"");
            }
            value += s;
            arr.push(value);
        }
        return arr.join(separator ? separator : ";");
    }

    /**将所有的key和其对应的value导出到返回的字符串中
     key1=value1+separator+key2=value2.....*/
    Map.prototype.clone = function() {
        var map = new Map();

        map.len = this.len;
        map.separator = this.separator;
        map.equal = this.equal;

        map.elements = {};
        for ( var key in this.elements) {
            map.elements[key] = this.elements[key];
        }
        return map;
    }

    /**将自己的类容变成一个uri的参数串，用utf-8编码*/
    Map.prototype.export2uri = function() {
        return this.toString2(null, "&", true);
    }

    Map.prototype.toString2 = function(equal, separator, encode) {
        var rs = [];
        var value = "";
        if (!equal)
            equal = "=";
        if (!separator)
            separator = ";";
        var length = this.size();
        var cc;
        for ( var key in this.elements) {
            value = key;
            value += equal;
            cc = this.elements[key];
            if (cc == undefined || cc == null)
                cc = "";
            value += (!encode ? cc : encodeURIComponent(cc));
            rs.push(value);
        }
        return rs.join(separator);
    }

    /**返回[[name, value]]数组形式*/
    Map.prototype.toArray = function(encode) {
        encode = typeof (encode) == "boolean" ? encode : true;
        var rs = [];
        var s;
        for ( var key in this.elements) {
            s = this.elements[key];
            if (!s)
                s = "";
            rs.push([ key, !encode ? s : encodeURIComponent(s) ]);
        }
        return rs;
    }

    Map.prototype.getValue = function(key, def) {
        var v = this.get(key);
        return v == null ? def : v;
    }

    /**获取一个整形值。*/
    Map.prototype.getInt = function(key, def) {
        var s = this.getValue(key);
        return s ? parseInt(s) : (def != null ? def : 0);
    }

    /**获取一个整形值。*/
    Map.prototype.getFloat = function(key, def) {
        var s = this.getValue(key);
        return s ? parseFloat(s) : (def != null ? def : 0);
    }

    /**获得布尔值*/
    Map.prototype.getBool = function(key, def) {
        var s = this.getValue(key);
        return I18N.parseBool(s, def);
    }

    Map.prototype.dispose = function() {
    }
    /**设置此串在此对象中对应的值*/
    Map.prototype.setValue = function(key, value) {
        this.put(key, value);
    }

    /**删除此对象中的key和其对应的值，并返回对应的值，如果没有则返回def*/
    Map.prototype.removeValue = function(key, def) {
        var v = this.remove(key);
        if (v == null) {
            return def;
        } else {
            return v;
        }
    }

    /**返回elements*/
    Map.prototype.listEntry = function() {
        return this.elements;
    };

    /**
     * 将map转化成json对象
     * @return jsonobject
     */
    Map.prototype.toJson = function() {
        return this.elements;
    };

    /**
     * 将json对象转换为map
     * @return
     */
    Map.prototype.formJson = function(jsonobj) {
        this.clear();
        this.putJson(jsonobj);
    };

    /**
     * 将json添加到map
     * @return
     */
    Map.prototype.putJson = function(jsonobj) {
        for ( var key in jsonobj) {
            this.put(key, jsonobj[key]);
        }
    };

    Map.prototype.toString = function() {
        return this.export2str(this.separator);
    };

    Map.create = function(json) {
        var map = new Map();
        if (json)
            map.putJson(json);
        return map;
    };
    window.Map = Map;
    /**
     * 如对于:"ab""c"
     * a=1;b="1;2""3";c="567"
     * 1;2"3
     * */
    function extractQuotedStr(s, quote, startIndex) {
        this.s = s;
        this.quote = quote;
        this.startIndex = startIndex;
        this.value = "";
        this.endIndex = -1;
    }

    extractQuotedStr.prototype = {
        //返回提取的值
        getValue : function() {
            if ((this.s == null) || (this.s.length <= this.startIndex)
                || this.s.charAt(this.startIndex) != this.quote) {
                this.endIndex = -1;
                this.value = this.s;
                return this.value;
            }
            var i1 = this.startIndex + 1;
            var i = this.s.indexOf(this.quote, i1);
            while (i != -1) {
                if ((this.s.length > i + 1) && (this.s.charAt(i + 1) == this.quote)) {
                    i++;
                    this.value = this.value + this.s.substring(i1, i);
                } else {
                    this.value = this.value + this.s.substring(i1, i);
                    break;
                }
                i1 = i + 1;
                i = this.s.indexOf(this.quote, i1);
            }
            i = i == -1 ? this.startIndex + 1 : i;
            this.endIndex = (i1 == -1) ? -1 : i + 1;
            return this.value;
        },
        /*返回提取完值后的字符指针index*/
        getEndIndex : function() {
            return this.endIndex;
        },
        toString : function() {
            return this.getValue();
        }
    }
    window.extractQuotedStr = extractQuotedStr;

    var I18N ={
        properties: null,
        ctx: window.document.location.href.substring(0,window.document.location.href.indexOf(window.document.location.pathname)),
        text2Str: function (txt) {
            if(txt) {
                if(txt.indexOf(';') == txt.length-1){
                    txt = txt.substr(0,txt.length-1);
               }
               if(txt.startWith('\'') && txt.endWith('\'')){
                   txt = txt.substr(1,txt.length-2);
               }
               if(txt.startWith('\"') && txt.endWith('\"')){
                   txt = txt.substr(1,txt.length-2);
               }
            }
            if (txt.indexOf("\\") == -1) {
                return txt;
            }
            var result = [];

            for (var i = 0, len = txt.length; i < len;) {
                if (i == txt.length) {
                    break;
                }
                var c = txt.charAt(i);
                if (c == '\\') {
                    if (i + 1 == txt.length)
                        return result;// 单独出现的 '\\'不合法
                    var c2 = txt.charAt(i + 1);
                    switch (c2) {
                        case '\\' :
                            result.push('\\');
                            break;
                        case 'r' :
                            result.push('\r');
                            break;
                        case 'n' :
                            result.push('\n');
                            break;
                        case 't' :
                            result.push('\t');
                            break;
                        case 'u' : // 不合法的数字也过滤,主要是长度
                            if (i + 3 < txt.length) {// 满足\\u1F的结构
                                var c3 = txt.charAt(i + 2);
                                var c4 = txt.charAt(i + 3);
                                var n3 = EUI.hexToInt(c3);
                                var n4 = EUI.hexToInt(c4);
                                if ((n4 != -1) && (n3 != -1)) {
                                    result.push(String.fromCharCode(n3 * 16 + n4));
                                }
                                i += 2;
                            }
                    }
                    i += 2;
                }
                else {
                    result.push(c);
                    i += 1;
                }
            }
            return result.join('');
        },
        /**
         * 从服务器加载资源
         */
        loadResource : function(force) {
            //通过ajax获取服务器上当前会话相应的resource bundle并返回。
            try {//考虑到可能连不上服务器，将异常抓住
                // var root = I18N.getRootWindow();
                if (force || !I18N.properties) {
                    //直接用http请求对象，方便控制get请求方式
                    /*
					 * IMP:优化页面性能，暂去掉__t__时间戳，避免国际化在每个页面都要花费时间请求且无法利用浏览器本地缓存，
					 * 如果要做切换语言后的请求加载，需要后台传递时间或版本信息给前台做url标识
					 */
                    //var timestamp = "__t__=" + new Date().getTime();
                    var cookieLang = getCookie('somoveLanguage')||$('#ddlSomoveLanguage').val();
                    if(cookieLang==undefined || cookieLang==''){
                        cookieLang = navigator.language || navigator.browserLanguage;
                    }
                    cookieLang = cookieLang.toLowerCase();
                    $.ajax(
                        {
                            url: I18N.ctx+'/i18n/lang/js/'+cookieLang+'.js',
                            async : false,
                            success: function(result){
                                // console.log(result);
                                if(result) I18N.properties = new Map(result, "\n", "=");
                            },
                            error:function(e){
                                I18N.properties = new Map();
                                if (!!window["console"] && !!window["console"].log) {
                                    window["console"].log(e);
                                }
                            }
                        });
                    // if( !!force ){
                    //   ajax.setRequestHeader("x_force","true");//服务器根据此值判断是否要强制返回内容，否则缓存30分钟
                    // }
                }
            } catch (e) {
                I18N.properties = new Map();
                if (!!window["console"] && !!window["console"].log) {
                    window["console"].log(e);
                }
            }
        },
        /**
         * 获取国际化资源串。(参数顺序保持与JAVA代码一致，便于程序自动化处理)
         * @param {String} key 资源键
         * @param {String} def 默认值
         * @param {Array} args 格式化参数
         * @return 返回相应的资源串。
         */
        getString : function(key, def, args) {
            var str = "";
            // var root = I18N.getRootWindow();
            if (!I18N.properties)
                I18N.loadResource();
            str = I18N.properties.get(key);
            //有其它语言翻译没有合适的文字，文字给空白的情况，比如分页条的第《输入框》页。
            //由于中间是DOM元素，不好写参数，所有“第”单独做一个资源，翻译后，英文为空字符串
            if (!str && !I18N.properties.containsKey(key)) {
                if (!def) {
                    return key;// 没默认值时返回key值。
                } else {
                    str = def; // 找不到键值时，用def值
                }
            }
            str = I18N.text2Str(!str ? "" : str);


            if (!args) {
                return str;
            }
            var tokens = str.match(/{\d+}/g);
            if (!tokens) {
                return str;
            }
            for (var i = 0; i < tokens.length; i++) {
                str = str.replace(tokens[i], args[i]);
            }
            return str;
        },
        renderLang:function(cookieLang){
            var zh=cookieLang.split('-')[0], lang=cookieLang.split('-')[1];
            $("[data-localize]").localize(zh, {pathPrefix: I18N.ctx+"/i18n/lang", language: lang});
            $("input[type='text'],input[type='number']").each(function(i,o){
                var placeVal = $(o).attr('placeholder');
                if(placeVal){
                    placeVal = placeVal.replace(new RegExp(' ', "g"), "_");
                    placeVal = placeVal.replace(new RegExp('~', "g"), "_");
                    placeVal = placeVal.replace(new RegExp('!', "g"), "_");
                    placeVal = placeVal.replace(new RegExp('<', "g"), "_");
                    placeVal = placeVal.replace(new RegExp('>', "g"), "_");
                    placeVal = placeVal.replace(new RegExp('\\*', "g"), "_");
                    try{
                        var placeTxt = I18N.getString(placeVal);
                        $(o).attr('placeholder',!placeTxt?placeVal:placeTxt);
                        // $(o).attr('placeholder',eval(placeVal));
                    }catch (e) {
                    }
                }
            })
        },
        isUndefined: function(obj){
            return ((obj == undefined) && (typeof(obj) == "undefined"));
        }
    };
    window.I18N = I18N;
})(window);





