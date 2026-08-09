const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const qs = (selector, scope = document) => scope?.querySelector(selector);
const qsa = (selector, scope = document) => [...(scope?.querySelectorAll(selector) || [])];

// Navigation
const menuButton = qs(".menu-toggle");
const navLinks = qs("#navLinks");

const closeMenu = () => {
  navLinks?.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");
  const label = qs("span", menuButton);
  if (label) label.textContent = "Menu";
  document.body.classList.remove("menu-open");
};

menuButton?.addEventListener("click", () => {
  const open = navLinks?.classList.toggle("open") || false;
  menuButton.setAttribute("aria-expanded", String(open));
  const label = qs("span", menuButton);
  if (label) label.textContent = open ? "Close" : "Menu";
  document.body.classList.toggle("menu-open", open);
});

qsa("a", navLinks).forEach((link) => link.addEventListener("click", closeMenu));
window.addEventListener("resize", () => {
  if (window.innerWidth > 940) closeMenu();
});

// Reveal and scroll progress
if ("IntersectionObserver" in window && !reduceMotion.matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.style.setProperty("--delay", `${Number(entry.target.dataset.delay || 0)}ms`);
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1 });
  qsa(".reveal").forEach((element) => revealObserver.observe(element));
} else {
  qsa(".reveal").forEach((element) => element.classList.add("visible"));
}

const scrollProgress = qs("#scrollProgress");
const updateScrollProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (scrollProgress) scrollProgress.style.width = `${Math.min(100, progress)}%`;
};
window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();

// Ambient field
const ambientCanvas = qs("#ambientCanvas");
const ambientContext = ambientCanvas?.getContext("2d");
let ambientParticles = [];
let ambientFrame = 0;

const resizeAmbient = () => {
  if (!ambientCanvas || !ambientContext) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  ambientCanvas.width = Math.round(window.innerWidth * ratio);
  ambientCanvas.height = Math.round(window.innerHeight * ratio);
  ambientCanvas.style.width = `${window.innerWidth}px`;
  ambientCanvas.style.height = `${window.innerHeight}px`;
  ambientContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  const count = Math.min(72, Math.max(28, Math.round(window.innerWidth / 25)));
  ambientParticles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 1.15 + 0.25,
    speed: Math.random() * 0.1 + 0.025,
    alpha: Math.random() * 0.3 + 0.06,
    tint: Math.random() > 0.76 ? "131, 220, 255" : "154, 171, 255",
  }));
};

const drawAmbient = () => {
  if (!ambientCanvas || !ambientContext) return;
  ambientContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ambientParticles.forEach((particle) => {
    particle.y -= particle.speed;
    if (particle.y < -4) {
      particle.y = window.innerHeight + 4;
      particle.x = Math.random() * window.innerWidth;
    }
    ambientContext.beginPath();
    ambientContext.fillStyle = `rgba(${particle.tint}, ${particle.alpha})`;
    ambientContext.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ambientContext.fill();
  });
  ambientFrame = requestAnimationFrame(drawAmbient);
};

if (ambientCanvas && ambientContext && !reduceMotion.matches) {
  resizeAmbient();
  drawAmbient();
  window.addEventListener("resize", resizeAmbient);
}

// Interactive N.O.V.A presence states
const stateConfig = {
  idle: {
    label: "IDLE",
    description: "Wake word armed. Local services ready.",
    model: "QWEN / LOCAL",
    route: "STANDBY",
    detail: "AWAITING INPUT",
    color: "#738cff",
    rgb: "115, 140, 255",
  },
  listening: {
    label: "LISTENING",
    description: "Wake word detected. Voice channel is capturing input.",
    model: "VOICE / INPUT",
    route: "STT ACTIVE",
    detail: "COMMAND CAPTURE",
    color: "#83dcff",
    rgb: "131, 220, 255",
  },
  thinking: {
    label: "THINKING",
    description: "Intent classified. Context and the safest route are being assembled.",
    model: "QWEN / LOCAL",
    route: "BRAIN ACTIVE",
    detail: "MEMORY + REASONING",
    color: "#ab8cff",
    rgb: "171, 140, 255",
  },
  speaking: {
    label: "SPEAKING",
    description: "Response ready. Local Kokoro voice output is active.",
    model: "KOKORO / LOCAL",
    route: "VOICE OUTPUT",
    detail: "ECHO GUARD ARMED",
    color: "#65e6d4",
    rgb: "101, 230, 212",
  },
  tool: {
    label: "EXECUTING TOOL",
    description: "A deterministic route is acting without unnecessary model inference.",
    model: "TOOL / DIRECT",
    route: "ACTION ACTIVE",
    detail: "PERMISSIONED ROUTE",
    color: "#ffbd69",
    rgb: "255, 189, 105",
  },
  error: {
    label: "RECOVERING",
    description: "A layer failed. N.O.V.A is exposing the error and selecting a fallback.",
    model: "FALLBACK / SAFE",
    route: "ERROR STATE",
    detail: "RECOVERY PATH",
    color: "#ff687f",
    rgb: "255, 104, 127",
  },
};

const heroOrb = qs("#heroOrb");
const systemFrame = qs(".system-frame");
const heroState = qs("#heroState");
const heroStateDescription = qs("#heroStateDescription");
const metricModel = qs("#metricModel");
const metricRoute = qs("#metricRoute");
const metricDetail = qs("#metricDetail");
const stateButtons = qsa(".state-button");
let stateTimer = null;
let selectedStateIndex = 0;
const automaticStates = ["idle", "listening", "thinking", "tool", "speaking"];

const setOrbState = (orb, state) => {
  if (!orb || !stateConfig[state]) return;
  orb.dataset.state = state;
  orb.setAttribute("aria-label", `N.O.V.A is ${state === "tool" ? "executing a tool" : state}`);
};

const applyHeroState = (state, userInitiated = false) => {
  const config = stateConfig[state];
  if (!config) return;
  setOrbState(heroOrb, state);
  systemFrame?.style.setProperty("--state", config.color);
  systemFrame?.style.setProperty("--state-rgb", config.rgb);
  if (heroState) heroState.textContent = config.label;
  if (heroStateDescription) heroStateDescription.textContent = config.description;
  if (metricModel) metricModel.textContent = config.model;
  if (metricRoute) metricRoute.textContent = config.route;
  if (metricDetail) metricDetail.textContent = config.detail;
  stateButtons.forEach((button) => button.classList.toggle("active", button.dataset.orbState === state));
  const automaticIndex = automaticStates.indexOf(state);
  if (automaticIndex >= 0) selectedStateIndex = automaticIndex;
  if (userInitiated && !reduceMotion.matches) restartStateTimer();
};

const cycleState = () => {
  selectedStateIndex = (selectedStateIndex + 1) % automaticStates.length;
  applyHeroState(automaticStates[selectedStateIndex]);
};

const restartStateTimer = () => {
  window.clearInterval(stateTimer);
  stateTimer = window.setInterval(cycleState, 4200);
};

stateButtons.forEach((button) => button.addEventListener("click", () => applyHeroState(button.dataset.orbState, true)));
applyHeroState("idle");
if (!reduceMotion.matches) restartStateTimer();

const frameClock = qs("#frameClock");
const updateClock = () => {
  if (!frameClock) return;
  frameClock.textContent = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date()) + " / LOCAL";
};
updateClock();
const clockTimer = window.setInterval(updateClock, 1000);

// Request routing simulator
const scenarios = [
  {
    prompt: "“NOVA, what was the portfolio strategy we decided on?”",
    response: "We decided to lead with N.O.V.A, APEX, and INVEXA, then support each project with a focused public showcase and honest technical proof.",
    route: "Retrieve",
    detail: "Relevant memory",
    path: "MEMORY → QWEN",
    stageState: "thinking",
    stageStatus: "CONTEXT + LOCAL MODEL",
  },
  {
    prompt: "“NOVA, what is 18% of 24,500?”",
    response: "18% of 24,500 is 4,410.",
    route: "Calculate",
    detail: "Direct utility",
    path: "INTENT → CALCULATOR",
    stageState: "tool",
    stageStatus: "DIRECT TOOL ROUTE",
  },
  {
    prompt: "“NOVA, how much RAM is in use and is the laptop charging?”",
    response: "System check complete. I read the current RAM, battery, and charging status directly from the machine.",
    route: "Inspect",
    detail: "psutil direct",
    path: "INTENT → SYSTEM TOOL",
    stageState: "tool",
    stageStatus: "LOCAL SYSTEM READ",
  },
  {
    prompt: "“NOVA, remind me to review INVEXA in 25 minutes.”",
    response: "Reminder created for 25 minutes. I’ll notify you with a spoken alert when it is due.",
    route: "Schedule",
    detail: "Reminder service",
    path: "INTENT → TIME UTILITY",
    stageState: "tool",
    stageStatus: "REMINDER CREATED",
  },
  {
    prompt: "“NOVA, search YouTube for FastAPI deployment guides.”",
    response: "Opening YouTube and searching for FastAPI deployment guides now.",
    route: "Navigate",
    detail: "Browser action",
    path: "INTENT → PLAYWRIGHT",
    stageState: "tool",
    stageStatus: "BROWSER ACTION",
  },
];

const scenarioButtons = qsa(".scenario-button");
const demoOrb = qs("#demoOrb");
const scenarioPrompt = qs("#scenarioPrompt");
const scenarioResponse = qs("#scenarioResponse");
const routeStage = qs("#routeStage");
const routeDetail = qs("#routeDetail");
const activePath = qs("#activePath");
const runButton = qs("#runScenario");
const demoStatus = qs("#demoStatus");
const pipelineSteps = qsa(".pipeline [data-step]");
let selectedScenario = 0;
let scenarioTimers = [];

const clearScenarioTimers = () => {
  scenarioTimers.forEach((timer) => window.clearTimeout(timer));
  scenarioTimers = [];
};

const loadScenario = (index) => {
  clearScenarioTimers();
  selectedScenario = index;
  const scenario = scenarios[index];
  scenarioButtons.forEach((button, buttonIndex) => {
    const active = buttonIndex === index;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  if (scenarioPrompt) scenarioPrompt.textContent = scenario.prompt;
  if (scenarioResponse) scenarioResponse.textContent = "Ready to process this interaction.";
  if (routeStage) routeStage.textContent = scenario.route;
  if (routeDetail) routeDetail.textContent = scenario.detail;
  if (activePath) activePath.textContent = scenario.path;
  if (demoStatus) demoStatus.textContent = "READY";
  pipelineSteps.forEach((step) => step.classList.remove("active"));
  setOrbState(demoOrb, "idle");
  if (runButton) runButton.disabled = false;
};

const runScenario = () => {
  clearScenarioTimers();
  const scenario = scenarios[selectedScenario];
  if (runButton) runButton.disabled = true;
  if (scenarioResponse) scenarioResponse.textContent = "Processing the request…";
  pipelineSteps.forEach((step) => step.classList.remove("active"));

  const duration = reduceMotion.matches ? 0 : 1;
  const stages = [
    { at: 0, orb: "listening", step: 0, status: "INPUT CAPTURED" },
    { at: 650 * duration, orb: "thinking", step: 1, status: "INTENT CLASSIFIED" },
    { at: 1450 * duration, orb: scenario.stageState, step: 2, status: scenario.stageStatus },
    { at: 2450 * duration, orb: "speaking", step: 3, status: "RESPONSE READY" },
  ];

  stages.forEach((stage) => {
    scenarioTimers.push(window.setTimeout(() => {
      setOrbState(demoOrb, stage.orb);
      pipelineSteps.slice(0, stage.step + 1).forEach((step) => step.classList.add("active"));
      if (demoStatus) demoStatus.textContent = stage.status;
      if (stage.step === 3 && scenarioResponse) scenarioResponse.textContent = scenario.response;
    }, stage.at));
  });

  scenarioTimers.push(window.setTimeout(() => {
    setOrbState(demoOrb, "idle");
    if (demoStatus) demoStatus.textContent = "COMPLETE";
    if (runButton) runButton.disabled = false;
  }, reduceMotion.matches ? 40 : 4050));
};

scenarioButtons.forEach((button, index) => button.addEventListener("click", () => loadScenario(index)));
runButton?.addEventListener("click", runScenario);

// Memory permission demonstration
const memoryStatus = qs("#memoryStatus");
qs("#confirmMemory")?.addEventListener("click", () => {
  memoryStatus?.classList.remove("temporary");
  memoryStatus?.classList.add("saved");
  const label = qs("span", memoryStatus);
  if (label) label.textContent = "CONFIRMED / SAVED TO LONG-TERM MEMORY";
});
qs("#declineMemory")?.addEventListener("click", () => {
  memoryStatus?.classList.remove("saved");
  memoryStatus?.classList.add("temporary");
  const label = qs("span", memoryStatus);
  if (label) label.textContent = "NOT SAVED / SESSION CONTEXT ONLY";
});

// Capability filters
const filterButtons = qsa(".filter-button");
const capabilityRows = qsa("#capabilityLedger article");
filterButtons.forEach((button) => button.addEventListener("click", () => {
  const filter = button.dataset.filter;
  filterButtons.forEach((item) => item.classList.toggle("active", item === button));
  capabilityRows.forEach((row) => row.classList.toggle("hidden", filter !== "all" && row.dataset.status !== filter));
}));

// Architecture route explorer
const architectureRoutes = {
  conversation: {
    name: "CONVERSATION ROUTE",
    explanation: "The prompt builder combines personality, recent history, relevant confirmed memory, and the current request before the local Qwen model generates a response.",
    path: "INPUT → UI → BRAIN → MEMORY + MODEL → RESPONSE",
  },
  tool: {
    name: "DIRECT TOOL ROUTE",
    explanation: "A deterministic request bypasses the language model. The intent engine selects the exact utility, returns structured output, and updates the interface state.",
    path: "INPUT → UI → BRAIN → TOOL → RESULT",
  },
  memory: {
    name: "MEMORY SAVE ROUTE",
    explanation: "A candidate fact is extracted, checked against memory rules, and only promoted to durable storage when the user’s confirmation requirement is satisfied.",
    path: "INPUT → UI → BRAIN → CONFIRMATION → MEMORY",
  },
  voice: {
    name: "VOICE LOOP",
    explanation: "The wake word opens capture, speech becomes text, the brain selects a response path, Kokoro speaks the result, and echo protection prevents self-triggering.",
    path: "WAKE → STT → BRAIN → RESPONSE → KOKORO",
  },
};

const archTabs = qsa(".arch-tab");
const architectureMap = qs("#architectureMap");
const routeName = qs("#routeName");
const routeExplanation = qs("#routeExplanation");
const routePath = qs("#routePath");

archTabs.forEach((tab) => tab.addEventListener("click", () => {
  const route = tab.dataset.route;
  const config = architectureRoutes[route];
  archTabs.forEach((item) => {
    const active = item === tab;
    item.classList.toggle("active", active);
    item.setAttribute("aria-selected", String(active));
  });
  if (architectureMap) architectureMap.dataset.route = route;
  if (routeName) routeName.textContent = config.name;
  if (routeExplanation) routeExplanation.textContent = config.explanation;
  if (routePath) routePath.textContent = config.path;
}));

const year = qs("#year");
if (year) year.textContent = String(new Date().getFullYear());

window.addEventListener("pagehide", () => {
  window.clearInterval(stateTimer);
  window.clearInterval(clockTimer);
  clearScenarioTimers();
  if (ambientFrame) cancelAnimationFrame(ambientFrame);
});
