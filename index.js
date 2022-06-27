var data = crossfilter(dataset);
var carrier = data.dimension(d => d.carrier);
var monthDate = data.dimension(d => d.monthDate);
var error_sub_type = data.dimension(d => d.error_sub_type);
var aggregation_type = data.dimension(d => d.aggregation_type);
var error_type = data.dimension(d => d.error_type);

var countCarrier = carrier.group().reduceSum(d => d.count);
var countError_sub_type = error_sub_type.group().reduceSum(d => d.count);
var countAggregation_type = aggregation_type.group().reduceSum(d => d.count);
var countError_type = error_type.group().reduceSum(d => d.count);

function toMonth(month) {
    const date = new Date();
    date.setMonth(month - 1);

    return date.toLocaleString('en-US', {
        month: 'long'
    });
}

var countMonthDate = monthDate.group().reduce(function (p, v) {
    p.count += v.count;
    p.monthDate = toMonth((new Date(v.monthDate)).getMonth().toLocaleString())
    return p;
},
    function (p, v) {
        p.count -= v.count;
        p.monthDate = toMonth((new Date(v.monthDate)).getMonth().toLocaleString())
        return p;
    },
    function (p, v) {
        return {
            count: 0,
            monthDate: 0
        };
    }
);

function modifyHigh(groups) {
    var categories = [];
    var data = [];
    var gdata = groups.all()
    gdata.forEach(e => {
        categories.push(e.key)
        data.push(e.value)
    })
    return {
        categories: categories,
        data: data
    }
}

function prepareForMonth(groups) {
    var categories = [];
    var month = [];
    var data = [];
    var catmonth = [];
    var gdata = groups.all()
    gdata.forEach(e => {
        categories.push(e.key.slice(0, 4))
        data.push(e.value.count)
        month.push(e.value.monthDate)
        catmonth.push(`${e.value.monthDate}-${e.key.slice(0, 4)}`)
    })
    return {
        categories: categories,
        data: data,
        month: month,
        catmonth: catmonth
    }
}

var countCarrierObject = modifyHigh(countCarrier)
var countMonthDateObject = prepareForMonth(countMonthDate)
var countError_sub_typeObject = modifyHigh(countError_sub_type)
var countAggregation_typeObject = modifyHigh(countAggregation_type)
var countError_typeObject = modifyHigh(countError_type)

var options1 = {
    chart: {
        renderTo: container1,
        type: 'bar',
        zoomType: 'xy'
    },
    title: {
        text: 'Test Carrier Chart'
    },
    subtitle: {
        text: '15046',
        style: {
            color: '#0000FF'
        }
    },
    xAxis: {
        categories: countCarrierObject.categories,
        crosshair: true,
        title: {
            text: 'Carrier'
        }
    },
    yAxis: {
        min: 0,
        title: {
            text: 'counts'
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0
        },
        bar: {
            dataLabels: {
                enabled: true
            }
        },
        series: {
            point: {
                events: {
                    click: function () {
                        this.select(null, false)
                        var selectedPoints = this.series.chart.getSelectedPoints();
                        filteredPoints = []
                        for (i = 0; i < selectedPoints.length; i++) {
                            filteredPoints = selectedPoints[i].category
                        }
                        if (filteredPoints.length > 0) {
                            var new1 = carrier.filter(filteredPoints).top(Infinity)
                        }
                        else new1 = carrier.filterAll();

                        var filter1 = crossfilter(new1);

                        var monthDateFilter = filter1.dimension(d => d.monthDate)
                        var monthDateFilterCount = monthDate.group().reduce(function (p, v) {
                            p.count += v.count;
                            p.monthDate = toMonth((new Date(v.monthDate)).getMonth().toLocaleString())
                            return p;
                        },
                            function (p, v) {
                                p.count -= v.count;
                                p.monthDate = toMonth((new Date(v.monthDate)).getMonth().toLocaleString())
                                return p;
                            },
                            function (p, v) {
                                return {
                                    count: 0,
                                    monthDate: 0
                                };
                            }
                        );
                        var monthDateFilterCountObject = prepareForMonth(monthDateFilterCount)
                        chart2.xAxis[0].setCategories(monthDateFilterCountObject.catmonth)
                        chart2.series[0].setData(monthDateFilterCountObject.data);

                        var error_sub_typeFilter = filter1.dimension(d => d.error_sub_type)
                        var error_sub_typeFilterCount = error_sub_typeFilter.group().reduceSum(d => d.count)
                        var error_sub_typeFilterCountObject = modifyHigh(error_sub_typeFilterCount)
                        chart3.xAxis[0].setCategories(error_sub_typeFilterCountObject.categories)
                        chart3.series[0].setData(error_sub_typeFilterCountObject.data)

                        var aggregation_typeFilter = filter1.dimension(d => d.aggregation_type)
                        var aggregation_typeFilterCount = aggregation_typeFilter.group().reduceSum(d => d.count)
                        var aggregation_typeFilterCountObject = modifyHigh(aggregation_typeFilterCount)
                        chart4.xAxis[0].setCategories(aggregation_typeFilterCountObject.categories)
                        chart4.series[0].setData(aggregation_typeFilterCountObject.data)


                        var error_typeFilter = filter1.dimension(d => d.error_type)
                        var error_typeFilterCount = error_typeFilter.group().reduceSum(d => d.count)
                        var error_typeFilterCountObject = modifyHigh(error_typeFilterCount)
                        chart5.xAxis[0].setCategories(error_typeFilterCountObject.categories)
                        chart5.series[0].setData(error_typeFilterCountObject.data)
                    }
                }
            }
        }
    },
    series: [{
        name: '',
        data: countCarrierObject.data,
        color: '	#4DEEF5'
    }],
    exporting: {
        enabled: true
    }
};
var chart = new Highcharts.chart(options1)

var options2 = {
    chart: {
        renderTo: 'container2',
        type: 'column',
        zoomType: 'xy'
    },
    title: {
        text: 'Count By Month'
    },
    subtitle: {
        text: '15046',
        style: {
            color: '#0000FF'
        }
    },
    xAxis: {
        categories: countMonthDateObject.catmonth,
        crosshair: true,
        title: {
            text: 'month'
        },

    },
    yAxis: {
        min: 0,
        title: {
            text: 'counts'
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
    },
    plotOptions: {
        column: {
            pointPadding: 0.1,
            borderWidth: 0,
            dataLabels: {
                enabled: true
            }
        },
        series: {
            point: {
                events: {
                    click: function () {
                        this.select(null, false)
                        var selectedPoints = this.series.chart.getSelectedPoints();
                        filteredPoints = []
                        for (i = 0; i < selectedPoints.length; i++) {
                            filteredPoints = selectedPoints[i].category
                        }
                        filtered = filteredPoints.slice(filteredPoints.length - 4, filteredPoints.length)
                        filteredPoints = filteredPoints.slice(0, filteredPoints.length - 5)

                        const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

                        filteredPoints = (filtered).concat('-').concat(('0' + (month.indexOf(filteredPoints) + 1).toString()).slice(-2))
                        if (filteredPoints.length > 0) {
                            var new1 = monthDate.filter(filteredPoints).top(Infinity)
                        }
                        else new1 = monthDate.filterAll();

                        var filter1 = crossfilter(new1);

                        var carrierFilter = filter1.dimension(d => d.carrier)
                        var carrierFilterCount = carrierFilter.group().reduceSum(d => d.count)
                        var carrierFilterCountObject = modifyHigh(carrierFilterCount)
                        chart.xAxis[0].setCategories(carrierFilterCountObject.categories)
                        chart.series[0].setData(carrierFilterCountObject.data)

                        var error_sub_typeFilter = filter1.dimension(d => d.error_sub_type)
                        var error_sub_typeFilterCount = error_sub_typeFilter.group().reduceSum(d => d.count)
                        var error_sub_typeFilterCountObject = modifyHigh(error_sub_typeFilterCount)
                        chart3.xAxis[0].setCategories(error_sub_typeFilterCountObject.categories)
                        chart3.series[0].setData(error_sub_typeFilterCountObject.data)

                        var aggregation_typeFilter = filter1.dimension(d => d.aggregation_type)
                        var aggregation_typeFilterCount = aggregation_typeFilter.group().reduceSum(d => d.count)
                        var aggregation_typeFilterCountObject = modifyHigh(aggregation_typeFilterCount)
                        chart4.xAxis[0].setCategories(aggregation_typeFilterCountObject.categories)
                        chart4.series[0].setData(aggregation_typeFilterCountObject.data)


                        var error_typeFilter = filter1.dimension(d => d.error_type)
                        var error_typeFilterCount = error_typeFilter.group().reduceSum(d => d.count)
                        var error_typeFilterCountObject = modifyHigh(error_typeFilterCount)
                        chart5.xAxis[0].setCategories(error_typeFilterCountObject.categories)
                        chart5.series[0].setData(error_typeFilterCountObject.data)
                    }
                }
            }
        }
    },
    series: [{
        name: '',
        data: countMonthDateObject.data,
        color: '#22BCED'
    }],
    exporting: {
        enabled: true
    }
};
var chart2 = Highcharts.chart(options2)

var option3 = {
    chart: {
        renderTo: 'container3',
        type: 'bar',
        zoomType: 'xy',
        events: {
            load: function () {
                var point = this.xAxis[0].categories;
                for (let i = 0; i < point.length; i++) {
                    if (point[i] === "Success") {
                        var point1 = this.series[0].points[i]
                    }
                }
                point1.update({
                    color: 'green'
                })
            }
        },
    },
    title: {
        text: 'Count By Error Sub Type'
    },
    subtitle: {
        text: '15046',
        style: {
            color: '#0000FF'
        }
    },
    xAxis: {
        categories: countError_sub_typeObject.categories,
        crosshair: true,
        title: {
            text: 'error_sub_type'
        },
    },
    yAxis: {
        min: 0,
        title: {
            text: 'counts'
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0,
        },
        bar: {
            dataLabels: {
                enabled: true
            }
        },
        series: {
            point: {
                events: {
                    click: function () {
                        this.select(null, false)
                        var selectedPoints = this.series.chart.getSelectedPoints();
                        filteredPoints = []
                        for (i = 0; i < selectedPoints.length; i++) {
                            filteredPoints = selectedPoints[i].category
                        }
                        if (filteredPoints.length > 0) {
                            var new1 = error_sub_type.filter(filteredPoints).top(Infinity)
                        }
                        else new1 = error_sub_type.filterAll();

                        var filter1 = crossfilter(new1);

                        var monthDateFilter = filter1.dimension(d => d.monthDate)
                        var monthDateFilterCount = monthDate.group().reduce(function (p, v) {
                            p.count += v.count;
                            p.monthDate = toMonth((new Date(v.monthDate)).getMonth().toLocaleString())
                            return p;
                        },
                            function (p, v) {
                                p.count -= v.count;
                                p.monthDate = toMonth((new Date(v.monthDate)).getMonth().toLocaleString())
                                return p;
                            },
                            function (p, v) {
                                return {
                                    count: 0,
                                    monthDate: 0
                                };
                            }
                        );
                        var monthDateFilterCountObject = prepareForMonth(monthDateFilterCount)
                        chart2.xAxis[0].setCategories(monthDateFilterCountObject.catmonth)
                        chart2.series[0].setData(monthDateFilterCountObject.data);

                        var carrierFilter = filter1.dimension(d => d.carrier)
                        var carrierFilterCount = carrierFilter.group().reduceSum(d => d.count)
                        var carrierFilterCountObject = modifyHigh(carrierFilterCount)
                        chart.xAxis[0].setCategories(carrierFilterCountObject.categories)
                        chart.series[0].setData(carrierFilterCountObject.data)

                        var aggregation_typeFilter = filter1.dimension(d => d.aggregation_type)
                        var aggregation_typeFilterCount = aggregation_typeFilter.group().reduceSum(d => d.count)
                        var aggregation_typeFilterCountObject = modifyHigh(aggregation_typeFilterCount)
                        chart4.xAxis[0].setCategories(aggregation_typeFilterCountObject.categories)
                        chart4.series[0].setData(aggregation_typeFilterCountObject.data)


                        var error_typeFilter = filter1.dimension(d => d.error_type)
                        var error_typeFilterCount = error_typeFilter.group().reduceSum(d => d.count)
                        var error_typeFilterCountObject = modifyHigh(error_typeFilterCount)
                        chart5.xAxis[0].setCategories(error_typeFilterCountObject.categories)
                        chart5.series[0].setData(error_typeFilterCountObject.data)
                    }
                }
            }
        }
    },
    series: [{
        name: '',
        data: countError_sub_typeObject.data,
        color: '#0000FF'
    }],
    exporting: {
        enabled: true
    }

}
var chart3 = new Highcharts.chart(option3)

var option4 = {
    chart: {
        renderTo: 'container4',
        type: 'bar',
        zoomType: 'xy'
    },
    title: {
        text: 'Count By Aggregation Type'
    },
    subtitle: {
        text: '15046',
        style: {
            color: '#0000FF'
        }
    },
    xAxis: {
        categories: countAggregation_typeObject.categories,
        crosshair: true,
        title: {
            text: 'Aggregation type'
        }
    },
    yAxis: {
        min: 0,
        title: {
            text: 'counts'
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0,
        },
        bar: {
            dataLabels: {
                enabled: true
            }
        },
        series: {
            point: {
                events: {
                    click: function () {
                        this.select(null, false)
                        var selectedPoints = this.series.chart.getSelectedPoints();
                        filteredPoints = []
                        for (i = 0; i < selectedPoints.length; i++) {
                            filteredPoints = selectedPoints[i].category
                        }
                        if (filteredPoints.length > 0) {
                            var new1 = aggregation_type.filter(filteredPoints).top(Infinity)
                        }
                        else new1 = aggregation_type.filterAll();

                        var filter1 = crossfilter(new1);

                        var monthDateFilter = filter1.dimension(d => d.monthDate)
                        var monthDateFilterCount = monthDate.group().reduce(function (p, v) {
                            p.count += v.count;
                            p.monthDate = toMonth((new Date(v.monthDate)).getMonth().toLocaleString())
                            return p;
                        },
                            function (p, v) {
                                p.count -= v.count;
                                p.monthDate = toMonth((new Date(v.monthDate)).getMonth().toLocaleString())
                                return p;
                            },
                            function (p, v) {
                                return {
                                    count: 0,
                                    monthDate: 0
                                };
                            }
                        );
                        var monthDateFilterCountObject = prepareForMonth(monthDateFilterCount)
                        chart2.xAxis[0].setCategories(monthDateFilterCountObject.catmonth)
                        chart2.series[0].setData(monthDateFilterCountObject.data);

                        var carrierFilter = filter1.dimension(d => d.carrier)
                        var carrierFilterCount = carrierFilter.group().reduceSum(d => d.count)
                        var carrierFilterCountObject = modifyHigh(carrierFilterCount)
                        chart.xAxis[0].setCategories(carrierFilterCountObject.categories)
                        chart.series[0].setData(carrierFilterCountObject.data)

                        var error_sub_typeFilter = filter1.dimension(d => d.error_sub_type)
                        var error_sub_typeFilterCount = error_sub_typeFilter.group().reduceSum(d => d.count)
                        var error_sub_typeFilterCountObject = modifyHigh(error_sub_typeFilterCount)
                        chart3.xAxis[0].setCategories(error_sub_typeFilterCountObject.categories)
                        chart3.series[0].setData(error_sub_typeFilterCountObject.data)


                        var error_typeFilter = filter1.dimension(d => d.error_type)
                        var error_typeFilterCount = error_typeFilter.group().reduceSum(d => d.count)
                        var error_typeFilterCountObject = modifyHigh(error_typeFilterCount)
                        chart5.xAxis[0].setCategories(error_typeFilterCountObject.categories)
                        chart5.series[0].setData(error_typeFilterCountObject.data)
                    }
                }
            }
        }
    },
    series: [{
        name: '',
        data: countAggregation_typeObject.data,
        color: '#FFBF00'
    }],
    exporting: {
        enabled: true
    }
};
var chart4 = new Highcharts.chart(option4)

var option5 = {
    chart: {
        renderTo: 'container5',
        type: 'bar',
        zoomType: 'xy',
        events: {
            load: function () {
                var point = this.xAxis[0].categories;
                for (let i = 0; i < point.length; i++) {
                    if (point[i] === "Success") {
                        var point1 = this.series[0].points[i]
                    }
                }
                point1.update({
                    color: 'green'
                })
            }
        }
    },
    title: {
        text: 'Count By Error Type'
    },
    subtitle: {
        text: '15046',
        style: {
            color: '#0000FF'
        }
    },
    xAxis: {
        categories: countError_typeObject.categories,
        crosshair: true,
        title: {
            text: 'Error Type'
        }
    },
    yAxis: {
        min: 0,
        title: {
            text: 'counts'
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0,
        },
        bar: {
            dataLabels: {
                enabled: true
            }
        },
        series: {
            point: {
                events: {
                    click: function () {
                        this.select(null, false)
                        var selectedPoints = this.series.chart.getSelectedPoints();
                        filteredPoints = []
                        for (i = 0; i < selectedPoints.length; i++) {
                            filteredPoints = selectedPoints[i].category
                        }
                        if (filteredPoints.length > 0) {
                            var new1 = error_type.filter(filteredPoints).top(Infinity)
                        }
                        else new1 = error_type.filterAll();

                        var filter1 = crossfilter(new1);

                        var monthDateFilter = filter1.dimension(d => d.monthDate)
                        var monthDateFilterCount = monthDate.group().reduce(function (p, v) {
                            p.count += v.count;
                            p.monthDate = toMonth((new Date(v.monthDate)).getMonth().toLocaleString())
                            return p;
                        },
                            function (p, v) {
                                p.count -= v.count;
                                p.monthDate = toMonth((new Date(v.monthDate)).getMonth().toLocaleString())
                                return p;
                            },
                            function (p, v) {
                                return {
                                    count: 0,
                                    monthDate: 0
                                };
                            }
                        );
                        var monthDateFilterCountObject = prepareForMonth(monthDateFilterCount)
                        chart2.xAxis[0].setCategories(monthDateFilterCountObject.catmonth)
                        chart2.series[0].setData(monthDateFilterCountObject.data);

                        var carrierFilter = filter1.dimension(d => d.carrier)
                        var carrierFilterCount = carrierFilter.group().reduceSum(d => d.count)
                        var carrierFilterCountObject = modifyHigh(carrierFilterCount)
                        chart.xAxis[0].setCategories(carrierFilterCountObject.categories)
                        chart.series[0].setData(carrierFilterCountObject.data)

                        var error_sub_typeFilter = filter1.dimension(d => d.error_sub_type)
                        var error_sub_typeFilterCount = error_sub_typeFilter.group().reduceSum(d => d.count)
                        var error_sub_typeFilterCountObject = modifyHigh(error_sub_typeFilterCount)
                        chart3.xAxis[0].setCategories(error_sub_typeFilterCountObject.categories)
                        chart3.series[0].setData(error_sub_typeFilterCountObject.data)


                        var aggregation_type = filter1.dimension(d => d.error_type)
                        var aggregation_typeCount = aggregation_type.group().reduceSum(d => d.count)
                        var aggregation_typeCountObject = modifyHigh(aggregation_typeCount)
                        chart4.xAxis[0].setCategories(aggregation_typeCountObject.categories)
                        chart4.series[0].setData(aggregation_typeCountObject.data)
                    }
                }
            }
        }
    },
    series: [{
        name: '',
        data: countError_typeObject.data,
        color: '#FF0000'

    }],
    exporting: {
        enabled: true
    }
};
var chart5 = new Highcharts.chart(option5)