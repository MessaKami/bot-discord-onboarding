import pino from 'pino';

export const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
        },
    },
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});

// Exemples d'utilisation:
// logger.info('Le bot démarre');
// logger.error({ err }, 'Une erreur est survenue');
// logger.debug('Debugging information');
// logger.warn('Attention !'); 