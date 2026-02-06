class GameEngine {
    constructor(canvas, nextCanvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nextCanvas = nextCanvas;
        this.nctx = nextCanvas.getContext('2d');

        // 캔버스 크기 명시적 설정 (리팩토링 시 누락된 부분)
        this.canvas.width = COLS * BLOCK_SIZE;
        this.canvas.height = ROWS * BLOCK_SIZE;
        this.nextCanvas.width = 120;
        this.nextCanvas.height = 310;

        this.board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
        this.score = 0;
        this.level = 1;
        this.gameRunning = true;
        this.gamePaused = false;
        this.currentPiece = null;
        this.nextQueue = [];
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;
        this.consecutiveType = null;
        this.consecutiveCount = 0;

        // 효과 관련 상태
        this.flashLines = []; // 지워질 줄 인덱스
        this.flashTimer = 0;
        this.landingEffect = { active: false, x: 0, y: 0, timer: 0 };
        this.shakeTimer = 0;

        // InputHandler를 가장 마지막에 초기화하여 this가 안정적으로 넘어가도록 함
        this.input = new InputHandler(this);
    }

    getValidRandomType() {
        const types = 'IOTSZJL';
        let type;
        do {
            type = types[Math.floor(Math.random() * types.length)];
        } while (type === this.consecutiveType && this.consecutiveCount >= 2);

        if (type === this.consecutiveType) {
            this.consecutiveCount++;
        } else {
            this.consecutiveType = type;
            this.consecutiveCount = 1;
        }
        return type;
    }

    initQueue() {
        this.nextQueue = [];
        for (let i = 0; i < 5; i++) {
            this.nextQueue.push(this.getValidRandomType());
        }
    }

    createPiece() {
        if (this.nextQueue.length === 0) this.initQueue();
        const type = this.nextQueue.shift();
        this.nextQueue.push(this.getValidRandomType());

        const piece = new Piece(type);
        this.drawNext();

        if (piece.collision(this.board)) this.gameOver();
        return piece;
    }

    drawBlock(context, x, y, color, size = BLOCK_SIZE, isGhost = false) {
        context.fillStyle = color;
        context.globalAlpha = isGhost ? 0.3 : 1;
        context.fillRect(x * size, y * size, size, size);

        if (!isGhost) {
            context.strokeStyle = 'rgba(255,255,255,0.3)';
            context.strokeRect(x * size + size * 0.1, y * size + size * 0.1, size * 0.8, size * 0.8);
        }

        context.strokeStyle = isGhost ? color : '#000';
        context.globalAlpha = isGhost ? 0.5 : 1;
        context.strokeRect(x * size, y * size, size, size);
        context.globalAlpha = 1;
    }

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = '#111';
        for (let i = 0; i <= COLS; i++) {
            this.ctx.beginPath(); this.ctx.moveTo(i * BLOCK_SIZE, 0); this.ctx.lineTo(i * BLOCK_SIZE, this.canvas.height); this.ctx.stroke();
        }
        for (let i = 0; i <= ROWS; i++) {
            this.ctx.beginPath(); this.ctx.moveTo(0, i * BLOCK_SIZE); this.ctx.lineTo(this.canvas.width, i * BLOCK_SIZE); this.ctx.stroke();
        }

        this.board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) this.drawBlock(this.ctx, x, y, COLORS[value]);
            });
        });

        if (this.currentPiece) {
            let ghostY = 0;
            while (!this.currentPiece.collision(this.board, 0, ghostY + 1)) ghostY++;
            this.currentPiece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) this.drawBlock(this.ctx, this.currentPiece.x + x, this.currentPiece.y + y + ghostY, this.currentPiece.color, BLOCK_SIZE, true);
                });
            });

            this.currentPiece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) this.drawBlock(this.ctx, this.currentPiece.x + x, this.currentPiece.y + y, this.currentPiece.color);
                });
            });
        }

        // 라인 삭제 효과 (발광)
        if (this.flashTimer > 0) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${this.flashTimer / 200})`;
            this.flashLines.forEach(y => {
                this.ctx.fillRect(0, y * BLOCK_SIZE, this.canvas.width, BLOCK_SIZE);
            });
        }

        // 착지 효과
        if (this.landingEffect.active) {
            const opacity = this.landingEffect.timer / 150;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
            this.ctx.fillRect(0, this.landingEffect.y * BLOCK_SIZE, this.canvas.width, BLOCK_SIZE * 0.5);
        }
    }

    drawNext() {
        this.nctx.fillStyle = '#000';
        this.nctx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

        this.nctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
        this.nctx.beginPath(); this.nctx.moveTo(10, 110); this.nctx.lineTo(110, 110); this.nctx.stroke();

        this.nextQueue.forEach((type, index) => {
            const shape = SHAPES[type];
            const color = COLORS[type];
            const size = index === 0 ? 25 : 14;
            const containerWidth = 120;
            const containerHeight = index === 0 ? 110 : 50;
            const startY = index === 0 ? 0 : 110 + (index - 1) * 50;

            let minX = 4, maxX = -1, minY = 4, maxY = -1;
            shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                });
            });

            const pieceW = (maxX - minX + 1) * size;
            const pieceH = (maxY - minY + 1) * size;
            const offsetX = (containerWidth - pieceW) / 2 - minX * size;
            const offsetY = startY + (containerHeight - pieceH) / 2 - minY * size;

            shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        this.nctx.fillStyle = color;
                        this.nctx.fillRect(offsetX + x * size, offsetY + y * size, size, size);
                        this.nctx.strokeStyle = '#000';
                        this.nctx.strokeRect(offsetX + x * size, offsetY + y * size, size, size);
                        if (index === 0) {
                            this.nctx.strokeStyle = 'rgba(255,255,255,0.2)';
                            this.nctx.strokeRect(offsetX + x * size + 2, offsetY + y * size + 2, size - 4, size - 4);
                        }
                    }
                });
            });
        });
    }

    moveLeft() { if (this.currentPiece) { this.currentPiece.x--; if (this.currentPiece.collision(this.board)) this.currentPiece.x++; this.draw(); } }
    moveRight() { if (this.currentPiece) { this.currentPiece.x++; if (this.currentPiece.collision(this.board)) this.currentPiece.x--; this.draw(); } }

    moveDown() {
        if (!this.currentPiece) return;
        this.currentPiece.y++;
        if (this.currentPiece.collision(this.board)) { this.currentPiece.y--; this.lockPiece(); }
        this.dropCounter = 0;
    }

    lockPiece() {
        this.currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const boardY = this.currentPiece.y + y;
                    if (boardY >= 0) this.board[boardY][this.currentPiece.x + x] = this.currentPiece.type;
                }
            });
        });

        // 착지 효과 활성화
        this.landingEffect = {
            active: true,
            y: this.currentPiece.y + this.currentPiece.shape.length - 1,
            timer: 150
        };

        const linesToClear = [];
        for (let y = ROWS - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                linesToClear.push(y);
            }
        }

        if (linesToClear.length > 0) {
            this.flashLines = linesToClear;
            this.flashTimer = 200; // 200ms 동안 반짝임

            // 효과 종료 후 실제 라인 삭제
            setTimeout(() => {
                this.executeClearLines(linesToClear.length);
                this.flashLines = [];
            }, 200);
        }

        this.currentPiece = this.createPiece();
    }

    executeClearLines(linesCleared) {
        outer: for (let y = ROWS - 1; y >= 0; y--) {
            for (let x = 0; x < COLS; x++) { if (this.board[y][x] === 0) continue outer; }
            this.board.splice(y, 1);
            this.board.unshift(Array(COLS).fill(0));
            y++;
        }

        this.score += [0, 100, 300, 500, 800][linesCleared] * this.level;
        this.level = Math.floor(this.score / 2000) + 1;
        this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
        document.getElementById('score').innerText = this.score.toString().padStart(6, '0');
        document.getElementById('level').innerText = this.level;
    }

    clearLines() {
        // lockPiece에서 처리하므로 이 함수는 사용하지 않거나 executeClearLines로 대체
    }

    hardDrop() {
        if (!this.currentPiece) return;
        while (!this.currentPiece.collision(this.board, 0, 1)) this.currentPiece.y++;

        // 화면 흔들림 효과 트리거
        this.triggerShake();

        this.lockPiece();
        this.draw();
    }

    triggerShake() {
        const wrapper = document.querySelector('.game-wrapper');
        wrapper.classList.remove('shake');
        void wrapper.offsetWidth; // 리플로우 강제
        wrapper.classList.add('shake');
        setTimeout(() => wrapper.classList.remove('shake'), 150);
    }

    togglePause() {
        this.gamePaused = !this.gamePaused;
        document.getElementById('pauseBtn').innerText = this.gamePaused ? '재개하기' : '일시정지';
    }

    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').innerText = this.score;
        document.getElementById('gameOverModal').style.display = 'flex';
    }

    resetGame() {
        this.board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
        this.score = 0; this.level = 1; this.dropInterval = 1000;
        this.gameRunning = true; this.gamePaused = false;
        document.getElementById('score').innerText = '000000';
        document.getElementById('level').innerText = '1';
        document.getElementById('gameOverModal').style.display = 'none';
        this.consecutiveCount = 0; this.consecutiveType = null;
        this.initQueue();
        this.currentPiece = this.createPiece();
        this.input.hardDropProcessed = false;
        this.draw();
    }

    update(time = 0) {
        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        // 효과 타이머 업데이트
        if (this.flashTimer > 0) this.flashTimer -= deltaTime;
        if (this.landingEffect.active) {
            this.landingEffect.timer -= deltaTime;
            if (this.landingEffect.timer <= 0) this.landingEffect.active = false;
        }

        if (!this.gamePaused && this.gameRunning) {
            this.input.update(deltaTime);
            this.dropCounter += deltaTime;
            if (this.dropCounter > this.dropInterval) this.moveDown();
            this.draw();
        }
        requestAnimationFrame((t) => this.update(t));
    }

    start() {
        this.initQueue();
        this.currentPiece = this.createPiece();
        this.update();
    }
}
