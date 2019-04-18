<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
	<head>
		<link rel="stylesheet" type="text/css" href="home_page.css">
		<link rel="stylesheet" type="text/css" href="login.css">
		<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>Register</title>
		<link rel="icon" href="./assets/favicon.png">
		<style>
			
		
		</style>
		
		<script>
			function validate() {
				var username = document.myform.username.value;
				var password1 = document.myform.password1.value;
				var password2 = document.myform.password2.value;
				var n = password1.localeCompare(password2);
				if (n != 0) {
					document.getElementById("error").innerHTML = "The passwords do not match.";
					return false;
				} else {
					var xhttp = new XMLHttpRequest();
					
					// Send username to servlet
					var para = "LoginServlet?type=register&username=" + username;
					para += "&password=" + password1;
					
					xhttp.open("GET", para, false);
					xhttp.send();
					
					if (xhttp.responseText.length > 0) {
						document.getElementById("error").innerHTML = "This username is already taken.";
						return false;
					}
					return true;
				}
			}
			function redirect() {
				window.location = "roomSelect.jsp?guest=true";
			}
		</script>		
	</head>
	
	<body>
		<div class="topnav" id="myTopnav">
		  <a href="login.jsp">Login</a>
		  <a href="register.jsp" class="active">Register</a>
		  <a href="rules.jsp">Rules</a>
		</div>
		<div style="padding-left:16px">
			<div class="form animated flipInX">
			  	<h2>Welcome To The Avengers</h2>
				  <form method="POST" name="myform" action="./roomSelect.jsp" onSubmit="return validate()">
				    <input placeholder="Username" type="text" name="username"></input>
				    <input placeholder="Password" type="password" name="password1"></input>
				    <input placeholder="Please Enter Password Again" type="password" name="password2"></input>
				    <div id="error" style="text-align:center;">&nbsp</div>
			    	<br />
				<button>Register</button>
				</form>
				<button id="guest-button" onclick="redirect()">Play as guest</button>
			</div>
		</div>
		
	</body>
</html>