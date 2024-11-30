/**
 * 单元和合并（纵向合并：mergeRow，横向合并：mergeCol）
 * Created by LHY
 */
var Mergecell = function(tableId){
    this.tableObj = $(tableId)[0];
    this.colsCount = 0;
    var trs = this.tableObj.rows;
    this.rowsCount = trs.length;
    if(trs.length>0){
        for(var i= 0;i<trs.length;i++){
            var $tdLen = trs[i].cells.length;
            if($tdLen>0 && $tdLen>this.colsCount){
                this.colsCount = $tdLen;
            }
        }
    }
    /**
     * 横向合并列单元格(如果结束列传0代表合并所有列)
     * @param row   合并的行号（索引下标），对第几行进行合并(从0开始)。第一列从0开始
     * @param startCol  起始列
     * @param endCol   结束列
     */
    this.mergeColspan = function(row,startCol, endCol ){
        var tb =  this.tableObj;
        if(tb.rows[row] && tb.rows[row].cells.length == 0){
            return;
        }

        if(!tb || !tb.rows || this.rowsCount <= 0) {
            return;
        }
        if(endCol ==  undefined || endCol == 0){
            endCol = this.colsCount;
        }
        if(startCol ==  undefined){
            startCol = 0;
        }
        if(startCol >= endCol && endCol != 0) {
            return;
        }
        if(row >= this.rowsCount){
            row =this.rowsCount-1;
        }
        var tds = tb.rows[row].cells;
        if(tds.length != this.colsCount ){
            return;
        }
        for(var i = startCol; i < endCol-1; i++) {
            if(tds[startCol].rowSpan>1 || tds[i + 1].rowSpan>1){
                startCol = i + 1;
                continue;
            }
            //如果相等且html不为空就合并单元格,合并之后跳过下一行
            if(tds[startCol].innerHTML == tds[i + 1].innerHTML && tds[startCol].innerHTML !='' && tds[i + 1].innerHTML !='') {
                if(tds[i].className.indexOf('hide') == -1){
                    tds[i].classList.add("hide");
                    tds[i+1].colSpan = ( tds[i].colSpan)+1;
                }
            } else {
                startCol = i + 1;
               /* this.mergeColspan(row,i + 1, endCol );
                break;*/
            }
        }
    };
    this.mergeCol= function (row,startCol,endCol){
        if(row == undefined){
            for(var ind=0;ind<this.rowsCount;ind++){
                this.mergeColspan(ind,startCol,endCol);
            }
        }else{
            this.mergeColspan(row,startCol,endCol);
        }
    };

    /**
     * 纵向合并行单元格(如果结束行传0代表合并所有行)
     * @param col   合并的列号(索引下标)，对第几列中的td进行合并(从0开始)。第一列从0开始
     * @param startRow  起始行
     * @param endRow    结束行
     *
     */
    this.mergeRowspan = function(col,startRow, endRow) {
        var tb =  this.tableObj;
        if(!tb || !tb.rows || this.rowsCount <= 0) {
            return;
        }
        if(endRow ==  undefined || endRow == 0){
            endRow = this.rowsCount-1;
        }
        if(startRow ==  undefined){
            startRow = 0;
        }
        if(startRow >= endRow && endRow != 0) {
            return;
        }
        if(col >= this.colsCount){
            col = this.colsCount-1;
        }

        for(var i = startRow; i < endRow; i++) {
            var tds = tb.rows[i].cells,
                nextTds = tb.rows[i+1].cells,
                startRowCell = tb.rows[startRow].cells[col],
                nextRowCell =tb.rows[i+1].cells[col];
            // 如果当前行的td长度与this.colsCount长度不等则
            if(tds.length != this.colsCount ){
                startRow = i+1;
                continue;
            }
            if(nextRowCell == undefined){
                startRow = i+1;
                continue;
            }
            if(startRowCell.colSpan>1 || nextRowCell.colSpan>1){
                startRow = i+1;
                continue;
            }
            //如果相等就合并单元格,合并之后跳过下一行
            if(startRowCell.innerHTML == nextRowCell.innerHTML && startRowCell.innerHTML !='' && nextRowCell.innerHTML !='' ) {
                // 注释:不能使用remove的方式移除相同项（即：tb.rows[i + 1].cells[col]）。原因如果移除相同项，同行（tb.rows[i + 1]）中的后序列（cells[col]）在循环的时候的tb.rows[i + 1].cells[col]会不存在（因为相同时已移除cells[col]，导致tb.rows[i + 1]中的td（cells[col]）个数与tb.rows[i]中td个数不匹配）。
                if(nextRowCell.className.indexOf('hide') == -1){
                    nextRowCell.classList.add("hide");
                    startRowCell.rowSpan = (startRowCell.rowSpan) + 1;
                }
            } else {
                startRow = i+1;
                //this.mergeRowspan( col,i + 1, endRow);
                // break;
            }
        }
    };
    //纵向合并（行合并）
    this.mergeRow = function(col,startRow,endRow){
        if(col == undefined){
            for(var ind_=0;ind_<this.colsCount;ind_++){
                this.mergeRowspan(ind_,startRow,endRow);
            }
        }else{
            this.mergeRowspan(col,startRow,endRow);
        }
    };
};