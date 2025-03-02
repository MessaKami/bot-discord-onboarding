import {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ChatInputCommandInteraction,
    ChannelType,
    StringSelectMenuInteraction,
    MessageFlags
} from "discord.js";
import { logger } from "../../config/logger";
import { ChannelService } from "../services/channels-service";

export const data = new SlashCommandBuilder()
    .setName("delete-post")
    .setDescription("Supprime un channel existant dans la catégorie STOCK");

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
            .setCustomId("select-stock-channel-delete")
            .setPlaceholder("Sélectionne un channel à supprimer")
            .addOptions(
                channels.map(channel => ({
                    label: channel!.name,
                    value: channel!.id
                }))
            );

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
        await interaction.reply({ content: "🗑️ Sélectionne un channel à supprimer :", components: [row], flags: MessageFlags.Ephemeral });

    } catch (error) {
        logger.error("❌ Erreur lors de la récupération des channels STOCK :", error);
        await interaction.reply({ content: "❌ Une erreur est survenue.", flags: MessageFlags.Ephemeral });
    }
}

export async function handleDeleteChannel(interaction: StringSelectMenuInteraction) {
    try {
        if (interaction.customId !== "select-stock-channel-delete") return;

        const channelId = interaction.values[0];
        const guild = interaction.guild;
        if (!guild) {
            await interaction.reply({ content: "❌ Impossible de récupérer le serveur.", ephemeral: true });
            return;
        }

        const channelService = new ChannelService(interaction.client, guild);
        await channelService.deleteDiscordChannel(channelId);

        await interaction.reply({
            content: `✅ Channel supprimé avec succès !`,
            ephemeral: true
        });
    } catch (error) {
        logger.error("❌ Erreur lors de la suppression du channel :", error);
    }
}

      