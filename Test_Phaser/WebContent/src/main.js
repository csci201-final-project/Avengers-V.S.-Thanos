import {RoomScene} from "./scene/RoomScene.js";
import {LoadScene} from "./scene/LoadScene.js";

var config = {
    width: 1300,
    height: 750,
    physics: {
        default: 'arcade'
    },
    scene: [
        LoadScene, RoomScene
    ],
};

var game = new Phaser.Game(config);