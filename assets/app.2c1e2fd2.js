(function () {
'use strict';
var d = document, root = d.documentElement;
var $ = function (s, r) { return (r || d).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
var KEY = 'rws_lang', lang = 'pt', dict = null, queue = null;
function rich(el, str) {
el.textContent = '';
var cur = el;
str.split(/(<\/?(?:b|em)>)/).forEach(function (p) {
if (p === '<b>' || p === '<em>') { var n = d.createElement(p.slice(1, -1)); cur.appendChild(n); cur = n; }
else if (p === '</b>' || p === '</em>') { cur = cur.parentNode || el; }
else if (p) { cur.appendChild(d.createTextNode(p)); }
});
}
function apply(l) {
var t = dict[l]; if (!t) return;
lang = l; root.lang = l === 'pt' ? 'pt-PT' : l;
$$('[data-i18n]').forEach(function (el) {
var v = t[el.getAttribute('data-i18n')];
if (typeof v !== 'string') return;
if (v.indexOf('<') > -1) rich(el, v); else el.textContent = v;
});
$$('[data-i18n-ph]').forEach(function (el) { var v = t[el.getAttribute('data-i18n-ph')]; if (v) el.placeholder = v; });
$$('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-l') === l ? 'true' : 'false'); });
}
function withDict(cb) {
if (dict) return cb();
if (queue) return queue.push(cb);
queue = [cb];
fetch(root.getAttribute('data-i18n-src')).then(function (r) { return r.json(); }).then(function (j) {
dict = j; var q = queue; queue = null; q.forEach(function (f) { f(); });
}).catch(function () { queue = null; });
}
function setLang(l) { withDict(function () { apply(l); }); try { localStorage.setItem(KEY, l); } catch (e) {} }
(function () {
var saved = ''; try { saved = localStorage.getItem(KEY) || ''; } catch (e) {}
var pref = saved || (navigator.language || 'pt').slice(0, 2);
if (pref === 'en' || pref === 'es') withDict(function () { apply(pref); });
})();
var nav = $('#nav'), burger = $('#burger'), wam = $('#wam'), lb = $('#lb');
function menu(open) { nav.classList.toggle('open', open); if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false'); }
d.addEventListener('click', function (e) {
var el = e.target.closest && e.target.closest('button,a,.wam,.lb');
if (!el) return;
if (el === wam) { wam.removeAttribute('data-open'); return; }
if (el === lb || el.closest('.lb')) { lb.removeAttribute('data-open'); return; }
if (el.tagName === 'BUTTON') {
var l = el.getAttribute('data-l'); if (l) return setLang(l);
if (el.hasAttribute('data-wa')) { wam.setAttribute('data-open', ''); var f = $('.wo', wam); if (f) f.focus(); return; }
if (el.id === 'wax') return wam.removeAttribute('data-open');
if (el.id === 'burger') return menu(!nav.classList.contains('open'));
var fl = el.getAttribute('data-f');
if (fl) {
$$('[data-f]').forEach(function (b) { b.setAttribute('aria-pressed', b === el ? 'true' : 'false'); });
$$('.ph').forEach(function (p) { p.hidden = !(fl === 'a' || p.getAttribute('data-c') === fl); });
return;
}
var sc = el.getAttribute('data-sc');
if (sc) { var t = d.getElementById(sc); if (t) t.scrollIntoView({ behavior: 'smooth' }); return; }
if (el.classList.contains('gallery-photo')) {
var im = $('img', el); if (!im) return;
$('img', lb).src = im.getAttribute('data-full') || im.currentSrc; lb.setAttribute('data-open', ''); return;
}
} else if (el.tagName === 'A') { menu(false); }
});
d.addEventListener('keydown', function (e) {
if (e.key !== 'Escape') return;
lb.removeAttribute('data-open'); wam.removeAttribute('data-open'); menu(false);
});
window.addEventListener('resize', function () { if (window.innerWidth > 1099) menu(false); });
var form = $('#main form');
if (form) form.addEventListener('submit', function () {
var n = form.elements.namedItem('_next'); if (n) n.value = location.origin + '/obrigado/';
});
function sparks() {
var cv = $('#spark'); if (!cv || !cv.getContext) return;
var conn = navigator.connection;
if ((conn && conn.saveData) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
var ctx = cv.getContext('2d'), w = 0, h = 0, raf = 0, last = 0, t = 0, flash = null, next = 3;
var low = matchMedia('(max-width: 767px), (pointer: coarse)').matches || (navigator.hardwareConcurrency || 8) <= 4;
var N = low ? 16 : 30, list = [];
function sprite(sz, stops) {
var c = d.createElement('canvas'); c.width = c.height = sz; var x = c.getContext('2d'), g = x.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2);
stops.forEach(function (s) { g.addColorStop(s[0], s[1]); }); x.fillStyle = g; x.fillRect(0, 0, sz, sz); return c;
}
var dot = sprite(32, [[0, 'rgba(210,240,255,1)'], [0.18, 'rgba(70,195,250,.95)'], [0.5, 'rgba(0,155,223,.22)'], [1, 'rgba(0,155,223,0)']]);
var flare = sprite(128, [[0, 'rgba(120,215,255,.32)'], [1, 'rgba(0,155,223,0)']]);
function rise(init) { return { x: Math.random() * w, y: init ? Math.random() * h : h + 10, vx: (Math.random() - 0.5) * 30, vy: -(30 + Math.random() * 90), r: 0.8 + Math.random() * 2, a: 0.25 + Math.random() * 0.55, ph: Math.random() * 6, b: false }; }
function size() { w = cv.width = window.innerWidth; h = cv.height = window.innerHeight; }
function frame(now) {
raf = requestAnimationFrame(frame);
if (now - last < 33) return;
var dt = Math.min(0.06, (now - last) / 1000); last = now; t += dt;
ctx.clearRect(0, 0, w, h);
if (flash) {
flash.t -= dt; var q = Math.max(0, flash.t), rad = 380 * (1.2 - q * 0.4);
ctx.globalAlpha = q; ctx.drawImage(flare, flash.x - rad, flash.y - rad, rad * 2, rad * 2);
if (flash.t <= 0) flash = null;
}
for (var i = list.length - 1; i >= 0; i--) {
var p = list[i];
p.x += (p.vx + (p.b ? 0 : Math.sin(t * 1.1 + p.ph) * 14)) * dt; p.y += p.vy * dt;
if (p.b) { p.vy += 330 * dt; p.a -= 0.9 * dt; }
if (p.y < -20 || p.a <= 0) { list.splice(i, 1); if (!p.b) list.push(rise(false)); continue; }
var s = p.r * 7; ctx.globalAlpha = Math.min(1, p.a * 1.25); ctx.drawImage(dot, p.x - s, p.y - s, s * 2, s * 2);
}
ctx.globalAlpha = 1;
next -= dt;
if (next <= 0) {
flash = { x: w * (0.15 + Math.random() * 0.7), y: h * (0.45 + Math.random() * 0.45), t: 1 }; next = 6.5 + Math.random() * 2;
for (var k = 0; k < (low ? 8 : 14); k++) list.push({ x: flash.x, y: flash.y, vx: (Math.random() - 0.5) * 300, vy: -Math.random() * 240, r: 0.8 + Math.random() * 1.5, a: 1, ph: 0, b: true });
}
}
function go() { if (!raf && !d.hidden) { last = 0; raf = requestAnimationFrame(frame); } }
function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
size(); for (var i = 0; i < N; i++) list.push(rise(true));
var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 150); });
d.addEventListener('visibilitychange', function () { d.hidden ? stop() : go(); });
go();
}
var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 300); };
if (d.readyState === 'complete') idle(sparks); else window.addEventListener('load', function () { idle(sparks); });
})();
