import {VoiceChannel, VoiceConnection} from "discord.js";
import {VoiceStatus} from "./EVoiceStatus";
import {Sound} from "./Sound";
import {EventEmitter} from "events";

/**
 * Defines the musical note emoji.
 * @constant
 */
const musicalEmoji = " :musical_note: ";

/**
 * Manages the sound playback state of a guild.
 */
export class GuildVoiceStateManager extends EventEmitter {
    /**
     * The bot's current playback state in the guild.
     */
    private _status: VoiceStatus;

    /**
     * The voice channel the bot is currently in.
     */
    private _voiceChannel?: VoiceChannel;

    /**
     * The sound that is currently being played.
     */
    private _currentSound?: Sound;

    /**
     * The current VoiceConnection being utilized.
     */
    private _connection?: VoiceConnection;

    /**
     * Initializes a new instance of the GuildVoiceStateManager class.
     */
    constructor() {
        super();
        this._status = VoiceStatus.Disconnected;
    }

    /**
     * Begins playback of a Sound.
     * @param sound The Sound to be played.
     * @returns Returns a promise containing feedback based on the result of the play.
     */
    public play(sound: Sound): Promise<string> {
        return new Promise( (resolve, reject) => {
            if (this.connection === undefined || this._voiceChannel === undefined)
                reject("No voice connection");

            sound.play(this._voiceChannel!, this.connection!);
            this.currentSound = sound;
            this.assignSoundListeners(this.currentSound);
            resolve("Now playing" + musicalEmoji + sound.toString() + musicalEmoji);
        });
    }

    /**
     * Stops playback.
     * @returns Returns a promise containing feedback based on the result of the stop.
     */
    public stop(): Promise<string> {
        return new Promise( (resolve, reject) => {
            if (this.connection === undefined)
                reject("No voice connection");

            if (this._currentSound === undefined)
                reject("Not currently playing");

            this._currentSound!.stop();
            resolve("Successfully stopped playing.");
        });
    }

    /**
     * Joins a voice channel.
     * @param channel The voice channel to join.
     * @returns Returns a promise containing feedback based on the result of the join.
     */
    public join(channel: VoiceChannel): Promise<string> {
        return new Promise( (resolve, reject) => {
            this._voiceChannel = channel;
            this._voiceChannel.join()
            .then( (connection) => {
                connection.on("disconnect", (error: Error) => { this.connection = undefined; });
                this.connection = connection;
                resolve("Successfully joined " + channel.toString());
            }).catch( (err) => {
                reject("Could not join channel. Error: " + err);
            });
        });
    }

    /**
     * Leaves a voice channel, if connected to one.
     * @returns Returns a promise containing feedback based on the result of the leave.
     */
    public leave(): Promise<string> {
        return new Promise( (resolve, reject) => {
            if (this._voiceChannel === undefined) {
                reject("No voice connection");
            }

            this._voiceChannel!.leave();
            this._voiceChannel = undefined;
            resolve("Successfully left voice channel.");
        });
    }

    /**
     * Sets up event listeners for "end" and "error" events for a sound.
     * @param sound The sound to setup listeners for.
     */
    private assignSoundListeners(sound: Sound) {
        sound.once("end", (reason: string, channel: VoiceChannel) => {
            console.log("Stream end reason: " + reason);
            this.currentSound = undefined;
            this.emit("next");
        });
        sound.once("error", (error: Error, channel: VoiceChannel) => {
            console.error("Error in GuildVoiceStateManager.assignSoundListeners: " + error);
            this.currentSound = undefined;
            this.emit("error", error);
        });
    }

    /**
     * Evaluates the current state of the manager.
     */
    private evaluateStatus() {
        if (this.connection === undefined) {
            this._status = VoiceStatus.Disconnected;
            return;
        }

        if (this.currentSound === undefined)
            this._status = VoiceStatus.Waiting;
        else
            this._status = VoiceStatus.Playing;
    }

    /**
     * The current status of the GuildVoiceStateManager.
     */
    get status(): VoiceStatus {
        return this._status;
    }

    /**
     * The voice channel of the guild the bot is currently connected to.
     */
    get voiceChannel(): VoiceChannel | undefined {
        return this._voiceChannel;
    }

    set voiceChannel(value) {
        this._voiceChannel = value;
    }

    /**
     * The current sound being played.
     */
    private get currentSound(): Sound | undefined {
        return this._currentSound;
    }

    private set currentSound(value) {
        this._currentSound = value;
        this.evaluateStatus();
    }

    /**
     * The current VoiceConnection being utilized.
     */
    private get connection(): VoiceConnection | undefined {
        if (this._connection === undefined) {
            this._currentSound = undefined;
        }

        return this._connection;
    }

    private set connection(value) {
        this._connection = value;
        this.evaluateStatus();
    }
}