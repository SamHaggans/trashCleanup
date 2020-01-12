var enabled = true;
$("document").ready(function() {
    $.post('/accountname')
    .always(function (response) {
        $('#accountname').html(response.html);
    })
	$("#change").click(function(){
        if (enabled) {
            
            enabled = false;
            reenable();
            var pass = $('input[name=password]').val();
            var passRetype = $('input[name=password-retype]').val();
            if (passRetype != pass) {
                $(".alertSpace").html(`<div class = "badAlert">Sorry, those passwords do not match. Please retype them.</div>`);
                return;
            }

            if (pass.length < 9) {
                $(".alertSpace").html(`<div class = "badAlert">Sorry, your password needs to be at least 9 characters long.</div>`);
                return;
            }
            var userid;
            $.post("/getuser").always(function(response) {
                userid = response.id;
            
                console.log(userid);
                $.post('/changepassword', { pass: pass, userid: userid})  
                    .always(function(response) {
                        if (response.ok) {
                            $(".alertSpace").html(`<div class = "okAlert">Password Changed.`);
                            $(".main").html("");
                        }
                        else {
                            $(".alertSpace").html(`<div class = "badAlert">Something went wrong. Please try again</div>`);
                        }
                    });
            });
        }
	});
});

function validEmail(email) {
    return(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}


function reenable() {
    return new Promise(async function(resolve, reject) {
        await sleep(5000);
        enabled = true;
        resolve();
    });
}

function sleep(ms) { //Sleep function for pauses between frames
    return new Promise(resolve => setTimeout(resolve, ms));
}