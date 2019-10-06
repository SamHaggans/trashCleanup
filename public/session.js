$("document").ready(function() {
    var sessionID = String(window.location).split("/").slice(-1)[0];
    $.post('/getsession', {id: sessionID})  
			.always(function(response) {
				if (response.ok) {
                    $(".main").html(response.html);
                    $(".redButton").click(function (){
                        $.post("/cancelSignup", {id: sessionID})
                                .always(function(response) {
                                    if (response.ok) {
                                        location.reload(); 
                                    }
                                });
                    });
                    $(".greenButton").click(function (){
                        $.post("/sessionSignup", {id: sessionID})
                                .always(function(response) {
                                    if (response.ok) {
                                        location.reload(); 
                                    }
                                });
                    });
				}
            });
});
