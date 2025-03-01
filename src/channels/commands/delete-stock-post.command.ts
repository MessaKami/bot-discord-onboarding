import { 
    ChatInputCommandInteraction, 
    SlashCommandBuilder, 
    ChannelType, 
    GuildChannel,
    TextChannel,
    VoiceChannel
} from "discord.js";
import { logger } from '../../config/logger';

export const data = new SlashCommandBuilder()
    .setName("delete-channel")
    .setDescription("Supprimer un channel du stock")
    .addChannelOption(option =>
        option
            .setName('channel')
            .setDescription('Le channel à supprimer')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice)
    )
    .addBooleanOption(option =>
        option
            .setName('confirm')
            .setDescription('Confirmer la suppression')
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        // Différer la réponse immédiatement
        await interaction.deferReply({ ephemeral: true });

        const channel = interaction.options.getChannel('channel', true);
        const confirmed = interaction.options.getBoolean('confirm', true);
        
        if (!confirmed) {
            await interaction.editReply({
                content: "❌ Suppression annulée."
            });
            return;
        }

        // Vérifier que c'est bien un channel de guild
        if (!(channel instanceof GuildChannel)) {
            await interaction.editReply({
                content: "❌ Ce type de channel ne peut pas être supprimé."
            });
            return;
        }

        // Vérifier que le channel appartient à la catégorie stock
        if (channel.parentId !== process.env.STOCK_ID) {
            await interaction.editReply({
                content: "❌ Ce channel n'appartient pas à la catégorie stock."
            });
            return;
        }

        // Vérifier que c'est un channel texte ou vocal
        if (!(channel instanceof TextChannel) && !(channel instanceof VoiceChannel)) {
            await interaction.editReply({
                content: "❌ Seuls les channels textuels ou vocaux peuvent être supprimés."
            });
            return;
        }

        // Stocker le nom avant la suppression
        const channelName = channel.name;

        try {
            // Supprimer le channel
            await channel.delete(`Supprimé par ${interaction.user.tag}`);

            // Confirmer la suppression
            await interaction.editReply({
                content: `✅ Le channel **${channelName}** a été supprimé avec succès.`
            });
        } catch (deleteError) {
            logger.error(deleteError, "Erreur lors de la suppression du channel");
            await interaction.editReply({
                content: "❌ Une erreur est survenue lors de la suppression du channel."
            });
        }

    } catch (error) {
        logger.error(error, "Erreur lors de la suppression du channel");
        
        if (interaction.deferred) {
            await interaction.editReply({
                content: "❌ Une erreur est survenue lors de la suppression du channel."
            });
        } else {
            await interaction.reply({
                content: "❌ Une erreur est survenue lors de la suppression du channel.",
                ephemeral: true
            });
        }
    }
} 