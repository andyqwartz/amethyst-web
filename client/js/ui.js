import { CONFIG, HISTORY_STORAGE_KEY, MAX_HISTORY_ITEMS } from './config.js';
import ReplicateAPI from './api.js';

class UI {
    constructor() {
        this.replicateAPI = new ReplicateAPI();
        this.initializeElements();
        this.initializeHistoryElements();
        this.loadToken();
        this.loadLastParameters();
        this.initializeEventListeners();
        this.initializeLoRAs();
        console.log("Interface utilisateur initialisée");
        
        // Vérifier s'il y a une génération en cours au chargement
        this.checkPendingGeneration();
    }
    
    initializeElements() {
        // Éléments DOM
        this.prompt = document.getElementById('prompt');
        this.generateBtn = document.getElementById('generateBtn');
        this.optionsBtn = document.getElementById('optionsBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.helpBtn = document.getElementById('helpBtn');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.loadingContainer = document.getElementById('loadingContainer');
        this.loadingText = document.getElementById('loadingText');
        this.loadingProgress = document.getElementById('loadingProgress');
        this.charCount = document.getElementById('charCount');
        
        // Modals
        this.optionsModal = document.getElementById('optionsModal');
        this.settingsModal = document.getElementById('settingsModal');
        this.helpModal = document.getElementById('helpModal');
        
        // Image upload
        this.imageInput = document.getElementById('imageInput');
        this.imagePreview = document.getElementById('imagePreview');
        this.previewImg = document.getElementById('previewImg');
        
        // Créer le bouton de suppression
        this.removeImageBtn = document.createElement('button');
        this.removeImageBtn.className = 'remove-image-btn';
        this.removeImageBtn.setAttribute('aria-label', 'Supprimer l\'image');
        this.removeImageBtn.innerHTML = '<span class="material-icons-round">close</span>';
        this.removeImageBtn.title = 'Supprimer l\'image de référence';
        this.imagePreview.appendChild(this.removeImageBtn);
        
        // Ajouter l'écouteur d'événement pour le bouton de suppression
        this.removeImageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.removeImage();
        });
        
        // Options
        this.outputFormat = document.getElementById('outputFormat');
        this.aspectRatio = document.getElementById('aspectRatio');
        this.quality = document.getElementById('outputQuality');
        this.guidanceScale = document.getElementById('guidanceScale');
        this.promptStrength = document.getElementById('promptStrength');
        this.numInferenceSteps = document.getElementById('numInferenceSteps');
        this.numOutputs = document.getElementById('numOutputs');
        this.loraScale = document.getElementById('loraScale');
        
        // Settings
        this.tokenInput = document.getElementById('apiToken');
        this.saveTokenBtn = document.getElementById('saveTokenBtn');
        this.deleteTokenBtn = document.getElementById('deleteTokenBtn');
        this.safetyChecker = document.getElementById('disableSafetyChecker');
        
        // Éléments DOM
        this.rangeInputs = document.querySelectorAll('.range-input');
        
        // LoRA elements
        this.loraList = document.getElementById('loraList');
        this.addLoraBtn = document.getElementById('addLoraBtn');
        
        // Liste des LoRAs disponibles
        this.availableLoRAs = [
            { id: 'AndyVampiro/joa', name: 'AndyVampiro/joa' },
            { id: 'AndyVampiro/ilenana', name: 'AndyVampiro/ilenana' },
            { id: 'AndyVampiro/fog', name: 'AndyVampiro/fog' },
            { id: 'AndyVampiro/andy', name: 'AndyVampiro/andy' }
        ];

        // Vérification des éléments critiques
        const criticalElements = {
            'prompt': this.prompt,
            'outputFormat': this.outputFormat,
            'aspectRatio': this.aspectRatio,
            'outputQuality': this.quality,
            'guidanceScale': this.guidanceScale,
            'promptStrength': this.promptStrength,
            'numInferenceSteps': this.numInferenceSteps,
            'numOutputs': this.numOutputs
        };

        for (const [name, element] of Object.entries(criticalElements)) {
            if (!element) {
                console.error(`Élément critique manquant: ${name}`);
            }
        }
    }
    
    initializeHistoryElements() {
        // Éléments d'historique
        this.historyBtn = document.getElementById('historyBtn');
        this.historyModal = document.getElementById('historyModal');
        this.historyContainer = document.getElementById('history-container');
        this.clearHistoryBtn = document.getElementById('clear-history-btn');
        
        console.log('Éléments d\'historique initialisés:', {
            historyBtn: this.historyBtn,
            historyModal: this.historyModal,
            historyContainer: this.historyContainer,
            clearHistoryBtn: this.clearHistoryBtn
        });
        
        // Chargement initial de l'historique
        this.imageHistory = this.loadImageHistory();
        this.displayImageHistory();
    }
    
    initializeEventListeners() {
        // Gestion du prompt
        this.prompt.addEventListener('input', () => this.updateUI());
        
        // Gestion des boutons
        this.generateBtn.addEventListener('click', () => this.generate());
        this.optionsBtn.addEventListener('click', () => this.showModal(this.optionsModal));
        this.settingsBtn.addEventListener('click', () => this.showModal(this.settingsModal));
        this.helpBtn.addEventListener('click', () => this.showModal(this.helpModal));
        
        // Gestion de l'upload d'image
        if (this.imageInput) {
            this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }
        
        // Gestion des modals
        document.querySelectorAll('.close-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.hideModal(modal);
                }
            });
        });
        
        // Token management
        if (this.tokenInput) {
            this.tokenInput.addEventListener('change', () => {
                const token = this.tokenInput.value.trim();
                this.replicateAPI.setToken(token);
                this.showSuccess('Token API sauvegardé');
            });
        }

        if (this.saveTokenBtn) {
            this.saveTokenBtn.addEventListener('click', () => {
                const token = this.tokenInput.value.trim();
                this.replicateAPI.setToken(token);
                this.showSuccess('Token API sauvegardé');
                this.hideModal(this.settingsModal);
            });
        }

        if (this.deleteTokenBtn) {
            this.deleteTokenBtn.addEventListener('click', () => {
                this.replicateAPI.deleteToken();
                this.tokenInput.value = this.replicateAPI.getToken();
                this.showSuccess('Token API réinitialisé au token par défaut');
            });
        }
        
        // Initialisation des sliders
        this.initializeSliders();
        
        // Initialisation des LoRAs
        this.initializeLoRAs();
        
        // Initialisation du safety checker
        if (this.safetyChecker) {
            this.safetyChecker.checked = true;
        }
        
        // Mise à jour initiale de l'interface
        this.updateUI();
        
        // Gestion de l'historique
        if (this.historyBtn) {
            this.historyBtn.addEventListener('click', () => {
                console.log('Bouton historique cliqué');
                this.showModal(this.historyModal);
            });
        } else {
            console.error('Bouton historique non trouvé');
        }

        if (this.clearHistoryBtn) {
            this.clearHistoryBtn.addEventListener('click', () => {
                console.log('Bouton effacer historique cliqué');
                this.clearImageHistory();
            });
        } else {
            console.error('Bouton effacer historique non trouvé');
        }

        // Gestion de la fermeture des modals
        document.querySelectorAll('.modal .close-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.hideModal(modal);
                }
            });
        });

        // Fermeture des modals en cliquant en dehors
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal);
                }
            });
        });
    }
    
    initializeSliders() {
        document.querySelectorAll('.range-input').forEach(input => {
            const container = document.createElement('div');
            container.className = 'range-container';
            input.parentNode.insertBefore(container, input);
            container.appendChild(input);
            
            const value = document.createElement('span');
            value.className = 'range-value';
            value.textContent = input.value;
            container.appendChild(value);
            
            input.addEventListener('input', () => {
                value.textContent = input.value;
                const rect = input.getBoundingClientRect();
                const thumbPosition = (input.value - input.min) / (input.max - input.min);
                const valuePosition = thumbPosition * rect.width;
                value.style.left = `${valuePosition}px`;
            });
            
            input.dispatchEvent(new Event('input'));
        });
    }
    
    initializeLoRAs() {
        // Ajouter un écouteur pour le bouton d'ajout de LoRA
        this.addLoraBtn.innerHTML = `
            <span class="material-icons-round">add</span>
            Ajouter un nouveau LoRA
        `;
        this.addLoraBtn.addEventListener('click', () => {
            const loraElement = this.createLoRAElement();
            this.loraList.appendChild(loraElement);
            
            // Focus sur le select du nouveau LoRA
            const select = loraElement.querySelector('.lora-select');
            select.focus();
            
            // Afficher un message d'aide
            this.showSuccess('Sélectionnez un LoRA existant ou choisissez "Ajouter un LoRA personnalisé..." pour entrer un ID personnalisé');
        });
        
        // Ajouter le LoRA par défaut
        const defaultLoraElement = this.createLoRAElement();
        const loraSelect = defaultLoraElement.querySelector('.lora-select');
        const loraScale = defaultLoraElement.querySelector('.lora-scale');
        
        // Ajouter l'option AndyVampiro/joa s'il n'existe pas déjà
        if (!this.availableLoRAs.find(lora => lora.id === 'AndyVampiro/joa')) {
            this.availableLoRAs.unshift({ id: 'AndyVampiro/joa', name: 'AndyVampiro/joa' });
        }
        
        // Mettre à jour les options du select
        loraSelect.innerHTML = `
            <option value="">Sélectionner un LoRA</option>
            ${this.availableLoRAs.map(lora => 
                `<option value="${lora.id}">${lora.name}</option>`
            ).join('')}
            <option value="custom">Ajouter un LoRA personnalisé...</option>
        `;
        
        // Sélectionner AndyVampiro/joa par défaut
        loraSelect.value = 'AndyVampiro/joa';
        loraScale.value = '0.9';
        loraScale.dispatchEvent(new Event('input'));
        
        this.loraList.appendChild(defaultLoraElement);
    }
    
    createLoRAElement() {
        const loraItem = document.createElement('div');
        loraItem.className = 'lora-item';
        
        const selectContainer = document.createElement('div');
        selectContainer.className = 'lora-select-container';
        
        const select = document.createElement('select');
        select.className = 'select-input lora-select';
        
        // Ajouter les options de LoRA
        select.innerHTML = `
            <option value="">Sélectionner un LoRA</option>
            ${this.availableLoRAs.map(lora => 
                `<option value="${lora.id}">${lora.name}</option>`
            ).join('')}
            <option value="custom">Ajouter un LoRA personnalisé...</option>
        `;
        
        const customInput = document.createElement('input');
        customInput.type = 'text';
        customInput.className = 'select-input lora-custom-input';
        customInput.placeholder = 'Entrez l\'ID du LoRA (ex: organisation/nom-du-lora)';
        customInput.style.display = 'none';
        
        // Gestion du changement de sélection
        select.addEventListener('change', () => {
            if (select.value === 'custom') {
                customInput.style.display = 'block';
                select.style.display = 'none';
                customInput.focus();
            }
        });
        
        // Gestion de l'input personnalisé
        customInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                const value = customInput.value.trim();
                if (value) {
                    // Ajouter le nouveau LoRA à la liste si pas déjà présent
                    if (!this.availableLoRAs.find(lora => lora.id === value)) {
                        this.availableLoRAs.push({ id: value, name: value });
                        select.innerHTML = `
                            <option value="">Sélectionner un LoRA</option>
                            ${this.availableLoRAs.map(lora => 
                                `<option value="${lora.id}">${lora.name}</option>`
                            ).join('')}
                            <option value="custom">Ajouter un LoRA personnalisé...</option>
                        `;
                    }
                    select.value = value;
                    customInput.style.display = 'none';
                    select.style.display = 'block';
                }
            } else if (e.key === 'Escape') {
                customInput.style.display = 'none';
                select.style.display = 'block';
                select.value = '';
            }
        });
        
        customInput.addEventListener('blur', () => {
            const value = customInput.value.trim();
            if (!value) {
                customInput.style.display = 'none';
                select.style.display = 'block';
                select.value = '';
            }
        });
            
            const scaleContainer = document.createElement('div');
            scaleContainer.className = 'lora-scale-container';
            
        const range = document.createElement('input');
        range.type = 'range';
        range.className = 'range-input lora-scale';
        range.min = '0';
        range.max = '1';
        range.step = '0.1';
        range.value = '0.5';
            
            const scaleValue = document.createElement('span');
            scaleValue.className = 'lora-scale-value';
        scaleValue.textContent = '0.5';
            
            const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-lora-btn';
            removeBtn.innerHTML = '<span class="material-icons-round">close</span>';
            removeBtn.title = 'Supprimer ce LoRA';
            
        // Event listeners
        range.addEventListener('input', (e) => {
            scaleValue.textContent = e.target.value;
        });
        
        removeBtn.addEventListener('click', () => {
            loraItem.remove();
        });
        
        // Assembler les éléments
        selectContainer.appendChild(select);
        selectContainer.appendChild(customInput);
        
        scaleContainer.appendChild(range);
        scaleContainer.appendChild(scaleValue);
        
        loraItem.appendChild(selectContainer);
        loraItem.appendChild(scaleContainer);
        loraItem.appendChild(removeBtn);
        
        return loraItem;
    }
    
    getLoRAs() {
        const loras = [];
        const loraItems = this.loraList.querySelectorAll('.lora-item');
        
        loraItems.forEach(item => {
            const select = item.querySelector('.lora-select');
            const customInput = item.querySelector('.lora-custom-input');
            const scale = item.querySelector('.lora-scale');
            
            let loraValue = select.style.display !== 'none' ? select.value : customInput.value.trim();
            
            if (loraValue && loraValue !== 'custom' && loraValue !== '') {
                console.log("Ajout du LoRA:", {
                    value: loraValue,
                    scale: parseFloat(scale.value)
                });
                loras.push({
                    model: loraValue,
                    scale: parseFloat(scale.value)
                });
            }
        });
        
        // S'assurer qu'il y a au moins le LoRA par défaut
        if (loras.length === 0) {
            console.log("Aucun LoRA sélectionné, ajout du LoRA par défaut");
            loras.push({
                model: 'AndyVampiro/joa',
                scale: 0.9
            });
        }
        
        console.log("LoRAs finaux:", JSON.stringify(loras, null, 2));
        return loras;
    }
    
    updateUI() {
        const promptLength = this.prompt.value.length;
        this.charCount.textContent = `${promptLength}/500`;
        this.generateBtn.disabled = promptLength === 0;
        
        if (promptLength >= 450) {
            this.charCount.style.color = 'var(--error)';
        } else {
            this.charCount.style.color = 'var(--text-secondary)';
        }
    }
    
    async generate() {
        try {
            this.triggerHaptic('medium');
            this.setLoading(true);
            console.log("Début de la génération");

            const parameters = this.getParameters();
            console.log("Paramètres collectés:", parameters);

            this.saveLastParameters();

            // Créer la prédiction
            const prediction = await this.replicateAPI.createPrediction(parameters);
            console.log("Prédiction créée:", prediction);
            
            if (!prediction || !prediction.id) {
                throw new Error("Pas d'ID de prédiction reçu");
            }

            // Sauvegarder l'ID de la prédiction et l'heure de début
            localStorage.setItem('pendingGeneration', JSON.stringify({
                predictionId: prediction.id,
                startTime: Date.now()
            }));
            console.log("ID de génération sauvegardé:", prediction.id);

            // Attendre le résultat
            this.loadingText.textContent = "Génération en cours...";
            await this.waitForPrediction(prediction.id);
            
            // Nettoyer une fois terminé
            localStorage.removeItem('pendingGeneration');
            this.setLoading(false);
            
        } catch (error) {
            console.error("Erreur lors de la génération:", error);
            this.setLoading(false);
            this.showError("Une erreur est survenue lors de la génération");
            localStorage.removeItem('pendingGeneration');
        }
    }
    
    displayResults(urls) {
        const container = document.createElement('div');
        container.className = 'results-grid';
        
        urls.forEach(url => {
            const card = document.createElement('div');
            card.className = 'image-card';
            
            const img = document.createElement('img');
            img.src = url;
            img.alt = 'Image générée';
            img.loading = 'lazy';
            
            // Ajouter l'événement de clic pour la prévisualisation
            img.addEventListener('click', () => this.showImagePreview(url));
            
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'download-button';
            downloadBtn.innerHTML = '<span class="material-icons-round">download</span>';
            downloadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.downloadImage(url);
            });
            
            card.appendChild(img);
            card.appendChild(downloadBtn);
            container.appendChild(card);
        });
        
        this.resultsContainer.insertBefore(container, this.resultsContainer.firstChild);
    }
    
    showImagePreview(url) {
        const previewModal = document.createElement('div');
        previewModal.className = 'preview-modal show';
        
        previewModal.innerHTML = `
            <div class="preview-content">
                <div class="preview-image-container">
                    <img src="${url}" alt="Prévisualisation" class="preview-image">
                </div>
                <button class="close-preview">
                    <span class="material-icons-round">close</span>
                </button>
                <div class="preview-controls">
                    <button class="zoom-button" data-action="zoom-out">
                        <span class="material-icons-round">remove</span>
                    </button>
                    <button class="zoom-button" data-action="zoom-in">
                        <span class="material-icons-round">add</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(previewModal);

        const image = previewModal.querySelector('.preview-image');
        const container = previewModal.querySelector('.preview-image-container');
        let scale = 1;
        let isPanning = false;
        let startX = 0;
        let startY = 0;
        let translateX = 0;
        let translateY = 0;

        // Gestion du zoom
        previewModal.querySelectorAll('.zoom-button').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                if (action === 'zoom-in') {
                    scale = Math.min(scale * 1.2, 5);
                } else {
                    scale = Math.max(scale / 1.2, 1);
                }
                if (scale === 1) {
                    translateX = 0;
                    translateY = 0;
                }
                updateTransform();
            });
        });

        // Gestion du pan tactile
        container.addEventListener('touchstart', (e) => {
            isPanning = true;
            startX = e.touches[0].clientX - translateX;
            startY = e.touches[0].clientY - translateY;
        });

        container.addEventListener('touchmove', (e) => {
            if (!isPanning) return;
            e.preventDefault();
            translateX = e.touches[0].clientX - startX;
            translateY = e.touches[0].clientY - startY;
            updateTransform();
        });

        container.addEventListener('touchend', () => {
            isPanning = false;
        });

        // Gestion du pan souris
        container.addEventListener('mousedown', (e) => {
            isPanning = true;
                startX = e.clientX - translateX;
                startY = e.clientY - translateY;
        });

        container.addEventListener('mousemove', (e) => {
            if (!isPanning) return;
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateTransform();
        });

        container.addEventListener('mouseup', () => {
            isPanning = false;
        });

        // Gestion du zoom par pincement
        let initialDistance = 0;
        container.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
            }
        });

        container.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                const distance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                scale = Math.min(Math.max(scale * (distance / initialDistance), 1), 5);
                initialDistance = distance;
                    updateTransform();
                }
        });

        function updateTransform() {
            image.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        }

        // Fermeture
        const closeButton = previewModal.querySelector('.close-preview');
        closeButton.addEventListener('click', () => {
            previewModal.remove();
        });

        previewModal.addEventListener('click', (e) => {
            if (e.target === previewModal) {
                previewModal.remove();
            }
        });
    }
    
    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            this.showError('Veuillez sélectionner une image valide.');
            return;
        }
        
        try {
            const loadImage = (file) => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
        const reader = new FileReader();
                    
        reader.onload = (e) => {
                        img.onload = () => resolve(img);
                        img.onerror = () => reject(new Error('Erreur de chargement de l\'image'));
                        img.src = e.target.result;
        };
                    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
        reader.readAsDataURL(file);
                });
            };

            const img = await loadImage(file);
            this.previewImg.src = img.src;
            this.imagePreview.style.display = 'flex';
            
            // Animation de chargement
            this.imagePreview.classList.add('loading');
            setTimeout(() => this.imagePreview.classList.remove('loading'), 300);
            
            // Retour haptique
            this.triggerHaptic('light');
            
        } catch (error) {
            console.error('Erreur lors du chargement de l\'image:', error);
            this.showError('Erreur lors du chargement de l\'image');
        }
    }
    
    removeImage() {
        // Animation de disparition
        this.imagePreview.style.opacity = '0';
        this.imagePreview.style.transform = 'scale(0.9)';
        
        // Retour haptique
        this.triggerHaptic('medium');
        
        setTimeout(() => {
            this.imageInput.value = '';
            this.imagePreview.style.display = 'none';
            this.previewImg.src = '';
            
            // Réinitialiser les styles
            this.imagePreview.style.opacity = '';
            this.imagePreview.style.transform = '';
        }, 200);
    }
    
    showModal(modal) {
        if (!modal) return;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    hideModal(modal) {
        if (!modal) return;
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    setLoading(isLoading) {
        if (isLoading) {
            this.loadingContainer.classList.add('show');
        this.generateBtn.disabled = true;
            this.loadingText.textContent = 'Préparation de la génération...';
            this.loadingProgress.innerHTML = `
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="progress-text">0%</div>
                </div>
            `;
            
            this.generateBtn.classList.add('loading');
        } else {
            this.loadingContainer.classList.remove('show');
        this.generateBtn.disabled = false;
            this.loadingText.textContent = '';
            this.loadingProgress.textContent = '';
            
            this.generateBtn.classList.remove('loading');
        }
    }
    
    updateLoadingProgress(text, percentage = null) {
        // Log dans la console uniquement
        console.log(`[${new Date().toLocaleTimeString()}] ${text}`);

        // Mettre à jour le texte principal
        this.loadingText.textContent = text;

        // Mettre à jour la barre de progression uniquement si un pourcentage est fourni
        if (percentage !== null) {
            const progressFill = this.loadingProgress.querySelector('.progress-fill');
            const progressText = this.loadingProgress.querySelector('.progress-text');
            
            if (progressFill && progressText) {
                progressFill.style.width = `${percentage}%`;
                progressText.textContent = `${percentage}%`;
            }
        }
    }
    
    showError(message) {
        this.triggerHaptic('error');
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }, 100);
    }
    
    showSuccess(message) {
        this.triggerHaptic('success');
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }, 100);
    }
    
    async downloadImage(url) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `image_${new Date().getTime()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error);
            this.showError('Erreur lors du téléchargement de l\'image');
        }
    }
    
    getParameters() {
        // Vérification de l'existence des éléments avant d'accéder à leurs valeurs
        if (!this.prompt || !this.aspectRatio || !this.promptStrength || 
            !this.numOutputs || !this.numInferenceSteps || !this.guidanceScale || 
            !this.outputFormat || !this.quality) {
            throw new Error('Certains éléments de l\'interface sont manquants');
        }

        const parameters = {
            prompt: this.prompt.value.trim(),
            aspect_ratio: this.aspectRatio.value,
            prompt_strength: parseFloat(this.promptStrength.value) || 0.8,
            num_outputs: parseInt(this.numOutputs.value) || 1,
            num_inference_steps: parseInt(this.numInferenceSteps.value) || 28,
            guidance_scale: parseFloat(this.guidanceScale.value) || 3.5,
            output_format: this.outputFormat.value.toLowerCase(),
            output_quality: parseInt(this.quality.value) || 80,
            disable_safety_checker: this.safetyChecker ? this.safetyChecker.checked : false
        };

        // Ajouter l'image seulement si elle existe
        if (this.imageInput && this.imageInput.files[0]) {
            parameters.image = this.imageInput.files[0];
        }

        // Gestion des LoRAs
        const loras = this.getLoRAs();
        console.log("LoRAs récupérés:", JSON.stringify(loras, null, 2));

        parameters.hf_loras = loras.map(lora => lora.model);
        parameters.lora_scales = loras.map(lora => lora.scale);

        console.log("Paramètres finaux:", JSON.stringify(parameters, null, 2));
        return parameters;
    }
    
    getActiveLoRAs() {
        return this.getLoRAs().map(lora => lora.model);
    }
    
    getLoRAScales() {
        return this.getLoRAs().map(lora => lora.scale);
    }
    
    loadToken() {
        const token = this.replicateAPI.getToken();
        if (this.tokenInput) {
            this.tokenInput.value = token;
            console.log("Token chargé:", token);
        } else {
            console.error("Element tokenInput non trouvé");
        }
    }
    
    displayError(message) {
        this.showError(message);
    }

    // Charger l'historique depuis le localStorage
    loadImageHistory() {
        try {
            const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
            return savedHistory ? JSON.parse(savedHistory) : [];
        } catch (error) {
            console.error('Erreur lors du chargement de l\'historique:', error);
            return [];
        }
    }

    // Sauvegarder l'historique dans le localStorage
    saveImageHistory() {
        try {
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(this.imageHistory));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de l\'historique:', error);
        }
    }

    // Ajouter une image à l'historique
    addToHistory(imageUrl, prompt) {
        this.imageHistory.unshift({
            url: imageUrl,
            prompt: prompt,
            timestamp: new Date().toISOString()
        });

        // Limiter le nombre d'entrées dans l'historique
        if (this.imageHistory.length > MAX_HISTORY_ITEMS) {
            this.imageHistory = this.imageHistory.slice(0, MAX_HISTORY_ITEMS);
        }

        this.saveImageHistory();
        this.displayImageHistory();
    }

    // Afficher l'historique des images
    displayImageHistory() {
        if (!this.historyContainer) return;

        this.historyContainer.innerHTML = '';
        
        if (this.imageHistory.length === 0) {
            this.historyContainer.innerHTML = `
                <div class="empty-history">
                    <span class="material-icons-round">history</span>
                    <p>Aucune image générée</p>
                    <p class="empty-history-subtitle">Les images que vous générerez apparaîtront ici</p>
                </div>
            `;
            return;
        }

        this.imageHistory.forEach(item => {
            const element = document.createElement('div');
            element.className = 'history-item';
            element.innerHTML = `
                <img src="${item.url}" alt="${item.prompt}" class="history-image">
                <div class="history-info">
                    <p class="history-prompt">${item.prompt}</p>
                    <p class="history-date">${new Date(item.timestamp).toLocaleString()}</p>
                </div>
                <div class="history-actions">
                    <button class="use-reference-btn" title="Utiliser comme image de référence">
                        <span class="material-icons-round">brush</span>
                    </button>
                    <button class="download-btn" title="Télécharger l'image">
                        <span class="material-icons-round">download</span>
                    </button>
                </div>
            `;

            // Ajouter l'écouteur pour le téléchargement
            const downloadBtn = element.querySelector('.download-btn');
            downloadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.downloadImage(item.url);
            });

            // Ajouter l'écouteur pour utiliser comme référence
            const useReferenceBtn = element.querySelector('.use-reference-btn');
            useReferenceBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.useAsReference(item.url);
            });

            // Ajouter l'écouteur pour la prévisualisation
            element.querySelector('.history-image').addEventListener('click', () => {
                this.showImagePreview(item.url);
            });

            this.historyContainer.appendChild(element);
        });
    }

    // Vider l'historique
    clearImageHistory() {
        if (confirm('Êtes-vous sûr de vouloir effacer tout l\'historique ? Cette action est irréversible.')) {
            this.triggerHaptic('heavy');
            this.imageHistory = [];
            this.saveImageHistory();
            this.displayImageHistory();
            this.showSuccess('Historique effacé avec succès');
        } else {
            this.triggerHaptic('light');
        }
    }

    // Modifier handleGenerationSuccess pour inclure l'ajout à l'historique
    handleGenerationSuccess(result) {
            this.hideLoading();
        this.triggerHaptic('success');
        
        if (result && Array.isArray(result)) {
            // Ajouter l'image à l'historique
            if (result.length > 0) {
                this.addToHistory(result[0], this.getParameters().prompt);
            }
            
            // Afficher les images générées
            this.displayResults(result);
            this.showSuccess('Images générées avec succès');
        } else {
            this.triggerHaptic('error');
            console.error('Format de résultat invalide:', result);
            this.showError('Format de résultat invalide');
        }
    }

    // Sauvegarder les derniers paramètres utilisés
    saveLastParameters() {
        const parameters = {
            prompt: this.prompt.value,
            aspect_ratio: this.aspectRatio.value,
            prompt_strength: this.promptStrength.value,
            num_outputs: this.numOutputs.value,
            num_inference_steps: this.numInferenceSteps.value,
            guidance_scale: this.guidanceScale.value,
            output_format: this.outputFormat.value,
            output_quality: this.quality.value,
            disable_safety_checker: this.safetyChecker.checked,
            loras: this.getLoRAs()
        };

        // Sauvegarder l'image de référence si elle existe
        if (this.imageInput && this.imageInput.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                parameters.referenceImage = reader.result;
                localStorage.setItem('last_parameters', JSON.stringify(parameters));
            };
            reader.readAsDataURL(this.imageInput.files[0]);
        } else {
            localStorage.setItem('last_parameters', JSON.stringify(parameters));
        }
    }

    // Charger les derniers paramètres utilisés
    async loadLastParameters() {
        try {
            const savedParams = localStorage.getItem('last_parameters');
            if (savedParams) {
                const params = JSON.parse(savedParams);
                
                // Restaurer le prompt
                if (params.prompt) {
                    this.prompt.value = params.prompt;
                    this.updateUI();
                }

                // Restaurer les paramètres de base
                this.aspectRatio.value = params.aspect_ratio || "1:1";
                this.promptStrength.value = params.prompt_strength || 0.8;
                this.numOutputs.value = params.num_outputs || 1;
                this.numInferenceSteps.value = params.num_inference_steps || 28;
                this.guidanceScale.value = params.guidance_scale || 7.5;
                this.outputFormat.value = params.output_format || "webp";
                this.quality.value = params.output_quality || 80;
                this.safetyChecker.checked = params.disable_safety_checker || false;

                // Restaurer l'image de référence
                if (params.referenceImage) {
                    // Créer un blob à partir du base64
                    const response = await fetch(params.referenceImage);
                    const blob = await response.blob();
                    const file = new File([blob], 'reference.png', { type: 'image/png' });
                    
                    // Créer un FileList simulé
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    this.imageInput.files = dataTransfer.files;
                    
                    // Mettre à jour la prévisualisation
                    this.previewImg.src = params.referenceImage;
                    this.imagePreview.style.display = 'flex';
                }

                // Restaurer les LoRAs
                if (params.loras && Array.isArray(params.loras)) {
                    this.loraList.innerHTML = '';
                    params.loras.forEach(lora => {
                        const loraElement = this.createLoRAElement();
                        const loraSelect = loraElement.querySelector('.lora-select');
                        const loraScale = loraElement.querySelector('.lora-scale');
                        
                        if (loraSelect && loraScale) {
                            loraSelect.value = lora.model;
                            loraScale.value = lora.scale;
                            loraScale.dispatchEvent(new Event('input'));
                        }
                        
                        this.loraList.appendChild(loraElement);
                    });
                }

                // Mettre à jour les valeurs affichées des sliders
                document.querySelectorAll('.range-input').forEach(input => {
                    input.dispatchEvent(new Event('input'));
                });
            }
        } catch (error) {
            console.error('Erreur lors du chargement des derniers paramètres:', error);
        }
    }

    // Utiliser une image comme référence
    useAsReference(imageUrl) {
        // Trouver l'entrée correspondante dans l'historique
        const historyEntry = this.imageHistory.find(item => item.url === imageUrl);
        
        if (!historyEntry) {
            this.triggerHaptic('error');
            console.error('Image non trouvée dans l\'historique');
            return;
        }

        // Mettre à jour le prompt avec celui de l'image historique
        if (historyEntry.prompt) {
            this.prompt.value = historyEntry.prompt;
            this.updateUI();
            this.triggerHaptic('light');
        }

        // Créer un blob à partir de l'URL de l'image
        fetch(imageUrl)
            .then(response => response.blob())
            .then(blob => {
                // Créer un fichier à partir du blob
                const file = new File([blob], 'reference.png', { type: 'image/png' });
                
                // Créer un FileList simulé
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                
                // Mettre à jour l'input file
                this.imageInput.files = dataTransfer.files;
                
                // Mettre à jour la prévisualisation
                this.previewImg.src = imageUrl;
                this.imagePreview.style.display = 'block';
                
                // Fermer le modal d'historique
                this.hideModal(this.historyModal);
                
                this.triggerHaptic('success');
                this.showSuccess('Image et prompt chargés depuis l\'historique');
            })
            .catch(error => {
                this.triggerHaptic('error');
                console.error('Erreur lors de la récupération de l\'image:', error);
                this.showError('Erreur lors de la récupération de l\'image');
            });
    }

    // Modifier la méthode waitForPrediction
    async waitForPrediction(predictionId, maxAttempts = 120, interval = 1000) {
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            try {
                const prediction = await this.replicateAPI.getPrediction(predictionId);
                console.log("État de la prédiction:", prediction);
                
                if (prediction.status === "succeeded") {
                    const images = prediction.output || prediction;
                    if (Array.isArray(images)) {
                        this.displayResults(images);
                        images.forEach(url => {
                            this.addToHistory(url, this.prompt.value);
                        });
                        this.showSuccess('Images générées avec succès');
                        this.setLoading(false);
                        localStorage.removeItem('pendingGeneration');
                        return;
                    }
                } else if (prediction.status === "failed") {
                    this.setLoading(false);
                    localStorage.removeItem('pendingGeneration');
                    throw new Error(prediction.error || "La génération a échoué");
                } else if (prediction.status === "canceled") {
                    this.setLoading(false);
                    localStorage.removeItem('pendingGeneration');
                    throw new Error("La génération a été annulée");
                }
                
                // Mettre à jour le message de progression
                if (prediction.logs) {
                    const lines = prediction.logs.split('\n');
                    let lastPercentage = null;
                    
                    for (const line of lines) {
                        const match = line.match(/([0-9]{1,3})%\|/);
                        if (match) {
                            lastPercentage = parseInt(match[1]);
                        }
                    }
                    
                    if (lastPercentage !== null) {
                        this.updateLoadingProgress(`Génération en cours...`, lastPercentage);
                    } else {
                        const status = prediction.status === "processing" ? "Génération en cours..." : 
                                     prediction.status === "starting" ? "Démarrage de la génération..." :
                                     prediction.logs || "En attente...";
                        this.updateLoadingProgress(status);
                    }
                }
                
                await new Promise(resolve => setTimeout(resolve, interval));
                attempts++;
                
            } catch (error) {
                console.error('Erreur lors de la vérification de la prédiction:', error);
                this.setLoading(false);
                localStorage.removeItem('pendingGeneration');
                throw error;
            }
        }
        
        this.setLoading(false);
        localStorage.removeItem('pendingGeneration');
        throw new Error("Délai d'attente dépassé");
    }

    // Modifier la méthode checkPendingGeneration
    async checkPendingGeneration() {
        const pendingGeneration = localStorage.getItem('pendingGeneration');
        if (pendingGeneration) {
            try {
                const { predictionId, startTime } = JSON.parse(pendingGeneration);
                const elapsedTime = Date.now() - startTime;
                
                if (elapsedTime < 600000) { // 10 minutes
                    console.log("Vérification de la génération en cours:", predictionId);
                    
                    try {
                        // Restaurer les paramètres avant tout
                        await this.loadLastParameters();
                        
                        const prediction = await this.replicateAPI.getPrediction(predictionId);
                        
                        // Si la génération est déjà terminée
                        if (prediction.status === "succeeded") {
                            console.log("La génération est terminée, affichage des résultats");
                            localStorage.removeItem('pendingGeneration');
                            this.setLoading(false);
                            
                            // Afficher les résultats si disponibles
                            if (prediction.output && Array.isArray(prediction.output)) {
                                this.displayResults(prediction.output);
                                prediction.output.forEach(url => {
                                    this.addToHistory(url, this.prompt.value);
                                });
                            }
                            return;
                        }
                        
                        // Si la génération a échoué ou a été annulée
                        if (prediction.status === "failed" || prediction.status === "canceled") {
                            console.log("La génération a échoué ou a été annulée");
                            localStorage.removeItem('pendingGeneration');
                            this.setLoading(false);
                            this.showError(prediction.error || "La génération a été interrompue");
                            return;
                        }
                        
                        // Si la génération est toujours en cours
                        if (prediction.status === "processing" || prediction.status === "starting") {
                            console.log("Reprise de la génération en cours");
                            this.setLoading(true);
                            this.loadingText.textContent = "Reprise de la génération en cours...";
                            this.loadingContainer.classList.add('show');
                            
                            await this.waitForPrediction(predictionId);
                        }
                    } catch (error) {
                        console.error("Erreur lors de la vérification de la génération:", error);
                        localStorage.removeItem('pendingGeneration');
                        this.setLoading(false);
                        this.showError("Impossible de vérifier l'état de la génération");
                    }
                } else {
                    console.log("Génération trop ancienne, nettoyage");
                    localStorage.removeItem('pendingGeneration');
                    this.setLoading(false);
                }
            } catch (error) {
                console.error("Erreur lors de la lecture de la génération en cours:", error);
                localStorage.removeItem('pendingGeneration');
                this.setLoading(false);
            }
        }
    }

    triggerHaptic(type = 'medium') {
        if (!window.navigator.vibrate) return;
        
        switch(type) {
            case 'light':
                window.navigator.vibrate(10);
                break;
            case 'medium':
                window.navigator.vibrate(25);
                break;
            case 'heavy':
                window.navigator.vibrate([50, 30, 50]);
                break;
            case 'error':
                window.navigator.vibrate([50, 100, 50, 100, 50]);
                break;
            case 'success':
                window.navigator.vibrate([30, 50, 30]);
                break;
        }
    }

    showLoading(message) {
        this.setLoading(true);
        this.loadingText.textContent = message;
    }

    hideLoading() {
        this.setLoading(false);
    }
}

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', () => {
    window.ui = new UI();
}); 