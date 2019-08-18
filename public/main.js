$("document").ready(function() {
	$.get('/headerfile').always(function(response) {
		$(".header").html(response);
	}).then(function() {
		$(".logo").click(function(){
			window.location.href = '/';
		  });
	
		window.scrollTo(0,0);
		$(".link").click(function(){
		  var linkLocation = $(this).html().replace(/ /g, "-").toLowerCase();
		  if (!(linkLocation == "home")) {
			window.location = "/"+linkLocation;
		  }
		  else {
			window.location = "/";
		  }
		});
		$(".link").hover(function(){
		  if ($(this).css("backgroundColor") == "rgba(0, 0, 0, 0)"){
			$(this).css("backgroundColor","rgb(200,200,200)");
		  }
		  else{
			$(this).css("backgroundColor","rgba(0, 0, 0, 0)");
		  }});
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
