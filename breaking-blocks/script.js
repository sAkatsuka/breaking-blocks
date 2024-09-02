'use strict';

// キャンバスの設定
let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

// ゲームの初期設定
let ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 3;
let dy = -2;
let currentDx = dx;
let currentDy = dy;
let paddleHeight = 10;
let paddleWidth = canvas.width / 5;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;
let score = 0;
let lives = 5;
let currentStage = 1;
let isBallMoving = false; // ボールが動いているかどうかを示すフラグ

// ブロックの設定
let brickRowCount = 3;
let brickColumnCount = 4;
let brickWidth = (canvas.width - (brickColumnCount + 1) * 10) / brickColumnCount;
let brickHeight = 15;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = 10;

let bricks = [];
initBricks();

// ブロックの初期化
function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

// キーが押された時の処理
function keyDownHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    } else if (e.key == " " && !isBallMoving) { // スペースキーでボールを発射
        isBallMoving = true;
        // 発射角度をランダムに設定
        let randomAngle = (Math.random() * 60 - 30) * (Math.PI / 180); // -30度から30度の範囲でランダムな角度を生成
        let speed = Math.sqrt(dx * dx + dy * dy); // 速度の大きさを一定に保つ
        dx = speed * Math.cos(randomAngle);
        dy = -Math.abs(speed * Math.sin(randomAngle)); // 上方向に発射するためにdyは負の値に
        currentDx = dx; // 次のステージで同じ速度を保つために保存
        currentDy = dy;
    }
}

// キーが離された時の処理
function keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}

// マウスが動いた時の処理
function mouseMoveHandler(e) {
    let relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

// ボールとブロックの衝突処理
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status == 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score += 100;
                    if (score == brickRowCount * brickColumnCount * 100) {
                        if (currentStage < 3) {
                            if (confirm("Stage " + currentStage + " Clear! Next Stage?")) {
                                nextStage();
                            } else {
                                alert("GAME OVER");
                                document.location.reload();
                            }
                        } else {
                            if (confirm("YOU WIN, CONGRATS! Play Again?")) {
                                document.location.reload();
                            } else {
                                alert("GAME OVER");
                                document.location.reload();
                            }
                        }
                    }
                }
            }
        }
    }
}

// ステージを進める処理
function nextStage() {
    currentStage++;
    if (currentStage === 2) {
        lives = 4;
        currentDx *= 1.5;
        currentDy *= 1.5;
        dx = currentDx;
        dy = currentDy;
        brickColumnCount = 5;
        score = 0;
    } else if (currentStage === 3) {
        lives = 4;
        brickRowCount = 4;
        paddleWidth = canvas.width / 8;
        score = 0;
        // スピードはステージ2と同じ
        dx = currentDx;
        dy = currentDy;
    }
    brickWidth = (canvas.width - (brickColumnCount + 1) * brickPadding) / brickColumnCount;
    initBricks();
    resetBall(); // ステージ進行時にボールをリセット
}

// ミスをした際のボールリセット処理
function resetBall() {
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = currentDx;
    dy = currentDy;
    paddleX = (canvas.width - paddleWidth) / 2;
    isBallMoving = false; // ボールを停止させる
}

// ボールの描画処理
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

// パドルの描画処理
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
}

// ブロックの描画処理
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) {
                let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "black";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// スコアの描画処理
function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#2e8b57";
    ctx.fillText("Score: " + score, 8, 20);
}

// ライフの描画処理
function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}

// 全ての描画をまとめる処理
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    if (isBallMoving) {
        // ボールが壁に当たった時の処理
        if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
            dx = -dx;
        }
        if (y + dy < ballRadius) {
            dy = -dy;
        } else if (y + dy > canvas.height - ballRadius) {
            if (x > paddleX && x < paddleX + paddleWidth) {
                dy = -dy;
            } else {
                lives--;
                if (!lives) {
                    alert("GAME OVER");
                    document.location.reload();
                } else {
                    resetBall(); // ボールをリセットする
                }
            }
        }
        x += dx;
        y += dy;
    }

    // パドルの移動処理
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    requestAnimationFrame(draw);
}

draw();
