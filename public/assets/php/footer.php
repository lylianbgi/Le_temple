<?php
declare(strict_types=1);
?>
  <footer class="footer">
    <div class="footer-shell">
      <div>
        <p class="footer-brand">Le Temple</p>
        <p class="footer-copy">
          Spa holistique et sensoriel a Paris. Massages du monde, rituels signature, soins visage et spa privatif
          pour ralentir, recuperer et se recentrer.
        </p>
      </div>
      <div class="footer-meta">
        <p>12 Avenue du Voyage Sensoriel, 75000 Paris</p>
        <p>Lundi - Dimanche, 10h00 - 22h00</p>
        <p>Metro ligne 4, parking a 3 minutes, paiements CB, especes et cartes cadeaux.</p>
      </div>
      <div>
        <div class="footer-links">
          <a href="<?= e(php_page_url('soins.php')) ?>">Experiences</a>
          <a href="<?= e(php_page_url('reservation.php')) ?>">Reservation</a>
          <a href="<?= e(php_page_url('contact.php')) ?>">Contact</a>
          <a href="<?= e(public_url('cabines.html')) ?>">Cabines detaillees</a>
        </div>
        <div class="footer-legal">
          <a href="<?= e(public_url('conditions-utilisation.html')) ?>">Conditions d'utilisation</a>
          <a href="<?= e(public_url('protection-donnees.html')) ?>">Protection des donnees</a>
        </div>
      </div>
    </div>
    <a class="employee-link" href="<?= e(php_page_url('employes.php')) ?>">Acces employe</a>
  </footer>

  <script src="<?= e(assets_url('js/php-site.js')) ?>"></script>
</body>
</html>
