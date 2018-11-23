import {Collection} from "discord.js";
import {FileSound} from "./FileSound";
import fs = require("fs");

/**
 * Represents a managing repository for FileSounds
 */
export abstract class SoundFileManager {
    /**
     * The cached path to the sound files.
     */
    private static _soundsPath: string;

    /**
     * The cache of sound files loaded in.
     */
    private static _soundFiles = new Collection<string, FileSound>();

    /**
     * Details the types supported by this sound system.
     */
    private static _supportedTypes: Array<string> = [ "mp3", "wav" ];

    /**
     * Initializes the FileSound system with its path and reads in all sound filenames.
     * @param path The path to the sound files.
     */
    public static initialize(path: string) {
        this._soundsPath = path;
        this.readSoundDirectory();
    }

    /**
     * Refreshes the list of sound files.
     */
    public static refresh() {
        if (this._soundsPath === undefined) {
            console.error("Error: Attempting to refresh SoundFileManager before initialization!");
            return;
        }

        this.readSoundDirectory();
    }

    /**
     * Gets a FileSound of a specific name
     * @param name The name of the FileSound to get
     */
    public static getFileSound(name: string): FileSound | undefined {
        if (this._soundFiles.has(name.toLowerCase())) {
            let soundFile = this._soundFiles.get(name.toLowerCase());
            return new FileSound(this._soundsPath, soundFile!.filename);
        }

        return undefined;
    }

    /**
     * Gets a random FileSound from the collection of FileSounds
     */
    public static getRandomFileSound(): FileSound | undefined {
        if (this._soundFiles.size < 1) {
            return undefined;
        }

        return new FileSound(this._soundsPath, this._soundFiles.random()!.filename);
    }

    /**
     * Reads in all sound filenames and caches them
     */
    private static readSoundDirectory() {
        // Reset lists
        this._soundFiles = new Collection<string, FileSound>();

        // Read whole directory for filenames
        let items = fs.readdirSync(this._soundsPath);

        for (let i = 0; i < items.length; i++) {
            let temp = items[i].split(".");
            if (this._supportedTypes.indexOf(temp[temp.length - 1])) {
                this._soundFiles.set(temp[0].toLowerCase(), new FileSound(this._soundsPath, items[i]));
            }
        }
    }
}
