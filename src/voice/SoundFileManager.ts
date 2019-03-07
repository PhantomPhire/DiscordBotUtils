import {Collection} from "discord.js";
import {FileSound} from "./FileSound";
import {NameResolution} from "../NameResolution";
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
    private static _supportedTypes: Map<string, string>;

    /**
     * Initializes the FileSound system with its path and reads in all sound filenames.
     * @param path The path to the sound files.
     */
    public static initialize(path: string) {
        this._soundsPath = path;
        this.initializeSupportedTypes();
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
        this._soundFiles.forEach((value: FileSound, key: string, map: Map<string, FileSound>) => {
            if (NameResolution.compareNames(name.toLowerCase(), key)) {
                return value;
            }
        });

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
     * Returns true if a file type is supported
     * @param file The name of the file
     */
    public static fileIsSupported(file: string): boolean {
        let temp = file.split(".");
        if (this._supportedTypes.has(temp[temp.length - 1].toLowerCase())) {
            return true;
        }

        return false;
    }

    /**
     * Gets the path to the sound file repository specified in configuration
     */
    public static soundPath(): string {
        return this._soundsPath;
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
            if (this._supportedTypes.has(temp[temp.length - 1].toLowerCase())) {
                this._soundFiles.set(temp[0].toLowerCase(), new FileSound(this._soundsPath, items[i]));
            }
            else {
                console.log("Usupported file type " + temp[temp.length - 1] + " found in SoundFileManager");
            }
        }
    }

    /**
     * Initializes the set of supported file types
     */
    private static initializeSupportedTypes() {
        this._supportedTypes = new Map<string, string>();
        this._supportedTypes.set("mp3", "mp3");
        this._supportedTypes.set("wav", "wav");
    }
}
