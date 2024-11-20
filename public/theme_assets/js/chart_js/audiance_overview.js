
var options = {
    series: [
        {
            name: 'Sessions',
            data: [
                5,43, 26, 18, 80, 60,149
            ]
        },
        
    ],
    chart: {
        height: 350,
        // type: 'line',
        type: 'area',
        zoom: {
            enabled: false
        }
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'straight'
        // curve: 'monotoneCubic'
    },
    title: {
        text: 'Sessions',
        align: 'left'
    },
    grid: {
        row: {
            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
            opacity: 0.5
        },
    },
    xaxis: {
        categories: ['April', 'May', 'Jun', 'Jul', 'Aug', 'Sep','Oct'],
    }
};

var chart = new ApexCharts(document.querySelector("#audiance_overview_by_month_chart"), options);
chart.render();
