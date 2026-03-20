<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

$pageTitle = 'Reservation | Le Temple';
$pageDescription = 'Reserver un soin au Temple avec une vraie logique PHP et MySQL.';
$canonicalPath = 'reservation.php';
$activePage = 'reservation';

$reservationsReady = $pdo && table_exists($pdo, 'reservations') && table_exists($pdo, 'users');
$successMessage = '';
$errorMessage = '';

$formData = [
    'nom_complet' => $currentUser ? trim((string) $currentUser['prenom'] . ' ' . $currentUser['nom']) : trim((string) ($_POST['nom_complet'] ?? '')),
    'email' => $currentUser ? (string) $currentUser['email'] : trim((string) ($_POST['email'] ?? '')),
    'type_soin' => trim((string) ($_POST['type_soin'] ?? ($_GET['soin'] ?? ''))),
    'date_seance' => trim((string) ($_POST['date_seance'] ?? '')),
    'heure_seance' => trim((string) ($_POST['heure_seance'] ?? '')),
    'cabine' => trim((string) ($_POST['cabine'] ?? ($_GET['cabine'] ?? ''))),
    'format' => trim((string) ($_POST['format'] ?? ($_GET['format'] ?? 'Solo'))),
    'commentaire' => trim((string) ($_POST['commentaire'] ?? ($_GET['note'] ?? ''))),
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!$pdo) {
        $errorMessage = $dbError ?? 'La base de donnees est indisponible.';
    } elseif (!$reservationsReady) {
        $errorMessage = 'Les tables users et reservations doivent etre creees avant d enregistrer une reservation.';
    } else {
        $dateObject = DateTimeImmutable::createFromFormat('Y-m-d', $formData['date_seance']);
        $timeObject = DateTimeImmutable::createFromFormat('H:i', $formData['heure_seance']);

        if ($formData['type_soin'] === '' || $formData['cabine'] === '') {
            $errorMessage = 'Merci de choisir un soin et une cabine.';
        } elseif (!$dateObject || !$timeObject) {
            $errorMessage = 'Merci de renseigner une date et une heure valides.';
        } elseif (!in_array($formData['cabine'], available_cabins(), true)) {
            $errorMessage = 'La cabine choisie n est pas valide.';
        } else {
            $user = $currentUser;

            if (!$user) {
                if (!filter_var($formData['email'], FILTER_VALIDATE_EMAIL)) {
                    $errorMessage = 'Merci de saisir un email valide.';
                } else {
                    $user = find_user_by_email($pdo, $formData['email']);
                    if (!$user) {
                        $errorMessage = 'Aucun compte client ne correspond a cet email. Creez un compte ou connectez-vous avant de reserver.';
                    }
                }
            }

            if ($user && $errorMessage === '') {
                $statement = $pdo->prepare(
                    'INSERT INTO reservations (user_id, type_soin, date_seance, heure_seance, cabine, origine, commentaire)
                     VALUES (:user_id, :type_soin, :date_seance, :heure_seance, :cabine, :origine, :commentaire)'
                );
                $statement->execute([
                    'user_id' => (int) $user['id'],
                    'type_soin' => $formData['type_soin'],
                    'date_seance' => $dateObject->format('Y-m-d'),
                    'heure_seance' => $timeObject->format('H:i:s'),
                    'cabine' => $formData['cabine'],
                    'origine' => 'auto',
                    'commentaire' => trim($formData['commentaire'] . ($formData['format'] !== '' ? ' | Format: ' . $formData['format'] : '')),
                ]);

                $successMessage = 'Votre reservation a bien ete enregistree. Elle apparaitra dans le planning employe.';
                $formData['date_seance'] = '';
                $formData['heure_seance'] = '';
                $formData['commentaire'] = '';
            }
        }
    }
}

require __DIR__ . '/header.php';
?>
<header class="hero small-hero">
  <?php render_site_nav($activePage); ?>
  <div class="hero-content reveal">
    <p class="eyebrow">Prise de rendez-vous</p>
    <h1>Reservation claire, reliee a la base et visible cote employe.</h1>
    <p class="lead">
      <?php if ($currentUser): ?>
        Bonjour <?= e((string) $currentUser['prenom']) ?>, votre email et votre profil client sont deja reconnus pour accelerer la reservation.
      <?php else: ?>
        Vous pouvez reserver avec un compte client existant. Si vous n en avez pas encore, creez-le depuis la page connexion.
      <?php endif; ?>
    </p>
    <div class="hero-actions">
      <a class="cta cta-book" href="#formulaire-reservation">Reserver maintenant</a>
      <a class="text-link text-link-light" href="<?= e(php_page_url('connexion.php')) ?>">Me connecter</a>
    </div>
  </div>
</header>

<main>
  <section class="section reveal">
    <div class="split">
      <article class="panel">
        <h3>Repere rapide</h3>
        <ul class="mini-list">
          <li><span>Arrivee conseillee</span><strong>10 min avant</strong></li>
          <li><span>Format duo</span><strong>2 personnes</strong></li>
          <li><span>Horaires</span><strong>10h00 - 22h00</strong></li>
        </ul>
      </article>
      <article class="panel">
        <h3>Connexion utile</h3>
        <p>Les reservations automatiques sont associees a un compte client existant pour apparaitre proprement dans l espace employe.</p>
        <a class="text-link" href="<?= e(php_page_url('connexion.php')) ?>#register-account">Creer un compte client</a>
      </article>
    </div>
  </section>

  <section class="section reveal form-section" id="formulaire-reservation">
    <h2>Reserver un soin</h2>
    <div class="social-proof social-proof-inline">
      <strong>Note moyenne</strong>
      <span>4,9/5 sur 187 avis.</span>
    </div>
    <?php if ($successMessage !== ''): ?>
      <div class="flash-message flash-success"><?= e($successMessage) ?></div>
    <?php elseif ($errorMessage !== ''): ?>
      <div class="flash-message flash-error"><?= e($errorMessage) ?></div>
    <?php endif; ?>
    <form class="spa-form" method="post" action="<?= e(php_page_url('reservation.php')) ?>#formulaire-reservation">
      <label>Nom complet
        <input type="text" name="nom_complet" value="<?= e($formData['nom_complet']) ?>"<?= $currentUser ? ' readonly' : '' ?> required>
      </label>
      <label>Email
        <input type="email" name="email" value="<?= e($formData['email']) ?>"<?= $currentUser ? ' readonly' : '' ?> required>
      </label>
      <label>Soin souhaite
        <select name="type_soin" required>
          <option value="">Choisir un soin</option>
          <?php foreach (available_treatments() as $treatment): ?>
            <option value="<?= e($treatment['label']) ?>"<?= $formData['type_soin'] === $treatment['label'] ? ' selected' : '' ?>>
              <?= e($treatment['label']) ?>
            </option>
          <?php endforeach; ?>
        </select>
      </label>
      <label>Cabine souhaitee
        <select name="cabine" required>
          <option value="">Choisir une cabine</option>
          <?php foreach (available_cabins() as $cabin): ?>
            <option value="<?= e($cabin) ?>"<?= $formData['cabine'] === $cabin ? ' selected' : '' ?>><?= e($cabin) ?></option>
          <?php endforeach; ?>
        </select>
      </label>
      <label>Date souhaitee
        <input type="date" name="date_seance" value="<?= e($formData['date_seance']) ?>" required>
      </label>
      <label>Heure souhaitee
        <select name="heure_seance" required>
          <option value="">Choisir un creneau</option>
          <?php foreach (available_time_slots() as $timeSlot): ?>
            <option value="<?= e($timeSlot) ?>"<?= $formData['heure_seance'] === $timeSlot ? ' selected' : '' ?>><?= e($timeSlot) ?></option>
          <?php endforeach; ?>
        </select>
      </label>
      <label>Format
        <select name="format" required>
          <option value="Solo"<?= $formData['format'] === 'Solo' ? ' selected' : '' ?>>Solo</option>
          <option value="Duo"<?= $formData['format'] === 'Duo' ? ' selected' : '' ?>>Duo</option>
        </select>
      </label>
      <label>Message
        <textarea name="commentaire" rows="4" placeholder="Preferences de pression, occasion speciale, contraintes ou attentes particuliere"><?= e($formData['commentaire']) ?></textarea>
      </label>
      <button type="submit" class="cta">Envoyer la demande</button>
    </form>
  </section>
</main>

<?php require __DIR__ . '/footer.php'; ?>
