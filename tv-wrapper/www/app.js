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

function loadPlayer() {
  if (!isOnline) {
    showLoader('Sem ligação à Internet. A aguardar rede...');
    return;
  }

  statusText.innerText = 'A carregar player...';
  
  // Set the iframe src
  playerFrame.src = TARGET_URL;

  // Wait for iframe to load
  playerFrame.onload = () => {
    // Only transition if we successfully loaded (not an error page injected by browser)
    // For cross-origin we can't inspect the content, so we assume load event = success.
    playerLoaded = true;
    hideLoader();
  };

  playerFrame.onerror = () => {
    playerLoaded = false;
    showLoader('Erro ao carregar. A tentar novamente...');
    setTimeout(loadPlayer, CHECK_INTERVAL);
  };
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
