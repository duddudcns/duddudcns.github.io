class RunRunEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = 600;
        this.canvas.height = 400;

        this.gameRunning = false;
        this.score = 0;
        this.stars = 0;
        this.fever = 0;
        this.isFever = false;
        this.feverTimer = 0;

        this.speed = 4;
        this.gravity = 0.7;

        this.player = {
            x: 80,
            y: 200,
            width: 36,
            height: 36,
            vy: 0,
            jumpPower: -12,
            isJumping: false,
            doubleJump: false,
            rotation: 0
        };

        this.map = []; // Terrain segments
        this.items = []; // Stars
        this.lastTime = 0;
        this.distance = 0;

        // Key bindings
        this.handleInput = this.handleInput.bind(this);
        window.addEventListener('keydown', this.handleInput);
        this.canvas.addEventListener('mousedown', this.handleInput);

        this.initMap();
    }

    initMap() {
        this.map = [];
        for (let i = 0; i < 15; i++) {
            this.addSegment(i * 60);
        }
    }

    addSegment(x) {
        const lastY = this.map.length > 0 ? this.map[this.map.length - 1].y : 320;
        // Generate a smooth transition for hills
        const diff = (Math.random() - 0.5) * 80;
        let newY = Math.max(220, Math.min(340, lastY + diff));

        // Randomly add a gap
        const isGap = Math.random() < 0.15 && this.map.length > 5;

        this.map.push({ x: x, y: isGap ? 600 : newY, width: 61 });

        // Add stars if not a gap
        if (!isGap && Math.random() < 0.4) {
            this.items.push({ x: x + 20, y: newY - 50, collected: false });
        }
    }

    handleInput(e) {
        if (!this.gameRunning) {
            this.startGame();
            return;
        }

        if (!this.player.isJumping) {
            this.player.vy = this.player.jumpPower;
            this.player.isJumping = true;
            this.player.doubleJump = true;
        } else if (this.player.doubleJump) {
            this.player.vy = this.player.jumpPower;
            this.player.doubleJump = false;
        }
    }

    startGame() {
        this.gameRunning = true;
        this.score = 0;
        this.stars = 0;
        this.fever = 0;
        this.isFever = false;
        this.speed = 4;
        this.distance = 0;
        this.items = [];
        this.initMap();
        document.getElementById('statusOverlay').style.opacity = 0;
        this.update();
    }

    update(time = 0) {
        if (!this.gameRunning) return;
        const dt = 16; // Use fixed dt for stability
        this.lastTime = time;

        // Fever logic
        if (this.isFever) {
            this.feverTimer -= dt;
            if (this.feverTimer <= 0) {
                this.isFever = false;
                this.speed -= 4;
            }
        } else if (this.fever >= 100) {
            this.isFever = true;
            this.fever = 0;
            this.feverTimer = 4000; // 4 seconds
            this.speed += 4;
        }

        // Physics
        this.player.vy += this.gravity;
        this.player.y += this.player.vy;

        if (this.player.isJumping) {
            this.player.rotation += 0.2;
        } else {
            this.player.rotation = 0;
        }

        // Map movement
        this.map.forEach(seg => seg.x -= this.speed);
        this.items.forEach(item => item.x -= this.speed);

        if (this.map[0].x < -60) {
            this.map.shift();
            this.addSegment(this.map[this.map.length - 1].x + 60);
        }

        // Collision with map
        let onGround = false;
        this.map.forEach(seg => {
            if (this.player.x + this.player.width > seg.x && this.player.x < seg.x + seg.width) {
                if (this.player.y + this.player.height > seg.y && this.player.y + this.player.height < seg.y + 20 && this.player.vy >= 0) {
                    this.player.y = seg.y - this.player.height;
                    this.player.vy = 0;
                    this.player.isJumping = false;
                    onGround = true;
                }
            }
        });

        if (!onGround && this.player.y < 400) this.player.isJumping = true;

        // Item collection
        this.items.forEach(item => {
            if (!item.collected &&
                this.player.x < item.x + 20 && this.player.x + this.player.width > item.x &&
                this.player.y < item.y + 20 && this.player.y + this.player.height > item.y) {
                item.collected = true;
                this.stars++;
                this.score += 100;
                this.fever = Math.min(100, this.fever + 10);
                this.updateUI();
            }
        });

        // Speed scaling
        this.speed += 0.001;

        // Game over
        if (this.player.y > this.canvas.height) {
            this.gameOver();
        }

        this.draw();
        requestAnimationFrame((t) => this.update(t));
    }

    updateUI() {
        document.getElementById('score').innerText = this.score.toString().padStart(6, '0');
        document.getElementById('hpBar').style.width = this.fever + '%';

        const hpBar = document.getElementById('hpBar');
        if (this.isFever) {
            hpBar.parentElement.style.boxShadow = '0 0 15px #ffd700';
            hpBar.style.background = 'linear-gradient(to right, #ffd700, #fff)';
        } else {
            hpBar.parentElement.style.boxShadow = 'none';
            hpBar.style.background = 'linear-gradient(to right, #ff0055, #ff66aa)';
        }
    }

    drawMonkey(x, y, rotation) {
        this.ctx.save();
        this.ctx.translate(x + 18, y + 18);
        this.ctx.rotate(rotation);

        // Monkey body
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.roundRect(-15, -15, 30, 30, 8);
        this.ctx.fill();

        // Monkey face
        this.ctx.fillStyle = '#FFE4C4';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 5, 12, 10, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Ears
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.arc(-15, -5, 6, 0, Math.PI * 2);
        this.ctx.arc(15, -5, 6, 0, Math.PI * 2);
        this.ctx.fill();

        // Eyes
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(-6, -2, 3, 3);
        this.ctx.fillRect(3, -2, 3, 3);

        this.ctx.restore();
    }

    drawStar(x, y) {
        this.ctx.fillStyle = '#ffd700';
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            this.ctx.lineTo(Math.cos((18 + i * 72) / 180 * Math.PI) * 10 + x + 10,
                -Math.sin((18 + i * 72) / 180 * Math.PI) * 10 + y + 10);
            this.ctx.lineTo(Math.cos((54 + i * 72) / 180 * Math.PI) * 5 + x + 10,
                -Math.sin((54 + i * 72) / 180 * Math.PI) * 5 + y + 10);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Background effects (Fever)
        if (this.isFever) {
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Draw Map
        this.map.forEach(seg => {
            if (seg.y < 500) {
                // Ground body
                this.ctx.fillStyle = '#228B22';
                this.ctx.fillRect(seg.x, seg.y, seg.width + 1, 400);
                // Grass top
                this.ctx.fillStyle = '#32CD32';
                this.ctx.fillRect(seg.x, seg.y, seg.width + 1, 8);
            }
        });

        // Draw Stars
        this.items.forEach(item => {
            if (!item.collected) this.drawStar(item.x, item.y);
        });

        // Draw Player
        this.drawMonkey(this.player.x, this.player.y, this.player.rotation);
    }

    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').innerText = this.score.toString().padStart(6, '0');
        document.getElementById('statusOverlay').style.opacity = 1;
        document.getElementById('statusOverlay').innerText = 'GAME OVER';
        document.getElementById('gameOverModal').style.display = 'flex';
    }

    resetGame() {
        this.gameRunning = false;
        this.score = 0;
        this.fever = 0;
        this.isFever = false;
        this.speed = 4;
        this.items = [];
        this.initMap();
        this.player.y = 200;
        this.player.vy = 0;
        this.updateUI();
        document.getElementById('gameOverModal').style.display = 'none';
        document.getElementById('statusOverlay').style.opacity = 1;
        document.getElementById('statusOverlay').innerText = 'READY?';
        this.draw();
    }

    start() {
        this.draw();
        document.getElementById('statusOverlay').innerText = 'TOUCH TO START';
    }
}
