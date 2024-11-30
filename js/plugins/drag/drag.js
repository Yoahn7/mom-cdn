var Drag = function(){
    var that = this;
    this.father = null;     //容器
    this.faWidth = '800px';     //容器初始宽度
    this.faHeight = '500px';    //容器初始高度
    var defaults = {
        move : 'both',
        randomPosition : true ,
        hander: 1
    };

    this.dragging = function (dom,opt){
        var opt = $.extend({},defaults,opt||{});
        var $dom = $(dom);
        $dom.css({"position":"absolute"});
        if(!that.father){
            that.father = opt.father || $dom.parent();
            that.faWidth = that.father.width();
            that.faHeight = that.father.height();
            //---初始化容器
            that.father.css({"position":"relative","overflow":"hidden"});
        }
        var hander = opt.hander;
        if(hander == 1){
            hander = $dom;
        }else{
            hander = $dom.find(opt.hander);
        }
        hander.css({"cursor":"move"});
        var mDown = false;//
        var positionX;
        var positionY;
        var moveX ;
        var moveY ;
        var X,Y;
        var thisWidth = $dom.width()+parseInt($dom.css('padding-left'))+parseInt($dom.css('padding-right'));
        var thisHeight = $dom.height()+parseInt($dom.css('padding-top'))+parseInt($dom.css('padding-bottom'));
        var movePosition = opt.move;
        var random = opt.randomPosition;
        if(random){
            $thisRandom();
        }
        function $thisRandom(){ //随机函数
            $dom.each(function(index){
                var randY = parseInt(Math.random()*(that.faHeight-thisHeight));///
                var randX = parseInt(Math.random()*(that.faWidth-thisWidth));///
                if(movePosition.toLowerCase() == 'x'){
                    $(this).css({
                        left:randX
                    });
                }else if(movePosition.toLowerCase() == 'y'){
                    $(this).css({
                        top:randY
                    });
                }else if(movePosition.toLowerCase() == 'both'){
                    $(this).css({
                        top:randY,
                        left:randX
                    });
                }

            });
        }

        hander.mousedown(function(e){
            that.father.children().css({"zIndex":"0"});
            $(this).css({"zIndex":"1"});
            mDown = true;
            X = e.pageX;
            Y = e.pageY;
            positionX = $(this).position().left;
            positionY = $(this).position().top;
            return false;
        });
        $(document).mouseup(function(e){
            mDown = false;
        });

        $(document).mousemove(function(e){
           xPage = e.pageX;//--
           moveX = positionX+xPage-X;
           yPage = e.pageY;//--
           moveY = positionY+yPage-Y;  //现在鼠标y - 原来鼠标y + 原来元素y
            function thisXMove(){ //x轴移动
                if(mDown == true){
                    $dom.css({"left":moveX});
                }else{
                    return;
                }
                if(moveX < 0){
                    $dom.css({"left":"0"});
                }
                if(moveX > (that.faWidth-thisWidth)){
                    $dom.css({"left":that.faWidth-thisWidth});
                }
                return moveX;
            }

            function thisYMove(){ //y轴移动
                if(mDown == true){
                    $dom.css({"top":moveY});
                }else{
                    return;
                }
                if(moveY < 0){
                    $dom.css({"top":"0"});
                }
                if(moveY > (that.faHeight-thisHeight)){
                    $dom.css({"top":that.faHeight-thisHeight});
                }
                return moveY;
            }

            function thisAllMove(){ //全部移动
                if(mDown == true){
                    $dom.css({"left":moveX,"top":moveY});
                }else{
                    return;
                }
                if(moveX < 0){
                    $dom.css({"left":"0"});
                }
                if(moveX > (that.faWidth-thisWidth)){
                    $dom.css({"left":that.faWidth-thisWidth});
                }

                if(moveY < 0){
                    $dom.css({"top":"0"});
                }
                if(moveY > (that.faHeight-thisHeight)){
                    $dom.css({"top":that.faHeight-thisHeight});
                }
                if(opt.onDrag){
                    opt.onDrag($dom);
                }
            }

            if(movePosition.toLowerCase() == "x"){
                thisXMove();
            }else if(movePosition.toLowerCase() == "y"){
                thisYMove();
            }else if(movePosition.toLowerCase() == 'both'){
                thisAllMove();
            }

        });
    };

    //重新计算容器大小
    this.resizeFa = function(fa){
        if(fa){
            that.father = $(fa);
        }
        if(that.father){
            that.faWidth = that.father.width();
            that.faHeight = that.father.height();
        }
    };
}