<?php
declare(strict_types=1);

session_start();

function normalize_web_path(string $value): string
{
    $value = str_replace('\\', '/', $value);

    if ($value === '/' || $value === '\\' || $value === '.') {
        return '';
    }

    return rtrim($value, '/');
}

function join_web_path(string $base, string $path = ''): string
{
    $base = $base !== '' ? rtrim($base, '/') : '';
    $path = ltrim($path, '/');

    if ($path === '') {
        return $base !== '' ? $base : '/';
    }

    return ($base !== '' ? $base : '') . '/' . $path;
}

$scriptDirectory = normalize_web_path(dirname((string) ($_SERVER['SCRIPT_NAME'] ?? '')));
$publicBasePath = preg_replace('#/assets/php$#', '', $scriptDirectory);
$publicBasePath = normalize_web_path((string) ($publicBasePath ?? ''));

/*
|--------------------------------------------------------------------------
| Connexion MySQL
|--------------------------------------------------------------------------
| Modifier ici les identifiants de connexion a votre base MySQL.
*/
$dbHost = '127.0.0.1';
$dbName = 'le_temple';
$dbUser = 'root';
$dbPassword = '';

$dbError = null;
$pdo = null;

try {
    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $dbHost, $dbName);
    $pdo = new PDO($dsn, $dbUser, $dbPassword, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $exception) {
    $dbError = 'Connexion MySQL impossible : verifiez config.php et la base de donnees.';
}

function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function public_url(string $path = ''): string
{
    global $publicBasePath;

    return join_web_path((string) $publicBasePath, $path);
}

function assets_url(string $path = ''): string
{
    return public_url('assets/' . ltrim($path, '/'));
}

function php_page_url(string $path = ''): string
{
    return public_url('assets/php/' . ltrim($path, '/'));
}

function redirect_to(string $path): void
{
    header('Location: ' . $path);
    exit;
}

function is_logged_in(): bool
{
    return !empty($_SESSION['user_id']);
}

function current_role(): ?string
{
    return $_SESSION['role'] ?? null;
}

function has_role(array $roles): bool
{
    return in_array((string) current_role(), $roles, true);
}

function require_role(array $roles): void
{
    if (!is_logged_in() || !has_role($roles)) {
        redirect_to(php_page_url('connexion.php'));
    }
}

function find_user_by_email(?PDO $pdo, string $email): ?array
{
    if (!$pdo) {
        return null;
    }

    $statement = $pdo->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
    $statement->execute(['email' => mb_strtolower(trim($email))]);
    $user = $statement->fetch();

    return $user ?: null;
}

function find_user_by_id(?PDO $pdo, int $userId): ?array
{
    if (!$pdo) {
        return null;
    }

    $statement = $pdo->prepare('SELECT * FROM users WHERE id = :id LIMIT 1');
    $statement->execute(['id' => $userId]);
    $user = $statement->fetch();

    return $user ?: null;
}

function current_user_data(?PDO $pdo): ?array
{
    if (!is_logged_in()) {
        return null;
    }

    $userId = (int) ($_SESSION['user_id'] ?? 0);
    if ($userId <= 0) {
        return null;
    }

    return find_user_by_id($pdo, $userId);
}

/*
|--------------------------------------------------------------------------
| Recommandations de soins
|--------------------------------------------------------------------------
| Adapter ici la logique si vous ajoutez de nouveaux besoins ou de nouveaux
| soins dans votre catalogue.
*/
function recommended_treatments_for_need(?string $need): array
{
    $need = mb_strtolower(trim((string) $need));

    if ($need === 'mieux dormir') {
        return [
            ['label' => 'Californien', 'anchor' => '#soin-californien', 'reason' => 'Massage enveloppant pour faire redescendre la charge mentale.'],
            ['label' => 'Abhyanga', 'anchor' => '#soin-abhyanga', 'reason' => 'Huile chaude et rythme lent pour apaiser le systeme nerveux.'],
            ['label' => 'Rituel Ayurvedique', 'anchor' => '#soin-rituel-ayurvedique', 'reason' => 'Format plus long pour relacher plus en profondeur.'],
        ];
    }

    if (in_array($need, ['douleurs', 'douleurs / tensions', 'tensions'], true)) {
        return [
            ['label' => 'Shiatsu', 'anchor' => '#soin-shiatsu', 'reason' => 'Pressions ciblees pour nuque, dos et epaules.'],
            ['label' => 'Suedois', 'anchor' => '#soin-suedois', 'reason' => 'Bon choix pour la recuperation musculaire.'],
            ['label' => 'Massage aux bambous', 'anchor' => '#soin-bambous', 'reason' => 'Travail plus profond si les tensions sont installees.'],
        ];
    }

    return [
        ['label' => 'Mauresque', 'anchor' => '#soin-mauresque', 'reason' => 'Cocon ideal pour le lacher-prise.'],
        ['label' => 'Rituel Oriental', 'anchor' => '#soin-rituel-oriental', 'reason' => 'Voyage sensoriel plus long pour couper avec l exterieur.'],
        ['label' => 'Spa privatif', 'anchor' => '#soin-spa', 'reason' => 'Pause plus intime a vivre seul ou a deux.'],
    ];
}

function faq_items_for_need(?string $need): array
{
    $base = [
        [
            'question' => 'Quel soin choisir si je veux mieux dormir ?',
            'answer' => 'Misez sur les soins enveloppants et lents qui aident le corps a faire redescendre la pression.',
            'links' => [
                ['label' => 'Californien', 'anchor' => '#soin-californien'],
                ['label' => 'Abhyanga', 'anchor' => '#soin-abhyanga'],
                ['label' => 'Rituel Ayurvedique', 'anchor' => '#soin-rituel-ayurvedique'],
            ],
        ],
        [
            'question' => 'J ai des douleurs ou des tensions musculaires, que choisir ?',
            'answer' => 'Les soins les plus structures ou plus profonds sont generalement les plus efficaces sur les tensions deja installees.',
            'links' => [
                ['label' => 'Shiatsu', 'anchor' => '#soin-shiatsu'],
                ['label' => 'Suedois', 'anchor' => '#soin-suedois'],
                ['label' => 'Massage aux bambous', 'anchor' => '#soin-bambous'],
            ],
        ],
        [
            'question' => 'Je veux surtout lacher prise rapidement.',
            'answer' => 'Choisissez un soin cocon ou un rituel plus long si vous voulez sentir une vraie coupure.',
            'links' => [
                ['label' => 'Mauresque', 'anchor' => '#soin-mauresque'],
                ['label' => 'Rituel Oriental', 'anchor' => '#soin-rituel-oriental'],
                ['label' => 'Spa privatif', 'anchor' => '#soin-spa'],
            ],
        ],
        [
            'question' => 'Quel soin recommandez-vous pour une premiere visite ?',
            'answer' => 'Nous conseillons un format simple, lisible et modulable en pression pour decouvrir le Temple sereinement.',
            'links' => [
                ['label' => 'Californien', 'anchor' => '#soin-californien'],
                ['label' => 'Hydratant visage', 'anchor' => '#soin-hydratant'],
                ['label' => 'Abhyanga', 'anchor' => '#soin-abhyanga'],
            ],
        ],
        [
            'question' => 'Je veux un soin visage avec un benefice visible.',
            'answer' => 'Selon votre objectif, nous n orientons pas vers les memes protocoles : eclat, confort ou effet tonique.',
            'links' => [
                ['label' => 'Hydratant', 'anchor' => '#soin-hydratant'],
                ['label' => 'Purifiant', 'anchor' => '#soin-purifiant'],
                ['label' => 'Kobido', 'anchor' => '#soin-kobido'],
            ],
        ],
        [
            'question' => 'Je veux offrir ou reserver un moment a deux.',
            'answer' => 'Les rituels longs et le spa privatif sont les plus simples a offrir et les plus lisibles pour une parenthese a deux.',
            'links' => [
                ['label' => 'Rituel Oriental', 'anchor' => '#soin-rituel-oriental'],
                ['label' => 'Rituel Balinais', 'anchor' => '#soin-rituel-balinais'],
                ['label' => 'Spa privatif', 'anchor' => '#soin-spa'],
            ],
        ],
    ];

    if (mb_strtolower(trim((string) $need)) === 'mieux dormir') {
        $base[0]['answer'] = 'Comme votre besoin principal est mieux dormir, nous mettons en avant les soins les plus lents et rassurants.';
    }

    return $base;
}

function current_week_context(?DateTimeImmutable $date = null): array
{
    $date = $date ?? new DateTimeImmutable('now');

    return [
        'week' => (int) $date->format('W'),
        'year' => (int) $date->format('o'),
    ];
}

function table_exists(PDO $pdo, string $table): bool
{
    $statement = $pdo->prepare('SHOW TABLES LIKE :table_name');
    $statement->execute(['table_name' => $table]);

    return (bool) $statement->fetchColumn();
}

function available_cabins(): array
{
    return ['Japon', 'Bali', 'Europe', 'Thailande', 'Mauresque'];
}

function available_time_slots(): array
{
    return ['10:00', '11:30', '14:00', '15:30', '17:00', '18:30'];
}

/*
|--------------------------------------------------------------------------
| Catalogue simplifie pour les pages PHP
|--------------------------------------------------------------------------
| Adapter ici la liste des soins si vous enrichissez la carte ou les
| ancres de la page soins.php.
*/
function available_treatments(): array
{
    return [
        ['label' => 'Californien', 'anchor' => '#soin-californien', 'cabine' => 'Europe'],
        ['label' => 'Shiatsu', 'anchor' => '#soin-shiatsu', 'cabine' => 'Japon'],
        ['label' => 'Suedois', 'anchor' => '#soin-suedois', 'cabine' => 'Europe'],
        ['label' => 'Thai a l\'huile', 'anchor' => '#soin-thai', 'cabine' => 'Thailande'],
        ['label' => 'Mauresque', 'anchor' => '#soin-mauresque', 'cabine' => 'Mauresque'],
        ['label' => 'Balinais', 'anchor' => '#soin-balinais', 'cabine' => 'Bali'],
        ['label' => 'Abhyanga', 'anchor' => '#soin-abhyanga', 'cabine' => 'Bali'],
        ['label' => 'Lomi Lomi', 'anchor' => '#soin-lomi', 'cabine' => 'Bali'],
        ['label' => 'Massage a la bougie', 'anchor' => '#soin-bougie', 'cabine' => 'Europe'],
        ['label' => 'Massage aux bambous', 'anchor' => '#soin-bambous', 'cabine' => 'Bali'],
        ['label' => 'Massage aux pochons', 'anchor' => '#soin-pochons', 'cabine' => 'Thailande'],
        ['label' => 'Rituel Oriental', 'anchor' => '#soin-rituel-oriental', 'cabine' => 'Mauresque'],
        ['label' => 'Rituel Ayurvedique', 'anchor' => '#soin-rituel-ayurvedique', 'cabine' => 'Bali'],
        ['label' => 'Rituel Balinais', 'anchor' => '#soin-rituel-balinais', 'cabine' => 'Bali'],
        ['label' => 'Rituel Nordique', 'anchor' => '#soin-rituel-nordique', 'cabine' => 'Europe'],
        ['label' => 'Soin visage hydratant', 'anchor' => '#soin-hydratant', 'cabine' => 'Europe'],
        ['label' => 'Soin visage purifiant', 'anchor' => '#soin-purifiant', 'cabine' => 'Europe'],
        ['label' => 'Soin visage anti-age (Kobido)', 'anchor' => '#soin-kobido', 'cabine' => 'Japon'],
        ['label' => 'Spa privatif', 'anchor' => '#soin-spa', 'cabine' => 'Europe'],
    ];
}

function week_navigation(int $week, int $year): array
{
    $current = (new DateTimeImmutable('now'))->setISODate($year, $week);
    $previous = $current->modify('-7 days');
    $next = $current->modify('+7 days');

    return [
        'previous' => [
            'week' => (int) $previous->format('W'),
            'year' => (int) $previous->format('o'),
        ],
        'next' => [
            'week' => (int) $next->format('W'),
            'year' => (int) $next->format('o'),
        ],
    ];
}

/*
|--------------------------------------------------------------------------
| Lignes par defaut pour le stock hebdomadaire
|--------------------------------------------------------------------------
| Adapter ici la liste si vous souhaitez ajouter de nouveaux produits.
*/
function ensure_stock_rows_for_week(PDO $pdo, int $week, int $year): void
{
    $check = $pdo->prepare('SELECT COUNT(*) FROM stocks_semaine WHERE semaine = :week AND annee = :year');
    $check->execute(['week' => $week, 'year' => $year]);

    if ((int) $check->fetchColumn() > 0) {
        return;
    }

    $defaultRows = [
        ['Huile neutre', 12, 0, 12],
        ['Serviettes epaisses', 40, 0, 40],
        ['Pochons', 16, 0, 16],
        ['Bougies massage', 14, 0, 14],
    ];

    $insert = $pdo->prepare(
        'INSERT INTO stocks_semaine (semaine, annee, produit, stock_initial, stock_utilise, stock_restant)
         VALUES (:week, :year, :product, :initial, :used, :remaining)'
    );

    foreach ($defaultRows as [$product, $initial, $used, $remaining]) {
        $insert->execute([
            'week' => $week,
            'year' => $year,
            'product' => $product,
            'initial' => $initial,
            'used' => $used,
            'remaining' => $remaining,
        ]);
    }
}

/*
|--------------------------------------------------------------------------
| Comptes de demonstration
|--------------------------------------------------------------------------
| Modifier ici les emails et les hashes si vous voulez changer les comptes
| tests affiches sur la page connexion.php.
*/
function seed_demo_accounts(?PDO $pdo): void
{
    if (!$pdo || !table_exists($pdo, 'users')) {
        return;
    }

    $demoUsers = [
        [
            'role' => 'client',
            'prenom' => 'Lylian',
            'nom' => 'Client Test',
            'email' => 'test.client@le-temple.fr',
            'mot_de_passe' => '$2y$12$1ClxZB2eczt.n2SoOq6sxefm5Wm0OEnDFQ69GN9JiAdud8r5omRJe',
            'besoin_principal' => 'mieux dormir',
        ],
        [
            'role' => 'employe',
            'prenom' => 'Camille',
            'nom' => 'Equipe Temple',
            'email' => 'employe@le-temple.fr',
            'mot_de_passe' => '$2y$12$yN./77QmRUkYen5pzFm4yuc60Zeds34oNeoX85rPYisWiA5oeLND.',
            'besoin_principal' => 'organisation interne',
        ],
    ];

    $insert = $pdo->prepare(
        'INSERT INTO users (role, prenom, nom, email, mot_de_passe, besoin_principal)
         VALUES (:role, :prenom, :nom, :email, :mot_de_passe, :besoin_principal)'
    );

    foreach ($demoUsers as $demoUser) {
        if (find_user_by_email($pdo, $demoUser['email'])) {
            continue;
        }

        $insert->execute($demoUser);
    }
}

if ($pdo) {
    seed_demo_accounts($pdo);
}

$currentUser = current_user_data($pdo);
