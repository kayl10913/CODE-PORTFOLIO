(function () {
  'use strict';

  var chatFloatBtn = document.getElementById('chat-float-btn');
  var chatPanel = document.getElementById('chat-panel');
  var chatPanelClose = document.getElementById('chat-panel-close');
  var chatMessages = document.getElementById('chat-messages');
  var chatWelcome = document.getElementById('chat-welcome');
  var chatInput = document.getElementById('chat-input');
  var chatSend = document.getElementById('chat-send');

  var history = [];
  var isLoading = false;

  function openPanel() {
    if (!chatPanel) return;
    chatPanel.classList.add('is-open');
    chatPanel.setAttribute('aria-hidden', 'false');
    if (chatInput) chatInput.focus();
  }

  function closePanel() {
    if (!chatPanel) return;
    chatPanel.classList.remove('is-open');
    chatPanel.setAttribute('aria-hidden', 'true');
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

  function addMessage(role, text, isError) {
    if (!chatMessages) return;
    if (chatWelcome) chatWelcome.style.display = 'none';
    var div = document.createElement('div');
    div.className = 'chat-msg ' + (role === 'user' ? 'user' : role === 'error' ? 'error' : 'model');
    if (role === 'loading') div.className = 'chat-msg model chat-msg-loading';
    if (role === 'model') {
      div.innerHTML = renderMarkdown(text);
    } else {
      div.textContent = text;
    }
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
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

    var loadingEl = document.createElement('div');
    loadingEl.className = 'chat-msg model chat-msg-loading';
    loadingEl.setAttribute('aria-live', 'polite');
    loadingEl.setAttribute('aria-label', 'AI is typing');
    var typingWrap = document.createElement('span');
    typingWrap.className = 'chat-typing-dots';
    typingWrap.innerHTML = '<span></span><span></span><span></span>';
    loadingEl.appendChild(typingWrap);
    chatMessages.appendChild(loadingEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;

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
        if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
      });
  }

  if (chatFloatBtn) chatFloatBtn.addEventListener('click', openPanel);
  if (chatPanelClose) chatPanelClose.addEventListener('click', closePanel);
  if (chatSend) chatSend.addEventListener('click', sendMessage);
  if (chatInput) {
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
})();
