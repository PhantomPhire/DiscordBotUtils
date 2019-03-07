import {Sound} from "./Sound";
import {StreamDispatcher, VoiceChannel, VoiceConnection} from "discord.js";

/**
 * Represents a file to be played as a sound by a discord bot utilizing the discord.js library.
 */
export class FileSound extends Sound {
    /**
     * The path to the file's directory.
     */
    private _path: string;

    /**
     * The name of the file to be played.
     */
    private _filename: string;

    /**
     * Initializes a new instance of the FileSound class.
     * @param path The path to the directory of the file to play.
     * @param filename The name of the file to play.
     */
    public constructor(path: string, filename: string) {
        super();

        this._path = path;
        this._filename = filename;
    }

    /**
     * Starts playback of the file as a sound.
     * @param channel The voice channel to play the sound on.
     * @param connection The connection to be utlizied for playing audio.
     */
    public play(channel: VoiceChannel, connection: VoiceConnection): Promise<StreamDispatcher> {
        return new Promise( (resolve, reject) => {
            if (connection === undefined)
                reject("Voice connection undefined in FileSound.");

            this._dispatcher = connection.playFile(this._path + "/" + this._filename);

            this._dispatcher.once("end", (reason: string) => {
                this.emit("end", reason, channel);
            });

            this._dispatcher.once("error", (error: Error) => {
                console.error("Error in FileSound.play: " + error);
                this.emit("error", error, channel);
            });

            resolve(this._dispatcher);
        });
    }

    /**
     * Translates the FileSound into a descriptor of the file.
     */
    public toString(): string {
        return "File Sound: " + this._filename;
    }

    /**
     * Gets the FileSound's filename
     */
    public get filename(): string {
        return this._filename;
    }
}
