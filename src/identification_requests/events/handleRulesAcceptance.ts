import { Events, Interaction } from 'discord.js';
import axios from 'axios';
import { logger } from '../../config/logger';
import { userDataMap } from '../store/temporaryStore';

export const name = Events.InteractionCreate;

export async function execute(interaction: Interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('rules-accept-')) return;

    try {
        // Extraction des informations du customId
        const [, , role, userId] = interaction.customId.split('-');

        // Récupération des données temporaires de l'utilisateur
        const userData = userDataMap.get(userId);
        
        if (!userData) {
            throw new Error('Données utilisateur non trouvées');
        }

        // Vérification des variables d'environnement
        if (!process.env.API_URL || !process.env.API_TOKEN) {
            logger.error('Variables d\'environnement API_URL ou API_TOKEN non définies');
            throw new Error('Configuration API manquante');
        }

        // Récupération du membre depuis l'API
        let memberUUID;
        try {
            const memberResponse = await axios.get(
                `${process.env.API_URL}/members/discord/${interaction.user.id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.API_TOKEN}`
                    }
                }
            );

            if (memberResponse.data && memberResponse.data.uuid) {
                memberUUID = memberResponse.data.uuid;
            } else {
                throw new Error('Membre non trouvé');
            }
        } catch (memberError: any) {
            logger.error({
                message: 'Erreur lors de la récupération du membre',
                error: memberError.response?.data || memberError.message
            });
            throw new Error('Vous devez d\'abord être membre du serveur pour faire une demande d\'identification');
        }

        const now = new Date().toISOString();

        // Création de la demande d'identification selon la structure de la table
        const identificationRequest = {
            firstname: userData.firstname,
            lastname: userData.lastname,
            email: userData.email,
            created_at: now,
            updated_at: now,
            uuid_member: memberUUID // UUID du membre existant
        };

        logger.info({
            message: 'Tentative d\'envoi de la demande d\'identification',
            data: identificationRequest,
            apiUrl: process.env.API_URL
        });

        // Envoi à l'API
        try {
            const response = await axios.post(
                `${process.env.API_URL}/identification-requests`,
                identificationRequest,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.API_TOKEN}`
                    }
                }
            );

            logger.info({
                message: 'Réponse de l\'API reçue',
                status: response.status,
                data: response.data
            });

            if (response.status === 201) {
                // Nettoyage des données temporaires
                userDataMap.delete(userId);

                // Message de succès
                await interaction.update({
                    content: `✅ Félicitations ! Votre demande d'identification a été enregistrée avec succès.\n\nUn modérateur va examiner votre demande prochainement. Vous recevrez une notification dès que votre compte sera validé.`,
                    components: [] // On retire tous les boutons
                });

                // Stockage du rôle pour utilisation ultérieure si nécessaire
                logger.info({
                    message: 'Rôle sélectionné pour référence future',
                    userId: interaction.user.id,
                    role: role,
                    memberUUID: memberUUID
                });
            }
        } catch (apiError: any) {
            logger.error({
                message: 'Erreur détaillée lors de l\'envoi à l\'API',
                error: apiError.response?.data || apiError.message,
                status: apiError.response?.status,
                config: {
                    url: apiError.config?.url,
                    method: apiError.config?.method,
                    headers: apiError.config?.headers,
                    data: apiError.config?.data
                }
            });
            throw new Error(`Erreur lors de l'envoi de la demande à l'API: ${apiError.response?.data?.message || apiError.message}`);
        }

    } catch (error) {
        console.error('Erreur lors de l\'acceptation des règles:', error);
        await interaction.reply({
            content: 'Une erreur est survenue lors du traitement de votre demande. Veuillez réessayer.',
            ephemeral: true
        });
    }
} 