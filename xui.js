(function(window) {
  let chatContainer;
  let iframeElement;

  function createUI() {
    const style = document.createElement('style');
    style.textContent = `
      body{font-family:Arial,sans-serif;margin:0;padding:0;background-color:#1e1e1e;color:#e0e0e0;display:flex;height:100vh;overflow:hidden}
      .lp{flex:1;display:flex;flex-direction:column;padding:10px;border-right:1px solid #333;overflow-y:auto;min-width:200px;max-width:calc(100% - 210px)}
      .rp{flex:1;padding:0;display:flex;flex-direction:column;position:relative;transition:all 0.3s ease;min-width:200px}
      .ch{text-align:left;margin-bottom:10px;font-size:14px;color:#888;padding-left:10px}
      .cm{flex-grow:1;overflow-y:auto;border:1px solid #333;padding:10px;margin-bottom:10px;background-color:#2a2a2a}
      .mg{margin-bottom:10px;padding:10px;border-radius:5px}
      .um{background-color:#3a3a3a;text-align:right}
      .am{background-color:#2a2a2a;text-align:left}
      .ci{display:flex;align-items:center}
      #ui{flex-grow:1;padding:5px;border:1px solid #333;border-radius:5px;background-color:#2a2a2a;color:#e0e0e0;resize:vertical;min-height:20px;height:30px}
      #sb{padding:5px 10px;background-color:#4CAF50;color:white;border:none;border-radius:5px;margin-left:10px;cursor:pointer;height:30px}
      #tc{width:100%;height:100%;background-color:#000;position:relative}
      .cc{background-color:#2a2a2a;border:1px solid #333;border-radius:5px;padding:10px;margin-top:10px;white-space:pre-wrap;font-family:monospace;overflow-x:auto;position:relative}
      #in{position:absolute;top:10px;left:50%;transform:translateX(-50%);text-align:center;background-color:rgba(0,0,0,0.5);padding:10px;border-radius:5px}
      #fb{position:absolute;top:10px;right:10px;padding:5px 10px;background-color:#4CAF50;color:white;border:none;border-radius:5px;cursor:pointer;z-index:1000}
      .fullscreen{position:fixed !important;top:0 !important;left:0 !important;width:100% !important;height:100% !important;z-index:9999}
      #divider{width:10px;background-color:#444;cursor:col-resize;flex-shrink:0}
      .copy-btn{position:absolute;top:5px;right:5px;background-color:#4CAF50;color:white;border:none;border-radius:3px;padding:3px 6px;cursor:pointer;font-size:12px}
      #console{background-color:#1a1a1a;color:#e0e0e0;font-family:monospace;padding:10px;margin-top:10px;border:1px solid #333;border-radius:5px;height:150px;overflow-y:auto;display:none}
      #console-input{width:calc(100% - 12px);background-color:#2a2a2a;color:#e0e0e0;border:1px solid #333;padding:5px;margin-top:5px;border-radius:3px;font-size:14px;display:none}
      #toggle-console{position:fixed;top:10px;left:10px;z-index:1001;padding:5px 10px;background-color:#4CAF50;color:white;border:none;border-radius:5px;cursor:pointer}
    `;
    document.head.appendChild(style);

    const body = document.body;
    body.innerHTML = `
      <button id="toggle-console">Show Console</button>
      <div class="lp">
        <div class="ch">Chat with Claude AI</div>
        <div class="cm" id="cm"></div>
        <form class="ci" id="cf">
          <textarea id="ui" placeholder="Type your message here..." required></textarea>
          <button type="submit" id="sb">Send</button>
        </form>
        <div id="console"></div>
        <input type="text" id="console-input" placeholder="Enter JavaScript code...">
      </div>
      <div id="divider"></div>
      <div class="rp" id="ar">
        <button id="fb">Fullscreen</button>
        <iframe srcdoc="<!DOCTYPE html>
<html lang='en'>
<head>
  <meta charset='UTF-8'>
  <style>
    body { margin: 0; overflow: hidden; }
    canvas { display: block; }
    .hidden-cursor { cursor: none; }
  </style>
</head>
<body>
  <script src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'></script>
  <script>
  </script>
</body>
</html>" style="width:100%;height:100%;border:none;"></iframe>
      </div>
    `;

    chatContainer = document.getElementById('cm');
    iframeElement = document.querySelector('.rp iframe');

    const cf = document.getElementById('cf');
    const ui = document.getElementById('ui');
    const fb = document.getElementById('fb');
    const divider = document.getElementById('divider');
    const leftPanel = document.querySelector('.lp');
    const rightPanel = document.querySelector('.rp');
    const consoleElement = document.getElementById('console');
    const consoleInput = document.getElementById('console-input');
    const toggleConsoleBtn = document.getElementById('toggle-console');

    cf.addEventListener('submit', function(e) {
      e.preventDefault();
      sendChatMessage(ui.value, true);
      ui.value = '';
    });

    ui.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        cf.dispatchEvent(new Event('submit'));
      }
    });

    fb.addEventListener('click', function() {
      rightPanel.classList.toggle('fullscreen');
      if (rightPanel.classList.contains('fullscreen')) {
        this.textContent = 'Exit Fullscreen';
        leftPanel.style.display = 'none';
        divider.style.display = 'none';
      } else {
        this.textContent = 'Fullscreen';
        leftPanel.style.display = 'flex';
        divider.style.display = 'block';
      }
    });

    let isResizing = false;

    divider.addEventListener('mousedown', (e) => {
      isResizing = true;
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResize);
    });

    function resize(e) {
      if (isResizing) {
        const totalWidth = window.innerWidth;
        const newLeftWidth = e.clientX;
        const newRightWidth = totalWidth - e.clientX - divider.offsetWidth;

        if (newLeftWidth > 200 && newRightWidth > 200) {
          leftPanel.style.flex = '0 0 ' + newLeftWidth + 'px';
          rightPanel.style.flex = '0 0 ' + newRightWidth + 'px';
        }
      }
    }

    function stopResize() {
      isResizing = false;
      document.removeEventListener('mousemove', resize);
    }

    function copyCode(button) {
      const codeBlock = button.parentElement;
      const code = codeBlock.textContent.replace('Copy', '').trim();
      
      navigator.clipboard.writeText(code).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    }

    document.querySelectorAll('.cc').forEach(block => {
      const copyButton = document.createElement('button');
      copyButton.className = 'copy-btn';
      copyButton.textContent = 'Copy';
      copyButton.onclick = function() { copyCode(this); };
      block.appendChild(copyButton);
    });

    function log(message, isError = false) {
      const logElement = document.createElement('div');
      logElement.textContent = typeof message === 'object' ? JSON.stringify(message) : message;
      if (isError) {
        logElement.style.color = '#ff6b6b';
      }
      consoleElement.appendChild(logElement);
      consoleElement.scrollTop = consoleElement.scrollHeight;
    }

    consoleInput.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        const code = this.value;
        log('> ' + code);
        try {
          const result = eval(code);
          log(result);
        } catch (error) {
          log('Error: ' + error.message, true);
        }
        this.value = '';
      }
    });

    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    console.log = function() {
      const args = Array.from(arguments);
      log(args.join(' '));
      originalConsoleLog.apply(console, arguments);
    };

    console.error = function() {
      const args = Array.from(arguments);
      log(args.join(' '), true);
      originalConsoleError.apply(console, arguments);
    };

    window.addEventListener('error', function(event) {
      log('Global Error: ' + event.message, true);
    });

    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'error') {
        log('iframe Error: ' + event.data.message, true);
      }
    });

    function toggleConsole() {
      if (getComputedStyle(consoleElement).display === 'none') {
        consoleElement.style.display = 'block';
        consoleInput.style.display = 'block';
        toggleConsoleBtn.textContent = 'Hide Console';
      } else {
        consoleElement.style.display = 'none';
        consoleInput.style.display = 'none';
        toggleConsoleBtn.textContent = 'Show Console';
      }
    }

    toggleConsoleBtn.addEventListener('click', toggleConsole);
  }

  function addToChatContainer(content) {
    if (chatContainer) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'mg am';
      messageDiv.innerHTML = content;
      chatContainer.appendChild(messageDiv);
    } else {
      console.error('Chat container not initialized. Call createUI() first.');
    }
  }

  function sendChatMessage(message, redirect = false) {
    if (chatContainer) {
      const userMessageDiv = document.createElement('div');
      userMessageDiv.className = 'mg um';
      userMessageDiv.textContent = message;
      chatContainer.appendChild(userMessageDiv);

      const encodedMessage = encodeURIComponent(message.replace(/ /g, '+'));
      const url = 'https://Claude.ai/chat?message=' + encodedMessage;

      console.log('Sending message:', message);
      console.log('Encoded URL:', url);
      
      if (redirect) {
        window.location.href = url;
      }
    } else {
      console.error('Chat container not initialized. Call createUI() first.');
    }
  }

  function addCodeToIframe(code) {
    if (iframeElement) {
      const script = iframeElement.contentWindow.document.createElement('script');
      script.textContent = code;
      iframeElement.contentWindow.document.body.appendChild(script);
    } else {
      console.error('Iframe not initialized. Call createUI() first.');
    }
  }

  window.xui = {
    createUI: createUI,
    addToChatContainer: addToChatContainer,
    sendChatMessage: sendChatMessage,
    addCodeToIframe: addCodeToIframe
  };
})(window);