var canvas, canvasContext,
    playerX = 352,
    playerY = 20,
    playerW = 20,
    playerH = 20,
    playerSpeedX = 0,
    playerSpeedY = 0,
    mazeBackground = new Image(),
    mazeCollisionCanvas,
    mazeCollisionContext;
var playerImg = new Image();
var aiImg = new Image();
var playerFrame = 0;
var playerDirection = "right";
var playerAnimationCounter = 0;
var aiFrame = 0;
var aiDirection = "right";
var aiAnimationCounter = 0;

function updatePlayerImage() {
    var prefix = playerRole === "impostor" ? "Red" : "Blue";
    var dir = playerDirection === "right" ? "l" : "";
    playerImg.src = "sl/" + prefix + "/" + prefix.toLowerCase() + dir + (playerFrame + 1) + ".png";
}

function updateAiImage() {
    var prefix = playerRole === "impostor" ? "Blue" : "Red";
    var dir = aiDirection === "right" ? "l" : "";
    aiImg.src = "sl/" + prefix + "/" + prefix.toLowerCase() + dir + (aiFrame + 1) + ".png";
}
var aiX = 387;
var aiY = 2;
var aiTargetIndex = 0;
var aiDelay = 0;
var respawnDelay = 0;
var playerRole = null;
var gameState = "menu";
var roleRevealTimer = 0;
var gameOver = false;
var gameWin = false;

const revealRoleMusic = new Audio('sounds/role.mp3');
const lobbyMusic = new Audio('sounds/lobby.mp3');
const killSound= new Audio('sounds/kill1.m4a');
var KEY_W = 87,
    KEY_A = 65,
    KEY_S = 83,
    KEY_D = 68,
    KEY_SPACE = 32;
var keyHeld_Down = false,
    keyHeld_Up = false,
    keyHeld_Left = false,
    keyHeld_Right = false;
var aiPath = [
{x:387,y:2},{x:387,y:42},{x:440,y:42},{x:440,y:68},{x:466,y:68},{x:466,y:95},
{x:413,y:95},{x:413,y:68},{x:360,y:68},{x:360,y:95},{x:334,y:95},{x:334,y:16},
{x:307,y:16},{x:307,y:42},{x:281,y:42},{x:281,y:16},{x:254,y:16},{x:254,y:95},
{x:175,y:95},{x:175,y:68},{x:202,y:68},{x:202,y:42},{x:175,y:42},{x:175,y:16},
{x:149,y:16},{x:149,y:68},{x:122,y:68},{x:122,y:16},{x:17,y:16},{x:17,y:174},
{x:43,y:174},{x:43,y:42},{x:96,y:42},{x:96,y:121},{x:69,y:121},{x:69,y:201},
{x:17,y:201},{x:17,y:227},{x:43,y:227},{x:43,y:253},{x:17,y:253},{x:17,y:333},
{x:43,y:333},{x:43,y:359},{x:17,y:359},{x:17,y:465},{x:43,y:465},{x:43,y:491},
{x:17,y:491},{x:17,y:517},{x:43,y:517},{x:43,y:571},{x:17,y:571},{x:17,y:623},
{x:43,y:623},{x:43,y:676},{x:69,y:676},{x:69,y:729},{x:96,y:729},{x:96,y:756},
{x:69,y:756},{x:69,y:782},{x:175,y:782},{x:175,y:729},{x:149,y:729},{x:149,y:703},
{x:122,y:703},{x:122,y:676},{x:96,y:676},{x:96,y:650},{x:149,y:650},{x:149,y:623},
{x:228,y:623},{x:228,y:676},{x:360,y:676},{x:360,y:703},{x:413,y:703},
{x:413,y:676},{x:440,y:676},{x:440,y:782},{x:413,y:782},{x:413,y:795}
];

window.onload = function () {
 lobbyMusic.volume = 0.4
    lobbyMusic.play();
    canvas = document.getElementById('game');
    canvasContext = canvas.getContext('2d');

    mazeCollisionCanvas = document.createElement('canvas');
    mazeCollisionCanvas.width = canvas.width;
    mazeCollisionCanvas.height = canvas.height;
    mazeCollisionContext = mazeCollisionCanvas.getContext('2d');

    mazeBackground.onload = function () {
        mazeCollisionContext.drawImage(mazeBackground, 0, 0, canvas.width, canvas.height);
        
        setInterval(function () {
            playerMove();
            moveAI();
            checkCatch();
            drawAll();
        }, 1000 / 60);
    };

    mazeBackground.src = 'slike/maze67.svg';

    document.addEventListener('keydown', keyPressed);
    document.addEventListener('keyup', keyReleased);
};

function chooseRole() {

    playerRole = Math.random() < 0.5 ? "crewmate" : "impostor";

    updatePlayerImage();
    updateAiImage();
    aiDelay = playerRole === "crewmate" ? 300 : 0;

    revealRoleMusic.play();
    gameState = "roleReveal";
    roleRevealTimer = 180;
}
function keyPressed(evt) {
    if (evt.keyCode == KEY_SPACE && gameState === "menu") chooseRole();

    if (evt.keyCode == KEY_A) keyHeld_Left = true;
    if (evt.keyCode == KEY_D) keyHeld_Right = true;
    if (evt.keyCode == KEY_W) keyHeld_Up = true;
    if (evt.keyCode == KEY_S) keyHeld_Down = true;
}

function keyReleased(evt) {
    if (evt.keyCode == KEY_A) keyHeld_Left = false;
    if (evt.keyCode == KEY_D) keyHeld_Right = false;
    if (evt.keyCode == KEY_W) keyHeld_Up = false;
    if (evt.keyCode == KEY_S) keyHeld_Down = false;
}
function isWhitePixel(x, y) {

    x = Math.floor(x);
    y = Math.floor(y);

    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
        return true;
    }

    var pixel = mazeCollisionContext.getImageData(x, y, 1, 1).data;

    return pixel[0] > 180 && pixel[1] > 180 && pixel[2] > 180;
}

function blockedInDirection(nextX, nextY, dirX, dirY) {

    if (dirX > 0) {
        return isWhitePixel(nextX + playerW, nextY) || isWhitePixel(nextX + playerW, nextY + playerH);
    }
    if (dirX < 0) {
        return isWhitePixel(nextX, nextY) || isWhitePixel(nextX, nextY + playerH);
    }
    if (dirY > 0) {
        return isWhitePixel(nextX, nextY + playerH) || isWhitePixel(nextX + playerW, nextY + playerH);
    }
    if (dirY < 0) {
        return isWhitePixel(nextX, nextY) || isWhitePixel(nextX + playerW, nextY);
    }

    return false;
}

function playerMove() {

    if (gameState !== "playing") return;

    playerSpeedX = 0;
    playerSpeedY = 0;

    var speed = playerRole === "impostor" ? 3 : 2;

    if (keyHeld_Up) playerSpeedY = -speed;
    if (keyHeld_Down) playerSpeedY = speed;
    if (keyHeld_Left) playerSpeedX = -speed;
    if (keyHeld_Right) playerSpeedX = speed;

    if (playerSpeedX > 0) playerDirection = "right";
    else if (playerSpeedX < 0) playerDirection = "left";
    if (playerSpeedX !== 0 || playerSpeedY !== 0) {
        playerAnimationCounter++;
        if (playerAnimationCounter % 10 === 0) {
            playerFrame = (playerFrame + 1) % 3;
            updatePlayerImage();
        }
    }

    var stepCount = Math.max(Math.abs(playerSpeedX), Math.abs(playerSpeedY));
    var stepX = stepCount ? playerSpeedX / stepCount : 0;
    var stepY = stepCount ? playerSpeedY / stepCount : 0;

    for (var i = 0; i < stepCount; i++) {

        var nextX = playerX + stepX;
        if (!blockedInDirection(nextX, playerY, stepX, 0)) playerX = nextX;

        var nextY = playerY + stepY;
        if (!blockedInDirection(playerX, nextY, 0, stepY)) playerY = nextY;
    }

    if (playerRole === "crewmate") {
        var end = aiPath[aiPath.length - 1];
        if (Math.abs(playerX - end.x) < 20 && Math.abs(playerY - end.y) < 20) {
            gameWin = true;
            gameState = "win";
            setTimeout(() => {
                location.reload();
            }, 1500);
        }
    }
}

function moveAI() {

    if (gameState !== "playing") return;

    if (respawnDelay > 0) {
        respawnDelay--;
        if (respawnDelay === 0) {
            aiX = aiPath[0].x;
            aiY = aiPath[0].y;
            aiDelay = 0;
        }
        return;
    }

    if (aiDelay > 0) {
        aiDelay--;
        return;
    }

    if (aiTargetIndex >= aiPath.length) return;

    var target = aiPath[aiTargetIndex];
    var dx = target.x - aiX;
    var dy = target.y - aiY;

    if (dx > 0) aiDirection = "right";
    else if (dx < 0) aiDirection = "left";
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
        aiAnimationCounter++;
        if (aiAnimationCounter % 10 === 0) {
            aiFrame = (aiFrame + 1) % 3;
            updateAiImage();
        }
    }

    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
        aiTargetIndex++;
        if (aiTargetIndex >= aiPath.length) {
            if (playerRole === "impostor") {
                gameOver = true;
                gameState = "gameOver";
                setTimeout(() => {
                    location.reload();
                }, 1500);
            } else {
                aiTargetIndex = 0;
                aiX = -100;
                aiY = -100;
                respawnDelay = 300;
            }
            return;
        }
        return;
    }

    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;

    var speed = playerRole === "crewmate" ? 1 : 2.5;

    aiX += (dx / dist) * speed;
    aiY += (dy / dist) * speed;
}

function checkCatch() {

    if ((gameOver || gameWin) || gameState !== "playing") return;

    var dx = playerX - aiX;
    var dy = playerY - aiY;

    if (Math.sqrt(dx * dx + dy * dy) < 15) {
        if (playerRole === "impostor") {
            killSound.play();
            gameWin = true;
            gameState = "win";
        } else {
            killSound.play();
            gameOver = true;
            gameState = "gameOver";
        }

        setTimeout(() => {
            location.reload();
        }, 1500);
    }
}

function drawAll() {

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "menu") {
        canvasContext.fillStyle = "white";
        canvasContext.font = "30px font";
        canvasContext.textAlign = "center";
        canvasContext.textBaseline = "middle";
        canvasContext.fillText("PRESS SPACE", canvas.width / 2, canvas.height / 2);
        return;
    }

    if (gameState === "roleReveal") {
        canvasContext.fillStyle = playerRole === "crewmate" ? "cyan" : "red";
        canvasContext.font = "60px font";
        canvasContext.textAlign = "center";
        canvasContext.textBaseline = "middle";
        canvasContext.fillText(playerRole.toUpperCase(), canvas.width / 2, canvas.height / 2 - 40);
        canvasContext.fillStyle = "white";
        canvasContext.font = "20px font";
        var instruction = playerRole === "impostor" ? "Kill the crewmate!" : "Escape from the impostor!";
        canvasContext.fillText(instruction, canvas.width / 2, canvas.height / 2 + 40);

        roleRevealTimer--;
        if (roleRevealTimer <= 0) gameState = "playing";
        return;
    }

    if (gameState === "gameOver") {
        canvasContext.fillStyle = "red";
        canvasContext.font = "50px font";
        canvasContext.textAlign = "center";
        canvasContext.textBaseline = "middle";
        canvasContext.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        return;
    }

    if (gameState === "win") {
        canvasContext.fillStyle = "green";
        canvasContext.font = "50px font";
        canvasContext.textAlign = "center";
        canvasContext.textBaseline = "middle";
        canvasContext.fillText("YOU WIN!", canvas.width / 2, canvas.height / 2);
        return;
    }

    canvasContext.drawImage(mazeBackground, 0, 0, canvas.width, canvas.height);

    if (playerImg.complete) {
        canvasContext.drawImage(playerImg, playerX, playerY, playerW, playerH);
    }
    if (aiImg.complete) {
        canvasContext.drawImage(aiImg, aiX - 10, aiY - 10, playerW, playerH);
    }
}
