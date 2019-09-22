$("document").ready(function() {
	$.post('/getsessionslist')  
			.always(function(response) {
				if (response.ok) {
					 $(".sessionsList").html(response.html);
					 $(".sessionCard").click(function() {
						window.location.href = "/session/"+$(this).attr('id');
					});
				}
			});
			
});
