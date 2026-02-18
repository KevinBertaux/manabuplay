# Backend Laravel V2 (Admin Security)

## Objectif

Poser une base backend portable (mutualise compris) pour sortir la V0.4.0:
- authentification Google pour adultes/admin (serveur)
- controle de role admin cote API
- CRUD utilisateurs
- CRUD listes de vocabulaire (structure multilingue)
- base MariaDB scalable

## Stack

- Laravel 12
- Sanctum (tokens API)
- Google API Client (`google/apiclient`)
- MariaDB (cible production)

## Arborescence

- Backend: `backend/`
- Routes API: `backend/routes/api.php`
- Auth Google: `backend/app/Http/Controllers/Api/AuthController.php`
- Admin users: `backend/app/Http/Controllers/Api/Admin/UserController.php`
- Admin vocab: `backend/app/Http/Controllers/Api/Admin/VocabListController.php`, `backend/app/Http/Controllers/Api/Admin/VocabEntryController.php`
- Middleware roles: `backend/app/Http/Middleware/EnsureRole.php`

## Schema de donnees V2

Tables principales:
- `users`
- `roles`
- `user_roles`
- `vocab_lists`
- `vocab_entries`
- `vocab_entry_translations`
- `personal_access_tokens`

Notes:
- `vocab_entry_translations` prepare le multilingue (`language_code`).
- `users` contient `auth_provider`, `google_sub`, `guardian_user_id`, `is_active`.

## Variables d'environnement

Voir `backend/.env.example`:
- `DB_CONNECTION=mysql`
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `GOOGLE_CLIENT_ID`
- `ADMIN_GOOGLE_EMAILS` (emails Google autorises admin)
- `ADMIN_BOOTSTRAP_EMAIL` (optionnel, seed initial)
- `SANCTUM_STATEFUL_DOMAINS`

## Lancer en local

1. Ouvrir un terminal dans `backend/`
2. Creer le `.env`:
   - copie de `.env.example`
3. Generer la cle app:
   - `php artisan key:generate`
4. Migrer + seed:
   - `php artisan migrate:fresh --seed`
5. Lancer l'API:
   - `php artisan serve --host=127.0.0.1 --port=8000`

Si `php` n'est pas reconnu, relancer VS Code/terminal apres installation PHP.

## Endpoints API V2 (base)

Auth:
- `POST /api/auth/google`\r\n- `POST /api/auth/login` (local, comptes enfants/adultes locaux)
- `GET /api/auth/me` (auth:sanctum)
- `POST /api/auth/logout` (auth:sanctum)

Admin (auth:sanctum + role:admin):
- `apiResource /api/admin/users`
- `apiResource /api/admin/vocab-lists`
- `apiResource /api/admin/vocab-lists/{vocab_list}/entries` (+ routes shallow `/api/admin/entries/{entry}`)

## Etat actuel

- Backend V2 pret techniquement et teste (`route:list`, `migrate:fresh --seed`, `artisan test`).
- Frontend `/admin` n'est pas encore branche sur cette API (etape suivante).

