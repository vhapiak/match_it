type CardElement = {
    id: number;
    x: number;
    y: number;
    r: number;
    a: number;
}

type Card = Map<string, CardElement>;

interface ICardListener {
    onSelected(key: string): void;
}

class CircleBasedCard extends Phaser.GameObjects.Container {

    scene: Phaser.Scene;
    radius: number;
    listener: ICardListener;
    card: Card;
    graphics: Phaser.GameObjects.Graphics;
    circles: Map<string, Phaser.Geom.Circle>;
    images: Phaser.GameObjects.Image[];

    constructor (scene: Phaser.Scene, radius: number, listener: ICardListener) {
        super(scene, 0, 0);
        this.scene = scene;
        this.radius = radius;
        this.listener = listener;

        this.setSize(2 * radius, 2 * radius);
        this.setInteractive().on('pointerdown', CircleBasedCard.prototype.onPointerDown, this);

        this.circles = new Map();
        this.images = [];
        this.graphics = scene.add.graphics();

        const borderCircle = new Phaser.Geom.Circle(0.0, 0.0, radius);
        this.graphics.fillStyle(0x00bcd4);
        this.graphics.fillCircleShape(borderCircle);
        this.graphics.lineStyle(2, 0x62efff, 1.0);
        this.graphics.strokeCircleShape(borderCircle);

        this.add(this.graphics);
    }

    setCard(card: Card) {
        for (let image of this.images) {
            image.destroy();
        }
        this.images = [];
        this.circles.clear();
        this.card = card;
        for (let key of card.keys()) {
            const circle = new Phaser.Geom.Circle(
                this.radius * card.get(key).x,
                this.radius * card.get(key).y,
                this.radius * card.get(key).r);

            this.circles.set(key, circle);

            let image = this.scene.add.image(
                circle.x, 
                circle.y, 
                'flag' + key);
            image.setDisplaySize(2 * circle.radius, 2 * circle.radius);
            image.setAngle(card.get(key).a);
            this.images.push(image);
            this.add(image);
        }
    }

    onPointerDown(pointer, localX, localY, event) {
        const x = localX - this.radius;
        const y = localY - this.radius;
        for (let key of this.circles.keys()) {
            if (this.circles.get(key).contains(x, y)) {
                console.log('click', key);
                if (this.listener) {
                    this.listener.onSelected(key);
                }
                return;
            }
        }
    }
}