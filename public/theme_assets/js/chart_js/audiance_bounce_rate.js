
var options = {
    series: [
        {
            name: 'Sessions',
            data: [
                5, 43, 26, 18, 80, 60, 149
            ]
        },

    ],
    chart: {
        height: 160,
        sparkline: {
            enabled: true
        },
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
        text: 'Bounce Rate',
        style: {
            fontSize: '15px',
            color:"#969696"
            // cssClass: 'apexcharts-yaxis-title'
        },
        align: 'left'
    },
    subtitle: {
        text: '69.04',
        // offsetX: 30,
        style: {
            fontSize: '28px',
            // cssClass: 'apexcharts-yaxis-title'
        }
    },
    grid: {
        row: {
            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
            opacity: 0.5
        },
    },
    xaxis: {
        categories: ['April', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    },

};

var chart = new ApexCharts(document.querySelector("#audiance_bounce_rate_chart"), options);
chart.render();