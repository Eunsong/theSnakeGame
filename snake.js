;(function() {
  var Game = function() {
    this.bodysize = {x: 15, y: 15 };
    this.micesize = {x: 15, y: 15 };
    this.wallsize = {x: 2, y: 2};
    var screen = document.getElementById("screen").getContext('2d');

    this.size = { x: screen.canvas.width, y: screen.canvas.height };
    this.origin = {x: this.size.x/2, y: this.size.y/2};
    this.center = { x: this.size.x / 2, y: this.size.y / 2 };

    this.bodies = []; // TODO: create initial bodies
    var head = new Head(this);
    this.bodies.push(head);
    for ( var i = 0; i <1; i++){
      this.addTail();  
    }
    this.addMice();

    this.walls = [];
    var xposition = this.wallsize.x/2;
    var yposition = this.wallsize.y/2;
    for ( var i = 0; xposition < screen.canvas.width; i++ ){
      var wall = new Wall(this, {x: xposition, y: yposition });
      this.walls.push(wall);
      wall = new Wall(this, {x: xposition, y: screen.canvas.height 
                          - this.wallsize.y});
      this.walls.push(wall);
      xposition += this.wallsize.x;
    }
    xposition = this.wallsize.x/2;
    for ( var i = 0; yposition < screen.canvas.height; i++ ){
      var wall = new Wall(this, {x: xposition, y: yposition });
      this.walls.push(wall);
      wall = new Wall(this, {x: screen.canvas.width - this.wallsize.x, 
                      y: yposition });
      this.walls.push(wall);
      yposition += this.wallsize.y;
    }
    
    var self = this;
    var cnt = 0;
    var tick = function() {
      cnt = (cnt+1)%2;
      if ( cnt == 1 ){
        self.update();
      }
      self.draw(screen);
      reportOutBox(head, screen);
      requestAnimationFrame(tick);
    };

    tick();
  };

  Game.prototype = {
    update: function() {
      for (var i = 0; i < this.bodies.length; i++) {
        if (this.bodies[i].update !== undefined) {
          this.bodies[i].update();
        }
      }
      reportCollisions(this.bodies);
    },

    draw: function(screen) {
      screen.clearRect(0, 0, this.size.x, this.size.y);
      // draw walls
      for (var i = 0; i < this.walls.length; i++){
        if (this.walls[i].draw !== undefined ){
          this.walls[i].draw(screen);
        }
      }

      for (var i = 0; i < this.bodies.length; i++) {
        if (this.bodies[i].draw !== undefined) {
          this.bodies[i].draw(screen);
        }
      }
    },

    addTail: function(){
      currTail = this.bodies[this.bodies.length-1];
      var newTail = new Tail(this, currTail.center);
      currTail.addTail(newTail);
      this.bodies.push(newTail);
    },

    addMice: function(){
      var positionX = Math.random()*this.size.x;
      var positionY = Math.random()*this.size.y;
      var micePosition = {x: positionX, y: positionY };
      newMice = new Mice(this, micePosition);
      this.bodies.push(newMice);
    },

    addBody: function(body) {
      this.bodies.push(body);
    },

    removeBody: function(body) {
      var bodyIndex = this.bodies.indexOf(body);
      if (bodyIndex !== -1) {
        this.bodies.splice(bodyIndex, 1);
      }
    }
  };

  var Wall = function(game, location) {
    this.game = game
    this.size = game.bodysize
    this.center = location
  }

  Wall.prototype = {
    update: function(){

    },

    draw: function(screen) {
      drawRect(screen, this);
    },

    collision: function(){
      alert("Game Over!");
      throw new Error();
    }
  }


  var Head = function(game) {
    this.game = game;
    this.size = game.bodysize;
    this.tail = this;
    this.center = game.origin;
    this.direction = "NONE"
    this.keyboarder = new Keyboarder();
  };


  Head.prototype = {
    update: function() {
      moveStepX = this.size.x;
      moveStepY = this.size.y;
      if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
        this.direction = "LEFT"
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
        this.direction = "RIGHT"
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.UP)) {
        this.direction = "UP"
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.DOWN)) {
        this.direction = "DOWN"
      }

      if (this.direction == "LEFT") {
        this.tail.moveTo(this.center);
        this.center.x -= moveStepX;
      } else if (this.direction == "RIGHT") {
        this.tail.moveTo(this.center);
        this.center.x += moveStepX;
      } else if (this.direction == "UP") {
        this.tail.moveTo(this.center);
        this.center.y -= moveStepY;
      } else if (this.direction == "DOWN") {
        this.tail.moveTo(this.center);
        this.center.y += moveStepY;
      }
    },

    addTail: function(tail){
      this.tail = tail;
    },

    draw: function(screen) {
      drawRect(screen, this);
    },

    collision: function() {
    },

    outbox: function() {
      alert("Game Over!");
      throw new Error();
    }
  };

  var Tail = function(game, startPosition){
    this.game = game;
    this.size = game.bodysize;
    this.tail = null;
    this.center = {x: startPosition.x, y: startPosition.y};
  };

  Tail.prototype = {
    update: function(){

    },
    moveTo: function(newCenter){
      var oldCenter = {x: this.center.x, y: this.center.y};
      this.center.x = newCenter.x;
      this.center.y = newCenter.y;
      if ( this.tail != null ){
        this.tail.moveTo(oldCenter);  
      }
    },
    addTail: function(tail){
      this.tail = tail;
    },
    draw: function(screen){
      drawRect(screen, this);
    },
    collision: function(){
      alert("Game Over!");
        throw new Error();
    }
  };

  var Mice = function(game, startPosition){
    this.game = game;
    this.center = {x: startPosition.x, y: startPosition.y};
    this.size = game.micesize;

  };

  Mice.prototype = {
    draw: function(screen){
      drawRect(screen, this);
    },
    collision: function(){
      this.game.removeBody(this);
      this.game.addTail();
      this.game.addMice();
    }
  };


  var Keyboarder = function() {
    var keyState = {};

    window.addEventListener('keydown', function(e) {
      keyState[e.keyCode] = true;
    });

    window.addEventListener('keyup', function(e) {
      keyState[e.keyCode] = false;
    });

    this.isDown = function(keyCode) {
      return keyState[keyCode] === true;
    };

    this.KEYS = { LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40, SPACE: 32 };
  };

  var drawRect = function(screen, body) {
      screen.fillRect(body.center.x - body.size.x/2,
                      body.center.y - body.size.y/2,
                      body.size.x,
                      body.size.y);
  };

  var isColliding = function(b1, b2) {
    return !(
      b1 === b2 ||
        b1.center.x + b1.size.x / 2 <= b2.center.x - b2.size.x / 2 ||
        b1.center.y + b1.size.y / 2 <= b2.center.y - b2.size.y / 2 ||
        b1.center.x - b1.size.x / 2 >= b2.center.x + b2.size.x / 2 ||
        b1.center.y - b1.size.y / 2 >= b2.center.y + b2.size.y / 2
    );
  };

  var reportCollisions = function(bodies) {
    var bodyPairs = [];
      for (var j = 1; j < bodies.length; j++) {
        if (isColliding(bodies[0], bodies[j])) {
          if ( !(bodies[j] instanceof Tail) || j != 1 ){
            bodyPairs.push([bodies[0], bodies[j]]);
          }
        }
      }

    for (var i = 0; i < bodyPairs.length; i++) {
      if (bodyPairs[i][0].collision !== undefined) {
        bodyPairs[i][0].collision();
      }

      if (bodyPairs[i][1].collision !== undefined) {
        bodyPairs[i][1].collision();
      }
    }
  };

  var reportOutBox = function(head, screen) {
    if ( head.center.x > screen.canvas.width || head.center.x < 0 
        || head.center.y > screen.canvas.height || head.center.y < 0){
      head.outbox();
    }

  };

  window.addEventListener('load', function() {
    new Game();
  });
})();
