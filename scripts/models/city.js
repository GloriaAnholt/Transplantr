//IIFE here
(function(module) {

  // constructor function to make object out of API response data
  function Census (data) {
    for (key in data) {
      this[key] = data[key];
    }
  }

  //array of all site objects that run census.
  Census.allCurrentData = [];
  Census.allDestinationData = [];
  Census.economicData = [];
  Census.destinationEconomicData = [];
  Census.incomeData = [];

  //sets up the source variable true = origin false = destination
  Census.source = true;

  // Handlebars templating to create the html
  Census.prototype.createEconHtml = function() {
    var template = Handlebars.compile($('#county-econ-template').html());
    return template(this);
  };

  //dummy value templates
  var defaultCityEntry = $('<option value=""></option>').text('Choose City');
  var defaultCountyEntry = $('<option value=""></option>').text('Choose County');


/****************** CURRENT CITY INFORMATION ******************/
  //request when state option changes
  $('#state-choice').on('change', function(){
    $('#county-filter').empty().append(defaultCountyEntry);
    $('#city-choice').empty().append(defaultCityEntry);
    Census.source = true;
    Census.stateChoice = $(this).val();
    Census.stateChoiceName = $(this).find('option:selected').text();
    Census.request();
  });

  //assign countyChoice when county option changes
  $('#county-filter').on('change', function(){
    $('#city-choice').empty().append(defaultCityEntry);
    Census.source = true;
    Census.countyChoice = $(this).val();
    Census.countyChoiceName = Census.countyChoice.replace(' County', '');
    // grab the county's econ data and pass it to the controller
    var isCurrent = true;
    incomeController.revealEcon(Census.getEconInfo(), isCurrent);
    MortgageData.fetchZillow(isCurrent);
      //call the function to populate the city filter
    MortgageData.fillCityFilter();
  });

  //compute income ration when submit button is pressed
  $('#current-submit').on('click', function() {
    Census.currentIncome = $('#current-income').val();
    var myIncParts = Census.currentIncome.match(/\d/g);
    var myIncome = parseInt(myIncParts.join(''));
    console.log('My income:', myIncome);
    localStorage.setItem('income', Census.currentIncome);
    var medIncParts = localStorage.getItem('homeincome').match(/\d/g);
    var localMedianIncome = parseInt(medIncParts.join(''));
    Census.curIncRatio = (myIncome)/(localMedianIncome);
    console.log('Local Median Income:', localMedianIncome);
    console.log('Ratio to Median:', Census.curIncRatio);
    var desMedIncParts = localStorage.getItem('awayincome').match(/\d/g);
    var desMedianIncome = parseInt(desMedIncParts.join(''));
    Census.incNeeded = Math.round((desMedianIncome)*(Census.curIncRatio));
    console.log(Census.incNeeded);
    $('#income_needed_median').html('You would need to make <b>$' + Census.incNeeded + '</b> in order to maintain the same relationship to the median income.');

    // income called here so it waits for the input to load
    dataController.incomeReveal(Census.currentIncome);
    $('.showChartContainer').css('display', 'block');
  });

/****************** DESTINATION CITY INFORMATION ******************/
  //set destination state option changes
  $('#destination-state-choice').on('change', function(){
    $('#destination-county-filter').empty().append(defaultCountyEntry);
    $('#destination-city-choice').empty().append(defaultCityEntry);
    Census.source = false;
    Census.destinationStateChoice = $(this).val();
    Census.destinationStateChoiceName = $(this).find('option:selected').text();
    Census.request();
  });

  //set destination city on option change
  $('#destination-county-filter').on('change', function(){
    $('#destination-city-choice').empty().append(defaultCityEntry);
    Census.source = false;
    Census.destinationCountyChoice = $(this).val();
    Census.destinationCountyChoiceName = Census.destinationCountyChoice.replace(' County', '');
    // grab the county's econ data and pass it to the controller
    var isCurrent = false;
    incomeController.revealEcon(Census.getEconInfo(), isCurrent);
    MortgageData.fetchZillow(isCurrent);
      //call the function to populate the city filter
    MortgageData.fillCityFilter();
  });


  //method to find info for county
  Census.getCountyInfo = function() {
    // select which array to use based on value of Census.source
    var currentDataArray = Census.source ? Census.allCurrentData : Census.allDestinationData;

    for (var i=0; i < currentDataArray.length; i++) {
      if (currentDataArray[i][0] === Census.countyChoice ||
        currentDataArray[i][0] === Census.destinationCountyChoice) {
        return currentDataArray[i];
      }
    }
  };

  // method to grab just the county selected and put it's econ data on the page
  Census.getEconInfo = function() {
    // Check which thing was modified, then loop over the related array
    if (Census.source) {
      for (var i = 0; i < Census.economicData.length; i++) {
        if (Census.economicData[i]['county'] === Census.countyChoice) {
          Census.econObj = Census.economicData[i];
          // pass the current city object to the user data storage
          Data.parseEconData(Census.econObj);
          return Census.econObj;
        } // close if
      } // close for
    } else {
      for (i = 0; i < Census.destinationEconomicData.length; i++) {
        if (Census.destinationEconomicData[i]['county'] === Census.destinationCountyChoice) {
          Census.destinationEconObj = Census.destinationEconomicData[i];
          Data.parseEconData(Census.destinationEconObj);
          return Census.destinationEconObj;
        } // close if
      } // close for
    } // close else
  };


  //ajax call gets routed to the express server and then out to the census
  Census.request = function() {
    //set a local var for if current or destination called the function
    var currentChoice = Census.source ? Census.stateChoice : Census.destinationStateChoice;
    // cache the value of Census.source in case something outside ajax changes it before the call finishes
    var isCurrent = Census.source;

    $.ajax({
      method: 'GET',
      url: '/census/' + currentChoice,
      success: function(data, status, xhr){
        Census.loadData(data);    // turn census data into Census objects
        // We loop through all the data once, grabbing different things out
        var currentDataArray = isCurrent ? Census.allCurrentData : Census.allDestinationData;

        currentDataArray.forEach(function(county) {
          if (county[0] !== 'NAME') {
            // populate the county filter with the received census data
            var $option = $('<option></option>');
            $option.val(county[0]);
            $option.text(county[0]);

            if (isCurrent) {    // potential async trouble with boolean val being set elsewhere
              $('#county-filter').append($option);
            } else {
              $('#destination-county-filter').append($option);
            }

            // grab the income and poverty data, make into a census object and put in correct array
            if (isCurrent) {
              Census.economicData.push(new Census({
                'county': county[0],
                'medianIncome': '$' + county[1],
                'percentPoverty': county[2] + '%'
              }));
            } else {
              Census.destinationEconomicData.push(new Census({
                'county': county[0],
                'medianIncome': '$' + county[1],
                'percentPoverty': county[2] + '%'
              }));
            }

          } // close if
        }); // close forEach
        // The rental data can't run until census populates, call it here
      },
      error: function(xhr, settings, error){
        console.log('Ajax call failed:', error);
      }
    });  // end ajax
  };  // end function

  // method to take returned data from census API request and load it into Census.allData
  Census.loadData = function(data) {
    if (Census.source) {
      Census.allCurrentData = data.map(function(county) {
        return new Census(county);
      });
    } else {
      Census.allDestinationData = data.map(function(county) {
        return new Census(county);
      });
    }
  };

  // make Census available globally
  module.Census = Census;
})(window);
