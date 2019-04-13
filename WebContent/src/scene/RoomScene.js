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
        this.load.image("card-sample_1", "./assets/card-sample_1.png");
        this.load.image("card-sample_2", "./assets/card-sample_2.png");
        this.load.image("card-sample_3", "./assets/card-sample_3.png");
        this.load.image("card-sample_4", "./assets/card-sample_4.png");
        this.load.image("card-sample_5", "./assets/card-sample_5.png");
        this.load.image("card-sample_6", "./assets/card-sample_5.png");
        this.load.image("card-sample_7", "./assets/card-sample_5.png");
        this.load.image("card-sample_8", "./assets/card-sample_5.png");
        this.load.image("discard_place", "./assets/card-sample_5.png");

    }

    create() {
        // Add all images
        this.add.image(this.game.renderer.width/2, this.game.renderer.height/2 - 100, "background");
        this.add.image(this.game.renderer.width/2, this.game.renderer.height - 125, "bottom-bar");
        
        
        this.add.image(200, 550, "my-hero");
       	this.teammateL = this.add.image(100, 300, "teammate").setInteractive();
        this.teammateR = this.add.image(this.game.renderer.width - 100, 300, "teammate").setInteractive();
        this.thanos = this.add.image(this.game.renderer.width/2, 130, "thanos").setInteractive();
        /*this.discard_place = this.add.image(this.game.renderer.width/2, this.game.renderer.height/2, "discard_place");*/
        
        //Theo's testing
        this.hand_cards = [];
        this.card_deck = [];
        this.hand_cards_state = [];
        
/*        stars = this.physics.add.group({
            key: 'HANDCARD',
            repeat: 11,
            
            setXY: { x: 1202, y: 633.4, stepX: 2 }
        });*/
        
        var i
        for(i = 0; i < 11; i++){
        	
        }
        this.cardSprite_1 = this.physics.add.sprite(1200, 633.4, "card-sample_1").setInteractive();
        
        this.cardSprite_2 = this.physics.add.sprite(1202, 633.4, "card-sample_2").setInteractive();
        this.cardSprite_3 = this.physics.add.sprite(1204, 633.4, "card-sample_3").setInteractive();
        this.cardSprite_4 = this.physics.add.sprite(1206, 633.4, "card-sample_4").setInteractive();
        this.cardSprite_5 = this.physics.add.sprite(1208, 633.4, "card-sample_5").setInteractive();
        this.cardSprite_6 = this.physics.add.sprite(1208, 633.4, "card-sample_6").setInteractive();
        this.cardSprite_7 = this.physics.add.sprite(1208, 633.4, "card-sample_7").setInteractive();
        this.cardSprite_8 = this.physics.add.sprite(1208, 633.4, "card-sample_8").setInteractive();
        
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
        var confirmButton = this.add.image(this.game.renderer.width * 0.85, this.game.renderer.height * 0.9, "confirm-button");
        confirmButton.setInteractive({ useHandCursor: true });
        confirmButton.on("pointerover", ()=>{
            /*alert("hover");*/
        });
        confirmButton.on("pointerup", ()=>{
        	if(this.initialize_hand){
        		this.draw_card(5);

        	}
        	else if(this.num_to_draw === 0){
        		this.draw_card(1);
        	}
        	
        });
        
        this.thanos.on("pointerup", ()=>{
        	alert("Playing cards.");
        	var i;
    		for(i = 0; i < this.hand_cards.length; i++){
    			if(this.hand_cards_state[i] === "out"){
    				this.hand_cards[i].x = this.game.renderer.width/2;
    				this.hand_cards[i].y = this.game.renderer.height/2;
    				this.hand_cards.shift();
    				this.hand_cards_state[i].shift();
    			}
    		}
        });
        
       
        
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
    		this.hand_cards[this.hand_cards.length-1].body.setVelocityX(-150);
    		this.hand_cards_state.push("draw");
    	}
    	
    	this.deck_top_index += num;
    	this.draw_more_cards = true;
    	
    
    }
    
    add_card_click_effect(i){
/*    	alert("adding effect: " + i);*/
    	/*alert(this.hand_cards_state[i]);*/
		 this.hand_cards[i].on("pointerup", ()=>{
			/* alert(cnt);*/
			if(this.hand_cards_state[i] === "hand"){
				this.hand_cards[i].y = 533.4;
			}
			else if(this.hand_cards_state[i] === "to play"){
				this.hand_cards[i].y = 533.4 + 100;
			}
			
		 });
    }
    
    update() {
    	this.textValue.text = (this.updateCount++).toString();
       	if(this.num_to_draw === 0){
       		return;
       	}
       	
       	
       	
    	if(this.initialize_hand){
    		var i;
        	for(i = 0; i < 5; i++){
        		var cardSprite = this.hand_cards[i];
        		console.log("hand_card: " + this.hand_cards[i]);
        		var dist = 122.5;
        		if(this.draw_more_cards === true){
        			if(cardSprite.x < (400 + i*dist)){
                     	cardSprite.body.setVelocityX(0);
                     	cardSprite.x = 400 + i*dist;
                     	this.num_to_draw--;
                     	this.hand_cards_state[i] = "hand";
                     	this.add_card_click_effect(i);
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