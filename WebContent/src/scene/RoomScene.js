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
        this.availableCards = [];

        this.targetID = -1;

        this.socket = new WebSocket("ws://" + hostURL + "/AVT/server");

        var self = this;  // Allows access to "this"
        
         // Tong: We need to record the current player
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
        if (obj.INDEX === this.playerID) {
            this.availableCards = obj.AVAILABLECARDS;
            this.stone = obj.STONE;

            var diff = obj.HANDCARD.length - this.handcard.length;
            this.handcard = obj.HANDCARD;
            this.handsize = obj.HANDCARD.length; // Tong 
            // 	Tong: I also modify the function below!
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
        else {
            this.players[obj.INDEX].handsize = obj.HANDCARD.length;
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
            console.log("Shoot, I am being attacked!")// Tong
        }
        this.players[obj.SOURCE.INDEX].handsize = obj.SOURCE.HANDCARD.length;
    }

    parseTakeDamage(obj) {
        if (obj.SOURCE.INDEX === this.playerID) {
            this.stone = obj.SOURCE.STONE;
            this.availableCards = obj.SOURCE.AVAILABLECARDS;
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
            if (obj.TARGET.ISDEAD === "FALSE") {
                this.isDead = false;
            }
            else {
                this.isDead = true;
            }
        }
        if (obj.TARGET.ISDEAD === "TRUE") {
            this.players[obj.TARGET.INDEX].isDead = true;
        }
        this.players[obj.TARGET.INDEX].blood = obj.TARGET.BLOOD;
        this.players[obj.TARGET.INDEX].handsize = obj.TARGET.HANDCARD.length;
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
            console.log("Shoot, I am being stolen!");
        }
        this.players[obj.SOURCE.INDEX].handsize = obj.SOURCE.HANDCARD.length;
    }

    parseChangeCard(obj) {
        if (obj.SOURCE.INDEX === this.playerID) {
            this.stone = obj.SOURCE.STONE;
            this.availableCards = obj.SOURCE.AVAILABLECARDS;

            var diff = obj.SOURCE.HANDCARD.length - this.handcard.length;
            this.handcard = obj.SOURCE.HANDCARD;
            if (diff > 0) {
                var tempSprite = this.physics.add.sprite(1200, 633.4, this.handcard[this.handcard.length-1]).setInteractive().setScale(this.basic_scale);
                this.card_deck.push(tempSprite);
                this.draw_card(1);
            }
        }
        else if (obj.TARGET.INDEX === this.playerID) {
            this.availableCards = [];
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
        //console.log()
        if(this.playerID==obj.SOURCE.HANDCARD.length){
        	this.handsize = obj.SOURCE.HANDCARD.length;
        	this.players[obj.TARGET.INDEX].handsize = obj.TARGET.HANDCARD.length;
        }
        else
        {
        	this.handsize = obj.TARGET.HANDCARD.length;
        	this.players[obj.SOURCE.INDEX].handsize = obj.SOURCE.HANDCARD.length;
        }
    }

    init() {
        
    }

    preload() {
        //DEBUG
        this.load.image("start-btn", "./assets/start-button.png");
    }

    create() {
        //Adding music, need to be commented back
    	// this.before_start = this.sound.add("before_start");
    	// this.before_start.play({loop: true});
    	// this.before_start.volume = 1.5;
    	
    	
    	// //testing
    	// this.test = this.sound.add("test");
    	// this.test.play({loop: true});
    	// var self = this;
    	// this.test.once('complete', function(test){
    	// 	self.before_start = self.sound.add("before_start");
    	// 	self.before_start.play({loop: true});
        // 	self.before_start.volume = 1.5;
    	// });

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
  
        this.physics.add.sprite(1200 - 10, 633.4 - 10, "card_deck").setScale(this.card_cover_scale).depth = 30;
/*        this.discard_place = this.add.image(this.game.renderer.width/2, this.game.renderer.height/2, "discard_place");
        this.discard_place.setScale(this.card_cover_scale).depth = -30;*/

        var style = { font: "65px Arial", fill: "#ff0000", align: "center" };
        this.textValue = this.add.text(0, 0, "0", style);
        this.updateCount = 0;

        this.num_to_draw = 5;
        // this.initialize_hand = true;
        this.deck_top_index = 0;
        
        // Adds end turn button
        var endButton = this.add.image(this.game.renderer.width - 114, this.game.renderer.height - 100, "end_turn").setScale(0.425);
        endButton.depth = 30;
        endButton.setInteractive({ useHandCursor: true });
        endButton.on("pointerover", ()=>{
            /*alert("hover");*/
        });
        endButton.on("pointerup", ()=>{
        	// if(this.initialize_hand){
        	// 	this.draw_card(this.handcard.length);
        	// }
        	// else if(this.num_to_draw === 0){
        	// 	this.draw_card(1);
            // }
            var tempObj = {};
            tempObj.TYPE = "PLAYEREND";
            tempObj.TARGET = this.playerID;
            tempObj.GAMEID = this.roomID;
            console.log(JSON.stringify(tempObj));
            this.socket.send(JSON.stringify(tempObj));
        });

        // Adds confirm button
        var confirmButton = this.add.image(this.game.renderer.width - 116, this.game.renderer.height - 170, "confirm-button").setScale(0.42);
        confirmButton.setInteractive({ useHandCursor: true });
        confirmButton.depth = 30;
         
        //Tong: This function is modified heavily by me! Please double check!
        confirmButton.on("pointerup", ()=>{
        	console.log(this.to_play_card);
        	var index =  this.hand_cards_state.indexOf("to play");
        	console.log(index);
        	var tempObj = {};
        	if(this.attackTarget==true)
        	{
        		tempObj.TYPE = "DODGE";
                tempObj.GAMEID = this.roomID;
                tempObj.CARD = index;
                tempObj.SOURCE = this.attackSource;
                tempObj.TARGET = this.playerID;
        		this.attackTarget = false;
        	}
        	else if(this.stealTarget==true)
        	{
        		tempObj.TYPE = "UNDEFEATABLE";
                tempObj.GAMEID = this.roomID;
                tempObj.CARD = index;
                tempObj.SOURCE = this.stealSource;
                tempObj.TARGET = this.playerID;
        		this.stealTarget = false;
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
                    }
                    else 
                    {
                        tempObj.TYPE = "ATTACK";
                        tempObj.GAMEID = this.roomID;
                        tempObj.CARD = index;
                        tempObj.SOURCE = this.playerID;
                        tempObj.TARGET = this.targetID;
                    }
                    /*
                    else{
                    	 this part is for soulStone, but I haven't figured out what to do, TBC
                    	var hasSoulStone = false;
                    	for(var i=0;i<this.stone.length;i++)
                    	{
                    		if(this.stone[i]==="SoulStone")
                    		{
                    			hasSoulStone = true;
                    		}
                    	}
                    	if(hasSoulStone==true)
                    	{
                    		
                    	}
                    	
                    	tempObj.TYPE = "DODGE";
                    	tempObj.GAMEID = this.roomID;
                        tempObj.CARD = index;
                        tempObj.SOURCE = this.targetID;
                        tempObj.TARGET = this.playerID;
                    	
                    }
                	*/
                    /*
                    tempObj.GAMEID = this.roomID;
                    tempObj.CARD = index;
                    tempObj.TARGET = this.targetID;
                    tempObj.SOURCE = this.playerID;
                    */
//                    console.log(JSON.stringify(tempObj));
//                    this.socket.send(JSON.stringify(tempObj));	
                    
                }
                
                // end of Tong's modification
        	}
        	console.log(JSON.stringify(tempObj));
            this.socket.send(JSON.stringify(tempObj));	
        	if(index!=-1)
            {
             	this.removeCard(index);
            }
        });
      
        var startButton = this.add.image(this.game.renderer.width/2 - 30, this.game.renderer.height/2 - 50, "start-btn");
        startButton.setInteractive({ useHandCursor: true });
        startButton.once("pointerup", ()=>{
            //this.socket.send("request");  // testing

            //needed to be commented back
            /*this.before_start.stop();*/
/*            this.bg_music = this.sound.add("bg_music");
            this.bg_music.volume = 1.5;
            this.bg_music.play({loop: true});*/

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
        
        var dist = 30;
        for(var i = 1; i <= 6; i++){
        	this.left_stone_bar.push(this.add.image(this.teammateL.x + 115, this.teammateL.y - 70 + i*dist, "stone_" + i).setScale(this.stone_scale));
        	this.right_stone_bar.push(this.add.image(this.teammateR.x - 115, this.teammateR.y - 70 + i*dist, "stone_" + i).setScale(this.stone_scale));
        	this.top_stone_bar.push(this.add.image(this.teammateT.x + 115, this.teammateT.y - 100 + i*dist, "stone_" + i).setScale(this.stone_scale));
        	this.my_stone_bar.push(this.add.image(this.myHeroPic.x - 135, this.myHeroPic.y - 110 + i*dist, "stone_" + i).setScale(this.stone_scale));
        }

        // Game start signal
        var tempObj = {};
        tempObj.GAMEID = this.roomID;
        tempObj.USERNAME = this.username;
        if (this.playerID === 0) {
            tempObj.TYPE = "NEWGAME";
        }
        else {
            tempObj.TYPE = "CONNECTION";
        }
        this.socket.send(JSON.stringify(tempObj));
        
        // end of create
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

    removeCard(index) {
        this.hand_cards[index].x = this.game.renderer.width/2;
        this.hand_cards[index].y = this.game.renderer.height/2;
        this.hand_cards[index].depth = 0;

        // Disable interaction
        this.hand_cards[index].off("pointerdown");
        this.hand_cards[index].off("pointerover");
        this.hand_cards[index].off("pointerout");
        
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
    		alert("The Health You Want To Set Exceeds The Hero's Max Health!");
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
    		alert("The Health You Want To Set Exceeds The Hero's Max Health!");
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
    		alert("The Health You Want To Set Exceeds The Hero's Max Health!");
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
    		alert("The Health You Want To Set Exceeds The Hero's Max Health!");
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
    
    draw_card(num){
    	if(this.hand_cards.length + num > 5){
    		alert("You already have 5 cards. You can not draw any more cards!");
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
        	var i;
    		for(i = 0; i < this.hand_cards.length; i++){
    			if(this.hand_cards_state[i] === "to play"){
    				//only when to_play_card is true can we play the cards by pressing the button
    				this.to_play_card = true;
    				alert("You selected " + this.topID + ":" + this.players[this.topID].hero);
    				this.scale_back();
                    this.teammateT.setScale(this.hero_base_scale * 1.2);
                    this.targetID = this.topID;
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
                    this.targetID = this.leftID;
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

    update() 
    {
        this.update_current_hand_size();
    	this.update_available_cards();
    	this.update_health();
    	this.update_stone();

        this.textValue.text = (this.updateCount++).toString();

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