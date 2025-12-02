
// Initialize Discord Activity
(async () => {
    if (window.Discord) {
        try {
            const discordSdk = new window.Discord.DiscordSDK("1445380149330841621");
            await discordSdk.ready();
            console.log("Discord SDK is ready");
            
            // Optional: Authorize to get user info
            // const { code } = await discordSdk.commands.authorize({
            //    client_id: "1445380149330841621",
            //    response_type: "code",
            //    state: "",
            //    prompt: "none",
            //    scope: ["identify", "guilds"]
            // });
        } catch (e) {
            console.error("Discord SDK Initialization Error:", e);
        }
    }
})();
