// l.js

const s = {
    ms: 0.002,
    sp: 0.1,
    kb: {
        f: 'KeyW',
        b: 'KeyS',
        l: 'KeyA',
        r: 'KeyD',
        u: 'Space',
        d: 'ShiftLeft'
    }
};

const m = {
    f: false,
    b: false,
    l: false,
    r: false,
    u: false,
    d: false
};

let p = 0;
let y = 0;

function li(ms, sp, a, k) {
    if (ms !== undefined) s.ms = ms;
    if (sp !== undefined) s.sp = sp;
    if (a !== undefined && k !== undefined && a in s.kb) s.kb[a] = k;
}

function kd(e) {
    for (let a in s.kb) {
        if (e.code === s.kb[a]) {
            m[a] = true;
            break;
        }
    }
}

function ku(e) {
    for (let a in s.kb) {
        if (e.code === s.kb[a]) {
            m[a] = false;
            break;
        }
    }
}

function mm(e, c) {
    if (document.pointerLockElement === e.target) {
        y -= e.movementX * s.ms;
        p -= e.movementY * s.ms;
        p = Math.max(-Math.PI/2, Math.min(Math.PI/2, p));
        
        c.rotation.order = 'YXZ';
        c.rotation.y = y;
        c.rotation.x = p;
    }
}

function up(c) {
    const d = new THREE.Vector3();
    if (m.f) d.z -= 1;
    if (m.b) d.z += 1;
    if (m.l) d.x -= 1;
    if (m.r) d.x += 1;
    if (m.u) d.y += 1;
    if (m.d) d.y -= 1;
    d.applyAxisAngle(new THREE.Vector3(0, 1, 0), y);
    d.normalize().multiplyScalar(s.sp);
    c.position.add(d);
}

function pk(e) {
    const pk = [9, 116, 123];
    const pck = [78, 82, 83, 84, 87];

    if (pk.includes(e.keyCode) || 
        (e.ctrlKey && pck.includes(e.keyCode))) {
        e.preventDefault();
        e.stopPropagation();
    }
}

function lp(e) {
    e.addEventListener('click', () => {
        e.requestPointerLock();
    });
}

function hr(c, r) {
    window.addEventListener('resize', () => {
        c.aspect = window.innerWidth / window.innerHeight;
        c.updateProjectionMatrix();
        r.setSize(window.innerWidth, window.innerHeight);
    });
}

window.l = {
    li,
    kd,
    ku,
    mm,
    up,
    pk,
    lp,
    hr,
    m,
    s
};
