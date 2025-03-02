import { SlashCommandBuilder, CommandInteraction, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } from 'discord.js';
import { logger } from '../../config/logger';

interface Campus {
    uuidCampus: string;
    name: string;
    uuidGuild: string;
    createdAt: Date;
    updatedAt: Date;
    uuidRole: string;
}

export const data = new SlashCommandBuilder()
    .setName('create-promo')
    .setDescription('Créer une nouvelle promotion')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: CommandInteraction) {
    try {
        // Vérification des permissions
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply({
                content: "❌ Vous n'avez pas les permissions nécessaires pour créer une promotion.",
                ephemeral: true
            });
            return;
        }

        // Création de l'embed pour la sélection du campus
        const embed = new EmbedBuilder()
            .setTitle('🎓 Création d\'une promotion - Étape 1/4')
            .setDescription('Sélectionnez le campus auquel sera rattachée la promotion.')
            .setColor('#FF0000')
            .setFooter({ text: 'Étape 1: Sélection du campus' });

        // Récupération des campus depuis l'API
        const response = await fetch(`${process.env.API_URL || 'http://localhost:3000'}/campuses`);
        if (!response.ok) {
            throw new Error('Impossible de récupérer la liste des campus');
        }

        const responseData = await response.json();
        logger.debug({ responseData }, 'Données reçues de l\'API');

        // Vérification de la structure des données
        if (!responseData || !Array.isArray(responseData.data)) {
            throw new Error('Format de données invalide reçu de l\'API');
        }

        const campuses = responseData.data;
        
        if (campuses.length === 0) {
            await interaction.reply({
                content: '❌ Aucun campus n\'est disponible. Veuillez d\'abord créer un campus.',
                ephemeral: true
            });
            return;
        }

        // Validation et transformation des données
        const validCampuses = campuses.filter((campus: any): campus is Campus => 
            campus && 
            typeof campus === 'object' && 
            'uuidCampus' in campus &&
            'name' in campus && 
            typeof campus.name === 'string' &&
            typeof campus.uuidCampus === 'string'
        );

        if (validCampuses.length === 0) {
            throw new Error('Aucun campus valide trouvé dans les données');
        }

        logger.debug({ validCampuses }, 'Campus valides trouvés');

        // Création du menu de sélection des campus
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select-campus-for-promo')
            .setPlaceholder('Sélectionnez un campus');

        // Création des options avec validation
        const options = validCampuses.map((campus: Campus) => ({
            label: String(campus.name).slice(0, 100), // Limite de 100 caractères pour le label
            value: String(campus.uuidCampus), // Conversion explicite en string
            description: `Campus de ${String(campus.name).slice(0, 50)}` // Limite de 50 caractères pour la description
        }));

        selectMenu.addOptions(options);

        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(selectMenu);

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });

        logger.info({
            user: interaction.user.tag,
            command: 'create-promo',
            campusCount: validCampuses.length
        }, 'Début du processus de création de promotion');
    } catch (error) {
        logger.error(error, 'Erreur lors du lancement du processus de création de promotion');
        await interaction.reply({
            content: '❌ Une erreur est survenue lors de l\'initialisation du processus de création.',
            ephemeral: true
        });
    }
} 