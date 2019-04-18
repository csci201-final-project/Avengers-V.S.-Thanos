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
        var hostURL = window.location.host;
        this.roomID = parseInt(get("gameID"));
        this.playerID = parseInt(get("playerID"));
        // this.username = get("username");
        this.username = get("username")
        //console.log(this.playerID);

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
        
        //THEO ADDING
        this.stones = [];
        this.update_stone_scaling = [];
       	this.update_stone_moving = [];
       	this.stone_scale_marker = [];
       	this.stone_target_ID = [];
       	this.stone_tracker = [0, 0, 0, 0];
       	this.update_bulb_top = false;
       	this.update_bulb_left = false;
       	this.update_bulb_right = false;
       	this.light_timer = 0;
       	
        this.confirmButton_interactive = false;
        this.endButton_interactive = false;
        this.test_num = -1;
        this.players = [];
        this.availableCards = [];

        this.targetID = -1;

        this.socket = new WebSocket("ws://" + hostURL + "/AVT/server");

        var self = this;  // Allows access to "this"
        
        this.currentPlayer=-1 // Tong: We need to record the current player, for start and endturn
        this.attackSource = -1; // Tong: This is dumb... but no idea of how to cleverly do that
        this.attackTarget = false;
        this.stealSource = -1;
        this.stealTarget = false;

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
            else if (obj.TYPE == "UNDEFEATABLE") {
                self.parseUndefeatable(obj);
            }
            else if (obj.TYPE == "CHANGECARD") {
                self.parseChangeCard(obj);
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

        for (var i = 0; i < this.handcard.length; i++) {
            var tempSprite = this.physics.add.sprite(1200, 633.4, this.handcard[i]).setInteractive().setScale(this.basic_scale);
            this.card_deck.push(tempSprite);
        }

        if (this.hero === "Thanos"){
        	//currentPlayer = this.playerID;
            this.isThanos = true;
        }

        var idx;
        for (idx = 0; idx < 4; idx++) {
            var tempObj = {
                attack  : obj.ATTACK[idx],
                hero    : obj.CHARACTER[idx],
                stone   : obj.STONE[idx],
                blood   : obj.BLOOD[idx],
                handsize: obj.HANDCARD[idx].length,
                isDead  : false
            }
            this.players.push(tempObj);
            console.log(tempObj);
            //console.log()
        }

        // console.log("attack: ", this.attack);
        // console.log("hero: ", this.hero);
        console.log(this.players[2].hero);
        this.isLoaded = true;
        
    }

    parseTurnStart(obj) {
    	//Tong 
    	this.currentPlayer = obj.INDEX;
        if (obj.INDEX === this.playerID) {
        	  //Tong
            this.endButton.setInteractive();
            this.endButton_interactive = true;
            
            //Tong 
            this.currentPlayer = obj.INDEX;
            this.add_turn_start_effect();
            
            //THEO ADDING
            var diff_2 = obj.STONE.length - this.stone.length;
            if(diff_2 !== 0){
            	for(var i = 0; i < diff_2; i++){
/*            		this.add_stone(obj.STONE[obj.STONE.length-1-i], obj.INDEX);
*/            	}
            }
            
            this.availableCards = obj.AVAILABLECARDS;
            this.stone = obj.STONE;

            var diff = obj.HANDCARD.length - this.handcard.length;
            this.handcard = obj.HANDCARD;
            this.handsize = obj.HANDCARD.length; // Tong 
            // 	Tong: I also modify the function below!
            // Tong: Note: This is the place where draw cards happen!
            if (diff > 0) {
                var tempSprite = this.physics.add.sprite(1200, 633.4, this.handcard[this.handcard.length-diff]).setInteractive().setScale(this.basic_scale);
                this.card_deck.push(tempSprite);
                if (diff > 1) {
                    tempSprite = this.physics.add.sprite(1200, 633.4, this.handcard[this.handcard.length-(diff-1)]).setInteractive().setScale(this.basic_scale);
                    this.card_deck.push(tempSprite);
                    if(diff > 2)
                    {
                    	 tempSprite = this.physics.add.sprite(1200, 633.4, this.handcard[this.handcard.length-1]).setInteractive().setScale(this.basic_scale);
                         this.card_deck.push(tempSprite);
                    }
                }
                
                this.draw_card(diff);
  
            }
        }
        this.players[obj.INDEX].handsize = obj.HANDCARD.length;
        this.players[obj.INDEX].stone = obj.STONE;
        
        if(this.before_start.isPlaying){
    		this.before_start.stop();
    	}
        if(!this.bg_music.isPlaying){
        	 this.bg_music.play({loop: true});
        }
        if(this.startButton){
        	this.startButton.destroy();
        }
    }

    parseDodge(obj) {
        if (obj.SOURCE.INDEX === this.playerID) {
            this.handcard = obj.SOURCE.HANDCARD;
            this.availableCards = [];
            //this.attackSource = obj.SOURCE;
            
        }
        else if (obj.TARGET.INDEX === this.playerID) {
            this.availableCards = obj.TARGET.AVAILABLECARDS;
            //console.log("Shoot, I am being attacked!")
            this.attackTarget = true; // Tong
            this.attackSource = obj.SOURCE.INDEX;// Tong
            this.confirmButton.setInteractive();
            this.confirmButton_interactive = true;
            
            //console.log("Shoot, I am being attacked!")// Tong
            this.start_be_kill_effect(); // Tong
        }
        // Tong
        else
        {
            this.start_kill_effect(obj.TARGET.INDEX);
            var x = this.game.renderer.width/2;
            var y = this.game.renderer.height/2;
            var temp  = this.add.image(x,y,"ATTACK");
            //console.log("In other player's perspective!!!")
            temp.depth = 0;
            this.fade_out_cards.push(temp);
            this.fade_out_cards_scale.push(this.basic_scale);
            this.time_marker = this.updateCount;
            
        }
        this.players[obj.SOURCE.INDEX].handsize = obj.SOURCE.HANDCARD.length;
    }

    parseTakeDamage(obj) 
    {
        if (obj.SOURCE.INDEX === this.playerID) 
        {
            this.stone = obj.SOURCE.STONE;
            this.availableCards = obj.SOURCE.AVAILABLECARDS;
            this.endButton.setInteractive();
            this.endButton_interactive = true;
            //Tong
            if(obj.TARGET.BLOOD === this.players[obj.TARGET.INDEX].blood)
        	{
        		 var x = this.game.renderer.width/2;
                 var y = this.game.renderer.height/2;
                 var temp  = this.add.image(x,y,"DODGE");
                 //console.log("In other player's perspective!!! DODGE")
                 temp.depth = 0;
                 this.fade_out_cards.push(temp);
                 this.fade_out_cards_scale.push(this.basic_scale);
                 this.time_marker = this.updateCount;
        	}
        }
        else if (obj.TARGET.INDEX === this.playerID) {
        	
            this.availableCards = [];
            this.handcard = obj.TARGET.HANDCARD;
            this.blood = obj.TARGET.BLOOD;
            if (obj.TARGET.GAMEEND === "FALSE") {
                this.gameEnd = false;
            }
            else {
                this.gameEnd = true;
            }
            // Here is the code for dead player
            if (obj.TARGET.ISDEAD === "FALSE") {
                this.isDead = false;
            }
            else {
            	//Tong: Note this is the place that a player dies, so also can get stone from here! The getter is the source player
            	this.stone = [];
                this.isDead = true;
                this.add_dead_effect(this.playerID);
            }
        }
        // Tong
        else
        {
        	if(obj.TARGET.BLOOD === this.players[obj.TARGET.INDEX].blood)
        	{
        		 var x = this.game.renderer.width/2;
                 var y = this.game.renderer.height/2;
                 var temp  = this.add.image(x,y,"DODGE");
                 //console.log("In other player's perspective!!! DODGE")
                 temp.depth = 0;
                 this.fade_out_cards.push(temp);
                 this.fade_out_cards_scale.push(this.basic_scale);
                 this.time_marker = this.updateCount;
        	}
        }
        //Tong: Dead player modification
        if (obj.TARGET.ISDEAD === "TRUE") 
        {
            this.players[obj.TARGET.INDEX].isDead = true;
            this.players[obj.TARGET.INDEX].stone = [];
            this.add_dead_effect(obj.TARGET.INDEX);
        }
        this.players[obj.SOURCE.INDEX].stone = obj.SOURCE.STONE;
        this.players[obj.TARGET.INDEX].blood = obj.TARGET.BLOOD;
        this.players[obj.TARGET.INDEX].handsize = obj.TARGET.HANDCARD.length;
        if (obj.TARGET.GAMEEND === "TRUE") {
            var gameEndType;
            if (this.blood > 0) {
                gameEndType = "win";
                this.success_sound.play();
            }
            
            else {
                gameEndType = "lose";
                this.failure_sound.play();
            }
            	
            window.location = "GameEndServlet?username=" + this.username + "&type=" + gameEndType;
        }
    }
    

    parseUndefeatable(obj) {
        if (obj.SOURCE.INDEX === this.playerID) {
            this.handcard = obj.SOURCE.HANDCARD;
            this.availableCards = [];
         
        }
        else if (obj.TARGET.INDEX === this.playerID) {
            this.availableCards = obj.TARGET.AVAILABLECARDS;
            this.stealTarget = true; // Tong
            this.stealSource = obj.SOURCE.INDEX; //Tong
            this.confirmButton.setInteractive();
            this.confirmButton_interactive = true;
            //console.log("Shoot, I am being stolen!");
            this.start_be_steal_effect();
        }
        // Tong 
        else
        {
        	this.start_steal_effect(obj.TARGET.INDEX);
        	 var x = this.game.renderer.width/2;
             var y = this.game.renderer.height/2;
             var temp  = this.add.image(x,y,"STEAL");
             //console.log("In other player's perspective!!!  STEAL" )
             temp.depth = 0;
             this.fade_out_cards.push(temp);
             this.fade_out_cards_scale.push(this.basic_scale);
             this.time_marker = this.updateCount;
        }
        this.players[obj.SOURCE.INDEX].handsize = obj.SOURCE.HANDCARD.length;
    }

    parseChangeCard(obj) {
        if (obj.SOURCE.INDEX === this.playerID) {
        	var tempHand = obj.SOURCE.HANDCARD;
         	var tempStone = obj.SOURCE.STONE;
        	if (tempHand.length === this.handcard.length&&tempStone.length===this.stone.length)
         	{
         		 var x = this.game.renderer.width/2;
                 var y = this.game.renderer.height/2;
                 var temp  = this.add.image(x,y,"UNDEFEATABLE");
                 //console.log("In other player's perspective!!!  RESIST" )
                 temp.depth = 0;
                 this.fade_out_cards.push(temp);
                 this.fade_out_cards_scale.push(this.basic_scale);
                 this.time_marker = this.updateCount;
         	}
        	// Tong: Note this is the place where the stones are changed from one player to another
        	var stoneDiff = obj.SOURCE.STONE.length - this.stone.length;
        	if(stoneDiff>0)
        	{
            	for(var i = 0; i < stoneDiff; i++){
/*            		this.add_stone(obj.SOURCE.STONE[obj.SOURCE.STONE.length-1-i], obj.SOURCE.INDEX);
*/            	}
        		// obj.SOURCE.STONE[obj.SOURCE.STONE.length] This gives the access to the stone being drawn
        	}
            this.stone = obj.SOURCE.STONE;
            this.availableCards = obj.SOURCE.AVAILABLECARDS;
            this.handsize = obj.SOURCE.HANDCARD.length;
            

            var diff = obj.SOURCE.HANDCARD.length - this.handcard.length;
            this.handcard = obj.SOURCE.HANDCARD;
            if (diff > 0) {
                var tempSprite = this.physics.add.sprite(1200, 633.4, this.handcard[this.handcard.length-1]).setInteractive().setScale(this.basic_scale);
                this.card_deck.push(tempSprite);
                this.draw_card(1);
            }
            // Tong
            this.endButton.setInteractive();
            this.endButton_interactive = true;
        }
        // Tong
        else if(obj.TARGET.INDEX !== this.playerID)
        {
        	var tempHand = obj.SOURCE.HANDCARD;
        	var tempStone = obj.SOURCE.STONE;
        	if (tempHand.length === this.players[obj.SOURCE.INDEX].handsize&&tempStone.length===this.players[obj.SOURCE.INDEX].stone.length)
        	{
        		var x = this.game.renderer.width/2;
                var y = this.game.renderer.height/2;
                var temp  = this.add.image(x,y,"UNDEFEATABLE");
                //console.log("In other player's perspective!!!  RESIST" )
                temp.depth = 0;
                this.fade_out_cards.push(temp);
                this.fade_out_cards_scale.push(this.basic_scale);
                this.time_marker = this.updateCount;
        	}
        }
        else if (obj.TARGET.INDEX === this.playerID) {
            this.availableCards = [];
            this.stone = obj.TARGET.STONE;
            this.handsize = obj.TARGET.HANDCARD.length;
            
            var tempHand = obj.TARGET.HANDCARD;
            if (tempHand.length !== this.handcard.length) {
                var i = 0;
                var j = 0;
                while (tempHand[i] === this.handcard[j]) {
                    i++;
                    j++;
                }
                this.removeCard(i);
                this.handcard = tempHand;
            }
            
            // BUG!!! We ignore the case that a player is dead
        }
        
        this.players[obj.TARGET.INDEX].handsize = obj.TARGET.HANDCARD.length;
        this.players[obj.SOURCE.INDEX].handsize = obj.SOURCE.HANDCARD.length;
        this.players[obj.TARGET.INDEX].stone = obj.TARGET.STONE;
        this.players[obj.SOURCE.INDEX].stone = obj.SOURCE.STONE;
    }

    init() {
        
    }

    preload() {
        //DEBUG
        this.load.image("start-btn", "./assets/start-button.png");
    }

    create() {
        //Adding music, need to be commented back
    	this.before_start = this.sound.add("before_start");
    	this.before_start.play({loop: true});
    	this.before_start.volume = 1.5;
    	
    	
    	 //THEO ADDING
        this.bg_music = this.sound.add("bg_music");
        var self = this;
        this.be_attacked_sound = this.sound.add("be_attacked");
    	this.attack_sound = this.sound.add("attack");
    	
        this.be_attacked_sound.on('play', function(be_attacked_sound){
    		self.bg_music.setVolume(0.2);
    	});
        this.be_attacked_sound.on('complete', function(be_attacked_sound){
        	self.bg_music.setVolume(1);
        });
        this.attack_sound.on('play', function(attack_sound){
        	self.bg_music.setVolume(0.2);
    	});
        this.attack_sound.on('complete', function(attack_sound){
        	self.bg_music.setVolume(1);
        });
        
        this.steal_sound = this.sound.add("steal_sound");
        this.be_stealed_sound = this.sound.add("be_stealed_sound");
        this.be_stealed_sound.on('play', function(be_stealed_sound){
    		self.bg_music.setVolume(0.2);
    	});
        this.be_stealed_sound.on('complete', function(be_stealed_sound){
        	self.bg_music.setVolume(1);
        });
        this.steal_sound.on('play', function(steal_sound){
        	self.bg_music.setVolume(0.2);
    	});
        this.steal_sound.on('complete', function(steal_sound){
        	self.bg_music.setVolume(1);
        });
        
        this.turn_start_sound = this.sound.add("turn_start");
        this.turn_start_sound.on('play', function(turn_start){
    		self.bg_music.setVolume(0.2);
    	});
        this.turn_start_sound.on('complete', function(turn_start){
        	self.bg_music.setVolume(1);
        });
        
        this.turn_end_sound = this.sound.add("turn_end");
        this.turn_end_sound.on('play', function(turn_end){
    		self.bg_music.setVolume(0.2);
    	});
        this.turn_start_sound.on('complete', function(tuen_end){
        	self.bg_music.setVolume(1);
        });
        
        this.success_sound = this.sound.add("success");
        this.success_sound.on('play', function(turn_end){
    		self.bg_music.setVolume(0.2);
    	});
        this.success_sound.on('complete', function(tuen_end){
        	self.bg_music.setVolume(1);
        });
        
        this.failure_sound = this.sound.add("failure");
        this.failure_sound.on('play', function(turn_end){
    		self.bg_music.setVolume(0.2);
    	});
        this.failure_sound.on('complete', function(tuen_end){
        	self.bg_music.setVolume(1);
        });
        
        
    	//theo adding
    	this.my_camera = this.cameras.main;
    	
    	

        // Adds all images
        this.add.image(this.game.renderer.width/2, this.game.renderer.height/2 - 100, "background");
        this.add.image(this.game.renderer.width/2, this.game.renderer.height - 125, "bottom-bar");
        
        // Adds empty hero pics
        this.hero_base_scale = 0.75;
        this.myHeroPic = this.add.image(200, 550, "undecided").setScale(0.85);
       	this.teammateL = this.add.image(100 + 30, 300, "undecided").setInteractive().setScale(this.hero_base_scale = 0.75);
        this.teammateR = this.add.image(this.game.renderer.width - 115, 300, "undecided").setInteractive().setScale(this.hero_base_scale = 0.75);
        this.teammateT = this.add.image(this.game.renderer.width/2, 130, "undecided").setInteractive().setScale(this.hero_base_scale = 0.75);
        
        // Adds handsize icons
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
  
        this.physics.add.sprite(1200 - 20, 633.4 - 10, "card_deck").setScale(this.card_cover_scale).depth = 30;

        var style = { font: "65px Arial", fill: "#ff0000", align: "center" };
        this.textValue = this.add.text(0, 0, "0", style);
        this.updateCount = 0;

        this.num_to_draw = 5;
        // this.initialize_hand = true;
        this.deck_top_index = 0;
        
        
        
        // Adds end turn button
        this.endButton = this.add.image(this.game.renderer.width - 114, this.game.renderer.height - 100, "end_turn").setScale(0.425);
        this.endButton.depth = 30;
        this.endButton.setInteractive({ useHandCursor: true });
        this.endButton_interactive = true;
        this.endButton.on("pointerover", ()=>{
        	this.start_rotating_endbutton = true;
        	this.speed_endButton = 0.5;
        });
        this.endButton.on("pointerout", ()=>{
        	this.start_rotating_endbutton = false;
        	this.endButton.angle = 0;
        	this.speed_endButton = 0.5;
        });
        this.endButton.on("pointerup", ()=>{
        	this.add_turn_end_effect();
        	
            var tempObj = {};
            tempObj.TYPE = "PLAYEREND";
            tempObj.TARGET = this.playerID;
            tempObj.GAMEID = this.roomID;
            console.log(JSON.stringify(tempObj));
            this.socket.send(JSON.stringify(tempObj));
            this.endButton.disableInteractive();
            this.endButton_interactive = false;
        });

        
        //THEO ADDING
        this.fade_out_cards = [];
        this.fade_out_cards_scale = [];
        
        
        // Adds confirm button effect
        this.confirmButton = this.add.image(this.game.renderer.width - 116, this.game.renderer.height - 170, "confirm-button").setScale(0.42);
        this.confirmButton.setInteractive({ useHandCursor: true });
        this.confirmButton_interactive = true;
        this.confirmButton.depth = 30;
        
        this.confirmButton.on("pointerover", ()=>{
        	this.start_rotating = true;
        	 this.speed = 0.5;
        });
        this.confirmButton.on("pointerout", ()=>{
        	this.start_rotating = false;
        	this.confirmButton.angle = 0;
        	 this.speed = 0.5;
        });
        

        
        //Tong: This function is modified heavily by me! Please double check!
        this.confirmButton.on("pointerup", ()=>{
        	/*this.add_turn_start_effect();*/
        	
        	//console.log(this.to_play_card);
        	var index =  this.hand_cards_state.indexOf("to play");
        	//console.log(index);
        	var tempObj = {};
        	//I am being attacked
        	if(this.attackTarget===true)
        	{
        		tempObj.TYPE = "DODGE";
                tempObj.GAMEID = this.roomID;
                tempObj.CARD = index;
                tempObj.SOURCE = this.attackSource;
                tempObj.TARGET = this.playerID;
        		this.attackTarget = false;
        	}
        	else if(this.stealTarget===true)
        	{
        		tempObj.TYPE = "UNDEFEATABLE";
                tempObj.GAMEID = this.roomID;
                tempObj.CARD = index;
                tempObj.SOURCE = this.stealSource;
                tempObj.TARGET = this.playerID;
        		this.stealTarget = false;
        		 this.start_be_steal_effect();
        	}
        	else // Note: this is not dumb-user proof :D
        	{
                this.scale_back();
                // Sends to backend (type: attack, steal)
                if (this.targetID !== -1) 
                {
                   //Tong: I modify the code below
                    if (this.handcard[index] === "STEAL") {
                        tempObj.TYPE = "STEAL";
                        tempObj.GAMEID = this.roomID;
                        tempObj.CARD = index;
                        tempObj.TARGET = this.targetID;
                        tempObj.SOURCE = this.playerID;
                        this.start_steal_effect(this.targetID);
                    }
                    else 
                    {
                        tempObj.TYPE = "ATTACK";
                        tempObj.GAMEID = this.roomID;
                        tempObj.CARD = index;
                        tempObj.SOURCE = this.playerID;
                        tempObj.TARGET = this.targetID;
                        
                        //THEO ADDING
                        this.start_kill_effect(this.targetID);
                    }
                    
                }
                
                // end of Tong's modification
        	}
        	console.log(JSON.stringify(tempObj));
            this.socket.send(JSON.stringify(tempObj));	
        	if(index!=-1)
            {
             	this.removeCard(index);
            }
            this.confirmButton.disableInteractive();
            this.confirmButton_interactive = false;
        	this.endButton.disableInteractive();
        	this.endButton_interactive = false;
        });
      
        this.startButton = this.add.image(this.game.renderer.width/2 - 30, this.game.renderer.height/2 - 50, "start-btn");
        this.startButton.setInteractive({ useHandCursor: true });
        this.startButton.once("pointerup", ()=>{
            var tempObj = {};
            tempObj.TYPE = "GAMESTART";
            tempObj.GAMEID = this.roomID;
            this.socket.send(JSON.stringify(tempObj));
        });

        //creating the empty_stones
        this.stone_scale = 0.35;
        this.left_stone_bar = [];
        this.right_stone_bar = [];
        this.top_stone_bar = [];
        this.my_stone_bar = [];
        
        //THEO ADDING (please replace the original code with the following one (
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
      //THEO ADDING (please replace the original code with the following one )

        // Game start signal
        var tempObj = {};
        tempObj.GAMEID = this.roomID;
        tempObj.USERNAME = this.username;
        if (this.playerID === 0) {
            tempObj.TYPE = "NEWGAME";
        }
        else 
        {
            tempObj.TYPE = "CONNECTION";
        }
   
        this.socket.send(JSON.stringify(tempObj));
        this.confirmButton.disableInteractive();
        this.confirmButton_interactive = false;
        this.endButton.disableInteractive();
        this.endButton_interactive = false;
        
        //THEO ADDING
        this.setting_up_bulb();
        
        // end of create
    }
    
    //THEO ADDING
    
    //call this function whenever this is the current player's turn. No need to do anything further
    add_turn_start_effect(){
    	this.turn_start_pic = this.add.image(this.game.renderer.width/2, this.game.renderer.height/2, "turn_start").setScale(0.6);
    	this.is_starting_turn = true;
    	this.time_marker_start_turn = this.updateCount;
    	this.turn_start_sound.play();
    }
    
    add_turn_end_effect(){
    	this.turn_end_pic = this.add.image(this.game.renderer.width/2, this.game.renderer.height/2, "turn_end").setScale(0.6);
    	this.is_ending_turn = true;
    	this.time_marker_end_turn = this.updateCount;
    	this.turn_end_sound.play();
    }
    
    
    
    //please pass in the playerID of the player who is currently taking his/her turn. NO NEED TO CALL THIS FUNCTION MANUALLY.
    //please ask Theo for how to use this function.
    update_bulb(playerID){
    	if(this.bulb_top && this.bulb_right && this.bulb_left){
    		//if I have not received any information yet, then playerID is set to -1 by default. So no bulbs should appear.
    		if(playerID === -1){
    			//console.log("IN: 1" );
    			this.bulb_right.visible = false;
    			this.bulb_left.visible = false;
    			this.bulb_top.visible = false;
    			
    			this.update_bulb_left = false;
    			this.update_bulb_right = false;
    			this.update_bulb_top = false;
    			return;
    		}
    		if(playerID === this.topID){
    			//console.log("IN: 2" )
    			this.bulb_right.visible = false;
    			this.bulb_left.visible = false;
    			this.bulb_top.visible = true;
    			
    			this.update_bulb_left = false;
    			this.update_bulb_right = false;
    			this.update_bulb_top = true;
    		}
    		else if(playerID === this.leftID){
    			//console.log("IN: 3" )
    			this.bulb_right.visible = false;
    			this.bulb_left.visible = true;
    			this.bulb_top.visible = false;
    			
    			this.update_bulb_left = true;
    			this.update_bulb_right = false;
    			this.update_bulb_top = false;
    		}
    		else if(playerID === this.rightID){
    			//console.log("IN: 4" )
    			this.bulb_right.visible = true;
    			this.bulb_left.visible = false;
    			this.bulb_top.visible = false;

    			this.update_bulb_left = false;
    			this.update_bulb_right = true;
    			this.update_bulb_top = false;
    		}
    		else if(playerID === this.playerID){
    			//console.log("IN: 5" )
    			this.bulb_right.visible = false;
    			this.bulb_left.visible = false;
    			this.bulb_top.visible = false;
    			
    			this.update_bulb_left = false;
    			this.update_bulb_right = false;
    			this.update_bulb_top = false;
    		}
    	}
    }
    
    //call this function if a player dies. ONLY FOR ADDING EFFECT. NO REAL EFFECT ON GAME LOGIC
    add_dead_effect(targetID){
    	var target;
    	if(targetID === this.topID){
    		target = this.teammateT;
    	}
    	else if(targetID === this.leftID){
    		target = this.teammateL;
    	}
    	else if(targetID === this.rightID){
    		target = this.teammateR;
    	}
    	else if(targetID === this.playerID){
    		target = this.myHeroPic;
    	}
    	else{
    		// alert("You have some error in the function 'set_dead_effect'");
    	}
    	
    	this.add.image(target.x, target.y, "cross").setScale(0.3);
    }
    
    setting_up_bulb(){
    	var bulb_scale = 0.4;
    	this.bulb_top = this.add.image(this.teammateT.x - 150, this.teammateT.y, "bulb").setScale(bulb_scale);
    	this.bulb_right = this.add.image(this.teammateR.x - 150, this.teammateR.y, "bulb").setScale(bulb_scale);
    	this.bulb_left = this.add.image(this.teammateL.x + 150, this.teammateL.y, "bulb").setScale(bulb_scale);
    	this.bulb_top.visible = false;
    	this.bulb_right.visible = false;
    	this.bulb_left.visible = false;
    	//console.log("After setting up blub");
    	//console.log(this.bulb_top);
    } 
    
    start_be_steal_effect(){
    	this.fade_camera();
        this.be_stealed_sound.play();
    }
    
    start_steal_effect(targetID){
    	this.steal_sound.play();
    	this.steal_pic_scale = 0.1;
    	var target;
    	if(targetID === this.topID){
    		target = this.teammateT;
    		this.steal_pic = this.add.image(target.x + 100, target.y, "steal_effect").setScale(this.steal_pic_scale);
    	}
    	else if(targetID === this.leftID){
    		target = this.teammateL;
    		this.steal_pic = this.add.image(target.x + 100, target.y, "steal_effect").setScale(this.steal_pic_scale);
    	}
    	else if(targetID === this.rightID){
    		target = this.teammateR;
    		this.steal_pic = this.add.image(target.x + 100, target.y, "steal_effect").setScale(this.steal_pic_scale);
    	}
    	else{
    		// alert("You have some error in the function 'start_steal_effect'");
    	}

    	this.is_stealing = true;
    	this.time_marker_steal = this.updateCount;
    }
    
    
    
    start_be_kill_effect(){
    	this.be_attacked_sound.play();
    	this.shake_camera();
    	this.temp_pic = this.add.image(this.myHeroPic.x, this.myHeroPic.y, "cross").setScale(0.2);
    	this.to_update_be_killed = true;
    	this.time_marker_be_killed = this.updateCount;
    
    }
    
    //THEO ADDING(
    start_kill_effect(targetID){
    	this.attack_sound.play();
    	var target;
    	if(targetID === this.topID){
    		target = this.teammateT;
    	}
    	else if(targetID === this.leftID){
    		target = this.teammateL;
    	}
    	else if(targetID === this.rightID){
    		target = this.teammateR;
    	}
    	else{
    		// alert("You have some error in the function 'start_kill_effect'");
    	}
    	
    	this.cross_pic_scale = 0.6;
    	this.cross_pic = this.add.image(target.x, target.y, "cross").setScale(this.cross_pic_scale);
    	this.is_killing = true;
    	this.time_marker_kill = this.updateCount;
    	this.stay_kill_pic = false;
    }
    
    update_kill_effect(){
    	if(this.is_killing && !this.stay_kill_pic){
    		this.cross_pic_scale -= 0.009;
    		this.cross_pic.setScale(this.cross_pic_scale);
    		if(this.cross_pic_scale < 0.1){
    			this.stay_kill_pic = true;
    			this.time_marker_kill_time_to_stay = 35;
    		}
    	}
    	else if(this.is_killing && this.stay_kill_pic){
    		this.time_marker_kill_time_to_stay--;
    		if(this.time_marker_kill_time_to_stay === 0){
    			this.is_killing = false;
        		this.cross_pic.destroy();
        		this.time_marker_kill = 0;
        		this.stay_kill_pic = false;
    		}
    	}
    }
    
    fade_camera(){
    	this.cameras.main.fadeIn(3500);
    }
    shake_camera(){
    	this.my_camera.shake(500);
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
    
    //THEO ADDING)
    
    //THEO ADDING
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
        			i--;
        		}
    		}
    	}
    }
    
    //helper function of update_stone()
    update_stone_of(ID){
        var stone_bar;
        if (ID === this.leftID){
            stone_bar = this.left_stone_bar;
        }
        else if (ID === this.rightID){
            stone_bar = this.right_stone_bar;
        }
        else if (ID === this.topID){
            stone_bar = this.top_stone_bar;
        }
        else if (ID === this.playerID) {
            stone_bar = this.my_stone_bar;
        }
        else{
            // alert("Something is going wrong in stone!!!");
        }
        var to_detect_stone = [];
        for(var i = 0; i < 6; i++){
        	to_detect_stone.push(true);
        }
         

        for(var i = 0; i < this.stones.length; i++){
        	if(this.stones[i].texture.key === "time_stone"){
        		to_detect_stone[0] = false;
        	}
        	else if(this.stones[i].texture.key === "space_stone"){
        		to_detect_stone[1] = false;
        	}
        	else if(this.stones[i].texture.key === "power_stone"){
        		to_detect_stone[2] = false;
        	}
        	else if(this.stones[i].texture.key === "reality_stone"){
        		to_detect_stone[3] = false;
        	}
        	else if(this.stones[i].texture.key === "soul_stone"){
        		to_detect_stone[4] = false;
        	}
        	else if(this.stones[i].texture.key === "mind_stone"){
        		to_detect_stone[5] = false;
        	}
        }
        
        
        for(var i = 0; i < this.players[ID].stone.length; i++){
            if(this.players[ID].stone[i] === "TimeStone" && to_detect_stone[0]){
                stone_bar[0].setTexture("time_stone").setScale(this.stone_scale);
            }
            else if(this.players[ID].stone[i] === "SpaceStone" && to_detect_stone[1]){
                stone_bar[1].setTexture("space_stone").setScale(this.stone_scale);
            }
            else if(this.players[ID].stone[i] === "PowerStone" && to_detect_stone[2]){
                stone_bar[2].setTexture("power_stone").setScale(this.stone_scale);
            }
            else if(this.players[ID].stone[i] === "RealityStone" && to_detect_stone[3]){
                stone_bar[3].setTexture("reality_stone").setScale(this.stone_scale);
            }
            else if(this.players[ID].stone[i] === "SoulStone" && to_detect_stone[4]){
                stone_bar[4].setTexture("soul_stone").setScale(this.stone_scale);
            }
            else if(this.players[ID].stone[i] === "MindStone" && to_detect_stone[5]){
                stone_bar[5].setTexture("mind_stone").setScale(this.stone_scale);
            }
        }
    }

    removeCard(index) {
        this.hand_cards[index].x = this.game.renderer.width/2;
        this.hand_cards[index].y = this.game.renderer.height/2;
        this.hand_cards[index].depth = 0;

		//adding fading effect after the card is played out
		this.fade_out_cards.push(this.hand_cards[index]);
		this.fade_out_cards_scale.push(this.basic_scale);
		this.time_marker = this.updateCount;
		
		this.hand_cards[index].removeInteractive();
        this.arrange_hand_cards(index);
        
        this.hand_cards_state.splice(index, 1);
        this.hand_cards.splice(index, 1);
        this.handcard.splice(index, 1);
        
        this.to_play_card = false;
        var i;
        for(i = 0; i < this.hand_cards.length; i++){
            this.add_card_click_effect(i);
        }
    }

    //this function will never needed to be called
    update_stone(){
    	if(this.players[this.leftID] && this.players[this.rightID] && this.players[this.topID] && this.hero !== ""){
    		for(var i = 0; i < 4; i++){
    			//if I got more stones
    			var diff = this.players[i].stone.length - this.stone_tracker[i];
    			if(diff > 0){
    				for(var j = 0; j < diff; j++){
    					this.add_stone(this.players[i].stone[this.players[i].stone.length-1-j], i);
    				}
    			}
    			this.stone_tracker[i] = this.players[i].stone.length;
    		}
    		
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
    	//console.log("available cards: " + this.availableCards);
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
    		// alert("The Health You Want To Set Exceeds The Hero's Max Health!");
    	}
    	for(var i = 0; i < num; i++){
    		this.health_bar[i].visible = true;
    	}
    	if(num>=0)
    	{
    		for(var i = num; i < this.MAX_HEALTH; i++){
    			this.health_bar[i].visible = false;
    		}
    	}
    	if(num<0)
    	{
    		for(var i = 0; i < this.MAX_HEALTH; i++){
    			this.health_bar[i].visible = false;
    		}
    	}
    }
    // Tong: adjust for possible negative i index
    set_left_hero_health(num){
    	if(num > this.MAX_HEALTH_LEFT){
    		// alert("The Health You Want To Set Exceeds The Hero's Max Health!");
    	}
    	for(var i = 0; i < num; i++){
    		this.health_bar_left[i].visible = true;
    	}
    	if(num>=0)
    	{
    		for(var i = num; i < this.MAX_HEALTH_LEFT; i++){
    			this.health_bar_left[i].visible = false;
    		}
    	}
    	if(num<0)
    	{
    		for(var i = 0; i < this.MAX_HEALTH_LEFT; i++){
    			this.health_bar_left[i].visible = false;
    		}
    	}
    }
    
    set_top_hero_health(num){
    	if(num > this.MAX_HEALTH_TOP){
    		// alert("The Health You Want To Set Exceeds The Hero's Max Health!");
    	}
    	for(var i = 0; i < num; i++){
    		this.health_bar_top[i].visible = true;
    	}
    	if(num>=0)
    	{
    		for(var i = num; i < this.MAX_HEALTH_TOP; i++){
    			this.health_bar_top[i].visible = false;
    		}
    	}
    	if(num<0)
    	{
    		for(var i = 0; i < this.MAX_HEALTH_TOP; i++){
    			this.health_bar_top[i].visible = false;
    		}
    	}
    }
    
    set_right_hero_health(num){
    	if(num > this.MAX_HEALTH_RIGHT){
    		// alert("The Health You Want To Set Exceeds The Hero's Max Health!");
    	}
    	for(var i = 0; i < num; i++){
    		this.health_bar_right[i].visible = true;
    	}
    	if(num>=0)
    	{
    		for(var i = num; i < this.MAX_HEALTH_RIGHT; i++){
    			this.health_bar_right[i].visible = false;
    		}
    	}
    	if(num<0)
    	{
    		for(var i = 0; i < this.MAX_HEALTH_RIGHT; i++){
    			this.health_bar_right[i].visible = false;
    		}
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
    
    //remember to make it an array to prevent you add two stones at the same time!!! 
    add_stone(stone_name, ID){
    	var stone;
    	if(stone_name === "TimeStone"){
    		if(ID === this.leftID){
    			stone = this.physics.add.sprite(this.game.renderer.width/2, this.left_stone_bar[0].y, "time_stone").setScale(2);
    		}
    		else if(ID === this.rightID){
    			stone = this.physics.add.sprite(this.game.renderer.width/2, this.right_stone_bar[0].y, "time_stone").setScale(2);
    		}
    		else if(ID === this.topID){
    			stone = this.physics.add.sprite(this.top_stone_bar[0].x, this.game.renderer.height/2, "time_stone").setScale(2);
    		}
    		else if(ID === this.playerID){
    			stone = this.physics.add.sprite(this.game.renderer.width/2, this.my_stone_bar[0].y, "time_stone").setScale(2);
    		}
    	}
    	else if(stone_name === "SpaceStone"){
    		if(ID === this.leftID){
    			stone = this.physics.add.sprite(this.game.renderer.width/2, this.left_stone_bar[1].y, "space_stone").setScale(2);
    		}
    		else if(ID === this.rightID){
    			stone = this.physics.add.sprite(this.game.renderer.width/2, this.right_stone_bar[1].y, "space_stone").setScale(2);
    		}
    		else if(ID === this.topID){
    			stone = this.physics.add.sprite(this.top_stone_bar[0].x, this.game.renderer.height/2, "space_stone").setScale(2);
    		}
    		else if(ID === this.playerID){
    			stone = this.physics.add.sprite(this.game.renderer.width/2, this.my_stone_bar[1].y, "space_stone").setScale(2);
    		}
    	}
    	else if(stone_name === "PowerStone"){
    		if(ID === this.leftID){
    			stone = this.physics.add.sprite(this.game.renderer.width/2, this.left_stone_bar[2].y, "power_stone").setScale(2);
    		}
    		else if(ID === this.rightID){
    			stone = this.physics.add.sprite(this.game.renderer.width/2, this.right_stone_bar[2].y, "power_stone").setScale(2);
    		}
    		else if(ID === this.topID){
    			stone = this.physics.add.sprite(this.top_stone_bar[0].x, this.game.renderer.height/2, "power_stone").setScale(2);
    		}
    		else if(ID === this.playerID){
    			stone = this.physics.add.sprite(this.game.renderer.width/2, this.my_stone_bar[2].y, "power_stone").setScale(2);
    		}
    	}
    	else if(stone_name === "RealityStone"){
    		if(ID === this.leftID){
    			stone = this.physics.add.sprite(this.game.renderer.width/2, this.left_stone_bar[3].y, "reality_stone").setScale(2);
    		}
    		else if(ID === this.rightID){
    			stone = this.physics.add.sprite(this.game.renderer.width/2, this.right_stone_bar[3].y, "reality_stone").setScale(2);
    		}
    		else if(ID === this.topID){
    			stone = this.physics.add.sprite(this.top_stone_bar[0].x, this.game.renderer.height/2, "reality_stone").setScale(2);
    		}
    		else if(ID === this.playerID){
    			stone = this.physics.add.sprite(this.game.renderer.width/2, this.my_stone_bar[3].y, "reality_stone").setScale(2);
    		}
    	}
    	else if(stone_name === "SoulStone"){
    		if(ID === this.leftID){
    			stone = this.physics.add.sprite(this.game.renderer.width/2, this.left_stone_bar[4].y, "soul_stone").setScale(2);
    		}
    		else if(ID === this.rightID){
    			stone = this.physics.add.sprite(this.game.renderer.width/2, this.right_stone_bar[4].y, "soul_stone").setScale(2);
    		}
    		else if(ID === this.topID){
    			stone = this.physics.add.sprite(this.top_stone_bar[0].x, this.game.renderer.height/2, "soul_stone").setScale(2);
    		}
    		else if(ID === this.playerID){
    			stone = this.physics.add.sprite(this.game.renderer.width/2, this.my_stone_bar[4].y, "soul_stone").setScale(2);
    		}
    	}
    	else if(stone_name === "MindStone"){
    		if(ID === this.leftID){
    			stone = this.physics.add.sprite(this.game.renderer.width/2, this.left_stone_bar[5].y, "mind_stone").setScale(2);
    		}
    		else if(ID === this.rightID){
    			stone = this.physics.add.sprite(this.game.renderer.width/2, this.right_stone_bar[5].y, "mind_stone").setScale(2);
    		}
    		else if(ID === this.topID){
    			stone = this.physics.add.sprite(this.top_stone_bar[0].x, this.game.renderer.height/2, "mind_stone").setScale(2);
    		}
    		else if(ID === this.playerID){
    			stone = this.physics.add.sprite(this.game.renderer.width/2, this.my_stone_bar[5].y, "mind_stone").setScale(2);
    		}
    	}
    	stone.depth = 50;
    	this.stones.push(stone);
    	this.update_stone_scaling.push(true)
       	this.update_stone_moving.push(false);
       	this.stone_scale_marker.push(this.updateCount);
   		this.stone_target_ID.push(ID);
    }
    
    draw_card(num){
    	if(this.hand_cards.length + num > 5){
    		// alert("You already have 5 cards. You can not draw any more cards!");
			return;
		}
    	this.num_to_draw = num;
    	var i;
    	for(i = 0; i < num; i++){
    		this.hand_cards.push(this.card_deck.shift());
    		console.log(this.hand_cards.length);
    		this.hand_cards[this.hand_cards.length-1].body.setVelocityX(-350);
    		this.hand_cards[this.hand_cards.length-1].depth = 1;
    		console.log("I currently have handsize = " + this.hand_cards.length);
            //this.hand_cards[this.hand_cards.length-1].depth = 1;
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
        	this.confirmButton.setInteractive();
        	this.confirmButton_interactive = true;
        	var i;
    		for(i = 0; i < this.hand_cards.length; i++){
    			if(this.hand_cards_state[i] === "to play"){
    				//only when to_play_card is true can we play the cards by pressing the button
    				this.to_play_card = true;
    				// alert("You selected " + this.topID + ":" + this.players[this.topID].hero);
    				this.scale_back();
                    this.teammateT.setScale(this.hero_base_scale * 1.2);
                    this.targetID = this.topID;
    			}
    		}
        });
        
        this.teammateL.on("pointerup", ()=>{
        	this.confirmButton.setInteractive();
        	this.confirmButton_interactive = true;
        	var i;
    		for(i = 0; i < this.hand_cards.length; i++){
    			if(this.hand_cards_state[i] === "to play"){
    				this.to_play_card = true;
    				// alert("You selected " + this.leftID + ":" + this.players[this.leftID].hero);
    				this.scale_back();
                    this.teammateL.setScale(this.hero_base_scale * 1.2);
                    this.targetID = this.leftID;
    			}
    		}
        });
        
        this.teammateR.on("pointerup", ()=>{
        	this.confirmButton.setInteractive();
        	this.confirmButton_interactive = true;
        	var i;
    		for(i = 0; i < this.hand_cards.length; i++){
    			if(this.hand_cards_state[i] === "to play"){
    				this.to_play_card = true;
    				// alert("You selected " + this.rightID + ":" + this.players[this.rightID].hero);
    				this.scale_back();
    	        	this.teammateR.setScale(this.hero_base_scale * 1.2);
                    this.targetID = this.rightID;
                }
    		}
        });

        this.draw_card(this.card_deck.length);

        // Sets hero health
        this.set_left_hero_health(this.players[this.leftID].blood);
        this.set_right_hero_health(this.players[this.rightID].blood);
        this.set_top_hero_health(this.players[this.topID].blood);
        this.set_this_hero_health(this.blood);
    }
    
  //THEO ADDING
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
    
    
    update() 
    {
        this.update_current_hand_size();
    	this.update_available_cards();
    	this.update_health();
    	this.update_stone();
    	
    	
    	//updating the light_bulb
    	if(this.updateCount >= this.light_timer + 5){
    		this.light_timer = this.updateCount;
    		if(this.update_bulb_left){
    			if(this.bulb_left.texture.key === "bulb"){
    				this.bulb_left.setTexture("bulb2");
    			}
    			else{
    				this.bulb_left.setTexture("bulb");
    			}
    		}
    		else if(this.update_bulb_right){
    			if(this.bulb_right.texture.key === "bulb"){
    				this.bulb_right.setTexture("bulb2");
    			}
    			else{
    				this.bulb_right.setTexture("bulb");
    			}
    		}
    		else if(this.update_bulb_top){
    			if(this.bulb_top.texture.key === "bulb"){
    				this.bulb_top.setTexture("bulb2");
    			}
    			else{
    				this.bulb_top.setTexture("bulb");
    			}
    		}
    	}
    	
    	//Theo ADDING  // Tong modified
    	this.update_bulb(this.currentPlayer);
    	if(this.to_update_be_killed){
    		if(this.updateCount >= this.time_marker_be_killed + 300){
            	this.temp_pic.destroy();
            	this.to_update_be_killed = false;
            }
    	}
    	
    	
    	 if(this.confirmButton){
         	if(this.start_rotating){
         		this.confirmButton.angle += this.speed;
         		if(this.confirmButton.angle >= 45){
         			this.speed = -0.5;
         		}
         		if(this.confirmButton.angle <= -45){
          			this.speed = 0.5;
          		}
         	}
         }
    	 
    	 if(this.endButton){
          	if(this.start_rotating_endbutton){
          		this.endButton.angle += this.speed_endButton;
          		if(this.endButton.angle >= 45){
          			this.speed_endButton = -0.5;
          		}
          		if(this.endButton.angle <= -45){
          			this.speed_endButton = 0.5;
          		}
          	}
          }
    	
    	if(this.is_stealing){
    		if(this.updateCount >= this.time_marker_steal + 300){
                if(this.steal_pic){
                    this.steal_pic.destroy();
                }
    			
            	this.is_stealing = false;
            }
    	}

    	if(this.is_starting_turn){
    		if(this.updateCount >= this.time_marker_start_turn + 300){
    			this.turn_start_pic.destroy();
    			this.is_starting_turn = false;
            }
    	}
    	

    	if(this.is_ending_turn){
    		if(this.updateCount >= this.time_marker_end_turn + 300){
    			this.turn_end_pic.destroy();
    			this.is_ending_turn = false;
    		}
    	}
    	
    	
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
        
        if(this.updateCount >= this.time_marker_kill + 2){
        	this.update_kill_effect();
        	this.time_marker_kill = this.updateCount;
        }
        
        
        
 
        //THEO ADDING
        for(var i = 0; i < this.stones.length; i++){
        	if(this.update_stone_scaling[i]){
       			if(this.updateCount >= this.stone_scale_marker[i] + 3){
       				this.stones[i].setScale(this.stones[i].scaleX * 0.95, this.stones[i].scaleY* 0.95);
       				if(this.stones[i].scaleX <= this.stone_scale * 1.2){
       					this.stones[i].setScale(this.stone_scale);
       					this.update_stone_scaling[i] = false;
       					this.update_stone_moving[i] = true;
       				}
       				this.stone_scale_marker[i] = this.updateCount;
       			}
       		
       		}
       		else if(this.update_stone_moving[i]){
       			if(this.stone_target_ID[i] === this.leftID){
       				this.stones[i].body.setVelocityX(-400);
       				if(this.stones[i].x <= this.left_stone_bar[0].x){
       					this.stones[i].body.setVelocityX(0);
       					this.stones[i].body.setVelocityY(0);
       				/*	this.stones[i].x = this.left_stone_bar[0].x;*/
       					this.stones[i].destroy();
/*           				this.update_stone_scaling[i] = false;
           				this.update_stone_moving[i] = false;*/
           				
       					this.update_stone_scaling.splice(i, 1);
       					this.update_stone_moving.splice(i, 1);
       					this.stones.splice(i, 1);
       					this.stone_target_ID.splice(i, 1);
       					this.stone_scale_marker.splice(i, 1);
       					i--;
       				}
       			}
       			else if(this.stone_target_ID[i] === this.rightID){
       				this.stones[i].body.setVelocityX(400);
       				if(this.stones[i].x >= this.right_stone_bar[0].x){
       					this.stones[i].body.setVelocityX(0);
       					this.stones[i].body.setVelocityY(0);
/*       					this.stones[i].x = this.right_stone_bar[0].x;*/
       					this.stones[i].destroy();
/*           				this.update_stone_scaling[i] = false;
           				this.update_stone_moving[i] = false;*/
       					this.update_stone_scaling.splice(i, 1);
       					this.update_stone_moving.splice(i, 1);
       					this.stones.splice(i, 1);
       					this.stone_target_ID.splice(i, 1);
       					this.stone_scale_marker.splice(i, 1);
       					i--;
       				}
       			}
       			else if(this.stone_target_ID[i] === this.topID){
       				this.stones[i].body.setVelocityY(-400);
       				var y;
       				if(this.stones[i].texture.key === "time_stone"){
       	        		y = this.top_stone_bar[0].y;
       	        	}
       	        	else if(this.stones[i].texture.key === "space_stone"){
       	        		y = this.top_stone_bar[1].y;
       	        	}
       	        	else if(this.stones[i].texture.key === "power_stone"){
       	        		y = this.top_stone_bar[2].y;
       	        	}
       	        	else if(this.stones[i].texture.key === "reality_stone"){
       	        		y = this.top_stone_bar[3].y;
       	        	}
       	        	else if(this.stones[i].texture.key === "soul_stone"){
       	        		y = this.top_stone_bar[4].y;
       	        	}
       	        	else if(this.stones[i].texture.key === "mind_stone"){
       	        		y = this.top_stone_bar[5].y;
       	        	}
       				if(this.stones[i].y <= y){
       					this.stones[i].body.setVelocityX(0);
       					this.stones[i].body.setVelocityY(0);
       					/*this.stones[i].y = y;*/
       					this.stones[i].destroy();
/*           				this.update_stone_scaling[i] = false;
           				this.update_stone_moving[i] = false;*/
       					this.update_stone_scaling.splice(i, 1);
       					this.update_stone_moving.splice(i, 1);
       					this.stones.splice(i, 1);
       					this.stone_target_ID.splice(i, 1);
       					this.stone_scale_marker.splice(i, 1);
       					i--;
       				}
       			}
       			else if(this.stone_target_ID[i] === this.playerID){
       				this.stones[i].body.setVelocityX(-400);
       				if(this.stones[i].x <= this.my_stone_bar[0].x){
       					this.stones[i].body.setVelocityX(0);
       					this.stones[i].body.setVelocityY(0);
       			/*		this.stones[i].x = this.my_stone_bar[0].x;*/
       					this.stones[i].destroy();
/*           				this.update_stone_scaling[i] = false;
           				this.update_stone_moving[i] = false;*/
       					this.update_stone_scaling.splice(i, 1);
       					this.update_stone_moving.splice(i, 1);
       					this.stones.splice(i, 1);
       					this.stone_target_ID.splice(i, 1);
       					this.stone_scale_marker.splice(i, 1);
       					i--;
       				}
       			}
       			
       		}
        }
        
        

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
                     	this.add_card_click_effect(i);
                     	if(this.num_to_draw === 0){
                    		// this.initialize_hand = false;
                    		this.draw_more_cards = false;
                     	}
                 	 }
        		}
        	}
    	}
    }
}