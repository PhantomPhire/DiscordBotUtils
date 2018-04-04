/**
 * Enumerates the different states the GuildVoiceStateManager can be in.
 */
export enum VoiceStatus {
    /**
     * The bot is currently in playback mode in a voice channel of the guild.
     */
    Playing,

    /**
     * The bot is currently in a voice channel of the guild waiting to play.
     */
    Waiting,

    /**
     * The bot is not currently in a voice channel of the guild.
     */
    Disconnected
}