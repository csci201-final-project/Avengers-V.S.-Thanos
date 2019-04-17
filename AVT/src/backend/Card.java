package backend;

abstract class Card
{
	protected String name;
	public Card(String name)
	{
		this.name = name;
	}
	
	public String getName()
	{
		return this.name;
	}
	
	abstract public boolean isStone();
}

class HandCard extends Card{
	
	
	public HandCard(String name)
	{
		super(name);
	}
	
	public boolean isStone()
	{
		return false;
	}
	
}


class Stone extends Card
{
	public Stone(String name)
	{
		super(name);
	}
	
	public boolean isStone()
	{
		return true;
	}
	
	public void equip(Player p)
	{
		if(this.name.equals("SoulStone"))
		{
			p.setSoulStone(true);
		}
		if(this.name.equals("SpaceStone"))
		{
			p.setSpaceStone(true);
		}
		if(this.name.equals("RealityStone"))
		{
			p.setRealityStone(true);
		}
		if(this.name.equals("TimeStone"))
		{
			p.setTimeStone(true);
		}
		if(this.name.equals("MindStone"))
		{
			p.setDefense(1);
		}
		if(this.name.equals("PowerStone"))
		{
			p.setDamagePercentage(2);
		}
	}
	
	public void unequip(Player p)
	{
		if(this.name.contentEquals("SoulStone"))
		{
			p.setSoulStone(false);
		}
		if(this.name.contentEquals("SpaceStone"))
		{
			p.setSpaceStone(false);
		}
		if(this.name.contentEquals("RealityStone"))
		{
			p.setRealityStone(false);
		}
		if(this.name.contentEquals("TimeStone"))
		{
			p.setTimeStone(false);
		}
		if(this.name.contentEquals("MindStone"))
		{
			p.setDefense(0);
		}
		if(this.name.contentEquals("PowerStone"))
		{
			p.setDamagePercentage(1);
		}
	}
}
