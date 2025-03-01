import { SlashCommandBuilder, ChatInputCommandInteraction, ChannelType, TextChannel, VoiceChannel, MessageFlags } from "discord.js";
import { ChannelService } from "../services/channels-service";
import { logger } from "../../config/logger";

export const data = new SlashCommandBuilder()
    .setName("delete-post")
    .setDescription("Supprime un channel existant dans la catégorie STOCK")
    .addChannelOption(option => 
        option.setName("channel")
            .setDescription("Le channel à supprimer")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        const channel = interaction.options.getChannel("channel", true);

        // ✅ Vérification du type de channel avant d'accéder à parentId
        if (!(channel instanceof TextChannel || channel instanceof VoiceChannel)) {
            return interaction.reply({ content: "❌ Seuls les channels texte et vocaux peuvent être supprimés.", flags: MessageFlags.Ephemeral });
        }

        // ✅ Vérifier si le channel est bien dans la catégorie STOCK
        if (channel.parentId !== process.env.STOCK_ID) {
            return interaction.reply({ content: "❌ Ce channel ne fait pas partie de la catégorie STOCK.", flags: MessageFlags.Ephemeral });
        }

        const channelService = new ChannelService(interaction.client, interaction.guild!);
        await interaction.reply({ content: `🗑️ Suppression du channel **${channel.name}**...`, flags: MessageFlags.Ephemeral });

        await channelService.deleteDiscordChannel(channel.id);

        await interaction.editReply({ content: `✅ Channel **${channel.name}** supprimé avec succès !` });

    } catch (error) {
        logger.error("❌ Erreur lors de la suppression du channel :", error);
        await interaction.editReply({ content: "❌ Une erreur est survenue lors de la suppression du channel." });
    }
}

