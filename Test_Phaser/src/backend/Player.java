package backend;

import java.util.Vector;
import java.util.concurrent.ThreadLocalRandom;

public class Player {
	private String username;
	private Hero hero;
	private Vector<HandCard> handCards;
	private Vector<Stone> stones;
	private boolean isThanos;
	private int damage_percentage;
	private int defense;
	private boolean usedAttack;
	private boolean hasSpaceStone;
	private boolean hasSoulStone;
	private boolean hasRealityStone;
	private boolean hasTimeStone;
	
	public Player(Hero hero, String username)
	{
		this.hero = hero;
		this.username = username;
		this.usedAttack = false;
		this.hasSoulStone = false;
		this.hasSpaceStone = false;
		this.hasTimeStone = false;
		this.hasRealityStone = false;
		this.handCards = new Vector<HandCard>();
		this.stones = new Vector<Stone>();
		this.defense = 0;
		this.damage_percentage = 1;
		if(this.hero.getHeorName().equals("Thanos"))
		{
			isThanos = true;
		}
		else
		{
			isThanos = false;
		}
		
	}
	
	public Stone getStone(int index)
	{
		return this.stones.get(index);
	}
	
	public void removeStone(int index)
	{
		this.stones.get(index).unequip(this);
		stones.remove(index);
	}
	
	public HandCard getHandCard(int index)
	{
		return this.handCards.get(index);
	}
	
	public void removeHandCard(int index)
	{
		this.handCards.remove(index);
	}
	
	public void addStone(Stone s)
	{
		stones.add(s);
		s.equip(this);
	}
	
	public void addHandCard(HandCard c)
	{
		handCards.add(c);
	}
	
	public Hero getHero()
	{
		return this.hero;
	}
	
	public boolean usedAttack()
	{
		return this.usedAttack;
	}
	
	public void setUsedAttack(boolean dir)
	{
		this.usedAttack = dir;
	}
	
	public boolean isThanos()
	{
		return this.isThanos;
	}
	
	public boolean getSpaceStone()
	{
		return this.hasSpaceStone;
	}
	
	public boolean getSoulStone()
	{
		return this.hasSoulStone;
	}
	
	public boolean getRealityStone()
	{
		return this.hasRealityStone;
	}
	
	public boolean getTimeStone()
	{
		return this.hasTimeStone;
	}
	
	public void setSpaceStone(boolean dir)
	{
		this.hasSpaceStone = dir;
	}
	
	public void setSoulStone(boolean dir)
	{
		this.hasSoulStone = dir;
	}
	
	public void setRealityStone(boolean dir)
	{
		this.hasRealityStone = dir;
	}
	
	public void setTimeStone(boolean dir)
	{
		this.hasTimeStone = dir;
	}
	
	public String getUsername()
	{
		return this.username;
	}
	
	public int getDamage()
	{
		return this.damage_percentage*this.hero.getAttack();
	}
	
	public int getDefense()
	{
		return this.defense;
	}
	
	public boolean isDead()
	{
		return (this.hero.getBlood()<=0);
	}
	
	public void setDamagePercentage(int dir)
	{
		this.damage_percentage = dir;
	}
	
	public void setDefense(int dir)
	{
		this.defense = dir;
	}
	
	public void take_damage(int damage)
	{
		if(this.hasSpaceStone)
		{
			int random =  ThreadLocalRandom.current().nextInt(0, 1000);
			if(random<500)
			{
				this.hero.blood -= (damage-this.defense);
			}	
		}
		else
		{
			this.hero.blood -= (damage-this.defense);
		}
	}
	
	/*
	public synchronized void drawCard(Game g)
	{
		if(this.handCards.size()<handLimit)
		{
			if(g.allCards.get(0).isStone())
			{
				System.out.println("Called");
				Stone s = (Stone)g.allCards.remove(0);
				stones.add(s);
				s.equip(this);
			}
			else
			{
				HandCard c = (HandCard) g.allCards.get(0);
				handCards.add(c);
				
			}
		}
	}
	*/
	
	public Vector<HandCard> getHandCard()
	{
		Vector<HandCard> result = new Vector<HandCard>();
		//System.out.println(handCards.size());
		for(int i=0;i<this.handCards.size();i++)
		{
			result.add(this.handCards.get(i));
		}
		return result;
	}
	
	public Vector<Stone> getStone()
	{
		Vector<Stone> result = new Vector<Stone>();
		for(int i=0;i<this.stones.size();i++)
		{
			result.add(this.stones.get(i));
		}
		return result;
	}
	
	
}
