/**
 * Represents a FIFO queue data structure.
 */
export class Queue<T> {
    /**
     * An array that contains the members of the Queue.
     */
    private _store: Array<T>;

    /**
     * Initializes a new Queue.
     */
    constructor() {
        this._store = [];
    }

    /**
     * Appends a new value to the end of the Queue.
     * @param val The value to appends.
     */
    public Enqueue(val: T) {
        this._store.push(val);
    }

    /**
     * Removes the value at the front of the Queue and returns it.
     */
    public Dequeue(): T | undefined {
        return this._store.shift();
    }

    /**
     * Returns the Queue as an array.
     */
    public ToArray(): Array<T> {
        return this._store;
    }

    /**
     * Clears the Queue.
     */
    public Clear() {
        this._store = [];
    }

    /**
     * Checks if the Queue is empty.
     */
    public IsEmpty(): boolean {
        return this.Length < 1;
    }

    /**
     * The current length of the Queue.
     */
    get Length() {
        return this._store.length;
    }
}