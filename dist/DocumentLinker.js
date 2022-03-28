import adler from "adler-32";
import stringify from "json-stable-stringify";
/**
 * Finds and links identical json objects based on collections and document
 * hashes.
 */
export class DocumentLinker {
    /**
     * Initializes the cache with the given array of collection names
     *
     * @param names An array of collection names
     * @param enabled Enable the document linker, this will create lar
     */
    constructor(names, enabled = true) {
        this.cache = {};
        this.enabled = enabled;
        if (this.enabled) {
            names.forEach((name) => {
                this.cache[name] = new Map();
            });
        }
    }
    /**
     * Sorts a JSON Document by index name and hashes the document, giving a
     * normalized hash for the document. Not this may or may not work with
     * nested documents, but it is assumed documents with nested sub-documents
     * tend to be unique.
     *
     * @param data The data to get a hash of
     * @returns A base64 hash of the sorted data
     */
    hash(data) {
        if (this.enabled) {
            return adler.str(stringify(data));
        }
        return 0;
    }
    /**
     * Gives the ObjectId for the requested document, or `undefined`.
     *
     * @param collection The collection this document belongs to
     * @param hash A base64 hash for the given document
     * @returns ObjectId of the identical document, or `undefined`
     */
    get(collection, hash) {
        return hash && this.enabled ? this.cache[collection].get(hash) : false;
    }
    /**
     * Puts a given ObjectId for a document into the cache for future reference.
     *
     * @param collection The collection this document belongs to
     * @param hash A base64 hash for the given document
     * @param _id The ObjectId to cache for this document
     */
    put(collection, hash, _id) {
        if (hash && this.enabled) {
            this.cache[collection].set(hash, _id);
        }
    }
}
//# sourceMappingURL=DocumentLinker.js.map