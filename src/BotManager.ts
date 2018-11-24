import {ClientAccess} from "./ClientAccess";
import {LoginManager} from "./LoginManager";
import {CommandoClient} from "discord.js-commando";

/**
 * A wrapper for the Discord bot
 */
export abstract class BotManager {
    /**
     * The bot itself
     */
    protected _bot: CommandoClient;

    /**
     * The login manager for keeping the bot online.
     */
    private _loginManager?: LoginManager;

    /**
     * Initializes a new instance of the BotManager class.
     * @param bot The bot to wrap.
     */
    constructor(bot: CommandoClient) {
        this._bot = bot;
        ClientAccess.initializeClient(this._bot);
    }

    /**
     * Executes the running for the bot.
     * @param token The token to login with
     */
    public run(token: string) {
        this._loginManager = new LoginManager(this._bot, token);
    }
}