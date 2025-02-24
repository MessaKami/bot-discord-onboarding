# Normes pour les commits et les pull requests ✍️

Afin de maintenir une cohérence et une clarté dans notre travail collaboratif, nous avons mis en place des normes pour les messages de commit et les pull requests.

## Utilisation de GitFlow

Le projet suit le workflow GitFlow pour la gestion des branches. Voici les principales branches à utiliser :

- `main` : Branche de production, contient le code stable du bot
- `develop` : Branche principale de développement
- `feature/*` : Branches pour les nouvelles fonctionnalités du bot
- `hotfix/*` : Branches pour les corrections urgentes
- `release/*` : Branches pour la préparation des versions

Règles importantes :
- Toute nouvelle fonctionnalité doit partir de `develop` et créer une branche `feature/nom-de-la-feature`
- Les corrections urgentes partent de `main` avec une branche `hotfix/nom-du-fix`
- Les branches `feature` sont fusionnées dans `develop`
- Les `hotfix` sont fusionnés dans `main` ET `develop`

## Messages de commit

Les messages de commit doivent suivre ce format :

    type(portée): titre du commit

### Explication :

**_type_** : Le type de modification, par exemple :
- `feat` : nouvelle commande ou fonctionnalité du bot
- `fix` : correction d'un bug
- `docs` : modification de la documentation
- `refactor` : refactorisation du code
- `test` : ajout ou modification de tests

**_portée_** : Le module du bot concerné (commands, events, services, etc.)

**_titre du commit_**: Une description concise du changement apporté (en anglais)

### Exemple :

```
feat(commands): add welcome command
fix(events): correct member join handling
```

## Body du commit (corps détaillé)

**_Ajouter un body_** : Si le titre du commit n'est pas assez explicite sur la localisation de la modification, le nom du fichier doit être précisé dans le body.

### Exemple :

```
In file "welcome.command.ts" 
```

## Longueur des commits

**_Bonne pratique_** : Respecter une longueur maximale d'environ 50 caractères pour les titres des commits.

## Commits atomiques

**_Commits atomiques_** : Chaque commit doit être atomique, c'est-à-dire qu'il doit se concentrer sur une seule fonctionnalité ou un seul changement du bot.
Un commit par fichier modifié, supprimé ou ajouté au minimum.

## Noms des pull requests

**_Nom en anglais_** : Les titres des pull requests doivent être rédigés en anglais.

## Labels sur les pull requests

**_Ajout de labels_** : Chaque pull request doit inclure un ou plusieurs labels :

![Bot Command](https://img.shields.io/badge/Bot%20Command-blue?style=flat)
![Event Handler](https://img.shields.io/badge/Event%20Handler-green?style=flat)
![Hotfix](https://img.shields.io/badge/Hotfix-red?style=flat)

## Noms de fichiers

**_Nom des fichiers en français_** : Les noms des fichiers doivent être en français.

Utiliser le **kebab-case** pour les fichiers et le **PascalCase** pour les classes :

    commande-bienvenue.ts
    GestionnaireEvenements.ts

## Suivi des changements dans les pull requests

**_Demandes de changements détaillées_** : Les reviewers doivent clairement spécifier les modifications à apporter, particulièrement concernant :
- La logique des commandes du bot
- La gestion des événements Discord
- Les interactions avec l'API
- La sécurité et les permissions

## Processus d'approbation et de fusion des pull requests

**_Approbation requise_** : Une pull request doit être validée par au moins deux membres de l'équipe.

**_Validation technique_** : Les modifications doivent être testées sur un serveur Discord de développement avant la fusion.

**_Responsabilité_** : Le reviewer qui approuve la fusion est responsable de vérifier que :
- Les commandes fonctionnent correctement
- Les événements sont bien gérés
- Les permissions Discord sont correctement configurées
- Le bot reste stable et performant

**_Annulation des approbations_** : Les approbations sont automatiquement révoquées si de nouveaux commits sont poussés, nécessitant une nouvelle revue complète. 