// claude-chat-lib.js
(function(window) {
  window.ClaudeChat = {
    init: function() {
      this.setupEventListeners();
      this.setupConsole();
      this.setupResizing();
    },
    setupEventListeners: function() {
      document.getElementById('cf').addEventListener('submit', this.handleSubmit);
      document.getElementById('ui').addEventListener('keydown', this.handleEnterKey);
      document.getElementById('fb').addEventListener('click', this.toggleFullscreen);
    },
    handleSubmit: function(e) {
      e.preventDefault();
      var i = document.getElementById('ui'),
          m = document.getElementById('cm'),
          u = document.createElement('div');
      u.className = 'mg um';
      u.textContent = i.value;
      m.appendChild(u);
      var n = encodeURIComponent(i.value.replace(/ /g, '+'));
      window.location.href = 'https://Claude.ai/chat?message=' + n;
    },
    handleEnterKey: function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('cf').dispatchEvent(new Event('submit'));
      }
    },
    toggleFullscreen: function() {
      var container = document.querySelector('.rp');
      var leftPanel = document.querySelector('.lp');
      var divider = document.getElementById('divider');
      container.classList.toggle('fullscreen');
      if (container.classList.contains('fullscreen')) {
        this.textContent = 'Exit Fullscreen';
        leftPanel.style.display = 'none';
        divider.style.display = 'none';
      } else {
        this.textContent = 'Fullscreen';
        leftPanel.style.display = 'flex';
        divider.style.display = 'block';
      }
    },
    setupResizing: function() {
      let isResizing = false;
      const divider = document.getElementById('divider');
      const leftPanel = document.querySelector('.lp');
      const rightPanel = document.querySelector('.rp');

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
    },
    copyCode: function(button) {
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
    },
    setupConsole: function() {
      const consoleElement = document.getElementById('console');
      const consoleInput = document.getElementById('console-input');
      const toggleConsoleBtn = document.getElementById('toggle-console');

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

      toggleConsoleBtn.addEventListener('click', function() {
        if (getComputedStyle(consoleElement).display === 'none') {
          consoleElement.style.display = 'block';
          consoleInput.style.display = 'block';
          toggleConsoleBtn.textContent = 'Hide Console';
        } else {
          consoleElement.style.display = 'none';
          consoleInput.style.display = 'none';
          toggleConsoleBtn.textContent = 'Show Console';
        }
      });
    }
  };
})(window);