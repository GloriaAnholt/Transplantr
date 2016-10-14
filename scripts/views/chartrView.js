'use strict';

function drawChart() {
  setTimeout(function() {
    var homecity = localStorage.getItem('homecity');
    var awaycity = localStorage.getItem('awaycity');
    var homehome = localStorage.getItem('homehomePrice');
    var awayhome = localStorage.getItem('awayhomePrice');
    var ctx = $('#chart_canvas');
    $('#housing-graph-description').empty().html('This graph shows the average home prices(in US dollars) in '+homecity+' and '+awaycity+', as well as the national average home price.');
    if (homehome.charAt(0) !== '$'){
      $('#housing-graph-description').append('<br><br>Zillow does not have any house price information for ', homecity,'.');
    }
    if (awayhome.charAt(0) !== '$'){
      $('#housing-graph-description').append('<br><br>Zillow does not have any house price information for ',awaycity,'.');
    }


    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Home Values By Location'],
        datasets: [{
          label: homecity,
          data: [homehome.slice(1)],
          backgroundColor: 'rgba(0, 52, 89, 1)'
        },
        {
          label: awaycity,
          data: [awayhome.slice(1)],
          backgroundColor: 'rgba(0, 126, 167, 1)'
        },
        {
          label: 'National Median',
          data: [284000],
          backgroundColor: 'rgba(0, 23, 31, 1)'
        },
      ]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              suggestedMin:0,
              beginAtZero:true
            }
          }],
          xAxes: [{
            ticks: {
              suggestedMin:0,
              beginAtZero:true
            }
          }]
        }
      }
    });
  }, 300);
};

function drawChart2() {
  setTimeout(function() {
    var homecity = localStorage.getItem('homecity');
    var awaycity = localStorage.getItem('awaycity');
    if (localStorage.getItem('income')){
      var modifiedIncome = localStorage.getItem('income').match(/\d/g);
      var myIncome = parseInt(modifiedIncome.join(''));
      $('#income-graph-description').empty().html('This graph shows the average incomes (in US dollars) in '+homecity+' and '+awaycity+', as well as the national median income.');
    }
    else {
      $('#income-graph-description').append('<br><br>You did not enter any income incoformation.');
    }
    var homeincome = localStorage.getItem('homeincome');
    var awayincome = localStorage.getItem('awayincome');
    var ctx = $('#chart2_canvas');

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Income By Location'],
        datasets: [{
          label: 'You',
          data: [myIncome],
          backgroundColor: 'rgba(0, 167, 225, 1)'
        },
        {
          label: homecity,
          data: [homeincome.slice(1)],
          backgroundColor: 'rgba(0, 52, 89, 1)'
        },
        {
          label: awaycity,
          data: [awayincome.slice(1)],
          backgroundColor: 'rgba(0, 126, 167, 1)'
        },
        {
          label: 'National Median',
          data: [51759],
          backgroundColor: 'rgba(0, 23, 31, 1)'
        },
      ]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              suggestedMin:0,
              beginAtZero:true
            }
          }],
          xAxes: [{
            ticks: {
              suggestedMin:0,
              beginAtZero:true
            }
          }]
        }
      }
    });
  }, 300);
};
