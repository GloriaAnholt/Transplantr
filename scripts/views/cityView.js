/* This script holds all of the logic for rendering the various parts of the
city 'page' -- city, income, mortgage, rental, CPI, etc.
 */


var cityView = {};

cityView.handleEcon = function(econObj, isCurrent) {
  if(isCurrent){
    $('#county-econ').hide().html(econObj.createCurrentEconHtml()).fadeIn('slow');
  }
  else{
    $('#destination-econ').hide().html(econObj.createDestinationEconHtml()).fadeIn('slow');
  }
};

cityView.handleIncomeNeededData = function() {
  //try to choose either dashes or underscores for your ids.
  $('#income_needed_median').html('Equivalent Income: <b>$' + Census.incNeeded + '</b>');
  $('#housing-diff-percent').html('House Price Change: <b>' + Census.housingDiffPercent + '%</b>');
  $('#dest-income_to_mortgage').html('Equivalent Income: <b>$' + Census.incNeededHomePrice + '</b>');
  $('#curr_state_rent_percent').html('Rent as % of Current Income: <b>' + Census.stateCurRentPercent + '%</b>');
  $('#dest_state_rent_percent').html('Expected Rent as % of Income: <b>' + Census.stateDestRentPercent + '%</b>');
};

cityView.handleIncome = function(incomeObj) {
  $('#user_income').html('Your Income: <b>$' + incomeObj + '</b>').fadeIn('slow');
};


cityView.handleMortgage = function(mortgageObj, isCurrent) {
  if(isCurrent) {
    $('#mortgage-data').hide().html(mortgageObj.createCurrentMortgageHtml()).fadeIn('slow');
  } else {
    $('#destination-mortgage-data').hide().html(mortgageObj.createDestinationMortgageHtml()).fadeIn('slow');
  }
};

cityView.handleStateRental = function(stateObj, isCurrent) {
  if(isCurrent) {
    $('#rental-data').hide().html(stateObj.createCurrentStateHtml()).fadeIn('slow');
  } else{
    $('#destination-rental-data').hide().html(stateObj.createDestinationStateHtml()).fadeIn('slow');
  }
};

cityView.handleCityMedianRental = function(cityMedianObj, isCurrent) {
  // If the city they selected doesn't have rental info, clear the html, otherwise update the right side
  //
  // If there's already a p there either way you probably want to modify the contents of that tag rather
  // than completely wiping out the html contents of its parent node.
  if (cityMedianObj && isCurrent) {
    $('#curr_city_median_1bdrm').html('<p>In the city of <b>' + cityMedianObj.City + '</b>:</p>' +
      '<p>Median price (1 bdrm apartment): <b>' + cityMedianObj.Median_1_BR_price + '</b></p>').fadeIn('slow');
    $('#curr_city_median_2bdrm').html('<p>Median price (2 bdrm apartment): <b>' + cityMedianObj.Median_2_BR_price + '</b></p>').fadeIn('slow');
  } else if (cityMedianObj && !isCurrent) {
    $('#dest_city_median_1bdrm').html('<p>In the city of <b>' + cityMedianObj.City + '</b>:</p>' +
      '<p>Median price (1 bdrm apartment): <b>' + cityMedianObj.Median_1_BR_price + '</b></p>').fadeIn('slow');
    $('#dest_city_median_2bdrm').html('<p>Median price (2 bdrm apartment): <b>' + cityMedianObj.Median_2_BR_price + '</b></p>').fadeIn('slow');
  } else if (!cityMedianObj && isCurrent) {
    $('#curr_city_median_1bdrm').html('<p></p>');
    //this probably could have just been an else
  } else if (!cityMedianObj && !isCurrent) {
    $('#dest_city_median_1bdrm').html('<p></p>');
  }
};

cityView.handleCityMeanRental = function(cityMeanObj, isCurrent) {
  // If the city they selected doesn't have rental info, clear the html, otherwise update the right side

  if (cityMeanObj && isCurrent) {
    $('#curr_city_mean_1bdrm').html('<p>Mean price (1 bdrm apartment): <b>' + cityMeanObj.Mean_1_Bdrm_Price + '</b></p>').fadeIn('slow');
  } else if (cityMeanObj && !isCurrent) {
    $('#dest_city_mean_1bdrm').html('<p>Mean price (1 bdrm apartment): <b>' + cityMeanObj.Mean_1_Bdrm_Price + '</b></p>').fadeIn('slow');
  } else if (!cityMeanObj && isCurrent) {
    $('#curr_city_mean_1bdrm').html('<p></p>');
  } else if (!cityMeanObj && !isCurrent) {
    $('#dest_city_mean_1bdrm').html('<p></p>');
  }
};
