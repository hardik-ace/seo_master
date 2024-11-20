
var options = {
    series: [
        {
            name: 'Direct',
            data: [
                23, 36, 138, 101, 149,149
            ]
        },
        {
            name: 'Referral',
            data: [
                8, 96, 20, 62, 102, 115
            ]
        },
        {
            name: 'Organic Search',
            data: [
                25, 76, 45, 101, 100, 113
            ]
        },
        {
            name: 'Organic Social',
            data: [
                55, 29, 74, 76, 53, 128
            ]
        },
        {
            name: 'Paid Search',
            data: [
                117, 73, 125, 115, 60, 78
            ]
        },
        {
            name: 'Display Ads',
            data: [
                20, 119, 68, 11, 158, 34
            ]
        },
        {
            name: 'Email',
            data: [
                83, 93, 121, 32, 35, 53
            ]
        }
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
        // curve: 'straight'
        curve: 'monotoneCubic'
    },
    
    grid: {
        row: {
            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
            opacity: 0.5
        },
    },
    xaxis: {
        categories: [ 'May', 'Jun', 'Jul', 'Aug', 'Sep','Oct'],
    }
};

var chart = new ApexCharts(document.querySelector("#traffic_analytics_by_month"), options);
chart.render();
