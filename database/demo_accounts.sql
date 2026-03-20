USE le_temple;

-- Identifiants de test affiches sur connexion.php
-- Client : test.client@le-temple.fr / Test1234!
-- Employe : employe@le-temple.fr / Employe123!

INSERT INTO users (role, prenom, nom, email, mot_de_passe, besoin_principal)
VALUES
  ('client', 'Lylian', 'Client Test', 'test.client@le-temple.fr', '$2y$12$1ClxZB2eczt.n2SoOq6sxefm5Wm0OEnDFQ69GN9JiAdud8r5omRJe', 'mieux dormir'),
  ('employe', 'Camille', 'Equipe Temple', 'employe@le-temple.fr', '$2y$12$yN./77QmRUkYen5pzFm4yuc60Zeds34oNeoX85rPYisWiA5oeLND.', 'organisation interne')
ON DUPLICATE KEY UPDATE
  role = VALUES(role),
  prenom = VALUES(prenom),
  nom = VALUES(nom),
  mot_de_passe = VALUES(mot_de_passe),
  besoin_principal = VALUES(besoin_principal);
