import "source-map-support/register.js";
import db from "usda-food-data-api-schema";
import ArchiveDownloader from "./ArchiveDownloader.js";
import DocumentManager from "./DocumentManager.js";
import downloads from "./downloads.js";
import formatTime from "./formatTime.js";
import logger from "./logger.js";

process.on("SIGINT", async () => {
    await db.shutdown();
    process.exit();
});

/**
 * Entry point for the application.
 */
async function bootstrap() {
    logger.log("Starting usda-food-data-api-builder...");

    const startDate = new Date();

    await db.start();

    try {
        const downloader = new ArchiveDownloader();
        await downloader.init();

        const download = downloader.entry.bind(downloader);
        await Promise.all(Object.entries(downloads).map(download));

        for (let key in downloads) {
            const file = "./data/" + key + ".json";
            const model = key.substring(0, key.length - 1) + "Item";

            await new DocumentManager({
                filepath: file,
                rootKey: key,
                rootSchema: model
            }).read();
        }

        logger.log("Process completed in", formatTime(startDate, new Date()));
    } catch (e) {
        console.error(e);
    }

    await db.shutdown();
}

bootstrap();
