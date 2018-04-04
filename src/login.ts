import {Client} from "discord.js";

/**
 * The Discord bot client to utilize.
 */
let bot: Client;

/**
 * The Discord bot's login token.
 */
let token: string;

/**
 * Initializes the module with the bot client and begins the login process.
 * @param client The Discord bot client to utilize.
 * @param tokenIn The Discord bot's login token.
 */
export function initializeLogin(client: Client, tokenIn: string) {
    token = tokenIn;
    bot = client;
    bot.on("disconnect", waitThenLogin);
    bot.on("WaitAttempt", waitThenLogin);
    bot.on("attemptLogin", attemptLogin);
    attemptLogin();
}

/**
 * Attempts to login to Discord. Upon failing, sets a timer to try again in ten seconds.
 */
function attemptLogin() {
    console.log("attempting login");
    bot.login(token).catch((err: Error) => {
        console.log("Login Failed");
        console.log(err);
    });

    setTimeout(() => {
        if (bot.status === 5 || bot.status === 3) {
            console.log("login attempt timed out");
            console.log("Status: " + bot.status);
            bot.emit("attemptLogin");
        }
        else if (bot.status !== 0) {
            console.log("Status: " + bot.status + "\nStill waiting");
            bot.emit("WaitAttempt");
        }
        else {
            console.log("login successful");
        }
    },         10000);
}

/**
 * Sets a timer to retry a login if it fails, or continue waiting if login is still in progress.
 */
function waitThenLogin() {
    setTimeout(() => {
        if (bot.status === 5 || bot.status === 3) {
            console.log("Waited, status: " + bot.status);
            attemptLogin();
        }
        else if (bot.status !== 0) {
            console.log("Status: " + bot.status + "\nStill waiting");
            bot.emit("WaitAttempt");
        }
    },         10000);
}