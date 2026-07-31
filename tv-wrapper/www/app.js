// SwiftDisplay Player Wrapper Logic
const TARGET_URL = 'https://swiftdisplay.pt/player';
const CHECK_INTERVAL = 10000; // 10 seconds between offline retries

let isOnline = navigator.onLine;
let playerLoaded = false;

const loaderUI = document.getElementById('loader-ui');
const playerContainer = document.getElementById('player-container');
const playerFrame = document.getElementById('player-frame');
const statusText = document.getElementById('status-text');

// Handle Network Events
window.addEventListener('online', () => {
  isOnline = true;
  if (!playerLoaded) {
    statusText.innerText = 'A conectar...';
    loadPlayer();
  }
});

window.addEventListener('offline', () => {
  isOnline = false;
  // If the player is already loaded, we don't necessarily want to pull them out of it, 
  // as the player itself might have offline caching. We only update status if it hasn't loaded.
  if (!playerLoaded) {
    showLoader('Sem ligação à Internet. A aguardar rede...');
  }
});

// Loading functions
function showLoader(text) {
  statusText.innerText = text;
  loaderUI.classList.add('active');
  playerContainer.classList.remove('active');
}

function hideLoader() {
  loaderUI.classList.remove('active');
  playerContainer.classList.add('active');
}

async function loadPlayer() {
  if (!navigator.onLine) {
    showLoader('A aguardar ligação à Internet...');
    setTimeout(loadPlayer, CHECK_INTERVAL);
    return;
  }

  statusText.innerText = 'A verificar rede...';
  
  try {
    // Perform a pre-flight check to avoid loading Chrome's ugly error page in the iframe
    // if the network says it's online but DNS or routing is still settling during boot.
    await fetch(TARGET_URL, { mode: 'no-cors', cache: 'no-store' });
    
    statusText.innerText = 'A carregar player...';
    playerFrame.src = TARGET_URL;

    // Wait for iframe to load
    playerFrame.onload = () => {
      playerLoaded = true;
      hideLoader();
    };

    playerFrame.onerror = () => {
      playerLoaded = false;
      showLoader('Erro ao carregar interface. A tentar novamente...');
      setTimeout(loadPlayer, CHECK_INTERVAL);
    };
  } catch (err) {
    // Network is actually unreachable or DNS failed
    playerLoaded = false;
    showLoader('A aguardar estabilização da rede...');
    setTimeout(loadPlayer, CHECK_INTERVAL);
  }
}

// Future Signage API - Allows the iframe to communicate with the native wrapper via postMessage
window.addEventListener('message', (event) => {
  // Always verify origin in production, e.g., event.origin === 'https://swiftdisplay.pt'
  
  const data = event.data;
  if (!data || !data.type) return;
  
  // Example future commands:
  // - 'overlay:show': Inject a temporary full-screen alert
  // - 'ticker:update': Update a native scrolling text bar
  // - 'cache:sync': Native cache management
  console.log('[Wrapper] Received message from player:', data.type);
});

// Boot Sequence
setTimeout(() => {
  loadPlayer();
}, 1000); // Small artificial delay to show branding before flashing content
