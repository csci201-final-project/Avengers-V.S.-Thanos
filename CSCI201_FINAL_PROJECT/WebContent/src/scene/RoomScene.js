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
        this.leftID;
        this.rightID;
        this.topID;
        
        this.players = [];
        this.availableCards = null;

        this.socket = new WebSocket("ws://localhost:8080/FINAL_PROJECT/server");

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
        
        //DEBUG
        this.load.image("start-btn", "./assets/start-button.png");
    }

    create() {
    	//Adding music, need to be commented back
/*    	this.before_start = this.sound.add("before_start");
    	this.before_start.play({loop: true});
    	this.before_start.volume = 1.5;*/
    	
    	
    	//testing
    	/*this.test = this.sound.add("test");
    	this.test.play({loop: true});
    	var self = this;
    	this.test.once('complete', function(test){
    		self.before_start = self.sound.add("before_start");
    		self.before_start.play({loop: true});
        	self.before_start.volume = 1.5;
    	});*/
    	
        // Adds all images
        this.add.image(this.game.renderer.width/2, this.game.renderer.height/2 - 100, "background");
        this.add.image(this.game.renderer.width/2, this.game.renderer.height - 125, "bottom-bar");
        
        // Adds empty hero pics
        this.hero_base_scale = 0.75;
        this.myHeroPic = this.add.image(200, 550, "undecided").setScale(0.85);
       	this.teammateL = this.add.image(100 + 30, 300, "undecided").setInteractive().setScale(this.hero_base_scale = 0.75);
        this.teammateR = this.add.image(this.game.renderer.width - 115, 300, "undecided").setInteractive().setScale(this.hero_base_scale = 0.75);
        this.teammateT = this.add.image(this.game.renderer.width/2, 130, "undecided").setInteractive().setScale(this.hero_base_scale = 0.75);
        
  
     
        this.hand_card_num_scale = 0.6;
        this.left_handsize_img = this.add.image(this.teammateL.x + 115, this.teammateL.y - 100, "0").setScale(this.hand_card_num_scale);
        this.top_handsize_img = this.add.image(this.teammateT.x, this.teammateT.y + 115, "0").setScale(this.hand_card_num_scale);
        this.right_handsize_img = this.add.image(this.teammateR.x - 115, this.teammateR.y - 100, "0").setScale(this.hand_card_num_scale);
        
        
        
        //Theo's testing
        this.MAX_HEALTH = 14;
        this.MAX_HEALTH_LEFT = 10;
        this.MAX_HEALTH_RIGHT = 10;
        this.MAX_HEALTH_TOP = 14;
        
        this.hand_cards = [];
        this.card_deck = [];
        this.hand_cards_state = [];
        
        this.health_bar = [];
        this.health_bar_left = [];
        this.health_bar_right = [];
        this.health_bar_top = [];
        
        // Adds default hero health
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
        		var heart = this.add.image(this.game.renderer.width - 200 + 30 + i * 18, temp_y, "left_heart").setScale(temp_scale);
        		this.health_bar_right.push(heart);
        	}
        	else{
        		var heart = this.add.image(this.game.renderer.width - 200 + 30 + (i-1) * 18, temp_y, "right_heart").setScale(temp_scale);
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
        
        // Adding end button
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
        
        this.fade_out_cards = [];
        this.fade_out_cards_scale = [];
        
        //adding confirm button
        var confirmButton = this.add.image(this.game.renderer.width - 116, this.game.renderer.height - 170, "confirm-button").setScale(0.42);
        confirmButton.setInteractive({ useHandCursor: true });
        confirmButton.depth = 30;

        confirmButton.on("pointerup", ()=>{
        	//Theo's testing
        	
        	
        	/*this.set_left_stone_effect(0, "time_stone");
        	this.set_left_stone_effect(1, "space_stone");
        	this.set_left_stone_effect(2, "power_stone");
        	this.set_left_stone_effect(3, "reality_stone");
        	this.set_left_stone_effect(4, "soul_stone");
        	this.set_left_stone_effect(5, "mind_stone");
        	
        	this.set_right_stone_effect(0, "time_stone");
        	this.set_right_stone_effect(1, "space_stone");
        	this.set_right_stone_effect(2, "power_stone");
        	this.set_right_stone_effect(3, "reality_stone");
        	this.set_right_stone_effect(4, "soul_stone");
        	this.set_right_stone_effect(5, "mind_stone");
        	
        	this.set_top_stone_effect(0, "time_stone");
        	this.set_top_stone_effect(1, "space_stone");
        	this.set_top_stone_effect(2, "power_stone");
        	this.set_top_stone_effect(3, "reality_stone");
        	this.set_top_stone_effect(4, "soul_stone");
        	this.set_top_stone_effect(5, "mind_stone");
        	
        	this.set_my_stone_effect(0, "time_stone");
        	this.set_my_stone_effect(1, "space_stone");
        	this.set_my_stone_effect(2, "power_stone");
        	this.set_my_stone_effect(3, "reality_stone");
        	this.set_my_stone_effect(4, "soul_stone");
        	this.set_my_stone_effect(5, "mind_stone");*/
        	
        	
            if(this.to_play_card === true){
                this.scale_back();
                var index =  this.hand_cards_state.indexOf("to play");
                this.hand_cards[index].x = this.game.renderer.width/2;
                this.hand_cards[index].y = this.game.renderer.height/2;
                this.hand_cards[index].depth = 0;
  				this.hand_cards[index].removeInteractive();
  				
  				//adding fading effect after the card is played out
  				this.fade_out_cards.push(this.hand_cards[index]);
  				this.fade_out_cards_scale.push(this.basic_scale);
  				this.time_marker = this.updateCount;
  				
  				this.arrange_hand_cards(index);
  				
  				this.hand_cards_state.splice(index, 1);
  				this.hand_cards.splice(index,1);
  				
                this.to_play_card = false;
                
                for(i = 0; i < this.hand_cards.length; i++){
                    this.add_card_click_effect(i, true);
                }
        	}
        });
        
        

        var startButton = this.add.image(this.game.renderer.width/2 - 30, this.game.renderer.height/2 - 50, "start-btn");
        startButton.setInteractive({ useHandCursor: true });
        startButton.on("pointerup", ()=>{
            this.socket.send("request");
            //needed to be commented back
            /*this.before_start.stop()*/;
/*            this.bg_music = this.sound.add("bg_music");
            this.bg_music.volume = 1.5;
            this.bg_music.play({loop: true});*/
        });
        
        
        
        //creating the empty_stones
        this.stone_scale = 0.35;
        this.left_stone_bar = [];
        this.right_stone_bar = [];
        this.top_stone_bar = [];
        this.my_stone_bar = [];
        
        var dist = 30;
        for(var i = 1; i <= 6; i++){
        	this.left_stone_bar.push(this.add.image(this.teammateL.x + 115, this.teammateL.y - 70 + i*dist, "stone_" + i).setScale(this.stone_scale));
        	this.left_stone_bar[i-1].setInteractive();
        	this.right_stone_bar.push(this.add.image(this.teammateR.x - 115, this.teammateR.y - 70 + i*dist, "stone_" + i).setScale(this.stone_scale));
        	this.right_stone_bar[i-1].setInteractive();
        	this.top_stone_bar.push(this.add.image(this.teammateT.x + 115, this.teammateT.y - 100 + i*dist, "stone_" + i).setScale(this.stone_scale));
        	this.top_stone_bar[i-1].setInteractive();
        	this.my_stone_bar.push(this.add.image(this.myHeroPic.x - 135, this.myHeroPic.y - 110 + i*dist, "stone_" + i).setScale(this.stone_scale));
        	this.my_stone_bar[i-1].setInteractive();
        }
        
        
        this.rotation = 0.05;
        this.added_stone_effect = false;


        // end of create
    }
    
    shake_camera(){
    	this.cameras.main.shake(500);
    }
    
    set_left_stone_effect(index, stone){
    	if(!this.left_stone_bar[index])
    		return false;
    	this.left_stone_bar[index].on("pointerover", ()=>{
        	this.temp_stone = this.add.image(this.left_stone_bar[index].x, this.left_stone_bar[index].y, stone).setScale(this.stone_scale * 1.5);
        	this.temp_stone.depth = 30;
        });
    	this.left_stone_bar[index].on("pointerout", ()=>{
        	this.temp_stone.destroy();
        });
    	return true;
    }
    
    set_right_stone_effect(index, stone){
    	if(!this.right_stone_bar[index])
    		return false;
    	this.right_stone_bar[index].on("pointerover", ()=>{
    		this.temp_stone = this.add.image(this.right_stone_bar[index].x, this.right_stone_bar[index].y, stone).setScale(this.stone_scale * 1.5);
        	this.temp_stone.depth = 30;
        });
    	this.right_stone_bar[index].on("pointerout", ()=>{
    		this.temp_stone.destroy();
        });
    	return true;
    }
    
    set_top_stone_effect(index, stone){
    	if(!this.top_stone_bar[index])
    		return false;
    	this.top_stone_bar[index].on("pointerover", ()=>{
    		this.temp_stone = this.add.image(this.top_stone_bar[index].x, this.top_stone_bar[index].y, stone).setScale(this.stone_scale * 1.5);
        	this.temp_stone.depth = 30;
        });
    	this.top_stone_bar[index].on("pointerout", ()=>{
    		this.temp_stone.destroy();
        });
    	return true;
    }
    
    set_my_stone_effect(index, stone){
    	if(!this.my_stone_bar[index])
    		return false;
    	this.my_stone_bar[index].on("pointerover", ()=>{
        	/*this.my_stone_bar[index].setTexture(stone).setScale(this.stone_scale * 1.5);*/
    		this.temp_stone = this.add.image(this.my_stone_bar[index].x, this.my_stone_bar[index].y, stone).setScale(this.stone_scale * 1.5);
        	this.temp_stone.depth = 30;
        });
    	this.my_stone_bar[index].on("pointerout", ()=>{
        	/*this.my_stone_bar[index].setTexture("stone_" + (index+1)).setScale(this.stone_scale);*/
    		this.temp_stone.destroy();
        });
    	return true;
    }
	
    
    
    
    //this function will never needed to be called
    update_remove_card(){
    	if(this.fade_out_cards !== null && this.fade_out_cards.length != 0){
    		for(var i = 0; i < this.fade_out_cards.length; i++){
    			this.fade_out_cards_scale[i] = this.fade_out_cards_scale[i] - 0.005;
        		this.fade_out_cards[i].setScale(this.fade_out_cards_scale[i]);
        		if(this.fade_out_cards_scale[i] < 0.01){
        			this.fade_out_cards[i].destroy();
        			this.fade_out_cards.shift();
        			this.fade_out_cards_scale.shift();
        			
        		}
    		}
    	}
    	
    	
    }
    
    
    
    //helper function of update_stone()
    update_stone_of(ID){
    	var stone_bar;
    	if(ID === this.leftID){
    		stone_bar = this.left_stone_bar;
    	}
    	else if(ID === this.rightID){
    		stone_bar = this.right_stone_bar;
    	}
    	else if(ID === this.topID){
    		stone_bar = this.top_stone_bar;
    	}
    	else if(ID === this.playerID){
    		stone_bar = this.my_stone_bar;
    	}
    	else{
    		alert("Something is going wrong in stone!!!");
    	}
    	for(var i = 0; i < this.players[ID].stone.length; i++){
			if(this.players[ID].stone[i] === "TimeStone"){
				stone_bar[0].setTexture("time_stone").setScale(this.stone_scale);
			}
			else if(this.players[ID].stone[i] === "SpaceStone"){
				stone_bar[1].setTexture("space_stone").setScale(this.stone_scale);
			}
			else if(this.players[ID].stone[i] === "PowerStone"){
				stone_bar[2].setTexture("power_stone").setScale(this.stone_scale);
			}
			else if(this.players[ID].stone[i] === "RealityStone"){
				stone_bar[3].setTexture("reality_stone").setScale(this.stone_scale);
			}
			else if(this.players[ID].stone[i] === "SoulStone"){
				stone_bar[4].setTexture("soul_stone").setScale(this.stone_scale);
			}
			else if(this.players[ID].stone[i] === "MindStone"){
				stone_bar[5].setTexture("mind_stone").setScale(this.stone_scale);
			}
		}
    }
    

    
    //this function will never needed to be called
    update_stone(){
    	if(this.players[this.leftID] && this.players[this.rightID] && this.players[this.topID] && this.hero !== ""){
    		//clear the texture
    		for(var i = 1; i <= 6; i++){
    			this.left_stone_bar[i-1].setTexture("stone_" + i).setScale(this.stone_scale);
            	this.right_stone_bar[i-1].setTexture("stone_" + i).setScale(this.stone_scale);
            	this.top_stone_bar[i-1].setTexture("stone_" + i).setScale(this.stone_scale);
            	this.my_stone_bar[i-1].setTexture("stone_" + i).setScale(this.stone_scale);
    		}
    		//setting the texture of the stone that the other 3 players really have
    		this.update_stone_of(this.leftID);
    		this.update_stone_of(this.rightID);
    		this.update_stone_of(this.topID);
    		this.update_stone_of(this.playerID);
    		
    		/*//setting the texture of the stone that "I" really have
    		for(var i = 0; i < this.stone.length; i++){
    			if(this.stone[i] === "TimeStone"){
    				this.my_stone_bar[0].setTexture("time_stone").setScale(this.stone_scale);
    			}
    			else if(this.stone[i] === "SpaceStone"){
    				this.my_stone_bar[1].setTexture("space_stone").setScale(this.stone_scale);
    			}
    			else if(this.stone[i] === "PowerStone"){
    				this.my_stone_bar[2].setTexture("power_stone").setScale(this.stone_scale);
    			}
    			else if(this.stone[i] === "RealityStone"){
    				this.my_stone_bar[3].setTexture("reality_stone").setScale(this.stone_scale);
    			}
    			else if(this.stone[i] === "SoulStone"){
    				this.my_stone_bar[4].setTexture("soul_stone").setScale(this.stone_scale);
    			}
    			else if(this.stone[i] === "MindStone"){
    				this.my_stone_bar[5].setTexture("mind_stone").setScale(this.stone_scale);
    			}
    		}*/
    	}
    }
    
    //this function will never needed to be called
    update_health(){
    	if(this.players[this.leftID] && this.players[this.rightID] && this.players[this.topID] && this.hero !== ""){
    		this.set_this_hero_health(this.blood);
    		this.set_left_hero_health(this.players[this.leftID].blood);
    		this.set_right_hero_health(this.players[this.rightID].blood);
    		this.set_top_hero_health(this.players[this.topID].blood);
    	}
    }
    
    //this function will never needed to be called
    update_available_cards(){
    	console.log("available cards: " + this.availableCards);
    	if(this.hero !== "" && this.availableCards){
    		for(var i = 0; i < this.hand_cards.length; i++){
    			var found = false;
    			for(var j = 0; j < this.availableCards.length; j++){
        			if(i === this.availableCards[j]){
        				found = true;
        			}
        		}
    			//if this card is not available
    			if(!found){
    				this.hand_cards[i].disableInteractive();
    			}
    			else{
    				this.hand_cards[i].setInteractive();
    			}
    		}
    	}
    }
   
    
    //this function will be called in update automatically. So NO NEED to call this function anywhere in the program
    update_current_hand_size(){
    	if(this.players[this.leftID] && this.players[this.rightID] && this.players[this.topID]){
    		this.left_handsize_img.setTexture(String(this.players[this.leftID].handsize)).setScale(this.hand_card_num_scale);
            this.right_handsize_img.setTexture(String(this.players[this.rightID].handsize)).setScale(this.hand_card_num_scale);
            this.top_handsize_img.setTexture(String(this.players[this.topID].handsize)).setScale(this.hand_card_num_scale);
    	}
    }
    

    
    
    set_this_hero_health(num) {
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
    	this.teammateT.setScale(this.hero_base_scale);
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
    
    add_card_click_effect(i){
        this.hand_cards[i].off("pointerdown");
        this.hand_cards[i].off("pointerover");
        this.hand_cards[i].off("pointerout");
        var depth = this.hand_cards[i].depth;
        this.hand_cards[i].on("pointerdown", ()=>{
            this.hand_cards[i].depth = depth;
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
      
        this.hand_cards[i].on("pointerover", ()=>{
            if(this.hand_cards_state[i] === "to play"){
                return;
            }
            this.hand_cards[i].setScale(this.basic_scale * 2);
            this.hand_cards[i].y = 533.14;
            this.hand_cards[i].depth = 300;
        
        });
            
        this.hand_cards[i].on("pointerout", ()=>{
            if(this.hand_cards_state[i] === "to play"){
                return;
            }
            this.hand_cards[i].setScale(this.basic_scale);
            this.hand_cards[i].y = 533.4 + 100;
            this.hand_cards[i].depth = depth;
        });
    }

    loadHeroPics() {
        this.teammateL.destroy();
        this.teammateT.destroy();
        this.teammateR.destroy();
        this.myHeroPic.destroy();

        
        // Adds images
        this.myHeroPic = this.add.image(200, 550, this.hero).setScale(0.85);
        if (!this.isThanos) {
            var leftFlag = false;
            this.teammateT = this.add.image(this.game.renderer.width/2, 130, "Thanos").setInteractive().setScale(this.hero_base_scale = 0.75);
            for (var i = 0; i < 4; i++) {
                if (this.players[i].hero === "Thanos") {
                    this.topID = i;
                }
                else if (i !== this.playerID) {
                    if (!leftFlag) {
                        this.leftID = i;
                        this.teammateL = this.add.image(100 + 30, 300, this.players[i].hero).setInteractive().setScale(this.hero_base_scale = 0.75);
                        leftFlag = true;
                    }
                    else {
                        this.rightID = i;
                        this.teammateR = this.add.image(this.game.renderer.width - 115, 300, this.players[i].hero).setInteractive().setScale(this.hero_base_scale = 0.75);
                    }
                }
            }
        }
        else {
            var i = 0;
            if (this.players[i].hero === "Thanos") {
                i++;
            }
            this.leftID = i;
            this.teammateL = this.add.image(100 + 30, 300, this.players[i].hero).setInteractive().setScale(this.hero_base_scale = 0.75);
            i++;
            if (this.players[i].hero === "Thanos") {
                i++;
            }
            this.topID = i;
            this.teammateT = this.add.image(this.game.renderer.width/2, 130, this.players[i].hero).setInteractive().setScale(this.hero_base_scale = 0.75);
            i++;
            if (this.players[i].hero === "Thanos") {
                i++;
            }
            this.rightID = i;
            this.teammateR = this.add.image(this.game.renderer.width - 115, 300, this.players[i].hero).setInteractive().setScale(this.hero_base_scale = 0.75);
        }

        // Adds listeners
        this.teammateT.on("pointerup", ()=>{
        	var i;
    		for(i = 0; i < this.hand_cards.length; i++){
    			if(this.hand_cards_state[i] === "to play"){
    				//only when to_play_card is true can we play the cards by pressing the button
    				this.to_play_card = true;
    				alert("You selected " + this.topID + ":" + this.players[this.topID].hero);
    				this.scale_back();
    	        	this.teammateT.setScale(this.hero_base_scale * 1.2);
    			}
    		}
        });
        
        this.teammateL.on("pointerup", ()=>{
        	var i;
    		for(i = 0; i < this.hand_cards.length; i++){
    			if(this.hand_cards_state[i] === "to play"){
    				this.to_play_card = true;
    				alert("You selected " + this.leftID + ":" + this.players[this.leftID].hero);
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
    				alert("You selected " + this.rightID + ":" + this.players[this.rightID].hero);
    				this.scale_back();
    	        	this.teammateR.setScale(this.hero_base_scale * 1.2);
    			}
    		}
        });

        // Sets hero health
        this.set_left_hero_health(this.players[this.leftID].blood);
        this.set_right_hero_health(this.players[this.rightID].blood);
        this.set_top_hero_health(this.players[this.topID].blood);
        this.set_this_hero_health(this.blood);
    }
    
    add_stone_effect(){
    	if(this.added_stone_effect)
    		return;
    	
    	//the following is a loooooong iffffffffff statement
    	if(this.set_left_stone_effect(0, "time_stone") &&
    	this.set_left_stone_effect(1, "space_stone") &&
    	this.set_left_stone_effect(2, "power_stone") &&
    	this.set_left_stone_effect(3, "reality_stone") &&
    	this.set_left_stone_effect(4, "soul_stone") &&
    	this.set_left_stone_effect(5, "mind_stone") &&
    	
    	this.set_right_stone_effect(0, "time_stone") &&
    	this.set_right_stone_effect(1, "space_stone") &&
    	this.set_right_stone_effect(2, "power_stone") &&
    	this.set_right_stone_effect(3, "reality_stone") &&
    	this.set_right_stone_effect(4, "soul_stone") &&
    	this.set_right_stone_effect(5, "mind_stone") &&
    	
    	this.set_top_stone_effect(0, "time_stone") &&
    	this.set_top_stone_effect(1, "space_stone") &&
    	this.set_top_stone_effect(2, "power_stone") &&
    	this.set_top_stone_effect(3, "reality_stone") &&
    	this.set_top_stone_effect(4, "soul_stone") &&
    	this.set_top_stone_effect(5, "mind_stone") &&
    	
    	this.set_my_stone_effect(0, "time_stone") &&
    	this.set_my_stone_effect(1, "space_stone") &&
    	this.set_my_stone_effect(2, "power_stone") &&
    	this.set_my_stone_effect(3, "reality_stone") &&
    	this.set_my_stone_effect(4, "soul_stone") &&
    	this.set_my_stone_effect(5, "mind_stone")) {
    		this.added_stone_effect = true;
    	}
    	
    }

    update() {
    	this.update_current_hand_size();
    	this.update_available_cards();
    	this.update_health();
    	this.update_stone();
    	
        this.textValue.text = parseInt(this.updateCount++/60).toString();
        
        if(this.updateCount >= this.time_marker + 5){
        	this.time_marker = this.updateCount;
        	this.update_remove_card();
        }
        

        if(this.left_stone_bar && this.right_stone_bar && this.top_stone_bar && this.my_stone_bar){
        	for(var i = 0; i < 6; i++){
        		this.left_stone_bar[i].rotation += this.rotation;
        		this.right_stone_bar[i].rotation += this.rotation;
        		this.top_stone_bar[i].rotation += this.rotation;
        		this.my_stone_bar[i].rotation += this.rotation;
        	}
        }
        
        this.add_stone_effect();
        
        
        if (this.isLoaded) {
            this.loadHeroPics();
            this.isLoaded = false;
        }

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