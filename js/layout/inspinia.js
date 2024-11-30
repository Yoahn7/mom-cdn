define(function(){
    var InspiniaObj = {
        init: function(){
            // MetsiMenu
            $('#side-menu').metisMenu();

            // 打开右侧边栏
            $('.right-sidebar-toggle').click(function () {
                $('#right-sidebar').toggleClass('sidebar-open');
            });

            // 右侧边栏使用slimscroll
            $('.sidebar-container').slimScroll({
                height: '100%',
                railOpacity: 0.4,
                wheelStep: 10
            });

            // 打开聊天窗口
            $('.open-small-chat').click(function () {
                $(this).children().toggleClass('fa-comments').toggleClass('fa-remove');
                $('.small-chat-box').toggleClass('active');
            });

            // 聊天窗口使用slimscroll
            $('.small-chat-box .content').slimScroll({
                height: '234px',
                railOpacity: 0.4
            });

            // Small todo handler
            $('.check-link').click(function () {
                var button = $(this).find('i');
                var label = $(this).next('span');
                button.toggleClass('fa-check-square').toggleClass('fa-square-o');
                label.toggleClass('todo-completed');
                return false;
            });

            //固定菜单栏
            $(function () {
                $('.sidebar-collapse').slimScroll({
                    height: '100%',
                    railOpacity: 0.9,
                    alwaysVisible: false
                });
            });


            // 菜单切换
            $('.navbar-mini-btn').click(function () {
                $('body').toggleClass('nav-mini');
                InspiniaObj.SmoothlyMenu();
            });

            InspiniaObj.fix_height();

            $(window).bind("load resize click scroll", function () {
                if (!$("body").hasClass('body-small')) {
                    InspiniaObj.fix_height();
                }
            });

            //侧边栏滚动
            $(window).scroll(function () {
                if ($(window).scrollTop() > 0 && !$('body').hasClass('fixed-nav')) {
                    $('#right-sidebar').addClass('sidebar-top');
                } else {
                    $('#right-sidebar').removeClass('sidebar-top');
                }
            });

            $('.full-height-scroll').slimScroll({
                height: '100%'
            });

            $('#side-menu>li').click(function () {
                if ($('body').hasClass('nav-mini')) {
                    InspiniaObj.NavToggle();
                }
            });
            $('#side-menu>li li a').click(function(){
                if ($(window).width() < 769) {
                    InspiniaObj.NavToggle();
                }
            });

            $('.nav-close').click(InspiniaObj.NavToggle);

            $(window).bind("load resize", function () {
                if ($(this).width() < 769) {
                    $('body').addClass('nav-mini');
                    $('.navbar-static-side').fadeIn();
                }
            });
        },

        NavToggle: function() {
            $('.navbar-mini-btn').trigger('click');
        },

        SmoothlyMenu: function(){
            if (!$('body').hasClass('nav-mini')) {
                $('#side-menu').hide();
                setTimeout(
                    function () {
                        $('#side-menu').fadeIn(500);
                    }, 100);
            } else if ($('body').hasClass('nav-fixed')) {
                $('#side-menu').hide();
                setTimeout(
                    function () {
                        $('#side-menu').fadeIn(500);
                    }, 300);
            } else {
                $('#side-menu').removeAttr('style');
            }
        },

        // 侧边栏高度
        fix_height: function(){
            var heightWithoutNavbar = $("body > #wrapper").height() - 61;
            $(".sidebard-panel").css("min-height", heightWithoutNavbar + "px");
        },

        // 主题设置按钮
        themeConfig: function(){

            $.get(Mom.basePath+"/static/common/skin-config.html", function (data) {
                $('body').append(data);
            });

            if (Mom.localStorageSupport) {
                var collapse = localStorage.getItem("collapse_menu");
                var fixednavbar = localStorage.getItem("fixednavbar");
                var boxedlayout = localStorage.getItem("boxedlayout");

                var body = $('body');

                if (collapse == 'on') {
                    if (!body.hasClass('body-small')) {
                        body.addClass('mini-navbar');
                    }
                }

                if (fixednavbar == 'on') {
                    $(".navbar-static-top").removeClass('navbar-static-top').addClass('navbar-fixed-top');
                    body.addClass('fixed-nav');
                }

                if (boxedlayout == 'on') {
                    body.addClass('boxed-layout');
                }
            }
        }

    };

    //调用初始化
    // InspiniaObj.init();

    return {
        init: InspiniaObj.init,
        SmoothlyMenu: InspiniaObj.SmoothlyMenu,
        themeConfig: InspiniaObj.themeConfig
    };

});