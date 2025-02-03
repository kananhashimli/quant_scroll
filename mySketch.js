const N = 1500; // Total number of points
const BASE_R = 200; // Initial radius
let R = BASE_R; // Radius of the circle
let pts = [];
let palette = ["ffffff", "588DFF", "588DFF"];
let noise_scale = 0.01;

let rotation = { x: 0.003, z: 0.003 };  // Rotation speeds, to be controlled as properties
let targetCount = 0;  // Target number of points
let currentCount = 0; // Current number of points
let springSpeed = 0.05; // Low speed for slower spring movement

let targetScale = 200; // Target radius
let currentScale = 0; // Initial smaller radius
let scaleSpeed = 0.02; // Slow scale growth speed

let rotationSpeed = 0.05;  // Rotation speeds
let verticalShift = 0; // Vertical shift

let maxScaleFactor = 5; // Maximum scale factor for zooming with scroll (larger growth)


function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    noFill();

    // Do not add any points initially
    targetCount = 0;
}

function draw() {
    background(transparent);

    handleScroll();

    // Slowly increase the rotation angles
    rotateX(rotation.x);  
    rotateZ(rotation.z + verticalShift);

    // BEST
    rotation.x = 30;  // Increase the rotation speed on the X axis
    rotation.z = 30; // Slow down the rotation speed on the Z axis

    // Random up/down movement
    verticalShift = frameCount * 0.0015; // Vertical shift, slower movement

    // Spring movement effect (currentCount gradually moves towards targetCount)
    currentCount = lerp(currentCount, targetCount, springSpeed);

    // Increase points if currentCount has not reached targetCount
    if (currentCount < N) {
        targetCount = N;
    }

    // Gradually increase the radius (to apply a slow spring-like effect to scaling)
    currentScale = lerp(currentScale, targetScale, scaleSpeed);

    // Add new points before drawing them
    while (pts.length < currentCount) {
        pts.push(new Point());
    }

    // Move and draw the points
    for (let pt of pts) {
        pt.move();
        pt.draw();
    }
}

// Distribution with density at poles and empty space at the center
function sphericalDistribution() {
    let theta = random(TWO_PI);
    let u = random();
    
    // Narrow phi to create less density in the center and more at the poles
    let phi = acos(1 / 2 * u);  // More even distribution
    
    // We can narrow phi a bit more for areas near the poles
    if (abs(cos(phi)) < 0.3) { // Less density in the middle regions
        phi = random(PI * 3, PI * 1); // Decrease density in the middle region
    } else {
        // Expand poles to ensure more density at the top and bottom
        phi = random(PI * 0.8, PI);  // More density at the poles
    }

    let x = sin(phi) * cos(theta);
    let y = sin(phi) * sin(theta);
    let z = cos(phi);
    return createVector(x, y, z).mult(R);
}

class Point {
    constructor() {
        this.p = sphericalDistribution();  // Place a point at the start
        this.c = "#" + random(palette);
        
        // Randomly select a scaleFactor from the specified values
        let scaleOptions = [0.4, 0.5, 1, 2];
        this.scaleFactor = random(scaleOptions);  // Random value between 0.4, 0.5, 1, 2

        // Set an initial direction vector to keep it consistent
        this.direction = createVector(0, random(-1, 1), random(-1, 1)).normalize();
    }

    move() {
        // Keep moving the point in the same direction
        let speed = this.direction.mult(0.6);
        this.p.add(speed).normalize().mult(R);
        
        // Move up/down with the environment
        this.p.y += sin(frameCount * 0.005) * 0.03;  // Up/down movement, slower motion
    }

    draw() {
        push();
        translate(this.p.x, this.p.y, this.p.z);
        fill(this.c);  
        noStroke();
        
        // Control the size of the points by adding the scale factor
        sphere(.6 * (currentScale / R) * this.scaleFactor); // Scale according to the radius
        pop();
    }
}


// Function to enlarge the object using scroll
function handleScroll() {
    let scrollAmount = window.scrollY; // Get the scroll amount
    let scaleFactor = 1 + scrollAmount * 0.02; // The zoom factor based on scrolling, multiplied by 0.02 for slower zooming

    // Constrain the scale factor to avoid exceeding the limit
    scaleFactor = constrain(scaleFactor, 1, maxScaleFactor); // Limit with MaxScaleFactor

    // Calculate and set the new R value
    R = BASE_R * scaleFactor; 
    targetScale = R;
}
