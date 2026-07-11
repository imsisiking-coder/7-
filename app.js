const FAMILY_KEY = "habitquest-family-room-v1";
const PAWN_KEY = "habitquest-pawn-skins-v1";
const QUEST_ROLL_KEY = "habitquest-quest-roll-state-v1";
const CUSTOM_TASK_KEY = "habitquest-custom-tasks-v1";
const STARRED_TASK_KEY = "habitquest-starred-task-ids-v1";
const TASK_PROGRESS_KEY = "habitquest-task-progress-v1";
const PROOF_KEY = "habitquest-task-proof-v1";
const PLAYERS_KEY = "habitquest-players-v1";
const CURRENT_PLAYER_KEY = "habitquest-current-player-v1";
const PAWN_OPTIONS = ["🧝", "🧙", "🦊", "🐯", "🐼", "🐰", "🦄", "🐉"];

const pageSections = Array.from(document.querySelectorAll(".page"));
const navButtons = Array.from(document.querySelectorAll(".nav-btn"));
const diceButton = document.getElementById("rollDiceButton");
const dicePips = diceButton ? Array.from(diceButton.querySelectorAll(".pip")) : [];
const boardPage = document.querySelector('.page[data-page="board"]');
const boardContainer = boardPage ? boardPage.querySelector(".board-container") : null;
const startSquare = boardPage ? boardPage.querySelector(".board-square.special-square") : null;
const boardSquares = boardPage ? Array.from(boardPage.querySelectorAll(".board-square")) : [];
const missionList = document.getElementById("missionList");
const taskList = document.querySelector(".task-list");
const taskAddForm = document.getElementById("taskAddForm");
const taskTitleInput = document.getElementById("taskTitleInput");
const taskDescInput = document.getElementById("taskDescInput");
const proofUploadInput = document.getElementById("proofUploadInput");
const parentProofList = document.getElementById("parentProofList");
const cameraModal = document.getElementById("cameraModal");
const cameraPreview = document.getElementById("cameraPreview");
const cameraCanvas = document.getElementById("cameraCanvas");
const cameraCapture = document.getElementById("cameraCapture");
const cameraCancel = document.getElementById("cameraCancel");
const cameraUseFile = document.getElementById("cameraUseFile");
const playerAuthorityList = document.getElementById("playerAuthorityList");
const profileButtons = Array.from(document.querySelectorAll(".profile-open-btn"));
const profileTopLabelBoard = document.getElementById("profileTopLabelBoard");
const profileTopLabelTasks = document.getElementById("profileTopLabelTasks");
const profileTopLabelRanking = document.getElementById("profileTopLabelRanking");
const profileTopLabelSettings = document.getElementById("profileTopLabelSettings");
const profileModal = document.getElementById("profileModal");
const profileForm = document.getElementById("profileForm");
const profileNameInput = document.getElementById("profileNameInput");
const profilePawnSelect = document.getElementById("profilePawnSelect");
const profileError = document.getElementById("profileError");
const profileCancel = document.getElementById("profileCancel");
let boardTrackSquares = [];

const familySetupModal = document.getElementById("familySetupModal");
const familySetupForm = document.getElementById("familySetupForm");
const familyRoomNameInput = document.getElementById("familyRoomNameInput");
const familyPasswordInput = document.getElementById("familyPasswordInput");

const parentAuthModal = document.getElementById("parentAuthModal");
const parentAuthForm = document.getElementById("parentAuthForm");
const parentAuthPasswordInput = document.getElementById("parentAuthPasswordInput");
const parentAuthError = document.getElementById("parentAuthError");
const parentAuthCancel = document.getElementById("parentAuthCancel");
const parentAuthHint = document.getElementById("parentAuthHint");

const familyEditorForm = document.getElementById("familyEditorForm");
const editRoomNameInput = document.getElementById("editRoomNameInput");
const editPasswordInput = document.getElementById("editPasswordInput");
const familyEditorMessage = document.getElementById("familyEditorMessage");

const pawnMarkerP1 = document.getElementById("pawnMarkerP1");
const pawnMarkerP2 = document.getElementById("pawnMarkerP2");
const pawnP1Select = document.getElementById("pawnP1Select");
const pawnP2Select = document.getElementById("pawnP2Select");
const pawnP1Preview = document.getElementById("pawnP1Preview");
const pawnP2Preview = document.getElementById("pawnP2Preview");

let familyConfig = loadFamilyConfig();
let pendingProtectedPage = null;
let pawnState = loadPawnState();
let boardOnlyMode = false;
let isRolling = false;
const pawnPositions = { p1: 0, p2: 0 };
let currentTurn = "p1";
let questRollState = loadQuestRollState();
let availableRolls = questRollState.availableRolls;
let customTasks = loadCustomTasks();
let starredTaskIds = loadStarredTaskIds();
let taskProgress = loadTaskProgress();
let proofSubmissions = loadProofSubmissions();
let currentUploadTaskId = null;
let cameraStream = null;
let players = loadPlayers();
let currentPlayerId = loadCurrentPlayerId();

function loadFamilyConfig() {
  const raw = localStorage.getItem(FAMILY_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed.roomName || !parsed.parentPassword) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveFamilyConfig(roomName, parentPassword) {
  familyConfig = {
    roomName,
    parentPassword
  };
  localStorage.setItem(FAMILY_KEY, JSON.stringify(familyConfig));
}

function loadPawnState() {
  const raw = localStorage.getItem(PAWN_KEY);
  const fallback = { p1: "🧝", p2: "🧙" };
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      p1: parsed.p1 || fallback.p1,
      p2: parsed.p2 || fallback.p2
    };
  } catch {
    return fallback;
  }
}

function savePawnState() {
  localStorage.setItem(PAWN_KEY, JSON.stringify(pawnState));
}

function loadCustomTasks() {
  const raw = localStorage.getItem(CUSTOM_TASK_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((task) => task && task.id && task.title);
  } catch {
    return [];
  }
}

function saveCustomTasks() {
  localStorage.setItem(CUSTOM_TASK_KEY, JSON.stringify(customTasks));
}

function loadStarredTaskIds() {
  const raw = localStorage.getItem(STARRED_TASK_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStarredTaskIds() {
  localStorage.setItem(STARRED_TASK_KEY, JSON.stringify(starredTaskIds));
}

function loadTaskProgress() {
  const raw = localStorage.getItem(TASK_PROGRESS_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveTaskProgress() {
  localStorage.setItem(TASK_PROGRESS_KEY, JSON.stringify(taskProgress));
}

function loadProofSubmissions() {
  const raw = localStorage.getItem(PROOF_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveProofSubmissions() {
  localStorage.setItem(PROOF_KEY, JSON.stringify(proofSubmissions));
}

function loadPlayers() {
  const raw = localStorage.getItem(PLAYERS_KEY);
  const fallback = [
    { id: "p1", name: "하루", pawn: "🧝", isAdmin: true },
    { id: "p2", name: "도윤", pawn: "🧙", isAdmin: false }
  ];

  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return fallback;
    }
    return parsed.map((player, index) => ({
      id: player.id || `p${index + 1}`,
      name: player.name || `플레이어 ${index + 1}`,
      pawn: PAWN_OPTIONS.includes(player.pawn) ? player.pawn : PAWN_OPTIONS[index % PAWN_OPTIONS.length],
      isAdmin: !!player.isAdmin
    }));
  } catch {
    return fallback;
  }
}

function savePlayers() {
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
}

function loadCurrentPlayerId() {
  const stored = localStorage.getItem(CURRENT_PLAYER_KEY);
  if (stored && players.some((player) => player.id === stored)) {
    return stored;
  }
  return players[0] ? players[0].id : "p1";
}

function saveCurrentPlayerId() {
  localStorage.setItem(CURRENT_PLAYER_KEY, currentPlayerId);
}

function getPendingProof(taskId) {
  return proofSubmissions.find((proof) => proof.taskId === taskId && proof.status === "pending");
}

function loadQuestRollState() {
  const raw = localStorage.getItem(QUEST_ROLL_KEY);
  const fallback = { availableRolls: 0, rewardedTaskIds: [] };
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      availableRolls: Number.isFinite(parsed.availableRolls) ? Math.max(0, parsed.availableRolls) : 0,
      rewardedTaskIds: Array.isArray(parsed.rewardedTaskIds) ? parsed.rewardedTaskIds : []
    };
  } catch {
    return fallback;
  }
}

function saveQuestRollState() {
  localStorage.setItem(
    QUEST_ROLL_KEY,
    JSON.stringify({
      availableRolls,
      rewardedTaskIds: questRollState.rewardedTaskIds
    })
  );
}

function updateDiceButtonState() {
  if (!diceButton) {
    return;
  }

  const label = diceButton.querySelector("small");
  diceButton.disabled = isRolling || availableRolls <= 0;

  if (!isRolling && label) {
    label.textContent = availableRolls > 0 ? `굴리기! (${availableRolls})` : "할 일을 완료해!";
  }
}

function getCurrentPlayer() {
  return players.find((player) => player.id === currentPlayerId) || players[0] || null;
}

function syncPawnStateFromPlayers() {
  if (players[0]) {
    pawnState.p1 = players[0].pawn;
  }
  if (players[1]) {
    pawnState.p2 = players[1].pawn;
  }
  savePawnState();
}

function updateProfileTopLabels() {
  const currentPlayer = getCurrentPlayer();
  const label = currentPlayer ? `${currentPlayer.pawn} ${currentPlayer.name}` : "프로필";

  if (profileTopLabelBoard) {
    profileTopLabelBoard.textContent = label;
  }
  if (profileTopLabelTasks) {
    profileTopLabelTasks.textContent = label;
  }
  if (profileTopLabelRanking) {
    profileTopLabelRanking.textContent = label;
  }
  if (profileTopLabelSettings) {
    profileTopLabelSettings.textContent = label;
  }
}

function renderPlayerAuthorityList() {
  if (!playerAuthorityList) {
    return;
  }

  playerAuthorityList.innerHTML = players
    .map((player) => {
      const role = player.isAdmin ? "부모 권한" : "일반";
      const buttonText = player.isAdmin ? "권한 해제" : "권한 주기";
      return `<div class="player-row"><div><strong>${player.pawn} ${player.name}</strong><div class="muted">${role}</div></div><button class="grant-btn" type="button" onclick="togglePlayerAuthority('${player.id}')">${buttonText}</button></div>`;
    })
    .join("");
}

function openProfileModal() {
  const currentPlayer = getCurrentPlayer();
  if (!currentPlayer || !profileModal || !profileForm) {
    return;
  }

  profileNameInput.value = currentPlayer.name;
  profilePawnSelect.value = currentPlayer.pawn;
  profileError.classList.add("hidden");
  showModal(profileModal);
}

function bindProfileModal() {
  if (!profileForm || !profileCancel) {
    return;
  }

  profileButtons.forEach((button) => {
    button.addEventListener("click", openProfileModal);
  });

  profileCancel.addEventListener("click", () => {
    hideModal(profileModal);
  });

  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) {
      return;
    }

    const nextName = profileNameInput.value.trim();
    const nextPawn = profilePawnSelect.value;
    if (!nextName) {
      return;
    }

    const pawnTaken = players.some((player) => player.id !== currentPlayer.id && player.pawn === nextPawn);
    if (pawnTaken) {
      profileError.classList.remove("hidden");
      return;
    }

    currentPlayer.name = nextName;
    currentPlayer.pawn = nextPawn;
    savePlayers();
    syncPawnStateFromPlayers();
    renderPawnState();
    renderPlayerAuthorityList();
    updateProfileTopLabels();
    hideModal(profileModal);
  });
}

function getTaskCards() {
  return Array.from(document.querySelectorAll('.page[data-page="tasks"] .task-card'));
}

function createTaskCardElement(task) {
  const card = document.createElement("article");
  card.className = "task-card";
  card.dataset.taskId = task.id;
  card.setAttribute("onclick", "completeTask(this)");
  card.innerHTML = `<div><h3>${task.title}</h3><p>${task.desc || "오늘의 새 퀘스트"}</p></div><div class="task-actions"><button type="button" class="proof-btn" onclick="openProofUploader(event, this)">📷</button><button type="button" class="check" onclick="toggleQuestStar(event, this)">⭐</button></div>`;
  return card;
}

function renderCustomTasks() {
  if (!taskList) {
    return;
  }

  taskList.querySelectorAll('[data-origin="custom"]').forEach((node) => node.remove());
  customTasks.forEach((task) => {
    const card = createTaskCardElement(task);
    card.dataset.origin = "custom";
    taskList.append(card);
  });
}

function renderStarredState() {
  getTaskCards().forEach((card) => {
    const starButton = card.querySelector(".check");
    if (!starButton) {
      return;
    }
    starButton.classList.toggle("starred", starredTaskIds.includes(card.dataset.taskId));
  });
}

function renderTaskProgressState() {
  getTaskCards().forEach((card) => {
    const taskId = card.dataset.taskId;
    const state = taskId ? taskProgress[taskId] : null;
    const isDone = !!(state && state.done);
    const isInProgress = !!(state && state.startedAt && !state.done);
    const hasPendingProof = !!(taskId && getPendingProof(taskId));

    card.classList.toggle("active", isDone);
    card.classList.toggle("in-progress", isInProgress);
    card.classList.toggle("proof-pending", hasPendingProof);
    card.classList.toggle("hidden", isDone);
  });
}

function normalizeTaskProgress() {
  getTaskCards().forEach((card) => {
    const taskId = card.dataset.taskId;
    if (!taskId) {
      return;
    }

    if (questRollState.rewardedTaskIds.includes(taskId) && !(taskProgress[taskId] && taskProgress[taskId].done)) {
      taskProgress[taskId] = { done: true, startedAt: Date.now() - 1000 };
    }
  });
  saveTaskProgress();
}

function renderMissionList() {
  if (!missionList) {
    return;
  }

  const cardsById = new Map(getTaskCards().map((card) => [card.dataset.taskId, card]));
  const missionCards = starredTaskIds
    .map((taskId) => cardsById.get(taskId))
    .filter((card) => {
      if (!card) {
        return false;
      }
      const state = taskProgress[card.dataset.taskId];
      return !(state && state.done);
    })
    .slice(0, 3);

  if (missionCards.length === 0) {
    missionList.innerHTML = '<div class="mission-empty">할 일에서 ⭐ 을 눌러 진행중 퀘스트를 추가해줘!</div>';
    return;
  }

  missionList.innerHTML = missionCards
    .map((card) => {
      const title = card.querySelector("h3")?.textContent || "퀘스트";
      const desc = card.querySelector("p")?.textContent || "";
      const taskId = card.dataset.taskId;
      return `<article class="mission-card"><div class="mission-icon">📌</div><div class="flex-1"><h3>${title}</h3><p class="mission-label">${desc}</p></div><button class="mission-done" type="button" onclick="openProofByTaskId('${taskId}')">인증샷</button></article>`;
    })
    .join("");
}

window.togglePlayerAuthority = function togglePlayerAuthority(playerId) {
  const player = players.find((item) => item.id === playerId);
  if (!player) {
    return;
  }

  player.isAdmin = !player.isAdmin;
  savePlayers();
  renderPlayerAuthorityList();
};

function renderParentProofList() {
  if (!parentProofList) {
    return;
  }

  const pendingProofs = proofSubmissions.filter((proof) => proof.status === "pending");
  const cardsById = new Map(getTaskCards().map((card) => [card.dataset.taskId, card]));

  if (pendingProofs.length === 0) {
    parentProofList.innerHTML = '<div class="proof-empty">대기 중인 인증샷이 없습니다.</div>';
    return;
  }

  parentProofList.innerHTML = pendingProofs
    .map((proof) => {
      const taskCard = cardsById.get(proof.taskId);
      const title = taskCard?.querySelector("h3")?.textContent || "할 일";
      return `<article class="proof-item"><strong>${title}</strong><img src="${proof.imageData}" alt="인증샷" /><div class="proof-actions"><button class="proof-approve" type="button" onclick="approveProof('${proof.id}')">수락</button><button class="proof-reject" type="button" onclick="rejectProof('${proof.id}')">거절</button></div></article>`;
    })
    .join("");
}

function renderPawnState() {
  if (pawnP1Preview) {
    pawnP1Preview.textContent = pawnState.p1;
  }
  if (pawnP2Preview) {
    pawnP2Preview.textContent = pawnState.p2;
  }
  if (pawnP1Select) {
    pawnP1Select.value = pawnState.p1;
  }
  if (pawnP2Select) {
    pawnP2Select.value = pawnState.p2;
  }

  renderPawnPositions();
}

function bindPawnEditor() {
  if (pawnP1Select) {
    pawnP1Select.addEventListener("change", () => {
      pawnState.p1 = pawnP1Select.value;
      savePawnState();
      renderPawnState();
    });
  }

  if (pawnP2Select) {
    pawnP2Select.addEventListener("change", () => {
      pawnState.p2 = pawnP2Select.value;
      savePawnState();
      renderPawnState();
    });
  }
}

function bindTaskAddForm() {
  if (!taskAddForm || !taskTitleInput) {
    return;
  }

  taskAddForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = taskTitleInput.value.trim();
    const desc = taskDescInput ? taskDescInput.value.trim() : "";

    if (!title) {
      return;
    }

    const task = {
      id: `custom-${Date.now()}`,
      title,
      desc
    };

    customTasks.push(task);
    saveCustomTasks();
    renderCustomTasks();
    renderTaskProgressState();
    renderStarredState();
    renderMissionList();
    renderParentProofList();
    taskAddForm.reset();
    taskTitleInput.focus();
  });
}

function bindProofUpload() {
  if (!proofUploadInput) {
    return;
  }

  proofUploadInput.addEventListener("change", () => {
    const file = proofUploadInput.files && proofUploadInput.files[0];
    if (!file || !currentUploadTaskId) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = typeof reader.result === "string" ? reader.result : "";
      saveProofForTask(currentUploadTaskId, imageData);
      proofUploadInput.value = "";
      currentUploadTaskId = null;
    };
    reader.readAsDataURL(file);
  });
}

function saveProofForTask(taskId, imageData) {
  if (!taskId || !imageData) {
    return;
  }

  proofSubmissions = proofSubmissions.filter((proof) => !(proof.taskId === taskId && proof.status === "pending"));
  proofSubmissions.unshift({
    id: `proof-${Date.now()}`,
    taskId,
    imageData,
    status: "pending",
    createdAt: Date.now()
  });
  saveProofSubmissions();
  renderTaskProgressState();
  renderParentProofList();
  alert("인증샷이 부모님 승인 대기중이에요!");
}

function isCameraContextAvailable() {
  const host = window.location.hostname;
  return window.location.protocol === "https:" || host === "localhost" || host === "127.0.0.1";
}

function closeCameraModal() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }
  if (cameraPreview) {
    cameraPreview.srcObject = null;
  }
  if (cameraModal) {
    hideModal(cameraModal);
  }
}

async function openCameraModalForTask(taskId) {
  if (!taskId || !proofUploadInput) {
    return;
  }

  currentUploadTaskId = taskId;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !isCameraContextAvailable()) {
    proofUploadInput.click();
    return;
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
    if (cameraPreview) {
      cameraPreview.srcObject = cameraStream;
    }
    if (cameraModal) {
      showModal(cameraModal);
    }
  } catch {
    proofUploadInput.click();
  }
}

function bindCameraModal() {
  if (!cameraCapture || !cameraCancel || !cameraUseFile || !cameraCanvas || !cameraPreview) {
    return;
  }

  cameraCancel.addEventListener("click", () => {
    closeCameraModal();
    currentUploadTaskId = null;
  });

  cameraUseFile.addEventListener("click", () => {
    closeCameraModal();
    if (proofUploadInput) {
      proofUploadInput.click();
    }
  });

  cameraCapture.addEventListener("click", () => {
    if (!currentUploadTaskId) {
      return;
    }

    const videoWidth = cameraPreview.videoWidth;
    const videoHeight = cameraPreview.videoHeight;
    if (!videoWidth || !videoHeight) {
      return;
    }

    cameraCanvas.width = videoWidth;
    cameraCanvas.height = videoHeight;
    const ctx = cameraCanvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.drawImage(cameraPreview, 0, 0, videoWidth, videoHeight);
    const imageData = cameraCanvas.toDataURL("image/jpeg", 0.92);
    closeCameraModal();
    saveProofForTask(currentUploadTaskId, imageData);
    currentUploadTaskId = null;
  });
}

function setActivePage(pageName) {
  pageSections.forEach((section) => {
    section.classList.toggle("active", section.dataset.page === pageName);
  });

  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.page === pageName);
  });

  if (pageName === "settings") {
    syncFamilyEditor();
  }

  if (pageName !== "board" && boardOnlyMode) {
    boardOnlyMode = false;
    document.body.classList.remove("board-only-mode");
  }

  if (pageName === "board") {
    renderPawnPositions();
  }
}

function showModal(modal) {
  modal.classList.remove("hidden");
}

function hideModal(modal) {
  modal.classList.add("hidden");
}

function openFamilySetup() {
  showModal(familySetupModal);
  familyRoomNameInput.focus();
}

function openParentAuth(targetPage) {
  pendingProtectedPage = targetPage;
  parentAuthError.classList.add("hidden");
  parentAuthPasswordInput.value = "";
  const roomText = familyConfig ? `(${familyConfig.roomName}) ` : "";
  parentAuthHint.textContent = `${roomText}부모 설정에 들어가려면 비밀번호를 입력하세요.`;
  showModal(parentAuthModal);
  parentAuthPasswordInput.focus();
}

function handlePageRequest(pageName) {
  if (pageName !== "settings") {
    setActivePage(pageName);
    return;
  }

  if (!familyConfig) {
    openFamilySetup();
    return;
  }

  openParentAuth("settings");
}

function bindNavigation() {
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      handlePageRequest(button.dataset.page);
    });
  });
}

function bindFamilySetup() {
  familySetupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const roomName = familyRoomNameInput.value.trim();
    const parentPassword = familyPasswordInput.value.trim();

    if (!roomName || parentPassword.length < 4) {
      return;
    }

    saveFamilyConfig(roomName, parentPassword);
    hideModal(familySetupModal);
  });
}

function bindParentAuth() {
  parentAuthForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!familyConfig) {
      return;
    }

    if (parentAuthPasswordInput.value === familyConfig.parentPassword) {
      hideModal(parentAuthModal);
      setActivePage(pendingProtectedPage || "settings");
      pendingProtectedPage = null;
      return;
    }

    parentAuthError.classList.remove("hidden");
    parentAuthPasswordInput.select();
  });

  parentAuthCancel.addEventListener("click", () => {
    hideModal(parentAuthModal);
    pendingProtectedPage = null;
  });
}

function syncFamilyEditor() {
  if (!familyConfig || !editRoomNameInput) {
    return;
  }
  editRoomNameInput.value = familyConfig.roomName;
  editPasswordInput.value = "";
  familyEditorMessage.classList.add("hidden");
}

function bindFamilyEditor() {
  if (!familyEditorForm) {
    return;
  }

  familyEditorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!familyConfig) {
      return;
    }

    const nextRoomName = editRoomNameInput.value.trim();
    const nextPassword = editPasswordInput.value.trim();

    if (!nextRoomName) {
      return;
    }

    const passwordToSave = nextPassword.length > 0 ? nextPassword : familyConfig.parentPassword;
    if (passwordToSave.length < 4) {
      return;
    }

    saveFamilyConfig(nextRoomName, passwordToSave);
    familyEditorMessage.textContent = "가족방 정보가 저장되었습니다.";
    familyEditorMessage.classList.remove("hidden");
    editPasswordInput.value = "";
  });
}

function bindMapInteraction() {
  if (diceButton) {
    diceButton.addEventListener("click", () => {
      if (isRolling) {
        return;
      }
      diceButton.style.transform = "translateY(4px) scale(0.96)";
      setTimeout(() => {
        diceButton.style.transform = "";
      }, 150);
      rollDiceAndMove();
    });
  }

  if (boardContainer) {
    boardContainer.addEventListener("click", () => {
      if (!boardPage || !boardPage.classList.contains("active")) {
        return;
      }
      boardOnlyMode = !boardOnlyMode;
      document.body.classList.toggle("board-only-mode", boardOnlyMode);
      renderPawnPositions();
    });
  }

  window.addEventListener("resize", () => {
    buildBoardTrackSquares();
    renderPawnPositions();
  });
}

function grantRollFromTask(taskId) {
  if (!taskId) {
    return;
  }

  if (!questRollState.rewardedTaskIds.includes(taskId)) {
    questRollState.rewardedTaskIds.push(taskId);
    availableRolls += 1;
    saveQuestRollState();
    updateDiceButtonState();
  }
}

function getSquareAt(position) {
  if (boardTrackSquares.length === 0) {
    return null;
  }
  const normalized = ((position % boardTrackSquares.length) + boardTrackSquares.length) % boardTrackSquares.length;
  return boardTrackSquares[normalized];
}

function placePawn(marker, position, pawnKey) {
  if (!boardContainer || !marker) {
    return;
  }

  const targetSquare = getSquareAt(position);
  if (!targetSquare) {
    return;
  }

  const boardRect = boardContainer.getBoundingClientRect();
  const squareRect = targetSquare.getBoundingClientRect();

  const centerX = squareRect.left - boardRect.left + squareRect.width / 2;
  const centerY = squareRect.top - boardRect.top + squareRect.height / 2;

  const sameSquare = pawnPositions.p1 === pawnPositions.p2;
  let offsetX = 0;
  let offsetY = 0;

  if (sameSquare) {
    if (pawnKey === "p1") {
      offsetX = -10;
      offsetY = -2;
    } else {
      offsetX = 10;
      offsetY = 2;
    }
  }

  marker.style.left = `${centerX + offsetX}px`;
  marker.style.top = `${centerY + offsetY}px`;
}

function renderPawnPositions() {
  if (!pawnMarkerP1 || !pawnMarkerP2) {
    return;
  }

  pawnMarkerP1.classList.remove("pawn-stack");
  pawnMarkerP1.textContent = pawnState.p1;
  pawnMarkerP2.textContent = pawnState.p2;
  pawnMarkerP2.classList.remove("hidden");
  placePawn(pawnMarkerP1, pawnPositions.p1, "p1");
  placePawn(pawnMarkerP2, pawnPositions.p2, "p2");
}

function buildBoardTrackSquares() {
  if (!boardContainer || boardSquares.length === 0) {
    boardTrackSquares = [];
    return;
  }

  const positioned = boardSquares.map((square) => {
    const rect = square.getBoundingClientRect();
    return { square, left: rect.left, top: rect.top };
  });

  const minTop = Math.min(...positioned.map((item) => item.top));
  const maxTop = Math.max(...positioned.map((item) => item.top));
  const minLeft = Math.min(...positioned.map((item) => item.left));
  const maxLeft = Math.max(...positioned.map((item) => item.left));
  const tolerance = 3;

  const topRow = positioned
    .filter((item) => Math.abs(item.top - minTop) <= tolerance)
    .sort((a, b) => a.left - b.left)
    .map((item) => item.square);

  const rightCol = positioned
    .filter((item) => Math.abs(item.left - maxLeft) <= tolerance && Math.abs(item.top - minTop) > tolerance)
    .sort((a, b) => a.top - b.top)
    .map((item) => item.square);

  const bottomRow = positioned
    .filter((item) => Math.abs(item.top - maxTop) <= tolerance && Math.abs(item.left - maxLeft) > tolerance)
    .sort((a, b) => b.left - a.left)
    .map((item) => item.square);

  const leftCol = positioned
    .filter((item) => Math.abs(item.left - minLeft) <= tolerance && Math.abs(item.top - maxTop) > tolerance && Math.abs(item.top - minTop) > tolerance)
    .sort((a, b) => b.top - a.top)
    .map((item) => item.square);

  const clockwise = [...topRow, ...rightCol, ...bottomRow, ...leftCol];
  if (!startSquare || clockwise.length === 0) {
    boardTrackSquares = clockwise;
    return;
  }

  const startIndex = clockwise.indexOf(startSquare);
  if (startIndex < 0) {
    boardTrackSquares = clockwise;
    return;
  }

  boardTrackSquares = [...clockwise.slice(startIndex), ...clockwise.slice(0, startIndex)];
}

function setDiceFace(value) {
  if (dicePips.length === 0) {
    return;
  }

  const patterns = {
    1: [5],
    2: [1, 9],
    3: [1, 5, 9],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9]
  };

  const onSet = new Set(patterns[value] || [5]);
  dicePips.forEach((pip, index) => {
    const pipIndex = index + 1;
    pip.classList.toggle("on", onSet.has(pipIndex));
  });
}

function rollDiceAndMove() {
  if (boardTrackSquares.length === 0 || !diceButton) {
    return;
  }

  if (availableRolls <= 0) {
    updateDiceButtonState();
    return;
  }

  const diceValue = Math.floor(Math.random() * 6) + 1;
  isRolling = true;
  availableRolls -= 1;
  saveQuestRollState();
  setDiceFace(diceValue);
  updateDiceButtonState();

  const label = diceButton.querySelector("small");
  if (label) {
    label.textContent = `${diceValue}칸!`;
  }

  const activePawn = currentTurn;
  const stepDuration = 220;

  for (let step = 1; step <= diceValue; step += 1) {
    setTimeout(() => {
      pawnPositions[activePawn] = pawnPositions[activePawn] + 1;
      renderPawnPositions();

      if (step === diceValue) {
        currentTurn = currentTurn === "p1" ? "p2" : "p1";
        isRolling = false;
        updateDiceButtonState();
      }
    }, stepDuration * step);
  }
}

window.completeTask = function completeTask(element) {
  const taskId = element.dataset.taskId;
  if (!taskId) {
    return;
  }

  const state = taskProgress[taskId] || { done: false, startedAt: null };
  if (state.done) {
    return;
  }

  if (!state.startedAt) {
    taskProgress[taskId] = { ...state, startedAt: Date.now(), done: false };
    saveTaskProgress();
    renderTaskProgressState();
    alert("할 일을 시작했어요! 끝나면 📷 인증샷을 올려주세요.");
    return;
  }

  if (getPendingProof(taskId)) {
    alert("부모님 승인 대기 중이에요!");
    return;
  }

  alert("📷 버튼으로 인증샷을 올리고 부모님 승인받아야 완료돼요.");
};

window.completeTaskById = function completeTaskById(taskId) {
  const target = getTaskCards().find((card) => card.dataset.taskId === taskId);
  if (!target) {
    return;
  }
  window.completeTask(target);
};

window.toggleQuestStar = function toggleQuestStar(event, starButton) {
  event.stopPropagation();
  const card = starButton.closest(".task-card");
  if (!card) {
    return;
  }

  const taskId = card.dataset.taskId;
  if (!taskId) {
    return;
  }

  const existingIndex = starredTaskIds.indexOf(taskId);
  if (existingIndex >= 0) {
    starredTaskIds.splice(existingIndex, 1);
  } else {
    if (starredTaskIds.length >= 3) {
      return;
    }
    starredTaskIds.push(taskId);
  }

  saveStarredTaskIds();
  renderStarredState();
  renderMissionList();
};

window.openProofUploader = function openProofUploader(event, button) {
  if (event && typeof event.stopPropagation === "function") {
    event.stopPropagation();
  }
  const card = button.closest(".task-card");
  const taskId = card ? card.dataset.taskId : null;
  if (!taskId || !proofUploadInput) {
    return;
  }

  const state = taskProgress[taskId] || { done: false, startedAt: null };
  if (state.done) {
    alert("이미 완료된 할 일이에요.");
    return;
  }

  if (!state.startedAt) {
    taskProgress[taskId] = { ...state, startedAt: Date.now(), done: false };
    saveTaskProgress();
    renderTaskProgressState();
  }

  openCameraModalForTask(taskId);
};

window.openProofByTaskId = function openProofByTaskId(taskId) {
  const target = getTaskCards().find((card) => card.dataset.taskId === taskId);
  const button = target ? target.querySelector(".proof-btn") : null;
  if (!button) {
    return;
  }
  window.openProofUploader(new Event("click"), button);
};

window.approveProof = function approveProof(proofId) {
  const proof = proofSubmissions.find((item) => item.id === proofId);
  if (!proof || proof.status !== "pending") {
    return;
  }

  proof.status = "approved";
  proof.approvedAt = Date.now();
  taskProgress[proof.taskId] = { done: true, startedAt: Date.now() - 1000 };
  saveTaskProgress();
  grantRollFromTask(proof.taskId);
  saveProofSubmissions();
  renderTaskProgressState();
  renderParentProofList();
};

window.rejectProof = function rejectProof(proofId) {
  const proof = proofSubmissions.find((item) => item.id === proofId);
  if (!proof || proof.status !== "pending") {
    return;
  }

  proof.status = "rejected";
  proof.rejectedAt = Date.now();
  saveProofSubmissions();
  renderTaskProgressState();
  renderParentProofList();
};

bindNavigation();
bindFamilySetup();
bindParentAuth();
bindFamilyEditor();
bindPawnEditor();
bindTaskAddForm();
bindProofUpload();
bindCameraModal();
bindMapInteraction();
buildBoardTrackSquares();
renderCustomTasks();
normalizeTaskProgress();
renderTaskProgressState();
renderStarredState();
renderMissionList();
renderParentProofList();
renderPawnState();
setDiceFace(5);
renderPawnPositions();
updateDiceButtonState();

if (!familyConfig) {
  openFamilySetup();
} else {
  syncFamilyEditor();
}
