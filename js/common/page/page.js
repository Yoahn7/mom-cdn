/**
 * 分页组件，支持后端分页
 * Created by mac on 18/2/1.
 * update by Lihy | 2019-02-15 | 优化一个页面存在多个分页时对象数据污染的bug
 */
var Page = function(cfg){
    /*var that = this;
    this.url_ = "";         //分页接口地址
    this.paramData = null;  //分页参数
    this.renderTableFn = null;  //渲染数据回调函数
    this.pageSizeArr = [5,10,20,25,30,40,50];
	this.pageSizeAll = true;	//是否显示‘所有’
    this.defaultPageSizeIndex = 2;  //每页显示多少条，默认为pageSizeArr中的第3个值
    this.rowCount = 0;      //共？条记录
    this.pageShowNum = 10;  //显示10个页码选择（如果配置为0则显示简单样式）
    this.pageContainDom = $(".pagination-box");
    this.scrollTop = true;  //成功请求到新数据之后页面窗口滚动条是否回到顶部  默认值为true,即滚动条在顶部*/
    var that = this;
    var defaults = {
        url: "",         //分页接口地址
        paramData: null,  //分页参数
        contentType:'Json',   //请求类型：ajaxJson、ajaxForm
        checkUser:true,  //默认校验登录用户  false：不进行校验
        renderTableFn: null,  //渲染数据回调函数
        pageSizeArr: [5,10,20,25,30,40,50],
        pageSizeAll: true,	//是否显示‘所有’
        defaultPageSizeIndex: 2,  //每页显示多少条，默认为pageSizeArr中的第3个值
        rowCount: 0,      //共？条记录
        pageShowNum: 10,  //显示10个页码选择（如果配置为0则显示简单样式）
        pageContainDom: $(".pagination-box"),
        scrollTop: true,  //成功请求到新数据之后页面窗口滚动条是否回到顶部  默认值为true,即滚动条在顶部
        loading: true
    };
    this.option = $.extend(true,{},defaults,cfg||{});

    /**
     * 调用：new Page().init()进行分页渲染,
     * 如果要调整每页显示大小:Page.defaultPageSizeIndex=?
     * @param url: 分页接口
     * @param data：分页参数
     * @param vari：是否初始化
     * @param renderTableFn：回调函数进行数据渲染
     */
    this.init = function(url,data,vari,renderTableFn){
        that.option.url = url;
        that.option.paramData = data;
        if(renderTableFn){
            var selPs = parseInt(that.option.pageContainDom.find($("#pag-sel option:selected")).val());
            var pageSize_ = (isNaN(selPs) || selPs<0)?that.option.pageSizeArr[that.option.defaultPageSizeIndex]:selPs;
            var pageNo_ = 1;
            if(that.option.contentType == "Json"){
				that.option.paramData.page = $.extend(true,{},{
					pageSize: pageSize_,
					pageNo: pageNo_
				},that.option.paramData.page);
			}else{
				that.option.paramData['page.pageSize']=pageSize_;
				that.option.paramData['page.pageNo']=pageNo_;
			}
            that.option.renderTableFn = renderTableFn;
        }
        that.pageCom(data,vari);
    };
    this.reload = function(){
        if(that.option.paramData){
            that.pageCom(that.option.paramData,false);
        }
    };
    this.bindEvent = function(){
        this.option.pageContainDom.find(".pag-sel").unbind('change').change(function(){
            var _ps = parseInt($(this).val());
			var pageSize_ = (_ps==-1?that.option.rowCount:_ps);
			if(that.option.contentType == "Json"){
				that.option.paramData.page.pageSize = pageSize_;
			}else{
				that.option.paramData['page.pageSize'] = pageSize_;
			}
            that.pageCom(that.option.paramData,true);
        });
    };
    this.reset = function(arrParam){
        var len = arrParam.length;
        if(len){
            for(var i = 0;i<len;i++ ){
                if(typeof(that.option.paramData[arrParam[i]]) == "object"){
                    var obj = that.option.paramData[arrParam[i]];
                    for(var key in obj){
                        var arr =[]; arr.push(arrParam[i][key]);
                        obj[key] = "";
                    }
                }else{
                    that.option.paramData[arrParam[i]] = "";
                }
            }
        }
		if(that.option.contentType == "Json"){
			that.option.paramData.page.pageSize = $(".pag-sel").val();
		}else{
			that.option.paramData['page.pageSize'] = $(".pag-sel").val();
		}
        that.pageCom(that.option.paramData,true);
    };
    this.pageCom = function(data,vari){
        if(that.option.contentType == "Json"){
            data = JSON.stringify(data);
        }
        Api['ajax'+that.option.contentType](that.option.url, data, function(result){
            if(result.success){
                var page = result.page;
                that.option.rowCount = Number(page.count);
                var showInfo = "";
                if(that.option.pageShowNum == 0){
                    showInfo += "   <span>每页</span><select class='pag-sel' class='form-control' style='height:22px;padding:0 4px;margin:0 3px;display:inline;font-size:12px;'>";
                    var pageSizeArr_ = that.option.pageSizeArr;
                    var allSelected=' selected';
                    pageSizeArr_.forEach(function(o,i){
                        var selected = o==Number(page.pageSize)?' selected':'';
                        showInfo += "<option value='"+o+"' "+selected+">"+o+"</option>";
                        if(selected != ''){
                            allSelected = '';
                        }
                    });
					if(that.option.pageSizeAll==true){
						showInfo += "<option value='-1' "+allSelected+">所有</option>";
					}
                    showInfo += "</select>条";
					showInfo += "，共"+page.count+"条";
                    that.option.pageShowNum = 0;
                }else{
                    if(Number(page.count)>0){
                        showInfo += "显示第"+(Number(page.startRowNum)+1)+"~"+(Number(page.endRowNum)+1)+"条记录，";
                    }
                    showInfo += "共 "+(page.count)+"条记录";

                    showInfo += "   <span>每页显示</span><select name='' class='pag-sel' class='form-control' style='height:26px;padding:0 4px;display:inline;font-size:12px;'>";
                    var pageSizeArr_ = that.option.pageSizeArr;
                    var allSelected=' selected';
                    pageSizeArr_.forEach(function(o,i){
                        var selected = o==Number(page.pageSize)?' selected':'';
                        showInfo += "<option value='"+o+"' "+selected+">"+o+"</option>";
                        if(selected != ''){
                            allSelected = '';
                        }
                    });
					if(that.option.pageSizeAll==true){
						showInfo += "<option value='-1' "+allSelected+">所有</option>";
					}
                    showInfo += "</select>条记录";
                }
                if($(that.option.pageContainDom).length==0){
                    alert('未找到分页插件容器');
                    return;
                }
                $(that.option.pageContainDom).find('.page-info').empty().html(showInfo);
                that.bindEvent(that.option.contentType);
                $(that.option.pageContainDom).find('.pagination-detail').show();
                if(vari){
                    that.callBackPagination(Number(page.pageSize),Number(page.pageCount),Number(page.count));
                }
                if( that.option.renderTableFn){
                    that.option.renderTableFn(page.rows, result);
                }
                if(that.option.scrollTop){
                    $('html,body').animate({scrollTop: '0px'}, 300);
                }
            }else{
                Mom.layAlert(result.message);
            }
        },null,that.option.checkUser, that.option.loading);
    };
    this.callBackPagination = function(limit,showCount,totalCount) {
        this.option.pageContainDom.find('.pagination-roll').extendPagination({
            totalCount: totalCount,
            showCount: showCount,
            showPage: that.option.pageShowNum,
            limit: limit,
            callback: function (curr,limit, totalCount) {
				if(that.option.contentType == "Json"){
					that.option.paramData.page = {
						pageSize:limit,
						pageNo:curr
					};
				}else{
					that.option.paramData['page.pageSize']=limit;
					that.option.paramData['page.pageNo']=curr;
				}
                that.init(that.option.url,that.option.paramData,false);
            }
        });
    }
};
