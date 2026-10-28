# Site ZTi : plan (28/10/2026)

Site d'entreprise de ZTi SARL (Zèl Tum Initiative), géré par l'équipe ZTi seule. But : vendre ses services
(écoles, PME, institutions, particuliers) grâce à des pages de campagne, et garder le contrôle des textes,
des promotions, des demandes et du trafic, sans serveur à payer.

## Choix de départ

- **Hébergement : GitHub Pages, gratuit**, sur le compte GitHub de ZTi (`zeltuminitiative-com`).
  Adresse du site : `https://zeltuminitiative-com.github.io/` (dépôt `zeltuminitiative-com.github.io`).
  Un nom de domaine (par exemple `zti.cm`) pourra s'y brancher plus tard sans rien refaire.
- **Les adresses déjà diffusées restent en ligne** : `/zti-diagnostic-offert/` et `/diagnostic-pme/`
  (publicités Facebook en cours). Elles seront reprises dans le nouveau site, puis redirigées.
- GitHub Pages ne sert que des pages fixes : pas de base de données, pas de serveur. D'où :
  - **le site est fabriqué à partir de fichiers de contenu** (textes, services, campagnes, saisons) par
    Astro, un générateur de pages fixes, puis publié automatiquement par GitHub Actions ;
  - **le back-office est Pages CMS** (gratuit, libre) : l'équipe ZTi se connecte avec son compte GitHub
    et modifie les textes, images, services, campagnes et saisons dans des formulaires. Chaque
    enregistrement remet le site à jour en 1 à 2 minutes ;
  - **les demandes vont dans un Google Sheet** (le script `google-apps-script.gs` de la page actuelle,
    étendu), avec un e-mail à ZTi à chaque demande ;
  - **le paiement en ligne** se fera par lien de paiement (Mobile Money, carte), pas par la page de
    paiement du kit starter-saas, qui demande un serveur.
- Ce n'est donc pas le kit starter-saas (Next.js + Supabase). Si ZTi veut un jour un vrai espace
  d'administration sur mesure, des comptes clients ou la page de paiement du kit, il faudra un nom de
  domaine et un serveur : le contenu se reprendra tel quel.

## Ce qui existe déjà et qu'on réutilise

| Élément | Où |
|---|---|
| Page « Diagnostic offert » des écoles (calculateur, 4 packs, preuves, attestations filigranées, références, formulaire) | `~/Documents/dev/zti-landing-diagnostic-scolaire` (PR 1 ouverte, non fusionnée) |
| Page « Audit gratuit » des PME (ZTi Système™ : Stabilité · Sécurité · Continuité) | dépôt `zeltuminitiative-com/diagnostic-pme` |
| Logo (bleu, blanc), favicon refait le 28/10, logo animé, photos du fondateur | `modeles/assets/` du dépôt de la landing |
| Charte : 11 bleus + noir, Poppins | idem (`outils/theme-D.css`) |
| Voix de la marque : « nous », vouvoiement ; cibles PME, écoles, institutions ; le fondateur parle en « je » aux particuliers | `gdrive:Archives R2/projets-clients/ZTI/strategie-kappgen/strategie.json` |

Règles reprises : aucun client nommé sans accord (les références affichées sont celles fournies par ZTi),
la durée de vie des postes n'est jamais garantie, la grille tarifaire n'est jamais affichée, seules les
attestations filigranées sont publiées.

## Étape 1 : le site public, les campagnes et les demandes

### Pages du site
1. **Accueil** : qui est ZTi (depuis 2008, le fondateur Jean Marcelin MEUKAM FOKAM), les publics servis
   (Écoles · Entreprises · Institutions · Particuliers), les services, les références, une demande rapide.
2. **Une page par service** (liste à confirmer par ZTi) :
   - maintenance du parc informatique et packs (Stabilité, Fiabilité, Continuité, Préservation) ;
   - salles TIC des établissements scolaires ;
   - Protection ZTi (le poste redevient propre à chaque redémarrage) ;
   - sauvegarde et récupération de données ;
   - réseaux ;
   - logiciels créés par ZTi (offerts avec les packs) ;
   - Sérénité numérique pour les particuliers.
3. **Pages de campagne** sous `/offres/<nom>/` : une par offre, chacune avec son lien à mettre dans une pub.
   Les deux premières sont les pages actuelles : `/offres/diagnostic-ecoles/` et `/offres/audit-pme/`.
4. **À propos** (le fondateur, l'histoire, les attestations), **Contact**, **Politique de confidentialité**.
5. Page « Merci » après une demande, page 404 aux couleurs de ZTi.

### Le back-office (Pages CMS)
- **Textes et images** de chaque page, coordonnées, réseaux sociaux.
- **Services** : ajouter, modifier, masquer un service (titre, accroche, texte, image, ordre).
- **Campagnes** : créer une page de campagne en empilant des sections prêtes à l'emploi
  (accroche, texte et image, liste d'avantages, calculateur du coût réel, packs, preuves et attestations,
  références, questions fréquentes, formulaire de demande). Chaque campagne a son adresse, son image
  d'aperçu pour Facebook et WhatsApp, et peut être « en ligne » ou « brouillon ».
- **Références clients** : logos et noms, dans l'ordre choisi.

### Les demandes
- Un même formulaire, sur toutes les pages : nom, établissement ou entreprise, téléphone, besoin.
  Il note la page et la campagne d'origine (et la source `utm_` de la pub).
- Chaque demande arrive dans **le Google Sheet de ZTi** (une ligne par demande, une colonne « État » :
  nouvelle, rappelée, rendez-vous, devis, client, sans suite) et **par e-mail**.
- Bouton WhatsApp pré-rempli en complément, comme sur la page actuelle.
- Le pixel Meta compte les visites et les demandes de chaque campagne.

### Ce qui sera vérifié avant de livrer l'étape 1
- Chaque page sur téléphone (375 px) et ordinateur, en mode clair.
- Le parcours complet : pub → page de campagne → demande → ligne dans le Sheet + e-mail.
- Une modification faite dans Pages CMS apparaît en ligne.
- Les anciennes adresses répondent toujours.
- Aucun contrôle natif du navigateur (menus, cases, fenêtres) : tout aux couleurs de ZTi.

## Étape 2 : saisons, promotions et statistiques
- **Saisons et promotions programmées** dans le back-office : nom, date de début, date de fin, bandeau,
  images, texte de promotion, pages concernées. Le site se reconstruit chaque nuit (00 h 05, heure de
  Yaoundé) et applique la saison en cours ; à la date de fin, il revient de lui-même à la normale.
  Exemples : rentrée scolaire (août-septembre), vacances (juillet), fin d'année (décembre).
- **Statistiques** sans cookie avec GoatCounter (gratuit) : visites par page, par campagne, par source,
  appareils. Tableau de bord accessible à ZTi. Taux de demandes par campagne calculé dans le Sheet.

## Étape 3 : paiement et rendez-vous
- **Bouton « Payer en ligne »**, activable service par service : lien de paiement d'une passerelle
  (Mobile Money et carte), à choisir avec ZTi selon ses comptes.
- **Prise de rendez-vous** : créneaux de ZTi (Google Agenda, page de réservation gratuite) intégrés aux
  pages de campagne.

## À décider avec ZTi
1. **Couleurs des saisons** : rester dans les 11 bleus de la charte (seuls les images, bandeaux et textes
   changent) ou autoriser d'autres couleurs pour certaines saisons.
2. **Liste exacte des services** et ceux qui pourront se payer en ligne.
3. **Le compte Google de ZTi** pour le Sheet des demandes et l'e-mail de réception.
4. **Fusion de la PR 1** de la landing actuelle (ses améliorations sont reprises dans le nouveau site).

## Où sont les choses
- Ce plan et le futur code : `~/Documents/dev/zti-site/` (dépôt à créer sur le compte GitHub de ZTi,
  seulement avec l'accord de Roosevelt).
- Sources lues pour ce plan : `~/Documents/dev/.kg2-travail/zti-sources/` (pages PME, offre écoles,
  stratégie, ancien prototype « Studio de croissance », un autre projet).

## Avancement

- **28/10/2026 : étape 1 construite en local** (`~/Documents/dev/zti-site`, rien de publié, rien de commité).
  15 pages : accueil, services (6 en ligne, 2 brouillons « Réseaux » et « Particuliers » à écrire par ZTi), deux campagnes
  refaites en sections modifiables (`/offres/diagnostic-ecoles/`, `/offres/audit-pme/`), à propos, contact, confidentialité,
  merci, 404. Formulaire commun → Google Sheet (`outils/google-apps-script.gs`) + WhatsApp pré-rempli, source des pubs (utm) notée.
  Back-office : `.pages.yml` (12 types de sections). Publication : `.github/workflows/publier.yml`.
  Vérifié dans le navigateur : ordinateur et téléphone (375 px, aucun débordement), formulaire (erreurs, envoi, page Merci),
  calculateur (mêmes chiffres que la page validée), menu sur téléphone, aucun contrôle natif.
  Non vérifié : Pages CMS (il faut le dépôt sur GitHub) et le vrai Google Sheet (il faut le compte Google de ZTi).
- **Pour mettre en ligne** : ZTi crée le dépôt vide `zeltuminitiative-com.github.io` sur son compte GitHub et y invite `rosby17`
  (le compte de Roosevelt ne peut pas créer de dépôt sur le compte de ZTi) ; on pousse ; Settings › Pages › « GitHub Actions » ;
  ZTi installe le script Google et colle son adresse dans Réglages du site ; ZTi se connecte à Pages CMS.
- **28/10/2026 nuit : en ligne** sur https://rosby17.github.io/zti-site/ (dépôt public `rosby17/zti-site`, code sur `source`,
  pages prêtes sur `main`). Reste : inviter ZTi, installer le script Google, tester Pages CMS.
