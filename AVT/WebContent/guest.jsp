<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>JSON Monitor</title>
        <link rel="stylesheet" type="text/css" href="home_page.css">
        <link rel="icon" href="./assets/favicon.png">
        <style>
            #scrollable {
                width: 60%;
                height: 80%;
                overflow: scroll;
            }
        </style>
        <script>
	        function get(name){
	            if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
	                return decodeURIComponent(name[1]);
	        };
            var hostURL = window.location.host;
            var socket = new WebSocket("ws://" + hostURL + "/AVT/server");

            this.socket.onopen = function(event) {
                console.log("Connection established.");

                var tempObj = {};
                tempObj.TYPE = "GUEST";
                tempObj.GAMEID = parseInt(get("gameID"));
                socket.send(JSON.stringify(tempObj));
            }
            this.socket.onmessage = function(event) {
                console.log("Msg received: ", event.data);

                document.getElementById("scrollable").innerHTML += JSON.stringify(event.data) + "<br />";
            }
            this.socket.onclose = function(event) {
                console.log("Connection lost.");
            }
        </script>
    </head>
    <body>
        <div class="topnav" id="myTopnav">
            <a href="login.jsp" class="active">Login to play</a>
            <a href="roomSelect.jsp">Choose another game</a>
        </div>
        <h1>JSON Monitor for "Avengers v.s. Thanos"</h1>
        <pre id="scrollable">
        </pre>
    </body>
</html>