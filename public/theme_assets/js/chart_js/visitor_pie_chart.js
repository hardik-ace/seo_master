var options = {
    series: [85, 15],
    chart: {
        width: 420,
        type: 'pie',
    },
    labels: ['New Visitor', 'Returning Visitor'],
    responsive: [{
        breakpoint: 480,
        options: {
            chart: {
                width: 200
            },
            legend: {
                position: 'bottom'
            }
        }
    }],
    legend: {
        position: 'top'
    },
    colors: ['#71b2ed','#0e2c47'],
};

var chart = new ApexCharts(document.querySelector("#visitor_chart"), options);
chart.render();