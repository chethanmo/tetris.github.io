const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.beginPath();
context.scale(20, 20);
context.fill();

/* Need to put game start/pause - done*/
/* Need to put High score */ 

function draw() {   
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0}); 
    drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset){
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];;
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        });
    });
}

function playerDrop(){
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(direction){
    player.pos.x += direction;
    if (collide(arena, player)){
        player.pos.x -= direction;
    }
}

function rotate(matrix, direction){
    for (let y = 0; y < matrix.length; ++y){
        for (let x =0; x < y; ++x){
            [matrix[x][y],
             matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }
    if (direction > 0){
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerRotate(direction){
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, direction);
    while(collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1: -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -direction);
            player.pos.x = pos;
            return;
        }
    }
}

function createPiece(type) {
    if (type == 'T') {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
    } else if (type == 'O') {
        return [
            [2, 2],
            [2, 2],
        ]; 
    } else if (type == 'L') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ]; 
    } else if (type == 'J') {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ]; 
    } else if (type == 'I') {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ]; 
    } else if (type == 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ]; 
    } else if (type == 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ]; 
    } 
}

function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.highScore = (player.highScore > player.score ? player.highScore : player.score);
        player.score = 0;
        updateHighScore()
        updateScore();
    }
}

function updateScore(){
    document.getElementById('score').innerText = "SCORE: " + player.score;
}
function updateHighScore(){
    document.getElementById('highscore').innerText = "HIGHSCORE: " + player.highScore;
}

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

let lastime = 0;
let dropCounter = 0;
let dropInterval = 1000;
var play = true;

function togglePlay(status){
    play = status;
}

function update(time = 0){
    const deltatime = time - lastime;
    if(play){
        dropCounter+= deltatime;
        if(dropCounter > dropInterval){
            playerDrop();
        }
        lastime = time;
    }    
    draw();
    requestAnimationFrame(update);
}

function createMatrix(w,h){
    const matrix = []
    while(h--){
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function merge(arena, player){
    player.matrix.forEach((row,y) => {
        row.forEach((value,x) => {
            if (value !== 0){
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function collide(arena, player){
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y< m.length; ++y){
        for (let x = 0; x < m[y].length; ++x){
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                 arena[y + o.y][x + o.x]) !== 0){
                     return true;
                 }
        }
    }
    return false;
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

document.addEventListener('keydown', event =>{
    if(event.keyCode =="37"){
        playerMove(-1);
    } else if(event.keyCode =="39") {
        playerMove(1);
    } else if(event.keyCode =="40") {
        playerDrop();
    } else if(event.keyCode =="81") {
        playerRotate(-1);
    } else if(event.keyCode =="87") {
        playerRotate(1);
    }
});

const arena = createMatrix(12,20);
const player = {
    pos: {x:5 , y:0},
    matrix: null,
    score: 0,
    highScore: 0,
};


playerReset();
updateHighScore();
updateScore();
update();