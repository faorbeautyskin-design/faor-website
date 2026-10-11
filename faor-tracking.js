/* FAOR Beauty Skin · faor-tracking.js
 * Un solo archivo para todas las páginas (ES/EN/FR). Se incluye con:
 *   <script src="/faor-tracking.js" defer></script>
 *
 * 1) ORIGEN EN WHATSAPP: añade un emoji discreto a la primera línea del
 *    mensaje de todos los botones de WhatsApp según por dónde llegó la visita.
 *    ✨ ChatGPT Ads · 💜 ChatGPT gratis · 🧡 Claude · 💙 Gemini · 💚 Perplexity
 *    💛 otra IA (Copilot/Bing…) · 🌸 Google Ads · 🌷 Google orgánico
 *    📍 Google Maps · 💫 Instagram/Facebook · 🌿 Treatwell · 🌙 Prensa
 *    (sin emoji) directo / boca a boca
 *    Solo usa sessionStorage (se borra al cerrar la pestaña). No es una cookie.
 *
 * 2) PÍXEL DE CHATGPT ADS: solo se carga si la visita viene de un anuncio
 *    de ChatGPT Y la persona acepta las cookies de medición. Mide el clic
 *    en cualquier botón de WhatsApp como "lead_created".
 */
(function () {
  'use strict';

  var OPENAI_PIXEL_ID = 'LcppDDuC4F4Dg4vrKwghiP';
  // Orígenes que necesitan píxel publicitario (y por tanto aviso de cookies)
  var PAID_SOURCES = { chatgpt_ads: true };

  var MARKS = {
    chatgpt_ads: '✨', ia_chatgpt: '💜', ia_claude: '🧡', ia_gemini: '💙',
    ia_perplexity: '💚', ia_otra: '💛', google_ads: '🌸', google_seo: '🌷',
    maps: '📍', instagram: '💫', treatwell: '🌿', prensa: '🌙'
  };

  /* ---------- 1. Detectar origen ---------- */
  function aiFrom(x) {
    if (/chatgpt|openai/.test(x)) return 'ia_chatgpt';
    if (/claude/.test(x)) return 'ia_claude';
    if (/gemini|bard\.google/.test(x)) return 'ia_gemini';
    if (/perplexity/.test(x)) return 'ia_perplexity';
    if (/copilot|deepseek|mistral|grok|meta\.ai/.test(x)) return 'ia_otra';
    return '';
  }

  function detect() {
    var p = new URLSearchParams(location.search);
    var s = (p.get('utm_source') || '').toLowerCase();
    var m = (p.get('utm_medium') || '').toLowerCase();
    if (s) {
      if (s === 'chatgpt' && (m === 'cpc' || m === 'paid')) return 'chatgpt_ads';
      var ai = aiFrom(s);
      if (ai) return ai;
      if (s === 'google' && m === 'cpc') return 'google_ads';
      if (s === 'gmaps') return 'maps';
      if (/instagram|facebook|meta|^ig$|^fb$/.test(s)) return 'instagram';
      if (s === 'treatwell') return 'treatwell';
      if (s === 'prensa') return 'prensa';
      return '';
    }
    if (p.get('gclid') || p.get('gbraid') || p.get('wbraid')) return 'google_ads';
    if (p.get('fbclid')) return 'instagram';
    var r = (document.referrer || '').toLowerCase();
    if (r.indexOf(location.hostname) > -1) return '';
    var air = aiFrom(r);
    if (air) return air;
    if (/bing\.com/.test(r)) return 'ia_otra'; // Copilot abre enlaces a través de Bing
    if (/google\./.test(r)) return 'google_seo';
    if (/instagram|facebook/.test(r)) return 'instagram';
    if (/treatwell/.test(r)) return 'treatwell';
    return '';
  }

  var src = detect();
  try {
    if (src) sessionStorage.setItem('faor_src', src);
    else src = sessionStorage.getItem('faor_src') || '';
  } catch (e) {}

  /* ---------- 2. Emoji en los botones de WhatsApp ---------- */
  function markLinks() {
    var mark = MARKS[src];
    if (!mark) return;
    var links = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]');
    for (var k = 0; k < links.length; k++) {
      var a = links[k];
      if (a.getAttribute('data-faor-marked')) continue;
      try {
        var u = new URL(a.href);
        var txt = u.searchParams.get('text') || '¡Hola! Quiero reservar una cita.';
        var i = txt.indexOf('\n');
        txt = i > -1 ? txt.slice(0, i) + ' ' + mark + txt.slice(i) : txt + ' ' + mark;
        var enc = encodeURIComponent(txt); // espacios como %20
        a.href = /[?&]text=/.test(a.href)
          ? a.href.replace(/([?&]text=)[^&#]*/, '$1' + enc)
          : a.href + (a.href.indexOf('?') > -1 ? '&' : '?') + 'text=' + enc;
        a.setAttribute('data-faor-marked', '1');
      } catch (e) {}
    }
  }

  /* ---------- 3. Consentimiento + píxel de ChatGPT Ads ---------- */
  var CONSENT_KEY = 'faor_consent'; // 'yes' | 'no'
  function getConsent() { try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; } }
  function setConsent(v) { try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {} }

  var pixelOn = false;
  function loadPixel() {
    if (pixelOn) return;
    pixelOn = true;
    !function(w,d,s,u){if(w.oaiq)return;var q=function(){q.q.push(arguments)};q.q=[];w.oaiq=q;var j=d.createElement(s);j.async=1;j.src=u;var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(j,f)}(window,document,"script","https://bzrcdn.openai.com/sdk/oaiq.min.js");
    window.oaiq('init', { pixelId: OPENAI_PIXEL_ID, debug: false });
  }

  // Clic en cualquier botón de WhatsApp = conversión (solo si el píxel está activo)
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*="wa.me"], a[href*="whatsapp.com"]') : null;
    if (a && pixelOn && window.oaiq) {
      try { window.oaiq('measure', 'lead_created', { type: 'customer_action' }); } catch (err) {}
    }
  }, true);

  var TXT = {
    es: { msg: 'Usamos cookies de medición para saber si nuestros anuncios funcionan. Solo se activan si las aceptas.', ok: 'Aceptar', no: 'Rechazar', more: 'Más información' },
    en: { msg: 'We use measurement cookies to know whether our ads work. They are only activated if you accept them.', ok: 'Accept', no: 'Decline', more: 'More information' },
    fr: { msg: 'Nous utilisons des cookies de mesure pour savoir si nos annonces fonctionnent. Ils ne sont activés que si vous les acceptez.', ok: 'Accepter', no: 'Refuser', more: 'En savoir plus' }
  };

  function showBanner() {
    if (document.getElementById('faor-cookies')) return;
    var lang = (document.documentElement.getAttribute('lang') || 'es').slice(0, 2);
    var t = TXT[lang] || TXT.es;
    var css = document.createElement('style');
    css.textContent =
      '#faor-cookies{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:560px;margin:0 auto;' +
      'background:#1C1A14;color:#fff;padding:16px 18px;border-radius:8px;box-shadow:0 12px 30px -10px rgba(0,0,0,.45);' +
      'font:300 14px/1.5 Poppins,system-ui,sans-serif;display:flex;flex-wrap:wrap;gap:12px;align-items:center}' +
      '#faor-cookies p{margin:0;flex:1 1 260px}#faor-cookies a{color:#C9B98A;text-decoration:underline}' +
      '#faor-cookies .b{display:flex;gap:8px}#faor-cookies button{font:500 12px Poppins,system-ui,sans-serif;letter-spacing:.06em;' +
      'text-transform:uppercase;padding:10px 16px;border-radius:2px;cursor:pointer;border:1px solid #C9B98A}' +
      '#faor-cookies .ok{background:#C9B98A;color:#1C1A14}#faor-cookies .no{background:transparent;color:#fff}' +
      '#faor-cookies button:focus-visible{outline:2px solid #fff;outline-offset:2px}';
    document.head.appendChild(css);
    var box = document.createElement('div');
    box.id = 'faor-cookies';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-live', 'polite');
    box.innerHTML = '<p>' + t.msg + ' <a href="/privacidad.html">' + t.more + '</a></p>' +
      '<div class="b"><button type="button" class="no">' + t.no + '</button><button type="button" class="ok">' + t.ok + '</button></div>';
    box.querySelector('.ok').onclick = function () { setConsent('yes'); box.remove(); loadPixel(); };
    box.querySelector('.no').onclick = function () { setConsent('no'); box.remove(); };
    document.body.appendChild(box);
  }

  // Enlace en la política de privacidad para cambiar la elección
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-faor-cookies]') : null;
    if (!el) return;
    e.preventDefault();
    try { localStorage.removeItem(CONSENT_KEY); } catch (err) {}
    showBanner();
  });

  function init() {
    markLinks();
    var c = getConsent();
    if (c === 'yes') loadPixel();
    else if (c !== 'no' && PAID_SOURCES[src]) showBanner();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
