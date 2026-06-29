(function () {
  'use strict';

  var chatFloatBtn = document.getElementById('chat-float-btn');
  var chatPanel = document.getElementById('chat-panel');
  var chatPanelClose = document.getElementById('chat-panel-close');
  var chatPanelMinimize = document.getElementById('chat-panel-minimize');
  var chatPanelMaximize = document.getElementById('chat-panel-maximize');
  var chatPanelTitlebar = chatPanel && chatPanel.querySelector('.chat-panel-titlebar');
  var chatForm = document.getElementById('chat-form');
  var chatMessages = document.getElementById('chat-messages');
  var chatWelcome = document.getElementById('chat-welcome');
  var chatInput = document.getElementById('chat-input');
  var chatSend = document.getElementById('chat-send');

  var history = [];
  var isLoading = false;

  function getChatWindowState() {
    return chatPanel ? chatPanel.getAttribute('data-state') || 'normal' : 'normal';
  }

  function updateChatWindowLabels(state) {
    if (chatPanelMaximize) {
      chatPanelMaximize.setAttribute(
        'aria-label',
        state === 'maximized' ? 'Restore assistant size' : 'Maximize assistant'
      );
    }
    if (chatPanelMinimize) {
      chatPanelMinimize.setAttribute(
        'aria-label',
        state === 'minimized' ? 'Restore assistant' : 'Minimize assistant'
      );
    }
  }

  function setChatWindowState(state) {
    if (!chatPanel) return;

    chatPanel.classList.remove('is-minimized', 'is-maximized');
    document.body.classList.remove('chat-assistant-maximized');

    if (state === 'minimized') chatPanel.classList.add('is-minimized');
    if (state === 'maximized') {
      chatPanel.classList.add('is-maximized');
      document.body.classList.add('chat-assistant-maximized');
    }

    chatPanel.setAttribute('data-state', state);
    updateChatWindowLabels(state);

    if (state === 'normal' && chatInput && chatPanel.classList.contains('is-open')) {
      window.setTimeout(function () {
        try {
          chatInput.focus({ preventScroll: true });
        } catch (e) {
          chatInput.focus();
        }
      }, 350);
    }
  }

  function resetChatWindowState() {
    setChatWindowState('normal');
  }

  function openPanel() {
    if (!chatPanel) return;
    chatPanel.classList.add('is-open');
    chatPanel.setAttribute('aria-hidden', 'false');
    if (chatFloatBtn) chatFloatBtn.classList.add('is-hidden');
    document.body.classList.add('chat-terminal-open');
    if (chatInput) {
      window.setTimeout(function () {
        try {
          chatInput.focus({ preventScroll: true });
        } catch (e) {
          chatInput.focus();
        }
      }, 180);
    }
  }

  function closePanel() {
    if (!chatPanel) return;
    chatPanel.classList.remove('is-open');
    chatPanel.setAttribute('aria-hidden', 'true');
    if (chatFloatBtn) chatFloatBtn.classList.remove('is-hidden');
    document.body.classList.remove('chat-terminal-open');
    resetChatWindowState();
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function renderMarkdown(text) {
    var escaped = escapeHtml(text);
    escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    escaped = escaped.replace(/\n/g, '<br>');
    return escaped;
  }

  function scrollToBottom() {
    if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function addMessage(role, text) {
    if (!chatMessages) return;
    if (chatWelcome) chatWelcome.style.display = 'none';

    var div = document.createElement('div');
    var safeText = escapeHtml(text);

    if (role === 'user') {
      div.className = 'chat-msg chat-msg-user terminal-line';
      div.innerHTML = '<span class="terminal-prompt">$</span> <span class="chat-command">' + safeText + '</span>';
    } else if (role === 'error') {
      div.className = 'chat-msg chat-msg-error terminal-line';
      div.innerHTML = '<span class="terminal-prompt terminal-prompt-error">!</span> <span class="chat-error-text">' + safeText + '</span>';
    } else if (role === 'loading') {
      div.className = 'chat-msg chat-msg-loading terminal-line';
      div.setAttribute('aria-live', 'polite');
      div.setAttribute('aria-label', 'Assistant is typing');
      div.innerHTML = '<span class="terminal-prompt-out">></span> <span class="chat-typing-dots"><span></span><span></span><span></span></span>';
    } else {
      div.className = 'chat-msg chat-msg-model terminal-block';
      div.innerHTML =
        '<p class="terminal-line terminal-line-out"><span class="terminal-prompt-out">></span></p>' +
        '<div class="terminal-output-text">' + renderMarkdown(text) + '</div>';
    }

    chatMessages.appendChild(div);
    scrollToBottom();
  }

  function removeLoadingMessage() {
    var loading = chatMessages && chatMessages.querySelector('.chat-msg-loading');
    if (loading) loading.remove();
  }

  function sendMessage() {
    if (!chatInput || !chatSend || isLoading) return;
    var text = (chatInput.value || '').trim();
    if (!text) return;

    chatInput.value = '';
    addMessage('user', text);
    history.push({ role: 'user', text: text });
    addMessage('loading', '');

    isLoading = true;
    chatSend.disabled = true;

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: history.slice(0, -1) }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.error || 'Request failed');
          return data;
        });
      })
      .then(function (data) {
        removeLoadingMessage();
        var reply = (data.reply || '').trim() || 'No response.';
        addMessage('model', reply);
        history.push({ role: 'model', text: reply });
      })
      .catch(function (err) {
        removeLoadingMessage();
        addMessage('error', err.message || 'Something went wrong. Please try again.');
      })
      .finally(function () {
        isLoading = false;
        chatSend.disabled = false;
        scrollToBottom();
        if (chatInput) {
          try {
            chatInput.focus({ preventScroll: true });
          } catch (e) {
            chatInput.focus();
          }
        }
      });
  }

  if (chatFloatBtn) chatFloatBtn.addEventListener('click', openPanel);

  if (chatPanelClose) {
    chatPanelClose.addEventListener('click', function (e) {
      e.stopPropagation();
      closePanel();
    });
  }

  if (chatPanelMinimize) {
    chatPanelMinimize.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!chatPanel || !chatPanel.classList.contains('is-open')) return;
      var state = getChatWindowState();
      if (state === 'minimized') setChatWindowState('normal');
      else if (state === 'maximized') setChatWindowState('minimized');
      else setChatWindowState('minimized');
    });
  }

  if (chatPanelMaximize) {
    chatPanelMaximize.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!chatPanel || !chatPanel.classList.contains('is-open')) return;
      var state = getChatWindowState();
      if (state === 'maximized') setChatWindowState('normal');
      else setChatWindowState('maximized');
    });
  }

  if (chatPanelTitlebar) {
    chatPanelTitlebar.addEventListener('click', function (e) {
      if (e.target.closest('.chat-titlebar-dots')) return;
      if (getChatWindowState() === 'minimized') setChatWindowState('normal');
    });
  }

  if (chatForm) {
    chatForm.addEventListener('submit', function (e) {
      e.preventDefault();
      sendMessage();
    });
  }

  if (chatSend) {
    chatSend.addEventListener('click', function (e) {
      e.preventDefault();
      sendMessage();
    });
  }

  if (chatInput) {
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
      if (e.key === 'Escape') {
        if (getChatWindowState() === 'maximized') setChatWindowState('normal');
        else closePanel();
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !chatPanel || !chatPanel.classList.contains('is-open')) return;
    if (getChatWindowState() === 'maximized') setChatWindowState('normal');
    else closePanel();
  });

  document.body.addEventListener('click', function (e) {
    if (getChatWindowState() !== 'maximized') return;
    if (chatPanel && !chatPanel.contains(e.target)) {
      setChatWindowState('normal');
    }
  });

  window.openPortfolioChat = openPanel;
})();
