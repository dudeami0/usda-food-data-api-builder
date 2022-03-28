import mongoose from "mongoose";
/**
 * Finds and links identical json objects based on collections and document
 * hashes.
 */
export declare class DocumentLinker {
    private cache;
    private enabled;
    /**
     * Initializes the cache with the given array of collection names
     *
     * @param names An array of collection names
     * @param enabled Enable the document linker, this will create lar
     */
    constructor(names: string[], enabled?: boolean);
    /**
     * Sorts a JSON Document by index name and hashes the document, giving a
     * normalized hash for the document. Not this may or may not work with
     * nested documents, but it is assumed documents with nested sub-documents
     * tend to be unique.
     *
     * @param data The data to get a hash of
     * @returns A base64 hash of the sorted data
     */
    hash(data: any): number;
    /**
     * Gives the ObjectId for the requested document, or `undefined`.
     *
     * @param collection The collection this document belongs to
     * @param hash A base64 hash for the given document
     * @returns ObjectId of the identical document, or `undefined`
     */
    get(collection: string, hash: number): false | mongoose.Types.ObjectId | undefined;
    /**
     * Puts a given ObjectId for a document into the cache for future reference.
     *
     * @param collection The collection this document belongs to
     * @param hash A base64 hash for the given document
     * @param _id The ObjectId to cache for this document
     */
    put(collection: string, hash: number, _id: mongoose.Types.ObjectId): void;
}
