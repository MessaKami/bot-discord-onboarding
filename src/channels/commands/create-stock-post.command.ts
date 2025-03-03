import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ModalSubmitInteraction,
    ChannelType, 
    MessageFlags
} from "discord.js";
import { logger } from "../../config/logger";
import { ChannelService } from "../services/channels-service";

export const data = new SlashCommandBuilder()
    .setName("add-post")
    .setDescription("Créer un nouveau channel dans la catégorie stock");

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        const modal = new ModalBuilder()
            .setCustomId("create-stock-post")
            .setTitle("Créer un nouveau channel");

        const nameInput = new TextInputBuilder()
            .setCustomId("name")
            .setLabel("Nom du channel")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const typeChoice = new TextInputBuilder()
            .setCustomId("type")
            .setLabel("Type de channel (text/voice)")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const positionInput = new TextInputBuilder()
            .setCustomId("position")
            .setLabel("Position du channel")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(typeChoice),
            new ActionRowBuilder<TextInputBuilder>().addComponents(positionInput)
        );

        logger.info("✅ Tentative d'affichage du modal...");
        await interaction.showModal(modal);
        logger.info("✅ Modal affiché avec succès !");
    } catch (error) {
        logger.error("❌ Erreur lors de l'affichage du modal add-post :", error);
    }
}

export async function handleModalSubmit(interaction: ModalSubmitInteraction) {
    try {
        logger.info(`📝 Modal soumis : ${interaction.customId}`);
        const name = interaction.fields.getTextInputValue("name");
        const type = interaction.fields.getTextInputValue("type");
        const position = parseInt(interaction.fields.getTextInputValue("position"));

        const guild = interaction.guild;
        if (!guild) {
            await interaction.reply({ content: "❌ Impossible de récupérer le serveur.", flags: MessageFlags.Ephemeral });
            return;
        }

        const channelService = new ChannelService(interaction.client, guild);
        const newChannel = await channelService.createDiscordChannel(name, type, position);

        await interaction.reply({
            content: `✅ Channel "${name}" créé avec succès !`,
            flags: MessageFlags.Ephemeral
        });
    } catch (error) {
        logger.error("❌ Erreur lors du traitement du modal add-post :", error);
    }
}
