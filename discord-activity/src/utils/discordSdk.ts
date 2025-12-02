import { DiscordSDK } from "@discord/embedded-app-sdk";

const DISCORD_CLIENT_ID = "1445380149330841621";

export const discordSdk = new DiscordSDK(DISCORD_CLIENT_ID);

export async function setupDiscordSdk() {
  await discordSdk.ready();
  
  // Authorize with Discord Client
  const { code } = await discordSdk.commands.authorize({
    client_id: DISCORD_CLIENT_ID,
    response_type: "code",
    state: "",
    prompt: "none",
    scope: [
      "identify",
      "guilds",
    ],
  });

  // Retrieve an access_token from your activity's server
  // Note: In a real backend app, you would exchange the code for a token.
  // For a static client-only demo, we proceed with the auth code flow initiated.
  // We can authenticate partially or mock for UI demo.
  
  return code;
}