/**
 * Created by Hope on 2014/12/28.
 */
(function ($) {
    $.fn.extendPagination = function (options) {
        var defaults = {
            //pageId:'',
            totalCount: '',
            showPage: '10',
            limit: '5',
            callback: function () {
                return false;
            }
        };
        $.extend(defaults, options || {});
        if (defaults.totalCount == '') {
            $(this).empty();
            return false;
        } else if (Number(defaults.totalCount) <= 0) {
            $(this).empty();
            return false;
        }
        if (defaults.showPage === '') {
            defaults.showPage = '10';
        }
        else if (Number(defaults.showPage) < 0){
            defaults.showPage = '10';
        }
        if (defaults.limit == '') {
            defaults.limit = '5';
        }
        else if (Number(defaults.limit) <= 0){
            defaults.limit = '5';
        }
        var totalCount = Number(defaults.totalCount), showPage = Number(defaults.showPage),
            limit = Number(defaults.limit), totalPage = Math.ceil(totalCount / limit);
        if (totalPage > 0) {
            var html = [];
            html.push(' <ul class="pagination">');
            if(showPage > 0){
                html.push(' <li class="previous"><a href="#">&laquo;</a></li>');
                html.push('<li class="disabled hidden"><a href="#">...</a></li>');
                if (totalPage <= showPage) {
                    for (var i = 1; i <= totalPage; i++) {
                        if (i == 1) html.push(' <li class="active"><a href="#">' + i + '</a></li>');
                        else html.push(' <li><a href="#">' + i + '</a></li>');
                    }
                } else {
                    for (var j = 1; j <= showPage; j++) {
                        if (j == 1) html.push(' <li class="active"><a href="#">' + j + '</a></li>');
                        else html.push(' <li><a href="#">' + j + '</a></li>');
                    }
                }
                html.push('<li class="disabled hidden"><a href="#">...</a></li>');
                html.push('<li class="next"><a href="#">&raquo;</a></li></ul>');

                $(this).html(html.join(''));
                if (totalPage > showPage){
                    $(this).find('ul.pagination li.next').prev().removeClass('hidden');
                }

                var pageObj = $(this).find('ul.pagination'),
                    preObj = pageObj.find('li.previous'),
                    currentObj = pageObj.find('li').not('.previous,.disabled,.next'),
                    nextObj = pageObj.find('li.next');
                function loopPageElement(minPage, maxPage) {
                    var tempObj = preObj.next();
                    for (var i = minPage; i <= maxPage; i++) {
                        if (minPage == 1 && (preObj.next().attr('class').indexOf('hidden')) < 0)
                            preObj.next().addClass('hidden');
                        else if (minPage > 1 && (preObj.next().attr('class').indexOf('hidden')) > 0)
                            preObj.next().removeClass('hidden');
                        if (maxPage == totalPage && (nextObj.prev().attr('class').indexOf('hidden')) < 0)
                            nextObj.prev().addClass('hidden');
                        else if (maxPage < totalPage && (nextObj.prev().attr('class').indexOf('hidden')) > 0)
                            nextObj.prev().removeClass('hidden');
                        var obj = tempObj.next().find('a');
                        if (!isNaN(obj.html()))obj.html(i);
                        tempObj = tempObj.next();
                    }
                }

                function callBack(curr) {
                    defaults.callback(curr, defaults.limit, totalCount);
                }

                currentObj.click(function (event) {
                    event.preventDefault();
                    var currPage = Number($(this).find('a').html()), activeObj = pageObj.find('li[class="active"]'),
                        activePage = Number(activeObj.find('a').html());
                    if (currPage == activePage) return false;
                    if (totalPage > showPage && currPage > 1)  {
                        var maxPage = currPage, minPage = 1;
                        if (($(this).prev().attr('class'))
                            && ($(this).prev().attr('class').indexOf('disabled')) >= 0) {
                            minPage = currPage - 1;
                            maxPage = minPage + showPage - 1;
                            loopPageElement(minPage, maxPage);
                        } else if (($(this).next().attr('class'))
                            && ($(this).next().attr('class').indexOf('disabled')) >= 0) {
                            if (totalPage - currPage >= 1) maxPage = currPage + 1;
                            else  maxPage = totalPage;
                            if (maxPage - showPage > 0) minPage = (maxPage - showPage) + 1;
                            loopPageElement(minPage, maxPage)
                        }
                    }
                    activeObj.removeClass('active');
                    $.each(currentObj, function (index, thiz) {
                        if ($(thiz).find('a').html() == currPage) {
                            $(thiz).addClass('active');
                            callBack(currPage);
                        }
                    });
                });
                preObj.click(function (event) {
                    event.preventDefault();
                    var activeObj = pageObj.find('li[class="active"]'), activePage = Number(activeObj.find('a').html());
                    if (activePage <= 1) return false;
                    if (totalPage > showPage) {
                        var maxPage = activePage, minPage = 1;
                        if ((activeObj.prev().prev().attr('class'))
                            && (activeObj.prev().prev().attr('class').indexOf('disabled')) >= 0) {
                            minPage = activePage - 1;
                            if (minPage > 1) minPage = minPage - 1;
                            maxPage = minPage + showPage - 1;
                            loopPageElement(minPage, maxPage);
                        }
                    }
                    $.each(currentObj, function (index, thiz) {
                        if ($(thiz).find('a').html() == (activePage - 1)) {
                            activeObj.removeClass('active');
                            $(thiz).addClass('active');
                            callBack(activePage - 1);
                        }
                    });
                });
                nextObj.click(function (event) {
                    event.preventDefault();
                    var activeObj = pageObj.find('li[class="active"]'), activePage = Number(activeObj.find('a').html());
                    if (activePage >= totalPage) return false;
                    if (totalPage > showPage) {
                        var maxPage = activePage, minPage = 1;
                        if ((activeObj.next().next().attr('class'))
                            && (activeObj.next().next().attr('class').indexOf('disabled')) >= 0) {
                            maxPage = activePage + 2;
                            if (maxPage > totalPage) maxPage = totalPage;
                            minPage = maxPage - showPage + 1;
                            loopPageElement(minPage, maxPage);
                        }
                    }
                    $.each(currentObj, function (index, thiz) {
                        if ($(thiz).find('a').html() == (activePage + 1)) {
                            activeObj.removeClass('active');
                            $(thiz).addClass('active');
                            callBack(activePage + 1);
                        }
                    });
                });

            }else{
                html.push(' <li class="first" title="首页"><a href="#" style="font-family:Webdings!important;"> 7 </a></li>');
                html.push(' <li class="previous" title="上一页"><a href="#" style="font-family:Webdings!important;"> 3 </a></li>');
                html.push(' <li><span style="padding:0"><input type="text" class="curPg" style="width:40px;height:32px;border:none;text-align:center;padding:0;" placeholder="页码" value="1"></span></li>');
                html.push(' <li class="next" title="下一页"><a href="#" style="font-family:Webdings!important;"> 4 </a></li>');
                html.push(' <li class="last" title="末页"><a href="#" style="font-family:Webdings!important;"> 8 </a></li>');
                $(this).html(html.join(''));

                var pageObj = $(this).find('ul.pagination');
                callback(1, false);
                /**
                 * 绑定事件
                 */
                //首页
                pageObj.find('.first').click(function(event){
                    event.preventDefault();
                    if(!$(this).hasClass('disabled')){
                        callback(1, true);
                    }
                });
                //上一页
                pageObj.find('.previous').click(function(event){
                    event.preventDefault();
                    if(!$(this).hasClass('disabled')) {
                        var curPg = Number(pageObj.find('.curPg').val());
                        callback(curPg - 1, true);
                    }
                });
                //下一页
                pageObj.find('.next').click(function(event){
                    event.preventDefault();
                    if(!$(this).hasClass('disabled')) {
                        var curPg = Number(pageObj.find('.curPg').val());
                        callback(curPg + 1, true);
                    }
                });
                //末页
                pageObj.find('.last').click(function(event){
                    event.preventDefault();
                    if(!$(this).hasClass('disabled')) {
                        callback(totalPage, true);
                    }
                });
                pageObj.find('.curPg').keyup(function(e){
                    var val = $(this).val();
                    if(val!='' && val!=' '){
                        val = val.replace(/[^0-9]/g,'');
                        if(e.keyCode == '13'){
                            callback(val, true);
                        }
                    }
                });

                function callback(curr, loadFlag){
                    if(curr <= 0){
                        curr = 1;
                    }
                    if(curr == 1){
                        $(pageObj).find('.first').addClass('disabled');
                        $(pageObj).find('.previous').addClass('disabled');
                    }else{
                        $(pageObj).find('.first').removeClass('disabled');
                        $(pageObj).find('.previous').removeClass('disabled');
                    }

                    if(curr > totalPage){
                        curr = totalPage;
                    }
                    if(curr == totalPage){
                        $(pageObj).find('.next').addClass('disabled');
                        $(pageObj).find('.last').addClass('disabled');
                    }else{
                        $(pageObj).find('.next').removeClass('disabled');
                        $(pageObj).find('.last').removeClass('disabled');
                    }
                    $(pageObj).find('.curPg').val(curr);
                    if(loadFlag){
                        defaults.callback(curr, defaults.limit, totalCount);
                    }
                }
            }

        }
    };
})(jQuery);