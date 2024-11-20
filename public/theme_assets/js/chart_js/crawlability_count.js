var options = {
    series: [50],
    chart: {
        // height: 200,
        // width: 140,
        type: 'radialBar',
        toolbar: {
            show: false
        }
    },
    plotOptions: {
        radialBar: {
            startAngle: -135,
            endAngle: 225,
            hollow: {
                margin: 0,
                size: '60%',
                background: '#fff',
                image: undefined,
                imageOffsetX: 0,
                imageOffsetY: 0,
                position: 'front',
                dropShadow: {
                    enabled: true,
                    top: 3,
                    left: 0,
                    blur: 4,
                    opacity: 0.24
                }
            },
            track: {
                background: '#fff',
                strokeWidth: '67%',
                margin: 0, // margin is in pixels
                dropShadow: {
                    enabled: true,
                    top: -3,
                    left: 0,
                    blur: 4,
                    opacity: 0.35
                }
            },

            dataLabels: {
                show: true,
                name: {
                    offsetY: -10,
                    show: false,
                    color: '#888',
                    fontSize: '17px'
                },
                value: {
                    formatter: function (val) {
                        return parseInt(val);
                    },
                    offsetY: 10,
                    color: '#111',
                    fontSize: '20px',
                    show: true,

                }
            }
        }
    },
    fill: {
        type: 'gradient',
        gradient: {
            shade: 'dark',
            type: 'horizontal',
            shadeIntensity: 0.5,
            gradientToColors: ['#ABE5A1'],
            inverseColors: true,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 100]
        }
    },
    stroke: {
        lineCap: 'round'
    },
    labels: ['Percent'],
};

// var options = {
//     series: [70,30],
//     chart: {
//       width: 150,
//       type: 'donut',
//     },
//     dataLabels: {
//       enabled: false,
//     },
//     responsive: [{
//       breakpoint: 480,
//       options: {
//         chart: {
//           width: 200
//         },
//         legend: {
//           show: false
//         }
//       }
//     }],
//     legend: {
//         show: false,
//       position: 'bottom',
//       offsetY: 0,
//     //   height: 230,
//     },
//     labels: ['Crawlability','Other'],
//   };



var chart = new ApexCharts(document.querySelector("#crawlability_count_chart"), options);
chart.render();


