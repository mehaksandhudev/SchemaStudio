// Faceless YouTube Studio — Frontend Controller

let currentTopics = [];
let selectedTopic = null;
let ws = null;

const OFFICIAL_LOGO_B64 = "data:image/jpeg;base64,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";


// Universal Toast Notification System
function showToast(message, type = "info") {
  let container = document.getElementById("toastNotificationContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastNotificationContainer";
    container.style.cssText = "position:fixed; bottom:24px; right:24px; z-index:99999; display:flex; flex-direction:column; gap:10px; pointer-events:none;";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast-pill toast-${type}`;
  const bg = type === "success" ? "rgba(16, 185, 129, 0.95)" : (type === "error" ? "rgba(239, 68, 68, 0.95)" : "rgba(30, 41, 59, 0.95)");
  const border = type === "success" ? "#34d399" : (type === "error" ? "#f87171" : "#38bdf8");
  const icon = type === "success" ? "✅" : (type === "error" ? "❌" : "ℹ️");

  toast.style.cssText = `display:flex; align-items:center; gap:10px; padding:12px 18px; border-radius:10px; background:${bg}; border:1px solid ${border}; color:#ffffff; font-family:'Inter',sans-serif; font-size:13px; font-weight:500; box-shadow:0 10px 25px -5px rgba(0,0,0,0.5); transform:translateX(100%); opacity:0; transition:all 0.3s cubic-bezier(0.16, 1, 0.3, 1); pointer-events:auto; max-width:380px; word-break:break-word;`;
  toast.innerHTML = `<span style="font-size:16px;">${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = "translateX(0)";
    toast.style.opacity = "1";
  });

  setTimeout(() => {
    toast.style.transform = "translateX(100%)";
    toast.style.opacity = "0";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 350);
  }, 4000);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initLogo();
  initPageRouter();
  initMobileView();
  fetchTopics();
  initTabs();
  initModal();
  initHeaderActions();
  initWebSocket();
  initAutopilot();
  fetchSystemStatus();
  initApiHealthMonitor();
  initPreflightModal();
});

function setMobileView(view) {
  const tabLib = document.getElementById("mobileTabLibrary");
  const tabWork = document.getElementById("mobileTabWorkspace");
  
  if (view === "library") {
    document.body.classList.remove("mobile-view-workspace");
    document.body.classList.add("mobile-view-library");
    if (tabLib) tabLib.classList.add("active");
    if (tabWork) tabWork.classList.remove("active");
  } else {
    document.body.classList.remove("mobile-view-library");
    document.body.classList.add("mobile-view-workspace");
    if (tabLib) tabLib.classList.remove("active");
    if (tabWork) tabWork.classList.add("active");
  }
}
window.setMobileView = setMobileView;

function initMobileView() {
  if (window.innerWidth <= 900) {
    document.body.classList.add("mobile-view-library");
  }
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      document.body.classList.remove("mobile-view-library", "mobile-view-workspace");
    } else {
      if (!document.body.classList.contains("mobile-view-workspace")) {
        document.body.classList.add("mobile-view-library");
      }
    }
  });
}

function initPageRouter() {
  const portalView = document.getElementById("creatorPortalView");
  const studioView = document.getElementById("studioDashboardView");
  const btnEnter = document.getElementById("btnEnterPipeline");
  const btnNavLaunch = document.getElementById("btnNavLaunchApp");
  const btnBack = document.getElementById("btnBackToCreatorPortal");
  const btnPortalCredits = document.getElementById("btnPortalOpenCreditsWindow");
  const btnHeaderCredits = document.getElementById("btnOpenApiCreditsWindow");

  const openStudioWindow = (e) => {
    if (e) e.preventDefault();
    window.open('/studio', '_blank');
  };

  const openPortalPage = (e) => {
    if (e) e.preventDefault();
    if (window.opener) {
      window.opener.focus();
    } else {
      window.location.href = '/';
    }
  };

  const openCreditsWindow = (e) => {
    if (e) e.preventDefault();
    window.open('/credits', 'ApiCreditsWindow', 'width=980,height=820,menubar=no,toolbar=no,status=no,resizable=yes');
  };

  if (btnEnter) btnEnter.onclick = openStudioWindow;
  if (btnNavLaunch) btnNavLaunch.onclick = openStudioWindow;
  if (btnBack) btnBack.onclick = openPortalPage;
  if (btnPortalCredits) btnPortalCredits.onclick = openCreditsWindow;
  if (btnHeaderCredits) btnHeaderCredits.onclick = openCreditsWindow;

  // Read hash or saved state if both views exist on page
  if (portalView && studioView) {
    if (window.location.hash === "#studio" || localStorage.getItem("quiet_schema_active_page") === "studio") {
      portalView.style.display = "none";
      studioView.style.display = "flex";
    } else {
      portalView.style.display = "block";
      studioView.style.display = "none";
    }
  }
}

function initLogo() {
  const brandImg = document.getElementById("headerBrandLogo");
  if (brandImg) {
    brandImg.src = "/api/media/branding/quiet_schema_gemini_logo.jpg";
  }
}

// Live Title CTR & Viral Hook Evaluator Engine
function evaluateTitleCTR(title) {
  if (!title) return { score: 50, badgeClass: "warning", ratingLabel: "FLAT HOOK", insights: ["Title unavailable"], length: 0 };
  let score = 50;
  const len = title.length;
  const insights = [];

  // 1. Mobile Length Optimization (<70 chars prevents ellipses on mobile screens)
  if (len >= 38 && len <= 65) {
    score += 20;
    insights.push("Optimal mobile length (<65 chars, no cutoff)");
  } else if (len > 70) {
    score -= 15;
    insights.push("Long title (>70 chars) may truncate on mobile screens");
  } else {
    score += 5;
    insights.push("Concise title");
  }

  // 2. Curiosity Gap Trigger
  const curiosityRegex = /\b(why|truth|hidden|secret|real reason|what happens|the lie|never|signs|pattern|how to)\b/i;
  if (curiosityRegex.test(title)) {
    score += 15;
    insights.push("High curiosity gap trigger");
  }

  // 3. Emotional & Deep Psychology Stakes
  const emotionRegex = /\b(anxious|anxiety|trauma|shame|fear|overthinking|people-pleasing|alone|mind|subconscious|burden|quiet|fine|cared for|healing|boundaries)\b/i;
  if (emotionRegex.test(title)) {
    score += 15;
    insights.push("Deep psychological tension & stakes");
  }

  // 4. Direct Address ('You / Your / Yourself')
  const personalRegex = /\b(you|your|yourself)\b/i;
  if (personalRegex.test(title)) {
    score += 10;
    insights.push("Direct personal address ('You/Your')");
  }

  // 5. Parenthetical / Colon Dual-Hook Pattern (e.g. 'Why X Happens (The Hidden Reason)')
  if (/\(.*\)|\[.*\]|:/i.test(title)) {
    score += 10;
    insights.push("Structured parenthetical qualifier");
  }

  score = Math.min(Math.max(score, 35), 98);
  let badgeClass = "healthy";
  let ratingLabel = "VIRAL HOOK";
  if (score < 65) {
    badgeClass = "danger";
    ratingLabel = "NEEDS CURIOSITY";
  } else if (score < 80) {
    badgeClass = "warning";
    ratingLabel = "STRONG HOOK";
  } else if (score >= 90) {
    ratingLabel = "ELITE VIRAL POTENTIAL";
  }

  return { score, badgeClass, ratingLabel, insights, length: len };
}

// Header Actions Handler
function initHeaderActions() {
  const btnAuto = document.getElementById("btnLaunchFullAutoPilot");
  if (btnAuto) {
    btnAuto.onclick = async () => {
      if (!confirm("⚡ Launch Full 1-Click Auto-Pilot?\n\nThis will autonomously:\n1. Search the web (Tavily) for trending psychology concepts\n2. Write a 5-act simple English script\n3. Synthesize voice & generate 4K art\n4. Render 10m master video + daily Shorts\n5. Auto-schedule everything to YouTube Cloud!")) {
        return;
      }

      btnAuto.disabled = true;
      btnAuto.innerHTML = "<span>⏳</span> Auto-Pilot Running...";

      try {
        const resp = await fetch("/api/autopilot/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ minutes: 10, publish: true, privacy: "private", dry_run: false })
        });
        const data = await resp.json();
        if (data.status === "started") {
          document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
          document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
          const liveTabBtn = document.querySelector('.tab-btn[data-tab="liveStudio"]');
          const livePane = document.getElementById("tab-liveStudio");
          if (liveTabBtn) liveTabBtn.classList.add("active");
          if (livePane) livePane.classList.add("active");
          
          alert("🚀 Auto-Pilot production started! Watch the real-time logs in Live Studio.");
        } else {
          alert(`❌ ${data.detail || "Failed to start autopilot"}`);
        }
      } catch (err) {
        alert(`❌ Error starting autopilot: ${err.message}`);
      } finally {
        setTimeout(() => {
          btnAuto.disabled = false;
          btnAuto.innerHTML = `<span class="btn-icon">⚡</span> 1-Click Auto-Pilot Launch`;
        }, 6000);
      }
    };
  }

  const openAutopilotBtn = document.getElementById("openAutopilotTabBtn");
  if (openAutopilotBtn) {
    openAutopilotBtn.onclick = () => {
      document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
      const tabBtn = document.querySelector('.tab-btn[data-tab="autopilotTab"]');
      const pane = document.getElementById("tab-autopilotTab");
      if (tabBtn) tabBtn.classList.add("active");
      if (pane) pane.classList.add("active");
    };
  }
}

// Tabs Handler
function initTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach((p) => p.classList.remove("active"));

      tab.classList.add("active");
      const target = tab.dataset.tab;
      const pane = document.getElementById(`tab-${target}`);
      if (pane) pane.classList.add("active");

      // Auto-play shorts video if navigating to smartphone tab
      if (target === "phoneShorts" || target === "shorts") {
        const phoneVideo = document.getElementById("phoneShortsVideo");
        if (phoneVideo && phoneVideo.src) {
          phoneVideo.play().catch(() => {});
        }
      }
    });
  });
}

// Modal Handler
function initModal() {
  const modal = document.getElementById("newVideoModal");
  const openBtn = document.getElementById("openNewVideoModalBtn");
  const closeBtn = document.getElementById("closeModalBtn");
  const cancelBtn = document.getElementById("cancelModalBtn");
  const chips = document.querySelectorAll(".preset-topic-chips .chip");
  const input = document.getElementById("modalTopicInput");
  const submitBtn = document.getElementById("startPipelineSubmitBtn");

  openBtn.addEventListener("click", () => modal.classList.add("open"));
  closeBtn.addEventListener("click", () => modal.classList.remove("open"));
  cancelBtn.addEventListener("click", () => modal.classList.remove("open"));

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      input.value = chip.dataset.topic;
    });
  });

  submitBtn.addEventListener("click", async () => {
    const topic = input.value.trim();
    if (!topic) {
      alert("Please enter a topic or psychological concept.");
      return;
    }

    const minutes = parseInt(document.getElementById("modalDurationSelect").value, 10);
    const publishMode = document.getElementById("modalPublishSelect").value;
    const isDryRun = document.getElementById("modalDryRunCheck").checked;

    const payload = {
      topic: topic,
      minutes: minutes,
      publish: publishMode !== "none",
      privacy: publishMode !== "none" ? publishMode : "private",
      dry_run: isDryRun,
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = "<span>⏳</span> Launching...";

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      modal.classList.remove("open");
      submitBtn.disabled = false;
      submitBtn.innerHTML = "<span>🚀</span> Start Autonomous Production";

      // Switch to Live Studio tab
      document.querySelector('[data-tab="liveStudio"]').click();
    } catch (err) {
      alert("Error starting pipeline: " + err);
      submitBtn.disabled = false;
      submitBtn.innerHTML = "<span>🚀</span> Start Autonomous Production";
    }
  });
}

// Real-time Log Polling & WebSocket Handler
let lastLogIndex = 0;
let pollingInterval = null;
let pipelineWasRunning = false;

function startLogPolling() {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(async () => {
    try {
      const resp = await fetch(`/api/logs?since=${lastLogIndex}`);
      const data = await resp.json();
      if (data.logs && data.logs.length > 0) {
        const termBody = document.getElementById("terminalLogs");
        data.logs.forEach((lineText) => {
          const line = document.createElement("div");
          line.className = "log-line";
          if (lineText.includes("❌") || lineText.includes("Error")) {
            line.className += " error";
          } else if (lineText.includes("🚀") || lineText.includes("✅") || lineText.includes("PHASE") || lineText.includes("Phase")) {
            line.className += " info";
          }
          line.textContent = lineText;
          termBody.appendChild(line);
          updateStepperFromLog(lineText);
        });
        termBody.scrollTop = termBody.scrollHeight;
        lastLogIndex += data.logs.length;
      }

      if (data.is_running) {
        pipelineWasRunning = true;
      } else if (pipelineWasRunning) {
        // Pipeline just finished
        pipelineWasRunning = false;
        fetchTopics(selectedTopic);
      }
    } catch (e) {}
  }, 1000);
}

function initWebSocket() {
  startLogPolling();
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws/logs`;

  try {
    ws = new WebSocket(wsUrl);
    ws.onclose = () => setTimeout(initWebSocket, 3000);
  } catch (e) {}

  document.getElementById("clearLogsBtn").addEventListener("click", () => {
    const termBody = document.getElementById("terminalLogs");
    termBody.innerHTML = '<div class="log-line info">Logs cleared.</div>';
    lastLogIndex = 0;
  });
}

function updateStepperFromLog(text) {
  const stepMap = [
    { key: "PHASE 1", id: "step-research" },
    { key: "PHASE 2", id: "step-script" },
    { key: "PHASE 3", id: "step-visuals" },
    { key: "PHASE 4", id: "step-render" },
    { key: "PHASE 5", id: "step-publish" },
  ];

  stepMap.forEach((item) => {
    if (text.includes(item.key)) {
      document.querySelectorAll(".step-card").forEach((c) => c.classList.remove("running"));
      const target = document.getElementById(item.id);
      if (target) target.classList.add("running");
    }
  });
}

// System Status
async function fetchSystemStatus() {
  try {
    const resp = await fetch("/api/status");
    const data = await resp.json();
  } catch (e) {}
}

// Topics List
async function fetchTopics(activeTopicId = null) {
  try {
    const resp = await fetch("/api/topics");
    const topics = await resp.json();
    currentTopics = topics;

    const listContainer = document.getElementById("topicListContainer");
    const badge = document.getElementById("topicCountBadge");
    if (badge) badge.textContent = `${topics.length} Videos`;
    const mobBadge = document.getElementById("mobileVideoCount");
    if (mobBadge) mobBadge.textContent = topics.length;

    if (topics.length === 0) {
      listContainer.innerHTML = '<p class="muted">No video productions yet.</p>';
      return;
    }

    const currentActiveId = activeTopicId || selectedTopic || topics[0].id;
    listContainer.innerHTML = "";

    topics.forEach((t) => {
      const isSelected = t.id === currentActiveId;
      const card = document.createElement("div");
      card.className = "topic-card" + (isSelected ? " active" : "");
      card.innerHTML = `
        <div class="topic-card-title">${t.title}</div>
        <div class="topic-card-meta">
          <span class="meta-tag">⏱️ ${t.duration || 10}m</span>
          <span class="meta-tag">📱 ${t.shorts ? t.shorts.length : 0} Shorts</span>
          ${t.is_published ? '<span class="meta-tag" style="color:#34d399; font-weight:600; background:rgba(52,211,153,0.15);">🚀 Live on YouTube</span>' : t.has_video ? '<span class="meta-tag" style="color:#10b981;">✅ 4K Video</span>' : ""}
          ${t.has_thumbnail ? '<span class="meta-tag" style="color:#ffe600;">🖼️ Thumbnails</span>' : ""}
        </div>
      `;
      card.addEventListener("click", () => {
        document.querySelectorAll(".topic-card").forEach((c) => c.classList.remove("active"));
        card.classList.add("active");
        loadTopicDetails(t.id);

        if (typeof setMobileView === "function") {
          setMobileView("workspace");
        }
        const playerTab = document.querySelector('[data-tab="longformPlayer"]');
        if (playerTab) {
          playerTab.click();
        }
        const ws = document.querySelector(".studio-workspace");
        if (ws) ws.scrollTop = 0;
      });
      listContainer.appendChild(card);
    });

    if (!selectedTopic || selectedTopic !== currentActiveId) {
      loadTopicDetails(currentActiveId);
    }
  } catch (err) {
    console.error("Error loading topics:", err);
  }
}

// Topic Details
async function loadTopicDetails(topicId) {
  selectedTopic = topicId;
  try {
    const resp = await fetch(`/api/topic/${topicId}`);
    const details = await resp.json();

    // Banner
    const title = details.script?.title_options?.[0] || topicId.replace(/_/g, " ").toUpperCase();
    const concept = details.script?.psychological_concept || "Introspective Psychology";
    const duration = details.script?.total_duration_minutes || 10;
    
    // Top Banner & Tags
    const bTitle = document.getElementById("bannerTitle");
    const bConcept = document.getElementById("bannerConcept");
    const bDuration = document.getElementById("bannerDuration");
    const statusPill = document.getElementById("bannerStatus");

    if (bTitle) bTitle.textContent = title;
    if (bConcept) bConcept.textContent = concept;
    if (bDuration) bDuration.textContent = `${duration} Mins`;

    const pub = details.publishing;
    const longform = pub?.longform || pub;
    const isLive = Boolean(longform && (longform.url || longform.id));
    const isPublic = details.live_stats?.privacy === "public" || longform?.status === "public";
    const isScheduled = (longform?.publish_at_display && longform.publish_at_display !== "Live (Public)") || (pub?.scheduled_display && pub.scheduled_display !== "Live (Public)");

    if (statusPill) {
      if (isPublic) {
        statusPill.textContent = "🚀 PUBLIC (Live on YouTube)";
        statusPill.style.background = "rgba(16, 185, 129, 0.2)";
        statusPill.style.color = "#34d399";
        statusPill.style.borderColor = "rgba(16, 185, 129, 0.5)";
      } else if (isScheduled) {
        statusPill.textContent = `🕒 Scheduled: ${longform?.publish_at_display || pub?.scheduled_display}`;
        statusPill.style.background = "rgba(56, 189, 248, 0.2)";
        statusPill.style.color = "#38bdf8";
        statusPill.style.borderColor = "rgba(56, 189, 248, 0.5)";
      } else if (isLive) {
        statusPill.textContent = `🔒 Uploaded (${(longform?.status || "private").toUpperCase()})`;
        statusPill.style.background = "rgba(255, 230, 0, 0.15)";
        statusPill.style.color = "#ffe600";
      } else if (details.has_longform) {
        statusPill.textContent = "✅ Ready (Local)";
        statusPill.style.background = "rgba(16, 185, 129, 0.15)";
        statusPill.style.color = "#10b981";
      } else {
        statusPill.textContent = "⏳ Rendering...";
        statusPill.style.background = "rgba(255, 230, 0, 0.15)";
        statusPill.style.color = "#ffe600";
      }
    }

    // Long-Form Player
    const ytId = longform?.id || details.live_stats?.id || details.publishing?.video_id;
    const isYtLive = Boolean(ytId && !String(ytId).startsWith("dry_run"));

    const ytIframe = document.getElementById("mainYoutubeIframe");
    const video = document.getElementById("mainLongformVideo");
    let videoPlaceholder = document.getElementById("videoPlaceholderBox");
    const switchBar = document.getElementById("videoSourceSwitchBar");
    const liveBadge = document.getElementById("playerLiveBadge");
    const videoStats = document.getElementById("playerVideoStats");
    const btnWatchYt = document.getElementById("btnWatchOnYt");
    const btnCopyYt = document.getElementById("btnCopyYtLink");
    const btnToggleSrc = document.getElementById("btnTogglePlayerSource");

    if (!videoPlaceholder && (video || ytIframe)) {
      videoPlaceholder = document.createElement("div");
      videoPlaceholder.id = "videoPlaceholderBox";
      videoPlaceholder.style.cssText = "display:none; align-items:center; justify-content:center; flex-direction:column; background:#0e121a; border:2px dashed rgba(255,255,255,0.15); border-radius:18px; aspect-ratio:16/9; width:100%; text-align:center; padding:30px;";
      const parent = video ? video.parentNode : document.getElementById("longformPlayerContainer");
      if (parent) parent.appendChild(videoPlaceholder);
    }

    if (isYtLive) {
      if (switchBar) switchBar.style.display = "flex";
      if (videoPlaceholder) videoPlaceholder.style.display = "none";
      if (video) {
        video.pause();
        video.style.display = "none";
      }
      if (ytIframe) {
        ytIframe.style.display = "block";
        ytIframe.src = `https://www.youtube-nocookie.com/embed/${ytId}?rel=0`;
      }
      if (btnWatchYt) {
        btnWatchYt.href = `https://youtu.be/${ytId}`;
        btnWatchYt.style.display = "inline-flex";
      }
      if (btnCopyYt) {
        btnCopyYt.onclick = () => {
          navigator.clipboard.writeText(`https://youtu.be/${ytId}`);
          btnCopyYt.textContent = "✅ Copied!";
          setTimeout(() => { btnCopyYt.textContent = "📋 Copy Link"; }, 2000);
        };
      }
      if (liveBadge) {
        const priv = (details.live_stats?.privacy || longform?.status || "public").toUpperCase();
        if (priv === "PUBLIC") {
          liveBadge.textContent = "🟢 Live on YouTube";
          liveBadge.style.color = "#34d399";
        } else {
          liveBadge.textContent = `🕒 Scheduled (${priv})`;
          liveBadge.style.color = "#38bdf8";
        }
      }
      if (videoStats) {
        const v = details.live_stats?.views ?? longform?.views ?? 0;
        const l = details.live_stats?.likes ?? longform?.likes ?? 0;
        const c = details.live_stats?.comments ?? longform?.comments ?? 0;
        videoStats.textContent = `👁️ ${Number(v).toLocaleString()} views • 👍 ${Number(l).toLocaleString()} likes • 💬 ${Number(c).toLocaleString()} comments`;
      }
      if (btnToggleSrc) {
        if (details.has_longform) {
          btnToggleSrc.style.display = "inline-flex";
          btnToggleSrc.textContent = "💾 Switch to Local MP4";
          btnToggleSrc.onclick = () => {
            if (ytIframe && ytIframe.style.display !== "none") {
              ytIframe.style.display = "none";
              video.style.display = "block";
              video.src = `/api/media/${topicId}/longform_video.mp4`;
              video.poster = `/api/media/${topicId}/thumbnail.jpg`;
              btnToggleSrc.textContent = "📺 Switch to YouTube Stream";
            } else {
              if (video) {
                video.pause();
                video.style.display = "none";
              }
              if (ytIframe) ytIframe.style.display = "block";
              btnToggleSrc.textContent = "💾 Switch to Local MP4";
            }
          };
        } else {
          btnToggleSrc.style.display = "none";
        }
      }
    } else if (details.has_longform) {
      if (switchBar) switchBar.style.display = "flex";
      if (btnWatchYt) btnWatchYt.style.display = "none";
      if (btnCopyYt) btnCopyYt.style.display = "none";
      if (btnToggleSrc) btnToggleSrc.style.display = "none";
      if (liveBadge) {
        liveBadge.textContent = "💾 4K Master MP4 (Local)";
        liveBadge.style.color = "#a5b4fc";
      }
      if (videoStats) videoStats.textContent = "Ready for YouTube Scheduling";
      if (ytIframe) ytIframe.style.display = "none";
      if (videoPlaceholder) videoPlaceholder.style.display = "none";
      if (video) {
        video.style.display = "block";
        video.src = `/api/media/${topicId}/longform_video.mp4`;
        video.poster = `/api/media/${topicId}/thumbnail.jpg`;
      }
    } else {
      if (switchBar) switchBar.style.display = "none";
      if (ytIframe) ytIframe.style.display = "none";
      if (video) {
        video.pause();
        video.style.display = "none";
      }
      if (videoPlaceholder) {
        videoPlaceholder.style.display = "flex";
        videoPlaceholder.innerHTML = `
          <div style="font-size:38px; margin-bottom:12px; animation: pulse 2s infinite;">⏳</div>
          <h3 style="color:#f8fafc; font-size:18px; font-weight:600; margin-bottom:6px;">4K Video is Scheduled or Rendering</h3>
          <p style="color:#94a3b8; font-size:13px; max-width:400px; margin:0 auto 16px;">Microsecond Whisper subtitle alignment and high-bitrate encoding are active.</p>
        `;
      }
    }

    // Chapters
    const chaptersBox = document.getElementById("chaptersListContainer");
    chaptersBox.innerHTML = "";
    if (details.chapters) {
      const lines = details.chapters.trim().split("\n");
      lines.forEach((line) => {
        const parts = line.split(" ");
        const time = parts[0];
        const label = parts.slice(1).join(" ");
        const item = document.createElement("div");
        item.className = "chapter-item";
        item.innerHTML = `<span>${label}</span><span class="chapter-time">${time}</span>`;
        item.addEventListener("click", () => {
          const [m, s] = time.split(":").map(Number);
          const totalSec = m * 60 + s;
          if (isYtLive && ytIframe && ytIframe.style.display !== "none") {
            ytIframe.src = `https://www.youtube-nocookie.com/embed/${ytId}?start=${totalSec}&autoplay=1&rel=0`;
          } else if (details.has_longform && video) {
            video.currentTime = totalSec;
            video.play();
          }
        });
        chaptersBox.appendChild(item);
      });
    } else {
      chaptersBox.innerHTML = '<p class="muted">⏳ Chapters will be generated upon video completion.</p>';
    }

    // Shorts & Smartphone Model
    const shortsGroup = document.getElementById("shortsListGroup");
    const phoneVideo = document.getElementById("phoneShortsVideo");
    const phoneTitle = document.getElementById("shortsPhoneTitle");
    const phoneSoundBtn = document.getElementById("phoneSoundToggleBtn");
    const phoneSoundIcon = document.getElementById("phoneSoundIcon");
    const phoneSoundText = document.getElementById("phoneSoundText");

    function updateSoundUi() {
      if (!phoneVideo) return;
      if (phoneVideo.muted) {
        if (phoneSoundIcon) phoneSoundIcon.textContent = "🔇";
        if (phoneSoundText) phoneSoundText.textContent = "Tap for Sound";
        if (phoneSoundBtn) phoneSoundBtn.classList.remove("sound-on");
      } else {
        if (phoneSoundIcon) phoneSoundIcon.textContent = "🔊";
        if (phoneSoundText) phoneSoundText.textContent = "Sound ON";
        if (phoneSoundBtn) phoneSoundBtn.classList.add("sound-on");
      }
    }

    function togglePhoneAudio(e) {
      if (e) e.stopPropagation();
      if (!phoneVideo) return;
      phoneVideo.muted = !phoneVideo.muted;
      if (!phoneVideo.paused) {
        phoneVideo.play().catch(() => {});
      } else {
        phoneVideo.play().catch(() => {});
      }
      updateSoundUi();
    }

    if (phoneSoundBtn) {
      phoneSoundBtn.onclick = togglePhoneAudio;
    }

    const soundDisk = document.querySelector(".sound-disk-spin");
    if (soundDisk) {
      soundDisk.style.cursor = "pointer";
      soundDisk.onclick = togglePhoneAudio;
    }

    shortsGroup.innerHTML = "";
    if (details.shorts && details.shorts.length > 0) {
      details.shorts.forEach((shortFile, sIdx) => {
        const shortMeta = pub?.shorts?.[sIdx];
        const sViews = shortMeta?.views ? `${Number(shortMeta.views).toLocaleString()} views` : "";
        const sSchedule = shortMeta?.publish_at_display ? `🕒 ${shortMeta.publish_at_display}` : "48s Vertical 9:16 Video";

        const btn = document.createElement("div");
        btn.className = "short-select-btn" + (sIdx === 0 ? " active" : "");
        btn.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <h4 style="margin:0;">${shortFile.replace(".mp4", "").replace(/_/g, " ").toUpperCase()}</h4>
            ${sViews ? `<span style="background:rgba(52,211,153,0.15); color:#34d399; font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px;">${sViews}</span>` : ''}
          </div>
          <p style="margin:0; font-size:11px; color:#94a3b8;">${sSchedule}</p>
        `;
        btn.addEventListener("click", () => {
          document.querySelectorAll(".short-select-btn").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          phoneVideo.src = `/api/media/${topicId}/${shortFile}`;
          phoneVideo.play().catch(() => {});
          phoneTitle.textContent = `${title} #Shorts`;
          
          // Update phone screen likes/comments
          const phoneLikes = document.getElementById("phoneShortsLikes");
          const phoneComments = document.getElementById("phoneShortsComments");
          if (phoneLikes) phoneLikes.textContent = shortMeta?.likes ? Number(shortMeta.likes).toLocaleString() : "24.8K";
          if (phoneComments) phoneComments.textContent = shortMeta?.comments ? Number(shortMeta.comments).toLocaleString() : "842";
        });
        shortsGroup.appendChild(btn);
      });

      // Load first short
      phoneVideo.src = `/api/media/${topicId}/${details.shorts[0]}`;
      phoneTitle.textContent = `${title} #Shorts`;
      phoneVideo.play().catch(() => {});
      updateSoundUi();
    } else if (pub?.shorts && pub.shorts.length > 0) {
      // Shorts published to YouTube!
      pub.shorts.forEach((sMeta, sIdx) => {
        const sViews = sMeta?.views ? `${Number(sMeta.views).toLocaleString()} views` : "";
        const sSchedule = sMeta?.publish_at_display ? `🕒 ${sMeta.publish_at_display}` : "Live on YouTube #Shorts";
        const shortUrl = sMeta.url || `https://youtu.be/${sMeta.id}`;

        const btn = document.createElement("div");
        btn.className = "short-select-btn" + (sIdx === 0 ? " active" : "");
        btn.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <h4 style="margin:0;">Short #${sIdx + 1}: ${sMeta.title ? sMeta.title.slice(0, 36) : 'Companion Short'}...</h4>
            ${sViews ? `<span style="background:rgba(52,211,153,0.15); color:#34d399; font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px;">${sViews}</span>` : ''}
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
            <p style="margin:0; font-size:11px; color:#38bdf8;">${sSchedule}</p>
            <a href="${shortUrl}" target="_blank" style="font-size:11px; color:#ffe600; text-decoration:none; font-weight:600;">▶️ Watch Short ↗</a>
          </div>
        `;
        shortsGroup.appendChild(btn);
      });
      phoneTitle.textContent = `${title} #Shorts`;
    } else {
      phoneVideo.pause();
      phoneVideo.src = "";
      phoneTitle.textContent = "Rendering Shorts...";
      shortsGroup.innerHTML = '<p class="muted" style="padding:20px; text-align:center;">⏳ Vertical Shorts are being generated in the background...</p>';
    }

    // Thumbnails & A/B YouTube Feed Simulator
    const imgA = document.getElementById("thumbImgPrimary");
    const imgB = document.getElementById("thumbImgVariantB");
    const dlA = document.getElementById("thumbDownloadA");
    const dlB = document.getElementById("thumbDownloadB");
    const feedImgA = document.getElementById("arenaFeedImgA");
    const feedImgB = document.getElementById("arenaFeedImgB");
    const feedTitleA = document.getElementById("arenaFeedTitleA");
    const feedTitleB = document.getElementById("arenaFeedTitleB");

    const tStamp = Date.now();
    // Option A displays raw organic art; Option B displays 3D text overlay
    const rawImgUrl = details.has_thumbnail_raw ? `/api/media/${topicId}/thumbnail_raw.jpg?t=${tStamp}` : `/api/media/${topicId}/thumbnail_variant_a.jpg?t=${tStamp}`;
    if(imgA) {
      imgA.src = rawImgUrl;
      imgA.onerror = () => { imgA.src = `/api/media/${topicId}/thumbnail.jpg?t=${tStamp}`; };
    }
    if(imgB) imgB.src = `/api/media/${topicId}/thumbnail_variant_b.jpg?t=${tStamp}`;
    if(dlA) dlA.href = `/api/media/${topicId}/thumbnail.jpg`;
    if(dlB) dlB.href = `/api/media/${topicId}/thumbnail_variant_b.jpg`;

    if (feedImgA) {
      feedImgA.src = rawImgUrl;
      feedImgA.onerror = () => { feedImgA.src = `/api/media/${topicId}/thumbnail.jpg?t=${tStamp}`; };
    }
    if (feedImgB) feedImgB.src = `/api/media/${topicId}/thumbnail_variant_b.jpg?t=${tStamp}`;
    if (feedTitleA) feedTitleA.textContent = title;
    if (feedTitleB) feedTitleB.textContent = title;

    // Active Variant Badges & Switch Buttons
    const badgeA = document.getElementById("activeBadgeA");
    const badgeB = document.getElementById("activeBadgeB");
    const btnSetA = document.getElementById("btnSetActiveA");
    const btnSetB = document.getElementById("btnSetActiveB");
    const activeVar = (details.active_thumbnail_variant || "B").toUpperCase();

    if (badgeA) badgeA.style.display = activeVar === "A" ? "inline-block" : "none";
    if (badgeB) badgeB.style.display = activeVar === "B" ? "inline-block" : "none";

    const updateActiveThumbnail = async (variant) => {
      try {
        const res = await fetch(`/api/topics/${topicId}/set_thumbnail`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variant: variant.toLowerCase() })
        });
        const data = await res.json();
        if (data.status === "success") {
          details.active_thumbnail_variant = data.active_variant;
          if (badgeA) badgeA.style.display = data.active_variant === "A" ? "inline-block" : "none";
          if (badgeB) badgeB.style.display = data.active_variant === "B" ? "inline-block" : "none";
          alert(`✅ Active upload thumbnail successfully updated to Variant ${data.active_variant}!`);
        }
      } catch (err) {
        console.error("Error setting thumbnail:", err);
      }
    };

    if (btnSetA) btnSetA.onclick = () => updateActiveThumbnail("A");
    if (btnSetB) btnSetB.onclick = () => updateActiveThumbnail("B");

    // Title CTR Evaluator & Script Tab
    const titleCtrList = document.getElementById("titleCtrOptionsList");
    const topTitleCtrBadge = document.getElementById("topTitleCtrBadge");
    const scriptBox = document.getElementById("scriptInspectorContainer");

    if (details.script) {
      const topTitle = details.script.title_options?.[0] || details.title || "Psychology Deep Dive";
      const titleOptions = details.script.title_options && details.script.title_options.length > 0 
        ? details.script.title_options 
        : [topTitle];

      if (titleCtrList) {
        let maxCtr = 0;
        titleCtrList.innerHTML = titleOptions.map((optTitle, tIdx) => {
          const evalResult = evaluateTitleCTR(optTitle);
          if (evalResult.score > maxCtr) maxCtr = evalResult.score;
          return `
            <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
              <div style="flex: 1; min-width: 260px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                  <span style="font-size: 11px; font-weight: 700; color: #818cf8; background: rgba(99, 102, 241, 0.15); padding: 2px 8px; border-radius: 6px;">OPTION ${tIdx + 1}</span>
                  <span style="font-size: 11px; color: #94a3b8; font-family: 'JetBrains Mono', monospace;">${evalResult.length} chars ${evalResult.length <= 65 ? '✓ Mobile Safe' : '⚠️ Long'}</span>
                </div>
                <h4 style="font-size: 14px; font-weight: 700; color: #f8fafc; margin-bottom: 8px; line-height: 1.4;">${optTitle}</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                  ${evalResult.insights.map(i => `<span style="font-size: 10px; background: rgba(255,255,255,0.04); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.06); padding: 2px 7px; border-radius: 4px;">✦ ${i}</span>`).join("")}
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 14px;">
                <div style="text-align: right;">
                  <div style="font-size: 20px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: ${evalResult.score >= 85 ? '#34d399' : (evalResult.score >= 70 ? '#38bdf8' : '#fbbf24')};">
                    ${evalResult.score}%
                  </div>
                  <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">${evalResult.ratingLabel}</span>
                </div>
                <button class="btn btn-secondary btn-copy-opt-title" data-title="${encodeURIComponent(optTitle)}" style="font-size: 11px; padding: 6px 10px;" title="Copy this title">📋 Copy</button>
              </div>
            </div>
          `;
        }).join("");

        if (topTitleCtrBadge) {
          topTitleCtrBadge.textContent = `${maxCtr}% MAX VIRAL POTENTIAL`;
          topTitleCtrBadge.className = `badge-mini ${maxCtr >= 85 ? 'healthy' : 'warning'}`;
        }

        // Attach copy events
        document.querySelectorAll(".btn-copy-opt-title").forEach(btn => {
          btn.onclick = () => {
            const t = decodeURIComponent(btn.getAttribute("data-title"));
            navigator.clipboard.writeText(t);
            btn.textContent = "✓ Copied!";
            setTimeout(() => (btn.textContent = "📋 Copy"), 1500);
          };
        });
      }

      const premise = details.script.core_premise || "Deep breakdown exploring cognitive defense mechanisms and actionable psychological reframing.";
      let actsHtml = `<div class="script-meta-header" style="margin-bottom: 20px;">
        <h2 style="font-size: 20px; color: #fff; margin-bottom: 8px;">${topTitle}</h2>
        <p style="color: #94a3b8; font-size: 13px;">${premise}</p>
      </div>`;

      if (details.script.acts) {
        details.script.acts.forEach((act, aIdx) => {
          const actNameDisplay = act.act_name || `Act ${act.act_number || aIdx + 1}`;
          actsHtml += `
            <div class="act-card" style="background:#0e121a; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px; margin-bottom:16px;">
              <h3 style="color:#ffe600; font-size:15px; margin-bottom:12px;">Act ${act.act_number || aIdx + 1}: ${actNameDisplay}</h3>
              <div class="scenes-list" style="display:flex; flex-direction:column; gap:10px;">
                ${(act.scenes || []).map((scene) => `
                  <div class="scene-item" style="background:rgba(255,255,255,0.02); padding:10px 14px; border-radius:8px; border-left:3px solid #ffe600;">
                    <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748b; margin-bottom:4px;">
                      <span>SCENE ${scene.scene_number || 1} • ${scene.concept_label || "CONCEPT"}</span>
                    </div>
                    <p style="font-size:13px; color:#e2e8f0; line-height:1.5;">${scene.voiceover_text}</p>
                    <div style="font-size:11px; color:#94a3b8; margin-top:6px; font-style:italic;">🎨 Visual: ${scene.visual_sketch_prompt}</div>
                  </div>
                `).join("")}
              </div>
            </div>
          `;
        });
      }
      scriptBox.innerHTML = actsHtml;
    }

    // Publishing & Analytics Tab
    const viewsEl = document.getElementById("kpiViews");
    const likesEl = document.getElementById("kpiLikes");
    const commentsEl = document.getElementById("kpiComments");
    const privacyEl = document.getElementById("kpiPrivacy");
    const pubDetailsBody = document.getElementById("publishingDetailsBody");
    const directYtLink = document.getElementById("directYoutubeLink");
    const tagsContainer = document.getElementById("seoTagsContainer");
    const btnFlipPublic = document.getElementById("btnFlipPublic");

    if (btnFlipPublic) {
      btnFlipPublic.style.display = isPublic ? "none" : "inline-flex";
    }

    // Dynamic Prime Release Hub Schedule Grid
    const schedGrid = document.getElementById("primeReleaseScheduleGrid");
    if (schedGrid) {
      if (isPublic) {
        schedGrid.innerHTML = `
          <div style="background:rgba(16, 185, 129, 0.12); border:1px solid rgba(16, 185, 129, 0.35); border-radius:12px; padding:16px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
              <span style="font-size:11px; font-weight:700; color:#34d399; text-transform:uppercase;">🎬 Master 16:9 Video</span>
              <span style="background:rgba(16, 185, 129, 0.25); color:#34d399; font-size:10px; font-weight:700; padding:2px 8px; border-radius:12px;">LIVE PUBLIC</span>
            </div>
            <div style="font-size:15px; font-weight:700; color:#f8fafc; margin-bottom:2px;">Public & Indexed Worldwide</div>
            <div style="font-size:12px; color:#94a3b8;">Active on YouTube feeds and recommendations.</div>
          </div>
          <div style="background:rgba(56, 189, 248, 0.08); border:1px solid rgba(56, 189, 248, 0.25); border-radius:12px; padding:16px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
              <span style="font-size:11px; font-weight:700; color:#38bdf8; text-transform:uppercase;">📱 Companion Shorts</span>
              <span style="background:rgba(56, 189, 248, 0.2); color:#38bdf8; font-size:10px; font-weight:700; padding:2px 8px; border-radius:12px;">DAILY CADENCE</span>
            </div>
            <div style="font-size:15px; font-weight:700; color:#f8fafc; margin-bottom:2px;">Daily @ 11:30 AM EST (9:00 PM IST)</div>
            <div style="font-size:12px; color:#94a3b8;">Sequentially driving US mobile traffic to long-form.</div>
          </div>
        `;
      } else if (isScheduled) {
        schedGrid.innerHTML = `
          <div style="background:rgba(56, 189, 248, 0.1); border:1px solid rgba(56, 189, 248, 0.35); border-radius:12px; padding:16px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
              <span style="font-size:11px; font-weight:700; color:#38bdf8; text-transform:uppercase;">🎬 Master 16:9 Video</span>
              <span style="background:rgba(56, 189, 248, 0.25); color:#38bdf8; font-size:10px; font-weight:700; padding:2px 8px; border-radius:12px;">SCHEDULED</span>
            </div>
            <div style="font-size:14px; font-weight:700; color:#f8fafc; margin-bottom:2px;">${longform?.publish_at_display || pub?.scheduled_display}</div>
            <div style="font-size:12px; color:#94a3b8;">US Prime Time Auto-Publish</div>
          </div>
          <div style="background:rgba(255, 230, 0, 0.08); border:1px solid rgba(255, 230, 0, 0.25); border-radius:12px; padding:16px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
              <span style="font-size:11px; font-weight:700; color:#ffe600; text-transform:uppercase;">📱 Daily Shorts Cadence</span>
              <span style="background:rgba(255, 230, 0, 0.2); color:#ffe600; font-size:10px; font-weight:700; padding:2px 8px; border-radius:12px;">SCHEDULED</span>
            </div>
            <div style="font-size:14px; font-weight:700; color:#f8fafc; margin-bottom:2px;">Daily @ 11:30 AM EST (9:00 PM IST)</div>
            <div style="font-size:12px; color:#94a3b8;">Automated daily drops on cloud servers.</div>
          </div>
        `;
      } else {
        schedGrid.innerHTML = `
          <div style="background:rgba(255, 255, 255, 0.04); border:1px solid rgba(255, 255, 255, 0.1); border-radius:12px; padding:16px;">
            <div style="font-size:11px; font-weight:700; color:#ffe600; text-transform:uppercase; margin-bottom:4px;">🎬 Local Video Ready</div>
            <div style="font-size:13px; color:#f8fafc;">Click 'Smart Schedule to Cloud' below to automatically book the next open US prime slot.</div>
          </div>
        `;
      }
    }

    // Calculate Total Ecosystem Reach (Master + Shorts)
    let shortsViewsTotal = 0;
    if (pub?.shorts && Array.isArray(pub.shorts)) {
      pub.shorts.forEach(s => {
        shortsViewsTotal += Number(s.views || 0);
      });
    }
    const masterViews = Number(details.live_stats?.views || longform?.views || 0);
    const totalEcosystemViews = masterViews + shortsViewsTotal;

    const reachEl = document.getElementById("kpiTotalReach");
    if (reachEl) {
      if (isPublic) {
        reachEl.textContent = totalEcosystemViews.toLocaleString();
      } else if (isScheduled) {
        reachEl.textContent = "0 (Scheduled)";
      } else {
        reachEl.textContent = "--";
      }
    }

    if (details.live_stats) {
      viewsEl.textContent = Number(details.live_stats.views || 0).toLocaleString();
      likesEl.textContent = Number(details.live_stats.likes || 0).toLocaleString();
      commentsEl.textContent = Number(details.live_stats.comments || 0).toLocaleString();
      privacyEl.textContent = isPublic ? "PUBLIC 🚀" : (details.live_stats.privacy || "scheduled").toUpperCase();
    } else if (isPublic) {
      viewsEl.textContent = Number(longform?.views || 0).toLocaleString();
      likesEl.textContent = Number(longform?.likes || 0).toLocaleString();
      commentsEl.textContent = Number(longform?.comments || 0).toLocaleString();
      privacyEl.textContent = "PUBLIC 🚀";
    } else if (isScheduled) {
      viewsEl.textContent = "0 (Cloud Scheduled)";
      likesEl.textContent = "0";
      commentsEl.textContent = "0";
      privacyEl.textContent = "SCHEDULED 🕒";
    } else if (isLive) {
      viewsEl.textContent = "0 (Uploaded)";
      likesEl.textContent = "0";
      commentsEl.textContent = "0";
      privacyEl.textContent = (longform?.status || "private").toUpperCase();
    } else {
      viewsEl.textContent = "--";
      likesEl.textContent = "--";
      commentsEl.textContent = "--";
      privacyEl.textContent = "LOCAL READY";
    }

    // Render Dedicated YouTube Shorts Live Analytics & Funnel Velocity Matrix
    const shortsMatrixGrid = document.getElementById("shortsAnalyticsMatrixGrid");
    if (shortsMatrixGrid) {
      shortsMatrixGrid.innerHTML = "";
      if (pub?.shorts && pub.shorts.length > 0) {
        pub.shorts.forEach((s, idx) => {
          const sViews = Number(s.views || 0);
          const sLikes = Number(s.likes || 0);
          const sComments = Number(s.comments || 0);
          const isShortLive = (s.status === "public" || s.publish_at_display === "Live (Public)");
          
          let displayDate = s.publish_at_display || "Scheduled";
          if (displayDate.includes("T") && displayDate.includes("Z")) {
            try {
              const dt = new Date(displayDate);
              if (!isNaN(dt.getTime())) {
                displayDate = dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
              }
            } catch(e) {}
          }

          const card = document.createElement("div");
          card.className = "short-analytics-card";
          card.style.cssText = "background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.2s ease;";
          card.innerHTML = `
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                <span style="font-size:11px; font-weight:700; color:#38bdf8; text-transform:uppercase; background:rgba(56,189,248,0.12); padding:2px 8px; border-radius:6px;">SHORT #${idx + 1}</span>
                <span style="font-size:10px; font-weight:700; padding:2px 8px; border-radius:12px; ${isShortLive ? 'background:rgba(16,185,129,0.2); color:#34d399;' : 'background:rgba(251,191,36,0.15); color:#fbbf24;'}">
                  ${isShortLive ? '● LIVE PUBLIC' : '🕒 ' + displayDate}
                </span>
              </div>
              <h4 style="font-size:13px; font-weight:600; color:#f8fafc; line-height:1.4; margin-bottom:12px;">${s.title || `Companion Short #${idx+1}`}</h4>
              
              <!-- 3-Column Metrics Row -->
              <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; background:rgba(0,0,0,0.3); border-radius:8px; padding:10px; margin-bottom:12px; text-align:center;">
                <div>
                  <div style="font-size:10px; color:#94a3b8; margin-bottom:2px;">VIEWS</div>
                  <div style="font-size:15px; font-weight:700; color:#38bdf8;">${sViews > 0 ? sViews.toLocaleString() : (isShortLive ? '0' : '--')}</div>
                </div>
                <div>
                  <div style="font-size:10px; color:#94a3b8; margin-bottom:2px;">LIKES</div>
                  <div style="font-size:15px; font-weight:700; color:#fbbf24;">${sLikes > 0 ? sLikes.toLocaleString() : (isShortLive ? '0' : '--')}</div>
                </div>
                <div>
                  <div style="font-size:10px; color:#94a3b8; margin-bottom:2px;">COMMENTS</div>
                  <div style="font-size:15px; font-weight:700; color:#a5b4fc;">${sComments > 0 ? sComments.toLocaleString() : (isShortLive ? '0' : '--')}</div>
                </div>
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.06); padding-top:10px;">
              <span style="font-size:11px; color:#64748b;">ID: <code style="color:#94a3b8;">${s.id}</code></span>
              <a href="${s.url}" target="_blank" class="btn btn-sm" style="background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.3); font-size:11px; font-weight:600; padding:4px 10px; border-radius:6px; text-decoration:none;">
                Watch on YouTube ↗
              </a>
            </div>
          `;
          shortsMatrixGrid.appendChild(card);
        });
      } else if (details.shorts && details.shorts.length > 0) {
        details.shorts.forEach((sFile, idx) => {
          const card = document.createElement("div");
          card.style.cssText = "background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px;";
          card.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
              <span style="font-size:11px; font-weight:700; color:#fbbf24;">LOCAL SHORT #${idx + 1}</span>
              <span style="font-size:10px; background:rgba(255,255,255,0.1); color:#94a3b8; padding:2px 8px; border-radius:12px;">READY TO SCHEDULE</span>
            </div>
            <h4 style="font-size:13px; color:#f8fafc; margin-bottom:8px;">${sFile.replace(".mp4","").replace(/_/g," ").toUpperCase()}</h4>
            <p style="font-size:11px; color:#94a3b8;">Click 'Smart Schedule to Cloud' to upload and track live analytics.</p>
          `;
          shortsMatrixGrid.appendChild(card);
        });
      } else {
        shortsMatrixGrid.innerHTML = '<p class="muted" style="padding:20px; text-align:center;">⏳ No Shorts available yet for this video package.</p>';
      }
    }

    if (isLive && longform.url) {
      directYtLink.style.display = "inline-flex";
      directYtLink.href = longform.url;

      pubDetailsBody.innerHTML = `
        <p><strong>Master Video Title:</strong> ${longform.title || title}</p>
        <p style="margin-top:4px;"><strong>YouTube Video ID:</strong> <code>${longform.id}</code></p>
        ${longform.publish_at_display || pub.scheduled_display ? `<p style="margin-top:4px; color:#38bdf8; font-weight:600;">🕒 YouTube Cloud Scheduled For: ${longform.publish_at_display || pub.scheduled_display}</p>` : ''}
        <p style="margin-top:4px;"><strong>Direct URL:</strong> <a href="${longform.url}" target="_blank" style="color:#ffe600; text-decoration:underline;">${longform.url}</a></p>
      `;
    } else {
      directYtLink.style.display = "none";
      pubDetailsBody.innerHTML = `
        <div style="background:rgba(255,230,0,0.06); border:1px solid rgba(255,230,0,0.25); border-radius:12px; padding:18px; margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div>
              <h4 style="font-size:14px; color:#ffe600; font-weight:700; margin-bottom:4px;">✨ Package Ready for Smart Cloud Scheduling</h4>
              <p style="font-size:12px; color:#94a3b8; line-height:1.4;">Automatically analyzes all previous videos and schedules this package into the next open US prime-time slot with Daily Shorts.</p>
            </div>
            <button class="btn btn-primary" id="btnSmartScheduleNow" style="background:linear-gradient(135deg, #eab308, #ca8a04); color:#000; font-weight:700; padding:10px 18px; border-radius:8px; border:none; cursor:pointer; display:flex; align-items:center; gap:8px;">
              <span>📅</span> Smart Schedule to Cloud
            </button>
          </div>
        </div>
        <p><strong>Status:</strong> Video rendered locally & ready for YouTube upload.</p>
      `;

      const btnSched = document.getElementById("btnSmartScheduleNow");
      if (btnSched) {
        btnSched.onclick = async () => {
          btnSched.disabled = true;
          btnSched.innerHTML = "<span>⏳</span> Finding open slot & uploading...";
          try {
            const resp = await fetch("/api/schedule_package", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ topic_id: topicId, dry_run: false })
            });
            const resData = await resp.json();
            if (resData.status === "success") {
              alert(`🎉 Successfully scheduled on YouTube Cloud!\nMaster Video: ${resData.results?.scheduled_display || "Scheduled"}`);
              loadTopicDetails(topicId);
            } else {
              alert(`❌ Error: ${resData.detail || resData.message || "Failed to schedule"}`);
              btnSched.disabled = false;
              btnSched.innerHTML = "<span>📅</span> Smart Schedule to Cloud";
            }
          } catch (err) {
            alert(`❌ Error: ${err.message}`);
            btnSched.disabled = false;
            btnSched.innerHTML = "<span>📅</span> Smart Schedule to Cloud";
          }
        };
      }
    }

    // Tags Cloud & Live 500-Character Capacity Gauge
    tagsContainer.innerHTML = "";
    const tagsList = details.tags || ["SchemaStudio", "psychology", "mental health", "mindset", "behavioral science", "introspection"];
    
    // Compute exact quote-aware YouTube character length
    const totalChars = tagsList.reduce((acc, t) => acc + t.length + (t.includes(" ") ? 2 : 0), 0) + (tagsList.length > 0 ? tagsList.length - 1 : 0);
    const capacityPct = Math.min(Math.round((totalChars / 500) * 100), 100);

    const tagCountDisplay = document.getElementById("tagCountDisplay");
    const tagCharCountDisplay = document.getElementById("tagCharCountDisplay");
    const tagCapacityBadge = document.getElementById("tagCapacityBadge");
    const tagCapacityBarFill = document.getElementById("tagCapacityBarFill");

    if (tagCountDisplay) tagCountDisplay.textContent = `${tagsList.length} Tags Active`;
    if (tagCharCountDisplay) {
      tagCharCountDisplay.textContent = `${totalChars} / 500 Chars (${capacityPct}% Capacity)`;
      tagCharCountDisplay.style.color = capacityPct >= 90 ? "#34d399" : (capacityPct >= 70 ? "#38bdf8" : "#fbbf24");
    }
    if (tagCapacityBadge) {
      tagCapacityBadge.textContent = `${totalChars} / 500 Chars`;
      tagCapacityBadge.className = `badge-mini ${capacityPct >= 90 ? 'healthy' : 'warning'}`;
    }
    if (tagCapacityBarFill) {
      tagCapacityBarFill.style.width = `${capacityPct}%`;
      tagCapacityBarFill.style.background = capacityPct >= 90 
        ? "linear-gradient(90deg, #10b981 0%, #34d399 100%)" 
        : "linear-gradient(90deg, #38bdf8 0%, #fbbf24 100%)";
    }

    tagsList.forEach((tag) => {
      const tagChip = document.createElement("span");
      tagChip.className = "tag-chip";
      tagChip.textContent = `#${tag}`;
      tagChip.addEventListener("click", () => {
        navigator.clipboard.writeText(tag);
        tagChip.style.borderColor = "#ffe600";
        setTimeout(() => (tagChip.style.borderColor = ""), 1000);
      });
      tagsContainer.appendChild(tagChip);
    });

    const btnCopyTags = document.getElementById("copyTagsBtn");
    if (btnCopyTags) {
      btnCopyTags.onclick = () => {
        navigator.clipboard.writeText(tagsList.join(", "));
        alert("✅ All " + tagsList.length + " tags (" + totalChars + " chars) copied to clipboard!");
      };
    }

    // 1-Click "⚡ Maximize Tags to 500" Handler
    const btnMaxTags = document.getElementById("btnMaximizeTagsNow");
    if (btnMaxTags) {
      btnMaxTags.onclick = async () => {
        btnMaxTags.textContent = "⚡ Maximizing...";
        btnMaxTags.disabled = true;
        try {
          const res = await fetch("/api/youtube/maximize_tags", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              topic: topicId,
              video_id: longform?.id || details.publishing?.longform?.id || null
            })
          });
          const data = await res.json();
          if (res.ok && data.status === "success") {
            alert(`🎉 Success! Packed ${data.tag_count} tags (${data.char_count} / 500 chars)${data.updated_youtube ? " & updated live on YouTube!" : "!"}`);
            loadTopicDetails(topicId);
          } else {
            const errMsg = data.message || data.detail || (typeof data === "string" ? data : "Unknown server error");
            alert("⚠️ Tag maximization error: " + errMsg);
          }
        } catch (err) {
          alert("Network error: " + (err.message || err));
        } finally {
          btnMaxTags.textContent = "⚡ Maximize Tags to 500";
          btnMaxTags.disabled = false;
        }
      };
    }

    // 1-Click Make Public Button
    if (btnFlipPublic) {
      if (isLive && (details.live_stats?.privacy !== "public" && longform?.status !== "public")) {
        btnFlipPublic.style.display = "inline-flex";
        btnFlipPublic.textContent = "📢 Make Video Public Now";
        btnFlipPublic.disabled = false;
        btnFlipPublic.onclick = async () => {
          if (confirm("Are you sure you want to make this video PUBLIC on YouTube now?")) {
            try {
              btnFlipPublic.textContent = "⏳ Updating on YouTube...";
              btnFlipPublic.disabled = true;
              const vid = longform?.id || details?.publishing?.longform?.id || details?.live_stats?.video_id;
              if (!vid) {
                alert("❌ Could not determine YouTube video ID for this package.");
                return;
              }
              const r = await fetch("/api/update_privacy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  topic_id: topicId,
                  video_id: vid,
                  privacy_status: "public"
                })
              });
              const res = await r.json();
              if (r.ok) {
                alert("🎉 Success! Video is now PUBLIC on YouTube!");
                loadTopicDetails(topicId);
              } else {
                alert("Error updating privacy: " + (res.detail || "Unknown error"));
              }
            } catch (err) {
              alert("Network error: " + err.message);
            } finally {
              btnFlipPublic.textContent = "📢 Make Video Public Now";
              btnFlipPublic.disabled = false;
            }
          }
        };
      } else if (isLive && (details.live_stats?.privacy === "public" || longform?.status === "public")) {
        btnFlipPublic.style.display = "inline-flex";
        btnFlipPublic.textContent = "✅ Currently Public";
        btnFlipPublic.style.background = "#059669";
        btnFlipPublic.disabled = true;
      } else {
        btnFlipPublic.style.display = "none";
      }
    }

    // Pinned Engagement Comment
    const pinnedBox = document.getElementById("pinnedCommentDisplayBox");
    const defaultComment = "🧠 Which part of this psychological breakdown resonated most with your personal experience? Let's discuss in the comments below. 🤍";
    const commentText = details.pinned_comment || defaultComment;
    if (pinnedBox) {
      pinnedBox.textContent = commentText;
    }
    const copyPinnedBtn = document.getElementById("copyPinnedCommentBtn");
    if (copyPinnedBtn) {
      copyPinnedBtn.onclick = () => {
        navigator.clipboard.writeText(commentText);
        alert("✅ Algorithmic Pinned Comment copied to clipboard!");
      };
    }

    // YouTube Community Tab Growth Engine
    const commCardImg = document.getElementById("communityQuoteCardImg");
    const commDownloadBtn = document.getElementById("downloadCommunityQuoteBtn");
    const commQuestion = document.getElementById("communityPollQuestion");
    const commOptionsList = document.getElementById("communityPollOptionsList");
    const commQuote = document.getElementById("communityReflectiveQuote");
    const copyCommBtn = document.getElementById("copyCommunityPollBtn");

    const commData = details.community_post || {};
    const pollQ = commData.poll_question || `When thinking about this topic, what is your biggest internal challenge?`;
    const pollOpts = commData.poll_options || [
      "I struggle with this daily",
      "I've made progress but still relapse",
      "I only noticed it recently",
      "I've learned to overcome it"
    ];
    const quoteTxt = commData.reflective_quote || "The first step to unlearning an invisible habit is noticing the moment it takes over your peace.";

    if (commQuestion) commQuestion.textContent = pollQ;
    if (commQuote) commQuote.textContent = `"${quoteTxt}"`;
    if (commOptionsList) {
      commOptionsList.innerHTML = pollOpts.map((opt, oIdx) => `
        <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); padding:8px 12px; border-radius:6px; font-size:12px; color:#e2e8f0; display:flex; align-items:center; gap:8px;">
          <span style="color:#fbbf24; font-weight:700;">${String.fromCharCode(65 + oIdx)}.</span> ${opt}
        </div>
      `).join("");
    }

    if (commCardImg) {
      commCardImg.src = `/api/media/${topicId}/community_quote_card.jpg?t=${Date.now()}`;
    }
    if (commDownloadBtn) {
      commDownloadBtn.href = `/api/media/${topicId}/community_quote_card.jpg`;
    }

    if (copyCommBtn) {
      copyCommBtn.onclick = () => {
        const textToCopy = `${pollQ}\n\n${pollOpts.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join("\n")}\n\n"${quoteTxt}"\n— @SchemaStudio`;
        navigator.clipboard.writeText(textToCopy);
        alert("✅ Community Poll & Quote copied to clipboard! Paste directly into YouTube Community Tab.");
      };
    }

    const copyPromptBtn = document.getElementById("copyPromptBlueprintBtn");
    if (copyPromptBtn) {
      copyPromptBtn.onclick = () => {
        const text = document.getElementById("fluxPromptBlueprint").textContent;
        navigator.clipboard.writeText(text);
        alert("✅ FLUX prompt blueprint copied to clipboard!");
      };
    }
  } catch (err) {
    console.error("Error loading topic details:", err);
  }
}

// ============================================================
// AUTOPILOT & CRON AUTOMATION CONTROLLER
// ============================================================
function initAutopilot() {
  const openAutopilotBtn = document.getElementById("openAutopilotTabBtn");
  const runAutopilotBtn = document.getElementById("runAutopilotNowBtn");
  const saveCronBtn = document.getElementById("saveCronConfigBtn");
  const cronToggle = document.getElementById("cronToggleCheckbox");
  const cronToggleLabel = document.getElementById("cronToggleLabel");
  const cronIntervalSelect = document.getElementById("cronIntervalSelect");
  const durationSelect = document.getElementById("autopilotDurationSelect");
  const publishSelect = document.getElementById("autopilotPublishSelect");
  const statusBadge = document.getElementById("autopilotStatusBadge");
  const nextRunText = document.getElementById("cronNextRunText");
  const lastRunText = document.getElementById("cronLastRunText");

  if (openAutopilotBtn) {
    openAutopilotBtn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach((p) => p.classList.remove("active"));
      const targetTab = document.querySelector('[data-tab="autopilotTab"]');
      if (targetTab) targetTab.classList.add("active");
      const pane = document.getElementById("tab-autopilotTab");
      if (pane) pane.classList.add("active");
    });
  }

  // Load existing Autopilot config
  async function loadConfig() {
    try {
      const res = await fetch("/api/autopilot/config");
      const cfg = await res.json();
      if (cfg) {
        cronToggle.checked = !!cfg.enabled;
        cronToggleLabel.textContent = cfg.enabled ? "Cron ACTIVE 🟢" : "Cron Disabled ⚪";
        cronToggleLabel.style.color = cfg.enabled ? "#34d399" : "#94a3b8";
        if (cfg.interval) cronIntervalSelect.value = cfg.interval;
        if (cfg.minutes) durationSelect.value = cfg.minutes;
        if (statusBadge) statusBadge.textContent = cfg.enabled ? "Mode: Recurring Cron Active" : "Mode: Manual Ready";
        if (cfg.next_run) {
          nextRunText.textContent = new Date(cfg.next_run).toLocaleString();
          nextRunText.style.color = "#34d399";
        } else {
          nextRunText.textContent = "Not Scheduled (Toggle Cron ON to activate)";
          nextRunText.style.color = "#94a3b8";
        }
        if (cfg.last_run) {
          lastRunText.textContent = new Date(cfg.last_run).toLocaleString();
        }
      }
    } catch (e) {
      console.error("Error loading autopilot config:", e);
    }
  }

  if (cronToggle) {
    cronToggle.addEventListener("change", () => {
      if (cronToggleLabel) {
        cronToggleLabel.textContent = cronToggle.checked ? "Cron ACTIVE 🟢" : "Cron Disabled ⚪";
        cronToggleLabel.style.color = cronToggle.checked ? "#34d399" : "#94a3b8";
      }
    });
  }

  // Save Cron config
  if (saveCronBtn) {
    saveCronBtn.addEventListener("click", async () => {
      saveCronBtn.textContent = "⏳ Saving...";
      try {
        const payload = {
          enabled: cronToggle ? cronToggle.checked : false,
          mode: (cronToggle && cronToggle.checked) ? "cron" : "manual",
          interval: cronIntervalSelect ? cronIntervalSelect.value : "weekly_sunday",
          minutes: durationSelect ? (parseInt(durationSelect.value) || 10) : 10,
          publish: publishSelect ? (publishSelect.value !== "render_only") : true,
          privacy: (publishSelect && publishSelect.value === "unlisted") ? "unlisted" : "private"
        };

        const res = await fetch("/api/autopilot/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          alert("✅ Autopilot configuration saved successfully!");
          loadConfig();
        } else {
          alert("Error saving config: " + (data.detail || "Unknown error"));
        }
      } catch (err) {
        alert("Network error: " + err.message);
      } finally {
        saveCronBtn.textContent = "💾 Save & Apply Cron Schedule";
      }
    });
  }

  // 1-Click Run Autopilot Now with Pre-Flight Diagnostics
  if (runAutopilotBtn) {
    runAutopilotBtn.addEventListener("click", async () => {
      const executeAutopilot = async () => {
        runAutopilotBtn.disabled = true;
        runAutopilotBtn.textContent = "⏳ Launching Autopilot...";

        try {
          const payload = {
            minutes: durationSelect ? (parseInt(durationSelect.value) || 10) : 10,
            publish: publishSelect ? (publishSelect.value !== "render_only") : true,
            privacy: (publishSelect && publishSelect.value === "unlisted") ? "unlisted" : "private",
            dry_run: false
          };

          const res = await fetch("/api/autopilot/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const data = await res.json();

          if (res.ok) {
            // Switch to Live Studio tab to see real-time terminal output
            document.querySelectorAll(".tab-btn").forEach((t) => t.classList.remove("active"));
            document.querySelectorAll(".tab-pane").forEach((p) => p.classList.remove("active"));
            const liveTab = document.querySelector('[data-tab="liveStudio"]');
            if (liveTab) liveTab.classList.add("active");
            const livePane = document.getElementById("tab-liveStudio");
            if (livePane) livePane.classList.add("active");
          } else {
            alert("Could not start autopilot: " + (data.detail || "Unknown error"));
          }
        } catch (err) {
          alert("Network error: " + err.message);
        } finally {
          runAutopilotBtn.disabled = false;
          runAutopilotBtn.textContent = "🚀 Launch 1-Click Autonomous Production";
        }
      };

      // Run pre-flight check first
      runAutopilotBtn.disabled = true;
      runAutopilotBtn.textContent = "🩺 Checking Resources...";
      await checkPreflightDiagnostics(executeAutopilot);
      runAutopilotBtn.disabled = false;
      runAutopilotBtn.textContent = "🚀 Launch 1-Click Autonomous Production";
    });
  }

  // Load Autopilot History
  async function loadHistory() {
    try {
      const res = await fetch("/api/autopilot/history");
      const list = await res.json();
      const container = document.getElementById("autopilotHistoryContainer");
      const countBadge = document.getElementById("autopilotHistoryCount");

      if (list && list.length > 0) {
        if (countBadge) countBadge.textContent = `${list.length} Executions`;
        container.innerHTML = list.map((item) => `
          <div class="history-item">
            <div class="history-title">✨ ${item.topic_title}</div>
            <div style="font-size: 12px; color: #a5b4fc; margin-bottom: 6px;">🧬 ${item.concept || "Introspective Psychology"}</div>
            <div class="history-meta">
              <span>📅 ${new Date(item.timestamp).toLocaleDateString()}</span>
              <span>📱 ${item.shorts_count || 0} Shorts</span>
              ${item.youtube_video_id ? `<a href="https://youtu.be/${item.youtube_video_id}" target="_blank" style="color:#38bdf8; font-weight:600;">YouTube ↗</a>` : `<span style="color:#f59e0b;">Local Render</span>`}
            </div>
          </div>
        `).reverse().join("");
      }
    } catch (e) {
      console.error("Error loading autopilot history:", e);
    }
  }

  loadConfig();
  loadHistory();
}

// ============================================================
// PRE-FLIGHT RESOURCE & DIAGNOSTICS CONTROLLER
// ============================================================
async function checkPreflightDiagnostics(onProceedCallback) {
  const modal = document.getElementById("preflightModal");
  const container = document.getElementById("preflightIssuesContainer");
  const btnProceed = document.getElementById("btnProceedPreflightAnyway");
  const btnCancel = document.getElementById("btnCancelPreflight");
  const btnClose = document.getElementById("btnClosePreflightModal");
  const backdrop = document.getElementById("preflightBackdrop");

  const closeModal = () => {
    if (modal) modal.classList.remove("active");
  };

  if (btnCancel) btnCancel.onclick = closeModal;
  if (btnClose) btnClose.onclick = closeModal;
  if (backdrop) backdrop.onclick = closeModal;

  try {
    const res = await fetch("/api/system/preflight");
    const json = await res.json();
    const report = json.report;

    if (!report) {
      if (onProceedCallback) onProceedCallback();
      return;
    }

    const problemChecks = (report.checks || []).filter(c => c.status === "broken" || c.status === "warning");

    if (problemChecks.length === 0) {
      // All 100% operational, proceed directly
      if (onProceedCallback) onProceedCallback();
      return;
    }

    // Has issues - render diagnostic cards into modal
    if (container) {
      container.innerHTML = problemChecks.map(c => `
        <div class="preflight-issue-card ${c.status}">
          <div class="preflight-issue-header">
            <span class="preflight-issue-title">${c.status === "broken" ? "❌" : "⚠️"} ${c.service}</span>
            <span class="badge-mini ${c.status === "broken" ? "exhausted" : "warning"}">${c.status.toUpperCase()}</span>
          </div>
          <div class="preflight-issue-msg">${c.message}</div>
          ${c.solution ? `<div class="preflight-solution-box"><strong>💡 How to Fix:</strong><br>${c.solution.replace(/\n/g, "<br>")}</div>` : ""}
          ${c.fallback ? `<div class="preflight-fallback-tag"><span>🛡️</span> Automated Fallback Ready: <strong>${c.fallback}</strong></div>` : ""}
        </div>
      `).join("");
    }

    if (modal) modal.classList.add("active");

    if (btnProceed) {
      btnProceed.onclick = () => {
        closeModal();
        if (onProceedCallback) onProceedCallback();
      };
    }
  } catch (err) {
    console.error("Preflight check failed:", err);
    if (onProceedCallback) onProceedCallback();
  }
}

// ============================================================
// API CREDITS & KEY HEALTH MONITOR CONTROLLER
// ============================================================
function initApiHealthMonitor() {
  const btnTrigger = document.getElementById("btnApiCreditsFloating");
  const btnHeaderTrigger = document.getElementById("btnOpenApiCreditsHeader");
  const btnWindowTrigger = document.getElementById("btnOpenApiCreditsWindow");

  const openCreditsPopout = (e) => {
    if (e) e.preventDefault();
    window.open('/credits', 'ApiCreditsWindow', 'width=980,height=820,menubar=no,toolbar=no,status=no,resizable=yes');
  };

  if (btnTrigger) btnTrigger.onclick = openCreditsPopout;
  if (btnHeaderTrigger) btnHeaderTrigger.onclick = openCreditsPopout;
  if (btnWindowTrigger) btnWindowTrigger.onclick = openCreditsPopout;

  // Initial check on load to update background telemetry badges
  fetchApiHealth();
}

async function fetchApiHealth() {
  const dot = document.getElementById("capsuleStatusDot");
  const alertsContainer = document.getElementById("apiHealthAlertsContainer");
  const elGrid = document.getElementById("elevenLabsKeysGrid");
  const poolBadge = document.getElementById("elevenLabsPoolSummary");
  const infraGrid = document.getElementById("infraHealthGrid");

  try {
    const res = await fetch("/api/system/keys_health");
    const data = await res.json();

    // 1. Update Capsule Status Dot
    if (dot) {
      dot.className = `capsule-status-dot ${data.overall_status}`;
    }

    // 2. Render Replacement Alerts
    if (alertsContainer) {
      if (data.replacement_alerts && data.replacement_alerts.length > 0) {
        alertsContainer.innerHTML = data.replacement_alerts.map(a => `
          <div class="alert-item-box">
            <span>⚠️</span>
            <span>${a}</span>
          </div>
        `).join("");
      } else {
        alertsContainer.innerHTML = `
          <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.35); color: #6ee7b7; border-radius: 8px; padding: 10px 14px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
            <span>✅</span>
            <span>All production APIs and voice keys are healthy and operational.</span>
          </div>
        `;
      }
    }

    // 3. Render ElevenLabs Pool
    if (elGrid && data.elevenlabs) {
      const totalRemaining = data.elevenlabs.reduce((acc, k) => acc + (k.remaining || 0), 0);
      const totalLimit = data.elevenlabs.reduce((acc, k) => acc + (k.limit || 0), 0);
      
      if (poolBadge) {
        poolBadge.textContent = `${totalRemaining.toLocaleString()} / ${totalLimit.toLocaleString()} chars available (${data.elevenlabs.length} Keys in Pool)`;
        poolBadge.className = `badge-mini ${data.overall_status}`;
      }

      const headerBadge = document.getElementById("headerCreditsBadge");
      if (headerBadge) {
        headerBadge.textContent = `${totalRemaining.toLocaleString()} chars`;
        headerBadge.className = `badge-mini ${data.overall_status}`;
      }

      elGrid.innerHTML = data.elevenlabs.map(k => {
        let fillClass = "healthy";
        let statusBadge = `<span class="badge-mini healthy">🟢 ACTIVE</span>`;
        
        if (k.status === "exhausted" || k.remaining === 0) {
          fillClass = "critical";
          statusBadge = `<span class="badge-mini critical">🔴 EXHAUSTED - REPLACE</span>`;
        } else if (k.status === "low" || k.percent_remaining < 20) {
          fillClass = "warning";
          statusBadge = `<span class="badge-mini warning">🟡 LOW (${k.percent_remaining}%)</span>`;
        }

        return `
          <div class="key-health-card ${k.status}">
            <div class="key-header-row">
              <div class="key-name-wrap">
                <span class="key-badge-num">KEY #${k.index}</span>
                <span class="key-code-mask">${k.masked_key}</span>
                <span style="font-size: 11px; color: #64748b;">• ${k.tier}</span>
              </div>
              <div>${statusBadge}</div>
            </div>
            
            <div class="quota-bar-wrap">
              <div class="quota-bar-fill ${fillClass}" style="width: ${Math.max(k.percent_remaining, 3)}%;"></div>
            </div>

            <div class="quota-stats-row">
              <span>Remaining: <strong style="color: #fff;">${k.remaining.toLocaleString()}</strong> / ${k.limit.toLocaleString()} chars</span>
              <span>Used: ${k.used.toLocaleString()} ${k.next_reset ? `• Resets ${k.next_reset}` : ""}</span>
            </div>
          </div>
        `;
      }).join("");
    }

    // 4. Render Other Core Infrastructure
    if (infraGrid) {
      infraGrid.innerHTML = `
        <!-- Tavily AI Search -->
        <div class="infra-card">
          <div class="infra-header">
            <span class="infra-name">🔍 Tavily AI Research</span>
            <span class="badge-mini healthy">🟢 ACTIVE</span>
          </div>
          <p class="infra-detail">
            Key: <code style="color: #38bdf8;">${data.tavily?.masked_key || "Configured"}</code><br>
            Tier: ${data.tavily?.tier || "1,000 Searches / mo"}<br>
            Capability: Real-time psychological trends discovery
          </p>
        </div>

        <!-- Microsoft Edge-TTS Sanctuary Engine -->
        <div class="infra-card">
          <div class="infra-header">
            <span class="infra-name">🎙️ Andrew Sanctuary Voice</span>
            <span class="badge-mini healthy">🟢 UNLIMITED</span>
          </div>
          <p class="infra-detail">
            Voice: <code style="color: #38bdf8;">${data.edge_tts?.voice || "AndrewMultilingualNeural"}</code><br>
            Cost: 100% Free & Unlimited (Zero Tokens)<br>
            Tone: Meditative Calm (-10% Pace, -3Hz Warmth)
          </p>
        </div>

        <!-- Gemini 2.5 Flash -->
        <div class="infra-card">
          <div class="infra-header">
            <span class="infra-name">🧠 Gemini 2.5 Flash</span>
            <span class="badge-mini healthy">🟢 ACTIVE</span>
          </div>
          <p class="infra-detail">
            Model: <code style="color: #fbbf24;">gemini-2.5-flash</code><br>
            Capacity: 1,500 free requests / day<br>
            Failover: Groq LLaMA-3.3 70B enabled
          </p>
        </div>

        <!-- YouTube Cloud API -->
        <div class="infra-card">
          <div class="infra-header">
            <span class="infra-name">🚀 YouTube Cloud Publisher</span>
            <span class="badge-mini ${data.youtube?.authenticated ? "healthy" : "warning"}">
              ${data.youtube?.authenticated ? "🟢 CONNECTED" : "⚠️ AUTH NEEDED"}
            </span>
          </div>
          <p class="infra-detail">
            Daily Quota: ${data.youtube?.daily_limit || "10,000 units / day"}<br>
            Features: Direct 4K uploads, shorts & cloud scheduling
          </p>
        </div>
      `;
    }
  } catch (e) {
    console.error("Error fetching API keys health:", e);
    if (dot) dot.className = "capsule-status-dot critical";
  }
}


// Sync Comments Quick Action Handler
const btnSyncComments = document.getElementById("btnSyncComments");
if (btnSyncComments) {
  btnSyncComments.addEventListener("click", async () => {
    btnSyncComments.disabled = true;
    btnSyncComments.innerHTML = '<span class="btn-icon">🔄</span> Syncing...';
    try {
      const res = await fetch("/api/youtube/sync_comments", { method: "POST" });
      const data = await res.json();
      if (data.status === "success") {
        if (data.synced > 0) {
          showToast(`💬 Posted comments on ${data.synced} public videos!`, "success");
        } else {
          showToast("💬 All public videos and shorts comments are up to date!", "info");
        }
      } else {
        showToast(`⚠️ Sync notice: ${data.message || "Failed"}`, "error");
      }
    } catch (err) {
      showToast(`❌ Sync error: ${err.message}`, "error");
    } finally {
      btnSyncComments.disabled = false;
      btnSyncComments.innerHTML = '<span class="btn-icon">💬</span> Sync Comments';
    }
  });
}

// ============================================================
// PRE-FLIGHT SYSTEM & RESOURCE DIAGNOSTICS CONTROLLER
// ============================================================
function initPreflightModal() {
  const btnHeader = document.getElementById("btnOpenPreflightHeader");
  const modal = document.getElementById("preflightModal");
  const btnClose = document.getElementById("btnClosePreflightModal");
  const backdrop = document.getElementById("preflightBackdrop");
  const container = document.getElementById("preflightIssuesContainer");
  const btnCancel = document.getElementById("btnCancelPreflight");
  const btnProceed = document.getElementById("btnProceedPreflightAnyway");

  const closeModal = () => {
    if (modal) modal.classList.remove("active");
  };

  if (btnClose) btnClose.onclick = closeModal;
  if (backdrop) backdrop.onclick = closeModal;
  if (btnCancel) btnCancel.onclick = closeModal;
  if (btnProceed) {
    btnProceed.onclick = () => {
      closeModal();
      showToast("🚀 Proceeding with standard zero-cost fallbacks active.", "info");
    };
  }

  const runCheck = async () => {
    if (!modal || !container) return;
    modal.classList.add("active");
    container.innerHTML = `
      <div style="text-align:center; padding:36px 20px;">
        <div style="font-size:32px; animation: pulse-dot 1.2s infinite;">🩺</div>
        <h4 style="color:#f8fafc; font-size:15px; margin:12px 0 6px 0;">Auditing Pipeline Infrastructure...</h4>
        <p style="color:#94a3b8; font-size:12px; margin:0;">Inspecting Modal FLUX GPU endpoint, ElevenLabs character balances, Gemini 2.5 API, and YouTube tokens...</p>
      </div>
    `;

    try {
      const res = await fetch("/api/system/preflight?minutes=10");
      const data = await res.json();
      if (data.status === "success" && data.report) {
        const rep = data.report;
        const issues = rep.issues || [];
        if (issues.length === 0) {
          container.innerHTML = `
            <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 12px; padding: 24px 20px; text-align: center;">
              <span style="font-size: 36px;">✅</span>
              <h4 style="color: #6ee7b7; font-size: 16px; margin: 12px 0 6px 0; font-weight: 700;">All Systems 100% Operational</h4>
              <p style="color: #cbd5e1; font-size: 13px; margin: 0; line-height: 1.4;">GPU endpoints, speech engines, Tavily live web research, and YouTube cloud scheduling tokens are fully verified and ready for production.</p>
            </div>
          `;
        } else {
          container.innerHTML = issues.map(iss => `
            <div class="preflight-issue-card ${iss.broken ? 'broken' : ''}" style="margin-bottom:14px; background: rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:14px;">
              <div class="preflight-issue-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span class="preflight-issue-title" style="font-weight:700; color:#f8fafc; font-size:14px;">${iss.service || "System Check"}</span>
                <span class="badge-mini ${iss.broken ? 'critical' : 'warning'}">${iss.status || "Warning"}</span>
              </div>
              <p class="preflight-issue-msg" style="font-size:12px; color:#cbd5e1; margin-bottom:8px; line-height:1.4;">${iss.message || ""}</p>
              ${iss.solution ? `<div class="preflight-solution-box" style="background:rgba(0,0,0,0.4); border-left:3px solid #f59e0b; padding:8px 12px; font-size:11px; color:#fde68a; margin-bottom:6px; white-space:pre-line;">💡 <strong>Solution:</strong> ${iss.solution}</div>` : ""}
              ${iss.fallback ? `<div class="preflight-fallback-tag" style="font-size:11px; color:#38bdf8; display:flex; align-items:center; gap:6px;">🛡️ <strong>Automated Fallback:</strong> ${iss.fallback}</div>` : ""}
            </div>
          `).join("");
        }
      } else {
        container.innerHTML = `<p style="color:#ef4444; padding:14px;">Error running diagnostics: ${data.message || "Unknown error"}</p>`;
      }
    } catch (err) {
      container.innerHTML = `<p style="color:#ef4444; padding:14px;">Network error: ${err.message}</p>`;
    }
  };

  if (btnHeader) {
    btnHeader.onclick = runCheck;
  }
}



