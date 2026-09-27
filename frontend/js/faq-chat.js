(function() {
  const template = `
    <div id="swift-chat-widget">
      <button id="swift-chat-launcher">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
      <div id="swift-chat-panel" class="hidden">
        <div class="swift-chat-header">
          <img src="/assets/swiftdisplaylogo.png" alt="SwiftDisplay">
          <div class="swift-chat-header-info">
            <strong>Swift Assistant</strong>
            <span>Always online to help</span>
          </div>
          <button id="swift-chat-close">&times;</button>
        </div>
        <div class="swift-chat-messages" id="swift-chat-messages">
          <div class="swift-message system">
            Hello! I'm the SwiftDisplay virtual assistant. How can I help you today?
          </div>
        </div>
        <div class="swift-chat-input">
          <input type="text" placeholder="Type your question..." id="swift-chat-input-field">
          <button id="swift-chat-send">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  const faqs = [
    {
      q: "What are the plans and prices?",
      a: "We offer Basic (€15/mo), Standard (€50/mo), and Premium (€100/mo) plans. Check our Pricing section for details!"
    },
    {
      q: "How does URL display work?",
      a: "You can create a unique URL from the dashboard to directly open a display in a browser without pairing via QR."
    }
  ];

  function init() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/faq-chat.css';
    document.head.appendChild(link);

    document.body.insertAdjacentHTML('beforeend', template);

    const launcher = document.getElementById('swift-chat-launcher');
    const panel = document.getElementById('swift-chat-panel');
    const close = document.getElementById('swift-chat-close');
    const messagesContainer = document.getElementById('swift-chat-messages');
    const input = document.getElementById('swift-chat-input-field');
    const send = document.getElementById('swift-chat-send');

    launcher.addEventListener('click', () => {
      panel.classList.toggle('hidden');
      launcher.classList.toggle('hidden');
    });

    close.addEventListener('click', () => {
      panel.classList.add('hidden');
      launcher.classList.remove('hidden');
    });

    function addMessage(text, type) {
      const msg = document.createElement('div');
      msg.className = `swift-message ${type}`;
      msg.textContent = text;
      messagesContainer.appendChild(msg);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function addOptions() {
      const opts = document.createElement('div');
      opts.className = 'swift-options';
      faqs.forEach(faq => {
        const btn = document.createElement('button');
        btn.textContent = faq.q;
        btn.onclick = () => {
          addMessage(faq.q, 'user');
          opts.remove();
          setTimeout(() => addMessage(faq.a, 'system'), 500);
        };
        opts.appendChild(btn);
      });
      messagesContainer.appendChild(opts);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    setTimeout(addOptions, 1000);

    send.addEventListener('click', () => {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      addMessage(text, 'user');
      setTimeout(() => {
        addMessage("I am a simple FAQ bot. Please choose from the common questions above or contact support.", 'system');
      }, 500);
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') send.click();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
