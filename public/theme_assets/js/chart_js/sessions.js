
var options = {
    series: [
        {
            name: 'Sessions',
            data: [
                10,53, 36, 138, 40, 50,149
            ]
        },
        
    ],
    chart: {
        height: 350,
        type: 'line',
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

var chart = new ApexCharts(document.querySelector("#sessions_by_month_chart"), options);
chart.render();
