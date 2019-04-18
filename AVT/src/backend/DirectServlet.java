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

/**
 * Servlet implementation class DirectServlet
 */
@WebServlet("/DirectServlet")
public class DirectServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static final String PASSWORD = "";
	private Connection conn;
       
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException 
	{
		//System.out.println("sb");
		String temp = request.getParameter("gameID");
		int gameID = Integer.parseInt(temp);
		conn = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		
		response.setContentType("text/html");
		PrintWriter out = response.getWriter();
		
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/FinalProject?user=root&password=" + PASSWORD + "&useSSL=false" + "&serverTimezone=UTC"); 

			synchronized (conn) {
				ps = conn.prepareStatement("SELECT * FROM Game WHERE realGameID = ?" );
				ps.setInt(1,gameID);
				rs = ps.executeQuery();
				if(rs.next())
				{
					int index = rs.getInt("count");
					//System.out.println(index);
					if (index >= 3) {
						out.println("error");
						return;
					}
					int toChange = index+1;
					ps.close();
					rs.close();
					ps = conn.prepareStatement("UPDATE Game SET count = ? WHERE realGameID = ?");
					ps.setInt(1, toChange);
					ps.setInt(2,gameID);
					request.setAttribute("Index",toChange);
					ps.executeUpdate();
					
					out.println(toChange);
				}
				else
				{
					ps.close();
					request.setAttribute("Index", 0);
					ps = conn.prepareStatement("INSERT INTO Game (realGameID,count) VALUES(?,?)");
					ps.setInt(1, gameID);
					ps.setInt(2, 0);
					ps.executeUpdate();
					
					out.println(0);
				}
				if(ps!=null)
				{
					ps.close();
				}
			}
			
		}
		catch(ClassNotFoundException cnfe)
		{
			System.out.println("cnfe "+ cnfe.getMessage());
		}
		catch(SQLException sqle)
		{
			System.out.println("sqle "+ sqle.getMessage());
		}
		
	}

	
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}
