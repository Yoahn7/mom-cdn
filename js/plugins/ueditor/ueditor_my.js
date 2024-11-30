define(function(require, exports, module) {
    var ZeroClipboard = require('js/plugins/ueditor/third-party/zeroclipboard/ZeroClipboard.min');
    window.ZeroClipboard = ZeroClipboard;
    var ueidtor = {
	allToobars: [	
		'source', //源代码
		'undo', //撤销
		'redo', //重做
		'pasteplain', //纯文本粘贴模式
		'formatmatch', //格式刷
		'removeformat', //清除格式
		'|',
		'bold', //加粗
		'italic', //斜体
		'fontfamily', //字体
		'fontsize', //字号
		'forecolor', //字体颜色
		'backcolor', //背景色
		'underline', //下划线
		'strikethrough', //删除线
		'touppercase', //字母大写
		'tolowercase', //字母小写
		'fontborder', //字符边框
		'subscript', //下标
		'superscript', //上标
		'customstyle', //自定义标题
		'paragraph', //段落格式
		'indent', //首行缩进
		'justifyleft', //居左对齐
		'justifyright', //居右对齐
		'justifycenter', //居中对齐
		'justifyjustify', //两端对齐
		'rowspacingtop', //段前距
		'rowspacingbottom', //段后距
		'lineheight', //行间距
		'insertorderedlist', //有序列表
		'insertunorderedlist',//无序列表
		'directionalityltr', //从左向右输入
		'directionalityrtl', //从右向左输入
		'inserttitle', //插入标题
		'horizontal', //分隔线
		'|',
		//表格类：
		'inserttable',//插入表格
		'deletetable', //删除表格
		'insertrow', //前插入行
		'insertcol', //前插入列
		'mergeright', //右合并单元格
		'mergedown', //下合并单元格
		'mergecells', //合并多个单元格
		'splittorows', //拆分成行
		'splittocols', //拆分成列
		'splittocells', //完全拆分单元格
		'deleterow', //删除行
		'deletecol', //删除列
		'deletecaption', //删除表格标题
		'insertparagraphbeforetable',//"表格前插入行"
		'edittable', //表格属性
		'edittd', //单元格属性
		'|',
		'blockquote', //引用
		'time', //时间
		'date', //日期
		'spechars', //特殊字符
		'insertcode', //代码语言
		'emotion', //表情
		'link', //超链接
		'unlink', //取消链接
		'insertframe',//插入Iframe
		'attachment', //附件
		'simpleupload', //单图上传
		'insertimage', //多图上传
		'imagenone', //默认
		'imageleft', //左浮动
		'imageright', //右浮动
		'imagecenter', //居中
		'wordimage', //图片转存
		'snapscreen', //截图
		'insertvideo', //视频
		'music', //音乐
		'charts', // 图表
		'map', //Baidu地图
		//'gmap', //Google地图
		'background', //背景
		'template', //模板
		'scrawl', //涂鸦
		'pagebreak', //分页
		//'webapp', //百度应用
		'|',
		'anchor', //锚点
		'autotypeset', //自动排版
		'edittip ', //编辑提示
		'searchreplace', //查询替换
		'drafts', // 从草稿箱加载
		'cleardoc', //清空文档
		'selectall', //全选
		'print', //打印
		'preview', //预览
		'help', //帮助
		'fullscreen', //全屏
	],
        init:function(containerId,cfg){
            	var defaultCfg = {
			initialFrameWidth: '100%',
			autoHeightEnabled: false, //生成滚动条
			//配置参数地址
			configUrl: '~/jsp/config.json',	
			//文件上传配置
			serverUrl: Const.admin+'/imp/sys/SysFile/ueditorUpload',
			fileUrlPrefix: Const.admin+'/imp/sys/SysFile/downloadByUrl?saveName=', //回显时的路径前缀
			//图片上传单独配置
			//imageActionUrl
            	};
           	var ueditCfg = $.extend(true,{},defaultCfg,cfg);
		var toolbars = []; 
		if(cfg.toolbars){
			toolbars = cfg.toolbars;
		}else{
			var toolbarsTmp = [];
			$.each(ueidtor.allToobars,function(i,o){
				//要禁用的按钮
				if($.inArray(o,cfg.disabledToobars||[]) < 0){
					toolbarsTmp.push(o);
				}
			});
			toolbars = [toolbarsTmp];
		}
		ueditCfg.toolbars = toolbars;
		return UE.getEditor(containerId, ueditCfg);
	},
	isArray: function(o) {
	　　return Object.prototype.toString.call(o)=== '[object Array]';
	}
    };
    return {
        init:ueidtor.init
    }
});
