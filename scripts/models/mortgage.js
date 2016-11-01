/* This script handles pulling data from the Zillow API and making it
available to the Transplantr app

To use handlebars, the data needs to be stored as an array of objects.
 */

(function(module) {

  function MortgageData (data) {
    // Loop through the data and make it into a MortgageData object
    for (key in data) {
      this[key] = data[key];
    }
  }

  // Create the array to hold the objects from the AJAX call
  MortgageData.currentCities = [];
  MortgageData.destinationCities = [];
  MortgageData.currentCityNames = [];
  MortgageData.destinationCityNames = [];
  MortgageData.currentHousePrices = []; // this holds the $ for handlebars
  MortgageData.destinationHousePrices = [];

  MortgageData.prototype.createCurrentMortgageHtml = function() {
    var template = Handlebars.compile($('#curr-mortgage-template').html());
    return template(this);
  };

  MortgageData.prototype.createDestinationMortgageHtml = function() {
    var template = Handlebars.compile($('#dest-mortgage-template').html());
    return template(this);
  };


  MortgageData.fetchZillow = function(isCurrent) {
    // The call to /zillow is routed by page to the node server and out to Zillow
    var currentState = isCurrent ? Census.stateChoiceName : Census.destinationStateChoiceName;
    var currentCounty = isCurrent ? Census.countyChoiceName : Census.destinationCountyChoiceName;

    $.ajax({
      method: 'GET',
      url: '/zillow/' + currentState.toLowerCase() + '/' + currentCounty.toLowerCase(),
      success: function(data, status, xhr) {

        if (isCurrent) {
          MortgageData.currentCitiesList = data.childNodes[0].childNodes[2].childNodes[2].childNodes;
          MortgageData.currentCitiesNodes = data.childNodes[0].childNodes[2].childNodes[2];
        } else {
          MortgageData.destinationCitiesList = data.childNodes[0].childNodes[2].childNodes[2].childNodes;
          MortgageData.destinationCitiesNodes = data.childNodes[0].childNodes[2].childNodes[2];
        }

        // empty the arrays to hold the cities XML objects and the city names as strings
        MortgageData.currentCities = [];
        MortgageData.destinationCities = [];

        //populate the array of city names ignoring the 1st item
        var citiesList = isCurrent ? MortgageData.currentCitiesList : MortgageData.destinationCitiesList;
        var citiesArray = isCurrent ? MortgageData.currentCities : MortgageData.destinationCities;
        for (var i=1; i < citiesList.length; i++) {
          citiesArray.push(data.childNodes[0].childNodes[2].childNodes[2].childNodes[i].childNodes[1]);
        }

        if (isCurrent) {
          //map should already return a new array so assigning this to an empty array first is redundant
          MortgageData.currentCityNames = [];
          MortgageData.currentCityNames = MortgageData.currentCities.map(function(city){
            return city.innerHTML;
          });
        } else {
          MortgageData.destinationCityNames = [];
          MortgageData.destinationCityNames = MortgageData.destinationCities.map(function(city){
            return city.innerHTML;
          });
        }
        MortgageData.source = isCurrent;
      },
      error: function(xhr, settings, error) {
        console.log('Server returned a ', xhr.status + ' ' + error + ' error.');
      }
    });
  };

//this function appends cities to the city filter in index.html
  MortgageData.fillCityFilter = function() {
    setTimeout(function(){
      var cityNames = MortgageData.source ? MortgageData.currentCityNames : MortgageData.destinationCityNames;
      cityNames.forEach(function(city){
        var filterEntry = $('<option value="'+ city +'"></option>').text(city);
        if (MortgageData.source) {
          $('#city-choice').append(filterEntry);
        } else {
          $('#destination-city-choice').append(filterEntry);
        }
      });
    }, 800);
  };

//assigns the user's city choice to the variable MortgageData.cityChoice.
  $('#city-choice').on('change', function(){
    MortgageData.currentCityChoice = $(this).val();
    MortgageData.source = true;
    var isCurrent = true;
    MortgageData.fetchZillow(isCurrent);
    MortgageData.findHomes(isCurrent);

    // this change needs to update the zillow template on the page
    dataController.mortgageReveal(MortgageData.currentHousePrices, isCurrent);
    // Call the rental stuff now that city is populated
    RentalData.fetchStates();
    RentalData.fetchCityMedian();
  });

  //same as above, but for the destination city
  $('#destination-city-choice').on('change', function(){
    MortgageData.destinationCityChoice = $(this).val();
    MortgageData.source = false;
    var isCurrent = false;
    MortgageData.fetchZillow(isCurrent);
    MortgageData.findHomes(isCurrent);

    dataController.mortgageReveal(MortgageData.destinationHousePrices, isCurrent);
    // Call the rental stuff now that city is populated
    RentalData.fetchStates();
    RentalData.fetchCityMedian();
  });


  MortgageData.findHomes = function(isCurrent){
    var citiesNodes = isCurrent ? MortgageData.currentCitiesNodes : MortgageData.destinationCitiesNodes;
    var cityChoice = isCurrent ? MortgageData.currentCityChoice : MortgageData.destinationCityChoice;

    if (isCurrent) {
      var x = MortgageData.currentCityNames.indexOf(cityChoice) + 1;
    } else {
      //since you're declaring the variable inside the if block here it won't be declared for the
      //assignment here in the else. This would actually fail in strict mode. The reason that this
      //is particularly problematic here is that when you don't declare a variable before you assign
      //it (aside from crashing your program in strict mode) it will silently declare a variable for
      //you, but on the global scope. With a variable simply named "x" this could cause some problems
      //the easiest way to handle this here would just be to declare it at the top of the function
      //block and assign it in the conditional.
      x = MortgageData.destinationCityNames.indexOf(cityChoice) + 1;
    }

    // This is where the zindex is, if it doesn't return a number, change the message
    if (isNaN(citiesNodes.childNodes[x].childNodes[2].innerHTML)) {
      var houseprice = 'not available for ' + cityChoice + '.';
    } else {
      //see above comment.
      houseprice = '$' + citiesNodes.childNodes[x].childNodes[2].innerHTML;
    }

    if (isCurrent) {
      MortgageData.currentHousePrices = (new MortgageData({
        'city': MortgageData.currentCityChoice,
        'aveHousePrice': houseprice
      }));
    } else {
      MortgageData.destinationHousePrices = (new MortgageData({
        'city': MortgageData.destinationCityChoice,
        'aveHousePrice': houseprice
      }));
    }

    if (isCurrent) {  // state, county, city, homePrice, income, poverty
      //break declarations like this down to multiple lines
      Data.home = new Data.location({'state': Census.stateChoiceName, 'county': Census.countyChoiceName, 'city': MortgageData.currentCityChoice, 'homePrice': houseprice, 'income': Data.econIncome, 'poverty': Data.econPoverty});
      Data.storeData(Data.home, isCurrent);
    } else {
      Data.away = new Data.location({'state': Census.destinationStateChoiceName, 'county': Census.destinationCountyChoiceName, 'city': MortgageData.destinationCityChoice, 'homePrice': houseprice, 'income': Data.econIncome, 'poverty': Data.econPoverty});
      Data.storeData(Data.away, isCurrent);
    }
  };

  module.MortgageData = MortgageData;
})(window);
