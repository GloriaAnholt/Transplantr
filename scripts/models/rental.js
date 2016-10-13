/* This file does an AJAX call to the local JSON data in order to make
a useable data structure to display on the main page
 */

(function(module) {

  function RentalData (data) {
    // Loop through the data and make it into a RentalData object
    for (key in data) {
      this[key] = data[key];
    }
  }

  // Create arrays to hold the objects from the three AJAX calls
  RentalData.currentStateData = [];
  RentalData.destinationStateData = [];
  RentalData.allCityMeanData = [];
  RentalData.allCityMedianData = [];

  // Handlebars templating to create the html for state, city rental info
  // is added dynamically by jQuery
  RentalData.prototype.createCurrentStateHtml = function() {
    var template = Handlebars.compile($('#state-curr-rental-template').html());
    return template(this);
  };

  RentalData.prototype.createDestinationStateHtml = function() {
    var template = Handlebars.compile($('#state-dest-rental-template').html());
    return template(this);
  };


/********* All three AJAX calls, one per data source:  ************/
  RentalData.fetchStates = function() {
    // cache all of the selection information before you start the async
    var isCurrent = MortgageData.source;
    var stateChoiceName = isCurrent ? Census.stateChoiceName : Census.destinationStateChoiceName;

    $.ajax({
      method: 'GET',
      url: '../data/state_rents.json',
      timeout: 2000,
      success: function(data, status, xhr) {
        // loop through the json data, turn it into a RentalData object
        if (isCurrent) {
          RentalData.currentStateData = RentalData.loadData(data);
        } else {
          RentalData.destinationStateData = RentalData.loadData(data);
        }

        var stateData = isCurrent ? RentalData.currentStateData : RentalData.destinationStateData;
        // grab only the RentalData obj you need:
        for (var i=0; i < stateData.length; i++) {
          if (stateData[i]['State'] == stateChoiceName) {
            var stateObj = stateData[i];
            break;
          }
        }
        // pass the selected RentalData state object off to the controller
        rentalController.revealState(stateObj, isCurrent);
      },

      error: function(xhr, settings, error) {
        var message = 'Server returned a '
          + '<b>' + jqXHR.status + ' ' + thrownError + '</b>'
          + ' error message. <br />Please try again later.</div>';
        console.log(message);
      }
    });
  };

  RentalData.fetchCityMedian = function() {
    // cache the city choice before the async starts
    var isCurrent = MortgageData.source;
    var cityChoice = isCurrent ? MortgageData.currentCityChoice : MortgageData.destinationCityChoice;

    $.ajax({
      method: 'GET',
      url: '../data/city_rents-median.json',
      timeout: 2000,
      success: function(data, status, xhr) {
        // loop through the json data, turn it into a RentalData object
        RentalData.allCityMedianData = RentalData.loadData(data);

        // grab only the RentalData obj you need:
        for (var i=0; i < RentalData.allCityMedianData.length; i++) {
          if (RentalData.allCityMedianData[i]["City"] == cityChoice) {
            var cityMedianObj = RentalData.allCityMedianData[i];
            break;
          }  // close if
        } // close for-loop
        // pass the selected RentalData city object off to the controller
        rentalController.revealCityMedian(cityMedianObj, isCurrent);

        // make sure the mean is called after the median, so the templating looks right
        RentalData.fetchCityMean(isCurrent);
      },
      error: function(xhr, settings, error) {
        var message = 'Server returned a '
            + '<b>' + jqXHR.status + ' ' + thrownError + '</b>'
            + ' error message. <br />Please try again later.</div>';
        console.log(message);
      }
    });
  };

  RentalData.fetchCityMean = function(isCurrent) {
    // cache the city choice before the async starts
    var cityChoice = isCurrent ? MortgageData.currentCityChoice : MortgageData.destinationCityChoice

    $.ajax({
      method: 'GET',
      url: '../data/city_rents-mean.json',
      timeout: 2000,
      success: function(data, status, xhr) {
        // loop through the json data, turn it into a RentalData object
        RentalData.allCityMeanData = RentalData.loadData(data);
        // grab only the RentalData obj you need:
        for (var i=0; i < RentalData.allCityMeanData.length; i++) {
          if (RentalData.allCityMeanData[i]["City"] == cityChoice) {
            var cityMeanObj = RentalData.allCityMeanData[i];
            break;
          }  // close if
        } // close for-loop
        // pass the selected RentalData city object off to the controller
        rentalController.revealCityMean(cityMeanObj, isCurrent);
      },

      error: function(xhr, settings, error) {
        var message = 'Server returned a '
          + '<b>' + jqXHR.status + ' ' + thrownError + '</b>'
          + ' error message. <br />Please try again later.</div>';
        console.log(message);
      }
    });
  };

  // method to take returned data from ajax request and load it into RentalData.cityData
  RentalData.loadData = function(jsondata) {
    return jsondata.map(function(obj) {
      return new RentalData(obj);
    });
  };

  module.RentalData = RentalData;
})(window);
