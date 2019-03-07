import {Guild, GuildMember, GuildChannel, VoiceChannel} from "discord.js";
import {CommandMessage} from "discord.js-commando";

/**
 * Indicates the percentage threshold that two strings must be within one another to pass the Levenshtein test.
 * @constant
 */
const levenshteinThreshold = 0.3;

/**
 * Contains helper functions for resolving an input string into discord objects
 */
export abstract class NameResolution {
    /**
     * Resolves user input to a GuildMember object. Applicable only internally to guilds
     * @param input The string user input
     * @param guild The guild from which the input originated
     */
    public static stringToGuildMember(input: string, guild: Guild | undefined | null): GuildMember | undefined {
        if (input == null || guild == null) {
            return undefined;
        }

        // Make input lowercase for ease of user input
        let inputLower = input.toLowerCase();

        // First, try parsing it as an user ID
        if (guild.members.has(input)) {
            return guild.members.get(inputLower);
        }

        // If not, let's look at the guild's users to try and find a match
        let result: GuildMember | undefined = guild.members.find( (member: GuildMember) => NameResolution.compareNames(inputLower, member.user.username.toLowerCase()));
        if (result !== undefined) {
            return result;
        }

        // This is done in two different iterations so that users cannot abuse nicknames to obfuscate the results
        // of these commands
        result = guild.members.find( (member: GuildMember) => NameResolution.compareNames(inputLower, member.displayName.toLowerCase()));

        return result;
    }

    /**
     * Extracts a voice channel from a command mesage
     * @param input The string user input
     * @param guild The guild from which the input originated
     * @param message The commando message to utilize for context
     */
    public static commandMessageToVoiceChannel(input: string, message: CommandMessage, guild: Guild | undefined): VoiceChannel | undefined {
        let result: VoiceChannel | undefined = undefined;

        // Test mentions first
        if (message.mentions.members.size >= 0) {
            let member = message.mentions.members.find( (member: GuildMember) => member.voiceChannel != undefined);

            if (member != undefined) {
                result = member.voiceChannel;
            }
        }
        // See if string resolves to a guild member
        if (result == undefined) {
            let guildMember = this.stringToGuildMember(input, guild);
            if (guildMember != undefined) {
                result = guildMember.voiceChannel;
            }
        }

        // Next, test input for voice channels
        result = NameResolution.stringToVoiceChannel(input, message.guild);

        // Last, if all else fails, see if poster is in voice channel
        if (result == undefined) {
            result = message.member.voiceChannel;
        }

        return result;
    }

    /**
     * Resolves user input to a VoiceChannel object. Applicable only internally to guilds
     * @param input The string user input
     * @param guild The guild from which the input originated
     */
    public static stringToVoiceChannel(input: string, guild: Guild | undefined | null): VoiceChannel | undefined {
        if (input == null || guild == null) {
            return undefined;
        }

        // Make input lowercase for ease of user input
        let inputLower = input.toLowerCase();

        let result: VoiceChannel | undefined = guild.channels.find( (channel: GuildChannel) => this.compareNames(inputLower, channel.name)
                                                                                               && (channel.type === "voice")) as VoiceChannel;

        return result;
    }

    /**
     * Compares two names and returns the result
     * @param first The first name in the comparison
     * @param second The second name in the comparison
     */
    public static compareNames(first: string, second: string): boolean {
        return (first === second ||
                NameResolution.testLevenshteinDistance(first, second) ||
                second.startsWith(first));
    }

    /**
     * Compares two strings to each other on the basis of Levenshtein distance and returns the result
     * @param first The first name in the comparison
     * @param second The second name in the comparison
     */
    private static testLevenshteinDistance(first: string, second: string): boolean {
        let distance = NameResolution.computeLevenshteinDistance(first, second);

        return (distance / second.length) < levenshteinThreshold;
    }

    /**
     * Compares two strings to each other on the basis of Levenshtein distance and returns the result
     * @param first The first name in the comparison
     * @param second The second name in the comparison
     */
    private static computeLevenshteinDistance(first: string, second: string): number {
        let n = first.length;
        let m = second.length;
        let d: Array<Array<number>> = [];
        for (let i = 0; i <= Math.max(n, m); i++) {
            d[i] = [];
        }

        if (n === 0)
            return m;

        if (m == 0)
            return n;

        for (let i = 0; i <= n; d[i][0] = i++) { }
        for (let j = 0; j <= m; d[0][j] = j++) { }

        for (let i = 1; i <= n; i++) {
            for (let j = 1; j <= m; j++) {
                let cost = (second[j - 1] == first[i - 1]) ? 0 : 1;

                d[i][j] = Math.min(
                    Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1),
                    d[i - 1][j - 1] + cost);
            }
        }

        return d[n][m];
    }
}
