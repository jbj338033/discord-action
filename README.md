# Discord Action

Send GitHub Actions workflow status to Discord with beautiful embeds.

![Discord Notification Example](https://user-images.githubusercontent.com/github-actions/discord-notification.png)

## Usage

```yaml
- name: Discord Notification
  uses: jbj338033/discord-action@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
    language: en # Optional: en, ko, ja (default: en)
```

## Features

- Simple setup with minimal configuration
- Beautiful Discord embeds with workflow status
- Multi-language support (English, Korean, Japanese)
- Repository, workflow, branch, and commit information
- Status-based colors and emojis
- Direct links to GitHub

## Setup

1. Create a webhook in your Discord server:

   - Server Settings > Integrations > Webhooks > New Webhook
   - Copy the webhook URL

2. Add the webhook URL as a secret in your GitHub repository:

   - Repository Settings > Secrets > Actions > New repository secret
   - Name: `DISCORD_WEBHOOK`
   - Value: Your webhook URL

3. Add the action to your workflow:

   ```yaml
   name: Build

   on:
     push:
       branches: [main]

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3

         # Your build steps here

         - name: Discord Notification
           uses: jbj338033/discord-action@v1
           with:
             webhook: ${{ secrets.DISCORD_WEBHOOK }}
   ```

## Available Languages

- `en` - English (default)
- `ko` - Korean (한국어)
- `ja` - Japanese (日本語)

## License

MIT
