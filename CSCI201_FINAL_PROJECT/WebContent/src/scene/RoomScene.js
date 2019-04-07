import {CST} from "../CST.js"

export class RoomScene extends Phaser.Scene {
    constructor() {
        super({
            key: CST.SCENE.ROOM
        })
    }

    init() {
        
    }

    preload() {
        this.load.image("background", "./assets/background-title.jpg");
    }

    create() {
        this.add.image("background");

        var socket;
        function connectToServer() {
            // Specify URI (identifier), using websocket protocol
            socket = new WebSocket("ws://localhost:8080/Test_Phaser/server");
            
            // Overwrite same function as server, asynchronous
            socket.onopen = function(event) {
                console.log("Connection established.");
            }
            socket.onmessage = function(event) {
                document.getElementById("mychat").innerHTML += event.data + "<br />";  // msg from server
            }
            socket.onclose = function(event) {
                document.getElementById("mychat").innerHTML += "Disconnected!<br />";
            }
        }
        function sendMessage() {
            socket.send("TO: " + document.chatform.message.value);
            // No need to flush, but don't want form to submit
            return false;
        }

        connectToServer();


    }
}