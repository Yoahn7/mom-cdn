/*!
 * Tiny Circleslider 1.1
 * http://www.baijs.nl/tinycircleslider/
 *
 * Copyright 2010, Maarten Baijs
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/gpl-2.0.php
 *
 * Date: 05 / 12 / 2010
 * Depends on library: jQuery
 * -----------------------------
 * @Modify by: Qiyh 2020-10-09
 * -----------------------------
 */
(function($){
	$.fn.circleSlider = function(options){
		var defaults = { 
			value: 0,
			slider: this,
			radius: 40, // Used to determine the size of the circleslider
			callback: null // function that executes after every move
		};
		var options = $.extend(defaults, options);

		var oCircle = $(this);
		var oCircleX = oCircle.outerWidth();
		var oCircleY = oCircle.outerHeight();

		return this.each(function(){
			initialize();
		});		
		function initialize(){
			// oCircle.css('border-radius','50%');
            doCallback(defaults.value);
			setEvents();
		};	
		function setEvents(){
			$(oCircle).click(function(e){
				drag(e);
			});
			if(options.slider && $(options.slider).length){
				$(defaults.slider)[0].onmousedown = start;
				$(defaults.slider)[0].ontouchstart = function(oEvent){
					oEvent.preventDefault();
					oCircle[0].onmousedown = null;
					start(oEvent);
					return false;
				}
			}
		};
		
		function start(oEvent){
			$(document).mousemove(drag);
			document.ontouchmove = function(oEvent){
				$(document).unbind('mousemove');
				drag(oEvent);
			};
			document.onmouseup = end;
            if(options.slider && $(options.slider).length) {
                $(options.slider)[0].onmouseup = end;
                $(options.slider)[0].ontouchend = document.ontouchend = function (oEvent) {
                    document.onmouseup = $(options.slider)[0].onmouseup = null;
                    end(oEvent);
                }
            }
			return false;
		};
		function end(oEvent){
			$(document).unbind('mousemove');
			document.ontouchmove = document.ontouchend = document.onmouseup = null;
            if(options.slider && $(options.slider).length) {
                $(options.slider)[0].onmouseup = $(options.slider)[0].ontouchend = null;
            }
			return false;
		};
		function drag(oEvent){
			oEvent.preventDefault();
			if(typeof(oEvent.touches) != 'undefined' && oEvent.touches.length == 1){ 
			    oEvent = oEvent.touches[0]; 
			}
			var oPos = {
				x: oEvent.pageX - oCircle.offset().left - (oCircleX / 2),
				y: oEvent.pageY - oCircle.offset().top - (oCircleY / 2)
			}
			var radian =  Math.atan2(oPos.x, -oPos.y);  //获取弧度值
            var angle = Math.round( radian * 180 / Math.PI);  //将弧度值转为角度值

			doCallback(angle);
			return false;
		};
		function doCallback(angle){
            var angle = angle < 0 ? angle +360 : angle;
			if(typeof options.callback == 'function')options.callback.call(this, angle);
		};
	};
})(jQuery);