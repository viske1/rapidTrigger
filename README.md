# Shortcut Center — démo web

Démo web du centre de contrôle des raccourcis clavier macOS : un endroit unique pour
voir, créer, modifier et auditer tous les raccourcis d'actions (fichiers, dossiers,
applications, URLs, scripts, système).

## Pourquoi

Sur macOS les raccourcis sont éparpillés entre les Réglages système, chaque application
et les outils d'automatisation. Impossible de savoir d'un coup d'œil ce qui est assigné,
ce qui a été changé, ni ce qui entre en conflit. Cette démo répond à ce besoin — sans
rien installer, pour que les utilisateurs testent le concept dans le navigateur.

## Fonctionnalités

- **Inventaire par portée** — Système, Finder, Applications, Web, Scripts.
- **Capture clavier réelle** — appuyez sur la combinaison, elle est lue telle quelle (⌘ ⌥ ⇧ ⌃).
- **Détection de conflits** — les combinaisons dupliquées sont signalées dans la liste et en bandeau.
- **Suivi des modifications** — chaque raccourci changé garde sa valeur d'origine, restaurable en un clic.
- **Journal** — historique horodaté de chaque création, modification, suppression ou import.
- **Recherche et filtres** — par texte, « modifiés seulement », « conflits seulement ».
- **Import / export JSON** — pour partager ou sauvegarder une configuration.
- Persistance dans `localStorage`, thème clair/sombre automatique.

## Lancer

Aucune dépendance, aucun build :

```sh
open index.html
# ou, pour un serveur local :
python3 -m http.server 8000
```

## Limites de la démo

La page ne capte les combinaisons que pendant la saisie et n'exécute aucune action —
certaines combinaisons système (⌘ Espace, ⌘ Tab) sont interceptées par macOS avant le
navigateur et ne peuvent donc pas être capturées ici. L'exécution réelle des raccourcis
relève de l'application native.

## Structure

- `index.html` — structure de la page
- `styles.css` — thème et mise en page
- `app.js` — état, rendu, capture clavier, conflits, import/export
