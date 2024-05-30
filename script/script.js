let gameStarted = false;
let spaceshipPositionX;
let spaceshipPositionY;
let spaceshipMass;
let moonMass = 600;
let velocityX = 0;
let velocityY = 0;
let oldWidth = window.innerWidth;
let oldHeight = window.innerHeight;
let acceleration = 3;

let startTime;
let timerInterval;

// utilizza un oggetto per tenere traccia dello stato delle frecce
const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false,
};

function startGame() {
  gameStarted = true;
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
  document.getElementById("Mass").disabled = true;
  document.getElementById("Velocity").disabled = true;
  animate();
  document.getElementById("start-button").style.display = "none";
  startTimer();
}

function handleKeyDown(event) {
  // imposta lo stato della freccia premuta a true
  keys[event.key] = true;
}

function handleKeyUp(event) {
  // imposta lo stato della freccia rilasciata a false
  keys[event.key] = false;
}

// aggiunge e modifica il valore degli sliders
function sliders() {
  var sliderMass = document.getElementById("Mass");
  var outputMass = document.getElementById("MassOut");
  var sliderVelocity = document.getElementById("Velocity");
  var outputVelocity = document.getElementById("VelocityOut");

  outputMass.innerHTML = sliderMass.value; // mostra il valore di default dello slider
  spaceshipMass = sliderMass.value;
  outputVelocity.innerHTML = sliderVelocity.value; // mostra il valore di default dello slider
  acceleration = sliderVelocity.value;

  // aggiorna il valore corrente dello slider (ogni volta che trascini lo slider)
  sliderMass.oninput = function () {
    outputMass.innerHTML = sliderMass.value;
    spaceshipMass = sliderMass.value;
  };

  // aggiorna il valore corrente dello slider (ogni volta che trascini lo slider)
  sliderVelocity.oninput = function () {
    outputVelocity.innerHTML = sliderVelocity.value;
    acceleration = sliderVelocity.value;
  };
}

function startTimer() {
  startTime = new Date().getTime();
  
  timerInterval = setInterval(updateTimer, 1);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateTimer() {
  const currentTime = new Date().getTime(); // fornisce il tempo corrente
  elapsedTime = currentTime - startTime; // tempo trascorso dal click del tasto start

  minutes = Math.floor(elapsedTime / (1000 * 60));
  seconds = Math.floor((elapsedTime / 1000) % 60);
  millisec = (Math.floor(elapsedTime % 1000) / 10).toFixed(0);

  // aggiorna il timer reale
  const timerDisplay = document.getElementById("timerRealTime");
  timerDisplay.textContent = `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s ${millisec < 10 ? '0' : ''}${millisec}ms`;

  elapsedTime *= 60 * 60 * 2; // ogni secondo reale trascorso e' uguale a 2 ore di simulazione
  
  days = Math.floor(elapsedTime / (1000 * 60 * 60 * 24));
  hours = Math.floor(elapsedTime / (1000 * 60 * 60) % 24);
  minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
  seconds = Math.floor((elapsedTime / 1000) % 60);

  // aggiorna il timer del tempo di simulazione
  const timerDisplaySim = document.getElementById("timerSimTime");
  timerDisplaySim.textContent = `${days}d ${hours}h ${minutes < 10 ? '0' : ''}${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
}

// funzione che verra' chiamata ricorsivamente per tutta la durata del gioco
function animate() {
  if (gameStarted) {
    const spaceship = document.getElementById("spaceship");
    const landingZone = document.getElementById("landing-zone");
    const gameArea = document.getElementById("game-area");
    const gameAreaWidth = gameArea.offsetWidth;
    const gameAreaHeight = gameArea.offsetHeight;
    const spaceshipWidth = spaceship.offsetWidth;
    const spaceshipHeight = spaceship.offsetHeight;

    // calcola la velocità in base allo stato delle frecce premute
    velocityX = (keys["ArrowRight"] - keys["ArrowLeft"]) * acceleration;
    velocityY = (keys["ArrowUp"] - keys["ArrowDown"]) * acceleration;

    // calcola la distanza tra la navicella e la Luna cosi che la forza di gravita' possa essere applicata
    let distance = distanceFromBody(spaceshipPositionX, spaceship.getBoundingClientRect().top,  landingZone.offsetLeft, landingZone.getBoundingClientRect().top);
    let attraction = attractionForce(distance);

    // aggiorna la posizione basata sulla velocità
    spaceshipPositionX += velocityX;
    spaceshipPositionY += velocityY - attraction;

    // mantiene la navicella all'interno dell'area di gioco
    spaceshipPositionX = Math.max(0, Math.min(spaceshipPositionX, gameAreaWidth - (spaceshipWidth / 2))); //modificato: diviso spaceshipWidth / 2;
    spaceshipPositionY = Math.max(0, Math.min(spaceshipPositionY, gameAreaHeight - (spaceshipHeight * 1.5))); //modificato: moltiplicato spaceshipHeight * 1.5;

    // aggiorna la posizione della navicella
    spaceship.style.left = spaceshipPositionX + "px";
    spaceship.style.bottom = spaceshipPositionY + "px";

    // verifica se la navicella è atterrata
    if (isCollapsing(spaceship, landingZone)) {
      alert("Congratulazioni! Sei atterrato sulla Luna.");
      resetGame();
    }

    // chiama animate ricorsivamente
    requestAnimationFrame(animate);
  }
}

// verifica l'eventuale collisione tra la navicella e la Luna
function isCollapsing(spaceship, landingZone) {
  let rectSpaceShip = spaceship.getBoundingClientRect();
  let rectlandingZone = landingZone.getBoundingClientRect();

  let spaceShipCurrentPositionX = spaceship.offsetLeft;
  let spaceShipCurrentPositionY = rectSpaceShip.top + rectSpaceShip.height / 2;

  const landingZoneRadius = landingZone.offsetWidth / 2;
  const landingZonePositionX = landingZone.offsetLeft;
  const landingZonePositionY = rectlandingZone.top + rectlandingZone.height / 2;

  let distance = distanceFromBody(
    spaceShipCurrentPositionX,
    spaceShipCurrentPositionY,
    landingZonePositionX,
    landingZonePositionY
  );

  if (distance <= landingZoneRadius + spaceship.offsetWidth / 2) {
    return true;
  } else return false;
}

// aggiorna la posizione della navicella al ridimensionamento della finestra
function resize() {
  spaceshipPositionX = (spaceshipPositionX * window.innerWidth) / oldWidth;
  oldWidth = window.innerWidth;

  spaceshipPositionY = (spaceshipPositionY * window.innerHeight) / oldHeight;
  oldHeight = window.innerHeight;
}

// setta proporzionalmente le coordinate della navicella in alto al centro, in base alla dimensione della finestra
function setSpaceShipPos() {
  spaceshipPositionX = (960 * window.innerWidth) / 1920;
  spaceshipPositionY = (827 * window.innerHeight) / 919;
}

// funzione lambda che viene chiamata al caricamento della pagina con listener per la ridimensione della pagina
window.onload = (event) => {
  setSpaceShipPos();
  sliders();
  window.addEventListener("resize", resize);
};

// calcolo della distanza tra due oggetti su un piano cartesiano con il teorema di Pitagora
function distanceFromBody(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

// aggiunge la forza di gravita'
function attractionForce(distance) {
  return ((1.66 * spaceshipMass * moonMass) / Math.pow(distance, 2));
}

// resetta tutti i tasti allo stato di default
function resetKeys() {
  keys["ArrowRight"] = false;
  keys["ArrowLeft"] = false;
  keys["ArrowUp"] = false;
  keys["ArrowDown"] = false;
}

// resetta tutto ai valori iniziali
function resetGame() {
  gameStarted = false;
  stopTimer();
  resetKeys();
  setSpaceShipPos();
  document.getElementById("Mass").disabled = false;
  document.getElementById("Velocity").disabled = false;
  document.getElementById("spaceship").style.left = "50%"; // reimposta la posizione della navicella
  document.getElementById("spaceship").style.bottom = "90%"; 
  document.getElementById("start-button").style.display = "block"; // reimposta il pulsante start
  document.getElementById("timerRealTime").textContent = "00m 00s 00ms"; // reimposta il display del timer
  document.getElementById("timerSimTime").textContent = "0d 00h 00m 00s";
}
