import {Client, Guild, TextChannel, VoiceChannel, VoiceConnection} from "discord.js";
import {Sound} from "./Sound";
import {GuildVoiceStateManager} from "./GuildVoiceStateManager";
import {VoiceStatus} from "./EVoiceStatus";
import {Queue} from "../Queue";
import {ServedGuildSaveState} from "./ServedGuildSaveState";
import {getClient} from "../client";
import fs = require("fs");

/**
 * Defines the musical note emoji.
 * @constant
 */
const musicalEmoji = " :musical_note: ";

/**
 * Represents a Discord guild being served by a Discord bot.
 */
export class ServedGuild {
    /**
     * A static map of all guilds being served by this bot.
     */
    private static guildMap: Map<string, ServedGuild> = new Map();

    /**
     * The id of the guild this instance represents
     */
    private _id: string;

    /**
     * Manages the internal voice state of the ServedGuild.
     */
    private _manager: GuildVoiceStateManager;

    /**
     * The instance's sound queue.
     */
    private _queue: Queue<Sound>;

    /**
     * Defines the voice channel of the guild the bot is bound to.
     */
    private _boundVoiceChannel?: VoiceChannel;

    /**
     * Defines the text channel of the guild the bot is bound to.
     */
    private _feedbackChannel?: TextChannel;

    /**
     * Initializes a new instance of the ServedGuild class.
     * @param id The id of the guild being served.
     */
    constructor(id: string) {
        this._id = id;
        this._manager = new GuildVoiceStateManager();
        this._queue = new Queue<Sound>();
        this._manager.on("next", () => { this.next(); });
    }

    /**
     * Gets a ServedGuild instance from the guild map.
     * @param id
     */
    public static GetServerdGuild(id: string): ServedGuild {
        if (!ServedGuild.guildMap.has(id)) {
            ServedGuild.guildMap.set(id, new ServedGuild(id));
        }

        return ServedGuild.guildMap.get(id)!;
    }

    /**
     * Loads a saved guild state. This is utilized to save guild info between run times.
     * @param state The state to load into the ServedGuild.
     */
    public static LoadSaveState(state: ServedGuildSaveState) {
        if (!ServedGuild.guildMap.has(state.Id)) {
            let sGuild = new ServedGuild(state.Id);
            if (state.BoundVoiceChannelId !== undefined)
                sGuild.BoundVoiceChannel = getClient()!.channels.get(state.BoundVoiceChannelId) as VoiceChannel;
            if (state.FeedbackChannelId !== undefined)
                sGuild.FeedbackChannel = getClient()!.channels.get(state.FeedbackChannelId) as TextChannel;
            ServedGuild.guildMap.set(state.Id, sGuild);
        }
    }

    /**
     * Adds a sound to the play queue.
     * @param sound The sound to be added.
     */
    public Add(sound: Sound) {
        this._queue.Enqueue(sound);
        this.sendFeedback("Added" + musicalEmoji  + sound.toString() + musicalEmoji + " for playback");
    }

    /**
     * Removes the next sound in the play queue.
     */
    public RemoveNext() {
        if (this._queue.IsEmpty()) {
            this.sendFeedback("Nothing in playlist");
            return;
        }

        let sound = this._queue.Dequeue();
        this.sendFeedback("Successfully removed" + musicalEmoji + sound!.ToString() + musicalEmoji);
    }

    /**
     * Clears the play queue.
     */
    public Clear() {
        this._queue.Clear();
    }

    /**
     * Starts playback of the next sound in the play queue.
     * Will not play if there is no voice channel specified or joined.
     */
    public Play() {
        if (this._manager.Status === VoiceStatus.Playing) {
            this.sendFeedback("Already playing");
            return;
        }
        if (this._queue.IsEmpty()) {
            this.sendFeedback("Nothing in playlist");
            return;
        }

        let sound = this._queue.Dequeue();

        if (this._manager.Status === VoiceStatus.Disconnected) {
            if (this._boundVoiceChannel === undefined) {
                this.sendFeedback("No voice channel to bind to");
                return;
            }

            this._manager.Join(this._boundVoiceChannel!)
            .then( (joinMessage) => {
                console.log(joinMessage);
                this._manager.Play(sound!)
                .then( (playMessage) => {
                    this.sendFeedback(playMessage);
                }).catch( (reason: string) => { this.sendFeedback(reason); });
            }).catch( (reason: string) => { this.sendFeedback(reason); });
        }

        else {
            this._manager.Play(sound!)
            .then( (playMessage) => {
                this.sendFeedback(playMessage);
            }).catch( (reason: string) => { this.sendFeedback(reason); });
        }
    }

    /**
     * Skips the sound currently being played and plays the next in queue.
     */
    public Skip() {
        if (this._queue.IsEmpty()) {
            this.Stop();
            return;
        }

        this._manager.Stop()
        .catch( (reason: string) => { this.sendFeedback(reason); });
    }

    /**
     * Stops sound playback.
     */
    public Stop() {
        this._manager.Stop()
        .then( (message) => {
            this.sendFeedback("Playback stopped");
        }).catch( (reason: string) => { this.sendFeedback(reason); });
    }

    /**
     * Joins a voice channel and sets it as the bound channel.
     * @param channel The voice channel to join.
     */
    public Join(channel: VoiceChannel) {
        if (channel === this._manager.VoiceChannel) {
            this.sendFeedback("Already there");
            return;
        }

        this.BoundVoiceChannel = channel;
        this._manager.Join(this._boundVoiceChannel!)
        .then( (joinMessage) => {
            this.sendFeedback("Joined " + channel.ToString() + " and set as bound voice channel");
        }).catch( (reason: string) => { this.sendFeedback(reason); });
    }

    /**
     * Leaves the current voice channel.
     */
    public Leave() {
        if (this._manager.VoiceChannel === undefined) {
            this.sendFeedback("Not in a channel");
            return;
        }

        let channel = this._manager.VoiceChannel;
        this._manager.Leave().catch(console.error);
        this.sendFeedback("Left " + channel!.ToString());
    }

    /**
     * Gets a string representation of all members in queue.
     */
    public GetQueue(): string {
        let info = "The following sounds are in the queue:";
        let queueMembers = this._queue.ToArray();

        for (let i = 0; i < queueMembers.length; i++) {
            info += "\n\n" + (i + 1) + ". " + queueMembers[i].ToString();
        }

        return info;
    }

    /**
     * Plays the next song in the play queue or leaves the channel if queue is empty.
     */
    private next() {
        if (this._queue.IsEmpty()) {
            this.Leave();
            return;
        }

        let sound = this._queue.Dequeue();
        this._manager.Play(sound!)
        .then( (playMessage) => {
            this.sendFeedback(playMessage);
        }).catch( (err) => {
            console.error(err);
            this.sendFeedback("Someone dun goofed");
        });
    }

    /**
     * Sends text feedback to the bound TextChannel, if available.
     * @param feedback The message to send.
     */
    private sendFeedback(feedback: string) {
        if (this._feedbackChannel !== undefined)
            this._feedbackChannel.send(feedback);
    }

    /**
     * Saves the current state of the guild to be referenced across run times.
     */
    private saveState() {
        let guildArr = new Array<ServedGuildSaveState>();

        ServedGuild.guildMap.forEach( (value, key, map) => {
            let boundVoiceChannelId, feedbackChannelId;
            if (value.BoundVoiceChannel !== undefined)
                boundVoiceChannelId = value.BoundVoiceChannel.id;
            if (value.FeedbackChannel !== undefined)
                feedbackChannelId = value.FeedbackChannel.id;

            let sGuildSave = new ServedGuildSaveState(value.Id, boundVoiceChannelId, feedbackChannelId);
            guildArr.push(sGuildSave);
        });

        fs.writeFile(__dirname + "/guildMap.json", JSON.stringify(guildArr), {encoding: "utf8"}, (err: Error) => { if (err) throw err; });
    }

    /**
     * The id of the guild.
     */
    get Id(): string {
        return this._id;
    }

    /**
     * The voice channel of the guild the bot is bound to.
     */
    get BoundVoiceChannel(): VoiceChannel | undefined {
        return this._boundVoiceChannel;
    }

    set BoundVoiceChannel(value) {
        this._boundVoiceChannel = value;
        if (ServedGuild.guildMap.has(this._id))
            this.saveState();
    }

    /**
     * The text channel of the guild the bot is bound to.
     */
    get FeedbackChannel(): TextChannel | undefined {
        return this._feedbackChannel;
    }

    set FeedbackChannel(value) {
        this._feedbackChannel = value;
        if (ServedGuild.guildMap.has(this._id))
            this.saveState();
    }
}

/**
 * Loads all saved guild states from memory.
 */
export function loadState() {
    if (fs.existsSync(__dirname + "/guildMap.json")) {
        let file = fs.readFileSync(__dirname + "/guildMap.json");
        let guilds = JSON.parse(file.toString()) as ServedGuildSaveState[];

        for (let i = 0; i < guilds.length; i++) {
            ServedGuild.LoadSaveState(guilds[i]);
        }
    }
}