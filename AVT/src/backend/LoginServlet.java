package backend;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet("/LoginServlet")
public class LoginServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static final String PASSWORD = "";
	private Connection conn;
       
    public LoginServlet() {
        super();
    }

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		conn = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		String type = request.getParameter("type");
		String username = request.getParameter("username");
		String password = request.getParameter("password");
		
		
		String msg = "";
		
		if (username.length() == 0 || password.length() == 0) {
			msg = "Invalid username";
			response.setContentType("text/html");
			PrintWriter out = response.getWriter();
			out.print(msg);
			return;
		}
		
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/FinalProject?user=root&password=" + PASSWORD + "&useSSL=false" + "&serverTimezone=UTC"); 
	
			synchronized (conn) {
				if (type.contentEquals("login")) {
					ps = conn.prepareStatement("SELECT * FROM User WHERE username=?");
					ps.setString(1, username);
					rs = ps.executeQuery();
					
					if (rs.next()) {
						String storedPassword = rs.getString("password");
						
						if (!storedPassword.contentEquals(password)) {
							msg = "Incorrect password.";
						} else {
							HttpSession session = request.getSession();
							session.setAttribute("username", username);
						}
					} else {
						msg = "This user does not exist.";
					}
				} else {
					ps = conn.prepareStatement("SELECT * FROM User WHERE username=?");
					ps.setString(1, username);
					rs = ps.executeQuery();
					
					if (rs.next()) {
						msg = "This username is already taken.";
					} else {
						HttpSession session = request.getSession();
						session.setAttribute("username", username);
						
						if (ps != null) ps.close();
						if (rs != null) rs.close();
						
						ps = conn.prepareStatement("INSERT INTO User (username, password) VALUES (?, ?);");
						ps.setString(1, username);
						ps.setString(2, password);
						ps.executeUpdate();
					}
				}
			}
				
		} catch (SQLException sqle) {
			System.out.println("sqle: " + sqle.getMessage());
		} catch (ClassNotFoundException cnfe) {
			System.out.println("cnfe: " + cnfe.getMessage());
		} finally {  // close connection
			try {
				if (rs != null)
					rs.close();
				if (ps != null)
					ps.close();
				if (conn != null)
					conn.close();
			} catch (SQLException sqle) {
				System.out.println("sqle closing stuff: " + sqle.getMessage());
			}
		}
		response.setContentType("text/html");  // Allows us to send html, css, js
		PrintWriter out = response.getWriter();
		out.print(msg);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}
