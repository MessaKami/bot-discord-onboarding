import {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ChatInputCommandInteraction,
    ChannelType,
    StringSelectMenuInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ModalSubmitInteraction,
    MessageFlags
} from "discord.js";
import { logger } from "../../config/logger";
import { ChannelService } from "../services/channels-service";

export const data = new SlashCommandBuilder()
    .setName("update-post")
    .setDescription("Mettre à jour un channel existant dans la catégorie STOCK");

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        const categoryId = process.env.STOCK_ID;
        if (!categoryId) {
            return interaction.reply({ content: "❌ STOCK_ID non configuré.", flags: MessageFlags.Ephemeral });
        }

        const guildChannels = await interaction.guild?.channels.fetch();
        const channels = guildChannels?.filter(channel =>
            channel?.parentId === categoryId &&
            (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildVoice)
        );

        if (!channels || channels.size === 0) {
            return interaction.reply({ content: "❌ Aucun channel trouvé dans la catégorie STOCK.", flags: MessageFlags.Ephemeral });
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("select-stock-channel-update")
            .setPlaceholder("Sélectionne un channel à modifier")
            .addOptions(
                channels.map(channel => ({
                    label: channel!.name,
                    value: channel!.id
                }))
            );

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
        await interaction.reply({ content: "✏️ Sélectionne un channel à modifier :", components: [row], flags: MessageFlags.Ephemeral });

    } catch (error) {
        logger.error("❌ Erreur lors de la récupération des channels STOCK :", error);
        await interaction.reply({ content: "❌ Une erreur est survenue.", flags: MessageFlags.Ephemeral });
    }
}

export async function handleSelectMenu(interaction: StringSelectMenuInteraction) {
    try {
        if (interaction.customId !== "select-stock-channel-update") return;

        const channelId = interaction.values[0];
        logger.info(`🔄 Modification du channel sélectionné : ${channelId}`);

        const modal = new ModalBuilder()
            .setCustomId(`update-stock-post-${channelId}`)
            .setTitle("Modifier le channel");

        const nameInput = new TextInputBuilder()
            .setCustomId("name")
            .setLabel("Nouveau nom du channel")
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const positionInput = new TextInputBuilder()
            .setCustomId("position")
            .setLabel("Nouvelle position")
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(positionInput)
        );

        await interaction.showModal(modal);
    } catch (error) {
        logger.error("❌ Erreur lors de la sélection du channel pour modification :", error);
    }
}

export async function handleModalSubmit(interaction: ModalSubmitInteraction) {
    try {
        if (!interaction.customId.startsWith("update-stock-post-")) return;

        const channelId = interaction.customId.replace("update-stock-post-", "");
        const name = interaction.fields.getTextInputValue("name");
        const position = interaction.fields.getTextInputValue("position")
            ? parseInt(interaction.fields.getTextInputValue("position"))
            : undefined;

        logger.info(`🔄 Mise à jour du channel ${channelId} avec nom="${name}" position="${position}"`);

        const guild = interaction.guild;
        if (!guild) {
            await interaction.reply({ content: "❌ Impossible de récupérer le serveur.", flags: MessageFlags.Ephemeral });
            return;
        }

        const channelService = new ChannelService(interaction.client, guild);
        await channelService.updateDiscordChannel(channelId, { name, channelPosition: position });

        await interaction.reply({
            content: `✅ Channel mis à jour avec succès !`,
            flags: MessageFlags.Ephemeral
        });
    } catch (error) {
        logger.error("❌ Erreur lors de la mise à jour du channel :", error);
    }
}
