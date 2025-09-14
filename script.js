// script.js

const canvas = document.getElementById("nebulaCanvas");
const ctx = canvas.getContext("2d");

let particlesArray = [];
const numberOfParticles = 500;
const centralBiasFactor = 0.5;

// Nebula color palette
const colors = [
  "#FFFFFF",
  "#E0EFFF",
  "#C0DFFF",
  "#A0CFFF",
  "#80BFFF",
  "#60AFFF",
  "#409FFF",
  "#70DFFF",
  "#A0EFFF",
  "#D0D0FF",
];

// MODIFIED: Mouse tracking object and state variables
const mouse = {
  x: null,
  y: null,
};
let mouseMoveTimer;
let isMouseMoving = false;

// MODIFIED: Event listener to detect mouse movement and set state
window.addEventListener("mousemove", (event) => {
  isMouseMoving = true;
  mouse.x = event.x;
  mouse.y = event.y;

  // Clear the previous timer
  clearTimeout(mouseMoveTimer);
  // Set a new timer. If it fires, the mouse has stopped.
  mouseMoveTimer = setTimeout(() => {
    isMouseMoving = false;
  }, 150); // 150ms delay before considering the mouse "stopped"
});

// MODIFIED: Event listener for when the mouse leaves the window
window.addEventListener("mouseout", () => {
  mouse.x = null;
  mouse.y = null;
  isMouseMoving = false;
});

// Set canvas size
function setCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
setCanvasSize();

// Handle window resize
window.addEventListener("resize", () => {
  setCanvasSize();
  init();
});

// Utility function for random numbers
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

// Particle Class
class Particle {
  constructor(x, y, vx, vy, radius, color, opacity) {
    this.x = x;
    this.y = y;
    this.originX = canvas.width / 2;
    this.originY = canvas.height / 2;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.baseColor = color;
    this.opacity = opacity;
    this.fadeSpeed = randomRange(0.002, 0.008);
  }

  // MODIFIED: The update method now checks if the mouse is moving
  update() {
    this.originX = canvas.width / 2;
    this.originY = canvas.height / 2;

    if (mouse.x !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 20) {
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const forceStrength = 0.1;

        if (isMouseMoving) {
          // PULL: Accelerate towards the moving mouse
          this.vx += forceDirectionX * forceStrength;
          this.vy += forceDirectionY * forceStrength;
        } else {
          // PUSH: Accelerate away from the stationary mouse
          const repulsionStrength = 0.05; // Make the push a bit gentler
          this.vx -= forceDirectionX * repulsionStrength;
          this.vy -= forceDirectionY * repulsionStrength;
        }
      }
    }

    // Apply friction/damping
    const friction = 0.97;
    this.vx *= friction;
    this.vy *= friction;

    // Update particle position
    this.x += this.vx;
    this.y += this.vy;

    // Gradually fade out
    if (this.opacity > 0) {
      this.opacity -= this.fadeSpeed;
      if (this.opacity < 0) this.opacity = 0;
    }

    // Reset particle if needed
    const distanceFromCenter = Math.sqrt(
      Math.pow(this.x - this.originX, 2) + Math.pow(this.y - this.originY, 2)
    );
    if (
      this.opacity <= 0 ||
      distanceFromCenter > Math.max(canvas.width, canvas.height) * 0.9
    ) {
      this.reset();
    }
  }

  draw() {
    let r = parseInt(this.baseColor.slice(1, 3), 16);
    let g = parseInt(this.baseColor.slice(3, 5), 16);
    let b = parseInt(this.baseColor.slice(5, 7), 16);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.opacity})`;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
  }

  reset() {
    const angle = Math.random() * Math.PI * 2;
    const radiusFromCenter =
      Math.random() *
      Math.random() *
      (Math.min(canvas.width, canvas.height) * centralBiasFactor);

    this.originX = canvas.width / 2;
    this.originY = canvas.height / 2;

    this.x = this.originX + Math.cos(angle) * radiusFromCenter;
    this.y = this.originY + Math.sin(angle) * radiusFromCenter;
    this.opacity = randomRange(0.5, 1);
    this.radius = randomRange(0.5, 2.5);
    this.baseColor = colors[Math.floor(Math.random() * colors.length)];

    const speed = randomRange(0.1, 0.5);
    const directionAngle = angle + randomRange(-Math.PI / 8, Math.PI / 8);
    this.vx = Math.cos(directionAngle) * speed;
    this.vy = Math.sin(directionAngle) * speed;
  }
}

// Initialize particles
function init() {
  particlesArray = [];
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  for (let i = 0; i < numberOfParticles; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radiusFromCenter =
      Math.random() *
      Math.random() *
      (Math.min(canvas.width, canvas.height) * centralBiasFactor);

    const x = centerX + Math.cos(angle) * radiusFromCenter;
    const y = centerY + Math.sin(angle) * radiusFromCenter;

    const speed = randomRange(0.1, 0.5);
    const directionAngle = angle + randomRange(-Math.PI / 8, Math.PI / 8);
    const vx = Math.cos(directionAngle) * speed;
    const vy = Math.sin(directionAngle) * speed;

    const radius = randomRange(0.5, 2.5);
    const color = colors[Math.floor(Math.random() * colors.length)];
    const opacity = randomRange(0.5, 1);

    particlesArray.push(new Particle(x, y, vx, vy, radius, color, opacity));
  }
}

// Animation Loop
function animate() {
  ctx.fillStyle = "rgba(0, 0, 5, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particlesArray.length; i++) {
    particlesArray[i].update();
    particlesArray[i].draw();
  }

  requestAnimationFrame(animate);
}

// Start the simulation
init();
animate();
