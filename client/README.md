# Amethyst Canvas Web

Version web de l'application Amethyst Canvas pour la génération d'images avec Stable Diffusion.

## Fonctionnalités

- Interface adaptée aux appareils mobiles
- Support du mode sombre
- Génération d'images avec paramètres personnalisables
- Sauvegarde sécurisée du token API
- Affichage des résultats en temps réel
- Gestion des erreurs avec messages explicites

## Installation

1. Clonez ce dépôt :
```bash
git clone https://github.com/votre-username/amethyst-canvas-web.git
cd amethyst-canvas-web
```

2. Ouvrez le fichier `index.html` dans votre navigateur ou déployez les fichiers sur un serveur web.

## Configuration

1. Créez un compte sur [Replicate](https://replicate.com) si ce n'est pas déjà fait
2. Générez un token API dans les paramètres de votre compte
3. Dans l'application, cliquez sur "Paramètres" et entrez votre token API
4. Cliquez sur "Enregistrer" pour sauvegarder le token

## Utilisation

1. Entrez une description détaillée de l'image que vous souhaitez générer
2. Ajustez les options si nécessaire :
   - Format : choisissez les proportions de l'image
   - Qualité : réglez la qualité de sortie (0.1 à 1)
   - Guidance Scale : contrôlez l'adhérence au prompt (1 à 20)
   - Force du prompt : ajustez l'influence du texte (0 à 1)
   - Étapes d'inférence : définissez la précision (1 à 50)
3. Cliquez sur "Générer" pour lancer la création
4. Les images générées apparaîtront dans la zone des résultats

## Structure des fichiers

```
AmethystWeb/
├── css/
│   └── styles.css
├── js/
│   ├── api.js
│   ├── config.js
│   └── ui.js
├── index.html
└── README.md
```

## Développement

Le projet utilise uniquement HTML, CSS et JavaScript vanilla pour une compatibilité maximale. Les fichiers sont organisés comme suit :

- `index.html` : Structure de l'application
- `css/styles.css` : Styles et thème visuel
- `js/config.js` : Configuration et constantes
- `js/api.js` : Gestion des appels à l'API Replicate
- `js/ui.js` : Logique de l'interface utilisateur

## Licence

MIT 