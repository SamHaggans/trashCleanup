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
					$(".sessions").html(response.html);
                }
                $(".session").click(function() {
                    window.location.href = "/session/"+$(this).attr('id');
                });
			});
});
