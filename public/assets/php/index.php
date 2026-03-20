<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

$pageTitle = 'Le Temple | Spa sensoriel a Paris';
$pageDescription = 'Le Temple, spa holistique et sensoriel a Paris. Massages, rituels, soins visage et spa privatif.';
$canonicalPath = 'index.php';
$activePage = 'index';

$personalLead = $currentUser
    ? 'Bonjour ' . e((string) $currentUser['prenom']) . ', votre espace client est pret avec vos recommandations et vos reservations.'
    : 'Au Temple, chaque rendez-vous associe lumiere tamisee, senteurs enveloppantes et gestuelles expertes pour creer une vraie coupure avec le rythme quotidien.';

require __DIR__ . '/header.php';
?>
<header class="hero">
  <?php render_site_nav($activePage); ?>
  <div class="hero-content reveal">
    <p class="eyebrow">Spa holistique et sensoriel</p>
    <h1>Un voyage des sens, pense pour ralentir vraiment.</h1>
    <p class="lead"><?= $personalLead ?></p>
    <div class="hero-actions">
      <a class="cta cta-book" href="<?= e(php_page_url('reservation.php')) ?>">Reserver maintenant</a>
      <a class="cta cta-ghost" href="<?= e(php_page_url('soins.php')) ?>">Decouvrir les experiences</a>
    </div>
    <div class="social-proof social-proof-hero">
      <strong>Note moyenne 4,9/5</strong>
      <span>187 avis clients sur les massages, rituels et soins visage du Temple.</span>
    </div>
    <div class="hero-highlights">
      <span>Paris centre</span>
      <span>5 univers immersifs</span>
      <span>Solo, duo et spa privatif</span>
    </div>
  </div>
</header>

<main>
  <section class="section reveal" id="en-3-points">
    <div class="section-intro">
      <p class="eyebrow eyebrow-soft">En 3 points</p>
      <h2>Comprendre Le Temple en quelques secondes.</h2>
    </div>
    <div class="quick-facts-grid">
      <article class="fact-spotlight">
        <p class="fact-kicker">Promesse</p>
        <h3>Un soin choisi selon votre besoin du jour.</h3>
        <p>Vous arrivez avec une fatigue, un stress ou une tension precise. Nous vous orientons vers le bon rythme et la bonne cabine.</p>
      </article>
      <article class="fact-spotlight">
        <p class="fact-kicker">Lieu</p>
        <h3>Un spa sensoriel au coeur de Paris.</h3>
        <p>Cinq univers immersifs, une lumiere tamisee et une vraie sensation de coupure sans quitter la ville.</p>
      </article>
      <article class="fact-spotlight">
        <p class="fact-kicker">Pour qui</p>
        <h3>Ceux qui veulent recuperer vite et vraiment.</h3>
        <p>Semaines intenses, besoin de mieux dormir, cadeau a deux ou simple envie de souffler.</p>
      </article>
    </div>
  </section>

  <section class="section reveal">
    <div class="section-intro">
      <p class="eyebrow eyebrow-soft">Experiences signature</p>
      <h2>Quatre portes d entree simples pour choisir plus vite.</h2>
    </div>
    <div class="experience-grid">
      <article class="experience-card">
        <h3>Massages du monde</h3>
        <p>Californien, shiatsu, suedois, thai a l huile, mauresque ou abhyanga : chaque protocole joue sur un rythme et une intensite differents.</p>
        <ul class="mini-list">
          <li><span>Ideal apres</span><strong>une semaine intense</strong></li>
          <li><span>Pression</span><strong>de douce a soutenue</strong></li>
        </ul>
        <a class="cta small-cta" href="<?= e(php_page_url('soins.php')) ?>#massages">Voir details et reserver</a>
      </article>
      <article class="experience-card">
        <h3>Rituels signature</h3>
        <p>Des parcours plus longs, penses comme de vrais voyages : chaleur, gommage, massage et temps d apaisement s enchainent lentement.</p>
        <ul class="mini-list">
          <li><span>Duree</span><strong>de 1 h 30 a 2 h 15</strong></li>
          <li><span>Ideal pour</span><strong>deconnecter vraiment</strong></li>
        </ul>
        <a class="cta small-cta" href="<?= e(php_page_url('soins.php')) ?>#rituels">Voir details et reserver</a>
      </article>
      <article class="experience-card">
        <h3>Soins visage experts</h3>
        <p>Hydratant, purifiant ou kobido anti-age : des soins qui travaillent l eclat et le confort cutane sans perdre la dimension sensorielle.</p>
        <ul class="mini-list">
          <li><span>Benefices</span><strong>traits defatigues, teint plus frais</strong></li>
          <li><span>Ideal avant</span><strong>un evenement</strong></li>
        </ul>
        <a class="cta small-cta" href="<?= e(php_page_url('soins.php')) ?>#visage">Voir details et reserver</a>
      </article>
      <article class="experience-card">
        <h3>Spa privatif</h3>
        <p>Une bulle plus intime a vivre en solo ou a deux pour ralentir ensemble et celebrer une occasion dans le calme.</p>
        <ul class="mini-list">
          <li><span>Formats</span><strong>solo, duo, acces 1 h a 2 h</strong></li>
          <li><span>Top usage</span><strong>cadeau ou decompression</strong></li>
        </ul>
        <a class="cta small-cta" href="<?= e(php_page_url('soins.php')) ?>#soin-spa">Voir details et reserver</a>
      </article>
    </div>
  </section>

  <section class="section reveal">
    <div class="section-intro">
      <p class="eyebrow eyebrow-soft">Temoignages mis en avant</p>
      <h2>Des retours concrets, centres sur le benefice ressenti.</h2>
    </div>
    <div class="featured-testimonials">
      <article class="testimonial-feature">
        <img src="https://images.pexels.com/photos/3764529/pexels-photo-3764529.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Cliente apres un soin relaxant" loading="lazy" decoding="async">
        <div class="testimonial-feature-body">
          <p class="eyebrow eyebrow-soft">Massage californien</p>
          <h3>Marie, 36 ans</h3>
          <p>“Je suis arrivee avec les epaules completement bloquees. Le lendemain, j ai enfin dormi sans me reveiller toutes les deux heures.”</p>
          <p class="testimonial-feature-meta">Benefice observe : sommeil plus profond et nuque moins tendue.</p>
        </div>
      </article>
      <article class="testimonial-feature">
        <img src="https://images.pexels.com/photos/6621469/pexels-photo-6621469.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Duo au spa privatif" loading="lazy" decoding="async">
        <div class="testimonial-feature-body">
          <p class="eyebrow eyebrow-soft">Rituel oriental duo</p>
          <h3>Sarah & Paul</h3>
          <p>“Le vrai plus, c est la sensation de coupure. En 2 heures on a eu l impression de partir vraiment, sans quitter Paris.”</p>
          <p class="testimonial-feature-meta">Benefice observe : decompression rapide et moment a deux facile a offrir.</p>
        </div>
      </article>
    </div>
  </section>

  <?php if ($currentUser && current_role() === 'client'): ?>
    <section class="section reveal">
      <div class="recommendation-hero">
        <p class="eyebrow eyebrow-soft">Compte client actif</p>
        <h2>Votre besoin principal : <?= e((string) $currentUser['besoin_principal']) ?></h2>
        <p>Retrouvez vos conseils personnalises et votre FAQ adaptee directement sur la page soins.</p>
        <div class="section-actions">
          <a class="cta" href="<?= e(php_page_url('soins.php')) ?>#faq-conseils">Voir mes recommandations</a>
          <a class="text-link" href="<?= e(php_page_url('reservation.php')) ?>">Reserver un soin</a>
        </div>
      </div>
    </section>
  <?php endif; ?>
</main>

<?php require __DIR__ . '/footer.php'; ?>
