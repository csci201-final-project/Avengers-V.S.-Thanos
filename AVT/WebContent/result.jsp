<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Result</title>
        <link rel="icon" href="./assets/favicon.png">
        <link rel="stylesheet" type="text/css" href="home_page.css">
        <link rel="stylesheet" type="text/css" href="result.css">
        <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
		<meta name="viewport" content="width=device-width, initial-scale=1">
        <%
        	String username = (String) session.getAttribute("username");
        	String gameEndType = (String) session.getAttribute("gameEndType");
        	int win = (int) session.getAttribute("win");
        	int lose = (int) session.getAttribute("lose");
        	int totalGame = (int) session.getAttribute("totalGame");
        %>
        <script>
            function displayProfile() {
                var x = document.getElementById("profile");	
                if (x.style.visibility == "hidden") {			 
                    x.style.visibility = "visible";
                    document.getElementById("button").innerHTML = "Hide your stats";
                }
                else {
                    x.style.visibility = "hidden";
                    document.getElementById("button").innerHTML = "View your stats";
                }
            }
        </script>
    </head>
    <body>
        <div class="background"></div>
        <div class="topnav" id="myTopnav">
		  <a href="login.jsp" class="active">Log out</a>
		  <a href="roomSelect.jsp">Start new game</a>
		</div>
        <div class="center-text">
        	<%
        	if (gameEndType.contentEquals("win")) {
        	%>
            	<h2>YOU WIN!!!</h2> 
            <%
        	}
        	else {
            %>
            	<h2>YOU LOSE...</h2>
            <%
        	}
            %>
            <div></div>
            <button onclick="displayProfile()" id="button" class="button">View your stats</button>
            <div id="profile" style="visibility: hidden;">
				Total Game: <%= totalGame %> <br />
				Win: <%= win %> <br />
				Lose: <%= lose %>
            </div>
        </div>
    </body>
</html>