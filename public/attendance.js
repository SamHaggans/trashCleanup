$("document").ready(function() {
    var sessionID = String(window.location).split("/").slice(-2)[0];
    $.post('/getattendance', {id: sessionID})  
			.always(function(response) {
				if (response.ok) {
                    $(".attendeesList").html(response.html);
                    $(".attendee").click(function (){

                        if ($(this).hasClass("attendeePresent")) {
                            $(this).removeClass("attendeePresent");
                        }
                        else {
                            $(this).addClass("attendeePresent");
                        }
                    });
                    $(".submitAttendance").click(function(){
                        var presentAttendees = [];
                        $(".attendeePresent").each(function() {
                            presentAttendees.push(Number($(this).attr('id')));
                        });
                        $.post('/takeattendance', {id: sessionID, present: presentAttendees})
                                .always(function(response) {
                                    if (response.ok) {
                                        window.location.href = `/session/${sessionID}`;
                                    }
                                });
                    });
				}
            });
});
