<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
	<head>
		<link rel="stylesheet" type="text/css" href="home_page.css">
		<link rel="stylesheet" type="text/css" href="login.css">
		<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>Login</title>
		<link rel="icon" href="./assets/favicon.png">
		<style>
			
		
		</style>
		
		<script>
			function validateForm() {
				return true;
			}
			
		
		</script>		
	</head>
	
	<body>
		<div class="topnav" id="myTopnav">
		  <a href="login.jsp" class="active">Login</a>
		  <a href="register.jsp">Register</a>
		  <a href="rules.jsp">Rules</a>
		</div>
		
		<div style="padding-left:16px">
		 	<div class="form animated flipInX">
			  <h2>Welcome To The Avengers</h2>
			  <form method="GET" action="./roomSelect.jsp" onSubmit="return validateForm()">
			    <input placeholder="Username" type="text" name="username"></input>
			    <input placeholder="Password" type="password" name="password"></input>
			<button>Login</button>
			</form>
			</div>
		</div>
	</body>
</html>