
/* ==============================
   GATE AND VIDEO SYSTEM
============================== */

const invitation = document.getElementById("invitation");
const tag = document.getElementById("openTag");
const weddingVideo = document.getElementById("weddingVideo");
const swipeHint = document.getElementById("swipeHint");

const videoActions = document.getElementById("videoActions");
const volumeBtn = document.getElementById("volumeBtn");
const volumeIcon = document.getElementById("volumeIcon");
const volumeText = document.getElementById("volumeText");
const skipBtn = document.getElementById("skipBtn");

let isOpening = false;
let actionTimer = null;

function enablePageScroll() {
  document.documentElement.style.overflowY = "auto";
  document.body.style.overflowY = "auto";
}

tag.addEventListener("click", () => {
  if (isOpening) return;

  isOpening = true;
  invitation.classList.add("video-playing");

  weddingVideo.currentTime = 0;

  const playPromise = weddingVideo.play();

  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.error("Video playback error:", error);
    });
  }

  invitation.classList.add("is-opening");
});

weddingVideo.addEventListener("playing", () => {
  clearTimeout(actionTimer);

  actionTimer = setTimeout(() => {
    if (!weddingVideo.paused && !weddingVideo.ended) {
      videoActions.classList.add("show");
    }
  }, 10000);
});

volumeBtn.addEventListener("click", () => {
  weddingVideo.muted = !weddingVideo.muted;

  if (weddingVideo.muted) {
    volumeIcon.textContent = "🔇";
    volumeText.textContent = "SOUND OFF";
  } else {
    volumeIcon.textContent = "🔊";
    volumeText.textContent = "SOUND ON";
  }
});

skipBtn.addEventListener("click", () => {
  clearTimeout(actionTimer);
  weddingVideo.pause();

  videoActions.classList.remove("show");
  swipeHint.classList.remove("show");

  enablePageScroll();

  document.getElementById("websiteScreen").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

weddingVideo.addEventListener("ended", () => {
  clearTimeout(actionTimer);

  videoActions.classList.remove("show");
  swipeHint.classList.add("show");

  enablePageScroll();
});

window.addEventListener("scroll", () => {
  if (window.scrollY > 30) {
    swipeHint.classList.remove("show");
  }
}, { passive: true });


/* ==============================
   SCRATCH CARD SYSTEM
============================== */

const scratchCanvas = document.getElementById("scratchCanvas");
const scratchCard = document.querySelector(".scratch-card");
const scratchLabel = document.getElementById("scratchLabel");

const ctx = scratchCanvas.getContext("2d");

let isScratching = false;
let scratched = false;
let scratchCheckCounter = 0;

function setupScratchCanvas() {
  const rect = scratchCard.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  scratchCanvas.width = Math.round(rect.width * dpr);
  scratchCanvas.height = Math.round(rect.height * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const gradient = ctx.createLinearGradient(
    0, 0, rect.width, rect.height
  );

  gradient.addColorStop(0, "#fff0bd");
  gradient.addColorStop(0.5, "#c49a4a");
  gradient.addColorStop(1, "#f7dda0");

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, rect.width, rect.height);

  ctx.fillStyle = "#74501e";
  ctx.textAlign = "center";
  ctx.font = "bold 15px Georgia";

  ctx.fillText(
    "✦ SCRATCH TO REVEAL ✦",
    rect.width / 2,
    rect.height / 2 + 5
  );

  ctx.globalCompositeOperation = "destination-out";
}

function scratchPosition(event) {
  const rect = scratchCanvas.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function scratchAt(event) {
  const pos = scratchPosition(event);

  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
  ctx.fill();
}

scratchCanvas.addEventListener("pointerdown", event => {
  if (scratched) return;

  isScratching = true;
  scratchCanvas.setPointerCapture(event.pointerId);

  scratchAt(event);
});

scratchCanvas.addEventListener("pointermove", event => {
  if (!isScratching || scratched) return;

  scratchAt(event);

  scratchCheckCounter++;

  if (scratchCheckCounter % 8 === 0) {
    checkScratchProgress();
  }
});

scratchCanvas.addEventListener("pointerup", () => {
  isScratching = false;
  checkScratchProgress();
});

scratchCanvas.addEventListener("pointercancel", () => {
  isScratching = false;
});


/* Check scratch progress */

function checkScratchProgress() {
  if (scratched) return;

  const imageData = ctx.getImageData(
    0,
    0,
    scratchCanvas.width,
    scratchCanvas.height
  );

  const pixels = imageData.data;
  let transparentPixels = 0;

  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] < 50) {
      transparentPixels++;
    }
  }

  const percentage =
    (transparentPixels / (pixels.length / 4)) * 100;

  if (percentage >= 40) {
    scratched = true;
    isScratching = false;

    revealWeddingDate();
  }
}


/* ==============================
   DATE REVEAL + STAR RAIN
============================== */

let starRainTimer = null;

function revealWeddingDate() {

  // Scratch layer hide — box remains visible
  scratchCanvas.style.display = "none";
  scratchLabel.style.display = "none";

  // Show date inside the same scratch box
  // .scratch-hidden-message remains visible

  // Start golden star rain
  startStarRain();

}


/* ==============================
   GOLDEN STAR RAIN — 15 SECONDS
============================== */

function startStarRain() {

  const starRain = document.getElementById("starRain");

  starRain.innerHTML = "";
  starRain.classList.add("show");

  for (let i = 0; i < 100; i++) {

    const star = document.createElement("span");

    star.className = "falling-star";
    star.textContent = Math.random() > 0.5 ? "✦" : "✧";

    star.style.left = Math.random() * 100 + "%";
    star.style.fontSize = (10 + Math.random() * 16) + "px";

    star.style.animationDuration =
      (3 + Math.random() * 5) + "s";

    star.style.animationDelay =
      Math.random() * 2 + "s";

    starRain.appendChild(star);
  }

  clearTimeout(starRainTimer);

  starRainTimer = setTimeout(() => {
    starRain.classList.remove("show");
    starRain.innerHTML = "";
  }, 15000);
}


/* ==============================
   SAVE THE DATE — CALENDAR
============================== */

const saveDateBtn = document.getElementById("saveDateBtn");

saveDateBtn.addEventListener("click", () => {

  const calendarEvent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invitation//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:wedding-19032027@example.com",
    "DTSTAMP:20261031T000000Z",
    "DTSTART;VALUE=DATE:20270319",
    "DTEND;VALUE=DATE:20270320",
    "SUMMARY:Wedding Celebration - Sana Fatima & Dr. Waseem Pasha",
    "LOCATION:Royal Resort, Bilari",
    "DESCRIPTION:Together in Love - United by Faith",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob(
    [calendarEvent],
    { type: "text/calendar;charset=utf-8" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = "Wedding-Date-19-March-2027.ics";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);

});


/* ==============================
   LIVE WEDDING COUNTDOWN
============================== */

let countdownInterval = null;

function startWeddingCountdown() {

  const weddingDate = new Date(
    "2027-03-19T00:00:00+05:30"
  ).getTime();

  function updateCountdown() {

    const now = Date.now();
    const distance = weddingDate - now;

    if (distance <= 0) {

      document.getElementById("days").textContent = "00";
      document.getElementById("hours").textContent = "00";
      document.getElementById("minutes").textContent = "00";
      document.getElementById("seconds").textContent = "00";

      clearInterval(countdownInterval);
      return;
    }

    const days = Math.floor(
      distance / (1000 * 60 * 60 * 24)
    );

    const hours = Math.floor(
      (distance / (1000 * 60 * 60)) % 24
    );

    const minutes = Math.floor(
      (distance / (1000 * 60)) % 60
    );

    const seconds = Math.floor(
      (distance / 1000) % 60
    );

    document.getElementById("days").textContent =
      String(days).padStart(2, "0");

    document.getElementById("hours").textContent =
      String(hours).padStart(2, "0");

    document.getElementById("minutes").textContent =
      String(minutes).padStart(2, "0");

    document.getElementById("seconds").textContent =
      String(seconds).padStart(2, "0");
  }

  updateCountdown();

  clearInterval(countdownInterval);

  countdownInterval = setInterval(updateCountdown, 1000);
}


/* ==============================
   START SYSTEMS AFTER PAGE LOAD
============================== */

window.addEventListener("load", () => {

  setupScratchCanvas();

  // Countdown starts before scratching
  startWeddingCountdown();

});
