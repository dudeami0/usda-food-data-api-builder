import mongoose from "mongoose";

/**
 * Internal Cache structure
 */
interface Cache {
    [key: string]: {
        [key: string]: mongoose.SchemaType;
    };
}

/**
 * Gives variable access to SchemaTypes of a Schema instead of requiring
 * `eachPath` to be called each time, allowing for async operations that loop
 * these values.
 */
export class SchemaTypeCache {
    private cache: Cache = {};

    /**
     * Gets a cached array of SchemaType for the Schema with the given `index`,
     * or creates it using the passed `model`
     *
     * @param index Typically the Schema name
     * @param model The Model containing the Schema
     * @returns Array of SchemaType for the given Schema
     */
    get(index: string, model: mongoose.Model<unknown, any, any, any>) {
        if (!this.cache[index]) {
            this.cache[index] = {};
            model.schema.eachPath((pathName, schemaType) => {
                this.cache[index][pathName] = schemaType;
            });
        }
        return this.cache[index];
    }
}
