<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>Select Game Room</title>
		<link rel="icon" href="./assets/favicon.png">
		<link rel="stylesheet" type="text/css" href="roomSelect.css">
		<style>
			
		</style>
		<%
			String username = request.getParameter("username");
			String isGuest = request.getParameter("guest");
		%>
		<script>
			function validate() {
				var gameID = document.myform.gameID.value;
				if (gameID == null || gameID.length == 0) {
					document.getElementById("error").innerHTML = "Invalid room ID";
					return false;
				}
				
				var xhttp = new XMLHttpRequest();
				xhttp.open("GET", "DirectServlet?gameID=" + gameID, true);
				
				xhttp.onreadystatechange = function(){
					if(this.readyState === 4 && this.status === 200){
						var playerID = this.responseText;
						// Checks if room is full
						var username = "<%= username %>";
						alert("playerID: " + playerID);
						alert("username: " + username);
						if(playerID === "1"){
							document.myform.action = "./game-room.html?gameID=" + gameID + "&playerID=" + playerID + "&username=" + username;
							document.myform.method = "GET";
							document.myform.submit(); 
							alert("here3");
						}
						if (playerID.length > 3) {
							document.getElementById("error").innerHTML = "Room is already full";
							alert("here1");
						}
						else{
							window.location.href = "./game-room.html?gameID=" + gameID + "&playerID=" + playerID + "&username=" + username;
							alert("here2");
						}
					}
					
				} 
				
				xhttp.send();
					
				return false;
			}
		</script>
	</head>
	<body>
		<div class="background"></div>
		<div class="center-text">
			<div class="form-div">
				<%
				System.out.println(isGuest);
				if (isGuest == null || isGuest.length() == 0) {
				%>
				<form class="form" method="GET" name="myform" onSubmit="return validate()">
					Enter Game Room ID:<br />
					<input type="text" name="gameID" class="input-box" placeholder="Game ID"><br />
					<div id="error">&nbsp;</div>
					<button class="button" type="submit" name="submit">TO BATTLE!</button>
				</form>
				<%
				}
				else {
				%>
				<form class="form" method="GET" name="myform" action="guest.jsp">
					Enter Game Room ID:<br />
					<input type="text" name="gameID" class="input-box" placeholder="Game ID"><br />
					<div id="error">&nbsp;</div>
					<button class="button" type="submit" name="submit">TO BATTLE!</button>
				</form>
				<%
				}
				%>
			</div>
		</div>
	</body>
</html>