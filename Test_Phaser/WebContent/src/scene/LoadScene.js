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
        this.load.image("background", "./assets/titan-bg.png");
        this.load.image("confirm-button", "./assets/confirm-btn.png");
        this.load.image("my-hero", "./assets/myhero.png");
        this.load.image("bottom-bar", "./assets/bottom-bar.png");
        this.load.image("teammate", "./assets/teammates.png");
        this.load.image("undecided", "./assets/undecided-hero.png")

        this.load.image("Thanos", "./assets/thanos.png");
        this.load.image("IronMan", "./assets/iron-man.png");
        this.load.image("Thor", "./assets/thor.png");
        this.load.image("Hulk", "./assets/hulk.png");
        this.load.image("AntMan", "./assets/antman.png");
        this.load.image("ScarletWitch", "./assets/black-widow.png");
        this.load.image("DoctorStrange", "./assets/captain-marvel.png");

        this.load.image("card_deck", "./assets/card_deck.png");
        this.load.image("card-sample", "./assets/card-sample.png");
        this.load.image("ATTACK", "./assets/attack.jpg");
        this.load.image("DODGE", "./assets/dodge.jpg");
        this.load.image("STEAL", "./assets/steal.jpg");
        this.load.image("UNDEFEATABLE", "./assets/resist.jpg");

        this.load.image("card-sample_2", "./assets/steal.jpg");
        this.load.image("card-sample_3", "./assets/attack.jpg");
        this.load.image("card-sample_4", "./assets/dodge.jpg");
        this.load.image("card-sample_5", "./assets/steal.jpg");
        this.load.image("card-sample_6", "./assets/resist.jpg");
        this.load.image("card-sample_7", "./assets/attack.jpg");
        this.load.image("card-sample_8", "./assets/resist.jpg");
        this.load.image("discard_place", "./assets/card-sample_5.png");
        this.load.image("end_turn", "./assets/endturn-btn.png");
        this.load.image("left_heart", "./assets/left_heart.png");
        this.load.image("right_heart", "./assets/right_heart.png");
        //Theo adding
        this.load.image("0", "./assets/0.png");
        this.load.image("1", "./assets/1.png");
        this.load.image("2", "./assets/2.png");
        this.load.image("3", "./assets/3.png");
        this.load.image("4", "./assets/4.png");
        this.load.image("5", "./assets/5.png");
        this.load.image("time_stone", "./assets/time-stone.png");
        this.load.image("space_stone", "./assets/space-stone.png");
        this.load.image("power_stone", "./assets/power-stone.png");
        this.load.image("reality_stone", "./assets/reality-stone.png");
        this.load.image("soul_stone", "./assets/soul-stone.png");
        this.load.image("mind_stone", "./assets/mind-stone.png");
        
        this.load.image("stone_1", "./assets/time_stone_empty.png");
        this.load.image("stone_2", "./assets/space_stone_empty.png");
        this.load.image("stone_3", "./assets/power_stone_empty.png");
        this.load.image("stone_4", "./assets/reality_stone_empty.png");
        this.load.image("stone_5", "./assets/soul_stone_empty.png");
        this.load.image("stone_6", "./assets/mind_stone_empty.png");
        
        
   		var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 820, 50);
        
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        var loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 35,
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
            y: height / 2 + 80,
            text: '',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        assetText.setOrigin(0.5, 0.5);
   
        // this.load.image('logo', 'assets/zenvalogo.png');
        // for (var i = 0; i < 2500; i++) {
        //     this.load.image('logo'+i, 'assets/zenvalogo.png');
        //     if(i === 250){
        //     	this.load.audio("before_start", "./assets/Sounds/before_start.mp3");
        //     }
        //     else if(i === 1000){
        //     	 this.load.audio("bg_music", "./assets/Sounds/bg_music.mp3");
        //     }
        // }
        

        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100-1) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 800 * value, 30);
        });
        
        
        this.load.on('fileprogress', function (file) {
            /*assetText.setText('Loading asset: ' + file.key);*/
        	assetText.setText('Loading Avengers v.s. Thanos...');
        });

        this.load.on('complete', ()=>{
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
            this.scene.start(CST.SCENE.ROOM, "Hello from load");
        }); 
        
    }

    create() {
        this.add.image("background");
        
       	
  
    }
}