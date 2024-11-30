define(function(require, exports, module){
    var PageModule = {
        init: function(){
            require([cdnDomain+'/js/plugins/webUpLoader/js/webuploader.js'],function(WebUploader){
                Mom.include('myCss_webUpLoader', cdnDomain, [
                    'js/plugins/webUpLoader/css/webuploader_my.css'
                ]);
                if (!WebUploader.Uploader.support() ) {
                    alert( 'WebUploader 不支持您的浏览器！如果你使用的是IE浏览器，请尝试升级 flash 播放器');
                    throw new Error( 'WebUploader does not support the browser you are using.' );
                }
                // alert(Mom.getUrlParam('relateId'))
                $('#relateId').val(Mom.getUrlParam('relateId')||'');
                var $wrap = $('#uploader'),
                    // 图片容器
                    $queue = $('<ul class="filelist"></ul>')
                        .appendTo( $wrap.find('.queueList') ),

                    // 状态栏，包括进度和控制按钮
                    $statusBar = $wrap.find('.statusBar'),
                    // 文件总体选择信息。
                    $info = $statusBar.find('.info'),
                    // 上传按钮
                    $upload = $wrap.find('.uploadBtn'),

                    // 没选择文件之前的内容。
                    $placeHolder = $wrap.find('.placeholder'),

                    // 总体进度条
                    $progress = $statusBar.find('.progress').hide(),
                    // 添加的文件数量
                    fileCount = 0,
                    // 添加的文件总大小
                    fileSize = 0,
                    // 优化retina, 在retina下这个值是2
                    ratio = window.devicePixelRatio || 1,
                    // 缩略图大小
                    // 缩略图大小
                    thumbnailWidth = 110 * ratio,
                    thumbnailHeight = 110 * ratio,
                    // 可能有pedding, ready, uploading, confirm, done.
                    state = 'pedding',
                    // 所有文件的进度信息，key为file id
                    percentages = {},

                    supportTransition = (function(){
                        var s = document.createElement('p').style,
                            r = 'transition' in s ||
                                'WebkitTransition' in s ||
                                'MozTransition' in s ||
                                'msTransition' in s ||
                                'OTransition' in s;
                        s = null;
                        return r;
                    });
                var loadingLayIdx;
                var getIding= true;
                var errorarr = [];
                var initWebuploader = function(serverUrl,options) {
                    var defaultOptions={
                        pick: {
                            id: '#filePicker',
                            innerHTML:'请选择',
                            multiple:true
                        },
                        dnd: '#uploader .queueList',
                        paste: document.body,

                        // 只允许选择图片文件。
                        /*accept: {
                            title: 'Images',
                            extensions: 'gif,jpg,jpeg,bmp,png',
                            mimeTypes: 'image/jpg,image/jpeg,image/png'
                        },*/
                        accept:{
                            title: 'Files',
                            extensions: 'gif,jpg,jpeg,bmp,png,pdf,doc,docx,txt,xls,xlsx,ppt,pptx,zip,mp3,mp4,text,csv',
                            mimeTypes: 'image/jpg,image/jpeg,image/png,text/*'
                                //word
                                +',application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                                //excel
                                +',application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                                //ppt
                                +',application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation'
                                +',application/pdf'
                                +',application/zip'
                                +',application/csv'
                        },
                        // swf文件路径
                        swf: Const.admin+'/js/plugins/webUploader/Uploader.swf',
                        disableGlobalDnd: true,
                        // 文件接收服务端。
                        server: serverUrl,
                        fileNumLimit: 10,   //文件上传数量限制   单次上传文件个数不可超过10个
                        // fileSizeLimit: 50 * 1024 * 1024,    // 50 M
                        fileSingleSizeLimit: 20 * 1024 * 1024 ,   // 20 M   单个文件大小不能超过20M
                        threads:1 ,  //上传并发数。允许同时最大上传进程数,为了保证文件上传顺序
                        //上传前不压缩
                        compress:false,
                        // 选完文件后，是否自动上传。
                        auto: false,
                        // 开起分片上传.
                        chunked: false,    //为true时会导致同个文件拆分（5M）后多次上传
                        // 分片大小，默认5M
                        chunkSize: 5242880,
                        // 分片出错后（如网络原因等造成出错）的重传次数
                        chunkRetry: 2,
                    };
                    var setting = $.extend(true,{},defaultOptions,options || {});
                    if(setting.auto == false){
                        $('#uploadBtn').removeClass('hidden');
                    }
                    //webUploader对象
                    var uploader = WebUploader.create(setting);
                    // 添加“添加文件”的按钮，
                    if(setting.pick.multiple){
                        $('#filePicker2').removeClass('hidden');
                        uploader.addButton({
                            id: '#filePicker2',
                            label: '继续添加'
                        });
                    }
                    // state:状态，arg1：提示错误信息编码,arg2:文件设置的大小，agr3:上传的文件对象
                    uploader.on( 'all', function( state, arg1, arg2, arg3 ) {
                        //console.log(state, arg1, arg2, arg3 )
                        switch ( state ) {
                            case 'ready':
                                break;
                            //添加到队列之前
                            case 'beforeFileQueued':
                                // onBeforeFileQueued(arg1);
                                break;
                            //单个文件添加到队列后
                            case 'fileQueued':
                                onFileQueued(arg1);
                                break;
                            //多个文件添加到队列后
                            case 'filesQueued':
                                showErrorAll(arg1);
                                break;
                            //上传服务器前
                            case 'uploadBeforeSend':
                                onUploadBeforeSend( arg1, arg2, arg3);
                                if(options.uploadBeforeSend){
                                    options.uploadBeforeSend(arg1, arg2, arg3);
                                }
                                break;
                            //上传中
                            case 'uploadProgress':
                                onUploadProgress(arg1, arg2);
                                break;
                            //上传成功（针对单个文件）
                            case 'uploadSuccess':
                                onUploadSuccess(arg1, arg2);
                                break;
                            //上传完成后（针对所有文件）
                            case 'uploadFinished':
                                onUploadFinished(arg1);
                                showErrorAll(arg1);
                                break;
                            //从队列移除
                            case 'fileDequeued':
                                onFileDequeued(arg1);
                                break;
                            //失败
                            case 'error':
                                onFileError(arg1, arg2, arg3);
                                break;
                            default:
                                return;
                        }
                    });

                    var onUploadBeforeSend = function(obj,data, headers){
                        /*data.relateId = setting.relateId||'';
                        data.module = setting.module||'';
                        data.multiple = setting.pick.multiple;
                        headers.Accept = "application/json; charset=utf-8";
                        headers.Authorization = Mom.getAuthInfo();*/
                        data.relateId = $('#relateId').val();
                        data.module = setting.module||'';
                        headers.Accept= "application/json; charset=utf-8";
                        headers.Authorization = Mom.getAuthInfo();
                    };

                    // 上传进度条
                    var onUploadProgress = function( file, percentage ) {
                        var $li = $('#'+file.id),
                            $percent = $li.find('.progress span');
                        if($percent.length){
                            $percent.css({'width': percentage * 100 + '%' });
                            percentages[ file.id ][ 1 ] = percentage;
                            updateTotalProgress();
                        }else{
                            if(!loadingLayIdx){
                                loadingLayIdx = Mom.layLoading('处理中，请稍后....');
                            }
                        }
                    };
                    // 添加到队列后

                    var onFileQueued = function(file) {
                        /*// 创建缩略图   如果生成缩略图有错误，此error将为真。
                        uploader.makeThumb(file, function (error, src) {
                            if (error) {
                                Mom.layMsg('生成图像缩略图失败');
                                return;
                            }
                            $('.userImg').attr('src', src);//设置预览图

                        }, 100, 100); //100x100为缩略图尺寸*/
                        if(getIding && $('#relateId').val() == ''){
                            $('#uploadBtn').addClass('disabled');
                            getIding = false;
                            Api.ajaxForm(Const.admin+'/Common/uuid',{},function(result){
                                if(result.success){
                                    $('#uploadBtn').removeClass('disabled');
                                    $('#relateId').val(result.message);
                                    makeThumb();
                                }else{
                                    Mom.layAlert(result.message)
                                }
                            })
                        }else{
                            makeThumb();
                        }
                        function makeThumb(){
                            fileCount++;
                            fileSize += file.size;
                            if ( fileCount === 1 ) {
                                $placeHolder.addClass( 'element-invisible' );
                                $statusBar.show();
                            }
                            addFile( file );
                            setState( 'ready' );
                            updateTotalProgress();
                        }
                    };

                    var onFileError = function(code, arg2, arg3){
                        var file = arg3 || arg2;
                        // 文件大小换算  参数值的单位是B
                        function conver(limit){
                            var size = "";
                            if( limit < 0.1 * 1024 ){ //如果小于0.1KB转化成B
                                size = limit.toFixed(2) + "B";
                            }else if(limit < 0.1 * 1024 * 1024 ){//如果小于0.1MB转化成KB
                                size = (limit / 1024).toFixed(2) + "KB";
                            }else if(limit < 0.1 * 1024 * 1024 * 1024){ //如果小于0.1GB转化成MB
                                size = (limit / (1024 * 1024)).toFixed(2) + "MB";
                            }else{ //其他转化成GB
                                size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB";
                            }

                            var sizestr = size + "";
                            var len = sizestr.indexOf("\.");
                            var dec = sizestr.substr(len + 1, 2);
                            if(dec == "00"){//当小数点后为00时 去掉小数部分
                                return sizestr.substring(0,len) + sizestr.substr(len + 3,2);
                            }
                            return sizestr;
                        }
                        var name=file.name;
                        var str="";
                        switch(code) {
                            case "F_DUPLICATE":
                                str = name + "文件重复";
                                errorarr.push(str);
                                break;
                            case "Q_TYPE_DENIED":
                                str = name + "文件类型 不允许";
                                errorarr.push(str);
                                break;
                            case "F_EXCEED_SIZE":
                                var imageMaxSize = conver(setting.fileSingleSizeLimit);//通过计算
                                str = name + "文件大小不可超过" + imageMaxSize;
                                errorarr.push(str);
                                break;
                            case "Q_EXCEED_SIZE_LIMIT":
                                errorarr.push("超出空间文件大小");
                                break;
                            case "Q_EXCEED_NUM_LIMIT":
                                errorarr.push("抱歉，单次上传数量不可超过"+setting.fileNumLimit+"个");
                                break;
                            default:
                                str = name + " Error:" + code;
                        }
                    };
                    var showErrorAll = function(arg1){
                        if(errorarr.length>0){
                            alert(errorarr.join("\n"));
                        }
                        //清空错误信息
                        errorarr = [];
                    };
                    // 删除
                    var onFileDequeued = function( file ) {
                        fileCount--;
                        fileSize -= file.size;

                        if ( !fileCount ) {
                            setState( 'pedding' );
                        }

                        var $li = $('#'+file.id);
                        delete percentages[ file.id ];
                        $li.off().find('.file-panel').off().end().remove();
                        updateTotalProgress();
                    };

                    var onUploadSuccess = function( file,response) {
                        if(response.success == true){
                            $('#'+file.id).append( '<span class="success"></span>' );
                            //上传成功后不显示操作按钮
                            $('#'+file.id).off( 'mouseenter mouseleave' );
                            $('#'+file.id).find('.file-panel').remove();
                            var responseFile = response.SysArchive;
                            $('#'+file.id).attr('attr-fileId', responseFile.id)
                                .attr('attr-fileName', responseFile.fileName)
                                .attr('attr-docName', responseFile.docName)
                                .attr('attr-type', responseFile.type)
                                .attr('attr-size', responseFile.size)
                                .attr('attr-success', '1');
                            //$('#nameImage').val(response.saveName);
                        }else{
                            //$info.text( '上传失败' ).appendTo( $('#'+file.id) );
                            $('#'+file.id).append( '<p class="error">上传失败</p>' );
                            Mom.layAlert(response.message);
                        }
                    };

                    var onUploadFinished = function(arg1){
                        $('#okBtn').removeClass('hidden');
                        if(loadingLayIdx){
                            layer.close(loadingLayIdx);
                            loadingLayIdx ='';
                        }
                    };


                    // 当有文件添加进来时执行，负责view的创建
                    function addFile( file ) {
                        var $li = $( '<li id="' + file.id + '">' +
                            '<p class="title">' + file.name + '</p>' +
                            '<p class="imgWrap"></p>'+
                            '<p class="progress"><span></span></p>' +
                            '</li>' ),

                            $btns = $('<div class="file-panel">' +
                                '<span class="cancel">删除</span>' +
                                '<span class="rotateRight">向右旋转</span>' +
                                '<span class="rotateLeft">向左旋转</span></div>').appendTo( $li ),
                            $prgress = $li.find('p.progress span'),
                            $wrap = $li.find( 'p.imgWrap' ),
                            $info = $('<p class="error"></p>'),

                            showError = function( code ) {
                                switch( code ) {
                                    case 'exceed_size':
                                        text = '文件大小超出';
                                        break;
                                    case 'interrupt':
                                        text = '上传暂停';
                                        break;
                                    default:
                                        text = '上传失败，请重试';
                                        break;
                                }
                                $info.text( text ).appendTo( $li );
                            };

                        if ( file.getStatus() === 'invalid' ) {
                            showError(file.statusText);
                        } else {
                            $wrap.text( '预览中' );
                            uploader.makeThumb( file, function( error, src ) {
                                if ( error ) {
                                    $wrap.text( '不能预览' );
                                    return;
                                }

                                var img = $('<img src="'+src+'">');
                                $wrap.empty().append( img );
                            }, thumbnailWidth, thumbnailHeight );

                            percentages[ file.id ] = [ file.size, 0 ];
                            file.rotation = 0;
                        }

                        file.on('statuschange', function( cur, prev ) {
                            if ( prev === 'progress' ) {
                                $prgress.hide().width(0);
                            } else if ( prev === 'queued' ) {
                                //$li.off( 'mouseenter mouseleave' );
                                //$btns.remove();
                            }

                            // 成功
                            if ( cur === 'error' || cur === 'invalid' ) {
                                showError( file.statusText );
                                percentages[ file.id ][ 1 ] = 1;
                                //重试
                                //function retry() {
                                // uploader.retry();
                                //}
                            } else if ( cur === 'interrupt' ) {
                                showError( 'interrupt' );
                            } else if ( cur === 'queued' ) {
                                percentages[ file.id ][ 1 ] = 0;
                            } else if ( cur === 'progress' ) {
                                $info.remove();
                                $prgress.css('display', 'block');
                            } else if ( cur === 'complete' ) {

                            }

                            $li.removeClass( 'state-' + prev ).addClass( 'state-' + cur );
                        });

                        $li.on( 'mouseenter', function() {
                            $btns.stop().animate({height: 30});
                        });

                        $li.on( 'mouseleave', function() {
                            $btns.stop().animate({height: 0});
                        });

                        $btns.on( 'click', 'span', function() {
                            var index = $(this).index(),
                                deg;
                            switch ( index ) {
                                case 0:
                                    uploader.removeFile( file );
                                    return;

                                case 1:
                                    file.rotation += 90;
                                    break;

                                case 2:
                                    file.rotation -= 90;
                                    break;
                            }

                            if ( supportTransition ) {
                                deg = 'rotate(' + file.rotation + 'deg)';
                                $wrap.css({
                                    '-webkit-transform': deg,
                                    '-mos-transform': deg,
                                    '-o-transform': deg,
                                    'transform': deg
                                });
                            } else {
                                $wrap.css( 'filter', 'progid:DXImageTransform.Microsoft.BasicImage(rotation='+ (~~((file.rotation/90)%4 + 4)%4) +')');
                                // use jquery animate to rotation
                                // $({
                                //     rotation: rotation
                                // }).animate({
                                //     rotation: file.rotation
                                // }, {
                                //     easing: 'linear',
                                //     step: function( now ) {
                                //         now = now * Math.PI / 180;

                                //         var cos = Math.cos( now ),
                                //             sin = Math.sin( now );

                                //         $wrap.css( 'filter', "progid:DXImageTransform.Microsoft.Matrix(M11=" + cos + ",M12=" + (-sin) + ",M21=" + sin + ",M22=" + cos + ",SizingMethod='auto expand')");
                                //     }
                                // });
                            }
                        });

                        $li.appendTo( $queue );
                    }


                    function updateTotalProgress() {
                        var loaded = 0,
                            total = 0,
                            spans = $progress.children(),
                            percent;

                        $.each( percentages, function( k, v ) {
                            total += v[ 0 ];
                            loaded += v[ 0 ] * v[ 1 ];
                        } );

                        percent = total ? loaded / total : 0;
                        spans.eq( 0 ).text( Math.round( percent * 100 ) + '%' );
                        spans.eq( 1 ).css( 'width', Math.round( percent * 100 ) + '%' );
                        updateStatus();
                    }

                    function updateStatus() {
                        var text = '', stats;

                        if ( state === 'ready' ) {
                            text = '选中' + fileCount + '个文件，共' +
                                WebUploader.formatSize( fileSize ) + '。';
                        } else if ( state === 'confirm' ) {
                            stats = uploader.getStats();
                            if ( stats.uploadFailNum ) {
                                text = '已成功上传' + stats.successNum+ '张照片至XX相册，'+
                                    stats.uploadFailNum + '张照片上传失败，<a class="retry" href="#">重新上传</a>失败图片或<a class="ignore" href="#">忽略</a>'
                            }

                        } else {
                            stats = uploader.getStats();
                            text = '共' + fileCount + '个文件（' +
                                WebUploader.formatSize( fileSize )  +
                                '），已上传' + stats.successNum + '个文件';

                            if ( stats.uploadFailNum ) {
                                text += '，失败' + stats.uploadFailNum + '个文件';
                            }
                        }

                        $info.html( text );
                    }

                    function setState( val ) {
                        var file, stats;

                        if ( val === state ) {
                            return;
                        }

                        $upload.removeClass( 'state-' + state );
                        $upload.addClass( 'state-' + val );
                        state = val;

                        switch ( state ) {
                            case 'pedding':
                                $placeHolder.removeClass( 'element-invisible' );
                                $queue.parent().removeClass('filled');
                                $queue.hide();
                                $statusBar.addClass( 'element-invisible' );
                                uploader.refresh();
                                break;

                            case 'ready':
                                $placeHolder.addClass( 'element-invisible' );
                                $( '#filePicker2' ).removeClass( 'element-invisible');
                                $queue.parent().addClass('filled');
                                $queue.show();
                                $statusBar.removeClass('element-invisible');
                                uploader.refresh();
                                break;

                            case 'uploading':
                                $( '#filePicker2' ).addClass( 'element-invisible' );
                                $progress.show();
                                $upload.text( '暂停上传' );
                                break;

                            case 'paused':
                                $progress.show();
                                $upload.text( '继续上传' );
                                break;

                            case 'confirm':
                                $progress.hide();
                                $upload.text( '开始上传' ).addClass( 'disabled' );

                                stats = uploader.getStats();
                                if ( stats.successNum && !stats.uploadFailNum ) {
                                    setState( 'finish' );
                                    return;
                                }
                                break;
                            case 'finish':
                                stats = uploader.getStats();
                                if ( stats.successNum ) {
                                    alert( '上传成功' );
                                } else {
                                    // 没有成功的图片，重设
                                    state = 'done';
                                    location.reload();
                                }
                                break;
                        }

                        updateStatus();
                    }


                    $('.uploadBtn').on('click', function() {
                        if ( $(this).hasClass( 'disabled' ) ) {
                            return false;
                        }
                        if ( state === 'ready' ) {
                            /*uploader.options.formData = {
                                relateId: relateId
                            }*/
                            uploader.upload();
                        } else if ( state === 'paused' ) {
                            uploader.upload();
                        } else if ( state === 'uploading' ) {
                            uploader.stop();
                        }
                    });

                };

                //检测到获取配置后执行
                var timer = setInterval(function(){
                    if(serverUrl){
                        //立即调用，加载数据
                        initWebuploader(serverUrl, optionsParam);
                        clearInterval(timer);
                    }
                },500);
            });
        },

        /**
         * 文件上传，直接选择文件，不打开上传窗口；单选！！！
         * @param btnDom    绑定的DOM元素
         * @param options    参数项 参考webupLoader官网API
         * @param callback  成功之后的回调函数
         */
        webUploaderSingle: function(btnDom, options, callback){
            require([cdnDomain+'/js/plugins/webUpLoader/js/webuploader.js'],function(WebUploader) {
                //上传..略
                if (!WebUploader.Uploader.support()) {
                    alert('Web Uploader 不支持您的浏览器！如果你使用的是IE浏览器，请尝试升级 flash 播放器');
                    throw new Error('WebUploader does not support the browser you are using.');
                }
                /*
                if ($(relateId).val() == '') {
                    Api.ajaxForm(Const.admin + '/Common/uuid', {}, function (result) {
                        $(relateId).val(result.message);
                        initWebuploader(relateId);
                    });
                }
                }*/
                var errorarr = [];
                var initWebuploader = function () {
                    var defaultOptions = {
                        pick: {
                            id: btnDom,
                            multiple: false
                        },
                        //默认只允许选择图片文件
                        //https://blog.csdn.net/a1056244734/article/details/106491113/
                        accept: {
                            title: 'Images',
                            extensions: 'gif,jpg,jpeg,bmp,png',
                            mimeTypes: 'image/jpg,image/jpeg,image/png'
                            //extensions:'lic' , //后缀示例
                            //mimeTypes: '.lic' //后缀示例
                        },
                        // swf文件路径
                        swf: Const.admin + '/js/plugins/webUploader/Uploader.swf',
                        disableGlobalDnd: true, //是否禁掉整个页面的拖拽功能
                        // 文件接收服务端。
                        server: Const.admin+'/api/imp/sys/SysArchive/upload',
                        fileNumLimit: 1,   //文件个数   单次上传文件个数不可超过10个
                        fileSingleSizeLimit: 20 * 1024 * 1024,   // 20 M   单个文件大小不能超过20
                        //上传前不压缩
                        compress: false,
                        // 选完文件后，是否自动上传。
                        auto: true,
                        duplicate: true,
                        // 开起分片上传.
                        chunked: false,    //为true时会导致同个文件拆分（5M）后多次上传
                        // 分片大小，默认5M
                        chunkSize: 5242880,
                        // 分片出错后（如网络原因等造成出错）的重传次数
                        chunkRetry: 2,
                    };
                    var setting = $.extend(true, {}, defaultOptions, options || {});
                    //webUploader对象
                    var uploader = WebUploader.create(setting);
                    uploader.on('all', function (state, arg1, arg2, arg3) {
                        switch (state) {
                            case 'ready':
                                break;
                            //添加到队列之前
                            case 'beforeFileQueued':
                                // onBeforeFileQueued(arg1);
                                break;
                            //单个文件添加到队列后
                            case 'fileQueued':
                                onFileQueued(arg1);
                                break;
                            //上传服务器前
                            case 'uploadBeforeSend':
                                onUploadBeforeSend(arg1, arg2, arg3);
                                if (options.uploadBeforeSend) {
                                    options.uploadBeforeSend(arg1, arg2, arg3);
                                }
                                break;
                            //上传中
                            case 'uploadProgress':
                                onUploadProgress(arg1, arg2);
                                break;
                            //上传成功（针对单个文件）
                            case 'uploadSuccess':
                                onUploadSuccess(arg1, arg2);
                                break;
                            //上传完成后（针对所有文件）
                            case 'uploadComplete':
                                onUploadComplete(arg1);
                                showErrorAll(arg1);
                                break;
                            //从队列移除
                            case 'fileDequeued':
                                break;
                            //失败
                            case 'error':
                                onFileError(arg1, arg2, arg3);
                                break;
                            default:
                                return;
                        }
                    });

                    var onUploadBeforeSend = function (obj, data, headers) {
                        data.relateId = setting.relateId||'';
                        data.module = setting.module||'';
                        data.multiple = setting.pick.multiple;
                        headers.Accept = "application/json; charset=utf-8";
                        headers.Authorization = Mom.getAuthInfo();
                    };

                    // 上传进度条
                    var loadingLayIdx;
                    var onUploadProgress = function (file, percentage) {
                        var $li = $('#'+file.id),
                            $percent = $li.find('.progress span');
                        if($percent.length){
                            $percent.css({'width': percentage * 100 + '%' });
                            percentages[ file.id ][ 1 ] = percentage;
                            updateTotalProgress();
                        }else{
                            if(!loadingLayIdx){
                                loadingLayIdx = Mom.layLoading('处理中，请稍后....');
                            }
                        }
                    };
                    // 添加到队列后
                    var onFileQueued = function (file) {

                    };

                    var onFileError = function(code, arg2, arg3){
                        var file = arg3 || arg2;
                        // 文件大小换算  参数值的单位是B
                        function conver(limit) {
                            var size = "";
                            if (limit < 0.1 * 1024) { //如果小于0.1KB转化成B
                                size = limit.toFixed(2) + "B";
                            } else if (limit < 0.1 * 1024 * 1024) {//如果小于0.1MB转化成KB
                                size = (limit / 1024).toFixed(2) + "KB";
                            } else if (limit < 0.1 * 1024 * 1024 * 1024) { //如果小于0.1GB转化成MB
                                size = (limit / (1024 * 1024)).toFixed(2) + "MB";
                            } else { //其他转化成GB
                                size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB";
                            }

                            var sizestr = size + "";
                            var len = sizestr.indexOf("\.");
                            var dec = sizestr.substr(len + 1, 2);
                            if (dec == "00") {//当小数点后为00时 去掉小数部分
                                return sizestr.substring(0, len) + sizestr.substr(len + 3, 2);
                            }
                            return sizestr;
                        }

                        var name = file.name;
                        var str = "";
                        switch (code) {
                            case "F_DUPLICATE":
                                str = name + "文件重复";
                                errorarr.push(str);
                                break;
                            case "Q_TYPE_DENIED":
                                str = name + "文件类型 不允许";
                                errorarr.push(str);
                                break;
                            case "F_EXCEED_SIZE":
                                var imageMaxSize = conver(setting.fileSingleSizeLimit);//通过计算
                                str = name + "文件大小不可超过" + imageMaxSize;
                                errorarr.push(str);
                                break;
                            case "Q_EXCEED_SIZE_LIMIT":
                                errorarr.push("超出空间文件大小");
                                break;
                            case "Q_EXCEED_NUM_LIMIT":
                                errorarr.push("抱歉，单次上传数量不可超过" + setting.fileNumLimit + "个");
                                break;
                            default:
                                str = name + " Error:" + code;
                        }
                        showErrorAll();
                    };
                    var showErrorAll = function (arg1) {
                        if (errorarr.length > 0) {
                            alert(errorarr.join("\n"));
                        }
                        //清空错误信息
                        errorarr = [];
                    };

                    var onUploadSuccess = function (file, response) {
                        if(callback){
                            callback(uploader, file, response);
                        }
                        if (response.success == false) {
                            Mom.layAlert(response.message);
                        }
                    };
                    var onUploadComplete = function (arg1) {
                        // uploader.distory();
                        uploader.reset();
                        if(loadingLayIdx){
                            layer.close(loadingLayIdx);
                            loadingLayIdx ='';
                        }
                    };

                    return uploader;
                };

                initWebuploader();
            });
        },

        /**
         * 打开上传附件窗口，进行文件上传
         * @param containDom 上传后回显的容器
         * @param idDom 父页面的id元素
         * @param serverUrl
         * @param options:{
         *      webupLoader默认配置项
         *      templeteUrl: 附件列表的 模板地址
         *      canDelete: boolean（默认为false）
         *      canDownload: boolean (默认为true)
         *      pick:{multiple:true}  多个文件同时上传
         *  }
         *
         * @param callback
         * @returns {*}
         */
        openWebuploaderWin: function(containDom,idDom,options,callback){
            options = options || {};
            var serverUrl = Const.admin+'/api/imp/sys/SysArchive/upload';
            var relateId = $(idDom).val();
            var layerCfg = {
                type: 2,
                skin: Const.layerSkin() || '',
                maxmin: true,
                title:"文件上传",
                area: ['800px',  '410px'],
                content: cdnDomain+'/pages/common/webUploadWin.html?relateId='+relateId,
                // closeBtn: 2,
                // btn: ['关闭'],
                success: function(layero, index){
                    var iframeWin = layero.find('iframe')[0].contentWindow;
                    iframeWin.setConfig(serverUrl,options);
                    $('#okBtn',iframeWin.document).click(function(){
                        //回显
                        var okFiles = [], errorFiles=[], retFlag=false;
                        $('.filelist',iframeWin.document).each(function(i,ul){
                            $(ul).children('li').each(function(j,li){
                                var fileSuccess = $(li).attr('attr-success')||'0';
                                var fileObj = {
                                    id: $(li).attr('attr-fileId'),
                                    fileName: $(li).attr('attr-fileName'),
                                    docName: $(li).attr('attr-docName'),
                                    type: $(li).attr('attr-type'),
                                    size:$(li).attr('attr-size'),
                                    thumb: $(li).find('img').attr('src')
                                };
                                if('1' == fileSuccess){
                                    okFiles.push(fileObj);
                                    retFlag = true;
                                }else{
                                    errorFiles.push(fileObj);
                                }
                            });
                        });
                        var flag = true;
                        var relateId = $('#relateId',iframeWin.document).val();
                        if(callback){
                            flag = callback({
                                success: retFlag,
                                relateId:relateId,
                                rows: okFiles,
                                errorFiles : errorFiles
                            });
                        }else{
                            if(retFlag){
                                $(idDom).val(relateId);
                                var renderOptions = {
                                    canDelete: true,
                                    templeteUrl:options.templeteUrl
                                };
                                PageModule.renderArchiveListDefault(containDom, okFiles, renderOptions);
                            }
                        }
                        //关闭
                        if(flag != false)
                            Mom.top().layer.close(index);
                    });
                }
            };
            return Mom.top().layer.open(layerCfg);
        },
        /**
         * 附件回显
         * @param containDom  承载附件列表的容器
         * @param dataPrm   请求附件列表需传递的参数项：如{“relateId”:id}
         * @param options:{
         *      templeteUrl: 模板地址
         *      canDelete: boolean（默认为false）
         *      canDownload: boolean (默认为true)
         *      showNodata: boolean（默认为true）没有附件时是否显示‘暂无附件’
         *  }
         * @param delCallback    自定义删除附件的回调函数   //默认不需要传递该参数
         */
        renderArchiveList: function(containDom, dataPrm, options, delCallback){
            options = options || {};
            // 附件列表回显
            Api.ajaxJson(Const.admin +'/api/imp/sys/SysArchive/list',JSON.stringify(dataPrm),function(result){
                if(result.success){
                    PageModule.renderArchiveListDefault(containDom, result.rows, options, delCallback);
                }else{
                    Mom.layAlert(result.message);
                }
            });
        },
        renderArchiveListDefault: function(containDom, files, options, delCallback){
            var nodataObj = $(containDom).children('.nodata');
            if(files && 0<files.length){
                nodataObj.remove();
            }
            else if(options.showNodata != false){
                if(nodataObj.length){
                    nodataObj.css({'display':'block'});
                }else{
                    $(containDom).html("<p class='nodata center'>暂无附件</p>");
                }
            }

            $(files).each(function(i,o){
                var attType = Bus.getAttaType(o.type);
                o.icon = 'fileico_'+attType;
            });
            if(containDom != null){
                require(['artTemplate'],function(template){
                    var templeteUrl = options.templeteUrl || (cdnDomain+'/pages/common/attachmentViewTemp.html');
                    if(templeteUrl.toLowerCase().indexOf('http') < 0){
                        templeteUrl = Mom.basePath+templeteUrl;
                    }
                    $.get(templeteUrl,function(tempalteData){
                        var render = template.compile(tempalteData),
                            attachHtml = render({rows:files});
                        $(containDom).append(attachHtml);
                        //绑定删除事件(默认不能删除)
                        $(containDom).find('.file-delete').unbind('click').click(function(){
                            if(options.canDelete == true){
                                var that = this;
                                var delData = {
                                    ids:$(this).closest('li').attr('data-id')
                                };
                                Bus.deleteItem('确认删除吗',Const.admin +'/api/imp/sys/SysArchive/delete', delData,function(result, layerIndex, data){
                                    if(delCallback){
                                        return delCallback(result, layerIndex, data);
                                    }else{
                                        if(result.success == true){
                                            $(that).closest('li').remove();
                                            Mom.top().layer.close(layerIndex);
                                        }else{
                                            Mom.layAlert(result.message);
                                        }
                                        return true;
                                    }
                                });
                            }else {
                                Mom.layMsg('当前不能删除');
                            }
                        });
                        //绑定下载事件（默认可以下载）
                        $(containDom).find('.file-download').unbind('click').click(function(){
                            if(options.canDownload != false){
                                var downData = {
                                    id:$(this).closest('li').attr('data-id'),
                                    __noauth:true
                                };
                                Bus.windowOpenPost(Const.admin + "/api/imp/sys/SysArchive/download",downData);
                            }else{
                                Mom.layMsg('当前不能下载');
                            }
                        });
                        //绑定预览事件（默认可以预览）
                        $(containDom).find('.file-browse').unbind('click').click(function(){
                            var fileType = $(this).attr('data-fileType').split('_')[1],
                                $li = $(this).closest('li');
                            var fileId = $li.attr('data-id'),
                                fileTit = $li.attr('title');
                            if(fileType == 'image'){
                                var images = [{
                                    "alt": fileTit,
                                    "pid":  fileId, //图片id
                                    "anim": 5,
                                    "src": Const.admin + "/api/imp/sys/SysArchive/download?id="+fileId+"&__noauth=true", //原图地
                                }];
                                Mom.top().showPhotos(images);
                            }else{
                                var originUrl = Const.admin + "/api/imp/sys/SysArchive/download?id="+fileId+"&__noauth=true"; //要预览文件的访问地址
                                var previewUrl = originUrl + '&fullfilename='+fileTit;
                                var previewServer= options.previewServer || Const.previewServer;  //文件预览服务器地址

                                /*  previewUrl ='http://192.168.1.104:8001/admin-api/api/test/export/xls?__noauth=true&fullfilename='+new Date().getTime()+'.xlsx';*/
                                window.open(previewServer+'/onlinePreview?url='+encodeURIComponent(previewUrl));
                            }
                        });
                    });
                });
            }
        }
    };
    return {
        init:PageModule.init,
        webUploaderSingle: PageModule.webUploaderSingle, //文件上传，直接选择文件，不打开上传窗口；单选！！！
        openWebuploaderWin: PageModule.openWebuploaderWin,
        renderArchiveList: PageModule.renderArchiveList,
        renderArchiveListDefault: PageModule.renderArchiveListDefault
    }
});
