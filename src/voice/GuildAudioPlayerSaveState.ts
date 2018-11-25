/**
 * Contains elements of a ServedGuild to be saved and persist across run times.
 */
export class GuildAudioPlayerSaveState {
    /**
     * The id of the guild.
     */
    public Id: string;

    /**
     * If true, the bot will join and play sounds upon them being added to queue and will leave channel after playing.
     */
    public JoinAndPlay: boolean;

    /**
     * The id of the VoiceChannel to bind to.
     */
    public BoundVoiceChannelId?: string;

    /**
     * The id of the TextChannel to bind to.
     */
    public FeedbackChannelId?: string;

    /**
     * Initializes a new instance of the ServedGuildSaveState class.
     * @param id The id of the guild.
     * @param joinAndPlay The guild's current state with respect to join and play.
     * @param boundVoiceChannelId The id of the VoiceChannel to bind to.
     * @param feedbackChannelId The id of the TextChannel to bind to.
     */
    constructor(id: string, joinAndPlay: boolean, boundVoiceChannelId?: string, feedbackChannelId?: string) {
        this.Id = id;
        this.JoinAndPlay = joinAndPlay;
        this.BoundVoiceChannelId = boundVoiceChannelId;
        this.FeedbackChannelId = feedbackChannelId;
    }
}