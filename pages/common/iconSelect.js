require([cdnDomain+'/js/zlib/app.js'], function(App) {
    var PageModule = {
        init: function(){
            //初始化选中tab页签
            initTabSelected();
            //给icon绑定事件
            iconEventsFn();
            //绑定搜索事件
            $('#search-input').on('keypress',function(e){
                if(e.keyCode!==13) return;
                doSearch();
            });
            $('#iconSearchBtn').on('click', function(){
                doSearch();
            });
            $('#search-clear').on('click', function(){
                $('#search-input').val('');
                doSearch();
            });

            function initTabSelected(){
                var selVal = Mom.getUrlParam('selVal')||'';
                $("#iconSelected").val(selVal);
                var tabIndx =0;  //风格1
                if(selVal.indexOf('glyphicon-')>-1){//风格3
                    tabIndx = 2;
                }else if(selVal.indexOf('fa-')>-1){//风格2
                    tabIndx = 1;
                }
                $('.nav-tabs li:eq('+tabIndx+') a').tab('show');//tabs默认选中            
                $(".the-icons.active li").each(function(){//高亮选中
                    if ($(this).find("i").hasClass(selVal)){
                        $(this).addClass("old-active");
                    }
                });
            }

            function iconEventsFn(){
                $(".the-icons li").on('click', function(){
                    $(".the-icons li").removeClass("active");
                    $(this).addClass("active");
                    var iconVal = $(this).find('i').attr('class');
                    $("#iconSelected").val(iconVal);
                }).on('dblclick',function(){
                    var iconVal = $(this).find('i').attr('class');
                    Mom.top().layer.prompt({title:'图标样式', value:iconVal,skin:Const.layerSkin()}, function(text, index){
                        Mom.top().layer.close(index);
                    });
                });
            }

            function doSearch(){
                $('p.nodata').remove();
                var keywords = $('#search-input').val();
                if(keywords){
                    $(".the-icons li>i").each(function(i,o){
                        var iconKeyworkds = $(o).attr('data-keywords');
                        //支持根据class类名，或关键字搜索
                        if($(o).attr('class').indexOf(keywords)>-1 || iconKeyworkds.indexOf(keywords)>-1){
                            $(o).closest('li').removeClass('hide');
                        }else{
                            $(o).closest('li').addClass('hide');
                        }
                    });
                    var resultSize = 0;
                    //设置分组是否显示
                    $(".icon-groups").each(function(i,o){
                        //如果在分组中能找的到，则显示分组名称
                        if($(o).find('li').not('.hide').length){
                            $(o).parent().removeClass('hide');
                            resultSize ++;
                        }else{
                            $(o).parent().addClass('hide');
                        }
                    });
                    if(resultSize == 0){
                        $('<p class="nodata mgt-20">未找到符合的图标</p>').insertAfter($('.tab-content'));
                    }
                }else{
                    $(".the-icons li").removeClass('hide');
                    $(".icon-groups").each(function(i,o){
                        $(o).parent().removeClass('hide');
                    });
                }
            }

        },
    };

    $(function(){
        if($('#iconSelect').length > 0){
            PageModule.init();
        }
    });
});