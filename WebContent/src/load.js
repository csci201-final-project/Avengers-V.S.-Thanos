import {LoadScene} from "./scene/LoadScene.js";
import {StartScene} from "./scene/StartScene.js";

var config = {
    width: 1300,
    height: 750,
    scene: [
        LoadScene, StartScene
    ],
};

var game = new Phaser.Game(config);