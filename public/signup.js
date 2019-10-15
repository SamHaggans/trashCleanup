$("document").ready(function() {
	$("#signup").click(function(){
		var name = $('input[name=user]').val();
		var pass = $('input[name=password]').val();
		var email = $('input[name=email]').val();
		$.post('/signup', { email: email, name: name, pass: pass })  
			.always(function(response) {
                if (response.ok) {
				    $(".alertSpace").html(`<div class = "okAlert">Account Created. You can now <a href = '/login'>Log In</a></div>`);
                }
                else if (!response.ok && response.error == "emailReuse") {
                    $(".alertSpace").html(`<div class = "badAlert">An account with that email already exists. You should <a href = '/login'>Log In</a></div>`);
                }
            });
	});
});
