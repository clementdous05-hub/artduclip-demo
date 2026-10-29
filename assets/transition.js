/* Passage de page — volet crème, sans flash ni page blanche.
   Règles : on n'intercepte que les liens internes, au clic gauche simple.
   Le volet se lève à l'arrivée ; le retour arrière (bfcache) le remet à zéro. */
(function () {
  var d = document.documentElement;
  if (!('classList' in d)) return;

  d.classList.remove('sortie');

  function nettoie() {
    d.classList.remove('sortie');
  }
  addEventListener('pageshow', nettoie);
  addEventListener('popstate', nettoie);

  var prefetches = {};
  function prefetch(href) {
    if (prefetches[href]) return;
    prefetches[href] = 1;
    var l = document.createElement('link');
    l.rel = 'prefetch';
    l.href = href;
    l.as = 'document';
    document.head.appendChild(l);
  }

  function interne(a) {
    if (!a || !a.href) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('download')) return false;
    var u;
    try { u = new URL(a.href, location.href); } catch (e) { return false; }
    if (u.origin !== location.origin) return false;
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    if (u.pathname === location.pathname && u.search === location.search && u.hash) return false;
    if (u.pathname === location.pathname && u.search === location.search) return false;
    return true;
  }

  addEventListener('pointerover', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (interne(a)) prefetch(a.href);
  }, { passive: true });

  var calme = matchMedia('(prefers-reduced-motion: reduce)');

  addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a');
    if (!interne(a)) return;
    if (calme.matches) return;
    e.preventDefault();
    if (d.classList.contains('sortie')) return;
    d.classList.add('sortie');
    var cible = a.href;
    setTimeout(function () { location.href = cible; }, 190);
    setTimeout(nettoie, 1600);
  }, true);
})();
