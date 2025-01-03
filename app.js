const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const balanceElement = document.getElementById('balance');
const gameOverElement = document.getElementById('gameOver');
const restartButton = document.getElementById('restartButton');
const loadingScreen = document.getElementById('loadingScreen');
const mainMenu = document.getElementById('mainMenu');
const gameScreen = document.getElementById('gameScreen');
const startButton = document.getElementById('startButton');

canvas.width = window.innerWidth > 400 ? 400 : window.innerWidth;
canvas.height = window.innerHeight;

const paddleWidth = 80;
const paddleHeight = 10;
const paddleSpeed = 6;
const ballRadius = 10;
const coinRadius = 20;
const coinRowCount = 5;
const coinColumnCount = 4;
const coinPadding = 20;
const coinOffsetTop = 50;
const coinOffsetLeft = 50;

let paddleX = (canvas.width - paddleWidth) / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height - 50;
let ballDX = 3;
let ballDY = -3;
let rightPressed = false;
let leftPressed = false;
let balance = 0;
let gameOver = false;

const coins = [];
for (let c = 0; c < coinColumnCount; c++) {
    coins[c] = [];
    for (let r = 0; r < coinRowCount; r++) {
        coins[c][r] = { x: 0, y: 0, status: 1 };
    }
}

// Загрузка изображения монеты
const coinImage = new Image();
coinImage.src = "coin.png";

// Обработчик ошибок загрузки изображения
coinImage.onerror = () => {
    console.error("Ошибка загрузки изображения монеты!");
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(100, 100, coinRadius, 0, Math.PI * 2);
    ctx.fill();
};

// Инициализация Telegram Web App
Telegram.WebApp.ready();
const user = Telegram.WebApp.initDataUnsafe.user;

// Управление с клавиатуры
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

// Управление на мобильных устройствах
let touchStartX = 0;
document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touchX = e.touches[0].clientX;
    const deltaX = touchX - touchStartX;
    if (deltaX > 10) {
        rightPressed = true;
        leftPressed = false;
    } else if (deltaX < -10) {
        leftPressed = true;
        rightPressed = false;
    }
});
document.addEventListener('touchend', () => {
    rightPressed = false;
    leftPressed = false;
});

// Переход из главного меню в игру
startButton.addEventListener('click', () => {
    mainMenu.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    startGame();
});

// Перезапуск игры
restartButton.addEventListener('click', restartGame);

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

function collisionDetection() {
    for (let c = 0; c < coinColumnCount; c++) {
        for (let r = 0; r < coinRowCount; r++) {
            const coin = coins[c][r];
            if (coin.status === 1) {
                const coinX = coin.x + coinRadius;
                const coinY = coin.y + coinRadius;
                const distance = Math.sqrt((ballX - coinX) ** 2 + (ballY - coinY) ** 2);
                if (distance < ballRadius + coinRadius) {
                    ballDY = -ballDY;
                    coin.status = 0;
                    balance += 0.5;
                    balanceElement.textContent = `Баланс: ${balance.toFixed(2)} руб`;
                }
            }
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4757';
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight - 20, paddleWidth, paddleHeight);
    ctx.fillStyle = '#0095dd';
    ctx.fill();
    ctx.closePath();
}

function drawCoins() {
    for (let c = 0; c < coinColumnCount; c++) {
        for (let r = 0; r < coinRowCount; r++) {
            if (coins[c][r].status === 1) {
                const coinX = c * (coinRadius * 2 + coinPadding) + coinOffsetLeft;
                const coinY = r * (coinRadius * 2 + coinPadding) + coinOffsetTop;
                coins[c][r].x = coinX;
                coins[c][r].y = coinY;
                if (coinImage.complete && coinImage.naturalWidth !== 0) {
                    ctx.drawImage(coinImage, coinX, coinY, coinRadius * 2, coinRadius * 2);
                } else {
                    ctx.fillStyle = 'red';
                    ctx.beginPath();
                    ctx.arc(coinX + coinRadius, coinY + coinRadius, coinRadius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
}

function draw() {
    if (gameOver) {
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCoins();
    drawBall();
    drawPaddle();
    collisionDetection();

    if (ballX + ballDX > canvas.width - ballRadius || ballX + ballDX < ballRadius) {
        ballDX = -ballDX;
    }
    if (ballY + ballDY < ballRadius) {
        ballDY = -ballDY;
    } else if (ballY + ballDY > canvas.height - ballRadius) {
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
            ballDY = -ballDY;
        } else {
            gameOver = true;
            gameOverElement.style.display = 'block';
        }
    }

    ballX += ballDX;
    ballY += ballDY;

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += paddleSpeed;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= paddleSpeed;
    }

    requestAnimationFrame(draw);
}

function startGame() {
    gameOver = false;
    gameOverElement.style.display = 'none';
    ballX = canvas.width / 2;
    ballY = canvas.height - 50;
    ballDX = 3;
    ballDY = -3;
    paddleX = (canvas.width - paddleWidth) / 2;
    balance = 0;
    balanceElement.textContent = `Баланс: ${balance.toFixed(2)} руб`;
    for (let c = 0; c < coinColumnCount; c++) {
        for (let r = 0; r < coinRowCount; r++) {
            coins[c][r].status = 1;
        }
    }
    draw();
}

function restartGame() {
    gameOver = false;
    gameOverElement.style.display = 'none';
    ballX = canvas.width / 2;
    ballY = canvas.height - 50;
    ballDX = 3;
    ballDY = -3;
    paddleX = (canvas.width - paddleWidth) / 2;
    balance = 0;
    balanceElement.textContent = `Баланс: ${balance.toFixed(2)} руб`;
    for (let c = 0; c < coinColumnCount; c++) {
        for (let r = 0; r < coinRowCount; r++) {
            coins[c][r].status = 1;
        }
    }
    draw();
}

// Имитация загрузки
setTimeout(() => {
    loadingScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');
}, 2000);