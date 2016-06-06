function init(){
        console.log('start');
        var stage = new createjs.Stage("canvas");
        var img = {
            ship: 'PNG/playerShip2_red.png',    
            fire: {1: 'PNG/Lasers/laserBlue07.png', 2: 'PNG/Lasers/laserBlue06.png', 3: 'PNG/Lasers/laserBlue16.png',
                   ennemie: 'PNG/Lasers/laserRed07.png'},
            rocks: {small: 'PNG/Meteors/meteorBrown_med1.png', 
                    big: 'PNG/Meteors/meteorBrown_big3.png'},
            enemies: {1: 'PNG/Enemies/enemyBlue2.png'},
            bosses: {1: 'PNG/Enemies/enemyBlack5.png'}, 
            bonus: {life: 'PNG/Power-ups/pill_red.png', shoot: 'PNG/Power-ups/bolt_bronze.png', points: 'PNG/Power-ups/star_bronze.png'},
            life: 'PNG/UI/playerLife2_red.png'
        };
        var level = 0;
        //describe game level
        var levels = [
            {type: img.rocks.small, number: 6, boss: img.rocks.big},
            {type: img.enemies[1], number: 5, boss: img.bosses[1]}
        ];
        //to do 
        //escape game
        //help screen and start
        //lower alpha when ennemy hit ?
        var hit = 0;
        var hitBoss = 0;
        var bossArr = [];
        var bossPhase = false;
        var bonusArr = [];
        //var shoot;
        var shootArray = [];
        var ennemiesArray = [];
        var livesArray = [];
        //var ennemies;
        //func addEnnemies
        var score = 0;
        var scoreWrap;
        var loaded = 0;
        var toLoad = 4;

        var fireLevel = 1;
        
        var ship = new Image();
        ship.name = 'ship';
        ship.src = 'img/' + img.ship;
        ship.onload = loadImage;

        var fire = new Image();
        fire.src = 'img/' + img.fire[fireLevel];
        fire.onload = loadImage;

        var smallRock = new Image();
        smallRock.src = 'img/' + img.rocks.small;
        smallRock.onload = loadImage;

        var life = new Image();
        life.src = 'img/' + img.life;
        life.onload = loadImage;

        function loadImage(e){
            loaded++;
            if(loaded == toLoad){
                addShip();
                addEnnemies();
                addLives();
                addScore();
                createjs.Ticker.on("tick", tick);
            }
        }

        //Move ennemies
        window.setInterval(moveEnemies, 2000);
       
        function addShip(){
            ship = new createjs.Bitmap('img/' + img.ship);
            stage.addChild(ship);
            ship.x = 435; //480 - (ship.image.width / 2)
            ship.y = 650; //750 - (ship.image.height) - 10
            stage.update();
        }

        function addEnnemies(){
            for(var i=0; i<levels[level].number; i++){
                var ennemie = new createjs.Bitmap('img/' + levels[level].type);
                ennemie.x = 75 + (i * 150);
                ennemie.y = -100;
                ennemie.life = level+1;
                ennemiesArray.push(ennemie);
                stage.addChild(ennemie);
                createjs.Tween.get(ennemie)
                .to({y: 150}, 1000, createjs.Ease.getPowInOut(1))
                createjs.Ticker.setFPS(60);
                createjs.Ticker.addEventListener("tick", stage);
            }
        }

        function addLives(){
            for(var i=0; i<3; i++){
                var life = new createjs.Bitmap('img/' + img.life);
                life.x = 900;
                life.y = 710 - ( i * 40);
                livesArray.push(life);
                stage.addChild(life);
            }
            stage.update();
        }

        function addScore(){
            scoreWrap = new createjs.Text('0'.repeat(5 - String(score).length) + score, '40px RAVIE', 'white');
            scoreWrap.x = 800;
            stage.addChild(scoreWrap);
            stage.update();
        }

        function addBoss(){
            bossPhase = true;
            var boss = new createjs.Bitmap('img/' + levels[level].boss);
            boss.x = 400;
            boss.y = -5;
            bossArr.push(boss);
            stage.addChild(boss);
            createjs.Tween.get(boss)
            .to({y: 1000}, 15000, createjs.Ease.getPowInOut(1))
            // .call(function(){
            //     if(bossPhase)
            //         gameOver(0);
            // })
            //not sure about this
            createjs.Ticker.setFPS(60);
            createjs.Ticker.addEventListener("tick", stage);
        }

        function tick(event){
            //shoot hit enemies
            for(var i=0; i<ennemiesArray.length; i++) {
                for (var j=0; j<shootArray.length; j++) {
                    var collision = ndgmr.checkPixelCollision(ennemiesArray[i], shootArray[j], 0);
                    if(collision){
                        console.log('hit!!! ' + ennemiesArray[i].life);
                        ennemiesArray[i].life -= fireLevel;
                        if(ennemiesArray[i].life <= 0){
                            if(Math.random() > 0.8){
                                console.log('bonus !!!');
                                var bonusTypeArr = ['life', 'shoot', 'points'];
                                var bonusType = bonusTypeArr[Math.floor(Math.random()*bonusTypeArr.length)];
                                var bonus = new createjs.Bitmap('img/' + img.bonus[bonusType]);
                                bonus.x = ennemiesArray[i].x;
                                bonus.y = ennemiesArray[i].y;
                                bonus.type = bonusType;
                                bonusArr.push(bonus);
                                stage.addChild(bonus);
                                createjs.Tween.get(bonus)
                                .to({y: 800}, ((800 - ennemiesArray[i].y) * (5/4)) + 500, createjs.Ease.getPowInOut(1))
                                createjs.Ticker.setFPS(60);
                                createjs.Ticker.addEventListener("tick", stage);
                            }
                            stage.removeChild(ennemiesArray[i]);
                            ennemiesArray.splice(i, 1);
                            score += 50 * (level + 1); 
                            scoreWrap.text = '0'.repeat(5 - String(score).length) + score;
                        }
                        else{
                            //ennemiesArray[i].alpha = 0.5;
                            //console.log(ennemiesArray[i].life / (level + 1));
                            ennemiesArray[i].alpha = ennemiesArray[i].life / (level + 1); 
                        }
                        stage.removeChild(shootArray[j]);
                        shootArray.splice(j, 1);
                        stage.update();
                        hit++;
                    }
                }
            }
            //enemies hit ship
            for(var i=0; i<ennemiesArray.length; i++){
                var coll = ndgmr.checkPixelCollision(ennemiesArray[i], ship, 0);
                if(coll){
                    console.log('dead :(');
                    stage.removeChild(ennemiesArray[i]);
                    ennemiesArray.splice(i, 1);
                    stage.removeChild(livesArray[livesArray.length-1]);
                    livesArray.splice(livesArray.length - 1, 1);
                    stage.update();
                    if( livesArray.length == 0){
                        console.log('game over !');
                        gameOver(0);
                    }
                }
            }
            //check if all enemies died and if so launch boss
            if(ennemiesArray.length == 0 && !bossPhase){
                bossPhase = true;
                console.log('stage 1 completed');
                addBoss();
            }
            //ship get bonus
            for(var i=0; i<bonusArr.length; i++){
                if( ndgmr.checkPixelCollision(bonusArr[i], ship, 0)){
                    doBonus(bonusArr[i].type);
                    stage.removeChild(bonusArr[i]);
                    bonusArr.splice(i, 1);
                    stage.update();
                }
            }

            if(bossPhase){
                //check if boss hit ship
                if( ndgmr.checkPixelCollision(bossArr[bossArr.length - 1], ship, 0)){
                    console.log('boss killed you :(');
                    gameOver(0);
                }
                //check if shoot hit boss
                for(var i=0; i<shootArray.length; i++){
                    if( ndgmr.checkPixelCollision(bossArr[bossArr.length - 1], shootArray[i], 0)){
                        stage.removeChild(shootArray[i]);
                        shootArray.splice(i, 1);
                        stage.update();
                        hitBoss++;
                        console.log('boss hit ! '+hitBoss);
                        if(hitBoss == (level + 1) * 15){
                            stage.removeChild(bossArr[bossArr.length - 1]);
                            bossArr.splice(bossArr[bossArr.length - 1], 1);
                            stage.update();
                            console.log('boss is dead');
                            bossPhase = false;
                            level++;
                            hitBoss = 0;
                            if(level < 2)
                                addEnnemies();
                            else
                                gameOver(1);
                        }
                    }
                }
            }
        }

        function moveEnemies(){
            console.log('move it');
            for(var i=0; i<ennemiesArray.length; i++){
                var randX = Math.floor(Math.random() * 960) + 1;
                var randY = Math.floor(Math.random() * 750) + 1;
                createjs.Tween.get(ennemiesArray[i])
                .to({y: randY, x:randX}, 2000, createjs.Ease.getPowInOut(1))
                createjs.Ticker.setFPS(60);
                createjs.Ticker.addEventListener("tick", stage);
            }
        }

        function doBonus(type){
            console.log('bonus: '+type);
            if(type == 'life'){
                var life = new createjs.Bitmap('img/' + img.life);
                life.x = 900;
                life.y = 630 + ( (2 - livesArray.length) * 40);
                livesArray.push(life);
                stage.addChild(life);
                stage.update();
            }
            else if(type == 'shoot'){
                if(fireLevel < 3)
                    fireLevel++;
            }
            else if(type == 'points'){
                score += 1000;
                scoreWrap.text = '0'.repeat(5 - String(score).length) + score;
            }
        }

        function gameOver(win){
            var text, scoreBox, msg, replay;
            msg = win ? 'Congratulations !' : 'Game over';
            
            stage.removeAllChildren();
            text = new createjs.Text(msg, '75px RAVIE', 'white');
            text.x = win ? 6 : 225;
            text.y = 250;
            scoreBox = new createjs.Text('0'.repeat(5 - String(score).length) + score +' Points', '75px RAVIE', 'white');
            scoreBox.x = 160;
            scoreBox.y = 360;
            replay = new createjs.Text('Replay', '50px RAVIE', 'white');
            replay.x = 370;
            replay.y = 480;
            stage.addChild(text, replay, scoreBox);
            $('#canvas').click(function(){
                location.reload();
            });
        }

        $(document).keydown(function(e){
            var key = e.keyCode;
            if(key == 38 && ship.y > ship.image.height / 2){
                createjs.Tween.get(ship)
                .to({y: ship.y - 40}, 100, createjs.Ease.getPowInOut(1))
                createjs.Ticker.setFPS(60);
                createjs.Ticker.addEventListener("tick", stage);
                console.log('up');
            }
            else if(key == 39 && ship.x < stage.canvas.width - ship.image.width - 25){
                createjs.Tween.get(ship)
                .to({x: ship.x + 40}, 100, createjs.Ease.getPowInOut(1))
                createjs.Ticker.setFPS(60);
                createjs.Ticker.addEventListener("tick", stage);
                console.log('right');
            }
            else if(key == 40 && ship.y < stage.canvas.height - ship.image.height - 30){
                createjs.Tween.get(ship)
                .to({y: ship.y + 40}, 100, createjs.Ease.getPowInOut(1))
                createjs.Ticker.setFPS(60);
                createjs.Ticker.addEventListener("tick", stage);
                console.log('down ' + ship.y);
            }
            else if(key == 37 && ship.x > 0){
                createjs.Tween.get(ship)
                .to({x: ship.x - 40}, 100, createjs.Ease.getPowInOut(1))
                createjs.Ticker.setFPS(60);
                createjs.Ticker.addEventListener("tick", stage);
                console.log('left');
            }
            else if(key == 32){
                var shoot = new createjs.Bitmap('img/' +img.fire[fireLevel]);
                shoot.x = ship.x + (ship.image.width / 2) - (shoot.image.width / 2);
                shoot.y = ship.y - (ship.image.height / 2);
                shootArray.push(shoot);
                stage.addChild(shoot);
                //adjust speed depending on ship position/
                //science bitch
                var speed = (ship.y + 1000) * (4/3); 
                createjs.Tween.get(shoot)
                .to({y: - 1000}, speed, createjs.Ease.getPowInOut(1))
                createjs.Ticker.setFPS(60);
                createjs.Ticker.addEventListener("tick", stage);
                //createjs.Ticker.on("tick", tick);
                console.log('fire');

            }
        });

    }