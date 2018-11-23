import {Client} from "discord.js";

/**
 * Allows static access to the application's central discord client
 */
export abstract class ClientAccess {
    /**
     * The Discord bot client to utilize.
     */
    private static _client?: Client = undefined;

    /**
     * Initializes the client instance.
     * @param client The discord.js client to be housed here.
     */
    static initializeClient(client: Client | undefined): void {
        if (client === undefined) {
            ClientAccess._client = new Client();
        }
        else if (ClientAccess._client === undefined) {
            ClientAccess._client = client;
        }
        else {
            console.warn("Warning: Initialize in client.ts called more than once!\n");
        }
    }

    /**
     * Gets the client instance.
     */
    static client(): Client | undefined {
        if (ClientAccess._client === undefined) {
            console.error("Critical: client.ts getClient() called before initialization!\n");
        }

        return ClientAccess._client;
    }
}
