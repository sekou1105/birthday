// 倒计时与庆祝：固定为 "瑾瑾"，目标日期 2025-11-22
const greeting = document.getElementById('greeting');
const countdownDisplay = document.getElementById('countdownDisplay');
const balloonsContainer = document.getElementById('balloons');
const confettiCanvas = document.getElementById('confettiCanvas');
const cake = document.getElementById('cake');
const flame = document.getElementById('flame');

// 目标日期：2025-11-22（本地时间）
// 计算下一个目标生日（11 月 22 日）的 Date 对象（本地时区）
function getNextBirthday(monthZeroBased, day){
  const now = new Date();
  let year = now.getFullYear();
  let d = new Date(year, monthZeroBased, day, 0, 0, 0);
  if(d <= now){
    d = new Date(year+1, monthZeroBased, day, 0, 0, 0);
  }
  return d;
}

let TARGET_DATE = getNextBirthday(10, 22); // November is month 10 (0-based)
// 支持测试模式：无需 URL 参数，通过按键 Ctrl+Shift+T 触发（目标设为 10 秒后）
function enableTestMode(){
  TARGET_DATE = new Date(Date.now() + 10000); // 10 秒后
  if(countdownTimer) clearInterval(countdownTimer);
  updateCountdown();
  countdownTimer = setInterval(updateCountdown, 1000);
  if(countdownDisplay) countdownDisplay.textContent = '测试模式：10 秒后触发庆祝';
  console.log('Confetti test mode enabled: target date set 10s from now');
}

window.addEventListener('keydown', (e)=>{
  if(e.ctrlKey && e.shiftKey && e.key && e.key.toLowerCase() === 't'){
    enableTestMode();
  }
});

let countdownTimer = null;
let confettiCtx, confettiW, confettiH, confettiPieces = [], confettiRAF;

function updateCountdown(){
  const now = new Date();
  const diff = TARGET_DATE - now;
  if(diff <= 0){
    countdownDisplay.textContent = '今天就是瑾瑾的生日 🎉🎂';
    // 触发庆祝并为下一个生日重置倒计时
    celebrate();
    if(countdownTimer) clearInterval(countdownTimer);
    // 将目标设置为下一年的同一天并重启倒计时（避免页面静止不再更新）
    TARGET_DATE = getNextBirthday(10, 22);
    // 倒计时到点时触发额外的盛大特效
    try{ grandCelebration(); }catch(e){ /* ignore */ }
    // 小延迟后重新启动倒计时更新
    setTimeout(()=>{
      updateCountdown();
      countdownTimer = setInterval(updateCountdown, 1000);
    }, 2000);
    return;
  }
  const days = Math.floor(diff / (1000*60*60*24));
  const hours = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
  const mins = Math.floor((diff % (1000*60*60)) / (1000*60));
  const secs = Math.floor((diff % (1000*60)) / 1000);
  countdownDisplay.textContent = `${days} 天 ${hours} 时 ${mins} 分 ${secs} 秒`;
}

function celebrate(){
  // 手动或倒计时触发的完整庆祝
  spawnBalloons(12);
  launchConfetti();
  flickerFlame(3000);
  cakePulse(900);
  // 暂停自动庆祝 30 秒，避免与手动庆祝重叠
  pauseAutoCelebration(30000);
}

// 倒计时专用：盛大庆祝（更多气球/大量彩屑/蛋糕发光/粒子）
function grandCelebration(){
  // 大量气球与彩屑
  spawnBalloons(30);
  launchConfetti(220);
  flickerFlame(5000);
  cakePulse(1200);

  // 蛋糕发光
  if(cake){
    cake.classList.add('glow');
    setTimeout(()=> cake.classList.remove('glow'), 6000);
  }

  // 在蛋糕周围产生粒子火花
  createCakeSparks(36, 5000);
}

// 在蛋糕位置生成若干粒子，count 粒，持续 ms 毫秒
function createCakeSparks(count=20, ms=4000){
  if(!cake) return;
  const rect = cake.getBoundingClientRect();
  const container = document.createElement('div');
  container.className = 'cakeSparkContainer';
  container.style.left = '0px'; container.style.top = '0px';
  document.body.appendChild(container);

  for(let i=0;i<count;i++){
    const s = document.createElement('div');
    s.className = 'cake-spark ' + (i%2? 'dir-left':'dir-right');
    // 起始位置随机散布在蛋糕上方
    const sx = rect.left + rect.width*0.2 + Math.random()*rect.width*0.6;
    const sy = rect.top + rect.height*0.15 + Math.random()*rect.height*0.6;
    s.style.left = Math.round(sx) + 'px';
    s.style.top = Math.round(sy) + 'px';
    const delay = Math.random()*600;
    const dur = 1200 + Math.random()*1000;
    s.style.animation = `sparkRise ${dur}ms cubic-bezier(.2,.8,.2,1) ${delay}ms forwards`;
    container.appendChild(s);
  }

  // 清理
  setTimeout(()=>{ container.remove(); }, ms+1200);
}

// 蛋糕脉冲（短暂放大以示庆祝）
function cakePulse(duration=700){
  if(!cake) return;
  cake.classList.add('pulse');
  setTimeout(()=> cake.classList.remove('pulse'), duration);
}

// 周期性自动庆祝（不依赖用户点击）：轻度气球、小量彩屑、烛光闪烁与蛋糕微脉冲
function periodicCelebrate(){
  // 轻度效果：少量气球与少量彩屑
  spawnBalloons(3);
  launchConfetti(28);
  flickerFlame(1200);
  cakePulse(800);
}

// 自动庆祝控制（可暂停/重启）
let autoCelebrationTimer = null;
function startAutoCelebration(intervalMs=25000, runImmediately=false){
  stopAutoCelebration();
  if(runImmediately) periodicCelebrate();
  autoCelebrationTimer = setInterval(periodicCelebrate, intervalMs);
}
function stopAutoCelebration(){
  if(autoCelebrationTimer){ clearInterval(autoCelebrationTimer); autoCelebrationTimer = null; }
}
function pauseAutoCelebration(ms=30000){
  stopAutoCelebration();
  setTimeout(()=>{ startAutoCelebration(25000, false); }, ms);
}

// 默认：不立即运行，使用 5s 间隔自动触发轻度庆祝
startAutoCelebration(5000, false);

// 气球
function spawnBalloons(n){
  balloonsContainer.innerHTML = '';
  for(let i=0;i<n;i++){
    const b = document.createElement('div');
    b.className = 'balloon';
    const left = Math.random()*90;
    const hue = Math.floor(Math.random()*360);
    const size = 32 + Math.random()*48;
    b.style.left = left + '%';
    b.style.width = size + 'px';
    b.style.height = (size*1.25) + 'px';
    b.style.background = `linear-gradient(180deg, hsl(${hue} 85% 70%), hsl(${(hue+20)%360} 75% 60%))`;
    b.style.animation = `floatUp ${8+Math.random()*6}s ease-in forwards`;
    balloonsContainer.appendChild(b);
    setTimeout(()=>{ b.remove(); }, 14000);
  }
}

// 烛光闪烁
function flickerFlame(duration=2000){
  if(!flame) return;
  const start = performance.now();
  function tick(t){
    const p = (t - start) / duration;
    if(p >= 1){ flame.style.transform = 'scale(1)'; return; }
    const s = 0.85 + Math.sin(t/80) * 0.15;
    flame.style.transform = `scale(${s})`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// 彩屑
function setupConfetti(){
  confettiCtx = confettiCanvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas(){
  confettiW = confettiCanvas.width = window.innerWidth;
  confettiH = confettiCanvas.height = window.innerHeight;
}

function launchConfetti(){
  // 支持传入数量，默认 120
  const count = arguments.length ? arguments[0] : 120;
  for(let i=0;i<count;i++){
    confettiPieces.push({
      x: Math.random()*confettiW,
      y: -20 - Math.random()*200,
      vx: (Math.random()-0.5)*(count>100?4:2),
      vy: 1.5+Math.random()*3,
      size: (count>100?6:4)+Math.random()*(count>100?8:6),
      color: `hsl(${Math.random()*360} 85% 60%)`,
      rot: Math.random()*Math.PI*2,
      rotSpeed: (Math.random()-0.5)*0.2
    });
  }
  if(!confettiRAF) confettiLoop();
  setTimeout(()=>{ confettiPieces = []; }, count>100?4500:3000);
}

function confettiLoop(){
  confettiCtx.clearRect(0,0,confettiW,confettiH);
  for(let i=confettiPieces.length-1;i>=0;i--){
    const p = confettiPieces[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.rot += p.rotSpeed;
    confettiCtx.save();
    confettiCtx.translate(p.x, p.y); confettiCtx.rotate(p.rot);
    confettiCtx.fillStyle = p.color;
    confettiCtx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
    confettiCtx.restore();
    if(p.y > confettiH + 50) confettiPieces.splice(i,1);
  }
  if(confettiPieces.length>0) confettiRAF = requestAnimationFrame(confettiLoop);
  else { cancelAnimationFrame(confettiRAF); confettiRAF = null; confettiCtx.clearRect(0,0,confettiW,confettiH); }
}

// 启动
setupConfetti();
updateCountdown();
countdownTimer = setInterval(updateCountdown, 1000);
// 正常启动：不自动进入测试模式

// 如果已经到达或过了目标日，立即庆祝
if((TARGET_DATE - new Date()) <= 0){
  celebrate();
}

// 侧栏按钮绑定：点击侧边卡片的按钮也触发庆祝
try{
  const leftBtn = document.getElementById('sideCelebrateLeft');
  const rightBtn = document.getElementById('sideCelebrateRight');
  if(leftBtn){ leftBtn.addEventListener('click', ()=>{ celebrate(); leftBtn.classList.add('clicked'); setTimeout(()=>leftBtn.classList.remove('clicked'), 800); }); }
  if(rightBtn){ rightBtn.addEventListener('click', ()=>{ celebrate(); rightBtn.classList.add('clicked'); setTimeout(()=>rightBtn.classList.remove('clicked'), 800); }); }
}catch(e){ /* ignore in non-browser env */ }
