<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

$loginError = '';
$registerError = '';
$pageInfo = '';

$loginEmail = trim((string) ($_POST['login_email'] ?? ''));
$registerData = [
    'prenom' => trim((string) ($_POST['prenom'] ?? '')),
    'nom' => trim((string) ($_POST['nom'] ?? '')),
    'email' => trim((string) ($_POST['register_email'] ?? '')),
    'besoin_principal' => trim((string) ($_POST['besoin_principal'] ?? 'mieux dormir')),
];

$usersTableReady = $pdo && table_exists($pdo, 'users');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $formAction = (string) ($_POST['form_action'] ?? '');

    if (!$pdo) {
        $loginError = $dbError ?? 'La base de donnees est indisponible pour le moment.';
        $registerError = $loginError;
    } elseif (!$usersTableReady) {
        $loginError = 'La table users n existe pas encore. Importez d abord database/schema.sql.';
        $registerError = $loginError;
    } elseif ($formAction === 'login') {
        $password = (string) ($_POST['login_password'] ?? '');
        $user = find_user_by_email($pdo, $loginEmail);

        if (!$user || !password_verify($password, (string) $user['mot_de_passe'])) {
            $loginError = 'Email ou mot de passe incorrect.';
        } else {
            session_regenerate_id(true);
            $_SESSION['user_id'] = (int) $user['id'];
            $_SESSION['prenom'] = (string) $user['prenom'];
            $_SESSION['role'] = (string) $user['role'];

            redirect_to(in_array((string) $user['role'], ['employe', 'admin'], true) ? php_page_url('employes.php') : php_page_url('soins.php'));
        }
    } elseif ($formAction === 'register') {
        /*
        |------------------------------------------------------------------
        | Creation de compte client
        |------------------------------------------------------------------
        | Ajouter ici de nouveaux champs si vous enrichissez la table users.
        */
        $password = (string) ($_POST['register_password'] ?? '');
        $passwordConfirmation = (string) ($_POST['register_password_confirmation'] ?? '');

        if ($registerData['prenom'] === '' || $registerData['nom'] === '' || $registerData['email'] === '') {
            $registerError = 'Merci de completer prenom, nom et email.';
        } elseif (!filter_var($registerData['email'], FILTER_VALIDATE_EMAIL)) {
            $registerError = 'Merci de saisir un email valide.';
        } elseif (strlen($password) < 8) {
            $registerError = 'Le mot de passe doit contenir au moins 8 caracteres.';
        } elseif ($password !== $passwordConfirmation) {
            $registerError = 'La confirmation du mot de passe ne correspond pas.';
        } elseif (find_user_by_email($pdo, $registerData['email'])) {
            $registerError = 'Un compte existe deja avec cet email.';
        } else {
            $statement = $pdo->prepare(
                'INSERT INTO users (role, prenom, nom, email, mot_de_passe, besoin_principal)
                 VALUES (:role, :prenom, :nom, :email, :mot_de_passe, :besoin_principal)'
            );
            $statement->execute([
                'role' => 'client',
                'prenom' => $registerData['prenom'],
                'nom' => $registerData['nom'],
                'email' => mb_strtolower($registerData['email']),
                'mot_de_passe' => password_hash($password, PASSWORD_DEFAULT),
                'besoin_principal' => $registerData['besoin_principal'] !== '' ? $registerData['besoin_principal'] : 'lacher-prise',
            ]);

            $user = find_user_by_email($pdo, $registerData['email']);
            if ($user) {
                session_regenerate_id(true);
                $_SESSION['user_id'] = (int) $user['id'];
                $_SESSION['prenom'] = (string) $user['prenom'];
                $_SESSION['role'] = (string) $user['role'];
                redirect_to(php_page_url('soins.php'));
            }

            $pageInfo = 'Compte cree. Vous pouvez maintenant vous connecter.';
        }
    }
}

$pageTitle = 'Connexion | Le Temple';
$pageDescription = 'Connexion client et employe pour Le Temple.';
$canonicalPath = 'connexion.php';
$activePage = 'connexion';

require __DIR__ . '/header.php';
?>
<header class="hero small-hero">
  <?php render_site_nav($activePage); ?>
  <div class="hero-content reveal">
    <p class="eyebrow">Espace client et employe</p>
    <h1>Connexion PHP reliee a MySQL.</h1>
    <p class="lead">
      Connectez-vous avec un compte client pour retrouver vos recommandations sur la page soins,
      ou avec un compte employe pour acceder au planning et au stock de la semaine.
    </p>
  </div>
</header>

<main>
  <section class="section reveal form-section">
    <div class="section-intro">
      <p class="eyebrow eyebrow-soft">Identifiants de demonstration</p>
      <h2>Comptes de test inclus dans le projet.</h2>
      <p>Ils sont aussi semes automatiquement par <code>config.php</code> si la table <code>users</code> existe deja.</p>
    </div>
    <div class="offer-grid">
      <article class="credentials-card">
        <p class="eyebrow eyebrow-soft">Compte client test</p>
        <ul class="credential-list">
          <li><span>Email</span><strong>test.client@le-temple.fr</strong></li>
          <li><span>Mot de passe</span><strong>Test1234!</strong></li>
          <li><span>Profil</span><strong>Lylian / mieux dormir</strong></li>
        </ul>
      </article>
      <article class="credentials-card">
        <p class="eyebrow eyebrow-soft">Compte employe test</p>
        <ul class="credential-list">
          <li><span>Email</span><strong>employe@le-temple.fr</strong></li>
          <li><span>Mot de passe</span><strong>Employe123!</strong></li>
          <li><span>Profil</span><strong>Camille / employe</strong></li>
        </ul>
      </article>
    </div>
  </section>

  <?php if ($dbError): ?>
    <section class="section reveal form-section">
      <div class="flash-message flash-error"><?= e($dbError) ?></div>
    </section>
  <?php endif; ?>

  <?php if ($currentUser): ?>
    <section class="section reveal form-section">
      <div class="recommendation-hero">
        <p class="eyebrow eyebrow-soft">Session active</p>
        <h2>Bonjour <?= e((string) $currentUser['prenom']) ?></h2>
        <p>
          Vous etes connecte en tant que <strong><?= e((string) $currentUser['role']) ?></strong>.
          <?php if (has_role(['employe', 'admin'])): ?>
            Vous pouvez aller directement sur l espace employe.
          <?php else: ?>
            Vous pouvez debloquer la FAQ personnalisee sur la page soins.
          <?php endif; ?>
        </p>
        <div class="section-actions">
          <a class="cta" href="<?= e(has_role(['employe', 'admin']) ? php_page_url('employes.php') : php_page_url('soins.php')) ?><?= has_role(['employe', 'admin']) ? '' : '#faq-conseils' ?>">
            <?= has_role(['employe', 'admin']) ? 'Aller a l espace employe' : 'Voir mes conseils personnalises' ?>
          </a>
          <a class="text-link" href="<?= e(php_page_url('logout.php')) ?>">Se deconnecter</a>
        </div>
      </div>
    </section>
  <?php endif; ?>

  <section class="section reveal form-section">
    <h2>Se connecter</h2>
    <?php if ($loginError !== ''): ?>
      <div class="flash-message flash-error"><?= e($loginError) ?></div>
    <?php elseif ($pageInfo !== ''): ?>
      <div class="flash-message flash-success"><?= e($pageInfo) ?></div>
    <?php endif; ?>
    <form class="spa-form" method="post" action="<?= e(php_page_url('connexion.php')) ?>">
      <input type="hidden" name="form_action" value="login">
      <label>Email
        <input type="email" name="login_email" value="<?= e($loginEmail) ?>" required>
      </label>
      <label>Mot de passe
        <input type="password" name="login_password" required>
      </label>
      <button type="submit" class="cta">Acceder a mon compte</button>
    </form>
  </section>

  <section class="section reveal form-section" id="register-account">
    <h2>Creer un compte client</h2>
    <p class="small-note">Ce formulaire cree un utilisateur en base avec le role <strong>client</strong>.</p>
    <?php if ($registerError !== ''): ?>
      <div class="flash-message flash-error"><?= e($registerError) ?></div>
    <?php endif; ?>
    <form class="spa-form" method="post" action="<?= e(php_page_url('connexion.php')) ?>#register-account">
      <input type="hidden" name="form_action" value="register">
      <label>Prenom
        <input type="text" name="prenom" value="<?= e($registerData['prenom']) ?>" required>
      </label>
      <label>Nom
        <input type="text" name="nom" value="<?= e($registerData['nom']) ?>" required>
      </label>
      <label>Email
        <input type="email" name="register_email" value="<?= e($registerData['email']) ?>" required>
      </label>
      <label>Mot de passe
        <input type="password" name="register_password" minlength="8" required>
      </label>
      <label>Confirmer le mot de passe
        <input type="password" name="register_password_confirmation" minlength="8" required>
      </label>
      <label>Besoin principal
        <select name="besoin_principal" required>
          <option value="mieux dormir"<?= $registerData['besoin_principal'] === 'mieux dormir' ? ' selected' : '' ?>>Mieux dormir</option>
          <option value="douleurs"<?= $registerData['besoin_principal'] === 'douleurs' ? ' selected' : '' ?>>Douleurs / tensions</option>
          <option value="lacher-prise"<?= $registerData['besoin_principal'] === 'lacher-prise' ? ' selected' : '' ?>>Lacher-prise</option>
        </select>
      </label>
      <button type="submit" class="cta">Creer mon compte</button>
    </form>
  </section>
</main>

<?php require __DIR__ . '/footer.php'; ?>
