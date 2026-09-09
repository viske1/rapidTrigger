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

React + Vite + TypeScript :

```sh
npm install
npm run dev      # serveur de dev sur http://localhost:5173
npm run build    # build de production dans dist/
npm run preview  # prévisualiser le build
```

## Limites de la démo

La page ne capte les combinaisons que pendant la saisie et n'exécute aucune action —
certaines combinaisons système (⌘ Espace, ⌘ Tab) sont interceptées par macOS avant le
navigateur et ne peuvent donc pas être capturées ici. L'exécution réelle des raccourcis
relève de l'application native.

## Ressources statiques

Déposez icônes et images dans `public/` — Vite les sert tels quels et les copie
à la racine de `dist/` au build. Le chemin d'accès omet le préfixe `public/` :

```tsx
<img src="/icons/finder.svg" alt="Finder" />
<img src="/img/wallpaper.jpg" alt="Fond d'écran" />
```

Réservez `public/` aux fichiers dont le nom doit rester exact (favicon, `robots.txt`)
ou dont le chemin est construit à l'exécution. Pour tout le reste, préférez un import
depuis `src/assets/` : Vite versionne le fichier, le met en cache durablement et
signale un chemin cassé dès la compilation.

## Structure

- `index.html` — point de montage
- `src/main.tsx` — entrée React
- `src/App.tsx` — composition et filtrage
- `src/components/` — Topbar, Sidebar, ShortcutList, ShortcutRow, Combo, HistoryPanel, ShortcutModal
- `src/lib/` — types, données par défaut, persistance, capture clavier, conflits, hook d'état
- `src/styles.css` — thème et mise en page
- `public/icons/`, `public/img/` — ressources statiques servies telles quelles
