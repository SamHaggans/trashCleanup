$("document").ready(function() {
    $(".logout").html("<div class = 'okAlert'>Logging Out ...</div>");
	$.post('/logout')  
		.always(function(response) {
			if (response.ok) {
				$(".logout").html("<div class = 'okAlert'>Logged Out Successfully</div>");
				$.get('/headerfile').always(function(response) {
					$(".header").html(response);
				});
			}
			else {
				$(".logout").html("<div class = 'badAlert'>Something Went Wrong. Were you logged in?</div>"); 
				$.get('/headerfile').always(function(response) {
					$(".header").html(response);
				});
			}
		});
});
