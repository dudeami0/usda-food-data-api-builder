/**
 * Gives variable access to SchemaTypes of a Schema instead of requiring
 * `eachPath` to be called each time, allowing for async operations that loop
 * these values.
 */
export class SchemaTypeCache {
    constructor() {
        this.cache = {};
    }
    /**
     * Gets a cached array of SchemaType for the Schema with the given `index`,
     * or creates it using the passed `model`
     *
     * @param index Typically the Schema name
     * @param model The Model containing the Schema
     * @returns Array of SchemaType for the given Schema
     */
    get(index, model) {
        if (!this.cache[index]) {
            this.cache[index] = {};
            model.schema.eachPath((pathName, schemaType) => {
                this.cache[index][pathName] = schemaType;
            });
        }
        return this.cache[index];
    }
}
//# sourceMappingURL=SchemaTypeCache.js.map