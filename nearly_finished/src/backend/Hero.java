package backend;

import java.util.concurrent.ThreadLocalRandom;

abstract class Hero {

	protected int blood;
	protected int attack;
	protected String heroName;
	
	public Hero(int blood, int attack, String heroName)
	{
		this.blood = blood;
		this.attack = attack;
		this.heroName = heroName;
	}
	
	public int getAttack()
	{
		return this.attack;
	}
	
	public int getBlood()
	{
		return this.blood;
	}
	
	public String getHeorName()
	{
		return heroName;
	}
	
	public abstract void ability();
}

class IronMan extends Hero
{
	public IronMan()
	{
		super(7,2,"IronMan");
	}
	
	public void ability()
	{
		
	}
}

class Hulk extends Hero
{
	public Hulk()
	{
		super(6,1,"Hulk");
	}
	
	public void ability()
	{
		this.attack = Math.max(1,6-this.blood);
	}
}

class ScarletWitch extends Hero
{
	public ScarletWitch() {
		super(4,4,"ScarletWitch");
	}
	
	public void ability()
	{
		
	}
}

class AntMan extends Hero
{
	public AntMan()
	{
		super(10,1,"AntMan");
	}
	
	public void ability()
	{
		
	}
}

class Thor extends Hero
{
	public Thor()
	{
		super(6,2,"Thor");
	}
	
	public void ability()
	{
		this.revenge();
	}
	
	public void revenge()
	{
		int random =  ThreadLocalRandom.current().nextInt(0, 4);
		if(random==0)
		{
			this.attack++;
		}
	}
}

class DoctorStrange extends Hero
{
	public DoctorStrange()
	{
		super(5,3,"DoctorStrange");
	}
	
	public void ability()
	{
		
	}
}

class Thanos extends Hero
{
	public Thanos()
	{
		super(14,4,"Thanos");
	}
	
	public void ability()
	{
		
	}
}
