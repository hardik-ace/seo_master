var options = {
    series: [{
        name: 'Top 3 Positions',
        data: [44, 55, 57, 56, 61, 58, 63, 60, 66]
    }, {
        name: '4-10 Positions',
        data: [76, 85, 101, 98, 87, 105, 91, 114, 94]
    }, {
        name: '10-50 Positions',
        data: [35, 41, 36, 26, 45, 48, 52, 53, 41]
    }],
    chart: {
        type: 'bar',
        height: 350,
        
          stacked: true,
          stackType: '100%'
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded'
        },
    },
    dataLabels: {
        enabled: false
    },
    colors: ['#201E43','#134B70','#508C9B'],
    stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
    },
    xaxis: {
        categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    },
    yaxis: {
        title: {
            text: '$ (thousands)'
        }
    },
    fill: {
        opacity: 1
    },
    tooltip: {
        y: {
            formatter: function (val) {
                return "$ " + val + " thousands"
            }
        }
    }
};

var chart = new ApexCharts(document.querySelector("#keyword_ranking_by_month_chart"), options);
chart.render();