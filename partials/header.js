$("document").ready(function () {
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
	}
	});
});