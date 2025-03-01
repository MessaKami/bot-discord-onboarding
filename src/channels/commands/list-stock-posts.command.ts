import { ChatInputCommandInteraction, SlashCommandBuilder, CategoryChannel, ChannelType, MessageFlags } from "discord.js";
import { logger } from '../../config/logger';

export const data = new SlashCommandBuilder()
    .setName("list-channels")
    .setDescription("Liste tous les channels de la catégorie configurée");

export async function execute(interaction: ChatInputCommandInteraction) {
    const CATEGORY_ID = process.env.STOCK_ID;

    if (!interaction.guild) {
        await interaction.reply({ 
            content: "❌ Cette commande ne peut être utilisée que sur un serveur.",
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    if (!CATEGORY_ID) {
        logger.error('Variable d\'environnement STOCK_ID non définie');
        await interaction.reply({ 
            content: "❌ Erreur de configuration : ID de la catégorie non défini.",
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    try {
        // Récupération de la catégorie par ID
        const category = interaction.guild.channels.cache.get(CATEGORY_ID) as CategoryChannel | undefined;

        if (!category || category.type !== ChannelType.GuildCategory) {
            await interaction.reply({ 
                content: `❌ Catégorie introuvable avec l'ID **${CATEGORY_ID}**.`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Récupération des channels sous cette catégorie
        const channels = interaction.guild.channels.cache.filter(channel => channel.parentId === category.id);

        if (channels.size === 0) {
            await interaction.reply({ 
                content: `📌 Aucun channel trouvé dans la catégorie **${category.name}**.`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Construction du message de réponse
        const channelList = channels.map(channel => `🔹 <#${channel.id}>`).join("\n");

        await interaction.reply({
            content: `📌 **Liste des channels de la catégorie ${category.name}** :\n${channelList}`,
            flags: MessageFlags.Ephemeral
        });

    } catch (error) {
        logger.error(error, "Erreur lors de l'exécution de la commande /list-channels");
        if (!interaction.replied) {
            await interaction.reply({ 
                content: "❌ Une erreur s'est produite.",
                flags: MessageFlags.Ephemeral
            });
        }
    }
}
