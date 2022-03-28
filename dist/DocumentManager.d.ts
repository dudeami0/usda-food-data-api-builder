import mongoose from "mongoose";
interface Config {
    filepath: string;
    rootKey: string;
    rootSchema: string;
}
/**
 * DocumentManager is used to stream the large USDA JSON files into a MongoDB
 * database using the `mongoose` package.
 *
 * Usage:
 * ```
 * // Configure the DocumentManager
 * const filename = "usda-foundation-foods.json";
 * const rootKey = "FoundationFoods";
 * const rootSchema = "FoundationFoodItem";
 * const ob = DocumentManager(filename, rootKey, rootSchema);
 *
 * // Use `read()` to perform the MongoDB population
 * await ob.read();
 *
 * // The MongoDB will now be populated
 * ```
 */
export default class DocumentManager {
    private filepath;
    private rootKey;
    private rootSchema;
    private batcher;
    private linker;
    private schemaTypeCache;
    private cacheHits;
    /**
     * Configures the DocumentManager
     * @param filepath The file to the USDA Food Data JSON file
     * @param rootKey  The root index of the JSON file that contains an array of documents
     * @param rootSchema The name of the schema to instantiate with the document data
     */
    constructor(config: Config);
    /**
     * Parses a USDA Food Data JSON file into MongoDB Documents and saves them
     * to the MongoDB of the default mongoose client.
     */
    read(): Promise<void>;
    /**
     * Given a raw document from a USDA Food Data API, determines the schema
     * type from the `type` field, and if missing uses the `rootSchema` passed
     * via constructor
     *
     * @param data The raw document used to populate the Document
     * @param schema The name of the schema, defaults to `rootSchema` passed via
     *               constructor
     * @returns
     */
    private processModel;
    /**
     * Given a raw document from a USDA Food Data API and a Schema name, creates
     * a MongoDB Document using the given `data` and `schemaName`. After
     * creation the document is passed to an `ObjectBatcher` to be later saved
     * to the database.
     *
     * @param data The raw document to use
     * @param schemaName The name of the Schema
     * @returns A MongoDB Document
     */
    createModel(data: {
        [key: string]: any;
    }, schemaName: string): Promise<mongoose.Types.ObjectId | (mongoose.Document<unknown, any, unknown> & {
        _id: mongoose.Types.ObjectId;
    })>;
    buildDocument(data: {
        [key: string]: any;
    }, schemaName: string): Promise<mongoose.Document<unknown, any, unknown> & {
        _id: mongoose.Types.ObjectId;
    }>;
    /**
     * Handles a non-array field in a raw USDA Food Data Document, turning the
     * raw data into a Document if required.
     * @param data
     * @param pathName
     * @param schemaType
     * @returns
     */
    processField(data: any, pathName: string, schemaType: mongoose.SchemaType): Promise<any>;
    /**
     * Handles an array field in a raw USDA Food Data Document, turning the
     * array of raw data into Documents if required.
     *
     * @param data An array of data
     * @param pathName The name of the path in the document
     * @param schemaType The ArraySchema for the given array field
     * @returns An array of normalized values for the given array field
     */
    processArrayField(data: any, pathName: string, schemaType: any): Promise<object[]>;
    /**
     * Takes the given `value` and creates a document if a `schema` is passed,
     * otherwise returns the value.
     *
     * @param data The data to normalize
     * @param type The field type in the parent Schema
     * @param schema The Schema to use to instantiate Documents for this data
     * @returns
     */
    normalizeValue(data: any, type: string, schema?: string): Promise<any>;
}
export {};
