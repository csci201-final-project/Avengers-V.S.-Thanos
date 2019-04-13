import {CST} from "../CST.js"
import {StartScene} from "./StartScene.js"

// Loading scene with loading bar
export class LoadScene extends Phaser.Scene {
    constructor() {
        super({
            key: CST.SCENE.LOAD
        })
    }

    init() {

    }

    preload() {
        // creates loading bar

        this.load.image("background", "./assets/background-title.jpg");
        this.load.image("start-button", "./assets/start-button.png");

        let loadingBar = this.add.graphics({
            fillStyle: {
                color: 0xffffff // white
            }
        });

        // loader event
        this.load.on("progress", (percent)=>{
            loadingBar.fillRect(0, this.game.renderer.height/2, this.game.renderer.width * percent, 50);
            console.log(percent);
        });

        this.load.on("complete", ()=>{
            console.log("done");
            this.scene.start(CST.SCENE.START, "Hello from load");
        });
        console.log("here");
    }

    create() {
        this.add.image("background");

    }
}