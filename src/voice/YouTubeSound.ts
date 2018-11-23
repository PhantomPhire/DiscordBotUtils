import {Sound} from "./Sound";
import ytdl = require("ytdl-core");
import {YouTube, Video} from "simple-youtube-api";
import {StreamDispatcher, VoiceChannel, VoiceConnection} from "discord.js";

/**
 * Represents a YouTube video to be played as a sound by a discord bot utilizing the discord.js library.
 */
export class YouTubeSound extends Sound {
    /**
     * The YouTube API key to be utilized.
     */
    private static _key: string = "";

    /**
     * The url of the YouTube video to be played
     */
    private _url: string;

    /**
     * Information about the YouTube video to be displayed if requested.
     */
    private _info: string = "";

    /**
     * Contains the YouTube API instance.
     */
    private _yt: YouTube;

    /**
     * Initializes a new instance of the YouTubeSound class.
     * @param url The url of the YouTube video to be played.
     */
    public constructor(url: string) {
        super();

        // Throws error if key is not initialized
        if (YouTubeSound._key === "") {
            throw new Error("YouTube API key not defined!");
        }

        this._url = url;

        this._yt = new YouTube(YouTubeSound._key);
        this._yt.getVideo(url)
        .then( (video: Video) => {
            this._info = video.title;
        })
        .catch(console.error);
    }

    /**
     * Initializes the YouTube API with the API key.
     * @param key The YouTube API key to use.
     */
    public static setKey(key: string) {
        YouTubeSound._key = key;
    }

    /**
     * Starts playback of the YouTube video as a sound.
     * @param channel The voice channel to play the sound on.
     * @param connection The connection to be utlizied for playing audio.
     */
    public play(channel: VoiceChannel, connection: VoiceConnection): Promise<StreamDispatcher> {
        return new Promise( (resolve, reject) => {
            if (connection === undefined)
                reject("Voice connection undefined in YouTubeSound.");
            const stream = ytdl(this._url, { filter: "audioonly" })
            .on("error", (error: Error) => {
                this.emit("error", error, channel);
            });

            this._dispatcher = connection.playStream(stream, {});

            this._dispatcher.once("end", (reason: string) => {
                this.emit("end", reason, channel);
            });

            this._dispatcher.once("error", (error: Error) => {
                this.emit("error", error, channel);
            });

            resolve(this._dispatcher);
        });
    }

    /**
     * Translates YouTube video into a string value to be output.
     */
    public toString(): string {
        return "YouTube Video: " + this._info;
    }
}
