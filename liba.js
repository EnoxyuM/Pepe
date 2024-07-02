// Liba.js

// Объект для хранения настроек
const GameSettings = {
    mouseSensitivity: 0.002,
    moveSpeed: 0.1,
    keyBindings: {
        forward: 'KeyW',
        backward: 'KeyS',
        left: 'KeyA',
        right: 'KeyD',
        up: 'Space',
        down: 'ShiftLeft'
    }
};

// Объект для хранения состояния движения
const moveState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false
};

// Переменные для хранения углов вращения камеры
let pitch = 0;
let yaw = 0;

// Функция для настройки чувствительности мыши
function setMouseSensitivity(sensitivity) {
    GameSettings.mouseSensitivity = sensitivity;
}

// Функция для настройки скорости движения
function setMoveSpeed(speed) {
    GameSettings.moveSpeed = speed;
}

// Функция для переназначения клавиш
function rebindKey(action, newKey) {
    if (action in GameSettings.keyBindings) {
        GameSettings.keyBindings[action] = newKey;
    }
}

// Функция для обработки нажатия клавиш
function handleKeyDown(event) {
    for (let action in GameSettings.keyBindings) {
        if (event.code === GameSettings.keyBindings[action]) {
            moveState[action] = true;
            break;
        }
    }
}

// Функция для обработки отпускания клавиш
function handleKeyUp(event) {
    for (let action in GameSettings.keyBindings) {
        if (event.code === GameSettings.keyBindings[action]) {
            moveState[action] = false;
            break;
        }
    }
}

// Функция для обработки движения мыши
function handleMouseMove(event, camera) {
    if (document.pointerLockElement === event.target) {
        yaw -= event.movementX * GameSettings.mouseSensitivity;
        pitch -= event.movementY * GameSettings.mouseSensitivity;
        pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
        
        camera.rotation.order = 'YXZ';
        camera.rotation.y = yaw;
        camera.rotation.x = pitch;
    }
}

// Функция для обновления положения камеры
function updateCameraPosition(camera) {
    const direction = new THREE.Vector3();
    if (moveState.forward) direction.z -= 1;
    if (moveState.backward) direction.z += 1;
    if (moveState.left) direction.x -= 1;
    if (moveState.right) direction.x += 1;
    if (moveState.up) direction.y += 1;
    if (moveState.down) direction.y -= 1;
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    direction.normalize().multiplyScalar(GameSettings.moveSpeed);
    camera.position.add(direction);
}

// Функция для предотвращения стандартных действий браузера
function preventDefaultKeys(e) {
    const preventKeys = [9, 116, 123]; // Tab, F5, F12
    const preventCtrlKeys = [78, 82, 83, 84, 87]; // Ctrl+N, R, S, T, W

    if (preventKeys.includes(e.keyCode) || 
        (e.ctrlKey && preventCtrlKeys.includes(e.keyCode))) {
        e.preventDefault();
        e.stopPropagation();
    }
}

// Экспорт функций для использования в основном файле
window.Liba = {
    setMouseSensitivity,
    setMoveSpeed,
    rebindKey,
    handleKeyDown,
    handleKeyUp,
    handleMouseMove,
    updateCameraPosition,
    preventDefaultKeys,
    moveState,
    GameSettings
};
