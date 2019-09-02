$("document").ready(function() {
	$.get('/headerfile').always(function(response) {
		$(".header").html(response);
	});
});
	

	document.onscroll = function() {scroll()};
	
	function scroll(){
	  var scrolllength = (Math.round(($(document).scrollTop()/500)*10)/10);
	  if (scrolllength >1){
		scrolllength = 1
	  }
	  $(".header").css("backgroundColor", "rgba(255,255,255,"+scrolllength+0.3+")");
  }

//Jquery to get classlists nicely
$.fn.classList = function() {return this[0].className.split(/\s+/);};
