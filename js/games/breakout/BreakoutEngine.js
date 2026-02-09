class BreakoutEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = 600;
        this.canvas.height = 400;

        this.Engine = Matter.Engine;
        this.World = Matter.World;
        this.Bodies = Matter.Bodies;
        this.Body = Matter.Body;
        this.Events = Matter.Events;
        this.Composite = Matter.Composite;

        this.engine = this.Engine.create();
        this.engine.gravity.y = 0;
        this.world = this.engine.world;

        this.gameRunning = false;
        this.lastStatusKey = 'breakout.touchToStart';

        this.score = 0;
        this.lives = 3;
        this.level = 1;

        this.paddleTargetX = this.canvas.width / 2;
        this.paddleSpeed = 9;
        this.ballBaseSpeed = 4.8;
        this.ballSpeed = this.ballBaseSpeed;
        this.ballStuck = true;

        this.keys = { left: false, right: false };
        this.bricks = [];

        this.lastTime = 0;
        this.accumulatedMs = 0;
        this.fixedDeltaMs = 1000 / 60;
        this.maxAccumulatedMs = 250;

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handlePointerMove = this.handlePointerMove.bind(this);
        this.handleStartInput = this.handleStartInput.bind(this);

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('mousemove', this.handlePointerMove);
        this.canvas.addEventListener('touchmove', this.handlePointerMove, { passive: false });
        this.canvas.addEventListener('mousedown', this.handleStartInput);
        this.canvas.addEventListener('touchstart', this.handleStartInput, { passive: true });
        window.addEventListener('app:language-changed', () => this.applyStatusText());

        this.setupWorld();
        this.updateUI();
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

    setupWorld() {
        this.Composite.clear(this.world, false);

        const wallOptions = { isStatic: true, restitution: 1, friction: 0, frictionStatic: 0 };
        this.walls = [
            this.Bodies.rectangle(this.canvas.width / 2, -10, this.canvas.width, 20, { ...wallOptions, label: 'wall-top' }),
            this.Bodies.rectangle(-10, this.canvas.height / 2, 20, this.canvas.height, { ...wallOptions, label: 'wall-left' }),
            this.Bodies.rectangle(this.canvas.width + 10, this.canvas.height / 2, 20, this.canvas.height, { ...wallOptions, label: 'wall-right' })
        ];

        this.paddle = this.Bodies.rectangle(this.canvas.width / 2, this.canvas.height - 24, 110, 14, {
            isStatic: true,
            friction: 0,
            frictionStatic: 0,
            restitution: 1,
            label: 'paddle'
        });

        this.ball = this.Bodies.circle(this.canvas.width / 2, this.canvas.height - 40, 8, {
            restitution: 1,
            friction: 0,
            frictionAir: 0,
            frictionStatic: 0,
            inertia: Infinity,
            label: 'ball'
        });

        this.createBricks();
        this.World.add(this.world, [...this.walls, this.paddle, this.ball, ...this.bricks]);
        this.bindCollisionEvents();
        this.resetBall(true);
    }

    createBricks() {
        const rows = 5;
        const cols = 10;
        const brickW = 54;
        const brickH = 18;
        const gap = 4;
        const offsetX = 20;
        const offsetY = 50;
        const colors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];

        this.bricks = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const brick = this.Bodies.rectangle(
                    offsetX + c * (brickW + gap) + brickW / 2,
                    offsetY + r * (brickH + gap) + brickH / 2,
                    brickW,
                    brickH,
                    {
                        isStatic: true,
                        restitution: 1,
                        friction: 0,
                        frictionStatic: 0,
                        label: 'brick'
                    }
                );
                brick.renderColor = colors[r % colors.length];
                this.bricks.push(brick);
            }
        }
    }

    bindCollisionEvents() {
        this.Events.off(this.engine, 'collisionStart');
        this.Events.on(this.engine, 'collisionStart', (event) => {
            for (const pair of event.pairs) {
                const { bodyA, bodyB } = pair;
                const isBallBrick =
                    (bodyA.label === 'ball' && bodyB.label === 'brick') ||
                    (bodyB.label === 'ball' && bodyA.label === 'brick');
                const isBallPaddle =
                    (bodyA.label === 'ball' && bodyB.label === 'paddle') ||
                    (bodyB.label === 'ball' && bodyA.label === 'paddle');
                const isBallSideWall =
                    (bodyA.label === 'ball' && (bodyB.label === 'wall-left' || bodyB.label === 'wall-right')) ||
                    (bodyB.label === 'ball' && (bodyA.label === 'wall-left' || bodyA.label === 'wall-right'));

                if (isBallBrick) {
                    const brick = bodyA.label === 'brick' ? bodyA : bodyB;
                    if (this.world.bodies.includes(brick)) {
                        this.World.remove(this.world, brick);
                        this.score += 10;
                        this.updateUI();
                        if (!this.world.bodies.some((b) => b.label === 'brick')) this.nextLevel();
                    }
                }

                if (isBallPaddle) {
                    const ball = bodyA.label === 'ball' ? bodyA : bodyB;
                    const paddle = bodyA.label === 'paddle' ? bodyA : bodyB;

                    // Paddle bounce angle is based on hit position, like classic breakout.
                    if (ball.velocity.y > 0) {
                        const halfWidth = paddle.bounds.max.x - paddle.position.x;
                        const rawHit = (ball.position.x - paddle.position.x) / halfWidth;
                        const hitPos = Math.max(-1, Math.min(1, rawHit));
                        const bounceAngle = hitPos * (Math.PI / 3);
                        const vx = this.ballSpeed * Math.sin(bounceAngle);
                        const vy = -Math.abs(this.ballSpeed * Math.cos(bounceAngle));

                        this.Body.setPosition(ball, {
                            x: ball.position.x,
                            y: paddle.position.y - (ball.circleRadius + 8)
                        });
                        this.Body.setVelocity(ball, { x: vx, y: vy });
                    }
                }

                if (isBallSideWall) {
                    const ball = bodyA.label === 'ball' ? bodyA : bodyB;
                    const wall = bodyA.label.startsWith('wall-') ? bodyA : bodyB;
                    const minWallBounceX = this.ballSpeed * 0.35;
                    const dir = wall.label === 'wall-left' ? 1 : -1;
                    const vx = dir * Math.max(Math.abs(ball.velocity.x), minWallBounceX);
                    this.Body.setVelocity(ball, { x: vx, y: ball.velocity.y });
                }
            }
        });
    }

    resetBall(stuck = true) {
        this.ballStuck = stuck;
        const px = this.paddle.position.x;
        const py = this.paddle.position.y - 14;
        this.Body.setPosition(this.ball, { x: px, y: py });
        this.Body.setVelocity(this.ball, { x: 0, y: 0 });
        this.Body.setAngularVelocity(this.ball, 0);
        this.Body.setStatic(this.ball, stuck);
    }

    launchBall() {
        if (!this.ballStuck) return;
        this.ballStuck = false;
        this.Body.setStatic(this.ball, false);
        const dir = Math.random() > 0.5 ? 1 : -1;
        this.Body.setVelocity(this.ball, { x: this.ballSpeed * 0.75 * dir, y: -this.ballSpeed });
    }

    handleStartInput() {
        if (!this.gameRunning) {
            this.startGame();
            return;
        }
        this.launchBall();
    }

    handleKeyDown(event) {
        const key = event.key.toLowerCase();
        if (key === 'arrowleft' || key === 'a') this.keys.left = true;
        if (key === 'arrowright' || key === 'd') this.keys.right = true;
        if (key === ' ' && this.gameRunning && this.ballStuck) {
            event.preventDefault();
            this.launchBall();
        }
    }

    handleKeyUp(event) {
        const key = event.key.toLowerCase();
        if (key === 'arrowleft' || key === 'a') this.keys.left = false;
        if (key === 'arrowright' || key === 'd') this.keys.right = false;
    }

    handlePointerMove(event) {
        let clientX;
        if (event.touches && event.touches[0]) {
            clientX = event.touches[0].clientX;
            event.preventDefault();
        } else {
            clientX = event.clientX;
        }
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const localX = (clientX - rect.left) * scaleX;
        const halfW = this.paddle.bounds.max.x - this.paddle.position.x;
        this.paddleTargetX = Math.max(halfW, Math.min(this.canvas.width - halfW, localX));
    }

    startGame() {
        this.gameRunning = true;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.ballSpeed = this.ballBaseSpeed;
        this.setupWorld();
        this.updateUI();

        const statusOverlay = document.getElementById('statusOverlay');
        if (statusOverlay) statusOverlay.style.opacity = 0;
        document.getElementById('gameOverModal').style.display = 'none';

        this.lastTime = performance.now();
        this.accumulatedMs = 0;
        requestAnimationFrame((t) => this.update(t));
    }

    nextLevel() {
        this.level += 1;
        this.ballSpeed += 0.35;
        this.createBricks();
        this.World.add(this.world, this.bricks);
        this.resetBall(true);
        this.updateUI();
    }

    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').innerText = this.score.toString().padStart(6, '0');
        document.getElementById('gameOverModal').style.display = 'flex';
        const statusOverlay = document.getElementById('statusOverlay');
        if (statusOverlay) {
            statusOverlay.style.opacity = 1;
            this.lastStatusKey = 'breakout.gameOver';
            this.applyStatusText();
        }

        if (window.AuthLeaderboard) {
            window.AuthLeaderboard.init()
                .then(() => window.AuthLeaderboard.saveBestScore('breakout', this.score))
                .catch((err) => console.error('[breakout] score save failed:', err));
        }
    }

    resetGame() {
        this.gameRunning = false;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.ballSpeed = this.ballBaseSpeed;
        this.setupWorld();
        this.updateUI();
        this.lastTime = 0;
        this.accumulatedMs = 0;
        document.getElementById('gameOverModal').style.display = 'none';
        const statusOverlay = document.getElementById('statusOverlay');
        if (statusOverlay) {
            statusOverlay.style.opacity = 1;
            this.lastStatusKey = 'breakout.ready';
            this.applyStatusText();
        }
        this.draw();
    }

    updateUI() {
        document.getElementById('score').innerText = this.score.toString().padStart(6, '0');
        document.getElementById('lives').innerText = this.lives;
        document.getElementById('level').innerText = this.level;
    }

    movePaddle() {
        if (this.keys.left) this.paddleTargetX -= this.paddleSpeed;
        if (this.keys.right) this.paddleTargetX += this.paddleSpeed;

        const halfW = this.paddle.bounds.max.x - this.paddle.position.x;
        this.paddleTargetX = Math.max(halfW, Math.min(this.canvas.width - halfW, this.paddleTargetX));
        this.Body.setPosition(this.paddle, { x: this.paddleTargetX, y: this.paddle.position.y });

        if (this.ballStuck) {
            this.Body.setPosition(this.ball, { x: this.paddle.position.x, y: this.paddle.position.y - 14 });
        }
    }

    normalizeBallSpeed() {
        if (this.ballStuck) return;
        const vx = this.ball.velocity.x;
        const vy = this.ball.velocity.y;
        const mag = Math.hypot(vx, vy) || 1;
        const nx = vx / mag;
        const ny = vy / mag;
        const minX = 0.22;
        const signX = Math.sign(nx || 1);
        const signY = ny < 0 ? -1 : 1;
        const absX = Math.max(minX, Math.abs(nx));
        const absY = Math.sqrt(1 - absX * absX);
        this.Body.setVelocity(this.ball, {
            x: signX * absX * this.ballSpeed,
            y: signY * absY * this.ballSpeed
        });
    }

    step() {
        if (!this.gameRunning) return;
        this.movePaddle();
        this.Engine.update(this.engine, this.fixedDeltaMs);

        if (!this.ballStuck && this.ball.position.y - this.ball.circleRadius > this.canvas.height + 10) {
            this.lives -= 1;
            if (this.lives <= 0) {
                this.gameOver();
                return;
            }
            this.resetBall(true);
            this.updateUI();
        }

        this.normalizeBallSpeed();
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

    drawBody(body, fill, stroke = null) {
        this.ctx.beginPath();
        const vertices = body.vertices;
        this.ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i++) {
            this.ctx.lineTo(vertices[i].x, vertices[i].y);
        }
        this.ctx.closePath();
        this.ctx.fillStyle = fill;
        this.ctx.fill();
        if (stroke) {
            this.ctx.strokeStyle = stroke;
            this.ctx.stroke();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#0d1330';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (const body of this.world.bodies) {
            if (body.label === 'brick') {
                this.drawBody(body, body.renderColor || '#ff595e', 'rgba(255,255,255,0.2)');
            } else if (body.label === 'paddle') {
                this.drawBody(body, '#00d4ff');
            } else if (body.label === 'ball') {
                this.ctx.beginPath();
                this.ctx.arc(body.position.x, body.position.y, body.circleRadius, 0, Math.PI * 2);
                this.ctx.fillStyle = '#ffd166';
                this.ctx.fill();
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.stroke();
            }
        }
    }

    start() {
        this.lastStatusKey = 'breakout.touchToStart';
        this.applyStatusText();
        this.draw();
    }
}
