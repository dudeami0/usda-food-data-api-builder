import mongoose from "mongoose";
/**
 * Gives variable access to SchemaTypes of a Schema instead of requiring
 * `eachPath` to be called each time, allowing for async operations that loop
 * these values.
 */
export declare class SchemaTypeCache {
    private cache;
    /**
     * Gets a cached array of SchemaType for the Schema with the given `index`,
     * or creates it using the passed `model`
     *
     * @param index Typically the Schema name
     * @param model The Model containing the Schema
     * @returns Array of SchemaType for the given Schema
     */
    get(index: string, model: mongoose.Model<unknown, any, any, any>): {
        [key: string]: mongoose.SchemaType;
    };
}
