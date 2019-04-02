package Game;

import java.util.Vector;



public class Player {
	public Player(String hero_name, String username){
		this.username = username;
		
		//TODO:construct the hero based the hero name
		
		
	}
	
	//Methods
	public String get_username() {
		return username;
	}
	
	//start a single turn of the player
	public void start_player_turn() {
		//TODO
		
	}
	
	//to draw a card from the card pool
	public void draw_card() {
		//TODO
	}
	
	//return true if the player is dead
	public Boolean is_dead() {
		//TODO
		return false;
	}
	
	//set the base attack of the player's hero
	public void set_damage(int damage) {
		//TODO
	}
	
	//return the base attack of the player's hero
	public int get_damage() {
		//TODO
		return -1;
	}
	
	//?
	public int get_injury() {
		//TODO
		return -1;
	}
	
	//?
	public void set_injury(int damage) {
		//TODO
		
	}
	
	//return the cards in the hand
	public Vector<Card> get_card(){
		return cards;
	}
	
	
	
	
	private String username;
	
	private Hero hero;
	
	//store the hand_cards
	private Vector<Card> cards;
	
	private Vector<Stone> stones;
	
	private int damage_percentage;
	
	private int injury_percentage;
}

