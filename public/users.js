$("document").ready(function() {
	$.post('/getusers')
		.always(function(response) {
			if (response.ok) {
				$(".main").html(response.html);
			}
		});
});