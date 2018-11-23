import {StreamDispatcher, VoiceConnection, VoiceChannel} from "discord.js";
import {EventEmitter} from "events";

/**
 * Represents a sound to be played by a discord bot utilizing the discord.js library.
 */
export abstract class Sound extends EventEmitter {
    /**
     * Contains the StreamDispatcher of the Sound's playback once playback begins.
     */
    protected _dispatcher?: StreamDispatcher;

    /**
     * Initializes a new instance of the Sound class.
     */
    public constructor() {
        super();

        this._dispatcher = undefined;
    }

    /**
     * Starts playback of the sound.
     * @param channel The voice channel to play the sound on.
     * @param connection The connection to be utlizied for playing audio.
     */
    public abstract play(channel: VoiceChannel, connection: VoiceConnection): Promise<StreamDispatcher>;

    /**
     * Ceases playback of the sound.
     */
    public stop(): void {
        if (this._dispatcher !== undefined) {
            this._dispatcher.end("requested");
        }
    }

    /**
     * Translates sound into a string value to be output.
     */
    public abstract toString(): string;
}