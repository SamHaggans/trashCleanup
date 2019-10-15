$("document").ready(function() {
	$.post('/logout')  
		.always(function(response) {
			if (response.ok) {
				$(".logout").html("<div class = 'okAlert'>Signed Out Successfully</div>");
				$.get('/headerfile').always(function(response) {
					$(".header").html(response);
				});
			}
			else {
				$(".logout").html("<div class = 'badAlert'>Something Went Wrong. Were you signed in?</div>"); 
				$.get('/headerfile').always(function(response) {
					$(".header").html(response);
				});
			}
		});
});
