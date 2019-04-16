import {CST} from "../CST.js"

export class StartScene extends Phaser.Scene {
    constructor() {
        super({
            key: CST.SCENE.START
        })
    }

    init(data) {
        console.log(data);
        console.log("I GOT IT");
    }

    preload() {
        // this.load.image("background", "./assets/background-title.jpg");
        // this.load.image("start-button", "./assets/start-button.jpg");
        this.load.audio("before_start", "./assets/Sounds/before_start.mp3");
        this.load.image("background", "./assets/background-title.jpg");
        this.load.image("start-button", "./assets/start-button.png");
    }

    create() {
        var width = this.game.config.width;
        var height = this.game.config.height;
        var bkg = this.add.image(this.game.renderer.width/2, this.game.renderer.height/2, "background");
        bkg.displayWidth = width;
        bkg.displayHeight = height;

        let startButton = this.add.image(this.game.renderer.width/2, this.game.renderer.height * 0.9, "start-button");
        
        startButton.setInteractive({ useHandCursor: true });

        startButton.on("pointerover", ()=>{
            console.log("hover");
        });

        startButton.on("pointerup", ()=>{
            console.log("transit");
            
            window.location = "login.jsp";
            // Start menu scene
        })
    }
}