import {CST} from "../CST.js"

export class RoomScene extends Phaser.Scene {
    constructor() {
        super({
            key: CST.SCENE.ROOM
        });

        // Extracts roomID and playerID from URL
        function get(name){
            if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
                return decodeURIComponent(name[1]);
        };
        this.roomID = get("roomID");
        this.playerID = parseInt(get("playerID"));
        console.log(this.playerID);

        // Initializes member variables
        this.isThanos = false;
        this.gameEnd = false;
        this.isDead = false;
        this.isLoaded = false;  // Flag indicating succesfully loading page info
        this.handcard = [];
        this.hero = "";
        this.stone = [];
        this.attack = 0;
        this.blood = 0;
        
        this.players = [];

        this.cardSprite = null;
        this.target = 500;

        this.socket = new WebSocket("ws://localhost:8080/Test_Phaser/server");

        var self = this;  // Allows access to "this"

        // Overwrite same function as server, asynchronous
        this.socket.onopen = function(event) {
            console.log("Connection established.");
        }
        this.socket.onmessage = function(event) {
            console.log("Msg received: ", event.data);

            var obj = JSON.parse(event.data);
            console.log(obj.TYPE);

            if (obj.TYPE === "GAMESTART") {
                self.parseGameStart(obj);
            }
            else if (obj.TYPE === "TURNSTART") {
                self.parseTurnStart(obj);
            }
            else if (obj.TYPE === "DODGE") {
                self.parseDodge(obj);
            }
            else if (obj.TYPE === "TAKEDAMAGE") {
                self.parseTakeDamage(obj);
            }
        }
        this.socket.onclose = function(event) {
            console.log("Connection lost.");
        }
    }

    parseGameStart(obj) {
        this.characters = obj.CHARACTER;
        this.hero = obj.CHARACTER[this.playerID];
        this.blood = obj.BLOOD[this.playerID];
        this.handcard = obj.HANDCARD[this.playerID];
        this.stone = obj.STONE[this.playerID];
        this.attack = obj.ATTACK[this.playerID];

        if (this.hero === "Thanos")
            this.isThanos = true;

        var idx;
        for (idx = 0; idx < 4; idx++) {
            var tempObj = {
                attack  : obj.ATTACK[idx],
                hero    : obj.CHARACTER[idx],
                stone   : obj.STONE[idx],
                blood   : obj.BLOOD[idx],
                handsize: obj.HANDCARD[idx].length
            }
            this.players.push(tempObj);
        }
        // console.log("attack: ", this.attack);
        // console.log("hero: ", this.hero);
        console.log(this.players[2].hero);
        this.isLoaded = true;
    }

    parseTurnStart(obj) {
        if (obj.INDEX === this.playerID) {
            this.availableCards = obj.AVAILABLECARDS;
            this.stone = obj.STONE;
            this.handcard = obj.HANDCARD;
        }
        else {
            this.players[obj.INDEX].handsize = obj.HANDCARD.length;
        }
    }

    parseDodge(obj) {
        if (obj.SOURCE.INDEX === this.playerID) {
            this.handcard = obj.SOURCE.HANDCARD;
        }
        else if (obj.TARGET.INDEX === this.playerID) {
            this.availableCards = obj.TARGET.AVAILABLECARDS;
        }
        this.players[obj.SOURCE.INDEX].handsize = obj.SOURCE.HANDCARD.length;
    }

    parseTakeDamage(obj) {
        if (obj.SOURCE.INDEX === this.playerID) {
            this.stone = obj.SOURCE.STONE;
            this.availableCards = obj.SOURCE.AVAILABLECARDS;
        }
        else if (obj.TARGET.INDEX === this.playerID) {
            this.handcard = obj.TARGET.HANDCARD;
            this.blood = obj.TARGET.BLOOD;
            if (obj.TARGET.GAMEEND === "FALSE") {
                this.gameEnd = false;
            }
            else {
                this.gameEnd = true;
            }
            if (obj.TARGET.ISDEAD === "FALSE") {
                this.isDead = false;
            }
            else {
                this.isDead = true;
            }
        }
        this.players[obj.TARGET.INDEX].handsize = obj.TARGET.HANDCARD.length;
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
        this.load.image("ironman", "./assets/iron-man.png");
        this.load.image("thor", "./assets/thor.png");
        this.load.image("hulk", "./assets/hulk.png");
        this.load.image("antman", "./assets/antman.png");
        this.load.image("black-widow", "./assets/black-widow.png");
        this.load.image("captain", "./assets/captain-marvel.png");

        this.load.image("card_deck", "./assets/card_deck.png");
        this.load.image("card-sample", "./assets/card-sample.png");
        this.load.image("attack", "./assets/attack.png");
        this.load.image("dodge", "./assets/dodge.png");
        this.load.image("steal", "./assets/steal.png");
        this.load.image("resist", "./assets/resist.png");

        this.load.image("card-sample_2", "./assets/steal.jpg");
        this.load.image("card-sample_3", "./assets/attack.jpg");
        this.load.image("card-sample_4", "./assets/dodge.jpg");
        this.load.image("card-sample_5", "./assets/steal.jpg");
        this.load.image("card-sample_6", "./assets/resist.jpg");
        this.load.image("card-sample_7", "./assets/attack.jpg");
        this.load.image("card-sample_8", "./assets/resist.jpg");
        this.load.image("discard_place", "./assets/card-sample_5.png");
        this.load.image("end_turn", "./assets/endturn-btn.png");
        this.load.image("left_heart", "./assets/left_heart.png");
        this.load.image("right_heart", "./assets/right_heart.png");
    }

    create() {
        // Add all images
        this.add.image(this.game.renderer.width/2, this.game.renderer.height/2 - 100, "background");
        this.add.image(this.game.renderer.width/2, this.game.renderer.height - 125, "bottom-bar");
        
        this.hero_base_scale = 0.75;
        this.add.image(200, 550, "hulk").setScale(0.85);
       	this.teammateL = this.add.image(100 + 30, 300, "thor").setInteractive().setScale(this.hero_base_scale = 0.75);
        this.teammateR = this.add.image(this.game.renderer.width - 115, 300, "antman").setInteractive().setScale(this.hero_base_scale = 0.75);
        this.thanos = this.add.image(this.game.renderer.width/2, 130, "thanos").setInteractive();
        
        
        //Theo's testing
        this.MAX_HEALTH = 7;
        this.MAX_HEALTH_LEFT = 5;
        this.MAX_HEALTH_RIGHT = 9;
        this.MAX_HEALTH_TOP = 15;
        
        this.hand_cards = [];
        this.card_deck = [];
        this.hand_cards_state = [];
        
        this.health_bar = [];
        this.health_bar_left = [];
        this.health_bar_right = [];
        this.health_bar_top = [];
        
        for(var i = 0; i < this.MAX_HEALTH; i++){
        	if(i % 2 === 0){
        		var heart = this.add.image(38 + i * 23, 705 - 20, "left_heart").setScale(0.17);
        		this.health_bar.push(heart);
        	}
        	else{
        		var heart = this.add.image(38 + (i-1) * 23, 705 - 20, "right_heart").setScale(0.17);
        		this.health_bar.push(heart);
        	}
        }
        var temp_y = 200 - 20;
        var temp_scale = 0.13;
        for(var i = 0; i < this.MAX_HEALTH_LEFT; i++){
        	if(i % 2 === 0){
        		var heart = this.add.image(60 + i * 18, temp_y, "left_heart").setScale(temp_scale);
        		this.health_bar_left.push(heart);
        	}
        	else{
        		var heart = this.add.image(60 + (i-1) * 18, temp_y, "right_heart").setScale(temp_scale);
        		this.health_bar_left.push(heart);
        	}
        }
        
        for(var i = 0; i < this.MAX_HEALTH_RIGHT; i++){
        	if(i % 2 === 0){
        		var heart = this.add.image(this.game.renderer.width - 200 + i * 18, temp_y, "left_heart").setScale(temp_scale);
        		this.health_bar_right.push(heart);
        	}
        	else{
        		var heart = this.add.image(this.game.renderer.width - 200 + (i-1) * 18, temp_y, "right_heart").setScale(temp_scale);
        		this.health_bar_right.push(heart);
        	}
		}
		
        for(var i = 0; i < this.MAX_HEALTH_TOP; i++){
        	if(i % 2 === 0){
        		var heart = this.add.image(this.game.renderer.width/2 - 94 + i * 18, 19.5, "left_heart").setScale(temp_scale);
        		this.health_bar_top.push(heart);
        	}
        	else{
        		var heart = this.add.image(this.game.renderer.width/2 - 94 + (i-1) * 18, 19.5, "right_heart").setScale(temp_scale);
        		this.health_bar_top.push(heart);
        	}
        }
        
        
        
        var i;
        
        
        this.basic_scale = 0.15;
        this.card_cover_scale = 1.6;
  
        this.physics.add.sprite(1200 - 10, 633.4 - 10, "card_deck").setScale(this.card_cover_scale).depth = 30;
/*        this.discard_place = this.add.image(this.game.renderer.width/2, this.game.renderer.height/2, "discard_place");
        this.discard_place.setScale(this.card_cover_scale).depth = -30;*/

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
        var endButton = this.add.image(this.game.renderer.width - 114, this.game.renderer.height - 100, "end_turn").setScale(0.425);
        endButton.depth = 30;
        endButton.setInteractive({ useHandCursor: true });
        endButton.on("pointerover", ()=>{
            /*alert("hover");*/
        });
        endButton.on("pointerup", ()=>{
        	if(this.initialize_hand){
        		this.draw_card(5);

        	}
        	else if(this.num_to_draw === 0){
        		this.draw_card(1);
        	}
        });
/*        alert("center width: " + this.game.renderer.width);
        alert("center height: " + this.game.renderer.height);*/
        var confirmButton = this.add.image(this.game.renderer.width - 116, this.game.renderer.height - 170, "confirm-button").setScale(0.42);
        confirmButton.setInteractive({ useHandCursor: true });
        confirmButton.depth = 30;

        confirmButton.on("pointerup", ()=>{
            if(this.to_play_card === true){
                this.scale_back();
                var index =  this.hand_cards_state.indexOf("to play");
                this.hand_cards[index].x = this.game.renderer.width/2;
                this.hand_cards[index].y = this.game.renderer.height/2;
                this.hand_cards[index].depth = 0;
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
    	        	this.teammateL.setScale(this.hero_base_scale * 1.2);
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
    	        	this.teammateR.setScale(this.hero_base_scale * 1.2);
    			}
    		}
        });

        // end of create
        this.socket.send("request");
    }
    
    set_left_hero_health(num){
    	if(num > this.MAX_HEALTH_LEFT){
    		alert("The Health You Want To Set Exceeds The Hero's Max Health!");
    	}
    	for(var i = 0; i < num; i++){
    		this.health_bar_left[i].visible = true;
    	}
    	for(var i = num; i < this.MAX_HEALTH_LEFT; i++){
    		this.health_bar_left[i].visible = false;
    	}
    }
    
    set_top_hero_health(num){
    	if(num > this.MAX_HEALTH_TOP){
    		alert("The Health You Want To Set Exceeds The Hero's Max Health!");
    	}
    	for(var i = 0; i < num; i++){
    		this.health_bar_top[i].visible = true;
    	}
    	for(var i = num; i < this.MAX_HEALTH_TOP; i++){
    		this.health_bar_top[i].visible = false;
    	}
    }
    
    set_right_hero_health(num){
    	if(num > this.MAX_HEALTH_RIGHT){
    		alert("The Health You Want To Set Exceeds The Hero's Max Health!");
    	}
    	for(var i = 0; i < num; i++){
    		this.health_bar_right[i].visible = true;
    	}
    	for(var i = num; i < this.MAX_HEALTH_RIGHT; i++){
    		this.health_bar_right[i].visible = false;
    	}
    }
    
    arrange_hand_cards(index){
    	var i;
    	for(i = index + 1; i < this.hand_cards.length; i++){
    		this.hand_cards[i].x -= 122.5;
    	}
    }
    
    scale_back(){
    	this.thanos.setScale(1);
    	this.teammateL.setScale(this.hero_base_scale);
    	this.teammateR.setScale(this.hero_base_scale);
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
            this.hand_cards[this.hand_cards.length-1].depth = 1;
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

        // if (this.isLoaded) {
        //     this.add.image(100, 300, "thanos");
        // }

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