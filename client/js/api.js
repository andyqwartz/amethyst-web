import { CONFIG } from './config.js';

export class ReplicateAPI {
    constructor(token = '') {
        this.baseUrl = CONFIG.BASE_URL;
        this.modelVersion = CONFIG.MODEL_VERSION;
        this.token = token;
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('replicate_token', token);
    }

    getToken() {
        return this.token || localStorage.getItem('replicate_token') || '';
    }

    async createPrediction(parameters) {
        const token = this.getToken();
        if (!token) {
            throw new Error('Token API non configuré');
        }

        const input = {
            prompt: parameters.prompt,
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: 28,
            lora: parameters.lora_names[0],
            lora_scale: parseFloat(parameters.lora_scales[0])
        };

        if (parameters.image) {
            input.image = parameters.image;
        }

        const requestData = {
            version: this.modelVersion,
            input: input
        };

        try {
            const response = await fetch(`${this.baseUrl}/predictions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la création de la prédiction:', error);
            throw error;
        }
    }

    async getPrediction(id) {
        const token = this.getToken();
        if (!token) {
            throw new Error('Token API non configuré');
        }

        try {
            const response = await fetch(`${this.baseUrl}/predictions/${id}`, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la récupération de la prédiction:', error);
            throw error;
        }
    }

    async uploadImage(file) {
        try {
            if (!file) {
                throw new Error('Aucun fichier fourni');
            }

            if (file.size > 20 * 1024 * 1024) { // 20MB max
                throw new Error('Le fichier est trop volumineux (max 20MB)');
            }

            if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
                throw new Error('Format de fichier non supporté. Utilisez JPG, PNG ou WEBP');
            }

            console.log("Début de l'upload...", {
                nom: file.name,
                taille: file.size,
                type: file.type
            });

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${this.baseUrl}/files`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${this.token}`
                },
                body: formData
            });

            let responseData;
            const responseText = await response.text();
            console.log('Réponse brute du serveur:', responseText);

            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                console.error('Erreur de parsing JSON:', e);
                throw new Error('Réponse invalide du serveur');
            }

            if (!response.ok) {
                console.error('Erreur upload:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: responseData
                });
                throw new Error(responseData.detail || 'Erreur lors de l\'upload de l\'image');
            }

            if (!responseData.get) {
                console.error('Réponse invalide:', responseData);
                throw new Error('URL de l\'image non reçue');
            }

            console.log('Image uploadée avec succès:', {
                url: responseData.get,
                response: responseData
            });

            return responseData.get;
        } catch (error) {
            console.error('Erreur lors de l\'upload:', error);
            throw new Error(`Erreur lors de l'upload de l'image: ${error.message}`);
        }
    }

    async generateImages(parameters) {
        console.log("Début de la génération avec les paramètres:", parameters);
        
        if (!this.token) {
            throw new Error('Token API non configuré');
        }

        // Validation des paramètres selon le schéma
        const validatedInput = {
            prompt: parameters.prompt,
            aspect_ratio: parameters.aspect_ratio || '1:1',
            prompt_strength: Math.min(Math.max(parameters.prompt_strength || 0.8, 0), 1),
            num_outputs: Math.min(Math.max(parameters.num_outputs || 1, 1), 4),
            num_inference_steps: Math.min(Math.max(parameters.num_inference_steps || 28, 1), 50),
            guidance_scale: Math.min(parameters.guidance_scale || 3.5, 10),
            output_format: (parameters.output_format || 'webp').toLowerCase(),
            output_quality: Math.min(Math.max(parameters.output_quality || 80, 0), 100),
            disable_safety_checker: parameters.disable_safety_checker || false
        };

        // Gestion de l'image si présente
        if (parameters.image) {
            try {
                console.log("Upload de l'image de référence...");
                validatedInput.image = await this.uploadImage(parameters.image);
                console.log("Image uploadée avec succès:", validatedInput.image);
            } catch (error) {
                console.error("Erreur lors de l'upload de l'image:", error);
                throw error;
            }
        }

        // Gestion des LoRAs
        if (parameters.hf_loras && parameters.hf_loras.length > 0) {
            validatedInput.hf_loras = parameters.hf_loras;
            validatedInput.lora_scales = parameters.lora_scales || 
                Array(parameters.hf_loras.length).fill(0.8);
        }

        const requestBody = {
            version: this.modelVersion,
            input: validatedInput
        };

        console.log("Corps de la requête validé:", requestBody);

        try {
            // Créer la prédiction
            const createResponse = await fetch(`${this.baseUrl}/predictions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${this.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const responseData = await createResponse.json();

            if (!createResponse.ok) {
                console.error("Erreur API:", responseData);
                throw new Error(responseData.detail || 'Erreur lors de la création de la prédiction');
            }

            console.log("Prédiction créée:", responseData);

            // Attendre que la prédiction soit terminée
            const result = await this.waitForPrediction(responseData.id);
            console.log("Résultat final:", result);

            return result;
        } catch (error) {
            console.error("Erreur lors de la génération:", error);
            throw error;
        }
    }

    isConfigured() {
        return true;
    }

    async waitForPrediction(predictionId, maxAttempts = 120, interval = 1000) {
        console.log(`Attente de la prédiction ${predictionId}...`);
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            try {
                const response = await fetch(`${this.baseUrl}/proxy/predictions/${predictionId}`, {
                    headers: { 'Authorization': `Token ${this.token}` }
                });
                
                if (!response.ok) {
                    throw new Error(`Erreur lors de la vérification de la prédiction: ${response.status}`);
                }
                
                const prediction = await response.json();
                console.log(`État de la prédiction: ${prediction.status}`);
                
                switch (prediction.status) {
                    case 'succeeded':
                        return prediction.output;
                    case 'failed':
                        throw new Error(prediction.error || 'La génération a échoué');
                    case 'canceled':
                        throw new Error('La génération a été annulée');
                    case 'processing':
                        window.ui.updateLoadingProgress('Génération en cours...');
                        break;
                    case 'starting':
                        window.ui.updateLoadingProgress('Démarrage de la génération...');
                        break;
                }
                
                if (prediction.logs) {
                    const progress = prediction.logs.match(/(\d+)%/);
                    if (progress) {
                        window.ui.updateLoadingProgress(`Génération en cours: ${progress[1]}%`);
                    }
                }
                
                await new Promise(resolve => setTimeout(resolve, interval));
                attempts++;
                
            } catch (error) {
                console.error('Erreur lors de la vérification:', error);
                throw error;
            }
        }
        
        throw new Error('Le temps de génération est trop long, veuillez réessayer');
    }
}

// Instance globale de l'API
const replicateAPI = new ReplicateAPI();

export default ReplicateAPI; 