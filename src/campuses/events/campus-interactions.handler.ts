import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ButtonInteraction,
    StringSelectMenuInteraction,
    ModalSubmitInteraction,
    Client,
    MessageFlags
} from 'discord.js';
import { logger } from '../../config/logger';
import { CampusService } from '../services/campus.service';

export class CampusInteractionsHandler {
    private campusService: CampusService | null = null;
    private selectedCampusesToDelete: Map<string, string[]> = new Map();

    constructor() {}

    private initService(client: Client) {
        if (!this.campusService) {
            this.campusService = new CampusService(client);
        }
    }

    async handleModalSubmit(interaction: ModalSubmitInteraction) {
        try {
            this.initService(interaction.client);
            
            if (interaction.customId === 'create-campus-modal-from-slash' || 
                interaction.customId === 'create-campus-modal-from-form') {
                // Récupération des valeurs du formulaire
                const name = interaction.fields.getTextInputValue('campusName');
                
                logger.debug({
                    name,
                    user: interaction.user.tag
                }, 'Tentative de création de campus');

                // Création du campus via le service
                await this.campusService!.createCampus(name);
                
                // Réponse à l'utilisateur qui sera supprimée après 5 minutes
                const reply = await interaction.reply({
                    content: `✅ Le campus "${name}" a été créé avec succès !`,
                    flags: MessageFlags.Ephemeral,
                    fetchReply: true
                });

                // Programmer la suppression après 5 minutes
                setTimeout(async () => {
                    try {
                        await reply.delete();
                    } catch (error) {
                        logger.error(error, 'Erreur lors de la suppression du message de confirmation');
                    }
                }, 5 * 60 * 1000);
                
                logger.info({
                    name,
                    user: interaction.user.tag
                }, 'Campus créé avec succès');
            }

            if (interaction.customId.startsWith('modify-campus-modal-')) {
                const campusId = interaction.customId.replace('modify-campus-modal-', '');
                const newName = interaction.fields.getTextInputValue('newCampusName');
                
                await this.campusService!.updateCampus(campusId, newName);
                
                // Message de confirmation qui sera supprimé après 5 minutes
                const reply = await interaction.reply({
                    content: `✅ Le campus a été renommé en "${newName}" avec succès !`,
                    flags: MessageFlags.Ephemeral,
                    fetchReply: true
                });

                // Programmer la suppression après 5 minutes
                setTimeout(async () => {
                    try {
                        await reply.delete();
                    } catch (error) {
                        logger.error(error, 'Erreur lors de la suppression du message de confirmation');
                    }
                }, 5 * 60 * 1000);
                
                logger.info({
                    action: 'campus_update',
                    campusId,
                    newName,
                    userId: interaction.user.id
                }, 'Campus modifié');
            }
        } catch (error) {
            logger.error(error, 'Erreur lors du traitement du modal');
            
            // Vérifier si l'interaction n'a pas déjà reçu une réponse
            if (!interaction.replied && !interaction.deferred) {
                const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
                await interaction.reply({
                    content: `❌ Une erreur est survenue : ${errorMessage}`,
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }

    private async rejectMessageAfterDelay(interaction: ButtonInteraction | StringSelectMenuInteraction, message: string = '⏰ Le message a expiré.') {
        // Attendre 5 minutes
        await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));

        try {
            // Vérifier si le message existe toujours et le supprimer
            const channel = interaction.channel;
            if (channel) {
                try {
                    const fetchedMessage = await channel.messages.fetch(interaction.message.id);
                    if (fetchedMessage) {
                        await fetchedMessage.delete();
                    }
                } catch (error: any) {
                    // Si le message n'existe plus, on ignore l'erreur
                    if (error.code === 10008) {
                        logger.debug('Le message a déjà été supprimé');
                        return;
                    }
                    throw error;
                }
                
                // Envoyer une notification de suppression qui sera elle-même supprimée après 5 secondes
                const notification = await interaction.followUp({
                    content: message,
                    flags: MessageFlags.Ephemeral
                });
                
                // Supprimer la notification après 5 secondes
                setTimeout(async () => {
                    try {
                        if (notification) {
                            await notification.delete();
                        }
                    } catch (error) {
                        logger.error(error, 'Erreur lors de la suppression de la notification');
                    }
                }, 5000);
            }
        } catch (error) {
            logger.error(error, 'Erreur lors de la suppression du message');
        }
    }

    async handleSelectMenu(interaction: StringSelectMenuInteraction): Promise<void> {
        try {
            this.initService(interaction.client);
            
            if (interaction.customId === 'modify-campus-select') {
                const campusId = interaction.values[0];
                const campus = await this.campusService!.getCampus(campusId);
                
                const modal = new ModalBuilder()
                    .setCustomId(`modify-campus-modal-${campusId}`)
                    .setTitle('Modifier le campus');

                const newNameInput = new TextInputBuilder()
                    .setCustomId('newCampusName')
                    .setLabel('Nouveau nom du campus')
                    .setValue(campus.name)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(3)
                    .setMaxLength(50);

                const row = new ActionRowBuilder<TextInputBuilder>()
                    .addComponents(newNameInput);

                modal.addComponents(row);
                await interaction.showModal(modal);
            }

            if (interaction.customId === 'delete-campus-select') {
                // Stocker les campus sélectionnés pour la suppression
                this.selectedCampusesToDelete.set(interaction.user.id, interaction.values);
                
                // Récupérer les noms des campus sélectionnés
                const selectedCampusNames = await Promise.all(
                    interaction.values.map(async (campusId) => {
                        const campus = await this.campusService!.getCampus(campusId);
                        return campus.name;
                    })
                );

                // Recréer les boutons
                const confirmButton = new ButtonBuilder()
                    .setCustomId('confirm-delete-campus')
                    .setLabel('Confirmer la suppression')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⚠️');

                const cancelButton = new ButtonBuilder()
                    .setCustomId('cancel-delete-campus')
                    .setLabel('Annuler')
                    .setStyle(ButtonStyle.Secondary);

                const buttonRow = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(confirmButton, cancelButton);

                await interaction.update({
                    content: `⚠️ Vous êtes sur le point de supprimer les campus suivants :\n${selectedCampusNames.map(name => `- ${name}`).join('\n')}\n\nCliquez sur "Confirmer la suppression" pour continuer ou "Annuler" pour abandonner.`,
                    components: [buttonRow]
                });
                
                logger.debug({
                    user: interaction.user.tag,
                    selectedCampuses: interaction.values,
                    selectedCampusNames
                }, 'Campus sélectionnés pour suppression');
            }
        } catch (error) {
            logger.error(error, 'Erreur lors du traitement de la sélection');
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ Une erreur est survenue lors de la sélection.',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }

    async handleButton(interaction: ButtonInteraction): Promise<void> {
        logger.debug(`✅ Début de handleButton()`, { customId: interaction.customId, user: interaction.user.tag });
        try {
            this.initService(interaction.client);
            
            if (interaction.customId === 'show-create-campus') {
                // Création du modal
                const modal = new ModalBuilder()
                    .setCustomId('create-campus-modal-from-form')
                    .setTitle('Créer un nouveau campus');

                // Champ pour le nom du campus
                const nameInput = new TextInputBuilder()
                    .setCustomId('campusName')
                    .setLabel('Nom du campus')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Ex: Lille')
                    .setRequired(true)
                    .setMinLength(3)
                    .setMaxLength(50);

                // Création de la rangée pour le modal
                const firstActionRow = new ActionRowBuilder<TextInputBuilder>()
                    .addComponents(nameInput);

                // Ajout de la rangée au modal
                modal.addComponents(firstActionRow);

                // Affichage du modal
                await interaction.showModal(modal);
            }

            if (interaction.customId === 'show-modify-campus') {
                const campuses = await this.campusService!.getAllCampuses();

                if (campuses.length === 0) {
                    await interaction.reply({
                        content: '❌ Aucun campus n\'existe actuellement.',
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }

                // Création du menu de sélection
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('modify-campus-select')
                    .setPlaceholder('Sélectionner le campus à modifier')
                    .addOptions(
                        campuses.map(campus => 
                            new StringSelectMenuOptionBuilder()
                                .setLabel(campus.name)
                                .setDescription(`Modifier ${campus.name}`)
                                .setValue(campus.uuidCampus)
                        )
                    );

                const row = new ActionRowBuilder<StringSelectMenuBuilder>()
                    .addComponents(selectMenu);

                await interaction.reply({
                    content: 'Sélectionnez le campus à modifier :',
                    components: [row],
                    flags: MessageFlags.Ephemeral
                });
            }

            if (interaction.customId === 'show-delete-campus') {
                const campuses = await this.campusService!.getAllCampuses();

                if (campuses.length === 0) {
                    await interaction.reply({
                        content: '❌ Aucun campus n\'existe actuellement.',
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }

                // Création du menu de sélection avec sélection multiple
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('delete-campus-select')
                    .setPlaceholder('Sélectionner les campus à supprimer')
                    .setMinValues(1)
                    .setMaxValues(campuses.length)
                    .addOptions(
                        campuses.map(campus => 
                            new StringSelectMenuOptionBuilder()
                                .setLabel(campus.name)
                                .setDescription(`⚠️ Supprimer ${campus.name}`)
                                .setValue(campus.uuidCampus)
                        )
                    );

                const row = new ActionRowBuilder<StringSelectMenuBuilder>()
                    .addComponents(selectMenu);

                await interaction.reply({
                    content: '⚠️ **ATTENTION** : La suppression des campus est irréversible et entraînera la suppression de toutes les promotions associées.\n\nSélectionnez les campus à supprimer :',
                    components: [row],
                    flags: MessageFlags.Ephemeral
                });
            }

            if (interaction.customId === 'confirm-delete-campus') {
                logger.debug(`✅ Début de handleButton()`, { customId: interaction.customId, user: interaction.user.tag });            
                const selectedCampuses = this.selectedCampusesToDelete.get(interaction.user.id);
            
                if (!selectedCampuses || selectedCampuses.length === 0) {
                    logger.warn(`⚠️ Aucun campus n'a été sélectionné pour la suppression.`);
                    await interaction.reply({
                        content: '❌ Aucun campus n\'a été sélectionné pour la suppression.',
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }
            
                logger.debug(`🔄 Suppression en cours`, { selectedCampuses });
            
                // Ajoute un deferUpdate() pour éviter l'expiration de l'interaction
                try {
                    await interaction.deferUpdate();
                    logger.debug(`✅ Interaction différée avec succès`);
                } catch (error) {
                    logger.error(`❌ Erreur lors du deferUpdate()`, { error });
                }
            
                let successCount = 0;
                let errorCount = 0;
            
                // Désactiver les boutons
                try {
                    const disabledRow = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('confirm-delete-campus')
                                .setLabel('Suppression en cours...')
                                .setStyle(ButtonStyle.Danger)
                                .setEmoji('⏳')
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId('cancel-delete-campus')
                                .setLabel('Annuler')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true)
                        );
            
                    await interaction.editReply({ components: [disabledRow] });
                    logger.debug(`🔒 Boutons désactivés`);
                } catch (error) {
                    logger.error(`❌ Erreur lors de la mise à jour du message`, { error });
                }
            
                for (const campusId of selectedCampuses) {
                    try {
                        logger.debug(`📡 Envoi de la requête DELETE pour le campus`, { campusId });
                        await this.campusService!.deleteCampus(campusId);
                        logger.info(`✅ Campus supprimé avec succès`, { campusId });
                        successCount++;
                    } catch (error) {
                        logger.error(`❌ Erreur lors de la suppression du campus`, { campusId, error });
                        errorCount++;
                    }
                }
            
                // Nettoyer les sélections après la suppression
                this.selectedCampusesToDelete.delete(interaction.user.id);
            
                try {
                    await interaction.editReply({
                        content: `✅ Opération terminée :\n- ${successCount} campus supprimé(s) avec succès\n${errorCount > 0 ? `- ${errorCount} erreur(s) de suppression` : ''}`,
                        components: []
                    });
                    logger.info(`🔄 Message final mis à jour après suppression`);
                } catch (error) {
                    logger.error(`❌ Erreur lors de la mise à jour finale du message`, { error });
                }
            }
            
            
        } catch (error) {
            logger.error(error, 'Erreur lors du traitement du bouton');
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ Une erreur est survenue lors de l\'opération.',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }
} 