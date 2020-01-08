$("document").ready(function() {
	$("#login").click(function(){
		var pass = $('input[name=password]').val();
		var email = $('input[name=email]').val();
		$.post('/login', { email: email, pass: pass })  
			.always(function(response) {
				if (response.signIn) {
                   $(".alertSpace").html(`<div class = "okAlert">Signed in as ${response.uName}</div>`);
                   $(".main").html("");
				   $.get('/headerfile').always(function(response) {
					$(".header").html(response);
					});
				}
				else {
					$(".alertSpace").html(`<div class = "badAlert">Incorrect Email/Password combination</div>`);
					$.get('/headerfile').always(function(response) {
						$(".header").html(response);
					});
				}
			});
	});
});
