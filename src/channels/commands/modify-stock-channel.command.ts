import { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ChatInputCommandInteraction, 
    ChannelType, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ModalSubmitInteraction, 
    StringSelectMenuInteraction, 
    MessageFlags
} from "discord.js";
import { logger } from "../../config/logger";
import { ChannelService } from "../services/channels-service";

export const data = new SlashCommandBuilder()
    .setName("update-post")
    .setDescription("Mettre à jour un channel existant dans la catégorie STOCK");

export async function execute(interaction: ChatInputCommandInteraction | StringSelectMenuInteraction | ModalSubmitInteraction) {
    try {
        if (interaction.isChatInputCommand()) {
            const categoryId = process.env.STOCK_ID;
            if (!categoryId) {
                return interaction.reply({ content: "❌ STOCK_ID non configuré.", flags: MessageFlags.Ephemeral });
            }

            if (!interaction.guild) {
                return interaction.reply({ content: "❌ Impossible de récupérer le serveur.", flags: MessageFlags.Ephemeral });
            }

            const guildChannels = await interaction.guild.channels.fetch();
            const channels = guildChannels.filter(channel => 
                channel?.parentId === categoryId && 
                (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildVoice)
            );

            if (!channels || channels.size === 0) {
                return interaction.reply({ content: "❌ Aucun channel trouvé dans la catégorie STOCK.", flags: MessageFlags.Ephemeral });
            }

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId("select-stock-channel")
                .setPlaceholder("Sélectionne un channel à modifier")
                .addOptions(
                    channels.map(channel => ({
                        label: channel!.name,
                        value: channel!.id
                    }))
                );

            const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

            await interaction.reply({ content: "📌 Sélectionne un channel à modifier :", components: [row], flags: MessageFlags.Ephemeral });
        } 
        
        else if (interaction.isStringSelectMenu()) {
            const channelId = interaction.values[0];

            const selectedChannel = await interaction.guild?.channels.fetch(channelId);
            if (!selectedChannel) {
                return interaction.reply({ content: "❌ Impossible de récupérer le channel sélectionné.", flags: MessageFlags.Ephemeral });
            }

            // ✅ Création du modal de mise à jour avec les valeurs actuelles du channel
            const modal = new ModalBuilder()
                .setCustomId(`update-stock-post-${channelId}`)
                .setTitle("Mettre à jour le channel");

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
        
        else if (interaction.isModalSubmit() && interaction.customId.startsWith("update-stock-post-")) {
            const channelId = interaction.customId.replace("update-stock-post-", "");

            const name = interaction.fields.getTextInputValue("name");
            const position = interaction.fields.getTextInputValue("position");

            const updates: { name?: string; channelPosition?: number } = {};
            if (name) updates.name = name;
            if (position && !isNaN(Number(position))) updates.channelPosition = Number(position);

            const channelService = new ChannelService(interaction.client, interaction.guild!);
            await channelService.updateDiscordChannel(channelId, updates);

            logger.info(`✅ Channel ${channelId} mis à jour sur Discord et en base de données.`);
            await interaction.reply({ content: `✅ Channel "${name}" mis à jour avec succès !`, flags: MessageFlags.Ephemeral });
        }

    } catch (error) {
        logger.error("❌ Erreur lors de la mise à jour du channel :", error);
        await interaction.reply({ content: "❌ Une erreur est survenue lors de la mise à jour du channel.", flags: MessageFlags.Ephemeral });
    }
}


      