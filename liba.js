(function() {
    let iframe, codeWindow, runButton, codeButton, logButton, consoleElement;

    function createIframe() {
        iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        return iframe;
    }

    function setIframeContent(content) {
        iframe.srcdoc = content;
    }

    function createCodeWindow() {
        codeWindow = document.createElement('div');
        codeWindow.style.cssText = 'position: fixed; top: 50px; left: 10px; width: 400px; height: 300px; background: white; border: 1px solid black; display: none;';
        
        const codeArea = document.createElement('textarea');
        codeArea.style.cssText = 'width: 100%; height: calc(100% - 30px);';
        codeWindow.appendChild(codeArea);

        runButton = document.createElement('button');
        runButton.textContent = 'Run';
        runButton.style.cssText = 'position: absolute; top: 5px; left: 5px;';
        runButton.onclick = function() {
            setIframeContent(codeArea.value);
        };
        codeWindow.appendChild(runButton);

        document.body.appendChild(codeWindow);

        window.addEventListener('load', function() {
            codeArea.value = iframe.srcdoc;
        });
    }

    function createCodeButton() {
        codeButton = document.createElement('button');
        codeButton.textContent = 'Code';
        codeButton.style.cssText = 'position: fixed; top: 10px; left: 10px;';
        codeButton.onclick = function() {
            codeWindow.style.display = codeWindow.style.display === 'none' ? 'block' : 'none';
            runButton.style.display = codeWindow.style.display;
        };
        document.body.appendChild(codeButton);
    }

    function createConsole() {
        consoleElement = document.createElement('div');
        consoleElement.style.cssText = 'position: fixed; bottom: 0; left: 0; width: 100%; height: 150px; background: black; color: white; overflow: auto; display: none;';
        document.body.appendChild(consoleElement);

        const oldLog = console.log;
        console.log = function() {
            oldLog.apply(console, arguments);
            const msg = Array.from(arguments).join(' ');
            consoleElement.innerHTML += msg + '<br>';
        };

        window.onerror = function(message, source, lineno, colno, error) {
            console.log('Error:', message, 'at', source, 'line', lineno);
        };

        iframe.contentWindow.onerror = function(message, source, lineno, colno, error) {
            console.log('iframe Error:', message, 'at', source, 'line', lineno);
        };
    }

    function createLogButton() {
        logButton = document.createElement('button');
        logButton.textContent = 'Log';
        logButton.style.cssText = 'position: fixed; top: 10px; left: 70px;';
        logButton.onclick = function() {
            consoleElement.style.display = consoleElement.style.display === 'none' ? 'block' : 'none';
        };
        document.body.appendChild(logButton);
    }

    function init() {
        createIframe();
        createCodeWindow();
        createCodeButton();
        createConsole();
        createLogButton();
    }

    window.liba = {
        init: init,
        getIframe: () => iframe,
        getCodeWindow: () => codeWindow,
        getRunButton: () => runButton,
        getCodeButton: () => codeButton,
        getLogButton: () => logButton,
        getConsole: () => consoleElement,
        setIframeContent: setIframeContent
    };
})();