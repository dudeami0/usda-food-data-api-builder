import fs from "fs";
import { parse } from "JSONStream";
import mongoose from "mongoose";
import { pipeline } from "stream/promises";
import through from "through";
import { DocumentBatcher } from "./DocumentBatcher.js";
import { DocumentLinker } from "./DocumentLinker.js";
import logger from "./logger.js";
import options from "./options.js";
import { SchemaTypeCache } from "./SchemaTypeCache.js";
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
    /**
     * Configures the DocumentManager
     * @param filepath The file to the USDA Food Data JSON file
     * @param rootKey  The root index of the JSON file that contains an array of documents
     * @param rootSchema The name of the schema to instantiate with the document data
     */
    constructor(config) {
        this.schemaTypeCache = new SchemaTypeCache();
        this.cacheHits = 0;
        this.filepath = config.filepath;
        this.rootKey = config.rootKey;
        this.rootSchema = config.rootSchema;
        const link = options.link;
        this.batcher = new DocumentBatcher(link ? 250 : 50);
        this.linker = new DocumentLinker(mongoose.modelNames(), link);
    }
    /**
     * Parses a USDA Food Data JSON file into MongoDB Documents and saves them
     * to the MongoDB of the default mongoose client.
     */
    async read() {
        let count = 0;
        let modelName = this.rootSchema;
        const me = this;
        const processModel = this.processModel.bind(this);
        const ob = this.batcher;
        await pipeline(fs.createReadStream(this.filepath), parse(this.rootKey + ".*"), through(async function (data) {
            if (options.batch) {
                if (!ob.allow()) {
                    this.pause();
                    await ob.save();
                    this.resume();
                }
                await processModel(data);
            }
            else {
                this.pause();
                await processModel(data);
                this.resume();
            }
            logger.write(`On # ${++count} in collection ${modelName}... ` +
                `(cache hits: ${me.cacheHits})\r`);
        }));
        if (options.batch) {
            await ob.save();
            await ob.waitForLock();
        }
        logger.log(`Finished importing ${count} documents into ${modelName}.` +
            `                    `);
    }
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
    async processModel(data, schema = undefined) {
        const schemaName = schema || this.rootSchema;
        return await this.createModel(data, schemaName);
    }
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
    async createModel(data, schemaName) {
        const root = schemaName == this.rootSchema;
        const hash = root ? 0 : this.linker.hash(data);
        const cached = root ? false : this.linker.get(schemaName, hash);
        if (cached) {
            this.cacheHits++;
            return cached;
        }
        else {
            let doc = await this.buildDocument(data, schemaName);
            if (!root) {
                this.linker.put(schemaName, hash, doc._id);
            }
            return doc; // return the ID,
        }
    }
    async buildDocument(data, schemaName) {
        const inputs = {};
        const model = mongoose.model(schemaName);
        const schemaTypes = this.schemaTypeCache.get(schemaName, model);
        for (let pathName in schemaTypes) {
            const schemaType = schemaTypes[pathName];
            let r;
            if (schemaType instanceof mongoose.Schema.Types.Array) {
                r = await this.processArrayField(data, pathName, schemaType);
            }
            else {
                r = await this.processField(data, pathName, schemaType);
            }
            inputs[pathName] = r;
        }
        const doc = new model(inputs);
        if (options.batch) {
            this.batcher.add(schemaName, doc);
        }
        else {
            await doc.save();
        }
        return doc;
    }
    /**
     * Handles a non-array field in a raw USDA Food Data Document, turning the
     * raw data into a Document if required.
     * @param data
     * @param pathName
     * @param schemaType
     * @returns
     */
    async processField(data, pathName, schemaType) {
        let value = data[pathName];
        if (value !== undefined) {
            return await this.normalizeValue(value, schemaType.instance, schemaType.options.ref);
        }
        else {
            return value;
        }
    }
    /**
     * Handles an array field in a raw USDA Food Data Document, turning the
     * array of raw data into Documents if required.
     *
     * @param data An array of data
     * @param pathName The name of the path in the document
     * @param schemaType The ArraySchema for the given array field
     * @returns An array of normalized values for the given array field
     */
    async processArrayField(data, pathName, schemaType) {
        // An array
        const type = schemaType["$embeddedSchemaType"].instance;
        const schema = schemaType["$embeddedSchemaType"].options.ref;
        const arr = [];
        const children = data[pathName] || [];
        for (let c in children) {
            let child = children[c];
            arr.push(await this.normalizeValue(child, type, schema));
        }
        return arr;
    }
    /**
     * Takes the given `value` and creates a document if a `schema` is passed,
     * otherwise returns the value.
     *
     * @param data The data to normalize
     * @param type The field type in the parent Schema
     * @param schema The Schema to use to instantiate Documents for this data
     * @returns
     */
    async normalizeValue(data, type, schema = "") {
        if (type === "ObjectID") {
            // Gonna need to make a new model, and recursively populate
            return await this.processModel(data, schema);
        }
        else {
            return data;
        }
    }
}
//# sourceMappingURL=DocumentManager.js.map