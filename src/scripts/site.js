// Comportements du site ZTi : menu sur téléphone, apparitions, questions repliables, visionneuse des attestations,
// calculateur du coût réel, formulaire de demande (Google Sheet + e-mail via Apps Script) et page « Merci ».
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = n => Math.round(n).toLocaleString('fr-FR').replace(/\s/g, '\u00a0');
const suivi = (ev, p) => { if (window.fbq) window.fbq('track', ev, p); };

/* ---------- menu sur téléphone ---------- */
const bMenu = $('.menu-mobile'), nav = $('#menu-principal');
if (bMenu && nav) {
  const fermer = () => { nav.classList.remove('ouvert'); bMenu.setAttribute('aria-expanded', 'false'); };
  bMenu.addEventListener('click', () => { const o = nav.classList.toggle('ouvert'); bMenu.setAttribute('aria-expanded', String(o)); });
  nav.addEventListener('click', e => { if (e.target.closest('a')) fermer(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fermer(); });
}

/* ---------- apparition au défilement ---------- */
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vu'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('.rv').forEach(e => io.observe(e));
} else $$('.rv').forEach(e => e.classList.add('vu'));

/* ---------- questions repliables ---------- */
$$('.question > button').forEach(b => b.addEventListener('click', () => {
  const ouvert = b.getAttribute('aria-expanded') === 'true';
  b.setAttribute('aria-expanded', String(!ouvert));
  document.getElementById(b.getAttribute('aria-controls')).hidden = ouvert;
}));

/* ---------- visionneuse des attestations (fenêtre maison) ---------- */
const boutonsVision = $$('[data-visionneuse]');
if (boutonsVision.length) {
  const v = document.createElement('div');
  v.className = 'visionneuse'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-modal', 'true'); v.setAttribute('aria-label', 'Attestation');
  v.innerHTML = '<img alt="" oncontextmenu="return false"><button class="fermer" type="button" aria-label="Fermer">×</button>';
  document.body.append(v);
  let retour = null;
  const fermer = () => { v.classList.remove('ouverte'); retour?.focus(); };
  boutonsVision.forEach(b => b.addEventListener('click', () => { retour = b; $('img', v).src = b.dataset.visionneuse; v.classList.add('ouverte'); $('.fermer', v).focus(); }));
  v.addEventListener('click', e => { if (e.target === v || e.target.closest('.fermer')) fermer(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && v.classList.contains('ouverte')) fermer(); });
}

/* ---------- calculateur du coût réel ---------- */
$$('[data-calculateur]').forEach(root => {
  const grille = JSON.parse(root.dataset.grille || '[]');
  const prix = $('[data-calc="prix"]', root), postes = $('[data-calc="postes"]', root);
  // nouveau chiffre affiché d'un coup, avec un léger fondu seulement sur ce qui a changé (pas de défilement)
  const out = (k, v, dec = 0) => $$(`[data-out="${k}"]`, root).forEach(e => {
    const texte = dec ? v.toFixed(dec).replace('.', ',') : fmt(v);
    if (e.textContent === texte) return;
    const premiere = !e.textContent;
    e.textContent = texte;
    if (!premiere) { e.classList.remove('change'); void e.offsetWidth; e.classList.add('change'); }
  });
  const lire = el => +String(el.value).replace(/\D/g, '') || 0;
  const maj = () => {
    const P = Math.max(0, lire(prix)), N = Math.max(1, Math.min(9999, lire(postes) || 1));
    out('m24', P / 24); out('a24', P / 2); out('m36', P / 36); out('m36b', P / 36); out('a36', P / 3); out('g1', P / 2 - P / 3);
    const T = P * N;
    $$('[data-out="n"]', root).forEach(e => { e.textContent = N; });
    out('total', T); out('sa24', T / 2); out('sm24', T / 24); out('sa36', T / 3); out('sm36', T / 36); out('g2', T / 2 - T / 3);
    if (grille.length) {
      const pp = (grille.find(([max]) => N <= max) || grille[grille.length - 1])[1];
      const mois = P > 0 ? pp / (P / 36) : 0;
      out('pp', pp); out('ps', pp * N); out('mois', mois, 1);
    }
  };
  prix.addEventListener('input', () => { const n = String(prix.value).replace(/\D/g, '').slice(0, 9); prix.value = n ? fmt(+n) : ''; maj(); });
  postes.addEventListener('input', () => { postes.value = String(postes.value).replace(/\D/g, '').slice(0, 4); maj(); });
  $$('[data-pas]', root).forEach(b => b.addEventListener('click', () => { postes.value = Math.max(1, Math.min(9999, (lire(postes) || 1) + +b.dataset.pas)); maj(); }));
  maj();
});

/* ---------- source de la visite (publicités) : gardée pendant la visite ---------- */
const SOURCE = 'zti-source';
(() => {
  const q = new URLSearchParams(location.search);
  const champs = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'fbclid'];
  if (champs.some(c => q.get(c))) {
    const s = {}; champs.forEach(c => { if (q.get(c)) s[c] = q.get(c).slice(0, 120); });
    sessionStorage.setItem(SOURCE, JSON.stringify(s));
  } else if (!sessionStorage.getItem(SOURCE) && document.referrer && !document.referrer.startsWith(location.origin)) {
    sessionStorage.setItem(SOURCE, JSON.stringify({ referent: document.referrer.slice(0, 200) }));
  }
})();

/* ---------- formulaire de demande ---------- */
$$('form[data-demande]').forEach(form => {
  // choix en boutons
  $$('[data-choix]', form).forEach(g => {
    const unique = g.hasAttribute('data-unique');
    $$('button', g).forEach(b => b.addEventListener('click', () => {
      if (unique) { $$('button', g).forEach(x => x.setAttribute('aria-checked', String(x === b))); }
      else b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
      g.closest('.champ')?.classList.remove('invalide');
      if (g.dataset.choix === 'profil') majProfil();
    }));
    if (unique) g.addEventListener('keydown', e => {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
      const bs = $$('button', g), i = bs.indexOf(document.activeElement); if (i < 0) return;
      e.preventDefault(); const n = bs[(i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length]; n.focus(); n.click();
    });
  });
  const caseAccord = $('[data-case="accord"]', form);
  caseAccord.addEventListener('click', () => { caseAccord.setAttribute('aria-checked', String(caseAccord.getAttribute('aria-checked') !== 'true')); caseAccord.closest('.champ').classList.remove('invalide'); });
  const valeur = n => $$(`[data-choix="${n}"] button`, form).filter(b => b.getAttribute('aria-checked') === 'true' || b.getAttribute('aria-pressed') === 'true').map(b => b.textContent.trim());
  const code = n => ($$(`[data-choix="${n}"] button[aria-checked="true"]`, form)[0] || {}).dataset?.valeur || '';
  const champOrg = $('[data-champ="organisation"]', form);
  function majProfil() { champOrg.hidden = code('profil') === 'particulier'; }
  majProfil();
  $$('input, textarea', form).forEach(i => i.addEventListener('input', () => i.closest('.champ')?.classList.remove('invalide')));
  const tel = form.elements.tel;
  tel.addEventListener('input', () => { const c = tel.value.replace(/\D/g, '').replace(/^237/, '').slice(0, 9); tel.value = c.replace(/(\d)(\d{0,2})(\d{0,2})(\d{0,2})(\d{0,2})/, (m, a, b, c2, d, e) => [a + b, c2, d, e].filter(Boolean).join(' ')); });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (form.elements.site_web.value) return; // robot
    const erreurs = [];
    const marque = (n, ok) => { const c = $(`[data-champ="${n}"]`, form); c?.classList.toggle('invalide', !ok); if (!ok) erreurs.push(c); };
    const v = n => (form.elements[n]?.value || '').trim();
    const chiffres = v('tel').replace(/\D/g, '');
    marque('profil', !!code('profil'));
    marque('organisation', code('profil') === 'particulier' || v('organisation').length >= 2);
    marque('nom', v('nom').length >= 2);
    marque('tel', /^6\d{8}$/.test(chiffres));
    marque('email', !v('email') || /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v('email')));
    marque('accord', caseAccord.getAttribute('aria-checked') === 'true');
    const msg = $('.message-erreur', form);
    if (erreurs.length) { msg.textContent = 'Quelques informations manquent : elles sont signalées ci-dessus.'; msg.hidden = false; erreurs[0].querySelector('input, textarea, button')?.focus(); return; }
    msg.hidden = true;

    const d = {
      date: new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' }),
      sujet: form.dataset.sujet, profil: valeur('profil').join(''), organisation: v('organisation'), nom: v('nom'), fonction: v('fonction'),
      tel: '+237 ' + chiffres.replace(/(\d)(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5'), email: v('email'), lieu: v('lieu'),
      besoins: valeur('besoins').join(', '), message: v('message'), moment: valeur('moment').join(''),
      page: form.dataset.page || location.pathname, campagne: form.dataset.campagne || '', adresse: location.href.split('#')[0],
      ...JSON.parse(sessionStorage.getItem(SOURCE) || '{}'),
    };
    const bouton = $('button[type="submit"]', form); bouton.disabled = true;
    let enregistree = false;
    if (form.dataset.endpoint) {
      try { await fetch(form.dataset.endpoint, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(d) }); enregistree = true; } catch (_) { /* réseau coupé : la demande part par WhatsApp */ }
    }
    suivi('Lead', { content_name: d.sujet, content_category: d.campagne || d.page });
    const lignes = [
      `Bonjour ZTi, voici ma demande (${d.sujet}) :`,
      `• Profil : ${d.profil}`, d.organisation && `• ${d.profil === 'Particulier' ? 'Nom' : 'Établissement / entreprise'} : ${d.organisation}`,
      `• Nom : ${d.nom}${d.fonction ? ' (' + d.fonction + ')' : ''}`, `• Téléphone : ${d.tel}`, d.email && `• E-mail : ${d.email}`,
      d.lieu && `• Lieu : ${d.lieu}`, d.besoins && `• Besoin : ${d.besoins}`, d.moment && `• Meilleur moment : ${d.moment}`, d.message && `• Message : ${d.message}`,
    ].filter(Boolean).join('\n');
    sessionStorage.setItem('zti-demande', JSON.stringify({ enregistree, texte: lignes, sujet: d.sujet, wa: form.dataset.wa, mail: form.dataset.mail }));
    location.href = form.dataset.merci;
  });
});

/* ---------- page « Merci » ---------- */
const merci = $('[data-merci-page]');
if (merci) {
  const d = JSON.parse(sessionStorage.getItem('zti-demande') || 'null');
  if (d) {
    $('[data-titre]', merci).textContent = d.enregistree ? 'Merci, votre demande est enregistrée.' : 'Dernière étape : envoyez votre demande à ZTi.';
    $('[data-texte]', merci).textContent = d.enregistree
      ? 'ZTi vous recontacte au moment choisi. Pour aller plus vite, envoyez-la aussi directement :'
      : 'Votre demande est prête. Appuyez sur « Envoyer par WhatsApp » : elle part déjà rédigée.';
    const wa = $('[data-wa]', merci), mail = $('[data-mail]', merci);
    if (d.wa) { wa.href = `https://wa.me/${d.wa.replace(/\D/g, '')}?text=${encodeURIComponent(d.texte)}`; wa.hidden = false; }
    if (d.mail) { mail.href = `mailto:${d.mail}?subject=${encodeURIComponent(d.sujet + ' — demande depuis le site')}&body=${encodeURIComponent(d.texte)}`; mail.hidden = false; }
    wa.addEventListener('click', () => suivi('Contact', { method: 'whatsapp' }));
    mail.addEventListener('click', () => suivi('Contact', { method: 'email' }));
    $('[data-envoi]', merci).hidden = false;
  }
}
