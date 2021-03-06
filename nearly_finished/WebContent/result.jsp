<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Result</title>
        <link rel="icon" href="./assets/favicon.png">
        <link rel="stylesheet" type="text/css" href="result.css">
        <%
        	String username = (String) session.getAttribute("username");
        	String gameEndType = (String) session.getAttribute("gameEndType");
        	String win = (String) session.getAttribute("win");
        	String lose = (String) session.getAttribute("lose");
        	String totalGame = (String) session.getAttribute("totalGame");
        	
        	// DEBUG
        	gameEndType = "win";
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
            <button onclick="displayProfile()" id="button">View your stats</button>
            <div id="profile" style="visibility: hidden;">
				Total Game: <%= totalGame %> <br />
				Win: <%= win %> <br />
				Lose: <%= lose %>
            </div>
        </div>
    </body>
</html>