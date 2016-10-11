(function(module) {
  var cityController = {};

  cityController.reveal = function(cityObj) {
    $('div').not('.hero, .icon-menu').hide();
    $('.city-comparison-page').show();
    $('li').show();
    //be more specific thatn "li"
    //then update all the other controllers
    $('#city-link').parent().hide();
    $('.hero').text('City Comparisons').animate({fontSize: '3em'}, 800);
  };

  module.cityController = cityController;
})(window);
