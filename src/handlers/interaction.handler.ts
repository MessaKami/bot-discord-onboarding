import { Interaction, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { logger } from '../config/logger';
import { execute as executeCreateCampus } from '../campuses/commands/create-campus.command';
import { execute as executeModifyCampus } from '../campuses/commands/modify-campus.command';
import { execute as executeDeleteCampus } from '../campuses/commands/delete-campus.command';
import { execute as executeShowCampusForm } from '../campuses/commands/show-campus-form.command';
import { execute as executeSetupIdentification } from '../identification_requests/commands/setupIdentificationButton';
import { execute as executeAddPost } from '../channels/commands/create-stock-post.command';
import { execute as executeListPosts } from '../channels/commands/list-stock-posts.command';
import { execute as executeUpdatePost } from '../channels/commands/modify-stock-channel.command';
import { execute as executeDeletePost } from '../channels/commands/delete-stock-post.command';
import { CampusInteractionsHandler } from '../campuses/events/campus-interactions.handler';

export class InteractionHandler {
    private campusInteractions: CampusInteractionsHandler;

    constructor() {
        this.campusInteractions = new CampusInteractionsHandler();
    }

    async handleInteraction(interaction: Interaction): Promise<void> {
        try {
            if (interaction.isModalSubmit() || interaction.isStringSelectMenu() || interaction.isButton()) {
                logger.info(`📝 Interaction détectée : ${interaction.customId}`);
    
                if (interaction.isModalSubmit()) {
                    if (interaction.customId === "create-stock-post") {
                        await executeAddPost(interaction);
                        return;
                    }
                    if (interaction.customId.startsWith("update-stock-post-")) {
                        await executeUpdatePost(interaction);
                        return;
                    }
                    await this.campusInteractions.handleModalSubmit(interaction);
                    return;
                }
    
                if (interaction.isStringSelectMenu()) {
                    if (interaction.customId === 'select-stock-channel') {
                        logger.info(`✅ Channel sélectionné : ${interaction.values[0]}`);
                        await executeUpdatePost(interaction); // 🚀 Exécuter la mise à jour du channel
                        return;
                    }
                    if (interaction.customId === 'select-stock-channel-delete') {
                        await executeDeletePost(interaction);
                        return;
                    }
                    await this.campusInteractions.handleSelectMenu(interaction);
                    return;
                }
            }
    
            if (interaction.isChatInputCommand()) {
                await this.handleSlashCommand(interaction);
            }
        } catch (error) {
            logger.error(error, 'Erreur lors du traitement de l\'interaction');
            
            if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
                try {
                    await interaction.reply({
                        content: '❌ Une erreur est survenue lors du traitement de l\'interaction.',
                        flags: MessageFlags.Ephemeral
                    });
                } catch (replyError) {
                    logger.error(replyError, 'Impossible d\'envoyer le message d\'erreur');
                }
            }
        }
    }
    
    

    private async handleSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const { commandName } = interaction;
        
        logger.debug({
            command: commandName,
            user: interaction.user.tag
        }, 'Commande slash reçue');

        try {
            switch (commandName) {
                case 'create-campus':
                    await executeCreateCampus(interaction);
                    break;
                case 'modify-campus':
                    await executeModifyCampus(interaction);
                    break;
                case 'delete-campus':
                    await executeDeleteCampus(interaction);
                    break;
                case 'campus-form':
                    await executeShowCampusForm(interaction);
                    break;
                case 'setup-identification':
                    await executeSetupIdentification(interaction);
                    break;
                case 'add-post':
                    await executeAddPost(interaction);
                    break;
                case 'list-stock-posts':
                    await executeListPosts(interaction);
                    break;
                case 'update-post':
                    await executeUpdatePost(interaction);
                    break;
                case 'delete-post':
                    await executeDeletePost(interaction);
                    break;
                default:
                    if (!interaction.replied && !interaction.deferred) {
                        logger.warn(`Commande inconnue: ${commandName}`);
                        await interaction.reply({ 
                            content: 'Commande inconnue',
                            flags: MessageFlags.Ephemeral 
                        });
                    }
            }
        } catch (error) {
            logger.error(error, `❌ Erreur lors de l\'exécution de la commande : ${commandName}`);
            throw error;
        }
    }
}

