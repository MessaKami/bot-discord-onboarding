import { REST, Routes } from 'discord.js';
import { data as createCampusCommand } from '../campuses/commands/create-campus.command';
import { data as modifyCampusCommand } from '../campuses/commands/modify-campus.command';
import { data as deleteCampusCommand } from '../campuses/commands/delete-campus.command';
import { data as showCampusFormCommand } from '../campuses/commands/show-campus-form.command';
import { data as setupIdentificationCommand } from '../identification_requests/commands/setupIdentificationButton';
import dotenv from 'dotenv';
import { logger } from '../config/logger';

dotenv.config();

const commands = [
    createCampusCommand.toJSON(),
    modifyCampusCommand.toJSON(),
    deleteCampusCommand.toJSON(),
    showCampusFormCommand.toJSON(),
    setupIdentificationCommand.toJSON(),
];

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN!);

async function deployCommands() {
    try {
        logger.info('Début du déploiement des commandes slash...');

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID!,
                process.env.GUILD_ID!
            ),
            { body: commands }
        );

        logger.info('✅ Commandes slash déployées avec succès !');
    } catch (error) {
        logger.error(error, 'Erreur lors du déploiement des commandes slash');
    }
}

deployCommands(); 