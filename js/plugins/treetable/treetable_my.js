/**
 * 使用异步加载，
 * 如果内部用到同步加载文件，则需要将第一个数组参数去掉
 * 并在内部使用require('/js/plugins/treetable/jquery.treetable')
 */
define([cdnDomain+'/js/plugins/treetable/jquery.treetable.js'],function(require){

    Mom.include('treeTable_css',cdnDomain+'/js/plugins/treetable/css/',[
        'jquery.treetable.theme.default.css',
        'jquery.treetable.css'
    ]);

});