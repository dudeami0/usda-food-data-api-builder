import mongoose from "mongoose";
/**
 * Queues Documents and nested Documents for batch insertion via
 * `insertMany`
 */
export declare class DocumentBatcher {
    private limit;
    private count;
    private cache;
    private lock;
    /**
     * Configures the DocumentBatcher
     * @param limit The number of root level documents to queue
     */
    constructor(limit?: number);
    /**
     * Queues a document in the given collection for an insertMany operation
     * @param name The collection name
     * @param doc The document to queue for batch insert
     */
    add(name: string, doc: mongoose.Document): void;
    /**
     * Waits for the current save to finish, if saving
     */
    waitForLock(): Promise<void>;
    /**
     * Saves and empties the document queue
     */
    save(): Promise<void>;
    /**
     * Returns if the object batcher is allowing new entries
     * @returns true if allowed, else false
     */
    allow(): boolean;
}
