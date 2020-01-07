class SimpleScene extends Phaser.Scene implements ICardListener {
    constructor() {
        super({
            key: 'simple',
            active: true,
        });
    }

    topCard: CircleBasedCard;
    playerCard: CircleBasedCard;
    idToColor: Map<string, number>;

    cardsSet: Card[];
    currentCard: number;

    preload() {
        this.load.json('cardsSet', 'data/cards8.json');
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
                    r: Number(elementJson.r)
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
        
        this.topCard.setPosition(-camera.height * 0.9 / 2.0, 0.0);
        this.playerCard.setPosition(+camera.height * 0.9 / 2.0, 0.0);

        this.currentCard = this.cardsSet.length;
        this.nextPair();
    }

    update(time: number, delta: number) {  
    }

    onSelected(key: string): void {
        const playerCard = this.cardsSet[this.currentCard - 1];
        const topCard = this.cardsSet[this.currentCard];
        if (playerCard.has(key) && topCard.has(key)) {
            console.log('match');
            this.nextPair();
        } else {
            console.log('fail');
        }
    }

    nextPair() {
        if (this.currentCard + 1 >= this.cardsSet.length) {
            this.shuffleCards(this.cardsSet);
            this.currentCard = 0;
        }
        this.currentCard++;
        this.playerCard.setCard(this.cardsSet[this.currentCard - 1]);
        this.topCard.setCard(this.cardsSet[this.currentCard]);
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
            backgroundColor: 0x000000,
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