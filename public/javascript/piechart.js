function myPiechart() {
    var ctx = document.getElementById("myPieChart").getContext('2d');
    console.log("Here");
    console.log([annualPresentCnt, annualAbsentCnt, annualLateCnt]);
    var myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ["Present", "Absent", "Late"],
            datasets: [{
                label: 'Annual attendance',
                data: [annualPresentCnt, annualAbsentCnt, annualLateCnt],
                backgroundColor: [
                    'rgba(54, 162, 35, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(255, 206, 86, 0.5)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255,99,132,1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
}
