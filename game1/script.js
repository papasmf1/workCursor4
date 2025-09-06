class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // 게임 상태
        this.gameState = 'ready'; // ready, playing, paused, gameOver
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.gameSpeed = 2;
        
        // 게임 객체들
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.stars = [];
        
        // 입력 처리
        this.keys = {};
        
        // 게임 루프
        this.lastTime = 0;
        this.animationId = null;
        
        // 적 생성 타이머
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 120; // 프레임 단위
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createStars();
        this.createPlayer();
        this.updateUI();
        this.draw(); // 초기 화면 그리기
    }
    
    setupEventListeners() {
        // 키보드 이벤트
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.gameState === 'playing') {
                    this.shoot();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // 버튼 이벤트
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.resetGame());
    }
    
    createStars() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                speed: Math.random() * 2 + 1,
                size: Math.random() * 2 + 1
            });
        }
    }
    
    createPlayer() {
        this.player = {
            x: this.width / 2 - 15,
            y: this.height - 60,
            width: 30,
            height: 40,
            speed: 5,
            color: '#00ffff'
        };
    }
    
    startGame() {
        console.log('게임 시작 버튼 클릭됨, 현재 상태:', this.gameState);
        if (this.gameState === 'ready' || this.gameState === 'gameOver' || this.gameState === 'paused') {
            if (this.gameState === 'paused') {
                this.gameState = 'playing';
                this.gameLoop();
            } else {
                this.resetGame();
                this.gameState = 'playing';
                this.gameLoop();
            }
            console.log('게임 시작됨, 새 상태:', this.gameState);
        }
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            cancelAnimationFrame(this.animationId);
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.gameLoop();
        }
    }
    
    resetGame() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.gameSpeed = 2;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.enemySpawnTimer = 0;
        this.createPlayer();
        this.updateUI();
        this.hideGameOver();
        this.draw();
    }
    
    gameLoop(currentTime = 0) {
        if (this.gameState !== 'playing') {
            console.log('게임 루프 중단됨, 상태:', this.gameState);
            return;
        }
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        this.updateStars();
        this.updatePlayer();
        this.updateBullets();
        this.updateEnemies();
        this.updateParticles();
        this.checkCollisions();
        this.spawnEnemies();
        this.updateLevel();
    }
    
    updateStars() {
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.height) {
                star.y = -star.size;
                star.x = Math.random() * this.width;
            }
        });
    }
    
    updatePlayer() {
        if (this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] && this.player.x < this.width - this.player.width) {
            this.player.x += this.player.speed;
        }
        if (this.keys['ArrowUp'] && this.player.y > 0) {
            this.player.y -= this.player.speed;
        }
        if (this.keys['ArrowDown'] && this.player.y < this.height - this.player.height) {
            this.player.y += this.player.speed;
        }
    }
    
    shoot() {
        this.bullets.push({
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 10,
            speed: 8,
            color: '#ffff00'
        });
        
        // 사운드 효과 (웹 오디오 API 사용)
        this.playSound(200, 0.1, 'square');
    }
    
    playSound(frequency, duration, type = 'sine') {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            // 오디오 컨텍스트를 사용할 수 없는 경우 무시
        }
    }
    
    updateBullets() {
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > -bullet.height;
        });
    }
    
    spawnEnemies() {
        this.enemySpawnTimer++;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.enemySpawnTimer = 0;
            this.enemies.push({
                x: Math.random() * (this.width - 30),
                y: -30,
                width: 30,
                height: 30,
                speed: this.gameSpeed + Math.random() * 2,
                color: '#ff4444',
                health: 1
            });
        }
    }
    
    updateEnemies() {
        this.enemies = this.enemies.filter(enemy => {
            enemy.y += enemy.speed;
            return enemy.y < this.height + enemy.height;
        });
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.alpha = particle.life / particle.maxLife;
            return particle.life > 0;
        });
    }
    
    checkCollisions() {
        // 총알과 적 충돌
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.isColliding(bullet, enemy)) {
                    this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    this.bullets.splice(bulletIndex, 1);
                    this.enemies.splice(enemyIndex, 1);
                    this.score += 10;
                    this.playSound(400, 0.2, 'sawtooth'); // 적 파괴 사운드
                    this.updateUI();
                }
            });
        });
        
        // 플레이어와 적 충돌
        this.enemies.forEach((enemy, enemyIndex) => {
            if (this.isColliding(this.player, enemy)) {
                this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                this.enemies.splice(enemyIndex, 1);
                this.lives--;
                this.playSound(150, 0.3, 'triangle'); // 충돌 사운드
                this.updateUI();
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        });
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    createExplosion(x, y) {
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 40,
                maxLife: 40,
                alpha: 1,
                size: Math.random() * 4 + 2,
                color: `hsl(${Math.random() * 60 + 20}, 100%, ${50 + Math.random() * 30}%)`
            });
        }
    }
    
    updateLevel() {
        const newLevel = Math.floor(this.score / 100) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.gameSpeed += 0.5;
            this.enemySpawnInterval = Math.max(60, this.enemySpawnInterval - 10);
            this.updateUI();
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        cancelAnimationFrame(this.animationId);
        this.playSound(100, 1.0, 'sawtooth'); // 게임 오버 사운드
        this.showGameOver();
    }
    
    showGameOver() {
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'block';
    }
    
    hideGameOver() {
        document.getElementById('gameOver').style.display = 'none';
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lives').textContent = this.lives;
    }
    
    draw() {
        // 배경 그리기
        this.ctx.fillStyle = '#000011';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 별 그리기
        this.ctx.fillStyle = '#ffffff';
        this.stars.forEach(star => {
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        
        // 플레이어 그리기
        this.drawPlayer();
        
        // 총알 그리기
        this.bullets.forEach(bullet => {
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        
        // 적 그리기
        this.enemies.forEach(enemy => {
            this.drawEnemy(enemy);
        });
        
        // 파티클 그리기
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x, particle.y, particle.size || 3, particle.size || 3);
            this.ctx.restore();
        });
        
        // 게임 상태 표시
        if (this.gameState === 'paused') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('일시정지', this.width / 2, this.height / 2);
        } else if (this.gameState === 'ready') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = '#00ffff';
            this.ctx.font = '32px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('게임 시작 버튼을 누르세요', this.width / 2, this.height / 2);
        }
    }
    
    drawPlayer() {
        // 플레이어 본체
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // 플레이어 디테일 - 우주선 모양
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(this.player.x + 5, this.player.y + 5, 20, 8);
        this.ctx.fillRect(this.player.x + 10, this.player.y + 13, 10, 15);
        
        // 엔진 불꽃 효과
        this.ctx.fillStyle = '#ff6600';
        this.ctx.fillRect(this.player.x + 12, this.player.y + this.player.height, 6, 8);
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillRect(this.player.x + 13, this.player.y + this.player.height + 2, 4, 6);
    }
    
    drawEnemy(enemy) {
        // 적 본체
        this.ctx.fillStyle = enemy.color;
        this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // 적 디테일 - 외계 우주선 모양
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(enemy.x + 5, enemy.y + 5, 20, 6);
        this.ctx.fillRect(enemy.x + 8, enemy.y + 11, 14, 12);
        
        // 적의 눈
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillRect(enemy.x + 8, enemy.y + 8, 4, 4);
        this.ctx.fillRect(enemy.x + 18, enemy.y + 8, 4, 4);
        
        // 적의 무기
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(enemy.x + 12, enemy.y + enemy.height, 6, 6);
    }
}

// 게임 시작
const game = new Game();
