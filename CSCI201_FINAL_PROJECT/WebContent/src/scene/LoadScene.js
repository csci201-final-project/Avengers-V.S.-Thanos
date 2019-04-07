import {CST} from "../CST"

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

    }

    create() {
        this.scene.start(CST.SCENE.MENU);
    }
}