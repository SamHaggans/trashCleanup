$("document").ready(function() {
	$("#signup").click(function(){
		var name = $('input[name=user]').val();
        var pass = $('input[name=password]').val();
        var passRetype = $('input[name=password-retype]').val();
        var email = $('input[name=email]').val();
        if (name.length > 50) {
            $(".alertSpace").html(`<div class = "badAlert">Sorry, your name needs to be less than 50 characters long.</div>`);
            return;
        }
        if (name.length < 3) {
            $(".alertSpace").html(`<div class = "badAlert">Sorry, that name is too short. Make sure to use your full name for your account.</div>`);
            return;
        }
        if (!validEmail(email)) {
            $(".alertSpace").html(`<div class = "badAlert">Sorry, that email isn't valid. It should be of the format "email@domain.com".</div>`);
            return;
        }
        if (passRetype != pass) {
            $(".alertSpace").html(`<div class = "badAlert">Sorry, those passwords do not match. Please retype them.</div>`);
            return;
        }

        if (pass.length < 9) {
            $(".alertSpace").html(`<div class = "badAlert">Sorry, your password needs to be at least 9 characters long.</div>`);
            return;
        }
        
        
		$.post('/signup', { email: email, name: name, pass: pass })  
			.always(function(response) {
                if (response.ok) {
				    $(".alertSpace").html(`<div class = "okAlert">Account Created. You can now <a href = '/login'>Log In</a></div>`);
                }
                else if (!response.ok && response.error == "valueReuse") {
                    $(".alertSpace").html(`<div class = "badAlert">An account with that email or name already exists. You should <a href = '/login'>Log In</a></div>`);
                }
            });
	});
});

function validEmail(email) {
    return(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}
