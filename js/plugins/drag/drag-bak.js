var Drag = function(dom,opt){
    var that = this;
    var defaults = {
        move : 'both',
        randomPosition : true ,
        hander: 1
    };
    this.opt = $.extend({},defaults,that.opt || {});
    // this.opt = opt||{};
    this.$dom = $(dom);
    this.father = $(dom).parent();

    this.faWidth = this.father.width();
    this.faHeight = this.father.height();

    var hander = this.opt.hander;
    if(hander == 1){
        hander = this.$dom;
    }else{
        hander = this.$dom.find(this.opt.hander);
    }
    //---初始化
    this.father.css({"position":"relative","overflow":"hidden"});
    this.$dom.css({"position":"absolute"});
    hander.css({"cursor":"move"});

    this.dragging = function (){
        var $dom = that.$dom;
        var mDown = false;//
        var positionX;
        var positionY;
        var moveX ;
        var moveY ;
        var thisWidth = $dom.width()+parseInt($dom.css('padding-left'))+parseInt($dom.css('padding-right'));
        var thisHeight = $dom.height()+parseInt($dom.css('padding-top'))+parseInt($dom.css('padding-bottom'));
        var movePosition = that.opt.move;
        var random = that.opt.randomPosition;
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
            this.css({"zIndex":"1"});
            mDown = true;
            X = e.pageX;
            Y = e.pageY;
            positionX = this.position().left;
            positionY = this.position().top;
            return false;
        });

        $(document).mouseup(function(e){
            mDown = false;
        });

        $(document).mousemove(function(e){
            xPage = e.pageX;//--
            moveX = positionX+xPage-X;
            console.log(moveX)

            yPage = e.pageY;//--
            moveY = positionY+yPage-Y;

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

            }
            if(opt.onDrag){
                opt.onDrag($dom);
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

    this.resizeFa = function(){
        that.faWidth = that.father.width();
        that.faHeight = that.father.height();
    };

    this.dragging();
}

//调用方法2
var d = new Dragging($('div'));
// 点确定重新计算容器大小：
d.resizeFa();







// define(function(require, exports, module){
    $.fn.extend({
        //---元素拖动插件
        dragging:function(data){
            var $this = $(this);
            var xPage;
            var yPage;
            var X;//
            var Y;//
            var xRand = 0;//
            var yRand = 0;//
            var father = $this.parent();
            var defaults = {
                move : 'both',
                randomPosition : true ,
                hander:1
            };
            var opt = $.extend({},defaults,data);
            var movePosition = opt.move;
            var random = opt.randomPosition;

            var hander = opt.hander;

            if(hander == 1){
                hander = $this;
            }else{
                hander = $this.find(opt.hander);
            }


            //---初始化
            father.css({"position":"relative","overflow":"hidden"});
            $this.css({"position":"absolute"});
            hander.css({"cursor":"move"});

            var faWidth = father.width();
            var faHeight = father.height();
            var thisWidth = $this.width()+parseInt($this.css('padding-left'))+parseInt($this.css('padding-right'));
            var thisHeight = $this.height()+parseInt($this.css('padding-top'))+parseInt($this.css('padding-bottom'));

            var mDown = false;//
            var positionX;
            var positionY;
            var moveX ;
            var moveY ;

            if(random){
                $thisRandom();
            }
            function $thisRandom(){ //随机函数
                $this.each(function(index){
                    var randY = parseInt(Math.random()*(faHeight-thisHeight));///
                    var randX = parseInt(Math.random()*(faWidth-thisWidth));///
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
                father.children().css({"zIndex":"0"});
                $this.css({"zIndex":"1"});
                mDown = true;
                X = e.pageX;   //显示鼠标指针的位置，
                Y = e.pageY;
                positionX = $this.position().left;
                positionY = $this.position().top;
                return false;
            });

            $(document).mouseup(function(e){
                mDown = false;
            });

            $(document).mousemove(function(e){
                xPage = e.pageX;//--
                moveX = positionX+xPage-X;

                yPage = e.pageY;//--
                moveY = positionY+yPage-Y;

                function thisXMove(){ //x轴移动
                    if(mDown == true){
                        $this.css({"left":moveX});
                    }else{
                        return;
                    }
                    if(moveX < 0){
                        $this.css({"left":"0"});
                    }
                    if(moveX > (faWidth-thisWidth)){
                        $this.css({"left":faWidth-thisWidth});
                    }
                    return moveX;
                }

                function thisYMove(){ //y轴移动
                    if(mDown == true){
                        $this.css({"top":moveY});
                    }else{
                        return;
                    }
                    if(moveY < 0){
                        $this.css({"top":"0"});
                    }
                    if(moveY > (faHeight-thisHeight)){
                        $this.css({"top":faHeight-thisHeight});
                    }
                    return moveY;
                }

                function thisAllMove(){ //全部移动
                    if(mDown == true){
                        $this.css({"left":moveX,"top":moveY});
                    }else{
                        return;
                    }
                    if(moveX < 0){
                        $this.css({"left":"0"});
                    }
                    if(moveX > (faWidth-thisWidth)){
                        $this.css({"left":faWidth-thisWidth});
                    }

                    if(moveY < 0){
                        $this.css({"top":"0"});
                    }
                    if(moveY > (faHeight-thisHeight)){
                        $this.css({"top":faHeight-thisHeight});
                    }

                }
                if(opt.onDrag){
                    opt.onDrag($this);
                }
                if(movePosition.toLowerCase() == "x"){
                    thisXMove();
                }else if(movePosition.toLowerCase() == "y"){
                    thisYMove();
                }else if(movePosition.toLowerCase() == 'both'){
                    thisAllMove();
                }

            });
        }
    });
