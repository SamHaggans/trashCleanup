$("document").ready(function() {
    $("#adduser").click(function(){
        var name = $('input[name=user]').val();
        var pass = $('input[name=password]').val();
        var email = $('input[name=email]').val();
        $.post('/signup', { email: email, name: name, pass: pass })  
            .always(function(response) {
                //alert("Success: " + response.ok);
            });
    });
});