import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ModalSubmitInteraction,
    StringSelectMenuInteraction, 
    MessageFlags
} from "discord.js";
import { logger } from "../../config/logger";
import { ChannelService } from "../services/channels-service";

export const data = new SlashCommandBuilder()
    .setName("add-post")
    .setDescription("Créer un nouveau channel dans la catégorie stock ou modifier un existant");

export async function execute(
    interaction: ChatInputCommandInteraction | ModalSubmitInteraction | StringSelectMenuInteraction
) {
    try {
        const channelService = new ChannelService(interaction.client, interaction.guild!);

        if (interaction.isChatInputCommand()) {
            // ✅ Afficher le modal de création d'un nouveau channel
            const modal = new ModalBuilder()
                .setCustomId("create-stock-post")
                .setTitle("Créer un nouveau channel");

            const nameInput = new TextInputBuilder()
                .setCustomId("name")
                .setLabel("Nom du channel")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Entrez le nom du channel")
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(50);

            const typeChoice = new TextInputBuilder()
                .setCustomId("type")
                .setLabel("Type de channel (text/voice)")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("text ou voice")
                .setRequired(true)
                .setMinLength(4)
                .setMaxLength(5);

            const positionInput = new TextInputBuilder()
                .setCustomId("position")
                .setLabel("Position du channel")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Entrez un nombre")
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(3);

            modal.addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(typeChoice),
                new ActionRowBuilder<TextInputBuilder>().addComponents(positionInput)
            );

            logger.info("✅ Tentative d'affichage du modal...");
            await interaction.showModal(modal);
            logger.info("✅ Modal affiché avec succès !");
        } 
        
        else if (interaction.isStringSelectMenu()) {
            // ✅ Sélection d'un channel existant → Afficher le modal de modification
            const channelId = interaction.values[0];

            const selectedChannel = await interaction.guild?.channels.fetch(channelId);
            if (!selectedChannel) {
                return interaction.reply({ content: "❌ Impossible de récupérer le channel sélectionné.", flags: MessageFlags.Ephemeral });
            }

            logger.info(`✅ Channel sélectionné pour modification : ${selectedChannel.name} (${channelId})`);

            const modal = new ModalBuilder()
                .setCustomId(`update-stock-post-${channelId}`)
                .setTitle("Modifier le channel");

            const nameInput = new TextInputBuilder()
                .setCustomId("name")
                .setLabel("Nom du channel")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Entrez le nouveau nom")
                .setRequired(false)
                .setValue(selectedChannel.name);

            const positionInput = new TextInputBuilder()
                .setCustomId("position")
                .setLabel("Nouvelle position")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Entrez une nouvelle position")
                .setRequired(false);

            modal.addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(positionInput)
            );

            await interaction.showModal(modal);
            logger.info(`✅ Modal de mise à jour affiché pour le channel ${selectedChannel.name}`);

        } 
        
        else if (interaction.isModalSubmit()) {
            logger.info(`📝 Modal soumis : ${interaction.customId}`);

            const name = interaction.fields.getTextInputValue("name");
            const position = interaction.fields.getTextInputValue("position");

            // Vérifier si on est en train de modifier un channel existant
            if (interaction.customId.startsWith("update-stock-post-")) {
                const channelId = interaction.customId.replace("update-stock-post-", "");
                const updates: { name?: string; channelPosition?: number } = {};

                if (name) updates.name = name;
                if (position && !isNaN(Number(position))) updates.channelPosition = Number(position);

                await channelService.updateDiscordChannel(channelId, updates);
                logger.info(`✅ Channel "${channelId}" mis à jour avec succès !`);

                await interaction.reply({
                    content: `✅ Channel mis à jour avec succès !`,
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            // ✅ Sinon, c'est une création de channel
            const type = interaction.fields.getTextInputValue("type");
            await channelService.createDiscordChannel(name, type, parseInt(position));

            await interaction.reply({
                content: `✅ Channel "${name}" créé avec succès !`,
                flags: MessageFlags.Ephemeral
            });
        }
    } catch (error) {
        logger.error("❌ Erreur lors du traitement de l'interaction add-post :", error);
    }
}

