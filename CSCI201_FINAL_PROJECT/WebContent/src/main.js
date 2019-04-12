import {RoomScene} from "./scene/RoomScene.js";
import {MainScene} from "./scene/MainScene.js";

var config = {
    width: 1300,
    height: 750,
    physics: {
        default: 'arcade'
    },
    scene: [
        RoomScene, MainScene
    ],
};

var game = new Phaser.Game(config);