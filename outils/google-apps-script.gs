/* Réception des formulaires du site ZTi (demandes et avis), sans aucun outil payant ni intermédiaire.
   Chaque envoi :
   1. est ajouté au CRM Notion de ZTi (base « Demandes du site » ou « Avis clients ») ;
   2. est recopié dans ce Google Sheet (copie de secours : rien n'est perdu si Notion ne répond pas) ;
   3. déclenche un e-mail à ZTi, avec le lien de la fiche Notion.

   Installation (une seule fois, avec le compte Google de ZTi) : voir outils/NOTION.md.
   En bref :
   1. Créer un Google Sheets « ZTi — Formulaires du site », puis Extensions › Apps Script ; coller ce fichier.
   2. Paramètres du projet (roue dentée) › Propriétés du script : ajouter
        NOTION_TOKEN      = le jeton de l'intégration Notion (commence par « ntn_ » ou « secret_ »)
        NOTION_PAGE_CRM   = l'adresse ou l'identifiant de la page Notion « CRM ZTi » partagée avec l'intégration
   3. Choisir la fonction « installerNotion » en haut, cliquer « Exécuter », autoriser : les deux bases sont créées.
   4. Déployer › Nouveau déploiement › type « Application Web » ; Exécuter en tant que : Moi ; Accès : Tout le monde.
   5. Copier l'adresse « …/exec » dans le back-office : Réglages du site › Demandes et mesure d'audience. */

const EMAIL_ZTI = 'zeltuminitiative@gmail.com';
const NOTION_VERSION = '2022-06-28';
const ETATS = ['Nouvelle', 'Rappelée', 'Rendez-vous', 'Devis', 'Client', 'Sans suite'];

// [clé envoyée par le site, nom de la colonne, type Notion]
const CHAMPS_DEMANDE = [
  ['nom', 'Nom', 'title'], ['etat', 'État', 'select'], ['date_iso', 'Date', 'date'], ['sujet', 'Sujet', 'select'],
  ['profil', 'Profil', 'select'], ['organisation', 'Établissement / entreprise', 'rich_text'], ['secteur', 'Secteur', 'select'],
  ['fonction', 'Fonction', 'rich_text'], ['tel', 'Téléphone / WhatsApp', 'phone_number'], ['email', 'E-mail', 'email'],
  ['lieu', 'Quartier et ville', 'rich_text'], ['postes', 'Ordinateurs', 'select'], ['situation', 'Situation', 'select'],
  ['besoins', 'Besoins', 'multi_select'], ['accompagnement', 'Accompagnement', 'select'], ['prestataire', 'Prestataire actuel', 'select'],
  ['depenses', 'Dépenses actuelles', 'select'], ['moment', 'Meilleur moment', 'select'], ['message', 'Message', 'rich_text'],
  ['connu', 'A connu ZTi par', 'select'], ['page', 'Page', 'rich_text'], ['campagne', 'Campagne', 'select'],
  ['utm_source', 'Source (pub)', 'select'], ['utm_medium', 'Support', 'select'], ['utm_campaign', 'Nom de la pub', 'select'],
  ['utm_content', 'Annonce', 'rich_text'], ['referent', 'Venu de', 'url'], ['adresse', 'Adresse de la page', 'url'],
];
const CHAMPS_AVIS = [
  ['nom', 'Nom', 'title'], ['publier', 'À publier', 'checkbox'], ['date_iso', 'Date', 'date'], ['note', 'Note sur 5', 'number'],
  ['organisation', 'Établissement / fonction', 'rich_text'], ['texte', 'Avis', 'rich_text'], ['tel', 'Téléphone (jamais publié)', 'phone_number'],
  ['page', 'Page', 'rich_text'],
];
const ONGLETS = { demande: 'Demandes du site', avis: 'Avis clients' };

// une cellule qui commence par = + - @ serait lue comme une formule : on la neutralise
const sur = v => { v = String(v == null ? '' : v).slice(0, 1500); return /^[=+\-@]/.test(v) ? "'" + v : v; };
const reglage = cle => PropertiesService.getScriptProperties().getProperty(cle) || '';

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const type = d.type === 'avis' ? 'avis' : 'demande';
  const champs = type === 'avis' ? CHAMPS_AVIS : CHAMPS_DEMANDE;
  d.date_iso = new Date().toISOString();
  if (type === 'avis') { d.note = Math.min(5, Math.max(1, Math.round(Number(d.note) || 0))); d.publier = false; }
  else d.etat = 'Nouvelle';

  // 1. Notion (le CRM)
  let fiche = '', erreurNotion = '';
  try { fiche = versNotion(type, champs, d); } catch (err) { erreurNotion = String(err).slice(0, 300); }

  // 2. copie de secours dans le Google Sheet
  const classeur = SpreadsheetApp.getActive();
  const feuille = classeur.getSheetByName(ONGLETS[type]) || classeur.insertSheet(ONGLETS[type]);
  const colonnes = [['date', 'Date']].concat(champs.filter(c => c[0] !== 'date_iso').map(c => [c[0], c[1]]));
  if (feuille.getLastRow() === 0) {
    feuille.appendRow(colonnes.map(c => c[1])).setFrozenRows(1);
    feuille.getRange(1, 1, 1, colonnes.length).setFontWeight('bold').setBackground('#02008A').setFontColor('#FFFFFF');
  }
  feuille.appendRow(colonnes.map(c => sur(c[0] === 'publier' ? (d.publier ? 'Oui' : 'Non') : d[c[0]])));

  // 3. e-mail à ZTi
  const titre = type === 'avis'
    ? 'Nouvel avis (' + d.note + '/5) — ' + sur(d.nom)
    : 'Nouvelle demande — ' + sur(d.sujet) + ' — ' + sur(d.organisation || d.nom);
  const corps = colonnes.filter(c => d[c[0]] && c[0] !== 'publier').map(c => c[1] + ' : ' + sur(d[c[0]])).join('\n')
    + '\n\n' + (fiche ? 'Fiche Notion : ' + fiche : 'ATTENTION : la fiche Notion n\'a pas pu être créée (' + (erreurNotion || 'Notion pas encore installé') + '). La demande est dans le tableau de secours.')
    + (type === 'avis' ? '\nPour l\'afficher sur le site : back-office › Avis des clients.' : '')
    + '\nTableau de secours : ' + classeur.getUrl();
  MailApp.sendEmail(EMAIL_ZTI, titre, corps);
  return ContentService.createTextOutput('ok');
}

// crée la fiche dans la base Notion ; renvoie son adresse
function versNotion(type, champs, d) {
  const base = reglage(type === 'avis' ? 'NOTION_BASE_AVIS' : 'NOTION_BASE_DEMANDES');
  if (!reglage('NOTION_TOKEN') || !base) return '';
  const proprietes = {};
  champs.forEach(([cle, nom, genre]) => {
    const v = d[cle];
    if (v === undefined || v === null || v === '') return;
    const t = String(v).slice(0, 1900);
    if (genre === 'title') proprietes[nom] = { title: [{ text: { content: t } }] };
    else if (genre === 'rich_text') proprietes[nom] = { rich_text: [{ text: { content: t } }] };
    else if (genre === 'select') proprietes[nom] = { select: { name: t.replace(/\s*,\s*/g, ' – ').slice(0, 100) } };
    else if (genre === 'multi_select') proprietes[nom] = { multi_select: t.split(',').map(x => x.trim()).filter(Boolean).map(x => ({ name: x.slice(0, 100) })) };
    else if (genre === 'date') proprietes[nom] = { date: { start: t } };
    else if (genre === 'number') proprietes[nom] = { number: Number(v) };
    else if (genre === 'checkbox') proprietes[nom] = { checkbox: !!v };
    else if (genre === 'phone_number') proprietes[nom] = { phone_number: t };
    else if (genre === 'email') proprietes[nom] = { email: t };
    else if (genre === 'url' && /^https?:\/\//.test(t)) proprietes[nom] = { url: t };
  });
  const r = notion('post', '/pages', { parent: { database_id: base }, properties: proprietes });
  return r.url || '';
}

// À lancer UNE fois (bouton « Exécuter ») : crée les bases « Demandes du site » et « Avis clients » dans la page CRM.
function installerNotion() {
  const page = (reglage('NOTION_PAGE_CRM').replace(/-/g, '').match(/[0-9a-f]{32}/i) || [''])[0];
  if (!reglage('NOTION_TOKEN') || !page) throw new Error('Ajoutez d\'abord NOTION_TOKEN et NOTION_PAGE_CRM dans les propriétés du script.');
  const schema = champs => {
    const p = {};
    champs.forEach(([cle, nom, genre]) => {
      p[nom] = cle === 'etat' ? { select: { options: ETATS.map(n => ({ name: n })) } } : { [genre]: {} };
    });
    return p;
  };
  const props = PropertiesService.getScriptProperties();
  [['NOTION_BASE_DEMANDES', 'Demandes du site', CHAMPS_DEMANDE], ['NOTION_BASE_AVIS', 'Avis clients', CHAMPS_AVIS]].forEach(([cle, titre, champs]) => {
    if (props.getProperty(cle)) return; // déjà créée
    const base = notion('post', '/databases', {
      parent: { type: 'page_id', page_id: page },
      title: [{ type: 'text', text: { content: titre } }],
      properties: schema(champs),
    });
    props.setProperty(cle, base.id);
  });
  Logger.log('Bases Notion prêtes : ' + props.getProperty('NOTION_BASE_DEMANDES') + ' et ' + props.getProperty('NOTION_BASE_AVIS'));
}

// À lancer pour vérifier l'installation : crée une demande « TEST » dans Notion, une ligne dans le tableau et un e-mail.
function testerEnvoi() {
  doPost({ postData: { contents: JSON.stringify({ sujet: 'TEST', profil: 'Entreprise', nom: 'Test installation', tel: '+237 6 00 00 00 00', besoins: 'Pannes, Lenteurs', page: '/test/' }) } });
}

function notion(methode, chemin, donnees) {
  const rep = UrlFetchApp.fetch('https://api.notion.com/v1' + chemin, {
    method: methode, contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + reglage('NOTION_TOKEN'), 'Notion-Version': NOTION_VERSION },
    payload: JSON.stringify(donnees),
  });
  const r = JSON.parse(rep.getContentText() || '{}');
  if (rep.getResponseCode() >= 300) throw new Error('Notion ' + rep.getResponseCode() + ' : ' + (r.message || ''));
  return r;
}
