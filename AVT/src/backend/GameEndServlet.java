package backend;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet("/GameEndServlet")
public class GameEndServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static final String PASSWORD = "";
	private Connection conn;

	public GameEndServlet() {
        super();
    }

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String username = request.getParameter("username");
		String type = request.getParameter("type");
		HttpSession session = request.getSession();
		session.setAttribute("gameEndType", type);
		
		conn = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/FinalProject?user=root&password=" + PASSWORD + "&useSSL=false" + "&serverTimezone=UTC"); 

			synchronized (conn) {
				ps = conn.prepareStatement("SELECT * FROM User WHERE username=?");
				ps.setString(1, username);
				rs = ps.executeQuery();
				
				if (rs.next()) {
					int win = rs.getInt("win");
					int lose = rs.getInt("lose");
					int totalGame = rs.getInt("totalGame");
					totalGame++;
					
					if (type.contentEquals("win")) {
						win++;
					}
					else {
						lose++;
					}
					
					if (ps != null) ps.close();
					if (rs != null) rs.close();
					
					ps = conn.prepareStatement("UPDATE User SET win = ?, lose = ?, totalGame = ? WHERE username = ?");
					ps.setInt(1, win);
					ps.setInt(2,lose);
					ps.setInt(3, totalGame);
					ps.setString(4, username);
					ps.executeUpdate();
					
					session.setAttribute("win", win);
					session.setAttribute("lose", lose);
					session.setAttribute("totalGame", totalGame);
				} else {
					System.out.println("GAMEEND ERROR: user does not exist!");
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
		RequestDispatcher dispatch = getServletContext().getRequestDispatcher("/result.jsp");
		dispatch.forward(request, response);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}
