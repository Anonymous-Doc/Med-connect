
import { DiscordSDK } from "https://cdn.jsdelivr.net/npm/@discord/embedded-app-sdk@1.2.0/+esm";

const DISCORD_CLIENT_ID = "1445380149330841621";

async function initDiscord() {
    try {
        const discordSdk = new DiscordSDK(DISCORD_CLIENT_ID);
        await discordSdk.ready();
        console.log("Discord SDK is ready");

        // Google Analytics: Track Discord Activity Source
        if (typeof window.gtag === 'function') {
            // Send a custom event to log the Discord entry
            window.gtag('event', 'discord_activity_start', {
                'event_category': 'Source',
                'event_label': 'Discord Embedded App',
                'transport_type': 'beacon'
            });

            // Set campaign parameters for this session context
            window.gtag('set', {
                'campaign_source': 'discord',
                'campaign_medium': 'activity'
            });
        }

    } catch (e) {
        // This usually happens if running outside of Discord (e.g. regular browser)
        console.debug("Discord SDK not detected or failed to initialize.", e);
    }
}

initDiscord();
