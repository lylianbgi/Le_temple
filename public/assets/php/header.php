<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

$pageTitle = $pageTitle ?? 'Le Temple | Spa sensoriel a Paris';
$pageDescription = $pageDescription ?? 'Le Temple, spa holistique et sensoriel a Paris.';
$canonicalPath = $canonicalPath ?? 'index.php';
$activePage = $activePage ?? '';

if (!function_exists('render_nav_link')) {
    function render_nav_link(string $href, string $label, string $pageKey, string $activePage, string $note = ''): void
    {
        $isActive = $pageKey === $activePage;
        ?>
        <a href="<?= e($href) ?>"<?= $isActive ? ' aria-current="page"' : '' ?>>
          <span class="menu-link-wrap">
            <span class="menu-label"><?= e($label) ?></span>
            <?php if ($note !== ''): ?>
              <span class="menu-note"><?= e($note) ?></span>
            <?php endif; ?>
          </span>
        </a>
        <?php
    }
}

if (!function_exists('render_site_nav')) {
    function render_site_nav(string $activePage = ''): void
    {
        global $currentUser;

        $navItems = [
            ['href' => php_page_url('index.php'), 'label' => 'Accueil', 'key' => 'index', 'note' => 'Spa sensoriel a Paris'],
            ['href' => public_url('concept.html'), 'label' => 'Concept', 'key' => 'concept', 'note' => 'Vision, equipe, philosophie'],
            ['href' => public_url('cabines.html'), 'label' => 'Cabines', 'key' => 'cabines', 'note' => '5 univers immersifs'],
            ['href' => php_page_url('soins.php'), 'label' => 'Experiences', 'key' => 'soins', 'note' => 'Choisir selon votre besoin'],
            ['href' => public_url('jeu.html'), 'label' => 'Jeu', 'key' => 'jeu', 'note' => 'Tente de gagner un soin'],
            ['href' => php_page_url('reservation.php'), 'label' => 'Reservation', 'key' => 'reservation', 'note' => 'Prendre rendez-vous'],
            ['href' => php_page_url('contact.php'), 'label' => 'Contact', 'key' => 'contact', 'note' => 'Acces, horaires, questions'],
        ];
        ?>
        <nav class="nav">
          <a class="brand brand-link" href="<?= e(php_page_url('index.php')) ?>" aria-label="Le Temple, retour a l'accueil">
            <img class="brand-logo" src="<?= e(assets_url('icons/logo-temple.svg')) ?>" alt="" aria-hidden="true">
            <span class="brand-text">LE TEMPLE</span>
          </a>
          <div class="menu" id="site-menu">
            <?php foreach ($navItems as $item): ?>
              <?php render_nav_link($item['href'], $item['label'], $item['key'], $activePage, $item['note']); ?>
            <?php endforeach; ?>
            <?php if ($currentUser): ?>
              <?php if (has_role(['employe', 'admin'])): ?>
                <?php render_nav_link(php_page_url('employes.php'), 'Espace employe', 'employes', $activePage, 'Planning et stock'); ?>
              <?php endif; ?>
              <span class="nav-user">Bonjour <?= e($currentUser['prenom']) ?></span>
              <a href="<?= e(php_page_url('logout.php')) ?>">Deconnexion</a>
            <?php else: ?>
              <?php render_nav_link(php_page_url('connexion.php'), 'Connexion', 'connexion', $activePage, 'Compte client et employe'); ?>
            <?php endif; ?>
          </div>
          <button class="menu-backdrop" type="button" tabindex="-1" aria-hidden="true"></button>
          <button class="menu-toggle" type="button" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="site-menu">
            <span class="menu-toggle-icon" aria-hidden="true"><span></span><span></span><span></span></span>
            <span class="sr-only">Menu</span>
          </button>
          <a class="cta cta-book" href="<?= e(php_page_url('reservation.php')) ?>">Reserver</a>
        </nav>
        <?php
    }
}
?>
<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($pageTitle) ?></title>
  <meta name="description" content="<?= e($pageDescription) ?>">
  <meta name="theme-color" content="#2b6a4a">
  <link rel="canonical" href="https://letemple-spa.fr<?= e(php_page_url($canonicalPath)) ?>">
  <link rel="icon" href="<?= e(assets_url('icons/favicon.svg')) ?>" type="image/svg+xml">
  <link rel="manifest" href="<?= e(public_url('site.webmanifest')) ?>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Urbanist:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="<?= e(assets_url('css/styles.css')) ?>">
</head>
<body>
