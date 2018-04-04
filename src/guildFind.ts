/*
 * This module contains utility search functions for finding specific objects within a guild.
 */

import {Guild, GuildMember, GuildChannel, VoiceChannel} from "discord.js";
import {CommandMessage} from "discord.js-commando";

/**
 * Finds a specific GuildMember by their username.
 * @param input The username of the GuildMember.
 * @param guild The guild to search.
 */
export function findMemberUsername(input: string, guild: Guild): GuildMember | undefined {
    return guild.members.find( (member: GuildMember) => member.user.username.toLowerCase() === input.toLowerCase());
}

/**
 * Finds a specific GuildMember by their display name.
 * @param input The display name of the GuildMember.
 * @param guild The guild to search.
 */
export function findMemberDisplayName(input: string, guild: Guild): GuildMember | undefined {
    return guild.members.find( (member: GuildMember) => member.displayName.toLowerCase() === input.toLowerCase());
}

/**
 * Finds a specific GuildMember by their username or display name, if possible.
 * @param input The name to search for.
 * @param guild The guild to search.
 */
export function findMemberName(input: string, guild: Guild): GuildMember | undefined {
    let result = findMemberUsername(input, guild);

    if (result != undefined) {
        return result;
    }

    // Redundant in cases where user does not have nickname, but covers all bases
    return findMemberDisplayName(input, guild);
}

/**
 * Finds the first GuildMember with the search string in their username.
 * @param input The string to search for.
 * @param guild The guild to search.
 */
export function findMemberUsernamePartial(input: string, guild: Guild): GuildMember | undefined {
    return guild.members.find( (member: GuildMember) => member.user.username.toLowerCase().indexOf(input.toLowerCase()) > -1);
}

/**
 * Finds the first GuildMember with the search string in their display name.
 * @param input The string to search for.
 * @param guild The guild to search.
 */
export function findMemberDisplayNamePartial(input: string, guild: Guild): GuildMember | undefined {
    return guild.members.find( (member: GuildMember) => member.displayName.toLowerCase().indexOf(input.toLowerCase()) > -1);
}

/**
 * Finds the first GuildMember with the search string in their username or display name, if possible.
 * @param input The string to search for.
 * @param guild The guild to search.
 */
export function findMemberNamePartial(input: string, guild: Guild): GuildMember | undefined {
    let result = findMemberUsernamePartial(input, guild);

    if (result != undefined) {
        return result;
    }

    // Redundant in cases where user does not have nickname, but covers all bases
    return findMemberDisplayNamePartial(input, guild);
}

/**
 * Finds a specific VoiceChannel by its name.
 * @param input The name of the VoiceChannel.
 * @param guild The guild to search.
 */
export function findVoiceChannel(input: string, guild: Guild): VoiceChannel | undefined {
    return guild.channels.find( (channel: GuildChannel) => (channel.name.toLowerCase() === input) && (channel.type === "voice")) as VoiceChannel;
}

/**
 * Finds the first VoiceChannel with the search string in its name.
 * @param input The string to search for.
 * @param guild The guild to search.
 */
export function findVoiceChannelPartial(input: string, guild: Guild): VoiceChannel | undefined {
    return guild.channels.find( (channel: GuildChannel) => (channel.name.toLowerCase().indexOf(input.toLowerCase()) > -1 && (channel.type === "voice"))) as VoiceChannel;
}

/**
 * Finds a VoiceChannel based on args from a CommandMessage.
 * @param msg The CommandMessage to reference.
 * @param args The args to parse. Priority is given to mentions, if any. Otherwise each arg is parsed for a
 *             potential VoiceChannel name or partial name. If that fails, then the arg is parsed for a
 *             GuildMember name. If found, and that GuildMember is connected to a VoiceChannel, then that
 *             channel is used.
 */
export function findChannel(msg: CommandMessage, args?: string[]): VoiceChannel | undefined {
    if (msg.channel.type !== "text")
        return undefined;

    if (args != undefined) {
        if (msg.mentions.users.first() != undefined) {
            msg.mentions.members.forEach((value, key, map) => {
                if (value.voiceChannel != null)
                    return value.voiceChannel;
            });
        }

        for (let i = 0; i < args.length; i++) {
            let chan = findVoiceChannelPartial(args[i], msg.guild);
            if (chan != undefined)
                return chan;

            let mem = findMemberNamePartial(args[i], msg.guild);
            if (mem != undefined)
                if (mem.voiceChannel != undefined)
                    return mem!.voiceChannel;
        }
    }

    return msg.member.voiceChannel;
}
