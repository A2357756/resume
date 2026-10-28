// 用canvas製作 先找background元素
const canvas = document.getElementById("background");
// 使用 2D 繪圖
const ctx = canvas.getContext("2d");

// 從 CSS :root 讀取點點顏色，並隨深淺色模式自動更新
let dotColor = getComputedStyle(document.documentElement).getPropertyValue("--dot-color").trim() || "rgba(205, 236, 250, 0.4)";
window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
    dotColor = getComputedStyle(document.documentElement).getPropertyValue("--dot-color").trim();
});

// 定義雨滴點點
let dots = [];

// 定義滑鼠位置
const mouse = {
    x: null,
    y: null
};

//  動畫參數調整區
const rainSpeed = 2;       // 雨滴下落速度（數字越大越快：2 是慢速細雨，5 是中等，10 是暴雨）
const mouseRadius = 90;     // 滑鼠雨傘範圍（半徑 px）
const rainDensity = 4500;    // 雨滴密度（數字越小雨滴越多：2000 密，5000 稀疏）

// 調整canvas大小，讓它填滿整個視窗
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    createDots();
}

// 創建雨滴點點
function createDots() {
    dots = [];
    // 依照畫面大小與密度決定雨滴數量
    const count = Math.floor((canvas.width * canvas.height) / rainDensity);

    for (let i = 0; i < count; i++) {
        const speedVariance = 0.75 + Math.random() * 0.5; // 每顆雨滴速度稍微不同
        dots.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: 0,
            vy: rainSpeed * speedVariance,
            speedVariance: speedVariance,
            radius: 1.5 + Math.random() * 1.2
        });
    }
}

// 監聽視窗大小改變事件，重新調整畫布大小
window.addEventListener("resize", resizeCanvas);

// 監聽滑鼠移動事件，更新滑鼠位置
window.addEventListener("mousemove", function(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

// 監聽滑鼠離開事件，將滑鼠位置設為 null
window.addEventListener("mouseleave", function() {
    mouse.x = null;
    mouse.y = null;
});

// 動畫本體
function animate() {

    // 清除畫布(準備重新渲染)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = dotColor;

    dots.forEach(dot => {
        const targetSpeed = rainSpeed * dot.speedVariance;
        // 如果被彈開減速，自然重力加速回到終端速度
        if (dot.vy < targetSpeed) {
            dot.vy += 0.3;
        }
        // 水平空氣阻力（被彈開後慢慢恢復垂直落下）
        dot.vx *= 0.95;

        // 先移動雨滴
        dot.x += dot.vx;
        dot.y += dot.vy;

        // 滑鼠擋雨（像一把隱形圓傘彈開／滑落雨滴）
        if (mouse.x !== null && mouse.y !== null) {
            const dx = dot.x - mouse.x;
            const dy = dot.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouseRadius && distance > 0) {
                const nx = dx / distance;
                const ny = dy / distance;

                // 將雨滴推出滑鼠防護罩邊緣
                dot.x = mouse.x + nx * mouseRadius;
                dot.y = mouse.y + ny * mouseRadius;

                // 碰到傘面時往兩側彈開滑落（正中間微偏隨機方向避免卡在傘頂）
                const sideDir = Math.abs(nx) < 0.1 ? (Math.random() < 0.5 ? -0.4 : 0.4) : nx;
                dot.vx = sideDir * (targetSpeed * 0.9);
                // 若撞到上半部傘面則微幅彈起再往旁邊滑落
                if (ny < 0) {
                    dot.vy = ny * 1.5;
                }
            }
        }

        // 超出畫面底部或左右時，重新從頂端落下
        if (dot.y > canvas.height + 10) {
            dot.y = -10;
            dot.x = Math.random() * canvas.width;
            dot.vx = 0;
            dot.vy = targetSpeed;
        } else if (dot.x < -10) {
            dot.x = canvas.width + 10;
        } else if (dot.x > canvas.width + 10) {
            dot.x = -10;
        }

        // 畫點
        ctx.beginPath();
        ctx.arc(
            dot.x,
            dot.y,
            dot.radius,
            0,
            Math.PI * 2
        );
        ctx.fill();
    });

    requestAnimationFrame(animate);
}

resizeCanvas();
animate();

// 作品展示手風琴效果：展開其中一個時，自動關閉其他已展開的作品並捲動到該作品最上方
const projects = document.querySelectorAll(".project");
projects.forEach(targetProject => {
    targetProject.addEventListener("toggle", () => {
        if (targetProject.open) {
            projects.forEach(project => {
                if (project !== targetProject) {
                    project.open = false;
                }
            });
            requestAnimationFrame(() => {
                targetProject.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            });
        }
    });
});

