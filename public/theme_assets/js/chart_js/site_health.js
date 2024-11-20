var options = {
    series: [90, 88],
    chart: {
        type: 'radialBar',
        // height: 250, // Increase the chart height
        // width: 250,
        // offsetY: -20,
        // offsetX: -20,
        sparkline: {
            enabled: true
        }
    },

    plotOptions: {
        radialBar: {
            hollow: {
                size: '40%',
            },
            startAngle: -90,
            endAngle: 90,
            track: {
                background: "#e7e7e7",
                strokeWidth: '30%',
                margin: 5, // margin is in pixels
                dropShadow: {
                    enabled: true,
                    top: 2,
                    left: 0,
                    color: '#999',
                    opacity: 1,
                    blur: 2
                }
            },
            dataLabels: {
                name: {
                    show: false
                },
                value: {
                    offsetY: -2,
                    fontSize: '18px',
                }
            }
        }
    },
    grid: {
        padding: {
            top: -10
        }
    },

    labels: ['Your site ', 'Top-10% Website '],
    legend: {
        show: true,
        position: 'bottom', // Position of the legend (bottom, top, left, right)
        labels: {
            useSeriesColors: false, // Use the same colors as the series
            
        },
        fontSize: '12px',
        formatter: function (seriesName, opts) {
            return seriesName + ": " + opts.w.globals.series[opts.seriesIndex] + "%";
        },
    },
    colors: ['#0e2c47','#71b2ed'],
};

var chart = new ApexCharts(document.querySelector("#site_health_chart"), options);
chart.render();


