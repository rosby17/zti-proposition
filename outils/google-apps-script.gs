/* Réception des demandes du site ZTi (toutes les pages : accueil, services, campagnes, contact).
   Chaque demande est ajoutée au Google Sheet (onglet « Demandes du site ») et ZTi reçoit un e-mail.
   La colonne « État » sert au suivi : Nouvelle, Rappelée, Rendez-vous, Devis, Client, Sans suite (liste de choix).

   Installation (une seule fois, avec le compte Google de ZTi) :
   1. Créer un Google Sheets « ZTi — Demandes du site », puis Extensions › Apps Script ; coller ce fichier à la place du code.
   2. Déployer › Nouveau déploiement › type « Application Web » ; Exécuter en tant que : Moi ; Accès : Tout le monde ; Déployer, autoriser.
   3. Copier l'adresse « …/exec » dans le back-office : Réglages du site › Demandes et mesure d'audience › Adresse du script Google. */
const EMAIL_ZTI = 'zeltuminitiative@gmail.com';
const ONGLET = 'Demandes du site';
const ETATS = ['Nouvelle', 'Rappelée', 'Rendez-vous', 'Devis', 'Client', 'Sans suite'];
const COLONNES = [
  ['date', 'Date'], ['etat', 'État'], ['sujet', 'Sujet'], ['profil', 'Profil'], ['organisation', 'Établissement / entreprise'],
  ['nom', 'Nom'], ['fonction', 'Fonction'], ['tel', 'Téléphone / WhatsApp'], ['email', 'E-mail'], ['lieu', 'Quartier et ville'],
  ['besoins', 'Besoins'], ['moment', 'Meilleur moment'], ['message', 'Message'],
  ['page', 'Page'], ['campagne', 'Campagne'], ['utm_source', 'Source (pub)'], ['utm_medium', 'Support'], ['utm_campaign', 'Nom de la pub'],
  ['utm_content', 'Annonce'], ['referent', 'Venu de'], ['adresse', 'Adresse de la page'],
];

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  d.etat = 'Nouvelle';
  const classeur = SpreadsheetApp.getActive();
  const feuille = classeur.getSheetByName(ONGLET) || classeur.insertSheet(ONGLET);
  if (feuille.getLastRow() === 0) {
    feuille.appendRow(COLONNES.map(c => c[1])).setFrozenRows(1);
    feuille.getRange(1, 1, 1, COLONNES.length).setFontWeight('bold').setBackground('#02008A').setFontColor('#FFFFFF');
  }
  // une cellule qui commence par = + - @ serait lue comme une formule : on la neutralise
  const sur = v => { v = String(v == null ? '' : v).slice(0, 1500); return /^[=+\-@]/.test(v) ? "'" + v : v; };
  feuille.appendRow(COLONNES.map(c => sur(d[c[0]])));
  const ligne = feuille.getLastRow();
  feuille.getRange(ligne, 2).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(ETATS, true).build());
  MailApp.sendEmail(EMAIL_ZTI, 'Nouvelle demande — ' + sur(d.sujet) + ' — ' + sur(d.organisation || d.nom),
    COLONNES.filter(c => d[c[0]]).map(c => c[1] + ' : ' + sur(d[c[0]])).join('\n') + '\n\nTableau : ' + classeur.getUrl());
  return ContentService.createTextOutput('ok');
}
