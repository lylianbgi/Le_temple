<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

require_role(['employe', 'admin']);

$context = current_week_context();
$requestedWeek = (int) ($_REQUEST['week'] ?? $context['week']);
$requestedYear = (int) ($_REQUEST['year'] ?? $context['year']);
$selectedWeek = max(1, min(53, $requestedWeek));
$selectedYear = max(2024, min(2100, $requestedYear));
$selectedDate = (new DateTimeImmutable('now'))->setISODate($selectedYear, $selectedWeek);
$selectedWeek = (int) $selectedDate->format('W');
$selectedYear = (int) $selectedDate->format('o');

$weekNavigation = week_navigation($selectedWeek, $selectedYear);
$weekStart = $selectedDate->format('Y-m-d');
$weekEnd = $selectedDate->modify('+6 days')->format('Y-m-d');
$weekLabel = sprintf('Semaine %d - du %s au %s', $selectedWeek, $selectedDate->format('d/m'), $selectedDate->modify('+6 days')->format('d/m/Y'));

$pageTitle = 'Espace employe | Le Temple';
$pageDescription = 'Planning, reservations et stock hebdomadaire pour Le Temple.';
$canonicalPath = 'employes.php';
$activePage = 'employes';

$manualError = '';
$notice = (string) ($_GET['notice'] ?? '');

$missingTables = [];
if ($pdo) {
    foreach (['users', 'reservations', 'stocks_semaine'] as $table) {
        if (!table_exists($pdo, $table)) {
            $missingTables[] = $table;
        }
    }
} else {
    $missingTables = ['users', 'reservations', 'stocks_semaine'];
}

$schemaReady = $pdo && $missingTables === [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!$schemaReady) {
        $manualError = $dbError ?? 'Le schema MySQL n est pas encore pret.';
    } else {
        $formAction = (string) ($_POST['form_action'] ?? '');

        if ($formAction === 'manual_reservation') {
            /*
            |--------------------------------------------------------------
            | Reservation employee manuelle
            |--------------------------------------------------------------
            | Ajouter ici des champs supplementaires si vous enrichissez
            | la table reservations.
            */
            $emailClient = trim((string) ($_POST['email_client'] ?? ''));
            $typeSoin = trim((string) ($_POST['type_soin'] ?? ''));
            $dateSeance = trim((string) ($_POST['date_seance'] ?? ''));
            $heureSeance = trim((string) ($_POST['heure_seance'] ?? ''));
            $cabine = trim((string) ($_POST['cabine'] ?? ''));
            $commentaire = trim((string) ($_POST['commentaire'] ?? ''));

            $dateObject = DateTimeImmutable::createFromFormat('Y-m-d', $dateSeance);
            $timeObject = DateTimeImmutable::createFromFormat('H:i', $heureSeance);
            $client = $emailClient !== '' ? find_user_by_email($pdo, $emailClient) : null;

            if (!$client) {
                $manualError = 'Aucun client ne correspond a cet email. Creez le compte client avant la reservation manuelle.';
            } elseif ($typeSoin === '' || $cabine === '' || !$dateObject || !$timeObject) {
                $manualError = 'Merci de completer email, soin, date, heure et cabine.';
            } elseif (!in_array($cabine, available_cabins(), true)) {
                $manualError = 'La cabine choisie n est pas valide.';
            } else {
                $insert = $pdo->prepare(
                    'INSERT INTO reservations (user_id, type_soin, date_seance, heure_seance, cabine, origine, commentaire)
                     VALUES (:user_id, :type_soin, :date_seance, :heure_seance, :cabine, :origine, :commentaire)'
                );
                $insert->execute([
                    'user_id' => (int) $client['id'],
                    'type_soin' => $typeSoin,
                    'date_seance' => $dateObject->format('Y-m-d'),
                    'heure_seance' => $timeObject->format('H:i:s'),
                    'cabine' => $cabine,
                    'origine' => 'manuel',
                    'commentaire' => $commentaire,
                ]);

                redirect_to(sprintf(
                    '%s?week=%d&year=%d&notice=reservation-added#planning-edt',
                    php_page_url('employes.php'),
                    (int) $dateObject->format('W'),
                    (int) $dateObject->format('o')
                ));
            }
        } elseif ($formAction === 'update_stock') {
            /*
            |--------------------------------------------------------------
            | Mise a jour du stock hebdomadaire
            |--------------------------------------------------------------
            | Les produits par defaut sont definis dans config.php, fonction
            | ensure_stock_rows_for_week().
            */
            $stockUtilise = $_POST['stock_utilise'] ?? [];
            $stockRestant = $_POST['stock_restant'] ?? [];

            $update = $pdo->prepare(
                'UPDATE stocks_semaine
                 SET stock_utilise = :stock_utilise, stock_restant = :stock_restant
                 WHERE id = :id AND semaine = :week AND annee = :year'
            );

            foreach ($stockUtilise as $rowId => $usedValue) {
                $rowId = (int) $rowId;
                $used = max(0, (int) $usedValue);
                $remaining = max(0, (int) ($stockRestant[$rowId] ?? 0));

                $update->execute([
                    'stock_utilise' => $used,
                    'stock_restant' => $remaining,
                    'id' => $rowId,
                    'week' => $selectedWeek,
                    'year' => $selectedYear,
                ]);
            }

            redirect_to(sprintf('%s?week=%d&year=%d&notice=stock-updated#stock-semaine', php_page_url('employes.php'), $selectedWeek, $selectedYear));
        }
    }
}

$reservations = [];
$autoReservations = [];
$manualReservations = [];
$stockRows = [];
$weekdayLabels = [
    'Monday' => 'Lundi',
    'Tuesday' => 'Mardi',
    'Wednesday' => 'Mercredi',
    'Thursday' => 'Jeudi',
    'Friday' => 'Vendredi',
    'Saturday' => 'Samedi',
    'Sunday' => 'Dimanche',
];

if ($schemaReady) {
    ensure_stock_rows_for_week($pdo, $selectedWeek, $selectedYear);

    $reservationStatement = $pdo->prepare(
        'SELECT
            reservations.id,
            reservations.type_soin,
            reservations.date_seance,
            reservations.heure_seance,
            reservations.cabine,
            reservations.origine,
            reservations.commentaire,
            users.prenom,
            users.nom,
            users.email
         FROM reservations
         LEFT JOIN users ON users.id = reservations.user_id
         WHERE reservations.date_seance BETWEEN :week_start AND :week_end
         ORDER BY reservations.date_seance ASC, reservations.heure_seance ASC'
    );
    $reservationStatement->execute([
        'week_start' => $weekStart,
        'week_end' => $weekEnd,
    ]);
    $reservations = $reservationStatement->fetchAll() ?: [];
    $autoReservations = array_values(array_filter($reservations, static fn(array $reservation): bool => $reservation['origine'] === 'auto'));
    $manualReservations = array_values(array_filter($reservations, static fn(array $reservation): bool => $reservation['origine'] === 'manuel'));

    $stockStatement = $pdo->prepare(
        'SELECT id, produit, stock_initial, stock_utilise, stock_restant
         FROM stocks_semaine
         WHERE semaine = :week AND annee = :year
         ORDER BY produit ASC'
    );
    $stockStatement->execute([
        'week' => $selectedWeek,
        'year' => $selectedYear,
    ]);
    $stockRows = $stockStatement->fetchAll() ?: [];
}

$scheduleDays = [];
$dayCursor = $selectedDate;
for ($dayOffset = 0; $dayOffset < 7; $dayOffset++) {
    $dateKey = $dayCursor->format('Y-m-d');
    $slots = [];
    foreach (available_time_slots() as $timeSlot) {
        $slots[$timeSlot] = array_values(array_filter(
            $reservations,
            static fn(array $reservation): bool => $reservation['date_seance'] === $dateKey && substr((string) $reservation['heure_seance'], 0, 5) === $timeSlot
        ));
    }

    $scheduleDays[] = [
        'date' => $dayCursor,
        'key' => $dateKey,
        'label' => $weekdayLabels[$dayCursor->format('l')] ?? $dayCursor->format('l'),
        'slots' => $slots,
    ];
    $dayCursor = $dayCursor->modify('+1 day');
}

$noticeMessage = '';
if ($notice === 'reservation-added') {
    $noticeMessage = 'La reservation manuelle a bien ete ajoutee.';
} elseif ($notice === 'stock-updated') {
    $noticeMessage = 'Le stock de la semaine a bien ete mis a jour.';
}

require __DIR__ . '/header.php';
?>
<header class="hero small-hero">
  <?php render_site_nav($activePage); ?>
  <div class="hero-content reveal">
    <p class="eyebrow">Back-office</p>
    <h1>Planning / EDT et stock semaine.</h1>
    <p class="lead">Vue employee reliee a MySQL pour suivre les reservations auto, les ajouts manuels et le stock cabine.</p>
  </div>
</header>

<main>
  <section class="section reveal">
    <div class="employee-toolbar">
      <div>
        <p class="eyebrow eyebrow-soft">Session interne</p>
        <h2>Bonjour <?= e((string) $currentUser['prenom']) ?></h2>
        <p class="small-note"><?= e($weekLabel) ?></p>
      </div>
      <div class="employee-actions">
        <a class="cta danger" href="<?= e(php_page_url('logout.php')) ?>">Deconnexion</a>
      </div>
    </div>

    <?php if ($noticeMessage !== ''): ?>
      <div class="flash-message flash-success"><?= e($noticeMessage) ?></div>
    <?php endif; ?>

    <?php if (!$schemaReady): ?>
      <div class="flash-message flash-error">
        Schema incomplet. Il manque : <?= e(implode(', ', $missingTables)) ?>.
        Importez d abord <code>database/schema.sql</code>.
      </div>
    <?php endif; ?>

    <div class="dashboard-tabs" role="navigation" aria-label="Navigation espace employe">
      <a class="tab-button is-active" href="#planning-edt">Planning / EDT</a>
      <a class="tab-button" href="#stock-semaine">Stock semaine</a>
    </div>

    <div class="week-switcher">
      <a class="cta ghost-button" href="<?= e(php_page_url('employes.php')) ?>?week=<?= e((string) $weekNavigation['previous']['week']) ?>&year=<?= e((string) $weekNavigation['previous']['year']) ?>">Semaine precedente</a>
      <strong><?= e($weekLabel) ?></strong>
      <a class="cta ghost-button" href="<?= e(php_page_url('employes.php')) ?>?week=<?= e((string) $weekNavigation['next']['week']) ?>&year=<?= e((string) $weekNavigation['next']['year']) ?>">Semaine suivante</a>
    </div>
  </section>

  <section class="section reveal" id="planning-edt">
    <div class="section-intro">
      <p class="eyebrow eyebrow-soft">Planning / EDT</p>
      <h2>Une semaine en colonnes, avec cases occupees par creneau.</h2>
    </div>

    <div class="quick-facts-grid">
      <article class="fact-spotlight">
        <p class="fact-kicker">Reservations totales</p>
        <h3><?= e((string) count($reservations)) ?></h3>
        <p>Sur la semaine actuellement chargee dans le planning.</p>
      </article>
      <article class="fact-spotlight">
        <p class="fact-kicker">Automatiques</p>
        <h3><?= e((string) count($autoReservations)) ?></h3>
        <p>Ajoutees par les clients via le site.</p>
      </article>
      <article class="fact-spotlight">
        <p class="fact-kicker">Manuelles</p>
        <h3><?= e((string) count($manualReservations)) ?></h3>
        <p>Ajoutees depuis cet espace employe.</p>
      </article>
    </div>

    <div class="planning-board-wrap">
      <div class="planning-board">
        <?php foreach ($scheduleDays as $day): ?>
          <article class="planning-day-card">
            <header class="planning-day-head">
              <strong><?= e((string) $day['label']) ?></strong>
              <span><?= e($day['date']->format('d/m')) ?></span>
            </header>
            <div class="planning-slots">
              <?php foreach ($day['slots'] as $timeSlot => $slotReservations): ?>
                <section class="planning-slot<?= $slotReservations !== [] ? ' is-booked' : ' is-free' ?>">
                  <div class="planning-slot-time">
                    <strong><?= e($timeSlot) ?></strong>
                    <span><?= $slotReservations !== [] ? 'Occupe' : 'Libre' ?></span>
                  </div>
                  <div class="planning-slot-content">
                    <?php if ($slotReservations === []): ?>
                      <p class="small-note">Creneau disponible</p>
                    <?php else: ?>
                      <?php foreach ($slotReservations as $reservation): ?>
                        <article class="planning-booking">
                          <div class="reservation-card-head">
                            <strong><?= e((string) $reservation['type_soin']) ?></strong>
                            <span class="source-badge <?= e((string) $reservation['origine']) ?>">
                              <?= e((string) ucfirst((string) $reservation['origine'])) ?>
                            </span>
                          </div>
                          <p><?= e(trim((string) $reservation['prenom'] . ' ' . $reservation['nom'])) ?></p>
                          <p class="small-note"><?= e((string) $reservation['cabine']) ?></p>
                          <?php if ((string) $reservation['commentaire'] !== ''): ?>
                            <p class="small-note"><?= e((string) $reservation['commentaire']) ?></p>
                          <?php endif; ?>
                        </article>
                      <?php endforeach; ?>
                    <?php endif; ?>
                  </div>
                </section>
              <?php endforeach; ?>
            </div>
          </article>
        <?php endforeach; ?>
      </div>
    </div>

    <div class="split employee-data-grid">
      <article class="panel">
        <h3>Reservations automatiques</h3>
        <div class="reservation-stream">
          <?php if ($autoReservations === []): ?>
            <p class="small-note">Aucune reservation automatique cette semaine.</p>
          <?php else: ?>
            <?php foreach ($autoReservations as $reservation): ?>
              <article class="reservation-card">
                <div class="reservation-card-head">
                  <strong><?= e((string) $reservation['type_soin']) ?></strong>
                  <span class="source-badge auto">Auto</span>
                </div>
                <p><?= e(trim((string) $reservation['prenom'] . ' ' . $reservation['nom'])) ?> - <?= e((string) $reservation['cabine']) ?></p>
                <p class="small-note"><?= e((new DateTimeImmutable((string) $reservation['date_seance']))->format('d/m/Y')) ?> a <?= e(substr((string) $reservation['heure_seance'], 0, 5)) ?></p>
              </article>
            <?php endforeach; ?>
          <?php endif; ?>
        </div>
      </article>
      <article class="panel">
        <h3>Reservations manuelles</h3>
        <div class="reservation-stream">
          <?php if ($manualReservations === []): ?>
            <p class="small-note">Aucune reservation manuelle cette semaine.</p>
          <?php else: ?>
            <?php foreach ($manualReservations as $reservation): ?>
              <article class="reservation-card manual">
                <div class="reservation-card-head">
                  <strong><?= e((string) $reservation['type_soin']) ?></strong>
                  <span class="source-badge manual">Manuelle</span>
                </div>
                <p><?= e(trim((string) $reservation['prenom'] . ' ' . $reservation['nom'])) ?> - <?= e((string) $reservation['cabine']) ?></p>
                <p class="small-note"><?= e((new DateTimeImmutable((string) $reservation['date_seance']))->format('d/m/Y')) ?> a <?= e(substr((string) $reservation['heure_seance'], 0, 5)) ?></p>
                <?php if ((string) $reservation['commentaire'] !== ''): ?>
                  <p class="small-note">Commentaire : <?= e((string) $reservation['commentaire']) ?></p>
                <?php endif; ?>
              </article>
            <?php endforeach; ?>
          <?php endif; ?>
        </div>
      </article>
    </div>

    <article class="panel">
      <h3>Ajouter une reservation a la main</h3>
      <?php if ($manualError !== ''): ?>
        <div class="flash-message flash-error"><?= e($manualError) ?></div>
      <?php endif; ?>
      <form class="spa-form" method="post" action="<?= e(php_page_url('employes.php')) ?>?week=<?= e((string) $selectedWeek) ?>&year=<?= e((string) $selectedYear) ?>#planning-edt">
        <input type="hidden" name="form_action" value="manual_reservation">
        <input type="hidden" name="week" value="<?= e((string) $selectedWeek) ?>">
        <input type="hidden" name="year" value="<?= e((string) $selectedYear) ?>">
        <label>Email client
          <input type="email" name="email_client" required>
        </label>
        <label>Type de soin
          <select name="type_soin" required>
            <option value="">Choisir un soin</option>
            <?php foreach (available_treatments() as $treatment): ?>
              <option value="<?= e($treatment['label']) ?>"><?= e($treatment['label']) ?></option>
            <?php endforeach; ?>
          </select>
        </label>
        <label>Date
          <input type="date" name="date_seance" value="<?= e($weekStart) ?>" required>
        </label>
        <label>Heure
          <select name="heure_seance" required>
            <option value="">Choisir un creneau</option>
            <?php foreach (available_time_slots() as $timeSlot): ?>
              <option value="<?= e($timeSlot) ?>"><?= e($timeSlot) ?></option>
            <?php endforeach; ?>
          </select>
        </label>
        <label>Cabine
          <select name="cabine" required>
            <option value="">Choisir une cabine</option>
            <?php foreach (available_cabins() as $cabin): ?>
              <option value="<?= e($cabin) ?>"><?= e($cabin) ?></option>
            <?php endforeach; ?>
          </select>
        </label>
        <label>Commentaire
          <textarea name="commentaire" rows="3" placeholder="Precisions sur le rendez-vous"></textarea>
        </label>
        <button type="submit" class="cta">Ajouter</button>
      </form>
    </article>
  </section>

  <section class="section reveal" id="stock-semaine">
    <div class="section-intro">
      <p class="eyebrow eyebrow-soft">Stock semaine</p>
      <h2>Edition manuelle des produits pour la semaine selectionnee.</h2>
    </div>
    <article class="panel">
      <form class="spa-form" method="post" action="<?= e(php_page_url('employes.php')) ?>?week=<?= e((string) $selectedWeek) ?>&year=<?= e((string) $selectedYear) ?>#stock-semaine">
        <input type="hidden" name="form_action" value="update_stock">
        <input type="hidden" name="week" value="<?= e((string) $selectedWeek) ?>">
        <input type="hidden" name="year" value="<?= e((string) $selectedYear) ?>">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Stock initial</th>
                <th>Stock utilise</th>
                <th>Stock restant</th>
              </tr>
            </thead>
            <tbody>
              <?php if ($stockRows === []): ?>
                <tr>
                  <td colspan="4">Aucune ligne de stock disponible pour cette semaine.</td>
                </tr>
              <?php else: ?>
                <?php foreach ($stockRows as $row): ?>
                  <tr data-stock-row data-stock-initial="<?= e((string) $row['stock_initial']) ?>">
                    <td><?= e((string) $row['produit']) ?></td>
                    <td><?= e((string) $row['stock_initial']) ?></td>
                    <td>
                      <input
                        class="stock-input"
                        type="number"
                        min="0"
                        name="stock_utilise[<?= e((string) $row['id']) ?>]"
                        value="<?= e((string) $row['stock_utilise']) ?>"
                        data-stock-used
                        data-stock-initial="<?= e((string) $row['stock_initial']) ?>"
                      >
                    </td>
                    <td>
                      <input
                        class="stock-input"
                        type="number"
                        min="0"
                        name="stock_restant[<?= e((string) $row['id']) ?>]"
                        value="<?= e((string) $row['stock_restant']) ?>"
                        data-stock-remaining
                      >
                    </td>
                  </tr>
                <?php endforeach; ?>
              <?php endif; ?>
            </tbody>
          </table>
        </div>
        <button type="submit" class="cta">Mettre a jour le stock</button>
      </form>
    </article>
  </section>
</main>

<?php require __DIR__ . '/footer.php'; ?>
