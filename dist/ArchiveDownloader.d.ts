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
    private downloadArchive;
    /**
     * Extracts the given `zipFile` to `name`.json, if it doesn't exist
     * @param name
     * @param zipFile
     */
    private unzipArchive;
    /**
     * Initializes the `./data/` folder, if it's missing
     */
    init(): Promise<void>;
    /**
     * Downloads the given USDA Food Data JSON archive to the `data/` directory,
     * then unzips the JSON file contained.
     *
     * @param name File name of the archive/JSON files produced.
     * @param url The URL of the USDA Food Data JSON archive to download
     */
    get(name: string, url: string): Promise<void>;
    /**
     * Downloads the given USDA Food Data JSON archive to the `data/` directory,
     * then unzips the JSON file contained.
     *
     * @param name File name of the archive/JSON files produced.
     * @param url The URL of the USDA Food Data JSON archive to download
     */
    entry(data: [string, string]): Promise<void>;
}
