/**
 * tab导航处理组件
 * @type {{menuInit, refreshTab, getActiveTab, toParentTab}}
 */
var TabsNav = (function () {
    var that = this;
    var menuList = [];
    var baseStatic = window.baseStatic;
    /**
     * 加载菜单数据
     * @param {*} url 
     * @param {*} data 
     * @param {*} callback 回调函数
     */
    function menuInit(url, data, callback){
        url = url || Const.admin + '/api/sys/SysMenu/getCurrentUserMenu/sysmenu';
        data = data || {};
        Api.ajaxForm(url, data, function (result) {
            if (result.success) {
                if (result.children.length > 0) {
                    that.menuList = result.children;
                    if (callback) callback(that.menuList);
                    var navData = that.menuList[0].children; //第一级
                    var menuHtml = menuList2Html(navData, 1);
                    $('#side-menu').html(menuHtml);
                    initFnOnce();
                    menuInitFn();
                } else {
                    alert('您没有菜单权限，即将返回登录页');
                    location.href = Mom.basePath+'/login.html';
                }
            } else {
                Mom.layAlert(result.message);
            }
        });
    }

    //菜单html
    var bgOpacity = 0.1;
    function menuList2Html(list, num) {
        if (num >= 8) {
            return '';
        }
        var str = '';
        for (var i = 0; list && i<list.length; i++) {
            str += menuItem2Html(list[i], num);
        }
        return str;
    }
    function menuItem2Html(opt, num){
        var arr = [], hasChild = opt.children && opt.children.length;
        var Aattr = '';
        // 注释：href不为空时才添加target属性。否则href为空时点击菜单将打开新的空白窗口
        if (opt.href ) {
            Aattr += ' target="' + (opt.target || '') +'"';
        }
        if(hasChild){
            Aattr += ' data-toggle="collapse" data-target="p'+opt.id+'" ';
        }
        // 第一级
        if(num == 1){
            arr = [
                '<li style="background: none repeat scroll 0 0 rgba(0, 0, 0, '+bgOpacity+');">',
                '<a '+Aattr+' href="' + (opt.href ? $.trim(opt.href) : 'javascript:;') + '" class="title-menu-left ' +  (opt.href ? "navItem-tit" : '') + '">',
                '<span title="'+opt.name+'">'+(opt.name||' ')+'</span>',
                '<i class="pull-right config-wrap '+(opt.icon ? opt.icon : "fa icon-arrow-right")+'"></i>',
                '</a>',
            ];
            if(hasChild){
                //开始第二级
                var childrenHtml = menuList2Html(opt.children, num + 1);
                arr.push('<ul id="p'+opt.id+'" class="collapse nav-level' + (num + 1) + '">'+childrenHtml+'</ul>');
            }
            arr.push('</li>');
        }else{
            var iconClass = opt.icon ? opt.icon : 'hidden';
            var liStyle = num>2?'background: none repeat scroll 0 0 rgba(0, 0, 0, '+Number(bgOpacity).Add(0.05*(num-2))+');':'';
            arr = [
                '<li style="'+liStyle+'">',
                '<a '+Aattr+' href="' + (opt.href ? $.trim(opt.href) : 'javascript:;') + '" class=" ' +  (opt.href ? "navItem-tit" : '') + '">',
                '<i class="'+iconClass+'"></i>',
                '<span title="'+opt.name+'">'+(opt.name||' ')+'</span>',
                hasChild?'<h4><img class="secRightIco" src="'+baseStatic+'/images/plus.png"></h4>':'',
                '</a>',
            ];
            if(hasChild){
                //开始下一级
                var childrenHtml = menuList2Html(opt.children, num + 1);
                arr.push('<ul id="p'+opt.id+'" class="collapse nav-level' + (num + 1) + '">'+childrenHtml+'</ul>');
            }
            arr.push('</li>');
        }
        return arr.join('');
    }

    //第一级展开
    function collapseInLevel1(me){
        var span = $(me).children('span');
        $(me).closest('li').animate({margin:'10px 0'},'fast', function(){
            //折叠其它的
            // $(this).siblings('li.active').find('.title-menu-left').each(function(i,o){
            //     collapseOut(o);
            // });
            //展开当前
            $(this).addClass('active');
        });
        $(span).css({opacity:'0', top:'20px', left:'20px', 'font-size':'12px'});
        $(span).animate({opacity:1, top:0, left:'10px'}, 'slow', function(){
            $(span).addClass('light');
        });
    }
    //第一级折叠
    function collapseOutLevel1(me){
        var span = $(me).children('span');
        $(me).closest('li').animate({margin:0},'fast', function(){
            $(this).removeClass('active');
        });
        // $(me).siblings('ul').collapse('hide');
        $(span).css('font-size','14px').removeClass('light');
    }
    //菜单抖索
    function menuSearch(){
        $("#side-menu").empty();
        var newMenuList = [];
        if (that.menuList.length) {
            var searchTxt = $(this).parent().find('.search-input').val();
            if (searchTxt) {
                newMenuList = searchTreeData(searchTxt, that.menuList);
            } else {
                newMenuList = that.menuList;
            }
            if (newMenuList.length) {
                var navData = newMenuList[0].children;
                var str = menuList2Html(navData, 1);
                $("#side-menu").append(str);
                menuInitFn();
                if (searchTxt) {
                    //打开第一个菜单
                    var level1A = $('#side-menu li a.navItem-tit');
                    if (level1A.length) {
                        level1A.eq(0).trigger('click');
                    }
                }
            } else {
                $("#side-menu").append("<p class='nodata'>未找到数据</p>");
            }
        }
        // 注释：优化后的代码，返回的数据只包含href不为空的层级数据集合
        function searchTreeData(value, arr) {
            var newarr = [];
            for (var i = 0; arr && i < arr.length; i++) {
                var element = arr[i];
                if (element.children && element.children.length) {
                    var ab = searchTreeData(value, element.children);
                    var obj = $.extend({},element,{'children': ab});   //重写children属性的值
                    if ( ab && ab.length) {
                        newarr.push(obj);
                    }
                } else {
                    if (element.name.indexOf(value) > -1 && element.href) {
                        newarr.push(element);
                    }
                }
            }
            return newarr;
        }
    }

    function initFnOnce(){
        //搜索
        $('.search-group .search-input').keydown(function (e) {
            if (e.keyCode == 13) {
                menuSearch();
            }
        });
        $('.search-group .search-btn').click(function () {
            menuSearch();
        });

        $('#side-menu').on('click', "a[data-toggle='collapse']", function(e){
            $(this).siblings('ul.collapse').collapse('toggle');
        });
        //点击菜单
        $('#side-menu').on('click', '.navItem-tit', function(e){
            e.preventDefault();
            // 获取标识数据
            var dataUrl = $(this).attr('href'),
                menuName = $.trim($(this).text()),
                target = $(this).attr('target') || 'mainFrame';
            $('.navItem-tit').removeClass('active');
            $(this).addClass('active');
            if (dataUrl) {
                if (target == 'mainFrame') {
                    return openTab(menuName, dataUrl);
                } 
                else if (target.toLowerCase() == '_blank') {
                    return window.open(Mom.resolveUrl(dataUrl));
                } 
                else if (target == 'hideFrame') {
                    $('#hideFrame').attr('src', Mom.resolveUrl(dataUrl));
                }
            }
        });

        // 点击选项卡菜单
        $('.tabs-nav').on('click', '.navItem-tabTag', function() {
            if (!$(this).hasClass('active')) {
                var currentId = $(this).data('id');
                var tabsNavIndex = $(this).index();
                // 显示tab对应的内容区
                showActiveFrame(currentId);
                //tab头
                $(this).addClass('active').siblings('.navItem-tabTag').removeClass('active');
                scrollToTab(this);
            }
        }); 
        //双击选项卡，刷新
        $('.tabs-nav').on('dblclick', '.navItem-tabTag', function() {
            var target = $('.J_iframe[data-id="' + $(this).data('id') + '"]');
            refreshTab(target);
        });  
        $('.tabs-nav').on('click', '.navItem-tabTag>i', function(){
            closeTab($(this).parents('.navItem-tabTag'));
        }); //关闭选项卡菜单
        $('.tabs-lBtn').on('click', scrollTabLeft);  // 左移按扭
        $('.tabs-rBtn').on('click', scrollTabRight);// 右移按扭

        //关闭其余选项卡
        $('.tabTag-closeOther').on('click', function(){
            $('.tabs-nav').children("[data-id]").not(":first").not(".active").each(function () {
                $('.J_iframe[data-id="' + $(this).data('id') + '"]').remove();
                $(this).remove();
            });
            $('.tabs-nav').css("margin-left", "0");
        });  
        //定位当前选项卡
        $('.tabTag-fixed').on('click', function(){
            scrollToTab($('.navItem-tabTag.active'));
        }); 
        // 关闭全部
        $('.tabTag-closeAll').on('click', function () {
            //tab标题
            $('.tabs-nav').children("[data-id]").not(":first").each(function () {
                $('.J_iframe[data-id="' + $(this).data('id') + '"]').remove();
                $(this).remove();
            });
            $('.tabs-nav').children("[data-id]:first").each(function () {
                //内容
                $('.J_iframe[data-id="' + $(this).data('id') + '"]').removeClass('fadeOut').addClass('fadeInRight');
                $(this).addClass("active");
            });
            $('.tabs-nav').css("margin-left", "0");
        });

        //设置左侧滚动条
        if($.fn.slimScroll){
            $("#tree-wrap").slimScroll({
                height: "100%"
            });
        }
    }

    function menuInitFn() {
        //当展开菜单时
        $("#side-menu ul.collapse").on('show.bs.collapse', function (e) {
            e.stopPropagation();
            var aobj = $(this).siblings('a');
            if(aobj.hasClass('title-menu-left')){
                collapseInLevel1(aobj); //展开时的事件
            }else{
                aobj.find('.secRightIco').prop('src', baseStatic+'/images/minus.png');
            }
        });
        //当折叠菜单时
        $("#side-menu ul.collapse").on('hide.bs.collapse', function (e) {
            e.stopPropagation();
            var aobj = $(this).siblings('a');
            if(aobj.hasClass('title-menu-left')){
                collapseOutLevel1(aobj);    //折叠
            }else{
                aobj.find('.secRightIco').prop('src', baseStatic+'/images/plus.png');
            }
        });
        
        //通过遍历给菜单项加上data-index属性
        $(".navItem-tit").each(function (index) {
            if (!$(this).attr('data-index')) {
                $(this).attr('data-index', (index + 1));
            }
        });
    }

    //将选中状态对应得tab内容区显示出来
    function showActiveFrame(eleId) {
        $('.wrap-con .J_iframe').addClass('fadeOut').removeClass('fadeInRight');
        $('.wrap-con .J_iframe').each(function () {
            if ($(this).data('id') == eleId) {
                // $(this).show().siblings('.J_iframe').hide();
                $(this).removeClass('fadeOut').addClass('fadeInRight');
                return false;
            }
        })
    }

    //计算元素集合的总宽度
    function calSumWidth(elements) {
        var width = 0;
        $(elements).each(function () {
            width += $(this).outerWidth(true);
        });
        return width;
    }

    //滚动到指定选项卡
    function scrollToTab(element) {
        var marginLeftVal = calSumWidth($(element).prevAll()), marginRightVal = calSumWidth($(element).nextAll());
        // 可视区域非tab宽度
        var tabOuterWidth = calSumWidth($(".content-tabs").children().not(".tabs-menu"));
        //可视区域tab宽度
        var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
        //实际滚动宽度
        var scrollVal = 0;
        if ($(".tabs-nav").outerWidth() < visibleWidth) {
            scrollVal = 0;
        } else if (marginRightVal <= (visibleWidth - $(element).outerWidth(true) - $(element).next().outerWidth(true))) {
            if ((visibleWidth - $(element).next().outerWidth(true)) > marginRightVal) {
                scrollVal = marginLeftVal;
                var tabElement = element;
                while ((scrollVal - $(tabElement).outerWidth()) > ($(".tabs-nav").outerWidth() - visibleWidth)) {
                    scrollVal -= $(tabElement).prev().outerWidth();
                    tabElement = $(tabElement).prev();
                }
            }
        } else if (marginLeftVal > (visibleWidth - $(element).outerWidth(true) - $(element).prev().outerWidth(true))) {
            scrollVal = marginLeftVal - $(element).prev().outerWidth(true);
        }
        $('.tabs-nav').animate({marginLeft: 0 - scrollVal + 'px'}, "fast");
    }

    //查看左侧隐藏的选项卡
    function scrollTabLeft() {
        var marginLeftVal = Math.abs(parseInt($('.tabs-nav').css('margin-left')));
        // 可视区域非tab宽度
        var tabOuterWidth = calSumWidth($(".content-tabs").children().not(".tabs-menu"));
        //可视区域tab宽度
        var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
        //实际滚动宽度
        var scrollVal = 0;
        if ($(".tabs-nav").width() < visibleWidth) {
            return false;
        } else {
            var tabElement = $(".navItem-tabTag:first");
            var offsetVal = 0;
            while ((offsetVal + $(tabElement).outerWidth(true)) <= marginLeftVal) {//找到离当前tab最近的元素
                offsetVal += $(tabElement).outerWidth(true);
                tabElement = $(tabElement).next();
            }
            offsetVal = 0;
            if (calSumWidth($(tabElement).prevAll()) > visibleWidth) {
                while ((offsetVal + $(tabElement).outerWidth(true)) < (visibleWidth) && tabElement.length > 0) {
                    offsetVal += $(tabElement).outerWidth(true);
                    tabElement = $(tabElement).prev();
                }
                scrollVal = calSumWidth($(tabElement).prevAll());
            }
        }
        $('.tabs-nav').animate({marginLeft: -scrollVal + 'px' }, "fast");
    }

    //查看右侧隐藏的选项卡
    function scrollTabRight() {
        var marginLeftVal = Math.abs(parseInt($('.tabs-nav').css('margin-left')));
        // 可视区域非tab宽度
        var tabOuterWidth = calSumWidth($(".content-tabs").children().not(".tabs-menu"));
        //可视区域tab宽度
        var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
        //实际滚动宽度
        var scrollVal = 0;
        if ($(".tabs-nav").width() < visibleWidth) {
            return false;
        } 
        var tabElement = $(".navItem-tabTag:first");
        var offsetVal = 0;
        while ((offsetVal + $(tabElement).outerWidth(true)) <= marginLeftVal) {//找到离当前tab最近的元素
            offsetVal += $(tabElement).outerWidth(true);
            tabElement = $(tabElement).next();
        }
        offsetVal = 0;
        while ((offsetVal + $(tabElement).outerWidth(true)) < (visibleWidth) && tabElement.length > 0) {
            offsetVal += $(tabElement).outerWidth(true);
            tabElement = $(tabElement).next();
        }
        scrollVal = calSumWidth($(tabElement).prevAll());
        if (scrollVal > 0) {
            $('.tabs-nav').animate({marginLeft: -scrollVal + 'px'}, "fast");
        }
    }
    
    //获取显示的iframe
    function getActiveTab() {
        var activeTabs = $('.J_iframe.fadeInRight') || $(".J_iframe:visible");
        return activeTabs.eq(activeTabs.length - 1);
    }

    //刷新当前选中tab对应的iframe
    function refreshTab(selectTab) {
        if(Mom.crossOrigin){
            location.href = location.href;
            return;
        }
        if(!selectTab || selectTab.length==0){
            selectTab = this.getActiveTab();
        }
        $(selectTab).trigger('dblclick');
        var url = selectTab.attr('src');
        //显示loading提示
        var loading = layer.load();
        selectTab.attr('src', url).load(function () {
            //关闭loading提示
            layer.close(loading);
        });
    }

    // 关闭选项卡菜单
    function closeTab(selectTab) {
        if(Mom.crossOrigin){
            self.close();
            return;
        }
        if(!selectTab){
            selectTab = $(".navItem-tabTag.active");
        }
        var closeTabId = selectTab.data('id'),
            currentWidth = selectTab.width();
        // 当前元素处于活动状态
        if (selectTab.hasClass('active')) {
            var thisNextEl = selectTab.next('.navItem-tabTag'),
                thisPrevEl = selectTab.prev('.navItem-tabTag');
            // 当前元素后面有同辈元素，使后面的一个元素处于活动状态
            if (thisNextEl.length) {
                var activeId = thisNextEl.data('id');
                thisNextEl.addClass('active');
                showActiveFrame(activeId);
                DeleteNavItem(closeTabId, selectTab);
                var marginLeftVal = parseInt($('.tabs-nav').css('margin-left'));
                if (marginLeftVal < 0) {
                    $('.tabs-nav').animate({
                        marginLeft: (marginLeftVal + currentWidth) + 'px'
                    }, "fast");
                }
                return false;
            }

            // 当前元素后面没有同辈元素，使当前元素的上一个元素处于活动状态
            if (thisPrevEl.length) {
                var activeId = thisPrevEl.data('id');
                thisPrevEl.addClass('active');
                showActiveFrame(activeId);
                DeleteNavItem(closeTabId, selectTab);
            }
        }
        // 当前元素不处于活动状态
        else {
            DeleteNavItem(closeTabId, selectTab);
            scrollToTab($('.navItem-tabTag.active'));
        }

        //删除选中的选项卡，以及移除tab对应的内容 （即对应的iframe）
        function DeleteNavItem(elId, eleParent) {
            //  移除当前选项卡
            eleParent.remove();
            // 移除tab对应的内容区
            $('.wrap-con .J_iframe').each(function () {
                if ($(this).data('id') == elId) {
                    $(this).remove();
                    return false;
                }
            });
        };
        return false;
    }

    //打开选项卡菜单
    /**
     * @param title String 页签名称
     * @param url  String  页签路径
     * @param isNew  Boolean  默认值：false   注释：isNew 为true时，每次打开一个新的选项卡；为false时，如果选项卡不存在，打开一个新的选项卡，如果已经存在，使已经存在的选项卡变为活跃状态。
     * @returns {boolean}
     */
    function openTab(title, url, isNew) {
        var url = Mom.resolveUrl(url);
        // 获取标识数据
        isNew = true == isNew ? isNew : false;
        var menuName = title,
            flag = true;
        if (url == undefined || $.trim(url).length == 0) return false;

        if (!isNew) {
            $('.navItem-tabTag').each(function () {
                if ($(this).data('id') == url) {// 选项卡已存在，激活。
                    if (!$(this).hasClass('active')) {
                        $(this).addClass('active').siblings('.navItem-tabTag').removeClass('active');
                        scrollToTab($(this));
                        //显示tab对应的内容
                        showActiveFrame(url);
                    }
                    flag = false;
                    return false;
                }
            });
        }

        if (isNew || flag) {//isNew为true，打开一个新的选项卡； flag为true，选项卡不存在，打开一个新的选项卡。
            var str = '<a href="javascript:;" class="active navItem-tabTag" data-id="' + url + '">' + menuName + ' <i class="fa fa-times-circle"></i></a>';
            top.$('.navItem-tabTag').removeClass('active');

            // 添加选项卡对应的iframe
            var str1 = '<iframe class="J_iframe animated fadeInRight" width="100%" height="100%" src="' + url + '" frameborder="0" data-id="' + url + '"></iframe>';
            // top.$('.wrap-con').find('iframe.J_iframe').hide();
            // top.$('.wrap-con').append(str1);
            top.$('.wrap-con').find('iframe.J_iframe').addClass('fadeOut').removeClass('fadeInRight');
            top.$('.wrap-con').append($(str1));
            
            //显示loading提示
            var loading = layer.load();

            top.$('.wrap-con iframe:visible').load(function () {
                //iframe加载完成后隐藏loading提示
                layer.close(loading);
            });
            // 添加选项卡
            top.$('.tabs-menu .tabs-nav').append(str);
            scrollToTab(top.$('.navItem-tabTag.active'));
        }
        return false;
    }

    return {
        menuInit: menuInit,
        getActiveTab: getActiveTab,
        refreshTab: refreshTab,
        openTab: openTab,
        closeTab: closeTab
    }
})();
