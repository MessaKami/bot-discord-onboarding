import { REST, Routes } from 'discord.js';
import { data as campusCommand } from '../campuses/commands/campus.command';
import dotenv from 'dotenv';
import { logger } from '../config/logger';

dotenv.config();

const commands = [
    campusCommand.toJSON(),
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