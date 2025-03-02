import { 
    CommandInteraction, 
    GuildMember, 
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    StringSelectMenuOptionBuilder
} from 'discord.js';
import { logger } from '../../config/logger';


const AUTHORIZED_ROLES = ['Administrateur', 'Directeur', 'CDP'];

async function checkUserPermissions(interaction: CommandInteraction): Promise<boolean> {
    const member = interaction.member as GuildMember;
    
    if (!member) {
        logger.error('Membre non trouvé');
        return false;
    }

    const hasRequiredRole = member.roles.cache.some(role => 
        AUTHORIZED_ROLES.includes(role.name)
    );

    if (!hasRequiredRole) {
        await interaction.reply({
            content: '❌ Vous devez être Administrateur, Directeur ou CDP pour supprimer une formation.',
            ephemeral: true
        });
        
        logger.warn({
            userId: member.id,
            userRoles: member.roles.cache.map(r => r.name),
            action: 'delete_course_unauthorized'
        }, 'Tentative de suppression de formation non autorisée');
        
        return false;
    }

    return true;
}

export const data = new SlashCommandBuilder()
    .setName('modify-course')
    .setDescription('Modifier une formation existante');

export async function execute(interaction: CommandInteraction) {
    try {
        if (!await checkUserPermissions(interaction)) {
            return;
        }

        const guild = interaction.guild;
        if (!guild) {
            throw new Error('Guild not found');
        }

        const courses = interaction.guild?.channels.cache
            .filter(channel => 
                channel.parentId === process.env.COURSES_CATEGORY_ID
            );

        if (!courses || courses.size === 0) {
            await interaction.reply({
                content: '❌ Aucune formation disponible à modifier.',
                ephemeral: true
            });
            return;
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('modify-course-select')
            .setPlaceholder('Sélectionner une formation à modifier')
            .addOptions(
                courses.map(course => 
                    new StringSelectMenuOptionBuilder()
                        .setLabel(course.name)
                        .setValue(course.id)
                        .setDescription(`Modifier la formation: ${course.name}`)
                )
            );

        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(selectMenu);

        await interaction.reply({
            content: 'Sélectionnez la formation à modifier :',
            components: [row],
            ephemeral: true
        });

    } catch (error) {
        logger.error(error, 'Erreur lors de la modification de la formation');
        await interaction.reply({
            content: '❌ Une erreur est survenue.',
            ephemeral: true
        });
    }
}