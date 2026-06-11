const STORAGE_KEY = "liveCashTrainerV2";

const defaultState = {
  currentSpotIndex: 0,
  correct: 0,
  played: 0,
  leaks: {},
  categoryPlayed: {},
  categoryCorrect: {},
  handHistory: []
};

let state = loadState();

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : structuredClone(defaultState);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getAllSpots() {
  if (Array.isArray(window.spots)) return window.spots;
  if (typeof spots !== "undefined" && Array.isArray(spots)) return spots;
  return [];
}

function $(id) {
  return document.getElementById(id);
}

function initApp() {
  setupTabs();
  setupTrainer();
  setupHandReview();
  setupHistory();
  updateDashboard();
}

function setupTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const screen = tab.dataset.screen;

      document.querySelectorAll(".tab").forEach((t) =>
        t.classList.remove("active")
      );

      document.querySelectorAll(".screen").forEach((s) =>
        s.classList.remove("active")
      );

      tab.classList.add("active");
      $(screen).classList.add("active");

      if (screen === "history") {
        renderHistory();
      }

      if (screen === "dashboard") {
        updateDashboard();
      }
    });
  });
}

function setupTrainer() {
  $("nextSpotBtn").addEventListener("click", nextSpot);
  renderSpot();
}

function renderSpot() {
  const allSpots = getAllSpots();

  if (!allSpots.length) {
    $("spotTitle").innerText = "No spots found";
    $("spotQuestion").innerText =
      "Create spots.js and make sure it defines window.spots = [...]";
    $("answerButtons").innerHTML = "";
    $("spotFeedback").classList.remove("show");
    $("nextSpotBtn").classList.add("hidden");
    return;
  }

  if (state.currentSpotIndex >= allSpots.length) {
    state.currentSpotIndex = 0;
    saveState();
  }

  const spot = allSpots[state.currentSpotIndex];

  $("spotCategory").innerText = spot.category;
  $("spotDifficulty").innerText = spot.difficulty;
  $("spotProgress").innerText =
    `${state.currentSpotIndex + 1} / ${allSpots.length}`;

  $("spotTitle").innerText = spot.title;
  $("spotQuestion").innerText = spot.question;

  $("answerButtons").innerHTML = "";
  $("spotFeedback").classList.remove("show");
  $("spotFeedback").innerHTML = "";
  $("nextSpotBtn").classList.add("hidden");

  spot.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.innerText = answer;
    button.addEventListener("click", () => evaluateSpot(index));
    $("answerButtons").appendChild(button);
  });
}

function evaluateSpot(choiceIndex) {
  const allSpots = getAllSpots();
  const spot = allSpots[state.currentSpotIndex];

  const isCorrect = choiceIndex === spot.best;

  state.played += 1;
  state.categoryPlayed[spot.category] =
    (state.categoryPlayed[spot.category] || 0) + 1;

  if (isCorrect) {
    state.correct += 1;
    state.categoryCorrect[spot.category] =
      (state.categoryCorrect[spot.category] || 0) + 1;
  } else {
    state.leaks[spot.leak] = (state.leaks[spot.leak] || 0) + 1;
  }

  saveState();

  document.querySelectorAll("#answerButtons button").forEach((btn, idx) => {
    btn.disabled = true;

    if (idx === spot.best) {
      btn.classList.add("good");
    }

    if (idx === choiceIndex && !isCorrect) {
      btn.classList.add("bad");
    }
  });

  $("spotFeedback").classList.add("show");
  $("spotFeedback").innerHTML = `
    <strong>${isCorrect ? "✅ Correct" : "❌ Not optimal"}</strong>
    <br><br>
    ${spot.explanation}
    <br><br>
    <strong>Leak tag:</strong> ${Coach.getLeakTitle(spot.leak)}
  `;

  $("nextSpotBtn").classList.remove("hidden");
  updateDashboard();
}

function nextSpot() {
  const allSpots = getAllSpots();

  state.currentSpotIndex += 1;

  if (state.currentSpotIndex >= allSpots.length) {
    state.currentSpotIndex = 0;
  }

  saveState();
  renderSpot();
}

function updateDashboard() {
  const scores = Coach.calculateScores(state);
  const mainLeaks = Coach.getMainLeaks(state, 3);

  $("overallScore").innerText = scores.overall;
  $("preflopScore").innerText = scores.preflop;
  $("flopScore").innerText = scores.flop;
  $("turnScore").innerText = scores.turn;
  $("riverScore").innerText = scores.river;
  $("profileScore").innerText = scores.profiling;
  $("valueScore").innerText = scores.value;

  $("coachSummary").innerText =
    state.played === 0
      ? "Play some spots to build your profile."
      : `You have played ${state.played} spots with ${scores.accuracy}% accuracy.`;

  $("trainingPlan").innerText = Coach.getTrainingPlan(state);

  const leakList = $("leakList");
  leakList.innerHTML = "";

  if (!mainLeaks.length) {
    leakList.innerHTML =
      `<p class="text-muted">No major leaks detected yet.</p>`;
    return;
  }

  mainLeaks.forEach((leak) => {
    const div = document.createElement("div");
    div.className = "leak-item";
    div.innerHTML = `
      <strong>${leak.title} (${leak.count})</strong>
      <span>${leak.advice}</span>
    `;
    leakList.appendChild(div);
  });
}

function setupHandReview() {
  $("analyzeHandBtn").addEventListener("click", analyzeCurrentHand);
}

function analyzeCurrentHand() {
  const hand = {
    position: $("hrPosition").value,
    villain: $("hrVillain").value,
    stack: $("hrStack").value,
    cards: $("hrCards").value,
    preflop: $("hrPreflop").value,
    flop: $("hrFlop").value,
    turn: $("hrTurn").value,
    river: $("hrRiver").value,
    notes: $("hrNotes").value,
    date: new Date().toLocaleString()
  };

  const findings = Coach.analyzeHand(hand);

  findings.forEach((finding) => {
    state.leaks[finding.leak] =
      (state.leaks[finding.leak] || 0) + 1;
  });

  state.handHistory.unshift({
    ...hand,
    findings
  });

  if (state.handHistory.length > 50) {
    state.handHistory = state.handHistory.slice(0, 50);
  }

  saveState();

  $("handAnalysis").classList.add("show");
  $("handAnalysis").innerHTML = `
    <strong>Hand Analysis</strong>
    <br><br>
    ${findings.map(f => `• ${f.message}`).join("<br><br>")}
  `;

  updateDashboard();
  renderHistory();
}

function setupHistory() {
  $("clearHistoryBtn").addEventListener("click", () => {
    if (!confirm("Clear all reviewed hands?")) return;
    state.handHistory = [];
    saveState();
    renderHistory();
  });

  $("resetAllBtn").addEventListener("click", () => {
    if (!confirm("Reset all training data?")) return;
    state = structuredClone(defaultState);
    saveState();
    location.reload();
  });
}

function renderHistory() {
  const container = $("handHistory");
  container.innerHTML = "";

  if (!state.handHistory.length) {
    container.innerHTML =
      `<p class="text-muted">No reviewed hands yet.</p>`;
    return;
  }

  state.handHistory.forEach((hand) => {
    const div = document.createElement("div");
    div.className = "history-item";

    div.innerHTML = `
      <strong>${hand.date} — ${hand.position} — ${hand.cards || "Unknown cards"}</strong>
      <p class="text-muted">
        Villain: ${hand.villain}<br>
        Stack: ${hand.stack || "n/a"}<br>
        Preflop: ${hand.preflop || "n/a"}<br>
        Flop: ${hand.flop || "n/a"}<br>
        Turn: ${hand.turn || "n/a"}<br>
        River: ${hand.river || "n/a"}
      </p>
      <p>
        ${hand.findings.map(f => `• ${f.message}`).join("<br>")}
      </p>
    `;

    container.appendChild(div);
  });
}

document.addEventListener("DOMContentLoaded", initApp);
