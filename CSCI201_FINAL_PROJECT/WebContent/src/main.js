import {RoomScene} from "./scene/RoomScene.js";
import {MainScene} from "./scene/MainScene.js";

var config = {
    width: 1300,
    height: 750,
    scene: [
        RoomScene, MainScene
    ],
};

var game = new Phaser.Game(config);