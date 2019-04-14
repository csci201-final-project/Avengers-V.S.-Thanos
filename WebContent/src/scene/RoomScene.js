import {CST} from "../CST.js"

export class RoomScene extends Phaser.Scene {
    constructor() {
        super({
            key: CST.SCENE.ROOM
        });
        function get(name){
            if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
               return decodeURIComponent(name[1]);
        };
        this.roomID = get("roomID");	
        this.cards = [];
        this.moveFlag = false;
        this.cardSprite = null;
        this.target = 500;
       
        
        
       /* this.socket = new WebSocket("ws://localhost:8080/Test_Phaser/server");

        // Overwrite same function as server, asynchronous
        this.socket.onopen = function(event) {
            console.log("Connection established.");
        }
        this.socket.onmessage = function(event) {
            console.log("Msg received: ", event.data);

            var obj = JSON.parse(event.data);
            console.log(obj.type);
        }
        this.socket.onclose = function(event) {
            console.log("Connection lost.");
        }*/
        
    }

    init() {
        
    }

    preload() {
        this.load.image("background", "./assets/titan-bg.png");
        this.load.image("confirm-button", "./assets/confirm-btn.png");
        this.load.image("my-hero", "./assets/myhero.png");
        this.load.image("bottom-bar", "./assets/bottom-bar.png");
        this.load.image("teammate", "./assets/teammates.png");
        this.load.image("thanos", "./assets/thanos.png");
        
        
        this.load.image("card_deck", "./assets/card_deck.png");
        this.load.image("steal", "./assets/steal.jpg");
        
        
        this.load.image("card-sample_2", "./assets/steal.jpg");
        this.load.image("card-sample_3", "./assets/attack.jpg");
        this.load.image("card-sample_4", "./assets/dodge.jpg");
        this.load.image("card-sample_5", "./assets/steal.jpg");
        this.load.image("card-sample_6", "./assets/resist.jpg");
        this.load.image("card-sample_7", "./assets/attack.jpg");
        this.load.image("card-sample_8", "./assets/resist.jpg");
        this.load.image("discard_place", "./assets/card-sample_5.png");
        
        this.load.image("left_heart", "./assets/left_heart.png");
        this.load.image("right_heart", "./assets/right_heart.png");

    }

    create() {
        // Add all images
        this.add.image(this.game.renderer.width/2, this.game.renderer.height/2 - 100, "background");
        this.add.image(this.game.renderer.width/2, this.game.renderer.height - 125, "bottom-bar");
        
        
        this.add.image(200, 550, "my-hero");
       	this.teammateL = this.add.image(100, 300, "teammate").setInteractive();
        this.teammateR = this.add.image(this.game.renderer.width - 100, 300, "teammate").setInteractive();
        this.thanos = this.add.image(this.game.renderer.width/2, 130, "thanos").setInteractive();
        
        
        //Theo's testing
        this.MAX_HEALTH = 7;
        this.hand_cards = [];
        this.card_deck = [];
        this.hand_cards_state = [];
        this.health_bar = [];

        for(var i = 0; i < this.MAX_HEALTH; i++){
        	if(i % 2 === 0){
        		var heart = this.add.image(60 + i * 37, 705, "left_heart").setScale(0.23);
        		this.health_bar.push(heart);
        	}
        	else{
        		var heart = this.add.image(60 + (i-1) * 37, 705, "right_heart").setScale(0.23);
        		this.health_bar.push(heart);
        	}
        }
        
        var i;
        
        
        this.basic_scale = 0.15;
        
        this.physics.add.sprite(1200, 633.4, "card_deck").setScale(1.2).depth = 30;
        this.discard_place = this.add.image(this.game.renderer.width/2, this.game.renderer.height/2, "discard_place");
        this.discard_place.setScale(1.2).depth = 30;

        this.cardSprite_1 = this.physics.add.sprite(1200, 633.4, "card-sample_2").setInteractive().setScale(this.basic_scale);
        this.cardSprite_2 = this.physics.add.sprite(1202, 633.4, "card-sample_2").setInteractive().setScale(this.basic_scale);
        this.cardSprite_3 = this.physics.add.sprite(1204, 633.4, "card-sample_3").setInteractive().setScale(this.basic_scale);
        this.cardSprite_4 = this.physics.add.sprite(1206, 633.4, "card-sample_4").setInteractive().setScale(this.basic_scale);
        this.cardSprite_5 = this.physics.add.sprite(1208, 633.4, "card-sample_5").setInteractive().setScale(this.basic_scale);
        this.cardSprite_6 = this.physics.add.sprite(1208, 633.4, "card-sample_6").setInteractive().setScale(this.basic_scale);
        this.cardSprite_7 = this.physics.add.sprite(1208, 633.4, "card-sample_7").setInteractive().setScale(this.basic_scale);
        this.cardSprite_8 = this.physics.add.sprite(1208, 633.4, "card-sample_8").setInteractive().setScale(this.basic_scale);
        

        this.card_deck.push(this.cardSprite_1);
        this.card_deck.push(this.cardSprite_2);
        this.card_deck.push(this.cardSprite_3);
        this.card_deck.push(this.cardSprite_4);
        this.card_deck.push(this.cardSprite_5);
        this.card_deck.push(this.cardSprite_6);
        this.card_deck.push(this.cardSprite_7);
        this.card_deck.push(this.cardSprite_8);
        
        

        var style = { font: "65px Arial", fill: "#ff0000", align: "center" };
        this.textValue = this.add.text(0, 0, "0", style);
        this.updateCount = 0;

        this.num_to_draw = 5;
        this.initialize_hand = true;
        this.deck_top_index = 0;
        
        // Adds confirm button
        var drawButton = this.add.image(this.game.renderer.width * 0.85, this.game.renderer.height * 0.9, "confirm-button");
        drawButton.setInteractive({ useHandCursor: true });
        drawButton.on("pointerover", ()=>{
            /*alert("hover");*/
        });
        drawButton.on("pointerup", ()=>{
        	if(this.initialize_hand){
        		this.draw_card(5);

        	}
        	else if(this.num_to_draw === 0){
        		this.draw_card(1);
        	}
        });
        
        var playButton = this.add.image(this.game.renderer.width /2, this.game.renderer.height /2, "confirm-button");
        playButton.setInteractive({ useHandCursor: true });
        playButton.depth = 30;

        playButton.on("pointerup", ()=>{
        	 if(this.to_play_card === true){
        		 this.scale_back();
        		 var index =  this.hand_cards_state.indexOf("to play");
        		 this.hand_cards[index].x = this.game.renderer.width/2;
  				 this.hand_cards[index].y = this.game.renderer.height/2;
  				this.hand_cards[index].removeInteractive();
  				
  				this.arrange_hand_cards(index);
  				
  				this.hand_cards_state.splice(index, 1);
  				this.hand_cards.splice(index,1);
  				
  				 this.to_play_card = false;
  				 
        		 for(i = 0; i < this.hand_cards.length; i++){
        			 this.add_card_click_effect(i, true);
        		 }
        	 }
        });
      
        
        this.thanos.on("pointerup", ()=>{
        	var i;
    		for(i = 0; i < this.hand_cards.length; i++){
    			if(this.hand_cards_state[i] === "to play"){
    				//only when to_play_card is true can we play the cards by pressing the button
    				this.to_play_card = true;
    				alert("You selected Thanos.");
    				this.scale_back();
    	        	this.thanos.setScale(1.5);
    			}
    		}
        });
        
        this.teammateL.on("pointerup", ()=>{
        	var i;
    		for(i = 0; i < this.hand_cards.length; i++){
    			if(this.hand_cards_state[i] === "to play"){
    				this.to_play_card = true;
    				alert("You selected teammateL.");
    				this.scale_back();
    	        	this.teammateL.setScale(1.5);
    			}
    		}
        });
        
        this.teammateR.on("pointerup", ()=>{
        	var i;
    		for(i = 0; i < this.hand_cards.length; i++){
    			if(this.hand_cards_state[i] === "to play"){
    				this.to_play_card = true;
    				alert("You selected teammateR.");
    				this.scale_back();
    	        	this.teammateR.setScale(1.5);
    			}
    		}
        });
    }
    
    
    arrange_hand_cards(index){
    	var i;
    	for(i = index + 1; i < this.hand_cards.length; i++){
    		this.hand_cards[i].x -= 122.5;
    	}
    }
    
    scale_back(){
    	this.thanos.setScale(1);
    	this.teammateL.setScale(1);
    	this.teammateR.setScale(1);
    }
    
    draw_card(num){
    	if(this.hand_cards.length + num > 5){
    		alert("You already have 5 cards. You can not draw any more cards!");
			return;
		}
    	this.num_to_draw = num;
    	var i;
    	for(i = 0; i < num; i++){
    		this.hand_cards.push(this.card_deck.shift());
    		this.hand_cards[this.hand_cards.length-1].body.setVelocityX(-350);
    		this.hand_cards_state.push("draw");
    	}
    	
    	this.deck_top_index += num;
    	this.draw_more_cards = true;
    	
    
    }
    
    
    //num represents the health you want the hero to have
    set_health(num){
    	if(num > this.MAX_HEALTH){
    		alert("The Health You Want To Set Exceeds The Hero's Max Health!");
    	}
    	for(var i = 0; i < num; i++){
    		this.health_bar[i].visible = true;
    	}
    	for(var i = num; i < this.MAX_HEALTH; i++){
    		this.health_bar[i].visible = false;
    	}
    }
    
    add_card_click_effect(i){
    	this.hand_cards[i].off("pointerup");
    	
		 this.hand_cards[i].on("pointerup", ()=>{
			 if(this.hand_cards_state[i] === "hand"){
				this.hand_cards[i].y = 533.4;
				this.hand_cards[i].setScale(this.basic_scale * 1.2);
				for(var j = 0; j < this.hand_cards.length; j++){
					if(j != i){
						this.hand_cards[j].y = 533.4 + 100;
						this.hand_cards_state[j] = "hand";
						this.hand_cards[j].setScale(this.basic_scale);
					}
				}
				this.hand_cards_state[i] = "to play";
			 }
			 else if(this.hand_cards_state[i] === "to play"){
				this.hand_cards[i].setScale(this.basic_scale);
				this.hand_cards[i].y = 533.4 + 100;
				this.hand_cards_state[i] = "hand";
			 }
			
		 });
		 
    }
    
    

    
    update() {
    	this.textValue.text = (this.updateCount++).toString();
       	if(this.num_to_draw === 0){
       		return;
       	}
       	
      
       	
    	if(this.draw_more_cards){
    		var i;
        	for(i = 0; i < this.hand_cards.length; i++){
        		var cardSprite = this.hand_cards[i];
        		var dist = 122.7;
        		if(this.draw_more_cards === true){
        			if(cardSprite.x < (401 + i*dist)){
                     	cardSprite.body.setVelocityX(0);
                     	cardSprite.x = 401 + i*dist;
                     	this.num_to_draw--;
                     	this.hand_cards_state[i] = "hand";
                     	this.add_card_click_effect(i, false);
                     	if(this.num_to_draw === 0){
                    		this.initialize_hand = false;
                    		this.draw_more_cards = false;
                     	}
                 	 }
        		}
        	}
    	}
    	
    	
    	
        
    }


}