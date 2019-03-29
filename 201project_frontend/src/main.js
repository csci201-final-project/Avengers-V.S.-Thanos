const CST = {
    SCENE: {
        LOAD: "LOAD",
        START: "START"
    }
}

class LoadScene extends Phaser.Scene {
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

class StartScene extends Phaser.Scene {
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
    }

    create() {
        var width = game.config.width;
        var height = game.config.height;
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
        })
    }
}

var config = {
    width: 1300,
    height: 750,
    scene: [
        LoadScene, StartScene
    ],
};

var game = new Phaser.Game(config);