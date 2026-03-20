<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

$pageTitle = 'Contact | Le Temple';
$pageDescription = 'Contacter Le Temple pour une question, un acces ou une demande avant reservation.';
$canonicalPath = 'contact.php';
$activePage = 'contact';

$contactSuccess = '';
$contactError = '';
$defaultContactEmail = $currentUser ? (string) $currentUser['email'] : '';
$contactData = [
    'nom' => trim((string) ($_POST['nom'] ?? ($currentUser ? $currentUser['prenom'] . ' ' . $currentUser['nom'] : ''))),
    'email' => trim((string) ($_POST['email'] ?? $defaultContactEmail)),
    'sujet' => trim((string) ($_POST['sujet'] ?? '')),
    'message' => trim((string) ($_POST['message'] ?? '')),
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($contactData['nom'] === '' || $contactData['sujet'] === '' || $contactData['message'] === '') {
        $contactError = 'Merci de completer tous les champs du formulaire.';
    } elseif (!filter_var($contactData['email'], FILTER_VALIDATE_EMAIL)) {
        $contactError = 'Merci de saisir un email valide.';
    } else {
        /*
        |------------------------------------------------------------------
        | Point de branchement pour un futur envoi d email
        |------------------------------------------------------------------
        | Vous pouvez brancher ici mail(), PHPMailer ou un service SMTP.
        */
        $contactSuccess = 'Votre message a bien ete pris en compte.';
        $contactData['sujet'] = '';
        $contactData['message'] = '';
    }
}

require __DIR__ . '/header.php';
?>
<header class="hero small-hero">
  <?php render_site_nav($activePage); ?>
  <div class="hero-content reveal">
    <p class="eyebrow">Contact</p>
    <h1>Acces, horaires et questions avant votre venue.</h1>
    <p class="lead">Nous repondons aux demandes de reservation, cartes cadeaux, premiere visite et privatisation.</p>
  </div>
</header>

<main>
  <section class="section reveal">
    <div class="split">
      <article class="panel">
        <h3>Coordonnees</h3>
        <ul class="mini-list">
          <li><span>Adresse</span><strong>12 Avenue du Voyage Sensoriel, 75000 Paris</strong></li>
          <li><span>Horaires</span><strong>Lundi - Dimanche, 10h00 - 22h00</strong></li>
          <li><span>Acces</span><strong>Metro ligne 4, parking a 3 minutes</strong></li>
        </ul>
      </article>
      <article class="panel">
        <h3>Questions frequentes</h3>
        <p>Besoin d aider pour choisir un soin, preparer une carte cadeau ou organiser une venue a deux ? Ecrivez-nous depuis le formulaire ci-dessous.</p>
      </article>
    </div>
  </section>

  <section class="section reveal form-section">
    <h2>Envoyer un message</h2>
    <?php if ($contactSuccess !== ''): ?>
      <div class="flash-message flash-success"><?= e($contactSuccess) ?></div>
    <?php elseif ($contactError !== ''): ?>
      <div class="flash-message flash-error"><?= e($contactError) ?></div>
    <?php endif; ?>
    <form class="spa-form" method="post" action="<?= e(php_page_url('contact.php')) ?>">
      <label>Nom
        <input type="text" name="nom" value="<?= e($contactData['nom']) ?>" required>
      </label>
      <label>Email
        <input type="email" name="email" value="<?= e($contactData['email']) ?>" required>
      </label>
      <label>Sujet
        <input type="text" name="sujet" value="<?= e($contactData['sujet']) ?>" required>
      </label>
      <label>Message
        <textarea name="message" rows="5" required><?= e($contactData['message']) ?></textarea>
      </label>
      <button type="submit" class="cta">Envoyer</button>
    </form>
  </section>
</main>

<?php require __DIR__ . '/footer.php'; ?>
