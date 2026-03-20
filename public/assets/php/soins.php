<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

$pageTitle = 'Experiences | Le Temple';
$pageDescription = 'Massages, rituels, soins visage et FAQ personnalisee pour choisir le bon soin.';
$canonicalPath = 'soins.php';
$activePage = 'soins';
$currentNeed = $currentUser ? (string) $currentUser['besoin_principal'] : null;

$treatmentSections = [
    [
        'id' => 'massages',
        'eyebrow' => 'Massages du monde',
        'title' => 'Des protocoles a choisir selon votre besoin du moment.',
        'items' => [
            ['id' => 'soin-californien', 'title' => 'Californien', 'duration' => '60 min', 'price' => '95 EUR', 'description' => 'Massage enveloppant pour faire redescendre la charge mentale.', 'details' => [['label' => 'Pour qui', 'value' => 'stress, fatigue mentale, premiere visite'], ['label' => 'Pression', 'value' => 'douce a moyenne']], 'query' => ['soin' => 'Californien', 'cabine' => 'Europe']],
            ['id' => 'soin-shiatsu', 'title' => 'Shiatsu', 'duration' => '60 min', 'price' => '100 EUR', 'description' => 'Pressions ciblees et travail de recentrage pour les corps tendus.', 'details' => [['label' => 'Pour qui', 'value' => 'tensions nerveuses, nuque chargee'], ['label' => 'Pression', 'value' => 'moyenne a soutenue']], 'query' => ['soin' => 'Shiatsu', 'cabine' => 'Japon']],
            ['id' => 'soin-suedois', 'title' => 'Suedois', 'duration' => '60 min', 'price' => '100 EUR', 'description' => 'Massage structure pour les corps fatigues ou sportifs.', 'details' => [['label' => 'Pour qui', 'value' => 'recuperation physique, tensions musculaires'], ['label' => 'Pression', 'value' => 'moyenne a soutenue']], 'query' => ['soin' => 'Suedois', 'cabine' => 'Europe']],
            ['id' => 'soin-thai', 'title' => 'Thai a l huile', 'duration' => '60 min', 'price' => '105 EUR', 'description' => 'Etirements doux et manoeuvres a l huile pour delier sans brusquer.', 'details' => [['label' => 'Pour qui', 'value' => 'raideurs, fatigue posturale'], ['label' => 'Pression', 'value' => 'moyenne']], 'query' => ['soin' => 'Thai a l\'huile', 'cabine' => 'Thailande']],
            ['id' => 'soin-mauresque', 'title' => 'Mauresque', 'duration' => '75 min', 'price' => '120 EUR', 'description' => 'Massage chaleureux et enveloppant pour les jours ou il faut surtout se poser.', 'details' => [['label' => 'Pour qui', 'value' => 'besoin de cocon, surcharge'], ['label' => 'Pression', 'value' => 'douce a moyenne']], 'query' => ['soin' => 'Mauresque', 'cabine' => 'Mauresque']],
            ['id' => 'soin-abhyanga', 'title' => 'Abhyanga', 'duration' => '75 min', 'price' => '125 EUR', 'description' => 'Huile chaude, lenteur et sensation d ancrage pour calmer le mental.', 'details' => [['label' => 'Pour qui', 'value' => 'fatigue nerveuse, besoin d ancrage'], ['label' => 'Pression', 'value' => 'douce a moyenne']], 'query' => ['soin' => 'Abhyanga', 'cabine' => 'Bali']],
        ],
    ],
    [
        'id' => 'accessoires',
        'eyebrow' => 'Massages avec accessoires',
        'title' => 'Quand la chaleur, la texture ou l outil prolongent la main du praticien.',
        'items' => [
            ['id' => 'soin-bougie', 'title' => 'Massage a la bougie', 'duration' => '60 min', 'price' => '110 EUR', 'description' => 'Un soin reconfortant tres cocooning, parfait pour retrouver chaleur et douceur.', 'details' => [['label' => 'Pour qui', 'value' => 'peau seche, besoin de reconfort'], ['label' => 'Pression', 'value' => 'douce']], 'query' => ['soin' => 'Massage a la bougie', 'cabine' => 'Europe']],
            ['id' => 'soin-bambous', 'title' => 'Massage aux bambous', 'duration' => '60 min', 'price' => '115 EUR', 'description' => 'Travail plus profond quand les tensions sont deja installees.', 'details' => [['label' => 'Pour qui', 'value' => 'sportifs, jambes lourdes, tensions profondes'], ['label' => 'Pression', 'value' => 'moyenne a soutenue']], 'query' => ['soin' => 'Massage aux bambous', 'cabine' => 'Bali']],
            ['id' => 'soin-pochons', 'title' => 'Massage aux pochons', 'duration' => '60 min', 'price' => '115 EUR', 'description' => 'Chaleur diffusee et manoeuvres enveloppantes pour un confort immediat.', 'details' => [['label' => 'Pour qui', 'value' => 'fatigue physique, besoin de chaleur'], ['label' => 'Pression', 'value' => 'douce a moyenne']], 'query' => ['soin' => 'Massage aux pochons', 'cabine' => 'Thailande']],
            ['id' => 'soin-balinais', 'title' => 'Balinais', 'duration' => '75 min', 'price' => '120 EUR', 'description' => 'Un massage complet pour relancer doucement sans perdre le cocon du soin.', 'details' => [['label' => 'Pour qui', 'value' => 'fatigue generale, besoin de relance'], ['label' => 'Pression', 'value' => 'moyenne']], 'query' => ['soin' => 'Balinais', 'cabine' => 'Bali']],
            ['id' => 'soin-lomi', 'title' => 'Lomi Lomi', 'duration' => '75 min', 'price' => '125 EUR', 'description' => 'Des mouvements amples et ondulants pour les profils qui aiment les soins tres fluides.', 'details' => [['label' => 'Pour qui', 'value' => 'besoin d evasion, tensions diffuses'], ['label' => 'Pression', 'value' => 'moyenne']], 'query' => ['soin' => 'Lomi Lomi', 'cabine' => 'Bali']],
        ],
    ],
    [
        'id' => 'rituels',
        'eyebrow' => 'Rituels signature',
        'title' => 'Des parcours plus longs pour les jours ou une heure ne suffit pas.',
        'items' => [
            ['id' => 'soin-rituel-oriental', 'title' => 'Rituel Oriental', 'duration' => '1 h 45', 'price' => '165 EUR', 'description' => 'Gommage, chaleur et massage dans une ambiance ambree et enveloppante.', 'details' => [['label' => 'Pour qui', 'value' => 'besoin de cocon et de chaleur'], ['label' => 'Intensite', 'value' => 'douce a moyenne']], 'query' => ['soin' => 'Rituel Oriental', 'cabine' => 'Mauresque', 'format' => 'Duo']],
            ['id' => 'soin-rituel-ayurvedique', 'title' => 'Rituel Ayurvedique', 'duration' => '1 h 30', 'price' => '145 EUR', 'description' => 'Un enchainement reequilibrant qui calme le systeme nerveux et redonne de l ancrage.', 'details' => [['label' => 'Pour qui', 'value' => 'fatigue nerveuse, besoin de recentrage'], ['label' => 'Intensite', 'value' => 'douce']], 'query' => ['soin' => 'Rituel Ayurvedique', 'cabine' => 'Bali']],
            ['id' => 'soin-rituel-balinais', 'title' => 'Rituel Balinais', 'duration' => '1 h 30', 'price' => '145 EUR', 'description' => 'Un voyage sensoriel pour combiner chaleur, tonicite douce et sensation d evasion.', 'details' => [['label' => 'Pour qui', 'value' => 'fatigue globale, envie d evasion'], ['label' => 'Intensite', 'value' => 'moyenne']], 'query' => ['soin' => 'Rituel Balinais', 'cabine' => 'Bali']],
            ['id' => 'soin-rituel-nordique', 'title' => 'Rituel Nordique', 'duration' => '2 h 15', 'price' => '190 EUR', 'description' => 'Une experience cocooning pensee pour les saisons fraiches.', 'details' => [['label' => 'Pour qui', 'value' => 'grande fatigue, besoin de recuperation'], ['label' => 'Intensite', 'value' => 'douce a moyenne']], 'query' => ['soin' => 'Rituel Nordique', 'cabine' => 'Europe']],
        ],
    ],
    [
        'id' => 'visage',
        'eyebrow' => 'Visage et spa privatif',
        'title' => 'Des protocoles experts pour travailler l eclat, le confort et la detente des traits.',
        'items' => [
            ['id' => 'soin-hydratant', 'title' => 'Soin visage hydratant', 'duration' => '60 min', 'price' => '95 EUR', 'description' => 'Soin reconfortant pour les peaux ternes, tirees ou fatiguees.', 'details' => [['label' => 'Pour qui', 'value' => 'peau deshydratee, traits fatigues'], ['label' => 'Pression', 'value' => 'douce']], 'query' => ['soin' => 'Soin visage hydratant', 'cabine' => 'Europe']],
            ['id' => 'soin-purifiant', 'title' => 'Soin visage purifiant', 'duration' => '60 min', 'price' => '95 EUR', 'description' => 'Soin clarifiant pour aider la peau a respirer et retrouver une sensation nette.', 'details' => [['label' => 'Pour qui', 'value' => 'peau mixte, congestions, teint brouille'], ['label' => 'Pression', 'value' => 'douce']], 'query' => ['soin' => 'Soin visage purifiant', 'cabine' => 'Europe']],
            ['id' => 'soin-kobido', 'title' => 'Soin visage anti-age (Kobido)', 'duration' => '75 min', 'price' => '120 EUR', 'description' => 'Soin tonique inspire du kobido pour lisser les traits et redonner de l eclat.', 'details' => [['label' => 'Pour qui', 'value' => 'manque d eclat, machoire tendue'], ['label' => 'Pression', 'value' => 'moyenne']], 'query' => ['soin' => 'Soin visage anti-age (Kobido)', 'cabine' => 'Japon']],
            ['id' => 'soin-spa', 'title' => 'Spa privatif', 'duration' => '1 h a 2 h', 'price' => '100 a 170 EUR', 'description' => 'Une bulle plus intime a vivre en solo ou a deux. Les formules duo sont pensees pour 2 personnes.', 'details' => [['label' => 'Formats', 'value' => 'solo, duo, acces 1 h a 2 h'], ['label' => 'Ideal pour', 'value' => 'anniversaire, couple, recuperation calme']], 'query' => ['soin' => 'Spa privatif', 'cabine' => 'Europe', 'format' => 'Duo']],
        ],
    ],
];

$recommendations = [];
$treatmentLookup = [];
foreach (available_treatments() as $treatment) {
    $treatmentLookup[$treatment['label']] = $treatment;
}

if ($currentUser && current_role() === 'client') {
    $recommendations = recommended_treatments_for_need($currentNeed);
}

$faqItems = faq_items_for_need($currentNeed);

require __DIR__ . '/header.php';
?>
<header class="hero small-hero">
  <?php render_site_nav($activePage); ?>
  <div class="hero-content reveal">
    <p class="eyebrow">Experiences immersives</p>
    <h1>Choisissez le soin qui correspond a votre energie du moment.</h1>
    <p class="lead">
      Massages du monde, rituels signature, soins visage et spa privatif:
      tout le catalogue est ici, avec en bas de page une FAQ personnalisee reservee aux clients connectes.
    </p>
    <div class="hero-actions">
      <a class="cta cta-book" href="<?= e(php_page_url('reservation.php')) ?>">Reserver maintenant</a>
      <a class="text-link text-link-light" href="#faq-conseils">Voir la FAQ personnalisee</a>
    </div>
  </div>
</header>

<main>
  <section class="section reveal">
    <h2>Navigation rapide</h2>
    <div class="anchor-nav">
      <?php foreach ($treatmentSections as $section): ?>
        <a href="#<?= e($section['id']) ?>"><?= e($section['eyebrow']) ?></a>
      <?php endforeach; ?>
      <a href="#faq-conseils">FAQ personnalisee</a>
    </div>
  </section>

  <?php foreach ($treatmentSections as $section): ?>
    <section class="section reveal" id="<?= e($section['id']) ?>">
      <div class="section-intro">
        <p class="eyebrow eyebrow-soft"><?= e($section['eyebrow']) ?></p>
        <h2><?= e($section['title']) ?></h2>
      </div>
      <div class="rituels">
        <?php foreach ($section['items'] as $item): ?>
          <article class="price-card" id="<?= e($item['id']) ?>">
            <h3><?= e($item['title']) ?></h3>
            <p class="small"><?= e($item['duration']) ?> - <?= e($item['price']) ?> par personne</p>
            <p><?= e($item['description']) ?></p>
            <ul class="detail-list">
              <?php foreach ($item['details'] as $detail): ?>
                <li><span><?= e($detail['label']) ?></span><strong><?= e($detail['value']) ?></strong></li>
              <?php endforeach; ?>
            </ul>
            <a class="cta small-cta" href="<?= e(php_page_url('reservation.php')) ?>?<?= e(http_build_query($item['query'])) ?>">Reserver ce soin</a>
          </article>
        <?php endforeach; ?>
      </div>
    </section>
  <?php endforeach; ?>

  <section class="section reveal" id="faq-conseils">
    <div class="section-intro">
      <p class="eyebrow eyebrow-soft">FAQ & conseils personnalises</p>
      <h2>Des reponses utiles, plus une recommandation adaptee a votre profil client.</h2>
    </div>

    <?php if (!$currentUser): ?>
      <div class="credentials-card faq-locked">
        <p>Connectez-vous ou creez un compte pour recevoir des conseils personnalises.</p>
        <div class="section-actions">
          <a class="cta" href="<?= e(php_page_url('connexion.php')) ?>">Me connecter</a>
          <a class="text-link" href="<?= e(php_page_url('connexion.php')) ?>#register-account">Creer un compte</a>
        </div>
      </div>
    <?php elseif (current_role() !== 'client'): ?>
      <div class="credentials-card faq-locked">
        <p>La personnalisation des soins est reservee aux comptes clients. Avec votre role actuel, vous voyez la FAQ standard.</p>
      </div>
    <?php else: ?>
      <div class="recommendation-hero">
        <p class="eyebrow eyebrow-soft">Conseils du jour</p>
        <h2>Bonjour <?= e((string) $currentUser['prenom']) ?>, voici les soins que nous vous recommandons aujourd hui.</h2>
        <p>Comme vous avez indique : <strong><?= e((string) $currentUser['besoin_principal']) ?></strong>, nous mettons en avant les options les plus coherentes.</p>
      </div>
      <div class="experience-grid">
        <?php foreach ($recommendations as $recommendation): ?>
          <?php $lookup = $treatmentLookup[$recommendation['label']] ?? null; ?>
          <article class="experience-card">
            <h3><?= e($recommendation['label']) ?></h3>
            <p><?= e($recommendation['reason']) ?></p>
            <div class="section-actions">
              <a class="text-link" href="<?= e($recommendation['anchor']) ?>">Voir ce soin</a>
              <a class="cta small-cta" href="<?= e(php_page_url('reservation.php')) ?>?<?= e(http_build_query(['soin' => $recommendation['label'], 'cabine' => $lookup['cabine'] ?? ''])) ?>">Reserver ce soin</a>
            </div>
          </article>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>

    <div class="accordion-stack">
      <?php foreach ($faqItems as $index => $item): ?>
        <details class="faq-accordion"<?= $index === 0 ? ' open' : '' ?>>
          <summary><?= e($item['question']) ?></summary>
          <div class="accordion-body">
            <p><?= e($item['answer']) ?></p>
            <ul class="mini-list">
              <?php foreach ($item['links'] as $link): ?>
                <li>
                  <span><?= e($link['label']) ?></span>
                  <strong><a class="text-link" href="<?= e($link['anchor']) ?>">Voir ce soin</a></strong>
                </li>
              <?php endforeach; ?>
            </ul>
          </div>
        </details>
      <?php endforeach; ?>
    </div>
  </section>
</main>

<?php require __DIR__ . '/footer.php'; ?>
