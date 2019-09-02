$("document").ready(function() {
	$.post('/gethours')  
			.always(function(response) {
				if (response.ok) {
					 $(".totalHours").html(response.hours);
				}
			});
	$.post('/getsessions')  
			.always(function(response) {
				if (response.ok) {
					console.log(response.html);
						$(".sessions").html(response.html);
				}
			});
});
