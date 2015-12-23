// vzr2 (music vizualization experiment / p5js toy)
// @schuyberg 12.2015


// setup vars
var p1,p2,p3, motionPoints;
var currentTri, triCount = 0, triangles = [];
var noMotion;

// get size of window vars
function getWindowProps(){
  var w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName('body')[0],
      x = w.innerWidth || e.clientWidth || g.clientWidth,
      y = w.innerHeight|| e.clientHeight|| g.clientHeight;
      return {x:x, y:y};
}

window.onresize = function(){
  setup();
  loop();
  looping = true;
};

var soundIn = new p5.AudioIn();
var fft = new p5.FFT();

// color profiles

// setup

function setup() {
  var wSize = getWindowProps();
  // create canvas
  createCanvas(wSize.x, wSize.y);
  blender(0);
  // background('transparent');
  background(0);

  // audio in 
  soundIn.start();
  fft.setInput(soundIn);
  fft.smooth(0.4); 
  noMotion = createVector(0,0); 
  p1 = p1 || new MotionPoint(createVector(width/2, height/2 + 30), createVector(0.5,0.5));
  p2 = p2 || new MotionPoint(createVector(width/2 - 30, height/2 - 30), noMotion);
  p3 = p3 || new MotionPoint(createVector(width/2 + 30, height/2 - 30), noMotion);

  motionPoints = [p1, p2, p3]
  
  t1 = new Tri(motionPoints);
}

// animation loop
function draw() {
  // colors
    // background('transparent')
  fill(255,100,40,2);
  stroke(10,20,30);  

  //audio in
  fft.analyze();
  // freqUpdate('bass', 230, blender);
  // freqUpdate('treble', 100, changeDir, motion1);
  // freqUpdate('highMid', 140, blender);

  // animate
  t1.increment();
}

// motion points (takes vectors as arguments)
function MotionPoint(point, motion, acceleration){
  this.point = point;
  this.motion = motion;
  this.acceleration = acceleration;
}

// add motion to point (without passing outside of canvas)
// takes simple vector as input
function addMotion(point, motion, acceleration){
  var acc = acceleration || 1;
  var m = motion;
  var pt = point.add(motion);
   if(pt.x > width || pt.x < 0 || pt.y > height || pt.y < 0){
    m = m.rotate(180);
   }
   return pt.add(m).mult(acc);
}

// shapes
// base triangle
function Tri(motionPoints){
  this.mPts = motionPoints;
}

Tri.prototype.increment = function(){
  var p = [];
  for (var i = 0, l = this.mPts.length; i < l; i++){
    var location = addMotion(this.mPts[i].point, this.mPts[i].motion, this.mPts[i].acceleration);
    p.push(location)
  }
  triangle(p[0].x, p[0].y, p[1].x, p[1].y, p[2].x, p[2].y);
};

Tri.prototype.changeMotion = function(newMotion){
  var notMoving = staticPoints(this.mPts);
  for (var i = 0, l = this.mPts.length; i < l; i++){
    this.mPts[i].motion = noMotion;
  }
  this.mPts[Math.floor(random(0,notMoving.length))].motion = newMotion;
}

// utility functions
// which points aren't moving (takes array of MotionPoints, returns keys)
function staticPoints(input){
  var notMoving = [];
  for (var i = 0, l = input.length; i < l; i++){
    if (input[i].motion.equals(noMotion)) {
      notMoving.push[i];
    }
  }
  console.log(notMoving);
  return notMoving;
}





function FromMid(startPoints, motion){
  this.points = startPoints;
  this.motionPoint = this.motionPoint || whichPoint();

  var otherPts = [0,1,2];
  otherPts.splice(this.motionPoint, 1);
  var sum = this.points[otherPts[0]].add(this.points[otherPts[1]]);
  this.points[this.motionPoint] = sum.div(2);

  console.log(this.motionPoint, this.points)


  this.increment = function(motion){
      // var p = this.points;
      function newPoint(point, motion){
        var m = motion;
        var pt = point.add(motion);
         if(pt.x > width || pt.x < 0 || pt.y > height || pt.y < 0){
          m = m.rotate(180);
         }
         return pt.add(m);
      }
      // console.log(this.motionPoint);
      this.points[this.motionPoint]  = newPoint(this.points[this.motionPoint], motion);
      triangle(this.points[0].x, this.points[0].y, this.points[1].x, this.points[1].y, this.points[2].x, this.points[2].y);
  };
}

var centerlocked = false;


// change direction (new Tri)
function changeDir(motion){
  // var newDir = getDir();
  motion1.rotate(random(0,360)); 
  motion1.x = random(-1,1);
  motion1.y = random(-1,1);
  // function getDir(){
  //     var p = Math.floor(random(0,3));
  //     if(p === currentTri.motionPoint){
  //         return getDir();
  //     } else {
  //         return p;
  //     }
  // }
  var t2 = new FromMid(currentTri.points, motion1);
  currentTri = t2;
}



// blending
var currentBlend = 0;
function blender(input){
  // console.log(currentBlend, input);
  var modes = [
        // function(){blendMode(BLEND)},
        function(){blendMode(OVERLAY)}, 
        function(){blendMode(DIFFERENCE)}, 
        // function(){blendMode(ADD)}, 
        function(){blendMode(EXCLUSION)}, 
        function(){blendMode(DODGE)}
      ];
  if(!input){
      currentBlend++;
      if (currentBlend > modes.length-1){
        currentBlend = 0;
      }

    modes[currentBlend]();

  } else {

    currentBlend = input;
    modes[currentBlend]();

  }
}


// audio processing
function freqUpdate(frequency, threshhold, callback, args){
  var energy = fft.getEnergy(frequency);
  // console.log(frequency, energy)
  if( energy > threshhold ){
    callback(args);
  }
}


// user controls
// mouse
function mouseClicked(){
    var newMotion = p5.Vector.random2D();
    t1.changeMotion(newMotion);
}

var looping = true;
function keyTyped() {
    console.log(key);
    // loop ctrl
    if (key == ' '){
        if (looping) {
            noLoop();
            looping = false;
        } else {
            loop();
            looping = true;
        }
    }
    // blend ctrl
    if (key == '1') {
      blender();
    }
    if (key == '2') {
      
    }
    if (key == '3') {
      
    }
    if (key == '4') {
      
    }
}


