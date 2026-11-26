/**
 * ============================================================================
 * ÑUQAMANTA PORTFOLIO - CORE APPLICATION (SUPABASE INTEGRATED)
 * ============================================================================
 */

// CREDENCIALES DE SUPABASE
const SUPABASE_URL = "https://zsldrikjdkktctxfjnru.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_2pAmwL_JQFEcBpG4m-I4dQ_RsE6JzRH";

// Inicializar cliente de Supabase
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// ==================== 1. CONSTANTES Y CONFIGURACIÓN ====================
const STORAGE_KEYS = {
  PIN: "portfolio_owner_pin_v2",
  PROFILE: "portfolio_owner_profile_v2",
  THEME: "portfolio_theme_mode_v2",
  SOUND: "portfolio_sound_enabled_v2",
  PETS: "portfolio_cat_pet_count_v2"
};

const DEFAULT_PROFILE = {
  name: "Gerson Ramirez",
  role: "Fanático y Observador",
  bio: "Bienvenido seáis a este espacio donde la inventiva converge con la sapiencia, lo ignoto despierta fascinación y cada pensamiento encuentra su propia trascendencia.",
  tags: ["Creative Dev", "HTML5 Canvas", "Java", "Pixel Art", "Open Source"]
};

const INITIAL_PROJECTS = [
  {
    id: "init-1",
    title: "Jardín Zen Interactivo en Canvas",
    category: "Códigos HTML",
    format: ".html",
    url: "",
    description: "Simulación relajante de ondas de agua hecha con HTML5 Canvas y JavaScript puro. ¡Haz clic en Ver Código → Vista Previa en Vivo!",
    code: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Jardín Zen</title>
</head>
<body style="margin:0;background:#CFE0DC;display:grid;place-items:center;height:100vh;font-family:monospace;">
  <canvas id="zen" width="340" height="260" style="border-radius:12px;background:#88ABA5;box-shadow:0 8px 24px rgba(0,0,0,0.15);cursor:pointer;"></canvas>
  <script>
    const c = document.getElementById('zen');
    const ctx = c.getContext('2d');
    let rings = [{ x: 170, y: 130, r: 10, alpha: 1 }];

    function addWave(x, y) {
      rings.push({ x, y, r: 5, alpha: 1 });
    }

    c.addEventListener('click', (e) => {
      const rect = c.getBoundingClientRect();
      addWave(e.clientX - rect.left, e.clientY - rect.top);
    });

    function loop() {
      ctx.fillStyle = 'rgba(136, 171, 165, 0.18)';
      ctx.fillRect(0, 0, c.width, c.height);

      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        ctx.strokeStyle = 'rgba(244, 247, 242, ' + ring.alpha + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx.stroke();

        ring.r += 1.4;
        ring.alpha -= 0.012;
        if (ring.alpha <= 0) rings.splice(i, 1);
      }

      if (Math.random() < 0.03) {
        addWave(Math.random() * c.width, Math.random() * c.height);
      }

      requestAnimationFrame(loop);
    }
    loop();
  <\/script>
</body>
</html>`
  },
  {
    id: "init-2",
    title: "Gestor de Estructuras & Algoritmos",
    category: "Códigos Java",
    format: ".java",
    url: "https://github.com",
    description: "Colección limpia y documentada de algoritmos de búsqueda binaria y ordenamiento eficiente implementados en Java estándar.",
    code: `public class BusquedaBinaria {
    /**
     * Búsqueda binaria clásica en arreglo ordenado.
     * Complejidad temporal: O(log n)
     */
    public static int buscar(int[] arr, int objetivo) {
        int inicio = 0;
        int fin = arr.length - 1;

        while (inicio <= fin) {
            int medio = inicio + (fin - inicio) / 2;

            if (arr[medio] == objetivo) {
                return medio; // Elemento hallado
            }
            if (arr[medio] < objetivo) {
                inicio = medio + 1; // Mitad derecha
            } else {
                fin = medio - 1; // Mitad izquierda
            }
        }
        return -1; // No encontrado
    }

    public static void main(String[] args) {
        int[] datos = { 2, 5, 8, 12, 16, 23, 38, 56, 72, 91 };
        int objetivo = 23;
        int resultado = buscar(datos, objetivo);
        System.out.println("Índice encontrado: " + resultado);
    }
}`
  },
  {
    id: "init-3",
    title: "Aventura Pixel-Art 2D (Mini Juego)",
    category: "Jueguitos / Otros Formatos",
    format: ".jar",
    url: "",
    description: "Minijuego de exploración 2D con colisiones por tiles, inventario básico y física retro empaquetado en .jar ejecutable.",
    code: `# Requisitos: Java JRE 17 o superior
# Para ejecutar en terminal:
java -jar aventura-pixel.jar

# Configuración de Controles:
# W, A, S, D  -> Mover al personaje
# Espacio     -> Saltar / Interactuar
# E           -> Abrir inventario
# Esc         -> Pausa / Menú`
  }
];

// ==================== 2. ESTADO GLOBAL ====================
const state = {
  isAdmin: false,
  currentFilter: "Todos",
  searchQuery: "",
  projects: [],
  profile: { ...DEFAULT_PROFILE },
  theme: "day",
  soundEnabled: true,
  petCount: 0,
  deleteTargetId: null,
  activeViewerProject: null,
  activeDeviceMode: "full"
};

// ==================== 3. LÓGICA DE SUPABASE (CONEXIÓN DIRECTA) ====================
async function loadProjectsFromSupabase() {
  if (!supabaseClient) {
    state.projects = [...INITIAL_PROJECTS];
    renderProjects();
    return;
  }
  try {
    const { data, error } = await supabaseClient
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (data && data.length > 0) {
      state.projects = data;
    } else {
      state.projects = [...INITIAL_PROJECTS];
    }
  } catch (err) {
    console.warn("Error leyendo de Supabase, mostrando datos iniciales:", err);
    state.projects = [...INITIAL_PROJECTS];
  }
  renderProjects();
}

async function saveProjectToSupabase(payload, id = null) {
  if (!supabaseClient) {
    showToast("Cliente de Supabase no cargado", true);
    return;
  }
  try {
    if (id && !String(id).startsWith("init-")) {
      const { error } = await supabaseClient.from("projects").update(payload).eq("id", id);
      if (error) throw error;
      showToast("Proyecto actualizado en Supabase ✓");
    } else {
      const { error } = await supabaseClient.from("projects").insert([payload]);
      if (error) throw error;
      showToast("Proyecto publicado en Supabase ✓");
    }
    await loadProjectsFromSupabase();
  } catch (err) {
    showToast("Error al guardar en Supabase", true);
    console.error("Error Supabase Save:", err);
  }
}

async function deleteProjectFromSupabase(id) {
  if (!supabaseClient) return;
  if (String(id).startsWith("init-")) {
    state.projects = state.projects.filter((p) => p.id !== id);
    renderProjects();
    showToast("Proyecto eliminado localmente ✓");
    return;
  }
  try {
    const { error } = await supabaseClient.from("projects").delete().eq("id", id);
    if (error) throw error;
    showToast("Proyecto eliminado de Supabase ✓");
    await loadProjectsFromSupabase();
  } catch (err) {
    showToast("Error al eliminar de Supabase", true);
    console.error("Error Supabase Delete:", err);
  }
}

// ==================== 4. UTILIDADES DOM & SEGURIDAD ====================
const $ = (id) => document.getElementById(id);

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getStoredPin() {
  return localStorage.getItem(STORAGE_KEYS.PIN) || "1234";
}

function showToast(message, isError = false) {
  const container = $("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast${isError ? " error" : ""}`;
  toast.innerHTML = `<span>${isError ? "⚠️" : "✨"}</span> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-8px)";
    toast.style.transition = "all 0.25s ease";
    setTimeout(() => toast.remove(), 250);
  }, 2800);
}

function openModal(id) {
  const modal = $(id);
  if (!modal) return;
  modal.classList.remove("hidden");
  const firstInput = modal.querySelector("input:not([type=hidden]), textarea, button:not(.modal-close)");
  if (firstInput) setTimeout(() => firstInput.focus(), 60);
}

function closeModal(id) {
  const modal = $(id);
  if (!modal) return;
  modal.classList.add("hidden");
  if (id === "modal-code-viewer") {
    $("viewer-iframe").srcdoc = "";
  }
}

// ==================== 5. MOTOR DE AUDIO 8-BIT (WEB AUDIO API) ====================
class ChiptuneAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window["webkitAudioContext"];
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch {
      // AudioContext no disponible
    }
  }

  ensureReady() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playTone(freq, type = "square", duration = 0.08, endFreq = null) {
    if (!state.soundEnabled) return;
    this.ensureReady();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (endFreq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
      }

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Ignorar fallas de reproducción
    }
  }

  playClick() {
    this.playTone(720, "triangle", 0.04, 360);
  }

  playPop() {
    this.playTone(480, "sine", 0.09, 820);
  }

  playPurr() {
    if (!state.soundEnabled) return;
    this.ensureReady();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [
        { f: 520, d: 0.07 },
        { f: 780, d: 0.12 },
        { f: 660, d: 0.09 }
      ];
      let t = now;
      notes.forEach((n) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(n.f, t);
        gain.gain.setValueAtTime(0.16, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + n.d);
        t += n.d * 0.85;
      });
    } catch {}
  }

  playSuccess() {
    if (!state.soundEnabled) return;
    this.ensureReady();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const chord = [523.25, 659.25, 783.99]; // C5, E5, G5
      chord.forEach((freq, idx) => {
        const start = now + idx * 0.07;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.14, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(start);
        osc.stop(start + 0.18);
      });
    } catch {}
  }

  playWarp() {
    this.playTone(280, "sawtooth", 0.22, 1100);
  }

  playDelete() {
    this.playTone(240, "sawtooth", 0.18, 90);
  }
}

const audio = new ChiptuneAudioEngine();

// ==================== 6. CONTROLADOR DE TEMAS (DÍA / NOCHE) ====================
function setTheme(newTheme, playSound = true) {
  state.theme = newTheme;
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem(STORAGE_KEYS.THEME, newTheme);

  const isNight = newTheme === "night";
  $("theme-icon-sun")?.classList.toggle("hidden", isNight);
  $("theme-icon-moon")?.classList.toggle("hidden", !isNight);
  $("scenery-sun")?.classList.toggle("hidden", isNight);
  $("scenery-moon")?.classList.toggle("hidden", !isNight);
  $("scenery-stars")?.classList.toggle("hidden", !isNight);

  if (playSound) audio.playWarp();
}

function toggleTheme() {
  setTheme(state.theme === "day" ? "night" : "day", true);
  showToast(state.theme === "night" ? "Modo Noche activado 🌙" : "Modo Día activado ☀️");
}

function updateSoundUI() {
  $("sound-icon-on")?.classList.toggle("hidden", !state.soundEnabled);
  $("sound-icon-off")?.classList.toggle("hidden", state.soundEnabled);
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  localStorage.setItem(STORAGE_KEYS.SOUND, state.soundEnabled ? "true" : "false");
  updateSoundUI();
  if (state.soundEnabled) audio.playPop();
  showToast(state.soundEnabled ? "Efectos de sonido 8-bit activos 🔊" : "Sonido silenciado 🔇");
}

// ==================== 7. RESALTADOR DE SINTAXIS LIGERO ====================
function highlightCode(code, format = "") {
  if (!code) return "";
  const ext = format.toLowerCase();
  let escaped = escapeHtml(code);

  if (ext.includes("html") || ext.includes("xml")) {
    escaped = escaped.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="token-comment">$1</span>');
    escaped = escaped.replace(/(&lt;\/?)([a-zA-Z0-9\-]+)(.*?)(&gt;)/g, (_match, open, tag, attrs, close) => {
      const coloredAttrs = attrs.replace(/([a-zA-Z\-:]+)=("[^"]*"|'[^']*')/g, '<span class="token-attr">$1</span>=<span class="token-string">$2</span>');
      return `${open}<span class="token-tag">${tag}</span>${coloredAttrs}${close}`;
    });
  } else {
    escaped = escaped.replace(/("[^"\\]*(?:\\.[^"\\]*)*")/g, '<span class="token-string">$1</span>');
    escaped = escaped.replace(/('[^'\\]*(?:\\.[^'\\]*)*')/g, '<span class="token-string">$1</span>');
    escaped = escaped.replace(/(\/\/[^\n]*)/g, '<span class="token-comment">$1</span>');
    escaped = escaped.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token-comment">$1</span>');
    escaped = escaped.replace(/(#[^\n]*)/g, '<span class="token-comment">$1</span>');
    const keywords = /\b(public|private|protected|class|static|void|int|double|float|boolean|String|return|if|else|while|for|new|import|package|const|let|var|function|async|await|try|catch|finally|throw)\b/g;
    escaped = escaped.replace(keywords, '<span class="token-keyword">$1</span>');
    escaped = escaped.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="token-number">$1</span>');
  }

  return escaped;
}

// ==================== 8. INTERACCIÓN DEL GATITO Y PARTÍCULAS ====================
const CAT_REACTIONS = ["Nya~ ✨", "¡Prrr! ♥", "(=^･ω･^=)", "¡Miau! ✨", "¡Qué suave! 🐾", "¡Purrrr!", "✨ (=`ω´=) ✨", "¡Miauuu! 🎵"];

function spawnPixelParticle(x, y, symbol = "♥") {
  const particle = document.createElement("div");
  particle.className = "pixel-particle";
  particle.textContent = symbol;
  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;
  particle.style.color = symbol === "♥" ? "var(--coral)" : "#FEF08A";
  document.body.appendChild(particle);
  setTimeout(() => particle.remove(), 850);
}

function triggerCatPet(event) {
  state.petCount++;
  localStorage.setItem(STORAGE_KEYS.PETS, String(state.petCount));
  $("pet-count-label").textContent = `Mimado x${state.petCount} ✨`;
  audio.playPurr();
  const catSvg = $("cat-svg-hero");
  if (catSvg) {
    catSvg.classList.remove("cat-spin");
    void catSvg.offsetWidth;
    catSvg.classList.add("cat-spin");
    setTimeout(() => catSvg.classList.remove("cat-spin"), 600);
  }
  const bubble = $("cat-bubble");
  if (bubble) {
    const reaction = CAT_REACTIONS[Math.floor(Math.random() * CAT_REACTIONS.length)];
    bubble.textContent = reaction;
    bubble.classList.remove("hidden");
    clearTimeout(bubble._timer);
    bubble._timer = setTimeout(() => bubble.classList.add("hidden"), 1600);
  }
  const clientX = event?.clientX || window.innerWidth / 2;
  const clientY = event?.clientY || window.innerHeight / 2;
  const symbols = ["♥", "✨", "★", "🐾"];
  for (let i = 0; i < 4; i++) {
    const rx = clientX + (Math.random() - 0.5) * 50;
    const ry = clientY + (Math.random() - 0.5) * 40;
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    setTimeout(() => spawnPixelParticle(rx, ry, sym), i * 70);
  }
}

function setupCatEyeTracking() {
  const pupils = $("cat-pupils");
  const stage = $("cat-stage");
  if (!pupils || !stage) return;
  window.addEventListener("mousemove", (e) => {
    const rect = stage.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const dist = Math.min(2.0, Math.hypot(e.clientX - centerX, e.clientY - centerY) / 80);
    const offsetX = Math.cos(angle) * dist;
    const offsetY = Math.sin(angle) * dist;
    pupils.style.transform = `translate(${offsetX.toFixed(1)}px, ${offsetY.toFixed(1)}px)`;
  });
}

// ==================== 9. PAISAJE Y AGUA INTERACTIVA ====================
function setupWaterRippleEffect() {
  const layer = $("water-ripple-layer");
  if (!layer) return;
  layer.addEventListener("click", (e) => {
    const rect = layer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ripple = document.createElement("div");
    ripple.className = "interactive-ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    layer.appendChild(ripple);
    audio.playPop();
    setTimeout(() => ripple.remove(), 800);
  });
}

// ==================== 10. EASTER EGGS ====================
function setupEasterEggs() {
  const pine = $("brand-pine");
  if (pine) {
    pine.style.cursor = "pointer";
    pine.addEventListener("click", (e) => {
      e.preventDefault();
      audio.playTone(900, "triangle", 0.12, 1200);
      pine.style.transform = "rotate(360deg) scale(1.3)";
      setTimeout(() => { pine.style.transform = ""; }, 400);
      const rect = pine.getBoundingClientRect();
      for (let i = 0; i < 3; i++) {
        setTimeout(() => { spawnPixelParticle(rect.left + Math.random() * 20, rect.top + Math.random() * 20, "🌲"); }, i * 90);
      }
      showToast("¡El bosque te saluda! 🌲✨");
    });
  }
  const konamiSequence = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let konamiIndex = 0;
  document.addEventListener("keydown", (e) => {
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
    if (e.key.toLowerCase() === konamiSequence[konamiIndex].toLowerCase()) {
      konamiIndex++;
      if (konamiIndex === konamiSequence.length) {
        konamiIndex = 0;
        triggerCelebration();
      }
    } else {
      konamiIndex = 0;
    }
    if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
      e.preventDefault();
      $("search-projects")?.focus();
    }
  });
}

function triggerCelebration() {
  audio.playSuccess();
  showToast("⭐ ¡CÓDIGO SECRETO DESBLOQUEADO! ⭐");
  const symbols = ["⭐", "✨", "♥", "🌸", "🎉", "🐾"];
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const rx = Math.random() * window.innerWidth;
      const ry = Math.random() * window.innerHeight;
      const sym = symbols[Math.floor(Math.random() * symbols.length)];
      spawnPixelParticle(rx, ry, sym);
    }, i * 50);
  }
}

// ==================== 11. GESTIÓN DE PERSISTENCIA LOCAL ====================
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(state.profile));
  } catch (err) {
    console.error("Error al guardar estado local:", err);
  }
}

function loadState() {
  try {
    const savedProf = localStorage.getItem(STORAGE_KEYS.PROFILE);
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    const savedSound = localStorage.getItem(STORAGE_KEYS.SOUND);
    const savedPets = localStorage.getItem(STORAGE_KEYS.PETS);

    state.profile = savedProf ? { ...DEFAULT_PROFILE, ...JSON.parse(savedProf) } : { ...DEFAULT_PROFILE };
    state.theme = savedTheme || "day";
    state.soundEnabled = savedSound !== "false";
    state.petCount = savedPets ? parseInt(savedPets, 10) || 0 : 0;
  } catch {
    state.profile = { ...DEFAULT_PROFILE };
    state.theme = "day";
    state.soundEnabled = true;
    state.petCount = 0;
  }
}

// ==================== 12. ICONOS SVG POR CATEGORÍA ====================
function getCategoryIcon(category) {
  if (category === "Códigos HTML") {
    return `<svg width="26" height="26" class="pixel-art" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1" y="2" width="14" height="12" fill="var(--cloud)" stroke="currentColor" stroke-width="1.2"/>
      <rect x="1" y="2" width="14" height="3" fill="var(--sage-deep)"/>
      <rect x="4" y="8" width="1" height="2" fill="var(--coral)"/>
      <rect x="11" y="8" width="1" height="2" fill="var(--coral)"/>
      <rect x="8" y="7" width="1" height="4" fill="currentColor"/>
    </svg>`;
  }
  if (category === "Códigos Java") {
    return `<svg width="26" height="26" class="pixel-art" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="6" y="2" width="1" height="2" fill="var(--coral)"/>
      <rect x="9" y="1" width="1" height="3" fill="var(--coral)"/>
      <rect x="3" y="6" width="8" height="6" fill="var(--cloud)" stroke="currentColor" stroke-width="1.2"/>
      <rect x="2" y="12" width="11" height="2" fill="var(--sage-deep)" stroke="currentColor" stroke-width="1"/>
    </svg>`;
  }
  return `<svg width="26" height="26" class="pixel-art" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="2" y="5" width="12" height="7" rx="1" fill="var(--cloud)" stroke="currentColor" stroke-width="1.2"/>
    <rect x="4" y="7" width="1" height="3" fill="currentColor"/>
    <rect x="3" y="8" width="3" height="1" fill="currentColor"/>
    <rect x="10" y="7" width="2" height="2" fill="var(--coral)"/>
  </svg>`;
}

// ==================== 13. RENDERIZADO ====================
function renderProfile() {
  $("profile-name").textContent = state.profile.name;
  $("profile-role").textContent = state.profile.role;
  $("profile-bio").textContent = state.profile.bio;
  const tags = state.profile.tags && state.profile.tags.length ? state.profile.tags : DEFAULT_PROFILE.tags;
  $("profile-tags").innerHTML = tags.map((tag) => `<span class="tag-item">#${escapeHtml(tag)}</span>`).join("");
}

function renderProjects() {
  const query = state.searchQuery.toLowerCase();
  const filtered = state.projects.filter((p) => {
    const matchesCat = state.currentFilter === "Todos" || p.category === state.currentFilter;
    const matchesSearch = !query || p.title.toLowerCase().includes(query) || (p.description || "").toLowerCase().includes(query) || (p.format || "").toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  $("projects-count").textContent = `${filtered.length} ${filtered.length === 1 ? "proyecto" : "proyectos"}`;
  const container = $("projects-list");
  if (!filtered.length) {
    container.innerHTML = `<div class="empty-state"><p>No se encontraron proyectos.</p></div>`;
    return;
  }

  container.innerHTML = filtered.map((proj, idx) => `
    <article class="project-item" style="animation-delay: ${idx * 0.06}s">
      <div class="project-info">
        <div class="project-icon-box" title="${escapeHtml(proj.category)}">
          ${getCategoryIcon(proj.category)}
        </div>
        <div>
          <div class="project-meta">
            <h3 class="project-title">${escapeHtml(proj.title)}</h3>
            <span class="badge-soft">${escapeHtml(proj.category)}</span>
            <span class="badge-coral">${escapeHtml(proj.format || ".code")}</span>
          </div>
          <p class="project-desc">${escapeHtml(proj.description)}</p>
        </div>
      </div>
      <div class="project-actions">
        ${state.isAdmin ? `
          <button type="button" class="btn btn-ghost btn-sm" data-edit="${proj.id}">Editar</button>
          <button type="button" class="btn btn-danger-soft btn-sm" data-delete="${proj.id}">Eliminar</button>
        ` : ""}
        ${proj.code?.trim() ? `
          <button type="button" class="btn btn-ghost btn-sm" data-quick-copy="${proj.id}">📋 Copiar</button>
          <button type="button" class="btn btn-ghost btn-sm" data-view="${proj.id}">Ver Código</button>
        ` : ""}
        ${proj.url?.trim() ? `<a href="${escapeHtml(proj.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-coral btn-sm">Abrir ↗</a>` : ""}
      </div>
    </article>
  `).join("");
}

function updateAdminUI() {
  $("owner-toolbar").classList.toggle("hidden", !state.isAdmin);
  $("admin-nav-label").textContent = state.isAdmin ? "Hatsu (Activo)" : "Hatsu";
  $("hero-admin-btn-text").textContent = state.isAdmin ? "Panel Propietario Activo" : "¿Eres tú?";
  renderProjects();
}

// ==================== 14. VISOR DE CÓDIGO Y ESTUDIO EN VIVO ====================
function openCodeViewer(proj) {
  state.activeViewerProject = proj;
  $("viewer-title").textContent = proj.title;
  $("viewer-format").textContent = proj.format || ".txt";
  $("viewer-desc").textContent = proj.description;
  const rawCode = proj.code || "";
  const linesCount = rawCode ? rawCode.split("\n").length : 0;
  $("viewer-lines").textContent = `${linesCount} ${linesCount === 1 ? "línea" : "líneas"}`;
  $("viewer-code-content").innerHTML = highlightCode(rawCode, proj.format);
  const isHtml = (proj.format || "").toLowerCase().includes("html");
  $("viewer-tabs").classList.toggle("hidden", !isHtml);
  $("preview-viewport-controls").classList.toggle("hidden", !isHtml);
  showViewerTab("code");
  setPreviewDevice("full");
  openModal("modal-code-viewer");
}

function showViewerTab(tab) {
  const isPreview = tab === "preview";
  $("tab-show-code").classList.toggle("active", !isPreview);
  $("tab-show-preview").classList.toggle("active", isPreview);
  $("viewer-code-pane").classList.toggle("hidden", isPreview);
  $("viewer-preview-pane").classList.toggle("hidden", !isPreview);
  if (isPreview && state.activeViewerProject) loadPreviewIframe();
}

function loadPreviewIframe() {
  const iframe = $("viewer-iframe");
  if (!iframe || !state.activeViewerProject) return;
  iframe.srcdoc = state.activeViewerProject.code || "";
}

function setPreviewDevice(mode) {
  state.activeDeviceMode = mode;
  const wrapper = $("preview-wrapper");
  if (!wrapper) return;
  const isMobile = mode === "mobile";
  wrapper.classList.toggle("mobile-frame", isMobile);
  $("btn-preview-device-full")?.classList.toggle("active", !isMobile);
  $("btn-preview-device-mobile")?.classList.toggle("active", isMobile);
}

// ==================== 15. CONFIGURACIÓN DE EVENTOS ====================
function setupEvents() {
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => { audio.playClick(); closeModal(btn.dataset.closeModal); });
  });

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => { if (e.target === modal) { audio.playClick(); closeModal(modal.id); } });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const openM = document.querySelector(".modal:not(.hidden)");
      if (openM) { audio.playClick(); closeModal(openM.id); }
    }
  });

  $("projects-list").addEventListener("click", async (e) => {
    const viewBtn = e.target.closest("[data-view]");
    const editBtn = e.target.closest("[data-edit]");
    const delBtn = e.target.closest("[data-delete]");
    const copyBtn = e.target.closest("[data-quick-copy]");

    if (viewBtn) {
      audio.playClick();
      const proj = state.projects.find((p) => String(p.id) === String(viewBtn.dataset.view));
      if (proj) openCodeViewer(proj);
    }
    if (copyBtn) {
      const proj = state.projects.find((p) => String(p.id) === String(copyBtn.dataset.quickCopy));
      if (proj && proj.code) {
        try {
          await navigator.clipboard.writeText(proj.code);
          audio.playSuccess();
          copyBtn.textContent = "¡Copiado! ✓";
          setTimeout(() => { copyBtn.textContent = "📋 Copiar"; }, 1600);
          showToast(`Código copiado`);
        } catch { showToast("Error al copiar", true); }
      }
    }
    if (editBtn && state.isAdmin) {
      audio.playClick();
      const proj = state.projects.find((p) => String(p.id) === String(editBtn.dataset.edit));
      if (!proj) return;
      $("modal-project-title").textContent = "Editar Publicación";
      $("project-id").value = proj.id;
      $("project-title").value = proj.title;
      $("project-category").value = proj.category;
      $("project-format").value = proj.format || ".html";
      $("project-url").value = proj.url || "";
      $("project-desc").value = proj.description || "";
      $("project-code").value = proj.code || "";
      openModal("modal-project");
    }
    if (delBtn && state.isAdmin) {
      audio.playDelete();
      const proj = state.projects.find((p) => String(p.id) === String(delBtn.dataset.delete));
      if (!proj) return;
      state.deleteTargetId = proj.id;
      $("delete-confirm-text").textContent = `¿Seguro que deseas eliminar "${proj.title}"?`;
      openModal("modal-confirm-delete");
    }
  });

  document.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      audio.playClick();
      state.currentFilter = tab.dataset.filter;
      document.querySelectorAll(".filter-tab").forEach((t) => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      renderProjects();
    });
  });

  const searchInput = $("search-projects");
  const clearSearchBtn = $("btn-search-clear");
  searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value.trim();
    clearSearchBtn?.classList.toggle("hidden", !state.searchQuery);
    renderProjects();
  });
  clearSearchBtn?.addEventListener("click", () => { audio.playClick(); searchInput.value = ""; state.searchQuery = ""; clearSearchBtn.classList.add("hidden"); searchInput.focus(); renderProjects(); });

  $("tab-show-code")?.addEventListener("click", () => { audio.playClick(); showViewerTab("code"); });
  $("tab-show-preview")?.addEventListener("click", () => { audio.playClick(); showViewerTab("preview"); });
  $("btn-preview-device-full")?.addEventListener("click", () => { audio.playClick(); setPreviewDevice("full"); });
  $("btn-preview-device-mobile")?.addEventListener("click", () => { audio.playClick(); setPreviewDevice("mobile"); });
  $("btn-preview-reload")?.addEventListener("click", () => { audio.playPop(); loadPreviewIframe(); showToast("Vista previa recargada 🔄"); });

  $("btn-copy-code")?.addEventListener("click", async () => {
    if (!state.activeViewerProject) return;
    try {
      await navigator.clipboard.writeText(state.activeViewerProject.code || "");
      audio.playSuccess();
      const textSpan = $("btn-copy-text");
      if (textSpan) textSpan.textContent = "¡Copiado! ✓";
      setTimeout(() => { if (textSpan) textSpan.textContent = "Copiar Código"; }, 1800);
      showToast("Código copiado ✓");
    } catch { showToast("Error al copiar", true); }
  });

  $("btn-download-code")?.addEventListener("click", () => {
    const proj = state.activeViewerProject;
    if (!proj) return;
    audio.playSuccess();
    const ext = (proj.format || ".txt").startsWith(".") ? proj.format : `.${proj.format}`;
    const filename = proj.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ext;
    const blob = new Blob([proj.code || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Descargando ${filename}`);
  });

  $("cat-stage")?.addEventListener("click", (e) => triggerCatPet(e));
  $("btn-pet-cat")?.addEventListener("click", (e) => triggerCatPet(e));
  $("btn-theme-toggle")?.addEventListener("click", toggleTheme);
  $("btn-sound-toggle")?.addEventListener("click", toggleSound);

  const openAdminAccess = () => {
    audio.playClick();
    if (state.isAdmin) {
      $("owner-toolbar").scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      $("input-pin").value = "";
      $("pin-error-msg").classList.add("hidden");
      openModal("modal-pin");
      setTimeout(() => $("input-pin").focus(), 60);
    }
  };
  $("btn-nav-admin").addEventListener("click", openAdminAccess);
  $("btn-hero-admin-access").addEventListener("click", openAdminAccess);

  $("form-pin").addEventListener("submit", (e) => {
    e.preventDefault();
    if ($("input-pin").value.trim() === getStoredPin()) {
      state.isAdmin = true;
      audio.playSuccess();
      closeModal("modal-pin");
      updateAdminUI();
      showToast("Modo Propietario activado ✓");
    } else {
      audio.playDelete();
      $("pin-error-msg").classList.remove("hidden");
    }
  });

  $("btn-owner-logout").addEventListener("click", () => {
    audio.playClick();
    state.isAdmin = false;
    updateAdminUI();
    showToast("Sesión de propietario finalizada");
  });

  $("btn-owner-add-project").addEventListener("click", () => {
    audio.playClick();
    $("modal-project-title").textContent = "Publicar Nuevo Proyecto";
    $("form-project").reset();
    $("project-id").value = "";
    $("project-format").value = ".html";
    openModal("modal-project");
  });

  $("form-project").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!state.isAdmin) return;
    const id = $("project-id").value;
    const rawFmt = $("project-format").value.trim();
    const payload = {
      title: $("project-title").value.trim(),
      category: $("project-category").value,
      format: rawFmt.startsWith(".") ? rawFmt : `.${rawFmt}`,
      url: $("project-url").value.trim(),
      description: $("project-desc").value.trim(),
      code: $("project-code").value
    };
    await saveProjectToSupabase(payload, id ? id : null);
    closeModal("modal-project");
  });

  $("btn-confirm-delete-action").addEventListener("click", async () => {
    if (!state.isAdmin || !state.deleteTargetId) return;
    await deleteProjectFromSupabase(state.deleteTargetId);
    state.deleteTargetId = null;
    closeModal("modal-confirm-delete");
  });

  $("btn-owner-edit-profile").addEventListener("click", () => {
    audio.playClick();
    $("edit-profile-name").value = state.profile.name;
    $("edit-profile-role").value = state.profile.role;
    $("edit-profile-bio").value = state.profile.bio;
    $("edit-profile-tags").value = (state.profile.tags || []).join(", ");
    openModal("modal-profile");
  });

  $("form-profile").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!state.isAdmin) return;
    state.profile = {
      name: $("edit-profile-name").value.trim(),
      role: $("edit-profile-role").value.trim(),
      bio: $("edit-profile-bio").value.trim(),
      tags: $("edit-profile-tags").value.split(",").map((t) => t.trim()).filter(Boolean)
    };
    audio.playSuccess();
    saveState();
    renderProfile();
    closeModal("modal-profile");
    showToast("Perfil actualizado ✓");
  });

  $("btn-owner-pin").addEventListener("click", () => {
    audio.playClick();
    $("new-admin-pin").value = "";
    openModal("modal-change-pin");
  });

  $("form-change-pin").addEventListener("submit", (e) => {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEYS.PIN, $("new-admin-pin").value.trim());
    audio.playSuccess();
    closeModal("modal-change-pin");
    showToast("PIN actualizado con éxito ✓");
  });

  $("btn-owner-backup").addEventListener("click", () => {
    audio.playSuccess();
    const data = JSON.stringify({ profile: state.profile, projects: state.projects }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portafolio-respaldo-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Respaldo JSON descargado ✓");
  });
}

// ==================== 16. INICIALIZACIÓN ====================
async function initApp() {
  loadState();
  setTheme(state.theme, false);
  updateSoundUI();
  renderProfile();

  // Cargar proyectos directamente desde Supabase
  await loadProjectsFromSupabase();

  if (state.petCount > 0) {
    $("pet-count-label").textContent = `Mimado x${state.petCount} ✨`;
  }

  setupEvents();
  setupCatEyeTracking();
  setupWaterRippleEffect();
  setupEasterEggs();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
