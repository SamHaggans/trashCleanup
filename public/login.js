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
					});
				}
				else {
					$(".main").html("Incorrect email/password combination"); 
					$.get('/headerfile').always(function(response) {
						$(".header").html(response);
					});
				}
			});
	});
});
