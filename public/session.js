$("document").ready(function() {
    var sessionID = String(window.location).split("/").slice(-1)[0];
    $.post('/getsession', {id: sessionID})  
			.always(function(response) {
				if (response.ok) {
					 $(".main").html(response.html);
				}
			});
});
