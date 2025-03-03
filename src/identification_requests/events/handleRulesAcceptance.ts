import { Events, Interaction } from 'discord.js';
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

        // Vérification de la variable d'environnement API_URL
        const apiUrl = process.env.API_URL;
        if (!apiUrl) {
            logger.error('Variable d\'environnement API_URL non définie');
            throw new Error('Configuration API manquante');
        }

        // Récupération ou création du membre depuis l'API
        let memberUUID;
        try {
            // 1. Vérifier si l'utilisateur Discord existe déjà
            const discordUserResponse = await fetch(
                `${apiUrl}/discord-users/${interaction.user.id}`,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const discordUserResponseData = await discordUserResponse.json();
            
            // Vérifier si l'utilisateur existe réellement (pas seulement si la réponse est OK)
            let discordUserExists = discordUserResponse.ok && 
                                   discordUserResponseData && 
                                   discordUserResponseData.data !== null;
            
            let discordUserData;

            // Si l'utilisateur Discord n'existe pas, on le crée
            if (!discordUserExists) {
                logger.info({
                    discordId: interaction.user.id,
                    username: interaction.user.username,
                    responseStatus: discordUserResponse.status,
                    responseData: discordUserResponseData
                }, 'Utilisateur Discord non trouvé ou données nulles, création en cours...');

                // Créer l'utilisateur Discord
                const createDiscordUserResponse = await fetch(
                    `${apiUrl}/discord-users`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            uuidDiscord: interaction.user.id,
                            discordUsername: interaction.user.username,
                            discriminator: interaction.user.discriminator || '0'
                        })
                    }
                );

                if (!createDiscordUserResponse.ok) {
                    const errorData = await createDiscordUserResponse.json();
                    logger.error({
                        status: createDiscordUserResponse.status,
                        statusText: createDiscordUserResponse.statusText,
                        error: errorData
                    }, 'Erreur lors de la création de l\'utilisateur Discord');
                    throw new Error('Impossible de créer votre profil utilisateur');
                }

                discordUserData = await createDiscordUserResponse.json();
                
                // Vérifier que l'utilisateur a bien été créé
                if (!discordUserData || !discordUserData.data) {
                    logger.error({
                        response: discordUserData
                    }, 'Réponse de création d\'utilisateur Discord invalide');
                    throw new Error('Échec de la création de l\'utilisateur Discord: réponse invalide');
                }
                
                discordUserExists = true;
                logger.info({
                    discordId: interaction.user.id,
                    response: discordUserData
                }, 'Utilisateur Discord créé avec succès');
                
                // Vérifier à nouveau que l'utilisateur Discord existe dans la base de données
                const verifyUserResponse = await fetch(
                    `${apiUrl}/discord-users/${interaction.user.id}`,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                const verifyUserData = await verifyUserResponse.json();
                
                if (!verifyUserResponse.ok || !verifyUserData || !verifyUserData.data) {
                    logger.error({
                        status: verifyUserResponse.status,
                        response: verifyUserData
                    }, 'Échec de la vérification de l\'utilisateur Discord après création');
                    throw new Error('Impossible de vérifier la création de l\'utilisateur Discord');
                }
                
                logger.info({
                    discordId: interaction.user.id,
                    verifyResponse: verifyUserData
                }, 'Vérification de la création de l\'utilisateur Discord réussie');
            } else {
                // L'utilisateur Discord existe, récupérer ses données
                discordUserData = discordUserResponseData;
                logger.info({
                    discordId: interaction.user.id,
                    response: discordUserData
                }, 'Utilisateur Discord existant récupéré');
            }

            // Vérifier que l'utilisateur Discord existe maintenant
            if (!discordUserExists) {
                throw new Error('Échec de la création de l\'utilisateur Discord');
            }

            // 2. Vérifier si un membre existe déjà pour cet utilisateur Discord
            const membersResponse = await fetch(
                `${apiUrl}/members`,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (!membersResponse.ok) {
                logger.error({
                    status: membersResponse.status,
                    statusText: membersResponse.statusText
                }, 'Erreur lors de la récupération des membres');
                throw new Error('Impossible de récupérer les membres');
            }
            
            const membersData = await membersResponse.json();
            const memberFound = membersData.data.find((member: any) => member.uuidDiscord === interaction.user.id);
            
            if (!memberFound) {
                // L'utilisateur Discord existe mais pas le membre, on crée le membre
                logger.info({
                    discordId: interaction.user.id
                }, 'Utilisateur Discord trouvé mais pas de membre associé, création du membre...');

                // Vérifier à nouveau que l'utilisateur Discord existe dans la base de données
                const checkDiscordUserResponse = await fetch(
                    `${apiUrl}/discord-users/${interaction.user.id}`,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const checkDiscordUserData = await checkDiscordUserResponse.json();
                
                if (!checkDiscordUserResponse.ok || !checkDiscordUserData || !checkDiscordUserData.data) {
                    logger.error({
                        status: checkDiscordUserResponse.status,
                        statusText: checkDiscordUserResponse.statusText,
                        response: checkDiscordUserData
                    }, 'Erreur: Utilisateur Discord non trouvé avant création du membre');
                    throw new Error('Utilisateur Discord non trouvé avant création du membre');
                }
                
                logger.info({
                    discordId: interaction.user.id,
                    checkResponse: checkDiscordUserData
                }, 'Vérification de l\'utilisateur Discord avant création du membre réussie');

                // Créer le membre associé
                const createMemberResponse = await fetch(
                    `${apiUrl}/members`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            guildUsername: interaction.user.username,
                            xp: '0.00',
                            level: 1,
                            communityRole: 'Member',
                            status: 'Active',
                            uuidGuild: process.env.GUILD_ID || interaction.guildId,
                            uuidDiscord: interaction.user.id
                        })
                    }
                );

                if (!createMemberResponse.ok) {
                    const errorData = await createMemberResponse.json();
                    logger.error({
                        status: createMemberResponse.status,
                        statusText: createMemberResponse.statusText,
                        error: errorData
                    }, 'Erreur lors de la création du membre');
                    throw new Error('Impossible de créer votre profil membre');
                }

                const memberData = await createMemberResponse.json();
                memberUUID = memberData.data.uuidMember;
                logger.info({
                    memberUUID,
                    discordId: interaction.user.id
                }, 'Membre créé avec succès');
            } else {
                // L'utilisateur Discord et le membre existent
                memberUUID = memberFound.uuidMember;
                logger.info({
                    memberUUID,
                    discordId: interaction.user.id
                }, 'Membre existant récupéré avec succès');
            }
        } catch (memberError: unknown) {
            logger.error({
                message: 'Erreur lors de la récupération ou création du membre',
                error: memberError
            });
            throw new Error('Erreur lors de la préparation de votre profil. Veuillez réessayer.');
        }

        // Création de la demande d'identification selon la structure de la table
        const identificationRequest = {
            firstname: userData.firstname,
            lastname: userData.lastname,
            email: userData.email,
            uuidMember: memberUUID // UUID du membre existant
        };

        logger.info({
            message: 'Tentative d\'envoi de la demande d\'identification',
            data: identificationRequest,
            apiUrl: apiUrl
        });

        // Envoi à l'API
        try {
            const response = await fetch(
                `${apiUrl}/identification-requests`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(identificationRequest)
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                logger.error({
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                }, 'Erreur lors de l\'envoi à l\'API');
                throw new Error(`Erreur lors de l'envoi de la demande à l'API: ${errorData.message || 'Erreur inconnue'}`);
            }

            const result = await response.json();
            logger.info({
                message: 'Réponse de l\'API reçue',
                status: response.status,
                data: result
            });

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
        } catch (apiError: unknown) {
            logger.error({
                message: 'Erreur détaillée lors de l\'envoi à l\'API',
                error: apiError
            });
            throw new Error(`Erreur lors de l'envoi de la demande à l'API: ${apiError instanceof Error ? apiError.message : 'Erreur inconnue'}`);
        }

    } catch (error: unknown) {
        console.error('Erreur lors de l\'acceptation des règles:', error);
        await interaction.reply({
            content: 'Une erreur est survenue lors du traitement de votre demande. Veuillez réessayer.',
            ephemeral: true
        });
    }
} 