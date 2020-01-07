import { createCanvas } from 'canvas';
import { createWriteStream, readFileSync, writeFileSync } from 'fs';

type Circle = {
    x: number;
    y: number;
    r: number;
};

type Cell = {
    x: number;
    y: number;
};

class CardBuilder {
    data: number[][];
    radius: number;
    minOffset: number;
    width: number;
    height: number;

    constructor(radius: number, minOffset: number) {
        this.radius = radius;
        this.minOffset = minOffset;
        this.width = 2 * radius + 1;
        this.height = 2 * radius + 1;
        this.data = [];

        
        for (let y = 0; y < this.height; ++y) {
            this.data[y] = [];
            for (let x = 0; x < this.width; ++x) {
                const distance = this.distance(radius, radius, x, y);
                this.data[y][x] = Math.max(radius - distance, 0.0);
            }
        }

        // this.drawData('initial');
    }

    putCircle(radius: number) : Circle {
        const availableCells = this.getAvailableCells(radius);
        if (availableCells.length === 0) {
            return null;
        }
        const idx = Math.floor(Math.random() * availableCells.length);
        const cell = availableCells[idx];
        this.fillCircle(cell, radius);

        return {
            x: cell.x / this.radius - 1.0,
            y: cell.y / this.radius - 1.0,
            r: radius / this.radius
        };
    }

    fillCircle(cell: Cell, radius: number) {
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                const distance = this.distance(cell.x, cell.y, x, y);
                const value = Math.max(distance - radius, 0.0);
                this.data[y][x] = Math.min(this.data[y][x], value);
            }
        }
        // this.drawData(cell.x + '_' + cell.y);
    }

    getAvailableCells(radius: number) : Cell[] {
        let cells: Cell[] = [];
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                if (this.data[y][x] > radius + this.minOffset) {
                    cells.push({x: x, y: y});
                }
            }
        }
        return cells;
    }

    distance(fromX: number, fromY: number, toX: number, toY: number) {
        const dx = toX - fromX;
        const dy = toY - fromY;
        return Math.sqrt(dx * dx + dy * dy);
    } 

    drawData(path: string) {
        let out = createWriteStream(path + '.png');
        let canvas = createCanvas(this.width, this.height);
        let context = canvas.getContext('2d');
        let canvasData = context.createImageData(this.width, this.height);
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                const offset = (y * this.width + x) * 4;
                const gray = Math.floor(Math.min(this.data[y][x], this.radius) / this.radius * 0xff);
                canvasData.data[offset + 0] = gray === 0 ? 0xff : gray;
                canvasData.data[offset + 1] = gray;
                canvasData.data[offset + 2] = gray === 0 ? 0xff : gray;
                canvasData.data[offset + 3] = 0xff;
            }
        }
        context.putImageData(canvasData, 0, 0);
        canvas.createPNGStream().pipe(out);
    }
}

function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error('Usage: <permutations.json> <output.json>');
        return;
    }

    const rawJson = readFileSync(args[0]);
    const permutations = JSON.parse(rawJson.toString());
    
    let cardsSet = [];
    for (let permutation of permutations) {
        shuffleArray(permutation);
        let circles: Circle[] = [];
        const radiuses = [80, 70, 70, 60, 50, 45, 40, 40];
        if (permutation.length > radiuses.length) {
            console.error('Need to fix radiuses');
            return;
        }
        while (circles.length !== permutation.length) {
            let builder = new CardBuilder(256, 12);
            circles = [];
            for (let i in permutation) {
                const circle = builder.putCircle(radiuses[i]);
                if (circle === null) {
                    console.log('Another try');
                    break;
                }
                circles.push(circle);
            }
            // builder.drawData('final');
        }

        let card = {}
        for (let i in permutation) {
            card[permutation[i]] = circles[i];
        }
        cardsSet.push(card);
    }
    writeFileSync(args[1], JSON.stringify(cardsSet, null, 4));
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; --i) {
        let rand = Math.floor(Math.random() * (i + 1));
        [array[i], array[rand]] = [array[rand], array[i]]
    }
}

main();