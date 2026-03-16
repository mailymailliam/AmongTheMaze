var canvas, canvasContext,
    playerX = 352,
    playerY = 20,
    playerW = 17,
    playerH = 17,
    playerSpeedX = 0,
    playerSpeedY = 0,
    mazeBackground = new Image(),
    amongUsRightFrames = [new Image(), new Image()],
    amongUsLeftFrames = [new Image(), new Image()],
    amongUsAnimationFrame = 0,
    amongUsAnimationTick = 0,
    amongUsAnimationSpeed = 8,
    amongUsDirection = 'right',
    mazeCollisionCanvas,
    mazeCollisionContext;

// ROLE SYSTEM
var playerRole = null; // "crewmate" or "impostor"
var gameState = "menu"; // menu, roleReveal, playing
var roleRevealTimer = 0;

var KEY_W = 87,
    KEY_A = 65,
    KEY_S = 83,
    KEY_D = 68,
    KEY_SPACE = 32,

    keyHeld_Down = false,
    keyHeld_Up = false,
    keyHeld_Left = false,
    keyHeld_Right = false;

window.onload = function () {

    canvas = document.getElementById('game');
    canvasContext = canvas.getContext('2d');

    amongUsRightFrames[0].src = 'slike/among2.webp';
    amongUsRightFrames[1].src = 'slike/among2.webp';
    amongUsLeftFrames[0].src = 'slike/among2.webp';
    amongUsLeftFrames[1].src = 'slike/among2.webp';

    mazeCollisionCanvas = document.createElement('canvas');
    mazeCollisionCanvas.width = canvas.width;
    mazeCollisionCanvas.height = canvas.height;
    mazeCollisionContext = mazeCollisionCanvas.getContext('2d');

    mazeBackground.onload = function () {

        mazeCollisionContext.clearRect(0, 0, canvas.width, canvas.height);
        mazeCollisionContext.drawImage(mazeBackground, 0, 0, canvas.width, canvas.height);

        var framesPerSecond = 60;

        setInterval(function () {
            playerMove();
            drawAll();
        }, 1000 / framesPerSecond);
    };

    mazeBackground.src = 'slike/maze67.svg';

    document.addEventListener('keydown', keyPressed);
    document.addEventListener('keyup', keyReleased);
};

function chooseRole() {

    if (Math.random() < 0.5) {
        playerRole = "crewmate";
    } else {
        playerRole = "impostor";
    }

    gameState = "roleReveal";
    roleRevealTimer = 180; // 3 seconds
}

function keyPressed(evt) {

    if (evt.keyCode == KEY_SPACE && gameState === "menu") {
        chooseRole();
    }

    if (evt.keyCode == KEY_A) keyHeld_Left = true;
    if (evt.keyCode == KEY_D) keyHeld_Right = true;
    if (evt.keyCode == KEY_W) keyHeld_Up = true;
    if (evt.keyCode == KEY_S) keyHeld_Down = true;

    evt.preventDefault();
}

function keyReleased(evt) {

    if (evt.keyCode == KEY_A) keyHeld_Left = false;
    if (evt.keyCode == KEY_D) keyHeld_Right = false;
    if (evt.keyCode == KEY_W) keyHeld_Up = false;
    if (evt.keyCode == KEY_S) keyHeld_Down = false;

    evt.preventDefault();
}

function blockedInDirection(nextX, nextY, dirX, dirY) {

    if (dirX > 0) {
        return (
            isWhitePixel(nextX + playerW, nextY + 2) ||
            isWhitePixel(nextX + playerW, nextY + playerH / 2) ||
            isWhitePixel(nextX + playerW, nextY + playerH - 2)
        );
    }

    if (dirX < 0) {
        return (
            isWhitePixel(nextX, nextY + 2) ||
            isWhitePixel(nextX, nextY + playerH / 2) ||
            isWhitePixel(nextX, nextY + playerH - 2)
        );
    }

    if (dirY > 0) {
        return (
            isWhitePixel(nextX + 2, nextY + playerH - 1) ||
            isWhitePixel(nextX + playerW / 2, nextY + playerH - 1) ||
            isWhitePixel(nextX + playerW - 2, nextY + playerH - 1)
        );
    }

    if (dirY < 0) {
        return (
            isWhitePixel(nextX + 2, nextY + 1) ||
            isWhitePixel(nextX + playerW / 2, nextY + 1) ||
            isWhitePixel(nextX + playerW - 2, nextY + 1)
        );
    }

    return false;
}

function playerMove() {

    if (gameState !== "playing") return;

    playerSpeedX = 0;
    playerSpeedY = 0;

    var speed = playerRole === "impostor" ? 6 : 5;

    if (keyHeld_Up) playerSpeedY = -speed;
    if (keyHeld_Down) playerSpeedY = speed;
    if (keyHeld_Left) playerSpeedX = -speed;
    if (keyHeld_Right) playerSpeedX = speed;

    if (keyHeld_Right) {

        amongUsDirection = 'right';
        amongUsAnimationTick++;

        if (amongUsAnimationTick >= amongUsAnimationSpeed) {
            amongUsAnimationTick = 0;
            amongUsAnimationFrame = (amongUsAnimationFrame + 1) % 2;
        }

    } else if (keyHeld_Left) {

        amongUsDirection = 'left';
        amongUsAnimationTick++;

        if (amongUsAnimationTick >= amongUsAnimationSpeed) {
            amongUsAnimationTick = 0;
            amongUsAnimationFrame = (amongUsAnimationFrame + 1) % 2;
        }

    } else {

        amongUsAnimationTick = 0;
        amongUsAnimationFrame = 0;

    }

    var stepCount = Math.max(Math.abs(playerSpeedX), Math.abs(playerSpeedY));
    var stepX = stepCount > 0 ? playerSpeedX / stepCount : 0;
    var stepY = stepCount > 0 ? playerSpeedY / stepCount : 0;

    for (var stepIndex = 0; stepIndex < stepCount; stepIndex++) {

        var nextX = playerX + stepX;

        if (stepX !== 0 && !blockedInDirection(nextX, playerY, stepX, 0)) {
            playerX = nextX;
        }

        var nextY = playerY + stepY;

        if (stepY !== 0 && !blockedInDirection(playerX, nextY, 0, stepY)) {
            playerY = nextY;
        }
    }

    if (playerY < 0) playerY = 0;
    if (playerY > canvas.height - playerH) playerY = canvas.height - playerH;

    if (playerX < 0) playerX = 0;
    if (playerX > canvas.width - playerW) playerX = canvas.width - playerW;
}

function drawAll() {

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "menu") {

        canvasContext.fillStyle = "black";
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);

        canvasContext.fillStyle = "white";
        canvasContext.font = "40px Arial";
        canvasContext.fillText("AMONG US MAZE", 220, 250);
        canvasContext.font = "30px Arial";
        canvasContext.fillText("Press SPACE to Start", 220, 320);

        return;
    }

    if (gameState === "roleReveal") {

        canvasContext.fillStyle = "black";
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);

        canvasContext.font = "60px Arial";

        if (playerRole === "crewmate") {
            canvasContext.fillStyle = "cyan";
            canvasContext.fillText("CREWMATE", 250, 300);
        } else {
            canvasContext.fillStyle = "red";
            canvasContext.fillText("IMPOSTOR", 250, 300);
        }

        roleRevealTimer--;

        if (roleRevealTimer <= 0) {
            gameState = "playing";
        }

        return;
    }

    canvasContext.drawImage(mazeBackground, 0, 0, canvas.width, canvas.height);

    var activeFrames = amongUsDirection === 'left' ? amongUsLeftFrames : amongUsRightFrames;
    var spriteImg = activeFrames[amongUsAnimationFrame];

    if (spriteImg && spriteImg.complete) {

        canvasContext.drawImage(spriteImg, playerX, playerY, playerW, playerH);

    } else {

        colorRect(playerX, playerY, playerW, playerH, 'white');

    }
}

function colorRect(leftX, topY, width, height, drawColor) {

    canvasContext.fillStyle = drawColor;
    canvasContext.fillRect(leftX, topY, width, height);

}

function isWhitePixel(x, y) {

    x = Math.floor(x);
    y = Math.floor(y);

    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
        return true;
    }

    var pixel = mazeCollisionContext.getImageData(x, y, 1, 1).data;

    var r = pixel[0];
    var g = pixel[1];
    var b = pixel[2];

    return r > 180 && g > 180 && b > 180;
}

