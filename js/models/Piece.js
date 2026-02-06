class Piece {
    constructor(type) {
        this.type = type;
        this.color = COLORS[type];
        this.shape = JSON.parse(JSON.stringify(SHAPES[type]));
        this.x = Math.floor(COLS / 2) - Math.floor(this.shape[0].length / 2);
        this.y = type === 'I' ? -1 : 0;
    }

    rotate(board) {
        const oldShape = this.shape;
        const newShape = Array(this.shape.length).fill().map(() => Array(this.shape.length).fill(0));
        for (let y = 0; y < this.shape.length; ++y) {
            for (let x = 0; x < this.shape[y].length; ++x) {
                newShape[x][this.shape.length - 1 - y] = this.shape[y][x];
            }
        }
        const originalX = this.x;
        this.shape = newShape;
        if (this.collision(board)) {
            this.x += 1;
            if (this.collision(board)) {
                this.x -= 2;
                if (this.collision(board)) {
                    this.x = originalX;
                    this.shape = oldShape;
                }
            }
        }
    }

    collision(board, offsetX = 0, offsetY = 0, newShape = null) {
        const shape = newShape || this.shape;
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const newX = this.x + x + offsetX;
                    const newY = this.y + y + offsetY;
                    if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
                    if (newY >= 0 && board[newY][newX]) return true;
                }
            }
        }
        return false;
    }
}
