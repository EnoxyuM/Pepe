(function() {
    const Libu = (function() {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        const labelRenderer = new THREE.CSS2DRenderer();
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0px';
        labelRenderer.domElement.style.pointerEvents = 'none';
        document.body.appendChild(labelRenderer.domElement);

        camera.position.z = 5;
        const direction = new THREE.Vector3();
        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
        const uiElements = new Map();
        let elementCounter = 0;

        function createCube() {
            const cubeGeometry = new THREE.BoxGeometry();
            const cubeMaterial = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
            const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            const cameraDirection = new THREE.Vector3();
            camera.getWorldDirection(cameraDirection);
            cube.position.set(
                camera.position.x + cameraDirection.x * 10,
                camera.position.y + cameraDirection.y * 10,
                camera.position.z + cameraDirection.z * 10
            );
            scene.add(cube);
            return cube;
        }

        const key = {};
        var baseSpeed = 0.02;
        var freeCameraMode = true;

        document.addEventListener('keydown', (event) => {
            key[event.code] = true;
            if (event.code === 'KeyH') {
                freeCameraMode = !freeCameraMode;
            }
        });

        document.addEventListener('keyup', (event) => {
            key[event.code] = false;
        });

        function moveCamera(deltaTime) {
            const forwardDirection = new THREE.Vector3();
            const rightDirection = new THREE.Vector3();
            const upDirection = new THREE.Vector3(0, 1, 0);
            camera.getWorldDirection(forwardDirection);
            forwardDirection.normalize();
            rightDirection.setFromMatrixColumn(camera.matrixWorld, 0);
            rightDirection.normalize();
            let moveDirection = new THREE.Vector3(0, 0, 0);
            if (!freeCameraMode) {
                forwardDirection.y = 0;
                forwardDirection.normalize();
                rightDirection.y = 0;
                rightDirection.normalize();
            }
            let currentSpeed = baseSpeed * deltaTime;
            if (key['ShiftLeft'] || key['ShiftRight']) {
                currentSpeed *= 2;
            }
            if (key['KeyW']) moveDirection.add(forwardDirection);
            if (key['KeyS']) moveDirection.sub(forwardDirection);
            if (key['KeyA']) moveDirection.sub(rightDirection);
            if (key['KeyD']) moveDirection.add(rightDirection);
            if (key['Space']) moveDirection.add(upDirection);
            if (key['ControlLeft'] || key['ControlRight']) moveDirection.sub(upDirection);
            if (moveDirection.lengthSq() > 0) {
                moveDirection.normalize();
            }
            camera.position.addScaledVector(moveDirection, currentSpeed);
        }

        let isPointerLocked = false;

        document.addEventListener('click', (event) => {
            if (!isPointerLocked && event.target === renderer.domElement) {
                renderer.domElement.requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            isPointerLocked = document.pointerLockElement === renderer.domElement;
            document.body.classList.toggle('hidden-cursor', isPointerLocked);
        });

        document.addEventListener('mousemove', (event) => {
            if (isPointerLocked) {
                euler.setFromQuaternion(camera.quaternion);
                euler.y -= event.movementX * 0.002;
                euler.x -= event.movementY * 0.002;
                euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
                camera.quaternion.setFromEuler(euler);
            }
        });

        function newUI() {
            const id = elementCounter++;
            uiElements.set(id, null);
            return id;
        }

        function setTxtField(id, text = undefined, x = 0, y = 0, color = undefined) {
            let element = uiElements.get(id);
            if (!element) {
                element = document.createElement('input');
                element.type = 'text';
                element.style.fontSize = '20px';
                element.style.pointerEvents = 'auto';
                element.style.position = 'absolute';
                document.body.appendChild(element);
                uiElements.set(id, element);
            }
            if (text !== undefined) element.value = text;
            if (color !== undefined) element.style.color = color;
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
        }

        function setSquare(id, x, y, width, height, color, follow = undefined) {
            let element = uiElements.get(id);
            if (!element) {
                element = document.createElement('div');
                element.className = 'square';
                element.style.position = 'absolute';
                document.body.appendChild(element);
                uiElements.set(id, element);
            }
            element.style.width = `${width}px`;
            element.style.height = `${height}px`;
            element.style.backgroundColor = color;
            if (follow !== undefined) {
                const squareLabel = new THREE.CSS2DObject(element);
                squareLabel.position.set(x, y, 0);
                follow.add(squareLabel);
                uiElements.set(id, squareLabel);
            } else {
                element.style.left = `${x}px`;
                element.style.top = `${y}px`;
            }
        }

        function setCheckbox(id, checked, x = 0, y = 0) {
            let element = uiElements.get(id);
            if (!element) {
                element = document.createElement('input');
                element.type = 'checkbox';
                element.style.pointerEvents = 'auto';
                element.style.position = 'absolute';
                document.body.appendChild(element);
                uiElements.set(id, element);
            }
            element.checked = checked;
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
        }

        function setButton(id, text, x = 0, y = 0, color = undefined, onClickFunction = null) {
            let element = uiElements.get(id);
            if (!element) {
                element = document.createElement('button');
                element.style.pointerEvents = 'auto';
                element.style.position = 'absolute';
                document.body.appendChild(element);
                uiElements.set(id, element);
            }
            element.textContent = text;
            if (color !== undefined) element.style.color = color;
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
            if (onClickFunction) {
                element.onclick = onClickFunction;
            }
        }

        function setSlider(id, value, x = 0, y = 0) {
            let element = uiElements.get(id);
            if (!element) {
                element = document.createElement('input');
                element.type = 'range';
                element.style.pointerEvents = 'auto';
                element.style.position = 'absolute';
                document.body.appendChild(element);
                uiElements.set(id, element);
            }
            element.value = value;
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
        }

        function setText(id, text, x = 0, y = 0, z = 0, color = undefined, follow = undefined) {
            let element = uiElements.get(id);
            if (!element) {
                element = document.createElement('div');
                element.style.color = 'rgba(255, 255, 255, 1)';
                element.style.fontSize = '20px';
                element.style.pointerEvents = 'none';
                element.classList.add('overlay-text');
                document.body.appendChild(element);
                uiElements.set(id, element);
            }
            element.textContent = text;
            if (color !== undefined) element.style.color = color;
            if (follow !== undefined) {
                const textLabel = new THREE.CSS2DObject(element);
                textLabel.position.set(x, y, z);
                follow.add(textLabel);
                uiElements.set(id, textLabel);
            } else {
                element.style.position = 'absolute';
                element.style.left = `${x}px`;
                element.style.top = `${y}px`;
            }
        }

        function removeElement(id, time = 0) {
            const element = uiElements.get(id);
            if (element) {
                if (time > 0) {
                    setTimeout(() => {
                        if (element instanceof THREE.CSS2DObject) {
                            element.parent.remove(element);
                        } else {
                            document.body.removeChild(element);
                        }
                        uiElements.delete(id);
                    }, time);
                } else {
                    if (element instanceof THREE.CSS2DObject) {
                        element.parent.remove(element);
                    } else {
                        document.body.removeChild(element);
                    }
                    uiElements.delete(id);
                }
            }
        }

        function makeElementDraggable(element) {
            let offsetX, offsetY;

            function onMouseDown(e) {
                offsetX = e.clientX - element.getBoundingClientRect().left;
                offsetY = e.clientY - element.getBoundingClientRect().top;
                element.style.cursor = 'grabbing';

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            }

            function onMouseMove(e) {
                element.style.left = `${e.clientX - offsetX}px`;
                element.style.top = `${e.clientY - offsetY}px`;
            }

            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                element.style.cursor = 'grab';
            }

            element.addEventListener('mousedown', onMouseDown);

            return {
                enable() {
                    element.style.cursor = 'grab';
                },
                disable() {
                    element.style.cursor = 'default';
                }
            };
        }

        function syncSliderAndTextField(sliderId, textFieldId) {
            const slider = uiElements.get(sliderId);
            const textField = uiElements.get(textFieldId);

            if (slider && textField) {
                slider.addEventListener('input', () => {
                    textField.value = slider.value;
                });

                textField.addEventListener('input', () => {
                    slider.value = textField.value;
                });
            }
        }

        let lastTime = performance.now();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        window.onbeforeunload = function (e) {
            e.preventDefault();
            e.returnValue = 'Really want to quit the game?';
        };

        document.onkeydown = function (e) {
            e = e || window.event; // Get event

            if (e.keyCode === 123) { // F12 devtools
                e.preventDefault();
                e.stopPropagation();
            }
            if (e.keyCode === 9 && e.ctrlKey) { // Ctrl+Tab
                e.preventDefault();
                e.stopPropagation();
            }
            if (e.which || e.keyCode === 116) { // F5
                e.preventDefault();
                e.stopPropagation();
            }
            if (!(e.ctrlKey || e.metaKey)) return;
            var code = e.which || e.keyCode;
            switch (code) {
                case 83: // Ctrl+S
                case 87: // Ctrl+W
                case 82: // Ctrl+R
                case 84: // Ctrl+T
                case 78: // Ctrl+N
                    e.preventDefault();
                    e.stopPropagation();
                    break;
            }
        };

        function animate(time) {
            requestAnimationFrame(animate);
            const deltaTime = (time - lastTime);

            moveCamera(deltaTime);
            renderer.render(scene, camera);
            labelRenderer.render(scene, camera);
            lastTime = time;
        }

        requestAnimationFrame(animate);

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        window.addEventListener('resize', onWindowResize);

        return {
            scene,
            camera,
            renderer,
            createCube,
            newUI,
            setTxtField,
            setSquare,
            setCheckbox,
            setButton,
            setSlider,
            setText,
            removeElement,
            makeElementDraggable,
            syncSliderAndTextField
        };
    })();

    window.Libu = Libu;
})();
