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

        this.socket = new WebSocket("ws://localhost:8080/Test_Phaser/server");

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
        }
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
    }

    create() {
        // Add all images
        this.add.image(this.game.renderer.width/2, this.game.renderer.height/2 - 100, "background");
        this.add.image(this.game.renderer.width/2, this.game.renderer.height - 125, "bottom-bar");
        this.add.image(200, 550, "my-hero");
        var teammateL = this.add.image(100, 300, "teammate");
        var teammateR = this.add.image(this.game.renderer.width - 100, 300, "teammate");
        var thanos = this.add.image(this.game.renderer.width/2, 130, "thanos");
        this.cardSprite = this.physics.add.sprite(500, 500, "card-sample");

        console.log(this.socket.readyState);
        this.socket.send("hi");
        this.test();

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
            // this.target = 300;
            this.cardSprite.body.setVelocityX(-20);
        });

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
        if (this.moveFlag === true) {
            this.cardSprite.x -= 1;
            if (this.cardSprite.x === this.target) {
                this.moveFlag = false;
            }
        }
    }

    test() {

    }
}