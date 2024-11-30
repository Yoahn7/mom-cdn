var editTable = {
    editCol:-1,
    tdEdit:function(tableObj){
        var numTds  = $(tableObj).find('tbody tr.edit td');
        numTds.click(function() {
            editTable.endEdit(tableObj);
            //找到当前鼠标点击的td,this对应的就是响应了click的那个td
            var tdObj = $(this);
            if (tdObj.children("input").length > 0) {
                //当前td中input，不执行click处理
                return false;
            }
            // alert(editTable.editCol);

            if(editTable.editCol >-1 && tdObj.index() == editTable.editCol) {
                var text = tdObj.html();
                //清空td中的内容
                tdObj.html("");
                //创建一个文本框
                //去掉文本框的边框
                //设置文本框中的文字字体大小是12px
                //使文本框的宽度和td的宽度相同
                //设置文本框的背景色
                //需要将当前td中的内容放到文本框中
                //将文本框插入到td中
                var inputObj = $("<input type='text' value='"+text+"'>").css({
                    "width": "90px",
                    "height": "40px",
                    "font-size": "12px",
                    "text-align": "center",
                    "font-weight":"bold"
                })
                // .width(tdObj.width())
                    .height(tdObj.height())
                    // .css("background-color", tdObj.css("background-color"))
                    .appendTo(tdObj);
                //是文本框插入之后就被选中
                // inputObj.trigger("focus").trigger("select");
                inputObj.click(function () {
                    return false;
                });
                //处理文本框上回车和esc按键的操作
                inputObj.keyup(function (event) {
                    //获取当前按下键盘的键值
                    var keycode = event.which;
                    //处理回车的情况
                    if (keycode == 13) {
                        //获取当当前文本框中的内容
                        var inputtext = $(this).val();
                        //将td的内容修改成文本框中的内容
                        tdObj.html(inputtext);
                    }
                    //处理esc的情况
                    if (keycode == 27) {
                        //将td中的内容还原成text
                        tdObj.html(text);
                    }
                });
            }
        });
    },
    endEdit:function(tableObj){
        var numTdInputs  = $(tableObj).find('tbody tr.edit td input');
        $(numTdInputs).each(function(){
            var tdObj = $(this).parent();
            if(tdObj.index() != editTable.editCol){
                tdObj.html($(this).val());
            }

        });

    },
    //获取单元格的值，如果colIndex为空则obj为td对象，否则colIndex为tr对象
    getTdVal:function(obj, colIndex){
        var fieldVal, tdObj=obj;
        if(colIndex){
            tdObj = obj.children('td').eq(colIndex);
        }
        if(tdObj){
            if (tdObj.children().length) {
                fieldVal = tdObj.find('input').val();
            } else {
                fieldVal = tdObj.html();
            }
        }
        return fieldVal;
    }
}








