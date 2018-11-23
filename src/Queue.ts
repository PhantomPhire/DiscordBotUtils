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
    public enqueue(val: T) {
        this._store.push(val);
    }

    /**
     * Removes the value at the front of the Queue and returns it.
     */
    public dequeue(): T | undefined {
        return this._store.shift();
    }

    /**
     * Returns the Queue as an array.
     */
    public toArray(): Array<T> {
        return this._store;
    }

    /**
     * Clears the Queue.
     */
    public clear() {
        this._store = [];
    }

    /**
     * Checks if the Queue is empty.
     */
    public isEmpty(): boolean {
        return this.length < 1;
    }

    /**
     * The current length of the Queue.
     */
    get length() {
        return this._store.length;
    }
}