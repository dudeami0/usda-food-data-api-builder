import options from "./options.js";
export default {
    log,
    write
};
export function log(...args) {
    if (options.verbose) {
        console.log.apply(null, [...arguments]);
    }
}
export function write(data) {
    if (options.verbose) {
        process.stdout.write(data);
    }
}
//# sourceMappingURL=logger.js.map