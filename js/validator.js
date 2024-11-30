/**
 * @author: Qiyh
 * 前端 valid表单校验、renderData表单赋值
 * DataType 支持以下类型: {
 *      Require: RegExp,
 *      Email: RegExp,
 *      Phone: RegExp,
 *      Mobile: RegExp,
 *      Tel: RegExp,
 *      Url: RegExp,
 *      IdCard: RegExp,
 *      Currency: RegExp,
 *      Zip: RegExp,
 *      QQ: RegExp,
 *      Number: RegExp,
 *      Integer: RegExp,
 *      Double: RegExp,
 *      English: RegExp,
 *      Chinese: RegExp,
 *      Safe: RegExp,
 *      Date: RegExp,
 *      DateTime: RegExp,
 *      Regex: Validator.DataType.Regex,
 *      IsDate: Validator.DataType.IsDate,
 *      Limit: Validator.DataType.Limit,
 *      LimitB: Validator.DataType.LimitB,
 *      Range: Validator.DataType.Range,
 *      Repeat: Validator.DataType.Repeat,
 *      Equal: Validator.DataType.Equal,
 *      NotEqual: Validator.DataType.NotEqual,
 *      GreaterThan: Validator.DataType.GreaterThan,
 *      GreaterEqualThan: Validator.DataType.GreaterEqualThan,
 *      LessThan: Validator.DataType.LessThan,
 *      LessEqualThan: Validator.DataType.LessEqualThan,
 *      CompareTime: Validator.DataType.CompareTime,
 *      Group: Validator.DataType.Group,
 *      Corn: Validator.DataType.Corn,
 *      Customer: Validator.DataType.Customer}, //自定义类型，需要validFN属性（值为函数名）
 * }
 *
 * 内置方法：
 * valid(theForm, mode) form校验
 *    @param theform: form对象
 *    @para mode: 显示方式（1.1/1.2/1.3/1.4/2/3/4）
 *
 * renderData(data, renderId) 动态给表单元素赋值
 *    @param data: 对象
 *    @param renderId: 要渲染的容器id
 */
var Validator = window.Validator || {
    ErrorItems:[],
    ErrorMessage:[],

    DataType: {
        /**
         * 正则类型校验
         */
        Require:/.+/,
        Email:/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
        /*固定电话:*/
        Phone:/^((\(\d{3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}$/,
        /*手机号:*/
        Mobile:/^((\+86)|(86))?(13|14|15|18|17)\d{9}$/,
        /*固话或手机号:*/
        Tel:/(^((\+86)|(86))?(13|14|15|18)\d{9}$)|(^((\(\d{3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}$)/,
        Url:/^(http|https):\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/,
        IdCard:/^\d{15}(\d{2}[A-Za-z0-9])?$/,
        Currency:/^\d+(\.\d+)?$/,
        Zip:/^[1-9]\d{6}$/,
        QQ:/^[1-9]\d{4,12}$/,
        Number:/^\d+$/,
        Integer:/^[-\+]?\d+$/,
        Double:/^[-\+]?\d+(\.\d+)?$/,   /*在属性添加scale='n'表示保留几位小数*/
        English:/^[A-Za-z]+$/,
        Chinese:/^[\u0391-\uFFE5]+$/,
        Safe:/^(?:\w*\s*)+$/,
        Date: /^(?:19|20)[0-9][0-9]-(?:(?:0{0,1}[1-9])|(?:1[0-2]))-(?:(?:[0-2]{0,1}[1-9])|(?:[1-3][0-1]))$/,   //yyyy-MM-dd格式
        DateTime:/^(?:19|20)[0-9][0-9]-(?:(?:0{0,1}[1-9])|(?:1[0-2]))-(?:(?:[0-2]{0,1}[1-9])|(?:[1-3][0-1])) (?:(?:[0-2][0-3])|(?:[0-1]{0,1}[0-9])):[0-5]{0,1}[0-9]{1}:[0-5]{0,1}[0-9]{1}$/, //yyyy-MM-dd HH:mm:ss格式
        /**
         * 函数类型校验
         */
        //正则类型
        Regex: function(ele, value){
            return Validator.ValidFns.Exec(value, ele.getAttribute('regexp'));
        },
        //是否日期类型，允许自定义格式
        IsDate: function(ele, value){
            Validator.RegularMsg.IsDate='值不是合法的日期格式';
            return !isNaN(new Date(value).getTime());
        },
        Limit: function(ele, value){
            var errmsg = ['字符数'];
            var valLen = value.length;
            var min=Number(ele.getAttribute('min')), max=Number(ele.getAttribute('max'));
            if(min>0 && valLen<min){
                errmsg.push('不能小于['+min+']个');
            }
            if(max>0 && valLen>max){
                if(errmsg.length == 2){
                    errmsg.push("也");
                }
                errmsg.push('不能大于['+max+']个');
            }
            if(errmsg.length > 1){
                Validator.RegularMsg.Limit=errmsg.join();
                return false;
            }
        },
        LimitB: function(ele, value){
            var errmsg = ['字节数'];
            var valLen = Validator.ValidFns.LenB(value);
            var min=Number(ele.getAttribute('min')), max=Number(ele.getAttribute('max'));
            if(min>0 && valLen<min){
                errmsg.push('不能小于['+min+']个');
            }
            if(max>0 && valLen>max){
                if(errmsg.length == 2){
                    errmsg.push("也");
                }
                errmsg.push('不能大于['+max+']个');
            }
            if(errmsg.length > 1){
                Validator.RegularMsg.LimitB=errmsg.join();
                return false;
            }
        },
        Range: function(ele, value){
            var min=ele.getAttribute('min'), max=ele.getAttribute('max');
            if(min && max){
                Validator.RegularMsg.Range='值必须在'+min+' ~ '+max+'之间';
                return Number(min)<=Number(value) && Number(max)>=Number(value);
            }
            else if(min){
                Validator.RegularMsg.Range='值必须大于等于'+min;
                return Number(min)<=Number(value);
            }
            else if(max){
                Validator.RegularMsg.Range='值必须小于等于'+max;
                return Number(max)>=Number(value);
            }
        },
        Repeat: function(ele, value){
            var to=ele.getAttribute('to');
            if(!to){
                throw 'the attr of [to] cannot be null, if dataType is: Repeat.';
            }
            var toObj=document.getElementById(to)||document.getElementsByName(to)[0];
            Validator.RegularMsg.Repeat='值与'+(toObj.getAttribute('label')||'目标')+'不一致';
            return value==toObj.value;
        },
        Equal: function(ele, value){
            var to=ele.getAttribute('to');
            if(!to){
                throw 'the attr of [to] cannot be null, if dataType is: Equal.';
            }
            var toObj=document.getElementById(to)||document.getElementsByName(to)[0];
            Validator.RegularMsg.Equal='值必须等于'+(toObj.getAttribute('label')?(toObj.getAttribute('label')+'的'):'值：')+toObj.value;
            return value==toObj.value;
        },
        NotEqual: function(ele, value){
            var to=ele.getAttribute('to');
            if(!to){
                throw 'the attr of [to] cannot be null, if dataType is: NotEqual.';
            }
            var toObj=document.getElementById(to)||document.getElementsByName(to)[0];
            Validator.RegularMsg.NotEqual='值不能等于'+(toObj.getAttribute('label')?(toObj.getAttribute('label')+'的'):'值：')+toObj.value;
            return value!=toObj.value;
        },
        GreaterThan: function(ele, value){
            return Validator.ValidFns.compareTo(value, ele.getAttribute('to'), 'GreaterThan');
        },
        GreaterEqualThan: function(ele, value){
            return Validator.ValidFns.compareTo(value, ele.getAttribute('to'), 'GreaterEqualThan');
        },
        LessThan: function(ele, value){
            return Validator.ValidFns.compareTo(value, ele.getAttribute('to'), 'LessThan');
        },
        LessEqualThan: function(ele, value){
            return Validator.ValidFns.compareTo(value, ele.getAttribute('to'), 'LessEqualThan');
        },
        CompareTime: function(ele, value){
            var to=ele.getAttribute('to');
            if(!to){
                throw 'the attr of [to] cannot be null, if dataType is: Repeat.';
            }
            var toObj=document.getElementById(to)||document.getElementsByName(to)[0];
            var toValue = toObj.value;
            if(toValue){
                Validator.RegularMsg.CompareTime = "值必须在时间"+toValue+"之后";
                if(typeof(value) == 'string'){
                    value = new Date(value);
                }
                if(typeof(toValue) == 'string'){
                    toValue = new Date(toValue);
                }
                return value.getTime() >= toValue.getTime();
            }
        },
        Group: function(ele, value){
            var errmsg = ['选中的值必须'];
            var valLen = value.split(',').length;
            var min=Number(ele.getAttribute('min')), max=Number(ele.getAttribute('max'));
            if(min>0 && valLen<min){
                errmsg.push('大于'+min+'个')
            }
            if(max>0 && valLen>max){
                if(errmsg.length == 2){
                    errmsg.push('并且');
                }
                errmsg.push('小于'+max+'个');
            }
            if(errmsg.length > 1){
                Validator.RegularMsg.Group = errmsg.join();
                return false;
            }
        },

        Corn: function(ele, value){
            return Validator.ValidFns.isCronExpress(Validator.trim(value));
        },

        //自定义校验
        Customer: function(ele, value){
            var validFn = ele.getAttribute('validFN');
            if(validFn){
                window[validFn](ele, value);
            }else{
                console.warn("can not found the value of attr 'validFN' which dataType is: Customer.")
            }
        },
    },
    //正则对应的错误信息
    RegularMsg:{
        Require: "值不能为空",
        Email: "值不是合法的Email格式",
        Phone: "值不是合法的电话号码的格式",
        Mobile: "值不是合法的手机号码格式",
        Tel: "值不是合法的电话号码的格式",
        Url: "值不是合法的Url格式",
        IdCard: "值不是合法的身份证格式",
        Currency: "值不是合法的货币格式",
        Zip: "值不是合法的邮编格式",
        QQ: "值不是合法的QQ号码格式",
        Number: "值不是有效数字",  //不带服务的整数
        Integer: "值不是整数",   //带符号的整数
        Double: "值不是数值",
        English: "值不全为字母",
        Chinese: "值不全为汉字",
        Safe: "值不是合法的格式",
        DateTime: "值不是合法的日期格式",
        Cron: "corn表达式不正确",
        Error: "值校验不通过"
    },
    //校验函数库
    ValidFns: {
        LenB:function(str) {
            return str.replace(/[^\x00-\xff]/g, "**").length;
        },
        compareTo: function(value, to, dataType){
            if (isNaN(value)) {
                Validator.RegularMsg[dataType]='值不是有效的数字';
                return false;
            }
            dataType = dataType||'compareTo';
            if(!to){
                throw 'the attr of [to] cannot be null, if dataType is: '+dataType+'.';
            }
            var toObj=document.getElementById(to)||document.getElementsByName(to)[0];
            if (isNaN(toObj.value)) {
                Validator.RegularMsg[dataType]='目标的值不是有效的数字';
                return false;
            }
            if(dataType == 'GreaterThan'){
                Validator.RegularMsg[dataType]='值必须大于'+toObj.value;
                return Number(value)>Number(toObj.value);
            }
            if(dataType == 'GreaterEqualThan'){
                Validator.RegularMsg[dataType]='值必须大于等于'+toObj.value;
                return Number(value)>=Number(toObj.value);
            }
            if(dataType == 'LessThan'){
                Validator.RegularMsg[dataType]='值必须小于'+toObj.value;
                return Number(value)<Number(toObj.value);
            }
            if(dataType == 'LessEqualThan'){
                Validator.RegularMsg[dataType]='值必须小于等于'+toObj.value;
                return Number(value)<=Number(toObj.value);
            }
            Validator.RegularMsg[dataType]='值必须等于'+toObj.value;
            return Number(value)==Number(toObj.value);
        },

        Exec:function(op, reg) {
            return new RegExp(reg, "g").test(op);
        },

        isCronExpress : function(cronExpression) {
            function checkField(secondsField, minimal, maximal) {
                if (secondsField.indexOf("-") > -1) {
                    var startValue = secondsField.substring(0, secondsField.indexOf("-"));
                    var endValue = secondsField.substring(secondsField.indexOf("-") + 1);

                    if (!(checkIntValue(startValue, minimal, maximal, true) && checkIntValue(endValue, minimal, maximal, true))) {
                        return false;
                    }
                    try {
                        var startVal = parseInt(startValue, 10);
                        var endVal = parseInt(endValue, 10);

                        return endVal > startVal;
                    } catch (e) {
                        return false;
                    }
                } else if (secondsField.indexOf(",") > -1) {
                    return checkListField(secondsField, minimal, maximal);
                } else if (secondsField.indexOf("/") > -1) {
                    return checkIncrementField(secondsField, minimal, maximal);
                } else if (secondsField.indexOf("*") != -1) {
                    return true;
                } else {
                    return checkIntValue(secondsField, minimal, maximal);
                }
            }
            function checkFieldWithLetter(value, letter, minimalBefore, maximalBefore, minimalAfter, maximalAfter) {
                var canBeAlone = false;
                var canHaveIntBefore = false;
                var canHaveIntAfter = false;
                var mustHaveIntBefore = false;
                var mustHaveIntAfter = false;

                if (letter == "L") {
                    canBeAlone = true;
                    canHaveIntBefore = true;
                    canHaveIntAfter = false;
                    mustHaveIntBefore = false;
                    mustHaveIntAfter = false;
                }
                if (letter == "W" || letter == "C") {
                    canBeAlone = false;
                    canHaveIntBefore = true;
                    canHaveIntAfter = false;
                    mustHaveIntBefore = true;
                    mustHaveIntAfter = false;
                }
                if (letter == "#") {
                    canBeAlone = false;
                    canHaveIntBefore = true;
                    canHaveIntAfter = true;
                    mustHaveIntBefore = true;
                    mustHaveIntAfter = true;
                }
                var beforeLetter = "";
                var afterLetter = "";
                if (value.indexOf(letter) >= 0) {
                    beforeLetter = value.substring(0, value.indexOf(letter));
                }
                if (!value.endsWith(letter)) {
                    afterLetter = value.substring(value.indexOf(letter) + 1);
                }
                if (value.indexOf(letter) >= 0) {
                    if (letter == value) {
                        return canBeAlone;
                    }
                    if (canHaveIntBefore) {
                        if (mustHaveIntBefore && beforeLetter.length == 0) {
                            return false;
                        }
                        if (!checkIntValue(beforeLetter, minimalBefore, maximalBefore, true)) {
                            return false;
                        }
                    } else {
                        if (beforeLetter.length > 0) {
                            return false;
                        }
                    }
                    if (canHaveIntAfter) {
                        if (mustHaveIntAfter && afterLetter.length == 0) {
                            return false;
                        }

                        if (!checkIntValue(afterLetter, minimalAfter, maximalAfter, true)) {
                            return false;
                        }
                    } else {
                        if (afterLetter.length > 0) {
                            return false;
                        }
                    }
                }

                return true;
            }
            function checkListField(value, minimal, maximal) {
                var st = value.split(",");

                var values = new Array(st.length);

                for (var j = 0; j < st.length; j++) {
                    values[j] = st[j];
                }

                var previousValue = -1;

                for (var i = 0; i < values.length; i++) {
                    var currentValue = values[i];

                    if (!checkIntValue(currentValue, minimal, maximal, true)) {
                        return false;
                    }

                    try {
                        var val = parseInt(currentValue, 10);

                        if (val <= previousValue) {
                            return false;
                        } else {
                            previousValue = val;
                        }
                    } catch (e) {
                        // we have always an int
                    }
                }
                return true;
            }
            function checkIncrementField(value, minimal, maximal) {
                var start = value.substring(0, value.indexOf("/"));
                var increment = value.substring(value.indexOf("/") + 1);
                if (!("*" == start)) {
                    return checkIntValue(start, minimal, maximal, true) && checkIntValue(increment, minimal, maximal, false);
                } else {
                    return checkIntValue(increment, minimal, maximal, true);
                }
            }
            function checkIntValue(value, minimal, maximal, checkExtremity) {
                try {
                    var val = parseInt(value, 10);
                    //判断是否为整数
                    if (value == val) {
                        if (checkExtremity) {
                            if (val < minimal || val > maximal) {
                                return false;
                            }
                        }

                        return true;
                    }

                    return false;
                } catch (e) {
                    return false;
                }
            }
            function checkYearField(yearField) {
                return checkField(yearField, 1970, 2099);
            }
            function checkMonthsField(monthsField) {
                /*        monthsField = StringUtils.replace( monthsField, "JAN", "1" );
                        monthsField = StringUtils.replace( monthsField, "FEB", "2" );
                        monthsField = StringUtils.replace( monthsField, "MAR", "3" );
                        monthsField = StringUtils.replace( monthsField, "APR", "4" );
                        monthsField = StringUtils.replace( monthsField, "MAY", "5" );
                        monthsField = StringUtils.replace( monthsField, "JUN", "6" );
                        monthsField = StringUtils.replace( monthsField, "JUL", "7" );
                        monthsField = StringUtils.replace( monthsField, "AUG", "8" );
                        monthsField = StringUtils.replace( monthsField, "SEP", "9" );
                        monthsField = StringUtils.replace( monthsField, "OCT", "10" );
                        monthsField = StringUtils.replace( monthsField, "NOV", "11" );
                        monthsField = StringUtils.replace( monthsField, "DEC", "12" );*/

                monthsField.replace("JAN", "1");
                monthsField.replace("FEB", "2");
                monthsField.replace("MAR", "3");
                monthsField.replace("APR", "4");
                monthsField.replace("MAY", "5");
                monthsField.replace("JUN", "6");
                monthsField.replace("JUL", "7");
                monthsField.replace("AUG", "8");
                monthsField.replace("SEP", "9");
                monthsField.replace("OCT", "10");
                monthsField.replace("NOV", "11");
                monthsField.replace("DEC", "12");

                return checkField(monthsField, 1, 31);
            }
            function checkDayOfMonthField(dayOfMonthField) {
                if (dayOfMonthField == "?") {
                    return true;
                }

                if (dayOfMonthField.indexOf("L") >= 0) {
                    return checkFieldWithLetter(dayOfMonthField, "L", 1, 7, -1, -1);
                } else if (dayOfMonthField.indexOf("W") >= 0) {
                    return checkFieldWithLetter(dayOfMonthField, "W", 1, 31, -1, -1);
                } else if (dayOfMonthField.indexOf("C") >= 0) {
                    return checkFieldWithLetter(dayOfMonthField, "C", 1, 31, -1, -1);
                } else {
                    return checkField(dayOfMonthField, 1, 31);
                }
            }
            function checkDayOfWeekField(dayOfWeekField) {
                /*  dayOfWeekField = StringUtils.replace( dayOfWeekField, "SUN", "1" );
                    dayOfWeekField = StringUtils.replace( dayOfWeekField, "MON", "2" );
                    dayOfWeekField = StringUtils.replace( dayOfWeekField, "TUE", "3" );
                    dayOfWeekField = StringUtils.replace( dayOfWeekField, "WED", "4" );
                    dayOfWeekField = StringUtils.replace( dayOfWeekField, "THU", "5" );
                    dayOfWeekField = StringUtils.replace( dayOfWeekField, "FRI", "6" );
                    dayOfWeekField = StringUtils.replace( dayOfWeekField, "SAT", "7" );*/
                dayOfWeekField.replace("SUN", "1");
                dayOfWeekField.replace("MON", "2");
                dayOfWeekField.replace("TUE", "3");
                dayOfWeekField.replace("WED", "4");
                dayOfWeekField.replace("THU", "5");
                dayOfWeekField.replace("FRI", "6");
                dayOfWeekField.replace("SAT", "7");
                if (dayOfWeekField == "?") {
                    return true;
                }
                if (dayOfWeekField.indexOf("L") >= 0) {
                    return checkFieldWithLetter(dayOfWeekField, "L", 1, 7, -1, -1);
                } else if (dayOfWeekField.indexOf("C") >= 0) {
                    return checkFieldWithLetter(dayOfWeekField, "C", 1, 7, -1, -1);
                } else if (dayOfWeekField.indexOf("#") >= 0) {
                    return checkFieldWithLetter(dayOfWeekField, "#", 1, 7, 1, 5);
                } else {
                    return checkField(dayOfWeekField, 1, 7);
                }
            }
            function checkHoursField(hoursField) {
                return checkField(hoursField, 0, 23);
            }
            function checkMinutesField(minutesField) {
                return checkField(minutesField, 0, 59);
            }
            function checkSecondsField(secondsField) {
                return checkField(secondsField, 0, 59);
            }

            var cronParams = cronExpression.split(" ");
            if (cronParams.length < 6 || cronParams.length > 7) {
                return false;
            }
            //CronTrigger cronTrigger = new CronTrigger();
            //cronTrigger.setCronExpression( cronExpression );

            if (cronParams[3] == "?" || cronParams[5] == "?") {
                //Check seconds param
                if (!checkSecondsField(cronParams[0])) {
                    return false;
                }
                //Check minutes param
                if (!checkMinutesField(cronParams[1])) {
                    return false;
                }

                //Check hours param
                if (!checkHoursField(cronParams[2])) {
                    return false;
                }

                //Check day-of-month param
                if (!checkDayOfMonthField(cronParams[3])) {
                    return false;
                }

                //Check months param
                if (!checkMonthsField(cronParams[4])) {
                    return false;
                }

                //Check day-of-week param
                if (!checkDayOfWeekField(cronParams[5])) {
                    return false;
                }

                //Check year param
                if (cronParams.length == 7) {
                    if (!checkYearField(cronParams[6])) {
                        return false;
                    }
                }
                return true;
            } else {
                return false;
            }
        },

    },

    valid:function(theForm, mode){
        Validator.ErrorItems = [document.forms[0]];
        Validator.ErrorMessage = ["以下原因导致操作失败：\t\t\t\t"];
        var formObj = theForm || event.srcElement;
        if (formObj!=null){
            if(formObj instanceof jQuery){
                formObj = formObj[0];
            }
            if (formObj.tagName.toUpperCase()!="FORM"){
                formObj=formObj.form;
            }
        }
        if (formObj==null || formObj.tagName.toUpperCase()!="FORM"){
            alert("没有定义form对象");
            return false;
        }
        var validElements = []; //需要校验的表单元素
        var duplicateName = []; //radio、checkbox多个相同的name避免重复校验
        var count = formObj.elements.length;
        for (var i = 0; i < count; i++) {
            var ele = formObj.elements[i];
            var eleType = ele.type;
            if(!eleType) continue;
            var eleName = ele.getAttribute("name");
            //if(!eleName) continue;
            var require = ele.getAttribute("require")||'';
            var dataType = ele.getAttribute("dataType")||'';
            if('true'!=require && ''==dataType){
                continue;
            }
            Validator.ClearState(ele);
            var eleVals = [];   //用数组存放value，兼容checkbox和select-multiple情况
            if(eleType=='checkbox' || eleType=='radio'){
                //判断是否已经校验过
                if(eleName) {
                    if (Validator.ArrayContains(duplicateName, eleName)) {
                        continue;
                    }
                    duplicateName.push(eleName);
                    var curEles = document.getElementsByName(eleName);
                    for (var e = 0; e < curEles.length; e++) {
                        if (curEles[e].checked) {
                            eleVals.push(curEles[e].value);
                        }
                    }
                }
            }
            else if(eleType == 'select-multiple'){
                var select = ele;
                for(var ep=0;ep<select.options.length;ep++){
                    if(select.options[ep].selected){
                        eleVals.push(select[ep].value);
                    }
                }
            }
            else{
                eleVals.push(ele.value);
            }
            validElements.push({
                element: ele,
                value: eleVals
            });
        }
        //开始对需要的表单元素进行校验
        for(var v=0; v<validElements.length; v++){
            var eleObj = validElements[v];
            var ele = eleObj.element;
			//返回false或错误信息时表示校验失败
            var errmsg = Validator.validOne(ele, eleObj.value);
            if(errmsg != undefined && errmsg!=true && errmsg!==''){
				if(errmsg == false){
					var msgKey = ele.getAttribute("dataType")||'';
					errmsg = Validator.RegularMsg[msgKey];
				}
                if(!errmsg){
                    errmsg = Validator.RegularMsg.Error;
                }
                Validator.AddError(ele, errmsg);
            }
        }
        //显示错误信息
        return Validator.showError(mode);
    },

    validOne: function(ele, values){
        var require = ele.getAttribute("require")||'';
        var dataTypes = ele.getAttribute("dataType")||'';//dataType可以同时为多个，用分号(;)隔开
        var value = values.join();
        if('true' == require){
			if(value == ''){
				return Validator.RegularMsg.Require;
			}
        }
        if (!dataTypes) return true;
        var dataTypeArr = dataTypes.split(";");
        for(var i=0; i<dataTypeArr.length; i++){
            var dt = dataTypeArr[i];
            var validProcess = Validator.DataType[dt];
            if (dt=='' || typeof(validProcess) == "undefined"){
                continue;
            }
            //正则
            if(typeof(validProcess) == "object"){
                if(value == ''){
                    if(dt != 'Require'){
                        continue;
                    }
                }
                if (!validProcess.test(value)) {
                    return false;
                }else if(dt == 'Double'){
                    var scale = ele.getAttribute('scale');
                    if(scale){
                        var theValArr = value.split(".");
                        if(theValArr.length==2 && theValArr[1].length>scale){
                            return '值只能有'+scale+'位有效小数';
                        }
                    }
                }
            }
            //函数字符串
            else if(typeof(validProcess) == "string"){
                if(value == ''){
                    continue;
                }
                var validProcessFn = "(function(validator){with(validator){"+validProcess+"}})(this)";
                with(ele){
                    var flag = eval(validProcessFn);
                    if(!flag){
                        return RegularMsg[dt]||RegularMsg.Error;
                    }
                }
            }
            //真正的函数
            else if(typeof(validProcess) == "function"){
                return validProcess(ele, value);
            }
        }

    },

    AddError:function(ele, str) {
        Validator.ErrorItems[Validator.ErrorItems.length] = ele;
        Validator.ErrorMessage[Validator.ErrorMessage.length] = str||'';
    },

    showError: function(mode){
        if (Validator.ErrorMessage.length > 1) {
            mode = mode || 1;
            var errCount = Validator.ErrorItems.length;
            //支持jquery和Layer时
            if(window.jQuery && window.layer){
                if(mode < 2){
                    var pos = 3;
                    mode = mode.toString();
                    if(mode.indexOf(".") > 0){
                        pos = mode.substr(mode.indexOf(".")+1);
                    }
                    for (var j = 1; j < errCount; j++) {
                        var ele = Validator.ErrorItems[j];
                        if(ele.type=='checkbox' || ele.type=='radio'){
                            ele = ele.parentNode;//在父标签上显示提示信息
                        }
                        //tips:弹出位置（1:上；2:右；3:下；4:左）
                        /*layer.tips(Validator.ErrorMessage[j], ele, {tips:3, time:4000, tipsMore:true});*/
                        layer.tips(Validator.ErrorMessage[j], ele, {tips:[pos, '#F90'], tipsMore:true} );
                    }
                }else{
                    var erMsgStr = Validator.ErrorMessage[0]+"<br>";
                    for(var m=1; m<Validator.ErrorMessage.length; m++){
                        var ele = Validator.ErrorItems[m];
                        erMsgStr += m+": "+(ele.getAttribute("label")||ele.getAttribute("name")||'')+'的'+Validator.ErrorMessage[m]+"<br>";
                    }
                    Mom.top().layer.alert(erMsgStr, {
                        skin: mode=='2.1'?'layui-layer-lan': (Const.layerSkin() || ''),
                        title: '警告',
                        closeBtn: 0,
                        anim: 5 //动画类型
                    });
                }
            }
            else{
                if(mode == 2){
                    for (var j = 1; j < errCount; j++) {
                        try {
                            var span = document.createElement("SPAN");
                            span.id = "__ErrorMessagePanel";
                            span.style.color = "red";
                            Validator.ErrorItems[j].parentNode.appendChild(span);
                            span.innerHTML = Validator.ErrorMessage[j].replace(/\d+:/, "*");
                        } catch(e) {
                            alert(e.description);
                        }
                    }
                    Validator.ErrorItems[1].focus();
                }
                else if(mode == 3){
                    var errEle = Validator.ErrorItems[1];
                    errEle.style.color = "blue";
                    var light = 0;
                    var intval = setInterval(function(){
                        errEle.style.color = light%2 == 0?"red":"blue";
                        light ++;
                        if(light == 5){
                            clearInterval(intval);
                        }
                    },300);//闪烁5次
                    Validator.ErrorItems[1].focus();
                }
                else {
                    var erMsgStr = Validator.ErrorMessage[0]+"<br>";
                    for(var m=1; m<Validator.ErrorMessage.length; m++){
                        var ele = Validator.ErrorItems[m];
                        erMsgStr += m+": "+(ele.getAttribute("label")||ele.getAttribute("name")||'')+'的'+Validator.ErrorMessage[m]+"<br>";
                    }
                    alert(erMsgStr);
                    try{
                        Validator.ErrorItems[1].focus();
                    }catch(e){}
                }
            }
            return false;
        }
        return true;
    },

    ArrayContains: function(arr, val){
        return RegExp("(^|,)" + val.toString() + "($|,)").test(arr);
    },
    ClearState:function(elem) {
        with (elem) {
            if (style.color == "red") style.color = "";
            var lastNode = parentNode.childNodes[parentNode.childNodes.length - 1];
            if (lastNode.id == "__ErrorMessagePanel") parentNode.removeChild(lastNode);
        }
    },
    dateFormat: function(date,fmt) {
        if(typeof(date)=='string'){
            date = new Date(date);
        }
        var opt = {
            "y+": date.getFullYear().toString(),        // 年
            "M+": (date.getMonth() + 1).toString(),     // 月
            "d+": date.getDate().toString(),            // 日
            "H+": date.getHours().toString(),           // 时
            "m+": date.getMinutes().toString(),         // 分
            "s+": date.getSeconds().toString()          // 秒
            // 有其他格式化字符需求可以继续添加，必须转化成字符串
        };
        for (var k in opt) {
            var ret = new RegExp("(" + k + ")").exec(fmt);
            if (ret) {
                fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
            }
        }
        return fmt;
    },

    /*
     根据〖中华人民共和国国家标准 GB 11643-1999〗中有关公民身份号码的规定，公民身份号码是特征组合码，由十七位数字本体码和一位数字校验码组成。排列顺序从左至右依次为：六位数字地址码，八位数字出生日期码，三位数字顺序码和一位数字校验码。
     地址码表示编码对象常住户口所在县(市、旗、区)的行政区划代码。
     出生日期码表示编码对象出生的年、月、日，其中年份用四位数字表示，年、月、日之间不用分隔符。
     顺序码表示同一地址码所标识的区域范围内，对同年、月、日出生的人员编定的顺序号。顺序码的奇数分给男性，偶数分给女性。
     校验码是根据前面十七位数字码，按照ISO 7064:1983.MOD 11-2校验码计算出来的检验码。

     出生日期计算方法。
     15位的身份证编码首先把出生年扩展为4位，简单的就是增加一个19或18,这样就包含了所有1800-1999年出生的人;
     2000年后出生的肯定都是18位的了没有这个烦恼，至于1800年前出生的,那啥那时应该还没身份证号这个东东，⊙﹏⊙b汗...
     下面是正则表达式:
     出生日期1800-2099  (18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])
     身份证正则表达式 /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i
     15位校验规则 6位地址编码+6位出生日期+3位顺序号
     18位校验规则 6位地址编码+8位出生日期+3位顺序号+1位校验位
     校验位规则     公式:∑(ai×Wi)(mod 11)……………………………………(1)
     公式(1)中：
     i----表示号码字符从由至左包括校验码在内的位置序号；
     ai----表示第i位置上的号码字符值；
     Wi----示第i位置上的加权因子，其数值依据公式Wi=2^(n-1）(mod 11)计算得出。
     i 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1
     Wi 7 9 10 5 8 4 2 1 6 3 7 9 10 5 8 4 2 1
     */
    //身份证号合法性验证
    //支持15位和18位身份证号
    //支持地址编码、出生日期、校验位验证
    IdentityCodeValid: function(code) {
        var tip = "";
        if(code=='')return tip;
        var city = { 11 : "北京", 12 : "天津", 13 : "河北", 14 : "山西", 15 : "内蒙古", 21 : "辽宁",
            22 : "吉林", 23 : "黑龙江 ", 31 : "上海", 32 : "江苏", 33 : "浙江", 34 : "安徽",
            35 : "福建", 36 : "江西", 37 : "山东", 41 : "河南", 42 : "湖北 ", 43 : "湖南",
            44 : "广东", 45 : "广西", 46 : "海南", 50 : "重庆", 51 : "四川", 52 : "贵州",
            53 : "云南", 54 : "西藏 ", 61 : "陕西", 62 : "甘肃", 63 : "青海", 64 : "宁夏",
            65 : "新疆", 71 : "台湾", 81 : "香港", 82 : "澳门", 91 : "国外 "
        };
        if (!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)) {
            tip = "身份证号格式错误";
        }
        else if (!city[code.substr(0, 2)]) {
            tip = "地址编码错误";
        } else {
            // 18位身份证需要验证最后一位校验位
            if (code.length == 18) {
                code = code.split('');
                // ∑(ai×Wi)(mod 11)
                // 加权因子
                var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
                // 校验位
                var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
                var sum = 0;
                var ai = 0;
                var wi = 0;
                for ( var i = 0; i < 17; i++) {
                    ai = code[i];
                    wi = factor[i];
                    sum += ai * wi;
                }
                var last = parity[sum % 11];
                if (parity[sum % 11] != code[17].toUpperCase()) {
                    tip = "校验位错误";
                }
            }
        }
        return tip;
    },

    /**
     * 检查表单值是否为空
     */
    checkNull: function(formElement,info) {
        var isNull = false;
        var obj = formElement;
        if (formElement != null) {
            if(typeof(formElement)=='string'){
                obj = document.forms[0][formElement];
            }
            if (obj.value.trim() == "") {
                isNull=true;
                if(info!=null && info!=undefined){
                    window.alert(info);
                }
                try{
                    obj.focus();
                }catch(err){}
            }
        }
        return isNull;
    },

    /**
     * 验证单选组是否选择
     * @param _obj
     * @returns {boolean}
     */
    checkRadiosIsSelected: function (_obj){
        var flag=false;
        var objs = _obj;
        if(typeof(_obj)=='string'){
            objs = document.getElementsByName(_obj);
        }
        if(objs==undefined || 0==objs.length)
            return true;
        for(var i=0;i<objs.length;i++) {
            if(objs[i].checked) {
                flag = true;
                break;
            }
        }
        return flag;
    },

    /**
     * 设置复选框的选中状态
     */
    setCheckboxValue: function(name,values){
        var objs=document.getElementsByName(name);
        if(objs == null || values==null) return;
        var valArr = values;
        if(valArr.constructor == String){
            valArr = String(values).split(',');
        }
        var len=objs.length;
        for(var i=0;i<len;i++) {
            if(Validator.ArrayContains(valArr,objs[i].value)){
                if($(objs[i]).hasClass('i-checks')){
                    $(objs[i]).iCheck('check');
                }else{
                    objs[i].checked = true;
                }
            }else{
                if($(objs[i]).hasClass('i-checks')){
                    $(objs[i]).iCheck('uncheck');
                }else{
                    objs[i].checked = false;
                }
            }
        }
        try{$("input[name='"+name +"']").trigger("change");}catch(e){}
    },

    /**
     * 获取表单默认值
     * @param obj
     * @returns {*}
     */
    getDefaultVal: function(obj){
        var eleType = obj.type;
        if(eleType == "select-one"){
            var dropdown = obj.options;
            for (var i = dropdown.length-1; i >= 0; i--) {
                if (dropdown[i].defaultSelected) {
                    return dropdown[i].value;
                }
            }
        }else{
            return obj.defaultValue;
        }
    },

    /**
     * 获取复选框的值
     */
    getCheckboxValue: function(name){
        var val = [];
        var objs=document.getElementsByName(name);
        if(objs==null || objs.length==0){
            return '';
        }
        var len=objs.length;
        for(var i=0;i<len;i++) {
            if(objs[i].checked){
                val.push(objs[i].value);
            }
        }
        return val.join(",");
    },

    /**
     * 获取单选按钮的值
     */
    getRadiosValue: function(name){
        var objs=document.getElementsByName(name);
        if(objs == null)
            return "";
        for(var i=0;i<objs.length;i++) {
            if(objs[i].checked) {
                return objs[i].value;
            }
        }
        return "";
    },

    /**
     * 获取选择的下拉框的text
     * @param obj selector对象
     * @return string
     */
    getOptionText: function(obj){
        var val="";
        for(var i=0; i < obj.options.length; i++){
            if (obj.options[i].selected && obj.value!=""){
                val = obj.options[i].text;
                break;
            }
        }
        return val;
    },

    /**
     * 设置复选框/单选框 全(不)选
     */
    allRadiosSelect: function(name,flag){
        var objs=document.getElementsByName(name);
        for(var i=0;i<objs.length;i++) {
            if(null!=objs[i]) {
                objs[i].checked=flag;
                try{objs[i].fireEvent("onclick");}catch(e){}
            }
        }
    },

    /**
     * 清空下拉框
     */
    clearOpts: function(selectObj){
        if(selectObj == null) return;
        while(selectObj.childNodes.length>0){
            selectObj.removeChild(selectObj.childNodes[0]);
        }
        var option = document.createElement("option");
        option.appendChild(document.createTextNode("-- 请选择 --"));
        option.setAttribute("value","");
        selectObj.appendChild(option);
    },

    /**
     * 给元素动态赋值
     * @param data
     * @param renderID
	 * @param excludeNames:Array 要排除的表单（不自动赋值）
     */
    renderData: function(data,renderID,excludeNames){
        if(!data || data==null)return;
		if(excludeNames==undefined){
			excludeNames = [];
		}
        var arr = Validator.getJsonData(data);
        for(var i = 0;i<arr.length;i++){
            var obj = arr[i];
            if(obj.value==undefined || obj.value===''){
                continue;
            }
		if($.inArray(obj.name, excludeNames)>-1){
			continue;
		}
            // var eleId = obj.name.replaceAll("\\.","\\.");
            // var eleDom =  $(renderID).find("#"+eleId);
            var eleDom =  $(document.getElementById(obj.name));
            if(eleDom.length == 0){
                eleDom =  $(renderID).find("*[name = '"+obj.name+"']");
            }
            if(eleDom.length>0){
                var eleType = eleDom[0].type;
                if(eleType){
                    if(eleType == 'radio'){
                        Validator.setCheckboxValue(obj.name,obj.value);
                    }else if(eleType == 'checkbox'){
                        Validator.setCheckboxValue(obj.name,obj.value);
                    }else if(eleType == 'select-one' || eleType =='select-multiple'){
                        if(Mom.BrowserType(9) || Mom.BrowserType(10)){
                            $(eleDom).val(obj.value);
                            eleDom.change();
                        }else{
                            $(eleDom).val(obj.value);
                        }
                    }
                    else{
                        $(eleDom).val(obj.value);
                    }
                }else{
                    $(eleDom).text(obj.value);
                }

            }
        }
        if(layui && layui.form && $('.layui-form').length){
            layui.form.render();
        }
    },

    //获取json数据，遍历数据。返回数组对象
    getJsonData: function(data, arr, key){
        if(key==undefined)key='';
        if(arr==undefined)arr=new Array();
        for(var item in data){
            var value = data[item];
            var ret = key==''?item:(key+"."+item);
            if( value instanceof Array || typeof value != 'object' ){
                arr.push({'name':ret, 'value':value}); //将获取到的属性名称赋值给"name",属性值赋值给"value"

            }else{
                // var ret = key==''?item:(key+"."+item);
                Validator.getJsonData(value, arr, ret);
            }
        }
        return arr;
    },

    trim: function(value){
        return value.replace(/^\s*|\s*$/g,"");
    }

};

