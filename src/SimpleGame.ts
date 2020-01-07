class SimpleScene extends Phaser.Scene implements ICardListener {
    constructor() {
        super({
            key: 'simple',
            active: true,
        });
    }

    topCard: CircleBasedCard;
    playerCard: CircleBasedCard;
    animationCard: CircleBasedCard;
    cardTween: Phaser.Tweens.Tween;
    idToColor: Map<string, number>;

    cardsSet: Card[];
    currentCard: number;

    timerText: Phaser.GameObjects.Text;
    timer: number;
    timerActive: boolean;

    scoreText: Phaser.GameObjects.Text;
    score: number;
    incScoreTween: Phaser.Tweens.Tween;
    decScoreTween: Phaser.Tweens.Tween;

    preload() {
        this.load.json('cardsSet', 'data/cards8.json');
        for (let i = 0; i < 57; ++i) {
            this.load.image('flag' + i, 'data/img/' + i + '.png');
        }
    }

    create() {
        this.idToColor = new Map();

        const cardsSetJson = this.cache.json.get('cardsSet');
        this.cardsSet = [];
        for (let cardJson of cardsSetJson) {
            let card: Card = new Map<string, CardElement>();
            for (let key in cardJson) {
                const elementJson = cardJson[key];
                const element: CardElement = {
                    id: this.getColor(key),
                    x: Number(elementJson.x),
                    y: Number(elementJson.y),
                    r: Number(elementJson.r),
                    a: Math.random() * 360 - 180
                };
                card.set(key, element);
            }
            this.cardsSet.push(card);
        }

        let camera = this.cameras.main; 
        camera.setScroll(-camera.width / 2, -camera.height / 2);

        const cardRadius = Math.min(camera.height, camera.width) / 2.0 * 0.8;
        this.topCard = new CircleBasedCard(this, cardRadius, this);
        this.playerCard = new CircleBasedCard(this, cardRadius, this);
        this.animationCard = new CircleBasedCard(this, cardRadius, null);

        this.add.existing(this.topCard);
        this.add.existing(this.playerCard);
        this.add.existing(this.animationCard);
        
        this.topCard.setPosition(-camera.height * 0.9 / 2.0, 0.0);
        this.playerCard.setPosition(+camera.height * 0.9 / 2.0, 0.0);
        this.animationCard.setPosition(-camera.height * 0.9 / 2.0, 0.0);
        this.animationCard.setVisible(false);

        const self = this;
        this.cardTween = this.add.tween({
            targets: this.animationCard,
            x: {
                from: this.topCard.x,
                to: this.playerCard.x
            },
            duration: 200,
            onComplete: () => {
                self.currentCard++;
                self.playerCard.setCard(self.cardsSet[self.currentCard - 1]);
                self.animationCard.setVisible(false);
            },
            paused: true
        });

        let countdown = this.add.text(camera.height * 0.9 / 2.0, 0.0, '3', {
            fontSize: cardRadius,
            stroke: '#008ba3',
            strokeThickness: 2
        });
        countdown.setOrigin(0.5, 0.5);

        let firstTween = this.add.tween({
            targets: countdown,
            scale: {from: .5, to: 1.5},
            duration: 600,
            paused: true,
            onComplete: () => {
                countdown.setVisible(false);
                self.start();
            }
        });

        let secondTween = this.add.tween({
            targets: countdown,
            scale: {from: .5, to: 1.5},
            duration: 600,
            paused: true,
            onComplete: () => {
                firstTween.play();
                countdown.setText('1');
            }
        });

        let thirdTween = this.add.tween({
            targets: countdown,
            scale: {from: .5, to: 1.5},
            duration: 600,
            onComplete: () => {
                secondTween.play();
                countdown.setText('2');
            }
        });

        this.timerText = this.add.text(0, -camera.height * 0.8 / 2.0, '00:59.9', {
            fontSize: cardRadius / 4
        });
        this.timerText.setOrigin(0.5, 0.5);
        this.timer = 59.999;
        this.timerActive = false;

        this.scoreText = this.add.text(0, +camera.height * 0.8 / 2.0, '0', {
            fontSize: cardRadius / 4
        });
        this.scoreText.setOrigin(0.5, 0.5);
        this.score = 0;
        this.incScoreTween = this.add.tween({
            targets: this.scoreText,
            scale: {from: 1.0, to: 1.2},
            duration: 200,
            yoyo: true,
            paused: true,
            onUpdate: (tween) => {
                const progress = Math.floor(Math.abs(Math.abs(tween.progress - 0.5) * 510 - 255));
                const color = Phaser.Display.Color.RGBToString(255 - progress, 255, 255 - progress, 255, '#');
                self.scoreText.setColor(color);
            }
        });
        this.decScoreTween = this.add.tween({
            targets: this.scoreText,
            scale: {from: 1.0, to: 1.2},
            duration: 200,
            yoyo: true,
            paused: true,
            onUpdate: (tween) => {
                const progress = Math.floor(Math.abs(Math.abs(tween.progress - 0.5) * 510 - 255));
                console.log(progress);
                const color = Phaser.Display.Color.RGBToString(255, 255 - progress, 255 - progress, 255, '#');
                self.scoreText.setColor(color);
            }
        });

        this.shuffleCards(this.cardsSet);
        this.currentCard = 0;
        this.topCard.setCard(this.cardsSet[this.currentCard]);
    }

    update(time: number, delta: number) {  
        if (this.timerActive) {
            this.timer -= delta / 1000;
            if (this.timer < 0) {
                this.timer = 0;
            }
            this.timerText.setText('00:' + (this.timer < 10 ? '0' : '')  + this.timer.toFixed(1));
            if (this.timer < 10) {
                this.timerText.setColor('#d50000');
            } else {
                this.timerText.setColor('#ffffff');
            }
            if (this.timer === 0) {
                this.timerActive = false;
                stop();
            }
        }
    }

    onSelected(key: string): void {
        if (!this.timerActive) {
            return;
        }
        const playerCard = this.cardsSet[this.currentCard - 1];
        const topCard = this.cardsSet[this.currentCard];
        if (playerCard.has(key) && topCard.has(key)) {
            console.log('match');
            this.nextPair();
            this.score++;
            this.incScoreTween.play();
        } else {
            console.log('fail');
            this.score--;
            this.decScoreTween.play();
        }
        this.scoreText.setText(this.score.toString(10));
    }

    start() {
        this.timerActive = true;
        this.timer = 59.9;
        this.nextPair();
    }

    stop() {

    }

    nextPair() {
        if (this.currentCard + 1 >= this.cardsSet.length) {
            return;
        }
        this.animationCard.setCard(this.cardsSet[this.currentCard])
        this.animationCard.setVisible(true);
        this.topCard.setCard(this.cardsSet[this.currentCard + 1]);
        this.cardTween.play();
    }

    getColor(key: string): number {
        if (this.idToColor.has(key)) {
            return this.idToColor.get(key);
        }
        const color = Math.floor(Math.random() * 0xffffff);
        this.idToColor.set(key, color);
        return color;
    }

    shuffleCards(array: Card[]) {
        for (let i = array.length - 1; i > 0; --i) {
            let rand = Math.floor(Math.random() * (i + 1));
            [array[i], array[rand]] = [array[rand], array[i]]
        }
    }
}

class SimpleGame extends Phaser.Game {

    constructor() {
        super({
            backgroundColor: 0x008ba3,
            scale: {
                width: 1280,
                height: 720,
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                parent: 'content'
            },
            scene: [SimpleScene]
        });
    }

}