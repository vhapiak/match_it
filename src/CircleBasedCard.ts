type CardElement = {
    id: number;
    x: number;
    y: number;
    r: number;
}

type Card = Map<string, CardElement>;

interface ICardListener {
    onSelected(key: string): void;
}

class CircleBasedCard {

    radius: number;
    listener: ICardListener;
    card: Card;
    container: Phaser.GameObjects.Container;
    graphics: Phaser.GameObjects.Graphics;
    circlesGraphics: Phaser.GameObjects.Graphics;
    circles: Map<string, Phaser.Geom.Circle>;

    constructor (scene: Phaser.Scene, radius: number, listener: ICardListener) {
        this.radius = radius;
        this.listener = listener;

        this.container = scene.add.container(0, 0);
        this.container.setSize(2 * radius, 2 * radius);
        this.container.setInteractive().on('pointerdown', CircleBasedCard.prototype.onPointerDown, this);

        this.circles = new Map();
        this.graphics = scene.add.graphics();
        this.circlesGraphics = scene.add.graphics();

        const borderCircle = new Phaser.Geom.Circle(0.0, 0.0, radius);
        this.graphics.lineStyle(2, 0xffffff, 1.0);
        this.graphics.strokeCircleShape(borderCircle);
    }

    setCard(card: Card) {
        this.circles.clear();
        this.circlesGraphics.clear();
        this.card = card;
        for (let key of card.keys()) {
            const circle = new Phaser.Geom.Circle(
                this.radius * card.get(key).x,
                this.radius * card.get(key).y,
                this.radius * card.get(key).r);

            this.circles.set(key, circle);
            this.circlesGraphics.fillStyle(card.get(key).id, 1.0);
            this.circlesGraphics.fillCircleShape(circle);
        }
    }

    setPosition(x: number, y: number) {
        this.container.setPosition(x, y);
        this.graphics.setPosition(x, y);
        this.circlesGraphics.setPosition(x, y);
    }

    onPointerDown(pointer, localX, localY, event) {
        const x = localX - this.radius;
        const y = localY - this.radius;
        for (let key of this.circles.keys()) {
            if (this.circles.get(key).contains(x, y)) {
                console.log('click', key);
                this.listener.onSelected(key);
                return;
            }
        }
    }
}