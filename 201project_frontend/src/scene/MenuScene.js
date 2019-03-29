import {CST} from "../CST"

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({
            key: CST.SCENE.MENU
        })
    }

    init(data) {
        console.log(data);
        console.log("I GOT IT");
    }

    create() {

    }
}