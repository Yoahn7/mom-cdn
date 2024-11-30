define(function () {
    // Mom.include('computed_css', '/css/mes', ['formulaSetting.css']);
    var formulaFn = {
        zb_label:"<u data-val='{val}' class='u'>?</u>",//指标
        fn_label:"<g>?</g>",//函数
        sy_label:"<b>?</b>",//符号
        num_label:"<span>?</span>",//数字
        //工厂模型
        factoryModelFormula: function(){
            var instruments = {},   //各类型节点对应的测量点集合。注释：各节点（罐区、装置界区等）对应的测量点数据集合只获取（请求）一次，请求后将使用缓存数据进行测量点回显。
                formulaCon = $('.formula-con');
            if(formulaCon && formulaCon.length) {
                formulaCon = formulaCon.length > 1 ? $('.formula-con.active') : formulaCon;
            }else{
                console.log('页面元素对应的类名不正确，详细的请参考 %c 工厂模型-料线-计算公式页面','color:red;font-size:16px;');
                return false;
            }
            // 节点（罐区、装置界区、仓库、装卸台）点击事件
            formulaCon.on("click",".formula-nodes-nav>li",function(){
                var norClass ='fa fa-circle-o',
                    activeClass = 'fa fa-dot-circle-o';
                var nodeVal = $(this).attr('data-val');
                $(this).addClass('col-1ab394').siblings('li').removeClass('col-1ab394');
                $(this).siblings().find('i.fa').removeClass(activeClass).addClass(norClass);
                $(this).find('i.fa').removeClass().addClass(activeClass);

                formulaCon.find('.formula-condition').empty();
                if(instruments[nodeVal]){
                    renderActiveNodeList(formulaCon,instruments[nodeVal]);
                }else{
                    Api.ajaxForm(Const.mes+'/api/fm/Instrument/findListByAreaType',{areaType:nodeVal},function(result){
                        if(result.success){
                            var rows = result.rows||[];
                            instruments[nodeVal] = rows;
                            renderActiveNodeList(formulaCon,rows);
                        }else{
                            Mom.layAlert(result.message);
                        }
                    })
                }


            });

            // 动态获取页面中节点（罐区、装置界区、仓库、装卸台）数据以及函数下拉集合
            Api.ajaxForm(Const.admin + '/api/imp/sys/SysDict//queryTypes/NODE_AREA_TYPE,FUNC_TYPE',{},function(result){
                if(result.success){
                    var funcTypelist = result.FUNC_TYPE,
                        nodeTypelist = result.NODE_AREA_TYPE,
                        nodeStr = '';
                    // 函数下拉集合
                    Bus.appendOptionsValue(formulaCon.find('.formulaFn'),funcTypelist);

                    // 界区节点（罐区、装置界区等）动态渲染
                    $(nodeTypelist).each(function(i,o){
                        nodeStr += '<li data-val="'+o.value+'"><i class="fa-circle-o fa"></i>'+o.label+'</li>';
                    });
                    $('.formula-nodes-nav').empty().append(nodeStr);
                    formulaCon.find('.formula-nodes-nav li:first').trigger('click');
                }else{
                    Mom.layAlert(result.message);
                }
            });
            formulaCon.on('click','.formula-condition li',function(){
                $(this).addClass('active').siblings('li').removeClass('active');
            });

            /** 渲染选中节点（罐区、装置界区、仓库、装卸台）对应的测量点数据集合
             * @param $dom   容器承载满足条件的测量点数据  DOM元素
             * @param rows  测量点数据集合 （数组对象）
             * **/
            function renderActiveNodeList($dom,rows) {
                var liStr ='';
                if(rows.length){
                    $(rows).each(function(i,o){
                        liStr += '<li data-id="'+o.instrNo+'" class="row-hover">' + o.instrName+ '</li>';
                    });
                }else{
                    liStr +='<li class="nodata">暂无数据</li>';
                }
                // 测量点数据集合
                $dom.find('.formula-condition').empty().html(liStr);
            }

            //搜索按钮
            formulaCon.find('.searchAll').click(function () {
                var searchVal = $.trim(formulaCon.find('.searchGroup input').val());
                var formulaCondit  = formulaCon.find('.formula-condition'),
                    formulaConditLi = $(formulaCondit).children('li');
                formulaCondit.children('li.nodata').remove();
                if (searchVal) {
                    formulaConditLi.hide().removeClass('show').filter(":contains('" + searchVal + "')").addClass('show');
                    if( formulaCondit.children('li.show').length ==0){
                        formulaCondit.prepend('<li class="nodata">暂无数据</li>')
                    }
                }else if(searchVal=="") {
                    $(formulaConditLi).show();
                }
            });
            // 函数下拉集合
            // $domConformulaFn.empty();
            // Bus.appendOptionsValue($domConformulaFn, result.funcTypeList||[]);
            var $domConformulaFn = formulaCon.find('.formulaFn'),
                $domConFormHtml = formulaCon.find('.formulaHtml'),   //公式回显DOM
                $domConFormulaOperBtns = formulaCon.find('.formula-oper-btns'),  //公式运算按钮区域
                $btnVerify = formulaCon.find('.btn-verify');  //验证
            formulaFn.formulaInit($domConFormulaOperBtns, $domConFormHtml, $btnVerify, function(){
                //公式匹配
                $('.btn-matching').unbind('click').on('click', function () {
                    var activeLi  = formulaCon.find('.formula-condition>li.active'),
                        activeLiTxt = activeLi.text(),
                        activeLiId = activeLi.attr('data-id');
                    var fnVal = $.trim($domConformulaFn.val())||'';//函数
                    if(activeLiId){
                        // var zb_show = formulaFn.zb_label.replace('{val}',activeLiId).replace('?',activeLiTxt);
                        var fn_show =formulaFn.zb_label.replace('{val}',activeLiId).replace('?',activeLiTxt);
                        // var fn_show = zb_show;
                        // <g>DIFF(<u>合成气</u>)</g>
                        if(fnVal){
                            fn_show = formulaFn.fn_label.replace('?',fnVal+"("+fn_show+")");
                        }
                        formulaFn.insertHtml($domConFormHtml,fn_show)
                    }else{
                        Mom.layMsg('公式未选择,请选择公式后再点击匹配!')
                    }
                });
            });

            /*Api.ajaxForm(Const.mes+'/api/fm/Formula/instrumentAndFunc',{}, function (result) {
                if(result.success){
                    var getInstrListArr = result.nodeAreaTypeInstrList||[];
                    var formulaCon = $('.formula-con');
                    if(formulaCon && formulaCon.length) {
                        formulaCon = formulaCon.length > 1 ? $('.formula-con.active') : formulaCon;
                    }else{
                        console.log('页面元素对应的类名不正确，详细的请参考 %c 工厂模型-料线-计算公式页面','color:red;font-size:16px;');
                        return false;
                    }
                    var $domConformulaFn = formulaCon.find('.formulaFn'),
                        $domConFormHtml = formulaCon.find('.formulaHtml'),
                        $domConFormulaOperBtns = formulaCon.find('.formula-oper-btns'),
                        $btnVerify = formulaCon.find('.btn-verify');

                    // 节点（罐区、装置界区、仓库、装卸台）点击事件
                    formulaCon.on("click",".formula-nodes-nav>li",function(){
                        var norClass ='fa fa-circle-o',
                            activeClass = 'fa fa-dot-circle-o';
                        var nodeVal = $(this).attr('data-val');
                        $(this).addClass('col-1ab394').siblings('li').removeClass('col-1ab394');
                        $(this).siblings().find('i.fa').removeClass(activeClass).addClass(norClass);
                        $(this).find('i.fa').removeClass().addClass(activeClass);
                        renderActiveNodeList(formulaCon,getInstrListArr,nodeVal);
                    });
                    formulaCon.find('.formula-nodes-nav li:first').trigger('click');
                    /!**
                     * 渲染选中节点（罐区、装置界区、仓库、装卸台）对应的测量点数据集合
                     * @param $dom   容器承载满足条件的测量点数据  DOM元素
                     * @param CLDArr  测量点数据集合 （数组对象）
                     * @param dataVal   公式类型值（罐区：1，装置界区：2，以此类推）
                     *!/
                    function renderActiveNodeList($dom,CLDArr,dataVal) {
                        var liStr ='';
                        $(CLDArr).each(function(i,o){
                            if(o.name == dataVal){
                                $(o.value).each(function (j,obj) {
                                    liStr += '<li data-id="'+obj.instrNo+'">' + obj.instrName+ '</li>';
                                });
                            }
                        });

                        // 测量点数据集合
                        $dom.find('.formula-condition').empty().html(liStr);
                        $dom.find('.formula-condition li').click(function(){
                            $(this).addClass('active').siblings('li').removeClass('active');
                        });
                    };
                    //搜索按钮
                    formulaCon.find('.searchAll').click(function () {
                        var searchVal = $.trim(formulaCon.find('.searchGroup input').val());
                        var formulaCondit  = formulaCon.find('.formula-condition'),
                            formulaConditLi = $(formulaCondit).children('li');
                        formulaCondit.children('li.nodata').remove();
                        if (searchVal) {
                            formulaConditLi.hide().removeClass('show').filter(":contains('" + searchVal + "')").addClass('show');
                            if( formulaCondit.children('li.show').length ==0){
                                formulaCondit.prepend('<li class="nodata">暂无数据</li>')
                            }
                        }else if(searchVal=="") {
                            $(formulaConditLi).show();
                        }
                    });
                    // 函数下拉集合
                    $domConformulaFn.empty();
                    Bus.appendOptionsValue($domConformulaFn, result.funcTypeList||[]);
                    formulaFn.formulaInit($domConFormulaOperBtns, $domConFormHtml, $btnVerify, function(){
                        //公式匹配
                        $('.btn-matching').unbind('click').on('click', function () {
                            var activeLi  = formulaCon.find('.formula-condition>li.active'),
                                activeLiTxt = activeLi.text(),
                                activeLiId = activeLi.attr('data-id');
                            var fnVal = $.trim($domConformulaFn.val())||'';//函数
                            if(activeLiId){
                                // var zb_show = formulaFn.zb_label.replace('{val}',activeLiId).replace('?',activeLiTxt);
                                var fn_show =formulaFn.zb_label.replace('{val}',activeLiId).replace('?',activeLiTxt);
                                // var fn_show = zb_show;
                                // <g>DIFF(<u>合成气</u>)</g>
                                if(fnVal){
                                    fn_show = formulaFn.fn_label.replace('?',fnVal+"("+fn_show+")");
                                }
                                formulaFn.insertHtml($domConFormHtml,fn_show)
                            }else{
                                Mom.layMsg('公式未选择,请选择公式后再点击匹配!')
                            }
                        });
                    });
                }else{
                    Mom.layAlert(result.message);
                }
            })*/
        },
        //公式处理公共函数
        /**
         *
         * @param computeBtnConatiner  运算按钮
         * @param formulaHtmlShow   承载公式结果的DOM
         * @param verifyBtn    公式校验按钮DOM
         * @param appendValueFn   扩展项（暂时无用）
         */
        formulaInit: function(computeBtnConatiner, formulaHtmlShow, verifyBtn, appendValueFn){
            //文本框（formulaHtml）输入
            $(formulaHtmlShow)[0].onmouseup = function(){
                formulaFn.txtClick($(this))
            };
            // 文本框（formulaHtml）输入
            $(formulaHtmlShow).keydown(function(e){
                e.preventDefault()
            });
            // 运算区域按钮事件
            $(computeBtnConatiner).children('button').unbind('click').on('click', function () {
                var sy = $(this).text(),sy_html;
                switch(sy){
                    case 'C':
                        formulaFn.deleteHtml($(formulaHtmlShow));
                        break;
                    case 'CE':
                        $(formulaHtmlShow).empty();
                        break;
                    case '+':
                    case '-':
                    case '*':
                    case '/':
                    case '(':
                    case ')':
                        sy_html = formulaFn.sy_label.replace('?',sy);
                        formulaFn.insertHtml($(formulaHtmlShow),sy_html);
                        break;
                    default:
                        sy_html = formulaFn.num_label.replace('?',sy);
                        formulaFn.insertHtml($(formulaHtmlShow),sy_html);
                        break;
                }
            });
            //验证
            $(verifyBtn).unbind('click').on('click', function () {
                var str = $(formulaHtmlShow).text().trim();
                formulaFn.formulaCheck(str,'layMsg');
            });
            if(appendValueFn){
                var val = appendValueFn();
                if(val){
                    formulaFn.insertHtml($(formulaHtmlShow),val);
                }
            }
        },
        /**正则验证方法  val为要验证符号以及括号的值字符串*/
        formulaCheck: function (val,layMsg) {
            var flagXKH = (val.split("(").length != val.split(")").length || val.indexOf('()')<-1),  //小括号
                flagHKH = (val.split("{").length != val.split("}").length || val.indexOf('{}')<-1), //花括号
                flagZKH = (val.split("[").length != val.split("]").length || val.indexOf('[]')<-1); //中括号
            var regFourSymbols = /^\+|^\-|^\*|^\/|(\+|\-|\*|\/)\1{1}|(\+\-)|(\-\+)|(\+\*)|(\*\+)|(\/\+)|(\+\/)|(\-\*)|(\*\-)|(\-\/)|(\/\-)|(\*\/)|(\/\*)|(\+|\-|\*|\/)+$/;
            // var regBracket = /[(][^()]*[)]/;
            if(val==null){
                Mom.layMsg('匹配项内容为空,请输入信息后再进行操作');
                return false;
            }else if (regFourSymbols.test(val)) {
                Mom.layMsg('公式不合法,请检查运算符号!');
                return false;
            }else if ( flagXKH ||flagHKH ||flagZKH) {
                Mom.layMsg('括号不匹配,请检查括号!');
                return false;
            }
            //点击"验证"时提示。点击"保存"时只验证不提示，只提示错误信息
            if(layMsg){
                Mom.layMsg('合法公式');
            }
            return true;
        },
        // 将选取的公式内容放入到"formulaHtml"Dom中
        insertHtml: function($dom,html) {
            //关键点（1）。如果不添加此行代码选中的内容将直接插入到所选内容的前面。故要将选中的内容插入到其余容器（DOM）中需添加此行代码。即将存放内容的DOM获取焦点（光标在DOM中）
            $($dom)[0].focus();
            var selObj,rangeObj;
            if(window.getSelection()){
                selObj =window.getSelection();
                rangeObj = selObj.getRangeAt(0);
            }else if(window.document.selection){ //IE
                selObj =window.document.selection;
                rangeObj = selObj.createRange();
            }
            if (selObj.getRangeAt && selObj.rangeCount) {
                var container = rangeObj.commonAncestorContainer; //获取选中区域位于什么节点中
                //如果是文本节点 。直接点击"运算（除C/CE）"按钮外，或者鼠标点击其他区域（即：鼠标点击其他区域后在点击运算按钮后改变光标的位置,使光标位置为$dom容器中最后的节点后面'）
                if(container.nodeType == 3){
                    var lastNode =  $($dom)[0].lastElementChild;
                    rangeObj.setStartAfter(lastNode);
                }
                var el = document.createElement("div");
                el.innerHTML = html;
                var fragDom= document.createDocumentFragment(),  //创建DOM片段
                    refNode;
                // html可能包含多个标签，遍历每个标签将其插入至fragDom，且记录最后一个标签
                while ( (el.firstChild) ) {
                    refNode = fragDom.appendChild(el.firstChild);
                }
                if(refNode){
                    rangeObj.insertNode(fragDom);//将node(节点)插入range对象
                    rangeObj.setStartAfter(refNode); //将光标位置移动到插入节点之后（默认在插入节点之前）
                    rangeObj.collapse(true);
                }
            }
        },
        deleteHtml:function($dom){
            $($dom)[0].focus();
            var selObj,rangeObj;
            if(window.getSelection()){
                selObj =window.getSelection();
                rangeObj = selObj.getRangeAt(0);
            }else if(window.document.selection){ //IE
                selObj =window.document.selection;
                rangeObj = selObj.createRange();
            }
            if (selObj.getRangeAt && selObj.rangeCount) {
                var container = rangeObj.commonAncestorContainer;
                //如果是文本节点 。直接点击"运算"按钮(C/CE)时，将光标位置设置在$dom的最后一个标签元素内容后。且重新获取光标所属的容器范围
                if(container.nodeType == 3){
                   var lastNode =  $($dom)[0].lastElementChild;
                    rangeObj.setStartAfter(lastNode);
                    container = rangeObj.commonAncestorContainer;
                }
                //没有连续选中（即起始点与结束点是同一个位置（即光标））
                if(rangeObj.collapsed){
                    var startOffset = rangeObj.startOffset;   // 获得Range起点的位移
                    if(startOffset == 0) return;
                    rangeObj.setStart(container,startOffset-1);
                    //只剩下var() 的时候,全部删掉.此处的写法当光标落入到var()括号中间时，需要将var()作为一个整体移除。如若不加此段代码将只会删除var(
                    //检测g标签中是否还有元素标签，regFlag：false即表示无其余标签。则此时将移除整个g标签以及g标签中的内容。
                     if(container.nodeName.toLowerCase() == 'g'){
                         var reg = /<[^>]+>/g,
                             regFlag = reg.test($(container).html());   //检测是否含有元素标签，如<span>等
                         if(!regFlag){
                             //g标签中无其余标签时
                             rangeObj.selectNode(container);
                         }
                     }
                }
                //连续选中
                else{
                    //rangeObj.selectNodeContents(container);//获取container的节点对象,包括子节点
                    rangeObj.setStartAfter(container);
                    rangeObj.selectNode(container);
                }
                // 注释：(1)(2)两行代码都存在时方可将"var()"以及对应的g元素标签删除，如若没有（1）将不会删除g元素标签
                // rangeObj.selectNode(container); //（1）选中节点
                rangeObj.deleteContents();//（2）删除选中节点
            }
        },
        // 根据光标位置U标签且未U标签添加active高亮
        txtClick:function($dom){
            /*Selection 对象表示用户选择的文本范围或插入符号的当前位置。
            获取用于检查或修改的 Selection 对象，请调用 window.getSelection()*/
            var selObj,rangeObj;
            if(window.getSelection()){
                selObj =window.getSelection();
                rangeObj = selObj.getRangeAt(0);
            }else if(window.document.selection){ //IE
                selObj =window.document.selection;
                rangeObj = selObj.createRange();
            }
            if (selObj.getRangeAt && selObj.rangeCount) {
                $dom.find('.active').removeClass('active');
                //选中区域的Element元素
                var container = rangeObj.commonAncestorContainer;

                // nodeType  1:元素节点（对应的nodeName:标签名称）  2：属性节点（对应的nodeName:属性名称）   3：文本节点（对应的nodeName永远是#text）;
                if(container.nodeType != 1){  //非元素节点时
                    container = container.parentNode;
                }
                rangeObj.setStartAfter(container);  //表示用于将某个节点的终点位置设置为range对象的起点位置(设置光标位置)
                var nodeName = container.nodeName.toLowerCase();
                //如果选中u标签,也就是测量点的内容,加高亮
                if(nodeName){
                    if(('<'+nodeName)=='<u'){
                        $(container).addClass('active');
                    }
                }
            }
        }
    };
    return {
        zb_label:formulaFn.zb_label, //指标
        fn_label:formulaFn.fn_label,  //函数
        sy_label:formulaFn.sy_label,  //运算符号
        num_label:formulaFn.num_label,//数字
        formulaCheck: formulaFn.formulaCheck, //公式校验
        renderActiveNodeList:formulaFn.renderActiveNodeList,   //渲染选中节点（罐区、装置界区、仓库、装卸台）对应的测量点数据集合
        insertHtml:formulaFn.insertHtml,  //插入选中的元素
        deleteHtml:formulaFn.deleteHtml,  //移除formulaHtml中的内容
        formulaInit:formulaFn.formulaInit,  //公式方法初始化
        factoryModelFormula:formulaFn.factoryModelFormula

    };
});



