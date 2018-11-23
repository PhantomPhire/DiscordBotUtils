import {Client} from "discord.js";

/**
 * Defines the name of the event for attempting a new login
 * @constant
 */
const attemptLoginEvent = "attemptLogin";

/**
 * Defines the name of the event for waiting then eventually attempting a new login
 * @constant
 */
const waitLoginEvent = "waitLogin";

export class LoginManager {
    /**
     * The Discord bot client to utilize.
     */
    private _client: Client;

    /**
     * The Discord bot's login token.
     */
    private _token: string;

    /**
     * Begins the login proces
     * @param client The Discord bot client to utilize.
     * @param tokenIn The Discord bot's login token.
     */
    public constructor(client: Client, token: string) {
        this._token = token;
        this._client = client;
        this._client.on("disconnect", this.waitThenLogin);
        this._client.on(waitLoginEvent, this.waitThenLogin);
        this._client.on(attemptLoginEvent, this.attemptLogin);
        this.attemptLogin();
    }

    /**
     * Attempts to login to Discord. Upon failing, sets a timer to try again in ten seconds.
     */
    private attemptLogin() {
        console.log("attempting login");
        this._client.login(this._token).catch((err: Error) => {
            console.error("Login Failed");
            console.error(err);
        });

        // Wait 10 seconds thne assess status
        setTimeout(() => {
            if (this._client.status === 5 || this._client.status === 3) {
                console.log("login attempt timed out");
                console.log("Status: " + this._client.status);
                this._client.emit(attemptLoginEvent);
            }
            else if (this._client.status !== 0) {
                console.log("Status: " + this._client.status + "\nStill waiting");
                this._client.emit(waitLoginEvent);
            }
            else {
                console.log("login successful");
            }
        },         10000);
    }

    /**
     * Sets a timer to retry a login if it fails, or continue waiting if login is still in progress.
     */
    private waitThenLogin() {
        // Wait 10 more seconds then assess status
        setTimeout(() => {
            if (this._client.status === 5 || this._client.status === 3) {
                console.log("Waited, status: " + this._client.status);
                this.attemptLogin();
            }
            else if (this._client.status !== 0) {
                console.log("Status: " + this._client.status + "\nStill waiting");
                this._client.emit(waitLoginEvent);
            }
        },         10000);
    }
}
