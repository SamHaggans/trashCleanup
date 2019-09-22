$("document").ready(function() {
	$.post('/logout')  
		.always(function(response) {
			if (response.ok) {
				$(".logout").html("You have been signed out of your account");
				$.get('/headerfile').always(function(response) {
					$(".header").html(response);
				});
			}
			else {
				$(".logout").html("Something went wrong. Were you logged in?"); 
				$.get('/headerfile').always(function(response) {
					$(".header").html(response);
				});
			}
		});
});
