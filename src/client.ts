/*
 * This file gives any module static access to the host Discord bot client.
 */

import {Client} from "discord.js";

/**
 * The Discord bot client to utilize.
 */
let _client: Client | undefined = undefined;

/**
 * Initializes the client instance.
 * @param client The discord.js client to be housed here.
 */
export function initializeClient(client: Client): void {
    if (_client === undefined) {
        _client = client;
    }
    else {
        console.log("Warning: Initialize in client.ts called more than once!\n");
    }
}

/**
 * Gets the client instance.
 */
export function getClient(): Client | undefined {
    if (_client === undefined) {
        console.log("Critical: client.ts getClient() called before initialization!\n");
    }

    return _client;
}
