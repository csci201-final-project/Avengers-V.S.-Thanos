<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>

<%

	int index = (Integer)request.getAttribute("Index");
	String username = (String)request.getAttribute("username");

%>

<html>
	<head>
		<meta charset="UTF-8">
		<title>Player Test</title>
	</head>
	
	<body>
	
		<div id = "Player">
			<h1 id = "Index"></h1>
		</div>
		<textarea id = "textarea" rows = "20" cols = "40">
		
		</textarea>
		<button onclick = "sendMessage()"> 
		Send
		</button>
		
		<script>
		var socket = new WebSocket("ws://localhost:8080/FinalProject_Connection/server");
		var index = <%=index %>;
		document.getElementById("Index").innerHTML = index;
		var username = <%=username %>;
        // Overwrite same function as server, asynchronous
        socket.onopen = function(event) {
            console.log("Connection established.");
        }
     	socket.onmessage = function(event) {
            console.log("Msg received: ", event.data);

        }
        socket.onclose = function(event) {
            console.log("Connection lost.");
        }
        socket.onerror =function (event)
        {
        	console.log("Error occurred.");
        }

		</script>
		
	</body>
	
		<script>
			function sendMessage()
			{
				var json = document.getElementById("textarea").value;
				socket.send(json);
				console.log("I send message:");
				console.log(json);
			}
		</script>
	
</html>