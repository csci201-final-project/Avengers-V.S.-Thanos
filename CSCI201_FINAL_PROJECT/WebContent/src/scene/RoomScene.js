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
        this.isLoaded = false;
        this.handcard = [];
        this.hero = "";
        this.stone = [];
        this.attack = 0;
        this.blood = 0;
        
        this.others = [];

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
            if (idx !== this.playerID) {
                var tempObj = {
                    attack  : obj.ATTACK[idx],
                    hero    : obj.CHARACTER[idx],
                    stone   : obj.STONE[idx],
                    blood   : obj.BLOOD[idx]
                }
                this.others.push(tempObj);
            }
        }
        // console.log("attack: ", this.attack);
        // console.log("hero: ", this.hero);
        console.log(this.others[2].hero);
        this.isLoaded = true;
    }

    parseTurnStart(obj) {
        this.availableCards = obj.AVAILABLECARDS;

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
        this.load.image("card-sample", "./assets/card-sample.png");
        this.load.image("attack", "./assets/attack.png");
        this.load.image("dodge", "./assets/dodge.png");
        this.load.image("steal", "./assets/steal.png");
        this.load.image("resist", "./assets/resist.png");
    }

    create() {
        // Add all images
        this.add.image(this.game.renderer.width/2, this.game.renderer.height/2 - 100, "background");
        this.add.image(this.game.renderer.width/2, this.game.renderer.height - 125, "bottom-bar");
        this.add.image(200, 550, "my-hero");
        
        var teammateR = this.add.image(this.game.renderer.width - 100, 300, "teammate");
        var teammateL = this.add.image(100, 300, "teammate");
        var thanos = this.add.image(this.game.renderer.width/2, 130, "thanos");
        this.cardSprite = this.physics.add.sprite(500, 500, "card-sample");

        console.log(this.socket.readyState);
        this.socket.send("hi");

        var style = { font: "65px Arial", fill: "#ff0000", align: "center" };
        this.textValue = this.add.text(0, 0, "0", style);
        this.updateCount = 0;

        // Adds confirm button
        var confirmButton = this.add.image(this.game.renderer.width * 0.85, this.game.renderer.height * 0.9, "confirm-button");
        confirmButton.setInteractive({ useHandCursor: true });
        confirmButton.on("pointerover", ()=>{
            console.log("hover");
        });
        confirmButton.on("pointerup", ()=>{
            this.socket.send("request");
            // this.moveFlag = true;
            this.target = 300;
            if (this.cardSprite.x > this.target)
                this.cardSprite.body.setVelocityX(-400);
        });

        // this.socket.send("request");


        // var socket = new WebSocket("ws://localhost:8080/Test_Phaser/server");

        // function sendMessage(socket, msg){
        //     // Wait until the state of the socket is not ready and send the message when it is...
        //     waitForSocketConnection(socket, function(){
        //         console.log("message sent!!!");
        //         socket.send(msg);
        //     });
        // }

        // Make the function wait until the connection is made...
        // function waitForSocketConnection(socket, callback){
        //     setTimeout(
        //         function () {
        //             if (socket.readyState === 1) {
        //                 console.log("Connection is made")
        //                 if (callback != null){
        //                     callback();
        //                 }
        //             } else {
        //                 console.log("wait for connection...")
        //                 waitForSocketConnection(socket, callback);
        //             }

        //         }, 5); // wait 5 milisecond for the connection...
        // }

        // sendMessage(this.socket, "Hello");
    }

    update() {
        this.textValue.text = (this.updateCount++).toString();
        if (this.cardSprite.x <= this.target) {
            this.cardSprite.body.setVelocityX(0);
        }

        if (this.isLoaded) {
            this.add.image(100, 300, "thanos");
        }
    }
}