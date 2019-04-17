package csci201;

import java.io.IOException;
import java.util.Vector;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

@ServerEndpoint (value="/server_null")
public class ServerSocket {

	// For every connection ServerSocket is instantiated
	// This session is same as socket
	private static Vector<Session> sessionVector = new Vector<Session>();
	
	@OnOpen
	public void open(Session session) {
		// Tomcat will create a thread for each connection
		System.out.println("Connection made!");
		sessionVector.add(session);
	}
	
	@OnMessage
	public void onMessage(String message, Session session) {
//		System.out.println("Message received: " + message);
//		for (Session s : sessionVector) {
//			try {
//				s.getBasicRemote().sendText(message);
//			} catch (IOException ioe) {
//				System.out.println("ioe: " + ioe.getMessage());
//			}
//		}
		
		
		System.out.println("Message received: " + message);
		if (message.contentEquals("request")) {
			String js = "{\n" + 
					"    \"ATTACK\": [\n" + 
					"        2,\n" + 
					"        4,\n" + 
					"        4,\n" + 
					"        3\n" + 
					"    ],\n" + 
					"    \"CHARACTER\": [\n" + 
					"        \"Thor\",\n" + 
					"        \"ScarletWitch\",\n" + 
					"        \"Thanos\",\n" + 
					"        \"DoctorStrange\"\n" + 
					"    ],\n" + 
					"    \"STONE\": [\n" + 
					"        [\"SoulStone\"],\n" + 
					"        [],\n" + 
					"        [],\n" + 
					"        []\n" + 
					"    ],\n" + 
					"    \"TYPE\": \"GAMESTART\",\n" + 
					"    \"HANDCARD\": [\n" + 
					"        [\n" + 
					"            \"ATTACK\",\n" + 
					"            \"ATTACK\",\n" + 
					"            \"STEAL\"\n" + 
					"        ],\n" + 
					"        [\n" + 
					"            \"STEAL\",\n" + 
					"            \"DODGE\",\n" + 
					"            \"STEAL\",\n" + 
					"            \"STEAL\"\n" + 
					"        ],\n" + 
					"        [\n" + 
					"            \"ATTACK\",\n" + 
					"            \"DODGE\",\n" + 
					"            \"STEAL\",\n" + 
					"            \"UNDEFEATABLE\",\n" + 
					"            \"ATTACK\"\n" + 
					"        ],\n" + 
					"        [\n" + 
					"            \"DODGE\",\n" + 
					"            \"DODGE\",\n" + 
					"            \"STEAL\",\n" + 
					"            \"UNDEFEATABLE\"\n" + 
					"        ]\n" + 
					"    ],\n" + 
					"    \"BLOOD\": [\n" + 
					"        6,\n" + 
					"        4,\n" + 
					"        14,\n" + 
					"        5\n" + 
					"    ]\n" + 
					"}";
			for (Session s : sessionVector) {
				if (s == session) {
					try {
						s.getBasicRemote().sendText(js);
					} catch (IOException ioe) {
						System.out.println("ioe: " + ioe.getMessage());
					}
				}
			}
		}
		if (message.contentEquals("turnstart")) {
			String jsonStr = "{\n" + 
					"    \"AVAILABLECARDS\": [\n" + 
					"        0,\n" + 
					"        2,\n" + 
					"        4\n" + 
					"    ],\n" + 
					"    \"INDEX\": 2,\n" + 
					"    \"STONE\": [\"TimeStone\"],\n" + 
					"    \"TYPE\": \"TURNSTART\",\n" + 
					"    \"HANDCARD\": [\n" + 
					"        \"ATTACK\",\n" + 
					"        \"DODGE\",\n" + 
					"        \"STEAL\",\n" + 
					"        \"UNDEFEATABLE\",\n" + 
					"        \"ATTACK\",\n" + 
					"        \"UNDEFEATABLE\"\n" + 
					"    ]\n" + 
					"}";
			for (Session s : sessionVector) {
				if (s == session) {
					try {
						s.getBasicRemote().sendText(jsonStr);
					} catch (IOException ioe) {
						System.out.println("ioe: " + ioe.getMessage());
					}
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
		System.out.println("Error!");
	}
		
}
