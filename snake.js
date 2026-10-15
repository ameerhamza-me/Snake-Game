
let inputDir = {x: 0, y: 0};
let gameStarted = false;

const foodSound = new Audio("food.mp3");
const gameOverSound = new Audio("gameover.mp3");
const moveSound = new Audio("move.mp3");
const musicSound = new Audio("music.mp3");

let speed = 10;
let score = 0;
let lastPaintTime = 0;
let snakeArr = [{x: 13, y: 15}];
let food = {x: 6, y: 7};

const board = document.getElementById("board");
const scoreBox = document.getElementById("scoreBox");
const hiscoreBox = document.getElementById("hiscoreBox");
const gameOverBox = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");

let hiscore = localStorage.getItem("hiscore");
let hiscoreval = 0;

if(hiscore !== null){
    try{
        hiscoreval = JSON.parse(hiscore);

        if(typeof hiscoreval !== "number"){
            hiscoreval = 0;
        }
    }catch(error){
        hiscoreval = 0;
        localStorage.setItem("hiscore", JSON.stringify(hiscoreval));
    }
}else{
    localStorage.setItem("hiscore", JSON.stringify(hiscoreval));
}

hiscoreBox.innerHTML = "HiScore: " + hiscoreval;
scoreBox.innerHTML = "Score: " + score;

let directionChanged = false;

function playSound(sound){
    sound.currentTime = 0;
    sound.play().catch(() => {});
}

function changeDirection(newDir){
    if(gameOverBox.style.display === "block"){
        return;
    }

    if(directionChanged){
        return;
    }

    if(inputDir.x !== 0 && newDir.x === -inputDir.x){
        return;
    }

    if(inputDir.y !== 0 && newDir.y === -inputDir.y){
        return;
    }

    inputDir = newDir;
    directionChanged = true;
    gameStarted = true;

    playSound(moveSound);

    if(musicSound.paused){
        musicSound.currentTime = 0;
        musicSound.play().catch(() => {});
    }
}

function main(ctime){
    window.requestAnimationFrame(main);

    if(!gameStarted){
        return;
    }

    if((ctime - lastPaintTime) / 1000 < 1 / speed){
        return;
    }

    lastPaintTime = ctime;
    gameEngine();
    directionChanged = false;
}

function isCollide(snake){
    for(let i = 1; i < snake.length; i++){
        if(snake[i].x === snake[0].x && snake[i].y === snake[0].y){
            return true;
        }
    }

    if(snake[0].x >= 18 || snake[0].x <= 0 || snake[0].y >= 18 || snake[0].y <= 0){
        return true;
    }

    return false;
}

function gameEngine(){
    if(isCollide(snakeArr)){
        playSound(gameOverSound);
        musicSound.pause();

        gameStarted = false;
        inputDir = {x: 0, y: 0};

        finalScore.innerHTML = "Score: " + score;
        gameOverBox.style.display = "block";

        return;
    }

    if(snakeArr[0].y === food.y && snakeArr[0].x === food.x){
        playSound(foodSound);

        score += 1;

        if(score > hiscoreval){
            hiscoreval = score;
            localStorage.setItem("hiscore", JSON.stringify(hiscoreval));
            hiscoreBox.innerHTML = "HiScore: " + hiscoreval;
        }

        scoreBox.innerHTML = "Score: " + score;

        snakeArr.unshift({
            x: snakeArr[0].x + inputDir.x,
            y: snakeArr[0].y + inputDir.y
        });

        let a = 2;
        let b = 16;

        food = {
            x: Math.round(a + (b - a) * Math.random()),
            y: Math.round(a + (b - a) * Math.random())
        };
    }

    for(let i = snakeArr.length - 2; i >= 0; i--){
        snakeArr[i + 1] = {...snakeArr[i]};
    }

    snakeArr[0].x += inputDir.x;
    snakeArr[0].y += inputDir.y;

    drawGame();
}

function drawGame(){
    board.innerHTML = "";

    snakeArr.forEach((e, index) => {
        let snakeElement = document.createElement("div");

        snakeElement.style.gridRowStart = e.y;
        snakeElement.style.gridColumnStart = e.x;

        if(index === 0){
            snakeElement.classList.add("head");
        }else{
            snakeElement.classList.add("snake");
        }

        board.appendChild(snakeElement);
    });

    let foodElement = document.createElement("div");

    foodElement.style.gridRowStart = food.y;
    foodElement.style.gridColumnStart = food.x;
    foodElement.classList.add("food");

    board.appendChild(foodElement);
}

function restartGame(){
    snakeArr = [{x: 13, y: 15}];
    food = {x: 6, y: 7};

    score = 0;
    scoreBox.innerHTML = "Score: " + score;

    inputDir = {x: 0, y: 0};
    gameStarted = false;
    directionChanged = false;
    lastPaintTime = 0;

    gameOverBox.style.display = "none";

    musicSound.pause();
    musicSound.currentTime = 0;

    drawGame();
}

drawGame();

window.requestAnimationFrame(main);

window.addEventListener("keydown", e => {
    let newDir = {x: 0, y: 0};

    switch(e.key){
        case "ArrowUp":
            newDir = {x: 0, y: -1};
            break;

        case "ArrowDown":
            newDir = {x: 0, y: 1};
            break;

        case "ArrowLeft":
            newDir = {x: -1, y: 0};
            break;

        case "ArrowRight":
            newDir = {x: 1, y: 0};
            break;

        default:
            return;
    }

    e.preventDefault();
    changeDirection(newDir);
});

let touchStartX = 0;
let touchStartY = 0;
let touchLastX = 0;
let touchLastY = 0;

const minimumSwipe = 12;

board.addEventListener("touchstart", e => {
    const touch = e.touches[0];

    touchStartX = touch.clientX;
    touchStartY = touch.clientY;

    touchLastX = touch.clientX;
    touchLastY = touch.clientY;
}, {passive: true});

board.addEventListener("touchmove", e => {
    e.preventDefault();

    const touch = e.touches[0];

    const diffX = touch.clientX - touchLastX;
    const diffY = touch.clientY - touchLastY;

    if(Math.abs(diffX) < minimumSwipe &&
       Math.abs(diffY) < minimumSwipe){
        return;
    }

    if(Math.abs(diffX) > Math.abs(diffY)){
        if(diffX > 0){
            changeDirection({x: 1, y: 0});
        }else{
            changeDirection({x: -1, y: 0});
        }
    }else{
        if(diffY > 0){
            changeDirection({x: 0, y: 1});
        }else{
            changeDirection({x: 0, y: -1});
        }
    }

    touchLastX = touch.clientX;
    touchLastY = touch.clientY;

}, {passive: false});

board.addEventListener("touchend", () => {
    touchStartX = 0;
    touchStartY = 0;
    touchLastX = 0;
    touchLastY = 0;
});
