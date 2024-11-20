var options = {
    series: [{
        name: 'Healthy',
        data: [10]
    }, {
        name: 'Broken',
        data: [40]
    }, {
        name: 'Have Issues',
        data: [4]
    }, {
        name: 'Redirects',
        data: [100]
    }, {
        name: 'Blocked',
        data: [60]
    }],
    chart: {
        type: 'bar',
        height: 200,
        stacked: true,
        toolbar: {
            show: false
        }
    },
    plotOptions: {
        bar: {
            horizontal: true,
            
        },
    },
    stroke: {
        width: 1,
        colors: ['#fff']
    },
    title: {
        text: 'Crwled Pages'
    },
    xaxis: {
        categories: ['Pages',],
        labels: {
            show:false
            //   formatter: function (val) {
            //     return val + "K"
            //   }
        }
    },
    yaxis: {
        
        // title: {
        //     text: "Pages"
        // },
    },

    fill: {
        opacity: 1
    },
    legend: {
        position: 'bottom',
        horizontalAlign: 'left',
        offsetX: 40
    }
};

var chart = new ApexCharts(document.querySelector("#crawled_pages_chart"), options);
chart.render();