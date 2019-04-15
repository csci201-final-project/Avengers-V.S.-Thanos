package backend;

import java.util.Vector;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import org.json.JSONObject;

@ServerEndpoint (value="/server")
public class ServerSocket {

	// For every connection ServerSocket is instantiated
	// This session is same as socket
	private static Vector<Session> sessionVector = new Vector<Session>();
	private static Vector<Game> gameVector = new Vector<Game>();
	
	@OnOpen
	public void open(Session session) {
		// Tomcat will create a thread for each connection
		System.out.println("Connection made!");
		sessionVector.add(session);
	}
	
	@OnMessage
	public void onMessage(String message, Session session) {
		/* DEBUG */
		System.out.println("Message received: " + message);
		
		
		JSONObject obj = new JSONObject(message);
        String type = obj.getString("TYPE");
        if(type.contentEquals("NEWGAME"))
        {
        	//System.out.println("In Game Constructor");
        	int gameID = obj.getInt("GAMEID");
        	String username = obj.getString("USERNAME");
        	gameVector.add(new Game(gameID, username,session));		
        }
        
        else if(type.contentEquals("CONNECTION"))
        {
        	//System.out.println("In Connection.");
        	int gameID = obj.getInt("GAMEID");
        	String username = obj.getString("USERNAME");
        	//System.out.println(username);
        	for(int i=0;i<gameVector.size();i++)
        	{
        		if(gameVector.get(i).getGameID()==gameID)
        		{
        			//System.out.println(gameID);
        			//System.out.println(i);
        			gameVector.get(i).addSessions(session);
        			gameVector.get(i).addPlayer(username);
        			break;
        		}
        	}
        }
        
		else 
		{
			int gameID = obj.getInt("GAMEID");
			for(int i=0;i<gameVector.size();i++)
        	{
        		if(gameVector.get(i).getGameID()==gameID)
        		{
        			System.out.println("Here!");
        			System.out.println(message);
        			gameVector.get(i).play(message);
        			break;
        		}
        	}
		}
		
        
	}
	
	@OnClose
	public void close(Session session) {
		System.out.println("Disconnect!");
		sessionVector.remove(session);
	}
	
	@OnError
	public void error(Throwable error) {
		System.out.print("Error!");
		System.out.println(error + error.getMessage());
	}
		
}

