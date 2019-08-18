$("document").ready(function() {
    $("#logout").click(function() {
        $.post('/logout')  
            .always(function(response) {
                if (response.ok) {
                    $(".main").html("Signed out");
                    $.get('/headerfile').always(function(response) {
                        $(".header").html(response);
                    }).then(function() {
                        $(".logo").click(function(){
                            window.location.href = '/';
                        });
                    
                        window.scrollTo(0,0);
                        $(".link").click(function(){
                        var linkLocation = $(this).html().replace(/ /g, "-").toLowerCase();
                        if (!(linkLocation == "home")) {
                            window.location = "/"+linkLocation;
                        }
                        else {
                            window.location = "/";
                        }
                        });
                        $(".link").hover(function(){
                        if ($(this).css("backgroundColor") == "rgba(0, 0, 0, 0)"){
                            $(this).css("backgroundColor","rgb(200,200,200)");
                        }
                        else{
                            $(this).css("backgroundColor","rgba(0, 0, 0, 0)");
                        }});
                    });
                     
                }
                else {
                    $(".main").html("Something went wrong. Were you logged in?"); 
                    $.get('/headerfile').always(function(response) {
                        $(".header").html(response);
                    }).then(function() {
                        $(".logo").click(function(){
                            window.location.href = '/';
                        });
                    
                        window.scrollTo(0,0);
                        $(".link").click(function(){
                        var linkLocation = $(this).html().replace(/ /g, "-").toLowerCase();
                        if (!(linkLocation == "home")) {
                            window.location = "/"+linkLocation;
                        }
                        else {
                            window.location = "/";
                        }
                        });
                        $(".link").hover(function(){
                        if ($(this).css("backgroundColor") == "rgba(0, 0, 0, 0)"){
                            $(this).css("backgroundColor","rgb(200,200,200)");
                        }
                        else{
                            $(this).css("backgroundColor","rgba(0, 0, 0, 0)");
                        }});
                    });
                }
            });
    });
});