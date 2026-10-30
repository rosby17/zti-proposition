# Recevoir les demandes et les avis du site dans Notion

Le site n'utilise aucun outil intermédiaire (pas de Tally). Chaque formulaire envoyé :

1. crée une fiche dans le **CRM Notion** de ZTi (base « Demandes du site » ou « Avis clients ») ;
2. est recopié dans un **Google Sheet de secours** (rien n'est perdu si Notion ne répond pas) ;
3. envoie un **e-mail** à zeltuminitiative@gmail.com avec le lien de la fiche Notion.

Le relais est un petit script Google gratuit (`google-apps-script.gs`), installé une seule fois avec le compte Google de ZTi.
Durée : 15 minutes environ.

## 1. Dans Notion (5 minutes)

1. Créer une page vide nommée **CRM ZTi**.
2. Aller sur https://www.notion.so/profile/integrations → **Nouvelle intégration** :
   nom « Site ZTi », espace de travail de ZTi, type **Interne** → Enregistrer.
3. Copier le **jeton secret** (il commence par `ntn_`). Ne le donner à personne : il ouvre l'accès à cette page.
4. Revenir sur la page **CRM ZTi** → menu `•••` en haut à droite → **Connexions** → ajouter « Site ZTi ».
5. Copier l'adresse de la page (menu `•••` → **Copier le lien**).

## 2. Dans Google (10 minutes)

1. Créer un Google Sheets nommé **ZTi — Formulaires du site**.
2. **Extensions › Apps Script** : tout effacer, coller le contenu de `google-apps-script.gs`, Enregistrer.
3. Roue dentée **Paramètres du projet** › **Propriétés du script** › Ajouter :
   - `NOTION_TOKEN` = le jeton secret de l'étape 1.3
   - `NOTION_PAGE_CRM` = l'adresse de la page de l'étape 1.5
4. En haut, choisir la fonction **installerNotion** → **Exécuter** → autoriser l'accès.
   Les deux bases **Demandes du site** et **Avis clients** apparaissent dans la page CRM ZTi.
5. Choisir la fonction **testerEnvoi** → **Exécuter** : une fiche « Test installation » apparaît dans Notion,
   une ligne dans le tableau, et un e-mail arrive. Supprimer ensuite la fiche de test.
6. **Déployer › Nouveau déploiement** › type **Application Web** ; Exécuter en tant que : **Moi** ;
   Accès : **Tout le monde** → Déployer. Copier l'adresse qui finit par `/exec`.

## 3. Dans le back-office du site (1 minute)

**Réglages du site › Demandes et mesure d'audience › Adresse du script** : coller l'adresse `/exec`, Enregistrer.
Le site se met à jour en 1 à 2 minutes. Faire une vraie demande depuis le site pour vérifier.

## Au quotidien

- **Demandes** : la colonne **État** (Nouvelle, Rappelée, Rendez-vous, Devis, Client, Sans suite) sert au suivi.
  Notion permet d'afficher la base en tableau ou en colonnes (vue « Tableau » par État) pour faire glisser les fiches.
- **Avis** : rien n'est publié automatiquement. Pour afficher un avis sur le site, le recopier dans
  **back-office › Avis des clients** et cocher « Afficher sur le site ». La case « À publier » de Notion sert de pense-bête.
- Si le script est modifié plus tard : **Déployer › Gérer les déploiements › Modifier › Nouvelle version**
  (l'adresse `/exec` ne change pas).
