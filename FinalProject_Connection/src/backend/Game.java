package backend;
import java.io.IOException;
import java.util.Collections;
import java.util.Vector;
import java.util.concurrent.ThreadLocalRandom;

import javax.websocket.Session;

import org.json.JSONArray;
import org.json.JSONObject;

public class Game {
	private Vector<Session> allSessions;
	private Vector<Player> allPlayers;
	private Vector<String> userNames;
	private Vector<Guest> allGuests;
	private Vector<Hero> heros;
	private final int handLimit = 7;
	private int gameID;
	public static Vector<Card> allCards;
	private int ThanosID;
	public Game(int gameID,String username,Session session) // Complete, middle also need to add username and session. Tested, OK!
	{
		this.gameID = gameID;
		// a bunch of new
		allPlayers = new Vector<Player>();
		allGuests = new Vector<Guest>();
		userNames = new Vector<String>();
		heros = new Vector<Hero>();
		allCards = new Vector<Card>();
		allSessions = new Vector<Session>();
		this.constructDeck();// construct the card vector and Hero vector
		this.shuffle();
		this.addPlayer(username);
		this.addSessions(session);
		
		/* DEBUG 
		for(int i=0;i<allCards.size();i++)
		{
			System.out.println(allCards.get(i).getName());
		}
		*/
	}
	
	public void start() // assigning heros to players, Complete!! Tested, Ok!
	{
		// create Game Start json and send to front end
		JSONObject jo = new JSONObject();
		jo.put("TYPE","GAMESTART");
		
		//add hero names
		JSONArray ja1 = new JSONArray();
		ja1.put((String)allPlayers.get(0).getHero().getHeorName());
		ja1.put((String)allPlayers.get(1).getHero().getHeorName());
		ja1.put((String)allPlayers.get(2).getHero().getHeorName());
		ja1.put((String)allPlayers.get(3).getHero().getHeorName());
		jo.put("CHARACTER", ja1);
		
		//add hero bloods
		JSONArray ja2 = new JSONArray();
		ja2.put(allPlayers.get(0).getHero().getBlood());
		ja2.put(allPlayers.get(1).getHero().getBlood());
		ja2.put(allPlayers.get(2).getHero().getBlood());
		ja2.put(allPlayers.get(3).getHero().getBlood());
		jo.put("BLOOD", ja2);
		
		//add hero attack
		JSONArray ja3 = new JSONArray();
		ja3.put(allPlayers.get(0).getHero().getAttack());
		ja3.put(allPlayers.get(1).getHero().getAttack());
		ja3.put(allPlayers.get(2).getHero().getAttack());
		ja3.put(allPlayers.get(3).getHero().getAttack());
		jo.put("ATTACK",ja3);
		
		//add hand cards for players
		JSONArray JA1 = new JSONArray();
		for(int j=0;j<4;j++)
		{
			JSONArray temp = new JSONArray();
			Vector<HandCard> tempCard = allPlayers.get(j).getHandCard();
			for(int i=0;i<tempCard.size();i++)
			{
				temp.put(tempCard.get(i).getName());
			}
			JA1.put(temp);
		}
		jo.put("HANDCARD", JA1);
		
		//add stones for players
		JSONArray JA2 = new JSONArray();
		for(int j=0;j<4;j++)
		{
			JSONArray temp = new JSONArray();
			Vector<Stone> tempCard = allPlayers.get(j).getStone();
			for(int i=0;i<tempCard.size();i++)
			{
				temp.put(tempCard.get(i).getName());
			}
			JA2.put(temp);
		}
		jo.put("STONE", JA2);
		
		// Forward the message to all players in this game
    	this.sendMessage(jo);
		
		/*  DEBUG */
		System.out.println("GAMESTART Back-to-Front");
		System.out.println(jo.toString(4));
		System.out.println();
		System.out.println();
	}
	
	
	public void shuffle() // Complete! Tested, OK!
	{
		// shuffle the cards and Heros, create a random Thanos number
		Collections.shuffle(heros);
		Collections.shuffle(allCards);
		ThanosID =  ThreadLocalRandom.current().nextInt(0, 4);
		
	}
	
	private void constructDeck() // Complete! Tested, OK!
	{
		// construct the cards and the heros vectors
		for(int i=0;i<60;i++)
		{
			if(i<15)
			{
				allCards.add(new HandCard("ATTACK"));
			}
			else if(i<30)
			{
				allCards.add(new HandCard("DODGE"));
			}
			else if(i<45)
			{
				allCards.add(new HandCard("STEAL"));
			}
			else
			{
				allCards.add(new HandCard("UNDEFEATABLE"));
			}
		}
		allCards.add(new Stone("PowerStone"));
		allCards.add(new Stone("SoulStone"));
		allCards.add(new Stone("TimeStone"));
		allCards.add(new Stone("MindStone"));
		allCards.add(new Stone("RealityStone"));
		allCards.add(new Stone("SpaceStone"));
		heros.add(new IronMan());
		heros.add(new Hulk());
		heros.add(new ScarletWitch());
		heros.add(new AntMan());
		heros.add(new Thor());
		heros.add(new DoctorStrange());
	}
	
	//send json to the front end(every player) to update
	public void sendMessage(JSONObject jo)
	{
		// Forward the message to all players in this game
    	for(Session session: allSessions)
    	{
    		try {
    			session.getBasicRemote().sendText(jo.toString());
    		}
    		catch(IOException ioe)
    		{
    			System.out.println("IOE in sendMessage: "+ ioe.getMessage());
    		}
    		
    	}
	}
	
	public void addPlayer(String username) // Complete! Tested, OK!
	{
		// if allSession.size() == Thanos ID, assign the player Thanos
		// otherwise create an instance of player by choosing a Hero from Vector (The first one)
		// also need to draw cards
		// if the size of allSession Vector is 4, then call start()
		if(allPlayers.size()==this.ThanosID)
		{
			//System.out.println(username);
			allPlayers.add(new Player(new Thanos(),username));
			for(int i=0;i<5;i++)
			{
				this.drawCards(allPlayers.get(allPlayers.size()-1));
			}
		}
		else
		{
			//System.out.println(username);
			allPlayers.add(new Player(heros.get(allPlayers.size()),username));
			for(int i=0;i<4;i++)
			{
				this.drawCards(allPlayers.get(allPlayers.size()-1));
			}
		}
		
		if(allPlayers.size()==4)
		{
			this.start();
		}
	}
	
	
	public void drawCards(Player p) // Complete! Tested, OK!
	{
		// judge if the stone if a stone or not
		if(p.getHandCard().size()<handLimit)
		{
			if(allCards.get(0).isStone())
			{
				//System.out.println("Called");
				Stone s = (Stone)allCards.remove(0);
				p.addStone(s);
			}
			else
			{
				HandCard c = (HandCard)allCards.remove(0);
				p.addHandCard(c);
				
			}
		}
	}
	
	public void addGuest(Guest g)
	{
		this.allGuests.add(g);
	}
	
	
	public void addSessions(Session s)
	{
		//System.out.println("AddSession In Game");
		allSessions.add(s);
	}

	
	public void play(String json)
	{
		JSONObject obj = new JSONObject(json);
        String type = obj.getString("TYPE");
        // switch to different cases
        //System.out.println("In game");
        if(type.equals("GAMESTART")) // Complete!
        {
        	//send TURN_START to front end
        	//System.out.println("type = gamestart!");
        	JSONObject jo = new JSONObject();
        	jo.put("TYPE","TURNSTART");
        	//record is the current player index, it starts with Thanos by default
        	int record = -1;
        	for(int i=0;i<4;i++)
        	{
        		if(allPlayers.get(i).isDead())
        			continue;
        		else
        		{
        			if(allPlayers.get(i).isThanos())
        			{
        				jo.put("INDEX",i);
        				record = i;
        				break;
        			}
        		}
        	}
        	
        	this.drawCards(allPlayers.get(record));
        	this.drawCards(allPlayers.get(record));
        	Vector<HandCard> cards = allPlayers.get(record).getHandCard();
        	
        	//ja contains handcard
        	JSONArray ja = new JSONArray();
        	for(int i=0;i<cards.size();i++)
        	{
        		ja.put(cards.get(i).getName());
        	}
        	jo.put("HANDCARD",ja);
        	
        	//ja2 contains AVAILABLECARDS cards
        	JSONArray ja2 = new JSONArray();
        	for(int i=0;i<cards.size();i++)
        	{
        		if(cards.get(i).getName().equals("ATTACK")||cards.get(i).getName().equals("STEAL"))
        		{
        			ja2.put(i);
        		}
        	}
        	if(allPlayers.get(record).getSoulStone()) // count for soul stone
        	{
        		for(int i=0;i<cards.size();i++)
            	{
            		if(cards.get(i).getName().equals("DODGE"))
            		{
            			ja2.put(i);
            		}
            	}
        	}
        	jo.put("AVAILABLECARDS", ja2);
        	
        	//ja3 contains stones 
        	JSONArray ja3 = new JSONArray();
        	Vector<Stone> stones = allPlayers.get(record).getStone();
        	for(int i=0;i<stones.size();i++)
        	{
        		ja3.put(stones.get(i).getName());
        	}
        	jo.put("STONE",ja3);
        	
        	// Forward the message to all players in this game
        	this.sendMessage(jo);
        	
        	/* DEBUG */
        	System.out.println("TURNSTART Back-to-Front:");
        	System.out.println(jo.toString(4));
        	System.out.println();
        	System.out.println();
        }
        
        
        else if(type.equals("ATTACK")) 
        {
        	int sourceIndex = obj.getInt("SOURCE");
        	int scardIndex = obj.getInt("CARD");
        	int targetIndex = obj.getInt("TARGET");
        	// find the source and remove the card, add the "SOURCE section to json(INDEX & HANDCARD)"
        	// find the target and give the available cards to front-end (Need to check whether the player has soul stone)
        	// send DODGE to the front end
        	allPlayers.get(sourceIndex).removeHandCard(scardIndex);
        	JSONObject jo = new JSONObject();
        	jo.put("TYPE", "DODGE");
        	JSONObject jo2 = new JSONObject();
        	jo2.put("INDEX",targetIndex);
        	
        	
        	//ja contains availible cards for the targeted player 
        	JSONArray target_vailible = new JSONArray();
        	for(int i=0;i<allPlayers.get(targetIndex).getHandCard().size();i++)
        	{
        		String card = allPlayers.get(targetIndex).getHandCard().get(i).getName();
        		//exchangalbe attack and dodge cards if player equipped mindStone
        		if(allPlayers.get(targetIndex).getSoulStone()) {
        			if(card.equals("ATTACK") || card.equals("DODGE")) 
        				target_vailible.put(i);
        		}
        		else
        		{
        			if(card.equals("DODGE"))
        				target_vailible.put(i);
        		}
        	}
        	jo2.put("AVAILABLECARDS", target_vailible);
        	jo.put("TARGET", jo2);
        	JSONObject jo3 = new JSONObject();
        	jo3.put("INDEX", sourceIndex);
        	
        	//allPlayers.get(sourceIndex).getHandCard().remove(scardIndex);
        	Vector<HandCard> cards = allPlayers.get(sourceIndex).getHandCard();
        	
        	//ja2 contains the handcards for sources player
        	JSONArray source_hand = new JSONArray();
        	for(int i=0;i<cards.size();i++)
        	{
        		source_hand.put(cards.get(i).getName());
        	}
        	jo3.put("HANDCARD", source_hand);
        	jo.put("SOURCE", jo3);
        	
        	// Forward the message to all players in this game
        	this.sendMessage(jo);
        	
        	/* DEBUG */
        	System.out.println("DODGE Back-to-Front:");
        	System.out.println(jo.toString(4));
        	System.out.println();
        	System.out.println();
        }
        

        
        else if (type.equals("DODGE")) //Complete
        {
        	int sourceIndex = obj.getInt("SOURCE");
        	int tcardIndex = obj.getInt("CARD");
        	int targetIndex = obj.getInt("TARGET");
        	//find the target and see whether the tcardIndex is -1
        		// if it is -1, then check for space stone(target), power stone (source) and take damage accordingly
        		// else we remove the card from target 
        		// we create the json for target
        		// Also attach isDead and GAMEND to the json (true/false)
        	
        	// find the source and check for time stone
        		// if the target is killed, then inherits all stones from the target
        		// then send all info 
        	boolean dead = false;
        	JSONObject jo = new JSONObject();
        	jo.put("TYPE", "TAKEDAMAGE");
        	JSONObject jo2 = new JSONObject();
        	jo2.put("INDEX", targetIndex);
        	
        	//if the target has no dodge
        	if(tcardIndex == -1)
        	{
        		int damage = allPlayers.get(sourceIndex).getDamage();
        		allPlayers.get(targetIndex).take_damage(damage);
        		int blood =  allPlayers.get(targetIndex).getHero().getBlood();
        		jo2.put("BLOOD", blood);
        		if(blood<=0)
        		{
        			dead = true;
        			jo2.put("ISDEAD", "TRUE");
        			if(allPlayers.get(targetIndex).isThanos())
        			{
        				jo2.put("GAMEEND","TRUE");
        			}
        			else
        			{
        				int aliveCount = 0;
        				for(int i=0;i<allPlayers.size();i++)
        				{
        					if(!allPlayers.get(i).isDead())
        						aliveCount++;
        				}
        				if(aliveCount == 1)
        				{
        					jo2.put("GAMEEND", "TRUE");
        				}
        				else
        				{
        					jo2.put("GAMEEND","FALSE");
        				}
        			}
        		}
        		else
        		{
        			jo2.put("ISDEAD","FALSE");
        			jo2.put("GAMEEND","FALSE");
        		}
        		
        		JSONArray ja = new JSONArray();
        		for(int i=0;i<allPlayers.get(targetIndex).getHandCard().size();i++)
        		{
        			ja.put(allPlayers.get(targetIndex).getHandCard().get(i).getName());
        		}
        		jo2.put("HANDCARD", ja);
        	}
        	
        	//the target has dodge
        	else
        	{
        		//System.out.println("Target enter dodge's else part!");
        		allPlayers.get(targetIndex).removeHandCard(tcardIndex);
        		System.out.println("Target finishes remove!");
        		int blood =  allPlayers.get(targetIndex).getHero().getBlood();
        		jo2.put("BLOOD", blood);
        		jo2.put("ISDEAD","FALSE");
    			jo2.put("GAMEEND","FALSE");
        		JSONArray ja = new JSONArray();
        		for(int i=0;i<allPlayers.get(targetIndex).getHandCard().size();i++)
        		{
        			ja.put(allPlayers.get(targetIndex).getHandCard().get(i).getName());
        		}
        		jo2.put("HANDCARD", ja);
        	}
        	jo.put("TARGET",jo2);
        	
        	// Now we go to the source player
        	JSONObject jo3 = new JSONObject();
        	jo3.put("INDEX", sourceIndex);
        	if(dead)
        	{	
        		//inherit the dead player's stones
        		for(int i=0;i<allPlayers.get(targetIndex).getStone().size();i++)
        		{
        			allPlayers.get(sourceIndex).addStone(allPlayers.get(targetIndex).getStone().get(i));
        		}
        	}
        	JSONArray ja1 = new JSONArray();
        	for(int i=0;i<allPlayers.get(sourceIndex).getStone().size();i++)
    		{
    			ja1.put(allPlayers.get(sourceIndex).getStone().get(i).getName());
    		}
        	jo3.put("STONE", ja1);
        	
        	//if attacker has timestone, allow him to continue attack, else allow him to steal
        	JSONArray source_availiable = new JSONArray();
        	if(allPlayers.get(sourceIndex).getTimeStone()==false)
        	{
        		allPlayers.get(sourceIndex).setUsedAttack(true);
        		for(int i=0;i<allPlayers.get(sourceIndex).getHandCard().size();i++)
        		{
        			if(allPlayers.get(sourceIndex).getHandCard().get(i).getName().equals("STEAL"))
        			{
        				source_availiable.put(i);
        			}
        		}
        	}
        	else
        	{
        		System.out.println("Has time stone!");
        		System.out.println();
        		System.out.println();
        		for(int i=0;i<allPlayers.get(sourceIndex).getHandCard().size();i++)
        		{	
        			String card = allPlayers.get(sourceIndex).getHandCard().get(i).getName();
        			if(card.equals("STEAL")||card.equals("ATTACK"))
        			{
        				source_availiable.put(i);
        			}
        			//soul stones allows interchangeable attack and dodge
        			if(allPlayers.get(sourceIndex).getSoulStone())
        			{
        				for(int j=0;j<allPlayers.get(sourceIndex).getHandCard().size();j++)
        				{
        					if(card.equals("DODGE"));
        					{
        						source_availiable.put(j);
        					}
        				}
        			}
        		}
        	}
        	jo3.put("AVAILABLECARDS", source_availiable);
        	jo.put("SOURCE",jo3);
        	
        	// Forward the message to all players in this game
        	this.sendMessage(jo);
        	
        	/* DEBUG */
        	System.out.println("TAKEDAMAGE Back-to-Front:");
        	System.out.println(jo.toString(4));
        	System.out.println();
        	System.out.println();
        }
        
        
        else if (type.equals("STEAL")) // Complete
        {
        	int sourceIndex = obj.getInt("SOURCE");
        	int scardIndex = obj.getInt("CARD");
        	int targetIndex = obj.getInt("TARGET");
        	// find the target and check for avail cards
        	// find the source and remove the card that he used
        	// send UNDEFEATABLE to front end
        	JSONObject jo = new JSONObject();
        	jo.put("TYPE", "UNDEFEATABLE");
        	
        	JSONObject jo2 = new JSONObject();
        	jo2.put("INDEX", targetIndex);
        	JSONArray ja = new JSONArray();
        	for(int i=0;i<allPlayers.get(targetIndex).getHandCard().size();i++)
        	{
        		if(allPlayers.get(targetIndex).getHandCard().get(i).getName().equals("UNDEFEATABLE"))
        		{
        			ja.put(i);
        		}
        	}
        	jo2.put("AVAILABLECARDS", ja);
        	jo.put("TARGET", jo2);
        	
        	JSONObject jo3 = new JSONObject();
        	jo3.put("INDEX", sourceIndex);
        	allPlayers.get(sourceIndex).removeHandCard(scardIndex);
        	Vector<HandCard> cards = allPlayers.get(sourceIndex).getHandCard();
        	JSONArray ja2 = new JSONArray();
        	for(int i=0;i<cards.size();i++)
        	{
        		ja2.put(cards.get(i).getName());
        	}
        	jo3.put("HANDCARD", ja2);
        	jo.put("SOURCE", jo3);
        	
        	// Forward the message to all players in this game
        	this.sendMessage(jo);
      
        	/* DEBUG */
        	System.out.println("UNDEFEATABLE Back-to-Front:");
        	System.out.println(jo.toString(4));
        	System.out.println();
        	System.out.println();
        }
        
        
        else if(type.equals("UNDEFEATABLE"))
        {
        	int sourceIndex = obj.getInt("SOURCE");
        	int tcardIndex = obj.getInt("CARD");
        	int targetIndex = obj.getInt("TARGET");
        	// find the target and check whether tcardIndex = -1
        		//if = -1, check for all stones and randomly pick one
        			// if no stone, then pick one hand card
        			// if no stone and no card, set target.index = -1, and nothing will happen(source just loses one card in vain)
        		// else we just remove the card from target
        	
        	// find the source and send cards and stones and avail cards accordingly
        	//send CHANGE_CARD to front end
        	JSONObject jo = new JSONObject();
        	jo.put("TYPE", "CHANGECARD");
        	JSONObject jo2 = new JSONObject();
        	jo2.put("INDEX", targetIndex);
        	if(tcardIndex == -1)
        	{
        		Stone toChangeS = null;
        		HandCard toChangeHC = null;
        		int randomS = -1;
        		int randomHC = -1;
        		int size = allPlayers.get(targetIndex).getStone().size();
        		
        		//if the target has a stone, steal the stone and give it to source
        		if(size!=0)
        		{
        			randomS = ThreadLocalRandom.current().nextInt(0, size);
        			toChangeS = allPlayers.get(targetIndex).getStone(randomS);
        			allPlayers.get(targetIndex).removeStone(randomS);
        			allPlayers.get(sourceIndex).addStone(toChangeS);
        		}
        		else
        		{
        			Vector<HandCard> temp = allPlayers.get(targetIndex).getHandCard();
        			if(temp.size()!=0)
        			{
        				randomHC = ThreadLocalRandom.current().nextInt(0, temp.size());
        				toChangeHC = allPlayers.get(targetIndex).getHandCard(randomHC);
        				allPlayers.get(targetIndex).removeHandCard(randomHC);
        				allPlayers.get(sourceIndex).addHandCard(toChangeHC);
        			}
        		}
        	}
        	else // if undefeatable is done by the target
        	{
        		allPlayers.get(targetIndex).removeHandCard(tcardIndex);
        	}
        	JSONArray target_hand = new JSONArray();
    		for(int i=0;i<allPlayers.get(targetIndex).getHandCard().size();i++)
    		{
    			target_hand.put(allPlayers.get(targetIndex).getHandCard().get(i).getName());
    		}
    		JSONArray target_stone = new JSONArray();
    		for(int i=0;i<allPlayers.get(targetIndex).getStone().size();i++)
    		{
    			target_stone.put(allPlayers.get(targetIndex).getStone().get(i).getName());
    		}
    		jo2.put("HANDCARD", target_hand);
    		jo2.put("STONE", target_stone);
    		jo.put("TARGET",jo2);
    		
    		// Now we go to the source player
    		JSONObject source = new JSONObject();
    		JSONArray source_hand = new JSONArray();
    		for(int i=0;i<allPlayers.get(sourceIndex).getHandCard().size();i++)
    		{
    			source_hand.put(allPlayers.get(sourceIndex).getHandCard().get(i).getName());
    		}
    		JSONArray source_stones = new JSONArray();
    		for(int i=0;i<allPlayers.get(sourceIndex).getStone().size();i++)
    		{
    			source_stones.put(allPlayers.get(sourceIndex).getStone().get(i).getName());
    		}
    		source.put("HANDCARD", source_hand);
    		source.put("STONE", source_stones);
    		JSONArray source_availiable = new JSONArray();
    		for(int i=0;i<allPlayers.get(sourceIndex).getHandCard().size();i++)
    		{
    			if(allPlayers.get(sourceIndex).getHandCard().get(i).getName().equals("STEAL"))
    			{
    				source_availiable.put(i);
    			}
    		}
    		if(allPlayers.get(sourceIndex).usedAttack()==false)
    		{
    			for(int i=0;i<allPlayers.get(sourceIndex).getHandCard().size();i++)
    			{
    				if(allPlayers.get(sourceIndex).getHandCard().get(i).getName().equals("ATTACK"))
    				{
    					source_availiable.put(i);
    				}
    			}
    			if(allPlayers.get(sourceIndex).getSoulStone()==true)
    			{
    				for(int j=0;j<allPlayers.get(sourceIndex).getHandCard().size();j++)
    				{
    					if(allPlayers.get(sourceIndex).getHandCard().get(j).getName().equals("DODGE"));
    					{
    						source_availiable.put(j);
    					}
    				}
    			}
    		}
    		source.put("AVAILABLECARDS", source_availiable);
    		jo.put("SOURCE", source);
    		
    		// Forward the message to all players in this game
        	this.sendMessage(jo);
    		
    		/* DEBUG */
        	System.out.println("CHANGECARD Back-to-Front:");
        	System.out.println(jo.toString(4));
        	System.out.println();
        	System.out.println();
        	
        }
        
        
        else if(type.equals("PLAYEREND")) // Complete! Tested, OK!
        {
        	int index = obj.getInt("TARGET");
        	//find the next player and give his info (Including handcard and stone)
        	//send turn-start to front-end
        	// set the next player's usedAttack to false
        	// need to check for reality stone
        	JSONObject jo = new JSONObject();
        	jo.put("TYPE","TURNSTART");
        	int record = -1;
        	while(allPlayers.get(index).isDead()==true)
        	if(index+1>=4)
        	{
        		record = 0;
        	}
        	else
        	{
        		record = index+1;
        	}
        	/* Adjust for the dead player */
        	while(allPlayers.get(record).isDead()==true)
        	{
        		record++;
        		if(record==4)
        			record = 0;
        	}
        	
        	jo.put("INDEX",record);
        	allPlayers.get(record).setUsedAttack(false);
        	if(allPlayers.get(record).isThanos())
        	{
        		this.drawCards(allPlayers.get(record));
        		this.drawCards(allPlayers.get(record));
        	}
        	else
        	{
        		this.drawCards(allPlayers.get(record));
        	}
        	Vector<HandCard> cards = allPlayers.get(record).getHandCard();
        	JSONArray ja = new JSONArray();
        	for(int i=0;i<cards.size();i++)
        	{
        		ja.put(cards.get(i).getName());
        	}
        	jo.put("HANDCARD",ja);
        	
        	JSONArray ja2 = new JSONArray();
        	for(int i=0;i<cards.size();i++)
        	{
        		if(cards.get(i).getName().equals("ATTACK")||cards.get(i).getName().equals("STEAL"))
        		{
        			ja2.put(i);
        		}
        	}
        	jo.put("AVAILABLECARDS", ja2);
        	
        	if(allPlayers.get(record).getSoulStone()==true) // count for soul stone
        	{
        		for(int i=0;i<cards.size();i++)
            	{
            		if(cards.get(i).getName().equals("DODGE"))
            		{
            			ja2.put(i);
            		}
            	}
        	}
        	
        	JSONArray ja3 = new JSONArray();
        	Vector<Stone> stones = allPlayers.get(record).getStone();
        	for(int i=0;i<stones.size();i++)
        	{
        		ja3.put(stones.get(i).getName());
        	}
        	jo.put("STONE",ja3);
        	
        	// Forward the message to all players in this game
        	this.sendMessage(jo);
        	
        	/* DEBUG */
        	System.out.println("TURNSTART Back-to-Front:");
        	System.out.println(jo.toString(4));
        	System.out.println();
        	System.out.println();
        }		
	}
	
	public int getGameID()// Complete!
	{
		return this.gameID;
	}
	
	
	
	/* Util for testing */
	public int getThanosID()
	{
		return this.ThanosID;
	}
	
	public int getFirstAttack(int target)
	{
		for(int i=0;i<allPlayers.get(target).getHandCard().size();i++)
		{
			if(allPlayers.get(target).getHandCard().get(i).getName().equals("ATTACK"))
				return i;
		}
		return -1;
	}
	
	public int getFirstDodge(int target)
	{
		for(int i=0;i<allPlayers.get(target).getHandCard().size();i++)
		{
			if(allPlayers.get(target).getHandCard().get(i).getName().equals("DODGE"))
				return i;
		}
		return -1;
	}
	
	public int getFirstSteal(int target)
	{
		for(int i=0;i<allPlayers.get(target).getHandCard().size();i++)
		{
			if(allPlayers.get(target).getHandCard().get(i).getName().equals("STEAL"))
				return i;
		}
		return -1;
	}
	
	public int getFirstUndefeatable(int target)
	{
		for(int i=0;i<allPlayers.get(target).getHandCard().size();i++)
		{
			if(allPlayers.get(target).getHandCard().get(i).getName().equals("UNDEFEATABLE"))
				return i;
		}
		return -1;
	}
	
	public JSONObject getGameStartJSON()
	{
		JSONObject jo = new JSONObject();
		jo.put("TYPE", "GAMESTART");
		jo.put("GAMEID",123);
		System.out.println("GAMESTART Front-to-Back:");
		return jo;
	}
	
	public JSONObject getEndTurnJSON(int value)
	{
		JSONObject jo = new JSONObject();
		jo.put("TYPE","PLAYEREND" );
		jo.put("GAMEID", 123);
		jo.put("TARGET", value);
		System.out.println("PLAYEREND Front-to-Back:");
		System.out.println(jo.toString(4));
		return jo;
	}
	
	public JSONObject getAttackJSON(Game g,int value)
	{
		JSONObject jo = new JSONObject();
		jo.put("TYPE", "ATTACK");
		jo.put("GAMEID",123);
		jo.put("SOURCE",value);
		jo.put("CARD",g.getFirstAttack(value));
		jo.put("TARGET", g.ThanosID);
		System.out.println("ATTACK Front-to-Back:");
		System.out.println(jo.toString());
		System.out.println();
		return jo;
		
	}
	
	public JSONObject getDodgeJSON(Game g, int value)
	{
		JSONObject jo = new JSONObject();
		jo.put("TYPE", "DODGE");
		jo.put("GAMEID",123);
		jo.put("SOURCE",value);
		jo.put("CARD",g.getFirstDodge(value));
		jo.put("TARGET", g.ThanosID);
		System.out.println("DODGE Front-to-Back:");
		System.out.println(jo.toString());
		System.out.println();
		return jo;
	}
	/* Testing */
	public static void main(String args[])
	{
		// Constructor Test
		Session s = null;
		Game g = new Game(123,"Tong",s);
		g.addPlayer("Henry");
		g.addPlayer("Theo");
		g.addPlayer("Ao");
		int counter = g.getThanosID();
		//Start Turn Test (GameStart)
		g.play(g.getGameStartJSON().toString());
		
		//Start Turn Test (PlayerEnd)
		if(counter<3)
		{
			g.play(g.getEndTurnJSON(counter).toString());
			//counter++;
		}
		else
		{
			g.play(g.getEndTurnJSON(counter).toString());
			//counter = 0;
		}
		
		//Attack-Dodge Test (Give Dodge)
		//phase 1
		if(counter<3)
		{
			g.play(g.getAttackJSON(g,counter).toString());
			counter++;
		}
		else
		{
			g.play(g.getAttackJSON(g,counter).toString());
			counter = 0;
		}
		
		//phase 2
		g.play(g.getDodgeJSON(g, counter).toString());
		
		//adjust the counter
		counter++;
		if(counter>=4)
			counter = 0;
		
		//Attack Dodge Test (No Dodge)
		g.play(g.getAttackJSON(g,counter).toString());
		g.play(g.getDodgeJSON(g, counter).toString());
		
	}
}
