-- Le Temple - schema MySQL
-- Importez ce fichier avant d utiliser les pages PHP.
-- Le champ commentaire dans reservations est ajoute pour supporter les
-- reservations manuelles cote employe.

CREATE DATABASE IF NOT EXISTS le_temple
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE le_temple;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role ENUM('client', 'employe', 'admin') NOT NULL DEFAULT 'client',
  prenom VARCHAR(100) NOT NULL,
  nom VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  besoin_principal VARCHAR(120) DEFAULT NULL,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  type_soin VARCHAR(190) NOT NULL,
  date_seance DATE NOT NULL,
  heure_seance TIME NOT NULL,
  cabine VARCHAR(120) NOT NULL,
  origine ENUM('auto', 'manuel') NOT NULL DEFAULT 'auto',
  commentaire TEXT NULL,
  KEY idx_reservations_date (date_seance),
  KEY idx_reservations_user (user_id),
  CONSTRAINT fk_reservations_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS stocks_semaine (
  id INT AUTO_INCREMENT PRIMARY KEY,
  semaine INT NOT NULL,
  annee INT NOT NULL,
  produit VARCHAR(190) NOT NULL,
  stock_initial INT NOT NULL DEFAULT 0,
  stock_utilise INT NOT NULL DEFAULT 0,
  stock_restant INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_stocks_week_product (semaine, annee, produit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
