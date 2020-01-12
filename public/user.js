$("document").ready(function() {
    var userid = String(window.location).split("/").slice(-1)[0];
	$.post('/getusery', {id: userid})
		.always(function(response) {
			if (response.ok) {
                $(".main").html(response.html);
                $("#become").click(function() {
                    $.post('/becomeuser', {id: String(window.location).split("/").slice(-1)[0]})
                    .always(function(response) {
                        if (response.ok) {
                            $(".alertSpace").html(`<div class = "okAlert">Signed in as ${response.name}`);
                        }
                        else {
                            $(".alertSpace").html(`<div class = "badAlert">Something went wrong`);
                        }
                    })
                })
			}
        });
});