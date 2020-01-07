
interface IMainMenuListener {
    onModeSelected(mode: number): void;
}

class MainMenu extends Phaser.GameObjects.Container {

    constructor (scene: Phaser.Scene, radius: number, listener: IMainMenuListener) {
        super(scene, 0, 0);
        
        let title = scene.add.text(0, -radius * 0.8, 'Match It', {
            fontSize: radius * 0.9,
            stroke: '#008ba3',
            fill: '#00bcd4',
            strokeThickness: 5
        });
        title.setOrigin(0.5, 0.5);
        this.add(title);
                
        let text = scene.add.text(0, 0, 'Select number of elements\nper card:', {
            fontSize: radius / 4,
            align: 'center'
        });
        text.setOrigin(0.5, 0.5);
        this.add(text);

        let buttons = {
            '4': -radius,
            '6': 0,
            '8': radius 
        };

        for (let num in buttons) {
            let graphics = scene.add.graphics();

            const circle = new Phaser.Geom.Circle(buttons[num], radius * 0.8, radius / 3);
            graphics.fillStyle(0x00bcd4);
            graphics.fillCircleShape(circle);
            graphics.lineStyle(2, 0x62efff, 1.0);
            graphics.strokeCircleShape(circle);
            this.add(graphics);

            let button = scene.add.text(buttons[num], radius * 0.8, num, {
                fontSize: radius / 2,
                stroke: '#008ba3',
                strokeThickness: 2
            });
            button.setOrigin(0.5, 0.5);
            button.setInteractive({
                useHandCursor: true
            });
            button.on('pointerdown', () => {
                listener.onModeSelected(Number(num));
            });
            this.add(button);
        }
    }
}