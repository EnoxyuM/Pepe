// websim.js
class WebSim {
  constructor(options = {}) {
    this.formatting = options.formatting || 'The user will request a URL accompanied by some instructions. You are to imagine a creative webpage that satisfies these instructions. Always return full, complete, working HTML which will be embedded in an iframe as-is, without any modification. Respond in the same language as the user\'s prompt.';
    this.prompt = '';
    this.response = '';
    this.userPrompt = '';
    this.iframeContent = '';
    this.code = '';
    this.consoleOutput = '';
    this.showFormatting = false;
    this.showCode = false;
    this.showConsole = false;
    this.showHistory = false;
    this.history = [];
    this.currentHistoryIndex = -1;
    this.isLoading = false;
    this.isFullPage = false;
    this.isFullScreen = false;
    this.autoRun = true;
    this.lineCount = 1;

    this.init();
  }

  init() {
    this.createDOMStructure();
    this.attachEventListeners();
    this.updateLineCount();
  }

  createDOMStructure() {
    const appHTML = `
      <div id="websim-app">
        <div class="left-panel">
          <div class="button-group">
            <button id="toggle-formatting">Formatting Instructions</button>
            <button id="toggle-code">Code</button>
            <button id="toggle-console">Console</button>
            <button id="toggle-history">History</button>
            <button id="toggle-full-page">Full Page</button>
            <button id="toggle-full-screen">Full Screen</button>
          </div>
          <div class="formatting-instructions" style="display: none;">
            <textarea id="formatting-textarea" rows="5" style="width: 100%"></textarea>
          </div>
          <div class="code-area" style="display: none;">
            <div>
              <button id="run-code">Run</button>
              <label>
                <input type="checkbox" id="auto-run"> Auto Run
              </label>
            </div>
            <div class="code-editor">
              <div class="line-numbers"></div>
              <textarea id="code-textarea" class="code-textarea"></textarea>
            </div>
          </div>
          <div class="console-area" style="display: none;">
            <pre id="console-output"></pre>
          </div>
          <div class="history-area" style="display: none;">
          </div>
          <div class="response-area">
            <h3>Prompt:</h3>
            <pre id="prompt-text" class="prompt-text"></pre>
            <h3>Response:</h3>
            <pre id="response-text" class="response-text"></pre>
          </div>
          <div class="input-area">
            <textarea id="user-prompt" rows="3" style="flex-grow: 1;"></textarea>
            <button id="send-prompt">Send</button>
          </div>
        </div>
        <div class="right-panel">
          <iframe id="result-iframe" class="inner-iframe"></iframe>
          <button id="back-button" class="back-button" style="display: none;">Back</button>
        </div>
      </div>
    `;

    document.body.innerHTML = appHTML;
  }

  attachEventListeners() {
    document.getElementById('toggle-formatting').addEventListener('click', () => this.toggleFormatting());
    document.getElementById('toggle-code').addEventListener('click', () => this.toggleCode());
    document.getElementById('toggle-console').addEventListener('click', () => this.toggleConsole());
    document.getElementById('toggle-history').addEventListener('click', () => this.toggleHistory());
    document.getElementById('toggle-full-page').addEventListener('click', () => this.toggleFullPage());
    document.getElementById('toggle-full-screen').addEventListener('click', () => this.toggleFullScreen());
    document.getElementById('run-code').addEventListener('click', () => this.runCode());
    document.getElementById('auto-run').addEventListener('change', (e) => { this.autoRun = e.target.checked; });
    document.getElementById('send-prompt').addEventListener('click', () => this.sendPrompt());
    document.getElementById('user-prompt').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendPrompt();
      } else if (e.key === 'Enter' && e.shiftKey) {
        this.newLine(e);
      }
    });
    document.getElementById('code-textarea').addEventListener('input', () => this.updateLineCount());
    document.getElementById('code-textarea').addEventListener('scroll', (e) => this.syncScroll(e));
    document.getElementById('code-textarea').addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        this.handleTab(e);
      }
    });
    document.getElementById('back-button').addEventListener('click', () => this.toggleFullPage());

    window.addEventListener('message', (event) => {
      if (event.data.type === 'log') {
        this.consoleOutput += event.data.content + '\n';
        document.getElementById('console-output').textContent = this.consoleOutput;
      } else if (event.data.type === 'error') {
        this.consoleOutput += 'Error: ' + event.data.content + '\n';
        document.getElementById('console-output').textContent = this.consoleOutput;
      }
    });

    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        this.isFullScreen = false;
      }
    });

    window.addEventListener('beforeunload', function (event) {
      event.stopImmediatePropagation();
    });
  }

  async sendPrompt() {
    this.isLoading = true;
    document.getElementById('send-prompt').disabled = true;
    try {
      const response = await fetch('/api/web', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formatting: this.formatting,
          prompt: document.getElementById('user-prompt').value
        })
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      this.prompt = document.getElementById('user-prompt').value;
      this.response = data.response;
      this.iframeContent = data.html;
      this.code = data.html;
      this.updateLineCount();

      const now = new Date();
      this.history.push({
        date: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}-${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()}`,
        prompt: this.prompt,
        response: data.response,
        html: data.html
      });
      this.currentHistoryIndex = this.history.length - 1;

      document.getElementById('user-prompt').value = '';
      document.getElementById('prompt-text').textContent = this.prompt;
      document.getElementById('response-text').textContent = this.response;
      document.getElementById('result-iframe').srcdoc = this.injectConsoleCode(this.iframeContent);
      document.getElementById('code-textarea').value = this.code;
      this.updateHistory();
    } catch (error) {
      console.error('Error:', error);
      this.consoleOutput += `Error: ${error.message}\n`;
      document.getElementById('console-output').textContent = this.consoleOutput;
    } finally {
      this.isLoading = false;
      document.getElementById('send-prompt').disabled = false;
    }
  }

  newLine(event) {
    const textarea = event.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    textarea.value = value.substring(0, start) + '\n' + value.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + 1;
  }

  toggleFormatting() {
    this.showFormatting = !this.showFormatting;
    document.querySelector('.formatting-instructions').style.display = this.showFormatting ? 'block' : 'none';
  }

  toggleCode() {
    this.showCode = !this.showCode;
    document.querySelector('.code-area').style.display = this.showCode ? 'block' : 'none';
    document.querySelector('.response-area').style.display = this.showCode ? 'none' : 'block';
  }

  toggleConsole() {
    this.showConsole = !this.showConsole;
    document.querySelector('.console-area').style.display = this.showConsole ? 'block' : 'none';
  }

  toggleHistory() {
    this.showHistory = !this.showHistory;
    document.querySelector('.history-area').style.display = this.showHistory ? 'block' : 'none';
  }

  toggleFullPage() {
    this.isFullPage = !this.isFullPage;
    this.isFullScreen = false;
    document.querySelector('.left-panel').classList.toggle('hidden', this.isFullPage);
    document.querySelector('.right-panel').classList.toggle('w-full', this.isFullPage);
    document.getElementById('back-button').style.display = this.isFullPage ? 'block' : 'none';
  }

  toggleFullScreen() {
    this.isFullScreen = !this.isFullScreen;
    this.isFullPage = false;
    const iframe = document.getElementById('result-iframe');
    if (this.isFullScreen) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
      } else if (iframe.msRequestFullscreen) {
        iframe.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }

  runCode() {
    document.getElementById('result-iframe').srcdoc = this.injectConsoleCode(this.code);
  }

  autoRunCode() {
    if (this.autoRun) {
      this.runCode();
    }
  }

  loadHistoryItem(index) {
    const item = this.history[index];
    this.prompt = item.prompt;
    this.response = item.response;
    this.iframeContent = this.injectConsoleCode(item.html);
    this.code = item.html;
    this.currentHistoryIndex = index;
    this.updateLineCount();
    document.getElementById('prompt-text').textContent = this.prompt;
    document.getElementById('response-text').textContent = this.response;
    document.getElementById('result-iframe').srcdoc = this.iframeContent;
    document.getElementById('code-textarea').value = this.code;
    this.updateHistory();
  }

  injectConsoleCode(html) {
    const consoleScript = `
      <script>
      (function(){
        var oldLog = console.log;
        console.log = function(...args) {
          oldLog.apply(console, args);
          window.parent.postMessage({type: 'log', content: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')}, '*');
        };
        window.onerror = function(message, source, lineno, colno, error) {
          window.parent.postMessage({type: 'error', content: message + ' (' + source + ':' + lineno + ':' + colno + ')'}, '*');
        };
        window.addEventListener('beforeunload', function (event) {
          event.stopImmediatePropagation();
        });
      })();
      <\/script>
    `;
    return html.replace('</head>', consoleScript + '</head>');
  }

  updateLineCount() {
    const textarea = document.getElementById('code-textarea');
    this.lineCount = textarea.value.split('\n').length;
    const lineNumbers = document.querySelector('.line-numbers');
    lineNumbers.innerHTML = Array(this.lineCount).fill().map((_, i) => `<div>${i + 1}</div>`).join('');
  }

  syncScroll(e) {
    const lineNumbers = e.target.previousElementSibling;
    lineNumbers.scrollTop = e.target.scrollTop;
  }

  handleTab(e) {
    e.preventDefault();
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    e.target.value = e.target.value.substring(0, start) + "  " + e.target.value.substring(end);
    e.target.selectionStart = e.target.selectionEnd = start + 2;
    this.code = e.target.value;
    this.autoRunCode();
  }

  updateHistory() {
    const historyArea = document.querySelector('.history-area');
    historyArea.innerHTML = this.history.map((item, index) => `
      <div class="history-item ${index === this.currentHistoryIndex ? 'current' : ''}" data-index="${index}">
        ${item.date} - ${item.prompt}
      </div>
    `).join('');
    historyArea.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => this.loadHistoryItem(parseInt(item.dataset.index)));
    });
  }
}
