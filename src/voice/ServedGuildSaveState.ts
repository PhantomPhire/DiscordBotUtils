/**
 * Contains elements of a ServedGuild to be saved and persist across run times.
 */
export class ServedGuildSaveState {
    /**
     * The id of the guild.
     */
    public Id: string;

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
     * @param boundVoiceChannelId The id of the VoiceChannel to bind to.
     * @param feedbackChannelId The id of the TextChannel to bind to.
     */
    constructor(id: string, boundVoiceChannelId?: string, feedbackChannelId?: string) {
        this.Id = id;
        this.BoundVoiceChannelId = boundVoiceChannelId;
        this.FeedbackChannelId = feedbackChannelId;
    }
}