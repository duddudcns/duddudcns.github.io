class SwingEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = 600;
        this.canvas.height = 400;

        this.gameRunning = false;
        this.distance = 0;
        this.speed = 4;

        // Player state
        this.player = {
            x: 100,
            y: 200,
            vx: 0,
            vy: 0,
            radius: 18,
            airTime: 0  // Hang time counter
        };

        // Rope state
        this.rope = {
            attached: false,
            anchorX: 0,
            anchorY: 0,
            length: 0,
            angle: 0,
            angularVelocity: 0
        };

        this.gravity = 0.24;
        this.lastTime = 0;
        this.accumulatedMs = 0;
        this.fixedDeltaMs = 1000 / 60;
        this.maxAccumulatedMs = 250;
        this.ropeSpeedMultiplier = 1.5;
        this.lastStatusKey = 'swing.touchToStart';

        // Ceiling anchors (visual dots on ceiling)
        this.anchors = [];
        this.generateAnchors();

        // Input
        this.handleInput = this.handleInput.bind(this);
        window.addEventListener('mousedown', this.handleInput);
        window.addEventListener('keydown', this.handleInput);
        window.addEventListener('app:language-changed', () => this.applyStatusText());
    }

    t(key, fallback) {
        if (window.AppI18n) return window.AppI18n.t(key, fallback);
        return fallback;
    }

    applyStatusText() {
        const statusOverlay = document.getElementById('statusOverlay');
        if (!statusOverlay || !this.lastStatusKey) return;
        statusOverlay.innerText = this.t(this.lastStatusKey, statusOverlay.innerText);
    }

    generateAnchors() {
        this.anchors = [];
        for (let i = 0; i < 20; i++) {
            this.anchors.push({
                x: 100 + i * 80,
                used: false
            });
        }
    }

    handleInput() {
        if (!this.gameRunning) {
            this.startGame();
            return;
        }

        if (this.rope.attached) {
            // Release rope
            this.releaseRope();
        } else {
            // Attach rope to nearest anchor ahead
            this.attachRope();
        }
    }

    attachRope() {
        // Shoot rope at 45 degrees upward-right and find where it hits ceiling
        const ceilingY = 30;
        const shootAngle = -Math.PI / 4; // 45 degrees up-right

        // Calculate where the 45-degree line from player hits the ceiling
        // Line equation: y - playerY = tan(angle) * (x - playerX)
        // At y = ceilingY: ceilingY - playerY = tan(angle) * (anchorX - playerX)
        const dy = ceilingY - this.player.y;
        const dx = dy / Math.tan(shootAngle);
        const anchorX = this.player.x + dx;

        // Only attach if anchor point is within screen bounds
        if (anchorX > this.player.x && anchorX < this.canvas.width + 100) {
            this.rope.anchorX = anchorX;
            this.rope.anchorY = ceilingY;
            this.rope.attached = true;

            // Calculate rope length and angle
            const rdx = this.player.x - this.rope.anchorX;
            const rdy = this.player.y - this.rope.anchorY;
            this.rope.length = Math.sqrt(rdx * rdx + rdy * rdy);
            this.rope.angle = Math.atan2(rdy, rdx);

            // Convert current velocity to angular velocity
            const tangentVel = this.player.vx * Math.cos(this.rope.angle + Math.PI / 2) +
                this.player.vy * Math.sin(this.rope.angle + Math.PI / 2);
            this.rope.angularVelocity = tangentVel / this.rope.length;
        }
    }

    releaseRope() {
        if (!this.rope.attached) return;

        // Convert angular velocity to linear velocity (preserve momentum)
        const tangentSpeed = this.rope.angularVelocity * this.rope.length * 0.8;
        this.player.vx = -tangentSpeed * Math.sin(this.rope.angle) + this.speed;
        this.player.vy = tangentSpeed * Math.cos(this.rope.angle);

        // Cap max velocity on release
        const maxVel = 6;
        this.player.vx = Math.max(-maxVel, Math.min(maxVel, this.player.vx));
        this.player.vy = Math.max(-maxVel, Math.min(maxVel, this.player.vy));
        this.player.airTime = 0;  // Reset hang time

        this.rope.attached = false;
    }

    startGame() {
        this.gameRunning = true;
        this.distance = 0;
        this.speed = 4;
        this.player.x = 100;
        this.player.y = 150;
        this.player.vx = 6;
        this.player.vy = 0;
        this.rope.attached = false;
        this.generateAnchors();

        // Start with rope attached to first anchor
        this.attachRope();

        document.getElementById('statusOverlay').style.opacity = 0;
        this.lastTime = performance.now();
        this.accumulatedMs = 0;
        requestAnimationFrame((t) => this.update(t));
    }

    step() {
        if (!this.gameRunning) return;
        const scrollMultiplier = this.ropeSpeedMultiplier;

        if (this.rope.attached) {
            // Realistic pendulum physics with controlled speed
            const angularAcceleration = (this.gravity * 0.125 / this.rope.length) * Math.cos(this.rope.angle);
            this.rope.angularVelocity += angularAcceleration;
            // Cap maximum swing speed - very slow
            const maxAngularVelocity = 0.06;
            this.rope.angularVelocity = Math.max(-maxAngularVelocity, Math.min(maxAngularVelocity, this.rope.angularVelocity));
            this.rope.angle += this.rope.angularVelocity * this.ropeSpeedMultiplier;

            // Update player position based on rope
            this.player.x = this.rope.anchorX + Math.cos(this.rope.angle) * this.rope.length;
            this.player.y = this.rope.anchorY + Math.sin(this.rope.angle) * this.rope.length;

            // Move anchor with world scroll
            this.rope.anchorX -= this.speed * scrollMultiplier;
        } else {
            // Free fall / flight with hang time
            this.player.airTime++;
            // Gravity increases gradually after hang time
            const gravityScale = Math.min(1, this.player.airTime / 30);
            this.player.vy += this.gravity * gravityScale;
            this.player.x += this.player.vx;
            this.player.y += this.player.vy;

            // Prevent going above ceiling
            if (this.player.y < 50) {
                this.player.y = 50;
                this.player.vy = Math.max(0, this.player.vy);
            }
        }

        // Camera follows player - responsive tracking
        const targetX = 150;
        const cameraAdjust = (this.player.x - targetX) * 0.1;
        this.speed = Math.max(4, 4 + cameraAdjust);

        // Apply camera scroll to player position
        this.player.x -= this.speed * scrollMultiplier;

        // World scroll
        this.distance += this.speed * scrollMultiplier;

        // Generate more anchors if needed
        const lastAnchorWorldX = this.anchors[this.anchors.length - 1].x;
        if (lastAnchorWorldX - this.distance < 800) {
            this.anchors.push({
                x: lastAnchorWorldX + 60 + Math.random() * 40,
                used: false
            });
        }

        // Remove passed anchors
        while (this.anchors.length > 0 && this.anchors[0].x < this.distance - 100) {
            this.anchors.shift();
        }

        // Keep player visible on screen
        if (this.player.x < 30 && !this.rope.attached) {
            this.gameOver();
            return;
        }

        // Game over if fall below screen
        if (this.player.y > this.canvas.height + 50) {
            this.gameOver();
            return;
        }

        // Update UI
        document.getElementById('score').innerHTML = Math.floor(this.distance) + '<span style="font-size: 0.8rem;">m</span>';
    }

    update(time = 0) {
        if (!this.gameRunning) return;

        if (!this.lastTime) this.lastTime = time;
        let elapsed = time - this.lastTime;
        this.lastTime = time;
        elapsed = Math.min(elapsed, this.maxAccumulatedMs);
        this.accumulatedMs += elapsed;

        while (this.accumulatedMs >= this.fixedDeltaMs && this.gameRunning) {
            this.step();
            this.accumulatedMs -= this.fixedDeltaMs;
        }

        this.draw();
        requestAnimationFrame((t) => this.update(t));
    }

    drawMonkey(x, y) {
        this.ctx.save();
        this.ctx.translate(x, y);

        // Body
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
        this.ctx.fill();

        // Face
        this.ctx.fillStyle = '#FFE4C4';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 5, 10, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Ears
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.arc(-12, -5, 5, 0, Math.PI * 2);
        this.ctx.arc(12, -5, 5, 0, Math.PI * 2);
        this.ctx.fill();

        // Eyes
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(-5, -2, 3, 3);
        this.ctx.fillRect(2, -2, 3, 3);

        this.ctx.restore();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Ceiling
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.canvas.width, 40);

        // Anchor points on ceiling
        this.ctx.fillStyle = '#ffd700';
        for (const anchor of this.anchors) {
            const screenX = anchor.x - this.distance;
            if (screenX > -20 && screenX < this.canvas.width + 20) {
                this.ctx.beginPath();
                this.ctx.arc(screenX, 30, anchor.used ? 4 : 6, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        // Draw rope if attached
        if (this.rope.attached) {
            this.ctx.strokeStyle = '#ffd700';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(this.rope.anchorX, this.rope.anchorY);
            this.ctx.lineTo(this.player.x, this.player.y);
            this.ctx.stroke();
        }

        // Draw player
        this.drawMonkey(this.player.x, this.player.y);

        // Ground indicator (danger zone)
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        this.ctx.fillRect(0, this.canvas.height - 20, this.canvas.width, 20);
    }

    gameOver() {
        this.gameRunning = false;
        const bestDistance = Math.floor(this.distance);
        document.getElementById('finalScore').innerText = bestDistance + 'm';
        document.getElementById('gameOverModal').style.display = 'flex';

        if (window.AuthLeaderboard) {
            window.AuthLeaderboard.init()
                .then(() => window.AuthLeaderboard.saveBestScore('noahnohah', bestDistance))
                .catch((err) => console.error('[noahnohah] score save failed:', err));
        }
    }

    resetGame() {
        this.gameRunning = false;
        this.distance = 0;
        this.speed = 4;
        this.lastTime = 0;
        this.accumulatedMs = 0;
        this.player.x = 100;
        this.player.y = 150;
        this.player.vx = 0;
        this.player.vy = 0;
        this.rope.attached = false;
        this.generateAnchors();
        document.getElementById('gameOverModal').style.display = 'none';
        document.getElementById('statusOverlay').style.opacity = 1;
        this.lastStatusKey = 'swing.touchToStart';
        this.applyStatusText();
        this.draw();
    }

    start() {
        this.draw();
        this.lastStatusKey = 'swing.touchToStart';
        this.applyStatusText();
    }
}

