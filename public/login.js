$("document").ready(function() {
	$("#adduser").click(function(){
		var pass = $('input[name=password]').val();
		var email = $('input[name=email]').val();
		$.post('/login', { email: email, pass: pass })  
			.always(function(response) {
				if (response.signIn) {
				   $(".main").html("Signed in as "+response.uName);
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
				}
				else {
					$(".main").html("Incorrect email/password combination"); 
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
				}
			});
	});
});
