# Le Temple v2

## Lancer le site

```bash
npm start
```

Puis ouvrir `http://localhost:3000`.

Exemple avec variables :

```bash
EMPLOYEE_CODE=mon_code EMPLOYEE_COOKIE_SECURE=true EMPLOYEE_IDLE_MINUTES=5 npm start
```

## Variables d'environnement

- `EMPLOYEE_CODE` (obligatoire) : code d'acces a l'espace employe. Le serveur refuse de demarrer si absent.
- `EMPLOYEE_IDLE_MINUTES` (optionnel, defaut: 5) : duree d'inactivite avant expiration de session employe.
- `EMPLOYEE_COOKIE_SECURE` (optionnel, defaut: false) : forcer le flag `Secure` sur le cookie employe (`true`/`false`).
- `LOG_LEVEL` (optionnel, defaut: info) : niveau de logs. `info`, `warn`, `error`, `silent`.

## Structure

- `public/` : pages publiques du site
- `public/assets/css/` : feuille de style globale
- `public/assets/js/` : script front commun
- `public/assets/icons/` : favicon et icones du site
- `server/` : serveur Node (API + fichiers statiques)
- `data/` : base locale SQLite et fichiers de donnees
- `docs/` : documents source du projet (PDF, briefs, supports)

## API

- `POST /api/reservations`
- `GET /api/availability?date=YYYY-MM-DD&cabine=Japon|Bali|Europe|Thailande|Mauresque`
- `POST /api/contacts`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/game/profile?email=...`
- `POST /api/game/spin`

## Deploiement Render (gratuit)

1. Creer un repo GitHub et pousser le projet.
2. Sur Render: `New` > `Web Service` > selectionner le repo.
3. Parametres:
   - Runtime: `Node`
   - Build Command: (vide)
   - Start Command: `npm start`
4. Variables d'environnement:
   - `EMPLOYEE_CODE`
   - `EMPLOYEE_IDLE_MINUTES`
   - `EMPLOYEE_COOKIE_SECURE=true`
   - `LOG_LEVEL=info`
5. Ouvrir l'URL Render fournie.
