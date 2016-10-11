'use strict';
/* This script holds all of the logic for rendering the various parts of the
city 'page' -- city, income, mortgage, rental, CPI, etc.
 */


var cityView = {};

cityView.handleStateRental = function(stateObj) {
  $('#state-rentals').hide().html(stateObj.createStateHtml()).fadeIn('slow');
};

cityView.handleCityInfo = function(cityObj) {
  $('#city-info').hide().html(cityObj.createCityHtml()).fadeIn('slow');
};
