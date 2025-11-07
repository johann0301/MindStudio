document.addEventListener("DOMContentLoaded", () => {
  const gameArea = document.getElementById("gameArea");
  const startBtn = document.getElementById("startBtn");
  const scoreEl = document.getElementById("score");
  const timeEl = document.getElementById("time");
  const accuracyEl = document.getElementById("accuracy");
  const difficultyEl = document.getElementById("difficulty");
  const hitSound = document.getElementById("hitSound");
  const missSound = document.getElementById("missSound");

  // Modal
  const modal = document.getElementById("endModal");
  const finalScore = document.getElementById("finalScore");
  const finalAccuracy = document.getElementById("finalAccuracy");
  const closeModal = document.getElementById("closeModal");

  let score = 0;
  let hits = 0;
  let misses = 0;
  let time = 30;
  let gameInterval;
  let targetTimeout;
  let playing = false;
  let targetLifetime = 800;

  startBtn.addEventListener("click", startGame);
  closeModal.addEventListener("click", () => (modal.style.display = "none"));
  gameArea.addEventListener("click", registerMiss);

  function startGame() {
    if (playing) return;
    playing = true;

    score = 0;
    hits = 0;
    misses = 0;
    time = 30;
    scoreEl.textContent = score;
    timeEl.textContent = time;
    accuracyEl.textContent = "0%";

    startBtn.disabled = true;
    gameArea.innerHTML = "";

    const difficulty = difficultyEl.value;
    if (difficulty === "easy") targetLifetime = 1000;
    else if (difficulty === "medium") targetLifetime = 800;
    else targetLifetime = 500;

    spawnTarget();
    gameInterval = setInterval(updateTime, 1000);
  }

  function updateTime() {
    time--;
    timeEl.textContent = time;
    if (time <= 0) endGame();
  }

  function updateAccuracy() {
    const total = hits + misses;
    const acc = total > 0 ? ((hits / total) * 100).toFixed(1) : 0;
    accuracyEl.textContent = `${acc}%`;
  }

  function endGame() {
    clearInterval(gameInterval);
    clearTimeout(targetTimeout);
    playing = false;
    startBtn.disabled = false;
    gameArea.innerHTML = "";

    const acc = hits + misses > 0 ? ((hits / (hits + misses)) * 100).toFixed(1) : 0;
    accuracyEl.textContent = `${acc}%`;

    finalScore.textContent = `🎯 Pontos: ${score}`;
    finalAccuracy.textContent = `💥 Precisão: ${acc}%`;

    modal.style.display = "flex";
  }

  function spawnTarget() {
    const target = document.createElement("div");
    target.classList.add("target");

    const size = 40;
    const x = Math.random() * (gameArea.clientWidth - size);
    const y = Math.random() * (gameArea.clientHeight - size);

    target.style.left = `${x}px`;
    target.style.top = `${y}px`;

    target.addEventListener("click", (e) => {
      e.stopPropagation();
      hits++;
      score += 10;
      scoreEl.textContent = score;
      hitSound.currentTime = 0;
      hitSound.play();
      target.remove();
      updateAccuracy();
      spawnTarget();
    });

    gameArea.appendChild(target);

    targetTimeout = setTimeout(() => {
      if (document.body.contains(target)) {
        target.remove();
        misses++;
        missSound.currentTime = 0;
        missSound.play();
        updateAccuracy();
        spawnTarget();
      }
    }, targetLifetime);
  }

  function registerMiss() {
    if (playing) {
      misses++;
      missSound.currentTime = 0;
      missSound.play();
      updateAccuracy();
    }
  }
});
