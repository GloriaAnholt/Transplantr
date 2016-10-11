'use strict';
//IIFE here
(function(module) {
  // contructor function to make object out of API response data
  function Census (data) {
    for (var key in data) {
      this[key] = data[key];
    }
  }
  // key for census API
  var censusKey = '7a3aa9d2f7fafb092b5957d10b65c477719c4c4f';
  //array of all site objects that
  Census.allData = [];
  //run census.request when state option changes
  $('#state-choice').on('change', function(){
    $('#county-filter').empty();
    Census.stateChoice = $(this).val();
    console.log(Census.stateChoice);
    Census.request();
  });
  //assign countyChoice when county option changes
  $('#county-filter').on('change', function(){
    Census.countyChoice = $(this).val();
    console.log(Census.countyChoice);
    //county data is there; it's just not showing on the page or rendering in handlebars template
    console.log(Census.getCountyInfo());
  });

  //method to find info for county
  Census.getCountyInfo = function () {
    for (var i = 0; i < Census.allData.length; i++) {
      if (Census.allData[i][0] === Census.countyChoice) {
        return Census.allData[i];
        //storing the selected County into a variable
        var selectedCounty = Census.allData[i];
        //handing the selectedCounty to the cityController.
        //THIS MAY BE WHERE THE PROBLEM LIES
        cityController.reveal(selectedCounty);
      }
    }
  };

  Census.prototype.createCityHtml = function() {
    var template = Handlebars.compile($('#city-info-template').html());
    return template(this);
  };

  //ajax call here
  Census.request = function(callback) {
    $.ajax({
      method: 'GET',
      url: 'http://api.census.gov/data/timeseries/poverty/saipe?get=NAME,SAEMHI_PT,SAEPOVRTALL_PT&for=county:*&in=state:' + Census.stateChoice + '&time=2012&key=' + censusKey,
      success: function(data, status, xhr){
        Census.loadData(data);
        data.forEach(function(county){
          if (county[0] !== 'NAME') {
            var $option = $('<option></option>');
            $option.val(county[0]);
            $option.text(county[0]);
            $('#county-filter').append($option);
          }
        });
        // The rental data can't run until census populates, callback goes here:
        RentalData.fetchStates();
      },
      error: function(xhr, settings, error){
        console.log('Ajax call failed:', error);
      }
    });
  };
  // method to take returned data from census API request and load it into Census.allData
  Census.loadData = function(data) {
    Census.allData = data.map(function(county) {
      return new Census(county);
    });
  };
  // make Census available globally
  module.Census = Census;
})(window);
