const CST = {
    SCENE: {
        LOAD: "LOAD",
        START: "START"
    }
}

//LOAD SCENE
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
        
        
   		var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);
        
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        var loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);
        
        var percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);
        
        var assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
            text: '',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        assetText.setOrigin(0.5, 0.5);
        
        this.load.image('logo', 'assets/zenvalogo.png');
        for (var i = 0; i < 500; i++) {
            this.load.image('logo'+i, 'assets/zenvalogo.png');
        }
        
        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });
        
        this.load.on('fileprogress', function (file) {
            /*assetText.setText('Loading asset: ' + file.key);*/
        	assetText.setText('Loading My Game...');
        });

        this.load.on('complete', ()=>{
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
            this.scene.start(CST.SCENE.START, "Hello from load");
        }); 
        
    }

    create() {
        this.add.image("background");

    }
}


//START SCENE
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
            window.location = "login.jsp";
        })
    }
}

var config = {
    width: 1300,
    height: 750,
    scene: [
        LoadScene, StartScene
    ]
};

var game = new Phaser.Game(config);