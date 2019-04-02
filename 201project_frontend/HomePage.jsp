<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
	<head>
		<link rel="stylesheet" type="text/css" href="home_page.css">
		<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>Home Page</title>
		<style>
			
		
		</style>
		
		<script>
			function myFunction() {
			  var x = document.getElementById("myTopnav");
			  if (x.className === "topnav") {
			    x.className += " responsive";
			  } else {
			    x.className = "topnav";
			  }
			  alert("here");
			}
			
		
		</script>		
	</head>
	
	<body>
		<div class="topnav" id="myTopnav">
		  <a href="HomePage.jsp" class="active">Home</a>
		  <a href="home_page.css">Login</a>
		  <a href="#contact">Register</a>
		  <a href="#about">Rules</a>
		  <a href="javascript:void(0);" class="icon" onclick="myFunction()">
		    <i class="fa fa-bars">testing</i>
		  </a>
		</div>
		
		<div style="padding-left:16px">
		  <h2>Responsive Topnav Example</h2>
		  <p>Resize the browser window to see how it works.</p>
		</div>
	</body>
</html>