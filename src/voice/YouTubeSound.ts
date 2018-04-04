import {Sound} from "./Sound";
import ytdl = require("ytdl-core");
import {StreamDispatcher, VoiceChannel, VoiceConnection} from "discord.js";

/**
 * Represents a YouTube video to be played as a sound by a discord bot utilizing the discord.js library.
 */
export class YouTubeSound extends Sound {
    /**
     * The url of the YouTube video to be played
     */
    private _url: string;

    /**
     * Information about the YouTube video to be displayed if requested.
     */
    private _info: string;

    /**
     * Initializes a new instance of the YouTubeSound class.
     * @param url The url of the YouTube video to be played.
     * @param info Information about the YouTube video to be displayed if requested.
     */
    public constructor(url: string, info: string) {
        super();

        this._url = url;
        this._info = info;
        this._dispatcher = undefined;
    }

    /**
     * Starts playback of the YouTube video as a sound.
     * @param connection The connection to be utlizied for playing audio.
     */
    public Play(connection: VoiceConnection): Promise<StreamDispatcher> {
        return new Promise( (resolve, reject) => {
            if (connection === undefined)
                reject("Voice connection undefined in YouTubeSound.");
            const stream = ytdl(this._url, { filter: "audioonly" })
            .on("error", (error: Error) => {
                this.emit("error", error);
            });

            this._dispatcher = connection.playStream(stream, {});

            this._dispatcher.once("end", (reason: string) => {
                this.emit("end", reason);
            });

            this._dispatcher.once("error", (error: Error) => {
                this.emit("error", error);
            });

            resolve(this._dispatcher);
        });
    }

    /**
     * Translates YouTube video into a string value to be output.
     */
    public ToString(): string {
        return "YouTube Video: " + this._info;
    }
}