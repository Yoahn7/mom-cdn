define(function(require, exports, module){

    Mom.include('myCss_swiper', cdnDomain, [
        'js/plugins/swiper/css/swiper.css'
    ]);

    var Swiper = require('js/plugins/swiper/js/swiper.min');

    return {
        Swiper: Swiper
    };

});