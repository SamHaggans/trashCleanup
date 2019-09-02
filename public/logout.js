$("document").ready(function() {
	$("#logout").click(function() {
		$.post('/logout')  
			.always(function(response) {
				if (response.ok) {
					$(".main").html("Signed out");
					$.get('/headerfile').always(function(response) {
						$(".header").html(response);
					});
				}
				else {
					$(".main").html("Something went wrong. Were you logged in?"); 
					$.get('/headerfile').always(function(response) {
						$(".header").html(response);
					});
				}
			});
	});
});
