import { constants, createReadStream, createWriteStream } from "fs";
import fs from "fs/promises";
import fetch from "node-fetch";
import stream from "stream";
import { pipeline } from "stream/promises";
import { Parse } from "unzip-stream";
import logger from "./logger.js";

/**
 * Used to download archives with a single JSON document as the contents,
 * and extract the JSON document
 */
export default class ArchiveDownloader {
    /**
     * Downloads missing USDA Food Data JSON archives to `./data/`
     * @param name
     * @param url
     * @returns
     */
    private async downloadArchive(name: string, url: string) {
        const zipFile = "./data/" + name + ".zip";
        try {
            await fs.access(zipFile, constants.F_OK);
        } catch (e) {
            logger.log("Downloading " + zipFile + ", please wait...");
            const res = await fetch(url);
            if (res.ok && res.body !== null) {
                await pipeline(res.body, createWriteStream(zipFile));
            } else {
                throw new Error(
                    "Unable to download " + name + ".zip: " + res.statusText
                );
            }
        }
        return zipFile;
    }

    /**
     * Extracts the given `zipFile` to `name`.json, if it doesn't exist
     * @param name
     * @param zipFile
     */
    private async unzipArchive(name: string, zipFile: string) {
        const jsonFile = "./data/" + name + ".json";
        try {
            await fs.access(jsonFile, constants.F_OK);
        } catch (e) {
            const unzip = Parse();
            const rs = createReadStream(zipFile);
            await pipeline(
                rs,
                unzip,
                new stream.Transform({
                    objectMode: true,
                    transform: function (entry, e, cb) {
                        entry
                            .pipe(createWriteStream(jsonFile))
                            .on("finish", cb);
                    }
                })
            );
        }
    }

    /**
     * Initializes the `./data/` folder, if it's missing
     */
    async init() {
        try {
            await fs.access("./data", constants.F_OK);
        } catch (e) {
            fs.mkdir("./data");
        }
    }

    /**
     * Downloads the given USDA Food Data JSON archive to the `data/` directory,
     * then unzips the JSON file contained.
     *
     * @param name File name of the archive/JSON files produced.
     * @param url The URL of the USDA Food Data JSON archive to download
     */
    async get(name: string, url: string) {
        const zipFile = await this.downloadArchive(name, url);
        await this.unzipArchive(name, zipFile);
    }

    /**
     * Downloads the given USDA Food Data JSON archive to the `data/` directory,
     * then unzips the JSON file contained.
     *
     * @param name File name of the archive/JSON files produced.
     * @param url The URL of the USDA Food Data JSON archive to download
     */
    async entry(data: [string, string]) {
        await this.get(data[0], data[1]);
    }
}
