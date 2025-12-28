const BACKGROUND = 'rgba(255, 0, 0, 0)'//"#2b2b2b"//"#faa1ff"//"#9cd4ff"
const FOREGROUND = "#ff4d6d"//"#f57cf7"//"#ff2b2b"//"#f200ff"//"#00ff22"
console.log(game);
game.style.background = 'transparent';
game.width = 800
game.height = 800
const ctx = game.getContext("2d")
console.log(ctx)

function clear() {
    ctx.fillStyle = BACKGROUND
    ctx.fillRect(0, 0, game.width, game.height)
    ctx.clearRect(0, 0, game.width, game.height);
}

function point({x, y}) {
    const s = 20
    ctx.fillStyle = FOREGROUND
    ctx.fillRect(x - s/2, y - s/2, s, s)
}

function line(p1, p2) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = FOREGROUND;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

function screen(p) {
    // -1..1 => 0..2 => 0..1 => *h/w
    return {
        x : (p.x + 1)/2*game.height,
        y : (1 - (p.y + 1)/2)*game.width
    }
}

function project({x, y, z}) {
    return {
        x : x/z,
        y : y/z
    }
}

function translate_z({x, y, z}, dz) {
    return {x, y, z: z + dz};
}

function rotate_xz({x, y, z}, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return {
        x: x*c - z*s,
        y,
        z: x*s + z*c
    };
}

function scale({x, y, z}, multy) {
    return {
        x: x*multy,
        y: y*multy,
        z: z*multy
    };
}

function transform({x, y, z}, {dx, dy, dz}) {
    return {
        x: x + dx,
        y: y + dy,
        z: z + dz
    };
}
let vs = [];
let fs = [];

async function loadSceneData() {
    try {
        const response = await fetch('./complexheart.json');
        const data = await response.json();

        // Распределяем данные по переменным
        vs = data.vs;
        fs = data.fs;
        /*
        console.log('Вершины (vs):', vs);
        console.log('Грани/связи (fs):', fs);
        */
        // Пример доступа:
        /*
        console.log('Первая координата первой вершины:', vs[0].x); // -0.25 (number)
        console.log('Первый индекс первой грани:', fs[0][0]);       // 0 (number)
        */
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
    }
}

const FPS = 60;
let dz = 1;
let angle = 0;
let multy = 1;
let dv = {dx: 0, dy: 0.3, dz: 0}


function frame() {
    const dt = 1/FPS;
    //dz += 1*dt;
    angle += Math.PI*dt; 
    multy = 0.8;
    clear();
    loadSceneData();
    /*
    for (const v of vs) {
        point(screen(project(translate_z(rotate_xz(scale(transform(v, dv), multy), angle), dz))))
    }
    */
    for (const f of fs) {
        for (let i = 0; i < f.length; ++i) {
            const a = vs[f[i]];
            const b = vs[f[(i+1)%f.length]];
            line(screen(project(translate_z(rotate_xz(scale(transform(a, dv), multy), angle), dz))),
                screen(project(translate_z(rotate_xz(scale(transform(b, dv), multy), angle), dz))))
            
        }
        
    }
    setTimeout(frame, 1000/FPS);
}
setTimeout(frame, 1000/FPS);
