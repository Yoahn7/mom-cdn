define([cdnDomain +'/js/plugins/echartsv2/zrender.min.js', 'macarons'],function(zrender,theme) {
    /**
     * 说明：
     * 1、本封装方法是按照js的执行顺序先后进行排列，公共方法放在最后
     *
     * */
    /*
     *********参数说明********：
     1、containerId:echarts外包容器的id,同时也仅限id
     2、series_data：格式为:数组对象
     [{value: 59, name: '直接访问',group:'类型'}]
     3、type:图标类型
     |***** 'pie'          : 饼图
     |***** 'loopPie'      : 环形图
     |***** 'radiusPie'    : 直径饼图
     |***** 'pieAndLoop'   : 饼环混合图
     |***** 'loopCom'      : 多环组合图
     |***** 'line'         : 线图
     |***** 'bar'          : 柱状图
     |***** 'gauge'        : 仪表盘图
     4、如果有定时刷新的需求，在当前的js文件中通过定时器的方法调接口，重新渲染图表
     */

    var echartsAll = {
        /***图表渲染*/
        ecRender: {
            // renderUrl:function (containerId,apiCfg,typeAttr,timer,myChart) {
            //         Api.ajaxAdvance(apiCfg,function (result) {
            //             options = echartsAll.options(typeAttr, result[typeAttr.type + '_rows']);
            //             return;
            //         },null,false);
            // },
            //总渲染方法
            /**
             *
             * @param containerId   Dom的id属性值
             * @param series_data   接口返回的数据，具体数据格式参照文档
             * @param typeAttr       图表的类型以及title、特殊配置的参数
             */
            renderOne: function (containerId, series_data, typeAttr) {
                echartsAll.containerId = containerId;
                var myChart = echarts.init(document.getElementById(containerId), theme);
                var options = echartsAll.options(typeAttr, series_data);
                myChart.clear();
                myChart.setOption(options);
                window.addEventListener("resize",function(){
                    myChart.resize();
                });
            }
        },
        //判断类型渲染option
        options: function (typeAttr, seriesData) {
            var option, type = typeAttr.type;
            //饼图用内含样式+百分比hover显示 不显示外连线
            //饼类
            if (type == 'pie' || type == 'loopPie' || type == 'radiusPie' || type == 'pieAndLoop' || type == 'loopCom' || type == 'loopAndLoop') {
                option = echartsAll.optionTemplates.pie(seriesData, typeAttr);
            }
            //线、柱状类
            else if (
                /*线类*/
                type == 'line' || type == 'heapLine' || type == 'heapAreaLine' || type == 'areaLine' || type == 'maxMinLine' || type == 'lineAndBar'
                /*柱类*/
                || type == 'bar' || type == 'manySeriesBar' || type == 'manyColorBar' || type == 'seriesHeapBar' || type == 'stackedBar' || type == 'percentHeapBar') {
                option = echartsAll.optionTemplates.lineAndBar(seriesData, typeAttr);
            }
            /*搭配时间轴柱类图*/
            else if (type == 'timeLineBar') {
                option = echartsAll.optionTemplates.timeLineBar(seriesData, typeAttr);
            }
            else if(type=='radar'||type=='wormhole'){
                option = echartsAll.optionTemplates.radar(seriesData, typeAttr);
            }else if(type == 'gauge'){
                option = echartsAll.optionTemplates.gauge(seriesData,typeAttr);
            }
            //多个仪表盘
            else if (type == 'moreGauge') {
                option = echartsAll.optionTemplates.moreGauge(seriesData, typeAttr);
            }
            //正负轴交错
            else if (type == 'staggered') {
                option = echartsAll.optionTemplates.staggered(seriesData, typeAttr);
            }
            //人口图
            else if(type == "populationMap"){
                option = echartsAll.optionTemplates.populationMap(seriesData, typeAttr);
            }
            //条形队列
            else if(type == "barqueue"){
                option = echartsAll.optionTemplates.barqueue(seriesData, typeAttr);
            }
            return option
        },
        //设置参数模板
        optionTemplates: {
            //通用的图表基本配置
            commonOption: {
                //标题方法
                title: function (title) {
                    var titles = {
                        text: typeof(title) == 'string' ? title : title[0] || ' ',
                        subtext: typeof(title) == 'string' ? ' ' : title[1],
                        x: 'center'
                    };
                    return {'title': titles}
                },
                //图表工具栏
                toolbox: function (){
                    return {
                        toolbox: {
                            show: false,
                            feature: {
                                mark: {show: true},
                                dataView: {show: true, readOnly: false},
                                restore: {show: true},
                                saveAsImage: {show: true}
                            }
                        }
                    }
                },
            },
            //通用的折线图表的基本配置
            commonLineOption: {},
            //饼图
            pie: function (series_data, typeAttr) {
                var pieData = echartsAll.optionTemplates.FormatData(series_data, typeAttr);
                //把导航从Datas中提取出来使用
                var option = {
                    legend: {
                        orient: 'vertical',
                        x: 'left',
                        // y: 'center',
                        data: pieData.category
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c} ({d}%)"
                    },
                    title:{
                        text: typeof(typeAttr.title) == 'string' ? typeAttr.title : typeAttr.title[0] || ' ',
                        subtext: typeof(typeAttr.title) == 'string' ? ' ' : typeAttr.title[1],
                        x: 'center'
                    },
                    toolbox: {
                        show: false,
                        feature: {
                            mark: {show: true},
                            dataView: {show: true, readOnly: false},
                            restore: {show: true},
                            saveAsImage: {show: true}
                        }
                    },
                    series: pieData.series
                };
                if(typeAttr.specialAttr){
                    option = $.extend(true,{},option,typeAttr.specialAttr);
                };
                //合并所有项
                return option;
            },
            //线图与柱状
            lineAndBar: function (series_data, typeAttr) {
                var lineOrBData = echartsAll.optionTemplates.FormatData(series_data, typeAttr);
                var option = {
                    title:{
                        text: typeof(typeAttr.title) == 'string' ? typeAttr.title : typeAttr.title[0] || ' ',
                        subtext: typeof(typeAttr.title) == 'string' ? ' ' : typeAttr.title[1],
                        x: 'center'
                    },
                    toolbox: {
                        show: false,
                        feature: {
                            mark: {show: true},
                            dataView: {show: true, readOnly: false},
                            restore: {show: true},
                            saveAsImage: {show: true}
                        }
                    },
                    legend: {
                        data: lineOrBData.category,
                        orient: 'vertical',
                        x: '86%',
                        y: 'center'
                    },
                    grid: {
                        x: '10%',
                        x2: '20%'
                    },
                    xAxis: [{
                        type: 'category', //X轴均为category，Y轴均为value
                        data: lineOrBData.xAxis,
                        boundaryGap: lineOrBData.boundaryGap  //数值轴两端的空白策略
                    }],
                    yAxis: [{
                        name: '',
                        type: 'value'
                    }],
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                            type: 'line'        // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    series: lineOrBData.series
                };
                if (typeAttr.type == 'bar' || typeAttr.type == 'manySeriesBar' || typeAttr.type == 'manyColorBar' || typeAttr.type == 'seriesHeapBar' || typeAttr.type == 'percentHeapBar' || typeAttr.type == 'stackedBar') {
                    option.tooltip.axisPointer.type = 'shadow';
                    if (typeAttr.type == 'manyColorBar') {
                        var colorList = [
                            '#ff7f50', '#87cefa', '#da70d6', '#32cd32', '#6495ed',
                            '#ff69b4', '#ba55d3', '#cd5c5c', '#ffa500', '#40e0d0'
                        ];
                        option.tooltip = {
                            trigger: 'axis',
                            backgroundColor: 'rgba(255,255,255,0.7)',
                            axisPointer: {
                                type: 'shadow'
                            },
                            formatter: function (params) {
                                // for text color
                                var color = colorList[params[0].dataIndex];
                                var res = '<div style="color:' + color + '">';
                                res += '<strong>' + params[0].name + '</strong>';
                                for (var i = 0, l = params.length; i < l; i++) {
                                    res += '<br/>' + params[i].seriesName + ' : ' + params[i].value
                                }
                                res += '</div>';
                                return res;
                            }
                        }
                    }
                    if (typeAttr.type == 'stackedBar') {
                        option.xAxis = [{
                            type: 'value'
                        }];
                        option.yAxis = [{
                            type: 'category',
                            data: lineOrBData.xAxis
                        }];
                    }
                    if (typeAttr.type == 'percentHeapBar') {
                        option.yAxis[0].axisLabel = {
                            show: true,
                            formatter: '{value}%'
                        }
                    }
                }
                if(typeAttr.specialAttr){
                    option = $.extend(true,{},option,typeAttr.specialAttr);
                }
                //合并所有项
                return option;
            },
            timeLineBar: function (series_data, typeAttr) {
                var lineOrBData = echartsAll.optionTemplates.FormatData(series_data, typeAttr);
                var option = {
                    timeline: {
                        data: lineOrBData.timeLine,
                        autoPlay: true,
                        playInterval: lineOrBData.playInterval, /**改成活的*/
                        x: '1%'
                    },
                    options: [{
                        toolbox: echartsAll.optionTemplates.commonOption.toolbox(),
                        legend: {
                            data: lineOrBData.category,
                            orient: 'vertical',
                            x: '86%',
                            y: 'center'
                        },
                        grid: {
                            x: '8%',
                            y: '10%',
                            y2: '25%',
                            x2: '22%'
                        },
                        xAxis: [{
                            type: 'category', //X轴均为category，Y轴均为value
                            data: lineOrBData.xAxis,
                            boundaryGap: lineOrBData.boundaryGap  //数值轴两端的空白策略
                        }],
                        yAxis: [
                            {
                                'type': 'value',
                                'name': ''
                            },
                            {
                                'type': 'value',
                                'name': ''
                            }
                        ],
                        calculable: true,
                        tooltip: {'trigger': 'axis'},
                        series: lineOrBData.series
                    }]
                };
                var datas = series_data.rows;
                for (var x = 1; x < datas[0].data.length; x++) {
                    var obj = {};
                    var series = [];
                    for (var i = 0; i < datas.length; i++) {
                        var objInner = {
                            data: datas[i].data[x].value
                        };
                        series.push(objInner)
                    };
                    obj.series = series;
                    option.options.push(obj)
                }
                //合并所有项
                if(typeAttr.specialAttr){
                    option = $.extend(true,{},option,typeAttr.specialAttr);
                }
                return option;
            },
            //雷达
            radar: function (series_data, typeAttr) {
                var radarData = echartsAll.optionTemplates.FormatData(series_data, typeAttr);
                var option = {
                    title:{
                        text: typeof(typeAttr.title) == 'string' ? typeAttr.title : typeAttr.title[0] || ' ',
                        subtext: typeof(typeAttr.title) == 'string' ? ' ' : typeAttr.title[1],
                        x: 'center'
                    },
                    toolbox: {
                        show: false,
                        feature: {
                            mark: {show: true},
                            dataView: {show: true, readOnly: false},
                            restore: {show: true},
                            saveAsImage: {show: true}
                        }
                    },
                    tooltip : {
                        trigger: 'axis'
                    },
                    legend: {
                        orient: 'vertical',
                        x : 'left',
                        y :'center',
                        data:radarData.category
                    },
                    calculable : true,
                    polar : [
                        {
                            indicator :radarData.indicator,
                            radius: '60%'
                        }
                    ],
                    series:radarData.series
                };
                if(typeAttr.type=='wormhole'){
                    option.tooltip.trigger='item';
                    option.tooltip.backgroundColor='rgba(0,0,250,0.2)';
                }
                //合并所有项
                return option;
            },
            //仪表盘
            gauge: function (series_data,typeAttr) {
                var option = {
                    title:{
                        text: typeof(typeAttr.title) == 'string' ? typeAttr.title : typeAttr.title[0] || ' ',
                        subtext: typeof(typeAttr.title) == 'string' ? ' ' : typeAttr.title[1],
                        x: 'center'
                    },
                    toolbox: {
                        show: false,
                        feature: {
                            mark: {show: true},
                            dataView: {show: true, readOnly: false},
                            restore: {show: true},
                            saveAsImage: {show: true}
                        }
                    },
                    series: [
                        {
                            name: "仪表盘",
                            type: 'gauge',
                            detail: {formatter: '{value}℃'},
                            data: series_data
                        }
                    ]
                };
                if(typeAttr.specialAttr){
                    option = $.extend(true,{},option,typeAttr.specialAttr);
                }
                //合并所有项
                return option;
            },
            //多个仪表盘
            moreGauge: function (series_data,typeAttr) {
                var moreGaugeData = echartsAll.optionTemplates.FormatData(series_data,typeAttr);
                var option = {
                    title:{
                        text: typeof(typeAttr.title) == 'string' ? typeAttr.title : typeAttr.title[0] || ' ',
                        subtext: typeof(typeAttr.title) == 'string' ? ' ' : typeAttr.title[1],
                        x: 'center'
                    },
                    toolbox: {
                        show: false,
                        feature: {
                            mark: {show: true},
                            dataView: {show: true, readOnly: false},
                            restore: {show: true},
                            saveAsImage: {show: true}
                        }
                    },
                    series:moreGaugeData
                };
                if(typeAttr.specialAttr){
                    option = $.extend(true,{},option,typeAttr.specialAttr);
                }
                return option;
            },
            //正负交错图
            staggered: function (series_data, typeAttr) {
                var staggData =  echartsAll.optionTemplates.FormatData(series_data,typeAttr);
                var option = {
                    title:{
                        text: typeof(typeAttr.title) == 'string' ? typeAttr.title : typeAttr.title[0] || ' ',
                        subtext: typeof(typeAttr.title) == 'string' ? ' ' : typeAttr.title[1],
                        x: 'center'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    toolbox: {
                        show: false,
                        feature: {
                            mark: {show: true},
                            dataView: {show: true, readOnly: false},
                            magicType: {show: true, type: ['line', 'bar']},
                            restore: {show: true},
                            saveAsImage: {show: true}
                        }
                    },
                    grid: {
                        y: 80,
                        y2: 30
                    },
                    xAxis: [
                        {
                            type: 'value',
                            position: 'top',
                            splitLine: {lineStyle: {type: 'dashed'}},
                        }
                    ],
                    yAxis: [
                        {
                            type: 'category',
                            axisLine: {show: false},
                            axisLabel: {show: false},
                            axisTick: {show: false},
                            splitLine: {show: false},
                            data: staggData.yAxis
                        }
                    ],
                    series: [
                        {
                            name: typeAttr.name || typeAttr.title || '',
                            type: 'bar',
                            stack: '总量',
                            itemStyle: {
                                normal: {
                                    color: 'orange',
                                    borderRadius: 5,
                                    label: {
                                        show: true,
                                        position: 'left',
                                        formatter: '{b}'
                                    }
                                }
                            },
                            data: staggData.data
                        }
                    ]
                };
                if(typeAttr.specialAttr){
                    option = $.extend(true,{},option,typeAttr.specialAttr);
                }
                return option;
            },
            //人口图
            populationMap:function (series_data, typeAttr) {
                var popMapData = echartsAll.optionTemplates.FormatData(series_data,typeAttr);
                var option = {
                    title:{
                        text: typeof(typeAttr.title) == 'string' ? typeAttr.title : typeAttr.title[0] || ' ',
                        subtext: typeof(typeAttr.title) == 'string' ? ' ' : typeAttr.title[1],
                        x: 'center'
                    },
                    toolbox: {
                        show: false,
                        feature: {
                            mark: {show: true},
                            dataView: {show: true, readOnly: false},
                            restore: {show: true},
                            saveAsImage: {show: true}
                        }
                    },
                    legend: {
                        orient: 'vertical',
                        x: 'left',
                        // y: 'center',
                        data: popMapData.legendData
                    },
                    calculable : true,
                    xAxis : [
                        {
                            type : 'value',
                            show:true,
                            axisLabel:{
                                formatter:function(value) {
                                    return Math.abs(value);   //负数取绝对值变正数
                                }
                            }
                        }
                    ],
                    yAxis : [
                        {
                            type : 'category',
                            show: false,
                            axisTick : {show: false},
                            data : popMapData.yAxisData
                        }
                    ],
                    series : [
                        {
                            name:popMapData.popMap.name,
                            type:'bar',
                            stack: '总量',
                            barWidth : 28,
                            itemStyle: {normal: {
                                    label : {show: true}
                                }},
                            data:popMapData.popMap.data
                        },
                        {
                            name:popMapData.popMaps.name,
                            type:'bar',
                            stack: '总量',
                            barWidth : 28,
                            itemStyle: {normal: {
                                    label : {show: true, position: 'left',
                                        formatter:function(value){
                                            return -value.data;
                                        }
                                    }
                                }},
                            data:popMapData.popMaps.data
                        }
                    ]
                };
                //自定义配置跟默认配置合并
                if(typeAttr.specialAttr){
                    option = $.extend(true,{},option,typeAttr.specialAttr);
                };
                return $.extend({},option);
            },
            //条形队列
            barqueue:function (series_data, typeAttr) {
                var barqueueData = echartsAll.optionTemplates.FormatData(series_data,typeAttr);
                var option = {
                    tooltip : {
                        trigger: 'axis',
                    },
                    legend: {
                        data:barqueueData.legendData  //直接返回
                    },
                    title:{
                        text: typeof(typeAttr.title) == 'string' ? typeAttr.title : typeAttr.title[0] || ' ',
                        subtext: typeof(typeAttr.title) == 'string' ? ' ' : typeAttr.title[1],
                        x: 'center'
                    },
                    toolbox: {
                        show: false,
                        feature: {
                            mark: {show: true},
                            dataView: {show: true, readOnly: false},
                            restore: {show: true},
                            saveAsImage: {show: true}
                        }
                    },
                    calculable : true,
                    xAxis : [
                        {
                            type : 'value',
                            boundaryGap : [0, 0.01]
                        }
                    ],
                    yAxis : [
                        {
                            type : 'category',
                            data : barqueueData.yAxisData
                        }
                    ],
                    series : barqueueData.seriesData
                };
                if(typeAttr.specialAttr){
                    option = $.extend(true,{},option,typeAttr.specialAttr);
                }
                return $.extend({},option);
            },
            //处理数据方法
            FormatData: function (data, typeAttr) {
                var type = typeAttr.type;
                /*——————————————————————————————饼类————————*/
                //饼图用内含样式+百分比hover显示 不显示外连线
                var pieStyle = {
                    normal: {
                        label: {
                            position: 'inner',
                            formatter: function (params) {
                                return (params.percent - 0).toFixed(0) + '%'
                            }
                        },
                        labelLine: {
                            show: false
                        }
                    },
                    emphasis: {
                        label: {
                            show: true,
                            formatter: "{b}"
                        }
                    }

                };
                //环图样式 hover显示标签在圆心
                var loopStyle = {
                    normal: {
                        label: {
                            show: false
                        },
                        labelLine: {
                            show: false
                        }
                    },
                    emphasis: {
                        label: {
                            show: true,
                            position: 'center',
                            textStyle: {
                                fontSize: '15',
                                fontWeight: 'bold'
                            }
                        }
                    }
                };
                //普通饼图、环图、半径饼、饼环组合图
                if (type == 'pie' || type == 'loopPie' || type == 'radiusPie' || type == 'pieAndLoop' || type == 'loopAndLoop') {
                    var datas = data;
                    var name = [];
                    var group = [];
                    var tempAll = [];
                    for (var i = 0; datas && i < datas.length; i++) {
                        for (var k = 0; k < name.length && name[k] != datas[i].name; k++);
                        if (k == name.length) name.push(datas[i].name);
                        for (var k = 0; k < group.length && group[k] != datas[i].group; k++);
                        if (k == group.length) group.push(datas[i].group);
                    }
                    for (var i = 0; i < group.length; i++) {
                        var temp = [];
                        for (var j = 0; j < datas.length; j++) {
                            if (group[i] == datas[j].group) {
                                temp.push({
                                    name: datas[j].name,
                                    value: parseInt(datas[j].value)
                                });
                            }
                        }
                        tempAll.push(temp);
                    }
                    //搭建series参数
                    var series = [];
                    for (var i = 0; i < tempAll.length; i++) {
                        var obj = {
                            type: 'pie',
                            name: group[i],
                            data: tempAll[i]
                        };
                        //控制饼图位置、形状
                        if (type == 'pieAndLoop' || type == 'loopAndLoop') {
                            obj.center = ['50%', '50%'];
                            if ((i + 1) % 2 == 0) {
                                obj.radius = ['45%', '55%'];
                            } else {
                                if (type == 'loopAndLoop') {
                                    obj.radius = ['25%', '35%'];
                                    obj.itemStyle = loopStyle;
                                } else {
                                    obj.radius = '35%';
                                    obj.itemStyle = pieStyle;
                                }


                            }
                        } else {
                            //判断有多少个图
                            if (tempAll.length > 1) {
                                obj.center = [(i + 1) * (36 - (tempAll.length - 2) * 7) + '%', '50%'];
                                //判断类型
                                if (type == 'pie') {
                                    obj.radius = '33%'
                                } else if (type == 'loopPie') {
                                    obj.radius = ['25%', '35%'];
                                } else if (type == 'radiusPie') {
                                    obj.radius = ['5%', '25%'];
                                    obj.roseType = 'area';
                                }
                            } else {
                                obj.center = ['50%', '50%'];
                                if (type == 'pie') {
                                    obj.radius = '55%';
                                } else if (type == 'loopPie') {
                                    obj.radius = ['55%', '65%'];
                                } else if (type == 'radiusPie') {
                                    obj.radius = ['35%', '65%'];
                                    obj.roseType = 'area';
                                }
                            }
                        }
                        series.push(obj)
                    }
                    return {
                        category: name,
                        series: series
                    };
                }
                //多环形组合
                else if (type == 'loopCom') {
                    var datas = data;
                    var name = [];
                    var tempAll = [];
                    for (var i = 0; datas && i < datas.length; i++) {
                        for (var k = 0; k < name.length && name[k] != datas[i].name; k++);
                        if (k == name.length) name.push(datas[i].name);
                    }
                    for (var i = 0; i < name.length; i++) {
                        var temp = [];
                        for (var j = 0; j < datas.length; j++) {
                            if (name[i] == datas[j].name) {
                                temp.push({
                                    name: datas[j].name,
                                    value: datas[j].value
                                }, {
                                    name: 'hidden',
                                    value: 100 - datas[j].value,
                                    itemStyle: {
                                        normal: {
                                            color: 'rgba(0,0,0,0)',
                                            label: {show: false},
                                            labelLine: {show: false}
                                        },
                                        emphasis: {
                                            color: 'rgba(0,0,0,0)'
                                        }
                                    }
                                });
                            }
                        }
                        tempAll.push(temp);
                    }
                    var series = [];
                    var radiusArr = [25, 32];
                    for (var i = 0; i < tempAll.length; i++) {
                        var obj = {
                            type: 'pie',
                            name: name[i],
                            data: tempAll[i],
                            itemStyle: {
                                normal: {
                                    label: {show: false},
                                    labelLine: {show: false}
                                }
                            }
                        };
                        obj.center = ['50%', '50%'];
                        obj.clockWise = true;
                        if (i == 0) {
                            obj.radius = ['25%', '32%']
                        } else {
                            obj.radius = [radiusArr[0] + i * (radiusArr[1] - radiusArr[0]) + '%', radiusArr[1] + i * (radiusArr[1] - radiusArr[0]) + '%']
                        }
                        series.push(obj);
                    }
                    return {
                        category: name,
                        series: series
                    };

                }
                /*——————————————————————————————线柱类————————*/
                //线图、堆积折线图、堆积面积图、标准面积图、柱状图、线柱组合图
                else if ( /*线类*/
                    type == 'line' || type == 'heapLine' || type == 'heapAreaLine' || type == 'areaLine' || type == 'maxMinLine'
                    /*柱类*/
                    || type == 'bar' || type == 'manySeriesBar' || type == 'manyColorBar' || type == 'seriesHeapBar' || type == 'stackedBar' || type == 'percentHeapBar' || type == 'lineAndBar') {
                    var group = [];
                    var series = [];
                    var datas = data;
                    var boundaryGap = true;
                    for (var i = 0; datas && i < datas.length; i++) {
                        for (var k = 0; k < group.length && group[k] != datas[i].group; k++);
                        if (k == group.length) group.push(datas[i].group);
                        var series_temp = {
                            name: datas[i].group,
                            data:datas[i].value,
                            type: type
                        };
                        /*线类判断*/
                        if (type == 'heapLine') {
                            series_temp.stack = 'allValue';
                            series_temp.type = 'line';
                            boundaryGap = false;
                        }
                        else if (type == 'heapAreaLine') {
                            series_temp.stack = 'allValue';
                            series_temp.type = 'line';
                            series_temp.itemStyle = {normal: {areaStyle: {type: 'default'}}};
                            boundaryGap = false;

                        }
                        else if (type == 'areaLine') {
                            series_temp.type = 'line';
                            series_temp.itemStyle = {normal: {areaStyle: {type: 'default'}}};
                            boundaryGap = false;
                        }
                        else if (type == 'maxMinLine') {
                            series_temp.type = 'line';
                            series_temp.markPoint = {
                                data: [
                                    {type: 'max', name: '最大值'},
                                    {type: 'min', name: '最小值'}
                                ]
                            };
                            series_temp.markLine = {
                                data: [
                                    {type: 'average', name: '平均值'}
                                ]
                            };

                            boundaryGap = false;
                        }
                        /*柱类判断*/
                        else if (type == 'manySeriesBar') {
                            series_temp.type = 'bar';
                            series_temp.markPoint = {
                                data: [
                                    {type: 'max', name: '最大值'},
                                    {type: 'min', name: '最小值'}
                                ]
                            };
                            series_temp.markLine = {
                                data: [
                                    {type: 'average', name: '平均值'}
                                ]
                            };
                        }
                        else if (type == 'manyColorBar') {
                            series_temp.type = 'bar';
                            var colorList = [
                                '#ff7f50', '#87cefa', '#da70d6', '#32cd32', '#6495ed',
                                '#ff69b4', '#ba55d3', '#cd5c5c', '#ffa500', '#40e0d0'
                            ];
                            var itemStyle = {
                                normal: {
                                    color: function (params) {
                                        if (params.dataIndex < 0) {
                                            // for legend
                                            return zrender.color.lift(
                                                colorList[colorList.length - 1], params.seriesIndex * 0.2);
                                        }
                                        else {
                                            // for bar
                                            return zrender.color.lift(
                                                colorList[params.dataIndex], params.seriesIndex * 0.2
                                            );
                                        }
                                    }
                                }

                            };
                            series_temp.itemStyle = itemStyle;
                        }
                        else if (type == 'seriesHeapBar' || type == 'stackedBar' || type == 'percentHeapBar') {
                            series_temp.type = 'bar';
                            series_temp.stack = '总量';
                            series_temp.itemStyle = {normal: {label: {show: true, position: 'insideRight'}}};
                            if (type == 'percentHeapBar') {
                                series_temp.itemStyle = {
                                    normal: {
                                        label: {
                                            show: true,
                                            position: 'insideRight',
                                            formatter: '{c}%'
                                        },
                                        labelLine: {
                                            show: false
                                        }
                                    }
                                };
                            }
                            if (type == 'seriesHeapBar') {
                                series_temp.barWidth = 30;
                            }
                        }
                        else if (type == 'lineAndBar') {
                            series_temp.type = datas[i].tableType;
                        }
                        series.push(series_temp);
                    }
                    var dataAll = {
                        category: group,
                        xAxis: datas[0].name ,
                        series: series,
                        boundaryGap: boundaryGap
                    };
                    return dataAll;
                }
                /*动态时间轴*/
                else if (type == 'timeLineBar') {
                    var group = [];    //图例
                    var series = [];
                    var datas = data.rows;
                    var boundaryGap = true;
                    for (var i = 0; i < datas.length; i++) {
                        group.push(datas[i].group);
                        for (var x = 0; x < datas[i].data.length; x++) {
                            if (x == 0) {
                                var obj = {
                                    name: datas[i].group,
                                    type: 'bar',
                                    data: datas[i].data[x].value
                                };
                                if (i == 1) {
                                    obj.yAxisIndex = 1;
                                }
                                series.push(obj)
                            }
                        }
                    };
                    var dataAll = {
                        category: group,
                        xAxis: datas[0].name,
                        series: series,
                        boundaryGap: boundaryGap,
                        timeLine: data.timeLine,
                        playInterval:data.playInterval*1000
                    };
                    return dataAll
                }
                // 雷达图
                else if(type=='radar'||type=='wormhole'){
                    var group = [],indicator=[],seriesData=[];
                    var datas = data;
                    for (var i = 0; i < datas.length; i++) {
                        group.push(datas[i].group);
                        var obj = {
                            name: datas[i].group,
                            value: datas[i].value
                        };
                        seriesData.push(obj)
                    }

                    if(type=='wormhole'){
                        for(var x=0;x<datas[0].name.length;x++){
                            var indicatorobj={
                                text:datas[0].name[x],
                                max:datas[0].max
                            };
                            indicator.push(indicatorobj)
                        }
                        var series=[
                            {
                                type: 'radar',
                                symbol:'none',
                                itemStyle: {
                                    normal: {
                                        lineStyle: {
                                            width:1
                                        }
                                    },
                                    emphasis : {
                                        areaStyle: {color:'rgba(0,250,0,0.3)'}
                                    }
                                },
                                data:seriesData
                            }
                        ];
                    }else{
                        for(var x=0;x<datas[0].name.length;x++){
                            var indicatorobj={
                                text:datas[0].name[x]
                            };
                            indicator.push(indicatorobj)
                        }
                        var series=[
                            {
                                type: type,
                                itemStyle: {
                                    normal: {
                                        areaStyle: {
                                            type: 'default'
                                        }
                                    }
                                },
                                data:seriesData
                            }
                        ];
                    }

                    var dataAll = {
                        category: group,
                        series: series,
                        indicator:indicator
                    };
                    return dataAll

                }
                //多个仪表盘
                else if(type == "moreGauge"){
                    var datas = data;
                    var seriesData = [];
                    var setObj = {};
                    for(var i=0;i<datas.length;i++){
                        if(datas[i].data1){
                            //第一个配置
                            setObj ={
                                name:datas[i].data1.name,
                                type:'gauge',
                                z:3,
                                min: 0,
                                max: 220,
                                splitNumber: 11,
                                axisLine: {            // 坐标轴线
                                    lineStyle: {       // 属性lineStyle控制线条样式
                                        width: 10
                                    }
                                },
                                axisTick: {            // 坐标轴小标记
                                    length: 15,        // 属性length控制线长
                                    lineStyle: {       // 属性lineStyle控制线条样式
                                        color: 'auto'
                                    }
                                },
                                splitLine: {           // 分隔线
                                    length: 20,         // 属性length控制线长
                                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                                        color: 'auto'
                                    }
                                },
                                title: {
                                    textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                                        fontWeight: 'bolder',
                                        fontSize: 20,
                                        fontStyle: 'italic'
                                    }
                                },
                                data:[]
                            };
                            setObj.data.push(datas[i].data1);
                            seriesData.push(setObj);
                        }else if(datas[i].data2){
                            setObj ={
                                name:datas[i].data2.name,
                                type:'gauge',
                                center: ['20%','55%'],    // 默认全局居中
                                radius: '50%',
                                min: 0,
                                max: 7,
                                endAngle:45,
                                splitNumber:7,
                                axisLine: {            // 坐标轴线
                                    lineStyle: {       // 属性lineStyle控制线条样式
                                        width:8
                                    }
                                },
                                axisTick: {            // 坐标轴小标记
                                    length: 12,        // 属性length控制线长
                                    lineStyle: {       // 属性lineStyle控制线条样式
                                        color: 'auto'
                                    }
                                },
                                splitLine: {           // 分隔线
                                    length: 20,         // 属性length控制线长
                                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                                        color: 'auto'
                                    }
                                },
                                pointer: {
                                    width:5
                                },
                                title : {
                                    offsetCenter: [0, '-30%'],       // x, y，单位px
                                },
                                detail : {
                                    textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                                        fontWeight: 'bolder'
                                    }
                                },
                                data:[]
                            };
                            setObj.data.push(datas[i].data2);
                            seriesData.push(setObj);
                        }else if(datas[i].data3 && datas[i].data3.length>0){
                            for(var j=0;j<datas[i].data3.length;j++){
                                if(datas[i].data3[j].data1){
                                    setObj ={
                                        name:datas[i].data3[j].data1.name,
                                        type:'gauge',
                                        center: ['75%', '50%'],    // 默认全局居中
                                        radius: '50%',
                                        min: 0,
                                        max: 2,
                                        startAngle:135,
                                        endAngle:45,
                                        splitNumber:2,
                                        axisLine: {            // 坐标轴线
                                            lineStyle: {       // 属性lineStyle控制线条样式
                                                color:[[0.2, '#ff4500'],[0.8, '#48b'],[1, '#228b22']],
                                                width: 8
                                            }
                                        },
                                        axisTick: {            // 坐标轴小标记
                                            splitNumber:5,
                                            length: 10,        // 属性length控制线长
                                            lineStyle: {       // 属性lineStyle控制线条样式
                                                color: 'auto'
                                            }
                                        },
                                        axisLabel: {
                                            formatter:function(v){
                                                switch (v + '') {
                                                    case '0' : return 'E';
                                                    case '1' : return 'Gas';
                                                    case '2' : return 'F';
                                                }
                                            }
                                        },
                                        splitLine: {           // 分隔线
                                            length: 15,         // 属性length控制线长
                                            lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                                                color: 'auto'
                                            }
                                        },
                                        title: {
                                            show: false
                                        },
                                        pointer: {
                                            width:2
                                        },
                                        detail : {
                                            show: false
                                        },
                                        data:[]
                                    };
                                    setObj.data.push(datas[i].data3[j].data1);
                                    seriesData.push(setObj);
                                }else if(datas[i].data3[j].data2){
                                    setObj ={
                                        name:datas[i].data3[j].data2.name,
                                        type:'gauge',
                                        center: ['75%', '55%'],    // 默认全局居中
                                        radius: '50%',
                                        min: 0,
                                        max: 2,
                                        startAngle:315,
                                        endAngle:225,
                                        splitNumber:2,
                                        axisLine: {            // 坐标轴线
                                            lineStyle: {       // 属性lineStyle控制线条样式
                                                color: [[0.2, '#ff4500'],[0.8, '#48b'],[1, '#228b22']],
                                                width: 8
                                            }
                                        },
                                        axisTick: {            // 坐标轴小标记
                                            show: false
                                        },
                                        splitLine: {           // 分隔线
                                            length: 15,         // 属性length控制线长
                                            lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                                                color: 'auto'
                                            }
                                        },
                                        pointer: {
                                            width:2
                                        },
                                        detail : {
                                            show: false
                                        },
                                        title: {
                                            show:false
                                        },
                                        data:[]
                                    };
                                    setObj.data.push(datas[i].data3[j].data2);
                                    seriesData.push(setObj);
                                }
                            };
                        }
                    }
                    return seriesData;
                }
                //正负轴交错
                else if(type == "staggered"){
                    var datas = data;
                    var staggObj = {};
                    var datayAxis = [];
                    var labelRight = {normal: {label : {position: 'right'}}};
                    for(var i=0;i<datas.length;i++){
                        datayAxis.unshift(datas[i].name);
                        if(datas[i].value>0){
                            datas[i].itemStyle = labelRight;
                        }
                    }
                    staggObj.yAxis = datayAxis;
                    staggObj.data = datas;
                    return staggObj;
                }
                //横纵坐标轴互换
                else if(type == "barqueue"){
                    var datas = data;
                    var barqueObj = {};
                    var legendData = [],seriesData =[], yAxisData = [];
                    for(var i=0;i<datas.length;i++){
                        legendData.push(datas[i].group);
                        seriesData.push({
                            name:datas[i].group,
                            type:'bar',
                            data:datas[i].value
                        })
                    };
                    barqueObj.legendData = legendData;
                    barqueObj.seriesData = seriesData;
                    barqueObj.yAxisData = datas[0].name;
                    return barqueObj;
                }
                //人口比例分布图
                else if(type == "populationMap"){
                    var datas = data;
                    var dataObj = {};   //要返回去的对象
                    var legendData = []; //tab切换按钮
                    var yAxisData = [];//Y轴显示内容
                    var popMaps = {};  //左侧显示对象
                    var popMap = {};   //右侧显示对象
                    for(var i=0;i<datas.length;i++){
                        legendData.push(datas[i].groupe);
                        if(datas[i].type == "0"){
                            popMap.data = datas[i].value;
                            popMap.name = datas[i].groupe
                        }else {
                            popMaps.data =  datas[i].value;
                            popMaps.name = datas[i].groupe
                        }
                    }
                    //左侧的数据变为负数
                    for(var j=0;j<popMaps.data.length;j++){
                        if(popMaps.data[j]>0){
                            popMaps.data[j] = -popMaps.data[j];
                        }
                    }
                    dataObj.legendData = legendData;
                    dataObj.popMap = popMap;
                    dataObj.popMaps = popMaps;
                    dataObj.yAxisData = datas[0].name;
                    return dataObj;
                }
            },
            /*——————————————————————————————————公共方法————————*/
            //开启磁贴定时刷新
            tileInterValArr: [],
            startTileInterval: function (id, timer, callback) {
                if (timer && timer > 0) {
                    var tileInterv = setInterval(function () {
                        if (callback && document.getElementById(id).clientWidth) {
                            callback();
                        }
                    }, timer * 1000);
                    echartsAll.optionTemplates.tileInterValArr.push({id: id, tileInterv: tileInterv});
                }
            },
            //关闭磁贴定时刷新
            clearTileInterval: function (id) {
                $(echartsAll.tileInterValArr).each(function (i, o) {
                    if (o.id == id) {
                        clearInterval(o.tileInterv);
                        echartsAll.tileInterValArr.splice(i, 1);
                    }
                });
            }
        }
    };
    return {
        ec_ecsRender: echartsAll.ecRender.renderOne,   //处理较复杂的图标渲染（如图表类型动态传入、图表的配置项动态传入等）
        ec_init:echartsAll.init,  //处理最简单的图表渲染（类型已知、配置项已知）
    };


});
