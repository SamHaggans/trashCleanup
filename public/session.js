$("document").ready(function() {
    var sessionID = String(window.location).split("/").slice(-1)[0];
    $.post('/getsession', {id: sessionID})  
			.always(function(response) {
				if (response.ok) {
                    $(".main").html(response.html);
                    $(".cancel").click(function (){
                        $.post("/cancelSignup", {id: sessionID})
                                .always(function(response) {
                                    if (response.ok) {
                                        location.reload(); 
                                    }
                                });
                    });
                    $(".signup").click(function (){
                        $.post("/sessionSignup", {id: sessionID, position: $(this).attr('id')})
                                .always(function(response) {
                                    if (response.ok) {
                                        location.reload(); 
                                    }
                                });
                    });
                    $(".attendanceButton").click(function (){
                        location.href = `${sessionID}/attendance`;
                    });
				}
            });
});
