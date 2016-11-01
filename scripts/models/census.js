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
  Census.prototype.createCurrentEconHtml = function() {
    var template = Handlebars.compile($('#county-curr-econ-template').html());
    return template(this);
  };

  Census.prototype.createDestinationEconHtml = function() {
    var template = Handlebars.compile($('#county-dest-econ-template').html());
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

  Census.stripNumbers = function(numStr) {
    var numParts = numStr.match(/\d/g);
    return parseInt(numParts.join(''));
  };

  //compute income ration when submit button is pressed
  $('#current-submit').on('click', function() {
    $('.showChartContainer').css('display', 'block');
    var incomeInput = $('#current-income').val();
    Census.currentIncome = Census.stripNumbers(incomeInput);
    localStorage.setItem('income', Census.currentIncome);
    // income called here so it waits for the input to load
    dataController.incomeReveal(Census.currentIncome);
    Census.incomeLogic();
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

  Census.incomeLogic = function() {
    //set Census.currentIncome as local variable
    var myIncome = Census.currentIncome;

    // pull all of the data from storage, strip char and make an int
    var localMedianIncome = Census.stripNumbers(localStorage.getItem('homeincome')),
      desMedianIncome = Census.stripNumbers(localStorage.getItem('awayincome')),
      curHomePrice = Census.stripNumbers(localStorage.getItem('homehomePrice')),
      desHomePrice = Census.stripNumbers(localStorage.getItem('awayhomePrice')),
      curStateRent = Census.stripNumbers(localStorage.getItem('homestate_rent')),
      destStateRent = Census.stripNumbers(localStorage.getItem('awaystate_rent')),
      cur1BedMedian = Census.stripNumbers(localStorage.getItem('home1bedMedian')),
      dest1BedMedian = Census.stripNumbers(localStorage.getItem('away1bedMedian')),
      cur2BedMedian = Census.stripNumbers(localStorage.getItem('home2bedMedian')),
      dest2BedMedian = Census.stripNumbers(localStorage.getItem('away2bedMedian'));
    //both having one var keyword per line and having comma seperated assignments are
    //valid ways to handle variable assignment but as with any stylistic decision you
    //should choose one for the project and stick to it.

    //get ration of income to local median income & local home price
    var curIncRatio = myIncome/localMedianIncome;
    var curHomePriceRatio = myIncome/curHomePrice;
    //get income needed in destination city to maintain same ratio
    Census.incNeeded = Math.round(desMedianIncome * curIncRatio);
    //get income needed to have same buying power in new city
    Census.housingDiffPercent = Math.round(((desHomePrice - curHomePrice) / curHomePrice) * 100);
    Census.incNeededHomePrice = Math.round(desHomePrice * curHomePriceRatio);
    // calculate rent as percentage of income
    Census.stateCurRentPercent = Math.round((curStateRent * 12 * 100) / myIncome);
    Census.stateDestRentPercent = Math.round((destStateRent * 12 * 100)/ Census.incNeeded);

    // get the median rental data, if available
    if (cur1BedMedian) {
      Census.cur1BedMedianPercent = Math.round((cur1BedMedian * 12 * 100) / myIncome);
      $('#curr_median_1bdrm_percent').html('Rent as % of Current Income: <b>' + Census.cur1BedMedianPercent + '%</b>');
    }
    if (dest1BedMedian) {
      Census.dest1BedMedianPercent = Math.round((dest1BedMedian * 12 * 100) / Census.incNeeded);
      $('#dest_median_1bdrm_percent').html('Expected Rent as % of Income: <b>' + Census.dest1BedMedianPercent + '%</b>');
    }
    if (cur2BedMedian) {
      Census.cur2BedMedianPercent = Math.round((cur2BedMedian * 12 * 100) / myIncome);
      $('#curr_median_2bdrm_percent').html('Rent as % of Current Income: <b>' + Census.cur2BedMedianPercent + '%</b>');
    }
    if (dest2BedMedian) {
      Census.dest2BedMedianPercent = Math.round((dest2BedMedian * 12 * 100) / Census.incNeeded);
      $('#dest_median_2bdrm_percent').html('Expected Rent as % of Income: <b>' + Census.dest2BedMedianPercent + '%</b>');
    }
    incomeController.revealIncomeNeeedData();
    $('.showChartContainer').css('display', 'block');

  };


  // make Census available globally
  module.Census = Census;
})(window);
