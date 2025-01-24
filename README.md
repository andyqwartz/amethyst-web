# Amethyst - Application de Génération d'Images IA

## 📝 Description
Amethyst est une application web moderne qui permet de générer des images à l'aide de l'intelligence artificielle en utilisant l'API Replicate. L'application permet aux utilisateurs de télécharger une image de référence, de spécifier des paramètres de génération et d'obtenir de nouvelles images générées par IA.

## 🏗️ Structure du Projet

```
amethyst/
├── client/                 # Frontend de l'application
│   ├── js/                # Scripts JavaScript
│   │   ├── api.js         # Gestion des appels API
│   │   ├── ui.js          # Interface utilisateur et interactions
│   │   └── config.js      # Configuration de l'application
│   ├── css/               # Styles CSS
│   ├── images/            # Images statiques
│   └── index.html         # Page principale
├── server/                # Backend de l'application
│   └── server.js          # Serveur Express.js
└── package.json          # Dépendances du projet
```

## 🚀 Fonctionnalités Principales

### Frontend (client/js/)

#### 1. Interface Utilisateur (ui.js)
- Gestion complète de l'interface utilisateur
- Prévisualisation des images
- Validation des entrées utilisateur
- Gestion des états de chargement
- Affichage des messages d'erreur
- Gestion du drag & drop pour l'upload d'images

#### 2. API Client (api.js)
- Communication avec le backend
- Gestion des tokens d'authentification
- Upload d'images
- Génération d'images via l'API Replicate
- Gestion des erreurs réseau

#### 3. Configuration (config.js)
- Paramètres de l'application
- URLs des endpoints
- Constantes de configuration
- Paramètres de validation

### Backend (server/server.js)

#### 1. Gestion des Fichiers
- Upload d'images via multer
- Stockage temporaire en mémoire
- Validation des types de fichiers
- Gestion des limites de taille

#### 2. Proxy API
- Redirection des requêtes vers Replicate
- Gestion des headers d'authentification
- Transformation des requêtes
- Gestion des erreurs

#### 3. Sécurité
- Validation des tokens
- Protection CORS
- Validation des entrées
- Gestion des sessions

## 🛠️ Technologies Utilisées

### Frontend
- HTML5
- CSS3 avec Flexbox/Grid
- JavaScript ES6+
- Fetch API pour les requêtes HTTP

### Backend
- Node.js
- Express.js
- Multer pour la gestion des fichiers
- http-proxy-middleware pour le proxy
- CORS pour la sécurité

### API Externe
- Replicate API pour la génération d'images

## 📦 Installation

1. Cloner le repository :
```bash
git clone [URL_DU_REPO]
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
- Créer un fichier `.env` à la racine
- Ajouter votre token Replicate :
```
REPLICATE_API_TOKEN=votre_token_ici
```

4. Démarrer le serveur :
```bash
cd server && npm start
```

## 🔧 Configuration

### Paramètres de Génération d'Images
- Format d'image : JPG, PNG, WEBP
- Taille maximale : 20MB
- Ratio d'aspect : 1:1, 16:9, 4:3
- Force du prompt : 0.1 à 1.0
- Nombre de sorties : 1 à 4

### Endpoints API

#### Upload d'Image
```javascript
POST /api/proxy/files
Content-Type: multipart/form-data
Authorization: Token <votre_token>
```

#### Génération d'Image
```javascript
POST /api/proxy/predictions
Content-Type: application/json
Authorization: Token <votre_token>
```

## 🔍 Analytics et Logging

### Logs Serveur
- Requêtes entrantes
- Statut des uploads
- Réponses de l'API Replicate
- Erreurs et exceptions
- Performance des requêtes

### Logs Client
- Actions utilisateur
- États de l'interface
- Erreurs de validation
- Performance du rendu
- Temps de chargement

## 🔒 Sécurité

### Authentification
- Validation des tokens
- Vérification des headers
- Protection contre les injections

### Validation des Fichiers
- Vérification des types MIME
- Limite de taille
- Scan antivirus (à implémenter)

## 🐛 Debugging

### Outils de Développement
- Console du navigateur
- Network panel
- Logs serveur
- Postman pour les tests API

### Messages d'Erreur Communs
- "Missing content" : Fichier manquant dans la requête
- "Token invalid" : Problème d'authentification
- "File too large" : Dépassement de la limite de taille

## 🔄 Workflow de Génération

1. Upload de l'image
2. Validation côté client
3. Envoi au serveur
4. Proxy vers Replicate
5. Traitement de la réponse
6. Affichage du résultat

## 📈 Améliorations Futures

- Support de formats additionnels
- Compression d'images
- Cache des résultats
- Interface mobile responsive
- Support multi-langues
- Mode hors ligne
- PWA

## 📚 Ressources

- [Documentation Replicate](https://replicate.com/docs)
- [API Reference](https://replicate.com/docs/reference/http)
- [Guides de Développement](https://replicate.com/docs/guides)
- [Exemples de Code](https://github.com/replicate/replicate-javascript)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche
3. Commiter les changements
4. Pusher sur la branche
5. Créer une Pull Request

## 📄 Licence

MIT License - voir LICENSE.md pour plus de détails

## 🖼️ Gestion des Images

### Processus d'Upload et de Traitement

#### 1. Côté Client (client/js/ui.js)
```javascript
// Gestion de l'upload d'image
handleImageUpload(event) {
    - Validation du type de fichier (image/*)
    - Création d'une prévisualisation avec FileReader
    - Affichage dans l'interface
}

// Prévisualisation avancée
showImagePreview(url) {
    - Zoom in/out avec boutons et molette
    - Déplacement de l'image (drag & drop)
    - Gestion du scale (0.5 à 5x)
}
```

#### 2. Communication API (client/js/api.js)
```javascript
// Upload de l'image
uploadImage(file) {
    - Validation du fichier (taille < 20MB)
    - Validation du format (JPG, PNG, WEBP)
    - Création du FormData
    - Envoi au serveur avec le token d'authentification
    - Gestion de la réponse et des erreurs
}
```

#### 3. Traitement Serveur (server/server.js)
```javascript
// Route d'upload
app.post('/api/proxy/files', upload.single('file'))
    - Stockage temporaire en mémoire avec multer
    - Validation du fichier reçu
    - Envoi à l'API Replicate
    - Traitement de la réponse
    - Renvoi de l'URL de l'image
```

### Flux de Données

1. **Sélection de l'Image**
   - L'utilisateur sélectionne une image
   - Validation immédiate du format et de la taille
   - Création d'une prévisualisation

2. **Upload vers le Serveur**
   - Création d'un FormData avec l'image
   - Envoi avec le token d'authentification
   - Gestion des erreurs de réseau

3. **Traitement Serveur**
   - Réception et validation du fichier
   - Stockage temporaire en mémoire
   - Transmission à l'API Replicate
   - Récupération de l'URL générée

4. **Réponse Client**
   - Réception de l'URL de l'image
   - Affichage dans l'interface
   - Possibilité de prévisualisation avancée

### Sécurité et Validation

1. **Validation Côté Client**
   - Types de fichiers acceptés : JPG, PNG, WEBP
   - Taille maximale : 20MB
   - Vérification avant upload

2. **Sécurité Serveur**
   - Validation des tokens
   - Vérification des types MIME
   - Stockage temporaire sécurisé
   - Nettoyage automatique

3. **Gestion des Erreurs**
   - Erreurs de format
   - Erreurs de taille
   - Erreurs réseau
   - Erreurs serveur
   - Erreurs API

### Fonctionnalités de Prévisualisation

1. **Interface Utilisateur**
   - Prévisualisation instantanée
   - Zoom in/out (0.5x à 5x)
   - Déplacement de l'image
   - Fermeture avec Echap

2. **Contrôles**
   - Boutons de zoom
   - Zoom à la molette
   - Drag & drop pour déplacer
   - Bouton de suppression 