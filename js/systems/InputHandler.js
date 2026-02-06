class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.keyTimers = { left: 0, right: 0, down: 0 };
        this.hardDropProcessed = false;
        this.DAS = 170;
        this.ARR = 50;

        window.addEventListener('keydown', event => this.handleKeyDown(event));
        window.addEventListener('keyup', event => this.handleKeyUp(event));
    }

    handleKeyDown(event) {
        const key = event.key.toLowerCase();
        this.keys[key] = true;

        if (!this.game.gameRunning) return;
        if (key === 'p') {
            this.game.togglePause();
            return;
        }
        if (this.game.gamePaused) return;

        if (key === 'w' || key === 'arrowup') {
            this.game.currentPiece.rotate(this.game.board);
            event.preventDefault();
        } else if (key === ' ') {
            event.preventDefault();
            if (!this.hardDropProcessed) {
                this.game.hardDrop();
                this.hardDropProcessed = true;
            }
        } else if (['arrowleft', 'arrowright', 'arrowdown'].includes(key)) {
            event.preventDefault();
        }
        this.game.draw();
    }

    handleKeyUp(event) {
        const key = event.key.toLowerCase();
        this.keys[key] = false;
        if (key === ' ') this.hardDropProcessed = false;
    }

    update(deltaTime) {
        if (this.game.gamePaused || !this.game.gameRunning || !this.game.currentPiece) return;

        if (this.keys['arrowleft']) {
            if (this.keyTimers.left === 0) { this.game.moveLeft(); this.keyTimers.left = this.DAS; }
            else { this.keyTimers.left -= deltaTime; if (this.keyTimers.left <= 0) { this.game.moveLeft(); this.keyTimers.left = this.ARR; } }
        } else this.keyTimers.left = 0;

        if (this.keys['arrowright']) {
            if (this.keyTimers.right === 0) { this.game.moveRight(); this.keyTimers.right = this.DAS; }
            else { this.keyTimers.right -= deltaTime; if (this.keyTimers.right <= 0) { this.game.moveRight(); this.keyTimers.right = this.ARR; } }
        } else this.keyTimers.right = 0;

        if (this.keys['arrowdown']) {
            if (this.keyTimers.down === 0) { this.game.moveDown(); this.keyTimers.down = this.ARR; }
            else { this.keyTimers.down -= deltaTime; if (this.keyTimers.down <= 0) { this.game.moveDown(); this.keyTimers.down = this.ARR; } }
        } else this.keyTimers.down = 0;
    }
}
