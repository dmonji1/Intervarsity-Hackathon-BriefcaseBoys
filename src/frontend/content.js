// === Survey Overlay ===
function showSurvey() {
  const div = document.createElement("div");
  div.id = "survey-overlay";
  div.innerHTML = `
    <div id="survey-box">
      <h3>Impulse Survey</h3>
      <p>On a scale of 1-5, how tempted are you to buy right now?</p>
      <input type="number" id="q1" min="1" max="5" value="3"/>
      <br><br>
      <button id="submit">Submit</button>
    </div>
  `;
  document.body.appendChild(div);

  document.getElementById("submit").onclick = () => {
    const answers = [parseInt(document.getElementById("q1").value) || 3];

    // Send answers to the real backend API
    fetch('http://localhost:3000/eval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers: answers })
    })
    .then(response => response.json())
    .then(data => {
      console.log("Backend response:", data);
      
      if (data.risk === "high") {
        div.remove();
        showMiniGame();
      } else {
        div.remove();
        alert("Low risk - happy shopping!");
      }
    })
    .catch(error => {
      console.error("Error calling backend:", error);
      alert("Error connecting to server. Please try again.");
    });
  };
}

// === Mini-Game 1: Stop at 5 ===
function miniGameStopAtFive() {
  const div = document.createElement("div");
  div.innerHTML = `
    <div id="minigame">
      <h3>Mini-Game: Stop at 5</h3>
      <button id="play">Stop</button>
      <p id="counter">0</p>
    </div>
  `;
  document.body.appendChild(div);

  let count = 0;
  const interval = setInterval(() => {
    count++;
    document.getElementById("counter").innerText = count;
  }, 1000);

  document.getElementById("play").onclick = () => {
    clearInterval(interval);
    if (count === 5) {
      div.remove(); // success
    } else {
      div.remove();
      startCooldown();
    }
  };
}

// === Mini-Game 2: Chase the Button ===
function miniGameClickChase() {
  const div = document.createElement("div");
  div.innerHTML = `
    <div id="minigame">
      <h3>Mini-Game: Catch the Button!</h3>
      <button id="catchMe" style="position:absolute;">Catch me!</button>
    </div>
  `;
  document.body.appendChild(div);

  const btn = document.getElementById("catchMe");
  btn.onmouseover = () => {
    btn.style.left = Math.floor(Math.random() * 300) + "px";
    btn.style.top = Math.floor(Math.random() * 200) + "px";
  };

  btn.onclick = () => {
    div.remove(); // success
  };
}

// === Mini-Game 3: Reaction Timer with thresholds ===
function miniGameReaction() {
  const div = document.createElement("div");
  div.innerHTML = `
    <div id="minigame">
      <h3>Mini-Game: Reaction Test</h3>
      <p>Wait for GREEN, then click!</p>
      <button id="reactBtn" disabled>Wait...</button>
    </div>
  `;
  document.body.appendChild(div);

  const btn = document.getElementById("reactBtn");

  // Random delay before turning green (2-4s)
  setTimeout(() => {
    btn.disabled = false;
    btn.innerText = "CLICK!";
    btn.style.background = "green";
    const start = Date.now();

    btn.onclick = () => {
      const reactionTime = Date.now() - start;

      if (reactionTime < 400) {
        alert("Too fast (" + reactionTime + "ms)! Impulsive click → cooldown.");
        div.remove();
        startCooldown();
      } else if (reactionTime > 1200) {
        alert("Too slow (" + reactionTime + "ms)! You hesitated → cooldown.");
        div.remove();
        startCooldown();
      } else {
        alert("Good response (" + reactionTime + "ms)! Balanced decision.");
        div.remove(); // success → site allowed
      }
    };
  }, 2000 + Math.random() * 2000);
}

// === Random Game Chooser ===
function showMiniGame() {
  const games = [miniGameStopAtFive, miniGameClickChase, miniGameReaction];
  const randomGame = games[Math.floor(Math.random() * games.length)];
  randomGame();
}

// === Cooldown Logic ===
function startCooldown() {
  // Check if cooldown already exists
  chrome.storage.local.get("cooldown", (data) => {
    let expiry = data.cooldown;

    if (!expiry || Date.now() > expiry) {
      // If none exists, or it's expired, set a new 10-minute timer
      expiry = Date.now() + 1 * 60 * 1000; // 1 minutes
      chrome.storage.local.set({ cooldown: expiry });
    }

    // Remove existing overlay if already there
    const old = document.getElementById("cooldown-overlay");
    if (old) old.remove();

    // Fullscreen blocking overlay
    const overlay = document.createElement("div");
    overlay.id = "cooldown-overlay";
    overlay.innerHTML = `
      <div id="cooldown-box">
        <h2>Cooldown Active ⏳</h2>
        <p id="cooldown-timer">Loading...</p>
      </div>
    `;
    document.body.appendChild(overlay);

    // Update countdown
    function updateTimer() {
      const remaining = expiry - Date.now();
      if (remaining <= 0) {
        overlay.remove();
        chrome.storage.local.remove("cooldown");
        return;
      }

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);

      document.getElementById("cooldown-timer").innerText =
        `${minutes}:${seconds.toString().padStart(2, "0")} remaining`;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  });
}

// === Check Cooldown on load ===
chrome.storage.local.get("cooldown", data => {
  if (data.cooldown && Date.now() < data.cooldown) {
    startCooldown();
  } else {
    showSurvey();
  }
});
