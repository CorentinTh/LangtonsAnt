/**
 * Created by Corentin THOMASSET on 28/02/2017.
 */

var ctx, canvas, moteur, scale = 1, vitesse = 100, cptCoup = 0;

$('#canvas')
    .click(function(e) {
        var posX = (e.pageX-$(this).offset().left) * (1/scale), posY =(e.pageY-$(this).offset().top) * (1/scale);

        var tile = moteur.map.getTile(posX+moteur.map.camera.x,posY+moteur.map.camera.y);

        moteur.map.grid[tile.iY][tile.iX] = tile.type == 1 ? 0 : 1;
        moteur.map.draw();
    })
    .mousemove(function (e) {
        var posX = e.pageX-$(this).offset().left, posY = e.pageY-$(this).offset().top;


    })
    .on('wheel', function(e) {

        var delta = e.originalEvent.deltaY;

        if (delta > 0){
            ctx.scale(1.1,1.1);
            scale *= 1.1;
        }else{
            ctx.scale(0.9,0.9);
            scale *= 0.9;
        }

        moteur.map.render();
        return false; // this line is only added so the whole page won't scroll in the demo
    });

$(document).keypress(function(e) {

    console.log(e.which);
    switch (e.which){
        case 122:
            moteur.map.follow.position.y -= 75;
            break;
        case 115:
            moteur.map.follow.position.y += 75;
            break;
        case 113:
            moteur.map.follow.position.x -= 75;
            break;
        case 100:
            moteur.map.follow.position.x += 75;
            break;
        case 60:
            vitesse -= 10;
            break;
        case 62:
            vitesse += 10;
            break;

    }
});

// Cette fonction est appelé lors du chargement de la page
window.onload = function () {

    // Récupération du canvas
    canvas = document.getElementById('canvas');

    // On vérifie que le canvas à bien été récupéré
    if (!canvas) {
        alert("Erreur : Impossible de récupérer le canvas");
        return;
    }

    // Recupération du context
    ctx = canvas.getContext('2d');

    // On fait en sorte que tout les texts soient centrés par défault
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.lineCap = "square";

    // On vérifie que le context à bien été récupéré
    if (!ctx) {
        alert("Erreur : Impossible de récupérer le context du canvas");
        return;
    }

    // Gere le redimensonnement du canvas en fonction de la taille de l'écran
    (function () {

        var resizeGame = function () {

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", resizeGame);
        resizeGame();
    })();

    moteur = new Moteur();
    moteur.init();
    moteur.render();

    timeout();
};
var coups = $("#coups");
function timeout() {
    setTimeout(function () {
        moteur.render();
        timeout();
        coups.text(++cptCoup);

    }, vitesse);
}


function Moteur(){
    this.map = new Map();
    this.fourmi = new Fourmi();

    this.init = function () {
        this.map.render();
    };
this.a =0;
    this.update = function () {
        var x=0, y=0;
        var tile = this.fourmi.tileOn;


        this.map.grid[this.fourmi.position.y][this.fourmi.position.x] = tile == 1 ? 0 : 1;

        if (tile == 1){
            if (this.fourmi.prePosition.x > this.fourmi.position.x) y = -1;
            if (this.fourmi.prePosition.x < this.fourmi.position.x) y = 1;
            if (this.fourmi.prePosition.y > this.fourmi.position.y) x = 1;
            if (this.fourmi.prePosition.y < this.fourmi.position.y) x = -1;
        }else {
            if (this.fourmi.prePosition.x > this.fourmi.position.x) y = 1;
            if (this.fourmi.prePosition.x < this.fourmi.position.x) y = -1;
            if (this.fourmi.prePosition.y > this.fourmi.position.y) x = -1;
            if (this.fourmi.prePosition.y < this.fourmi.position.y) x = 1;
        }

        this.fourmi.prePosition.x = this.fourmi.position.x;
        this.fourmi.prePosition.y = this.fourmi.position.y;

        this.fourmi.position.x += x;
        this.fourmi.position.y += y;

        this.fourmi.tileOn = this.map.grid[this.fourmi.position.y][this.fourmi.position.x];
        this.map.grid[this.fourmi.position.y][this.fourmi.position.x] = 2;



    };
    this.render = function () {
        this.update();
        this.map.render();
    }
}

function Map(){
    this.grid=null;
    this.H = 100;
    this.W = 100;

    this.setup = function () {

        this.grid = new Array(this.H);

        for (var i = 0; i < this.H; i++) {
            this.grid[i] = new Array(this.W);
        }

        for(var c = 0; c < this.H; ++c){
            for(var r = 0; r < this.W;++r) {

                this.grid[r][c] = 0;
            }
        }
    };

    this.tailleTile = 50;

    this.camera={
        x : 0,
        y : 0
    };

    this.getTile = function (x, y) {
        var newX = Math.floor(x / this.tailleTile),
            newY = Math.floor(y / this.tailleTile);

        return {
            iX: newX,
            iY: newY,
            type: this.grid[newY][newX],
            x: newX * this.tailleTile,
            y: newY * this.tailleTile
        }
    };

    this.follow = new ToFollow();

    this.update = function () {
        var W = canvas.width * (1/scale),
            H = canvas.height * (1/scale);
        
        var maxX = this.grid[0].length * this.tailleTile - W,
            maxY = (this.grid.length-1) * this.tailleTile - H;

        // assume followed sprite should be placed at the center of the screen
        // whenever possible
        this.follow.positionAffichage.x = W / 2;
        this.follow.positionAffichage.y = H / 2;

        // make the camera follow the sprite
        this.camera.x = this.follow.position.x - W/2;
        this.camera.y = this.follow.position.y - H/2;

        // clamp values
        this.camera.x = Math.max(0, Math.min(this.camera.x, maxX));
        this.camera.y = Math.max(0, Math.min(this.camera.y, maxY));

        // in map corners, the sprite cannot be placed in the center of the screen
        // and we have to change its screen coordinates

        // left and right sides
        if (this.follow.position.x < W / 2 ||
            this.follow.position.x > maxX + W / 2) {
            this.follow.positionAffichage.x = this.follow.position.x - this.camera.x;
        }
        // top and bottom sides
        if (this.follow.position.y < H / 2 ||
            this.follow.position.y > maxY + H / 2) {
            this.follow.positionAffichage.y = this.follow.position.y - this.camera.y;
        }
    };

    this.draw = function () {
        var W = canvas.width * (1/scale),
            H = canvas.height * (1/scale);

        var startCol = Math.floor(this.camera.x / this.tailleTile),
            endCol = startCol + (W / this.tailleTile),
            startRow = Math.floor(this.camera.y / this.tailleTile),
            endRow = startRow + (H / this.tailleTile),
            offsetX = -this.camera.x + startCol * this.tailleTile,
            offsetY = -this.camera.y + startRow * this.tailleTile;

        for(var c = startCol; c < endCol; ++c){
            for(var r = startRow; r < endRow;++r){

                var tile = this.grid[r][c],
                    x = (c - startCol) * this.tailleTile + offsetX,
                    y = (r - startRow) * this.tailleTile + offsetY;


                switch (tile){
                    case 0:
                        ctx.beginPath();
                        ctx.fillStyle = "#333140";
                        ctx.strokeStyle = "#181625";
                        ctx.lineWidth = 5;
                        ctx.rect(x,y,this.tailleTile,this.tailleTile);
                        ctx.fill();
                        ctx.stroke();
                        break;
                    case 1:
                        ctx.beginPath();
                        ctx.fillStyle = "#12101e";
                        ctx.strokeStyle = "#181625";
                        ctx.lineWidth = 5;
                        ctx.rect(x,y,this.tailleTile,this.tailleTile);
                        ctx.fill();
                        ctx.stroke();
                        break;
                    case 2:
                        ctx.beginPath();
                        ctx.fillStyle = "#9794de";
                        ctx.rect(x+10,y+10,30,30);
                        ctx.fill();
                        break;
                }
            }
        }
    };

    this.render=function () {
        this.update();
        this.draw();
    };

    this.setup();
}


function ToFollow(){
    this.position={
        x:2500,
        y:2500
    };
    this.positionAffichage={
        x:0,
        y:0
    }
}

function Fourmi(){
    this.position={
        x:50,
        y:50
    };
    this.prePosition={
        x:50,
        y:49
    };
    this.tileOn = 0;
}












