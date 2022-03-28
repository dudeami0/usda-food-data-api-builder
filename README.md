**NOTE: THIS PACKAGE IS UNRELATED TO THE OFFICIAL USDA FOOD DATA API**

# usda-food-data-api-builder

**NOTE: THIS PACKAGE IS UNRELATED TO THE OFFICIAL USDA FOOD DATA API**

Data links references/used by this program provided by:

> U.S. Department of Agriculture, Agricultural Research Service. FoodData
> Central, 2019. [fdc.nal.usda.gov](https://fdc.nal.usda.gov/).

This package is one of three packages with the goal to replicate and host a copy
of the publicly available USDA Food Data API. This package contains the
`builder` portion, which downloads the USDA Food Data API JSON archives and uses
them to populate a MongoDB database.

This document assumes you are using the URLs provided in the
`ts/downloads.ts` file.

## Using the builder

To use the builder, simple provide a `mongodb://` uri when prompted.
The builder expects a nonexistant database to be provided via the uri:

```shell
# npx usda-food-data-api-builder --verbose
Starting usda-food-data-api-builder...
Enter your mongodb:// uri:
```

If you want to skip entering a mongodb uri, simply make the
`./usda-food-data.json` file yourself:

```shell
# echo "{\"mongouri\":\"mongodb://localhost/usda-food-data\"}" > usda-food-data.json
```

For example if we use `mongodb://localhost/usda-food-data`, the program would
import the data into a database called `usda-food-data` on the MongoDB database
hosted on `localhost`:

```shell
# npx usda-food-data-api-builder --verbose
Starting usda-food-data-api-builder...
Enter your mongodb:// uri: mongodb://localhost/usda-food-data
```

The program will save your `mongodb://` url to the current directory in a
`usda-food-data.json` file. It will then proceed to download, unzip, and process the documents from the
JSON files
into the MongoDB database. The count of each document type are as follow:

-   `FoundationFoodItem` has 159 entries
-   `BrandedFoodItem` has 373,897 entries
-   `SRLegacyFoodItem` has 7,793 entries
-   `SurveyFoodItem` has 7,083 entries

### Example output

```shell
# node dist --verbose
Starting usda-food-data-api-builder...
Finished importing 159 documents into FoundationFoodItem.
Finished importing 7793 documents into SRLegacyFoodItem.
Finished importing 7083 documents into SurveyFoodItem.
Finished importing 373897 documents into BrandedFoodItem.
Process completed in 0h 41m 35.55s
```

### Batching

By default, the program will batch saves to the MongoDB providing a minor
performance boost. If you need each document to save without batching, pass the
argument `--no-batch` to the program.

### Linking / Cache hits

By default, the program will attempt to remove duplicate copies of documents.
This speeds up the process, since most of the time is spent having mongoose
normalize documents for insertion. The trade off is the program requires a bit
of memory for the `{ [key: number ]: mongoose.ObjectId] }` data structure. On
the Windows 64-bit machine used to develop this it's about ~1.5GB of memory. See
the Releases section below if you just need the data without needing the memory
requirements.

You can also pass the argument `--no-link`. This is unsupported at the moment,
but it skip the caching step. This will result in a much larger database, as
every JSON object in the USDA Food Data JSON files will be added as a Document.

### Performance

On an AMD FX8120 CPU, the process completes in an hour with default settings.

### Troubleshooting

If you are getting errors while downloading and uncompressing the archives, or
parsing the JSON files, try removing the files in the `data` directory and
redownloading. Please be mindful when downloading archives.

If you are authenticating via the `admin` database, make sure you include
`?authSource=admin` in your `mongodb://` uri, for example:

```
mongodb://user:very_secure_random_password@localhost/usda-food-data?authSource=admin
```

This was written using Node `v16.14.2` and TypeScript `v4.6.2`. Using older
versions may or may not work.

## Releases

Since this process is intensive, releases are provided. Releases correspond to
the data URLs in that version `ts/downloads.ts` file. These releases are just
`mongodump --gzip` backups of the `usda-food-data` database. An example of using
`mongorestore` to restore the database to a MongoDB instance on `localhost`:

```shell
# mongorestore --host=localhost --port=27017 --gzip \
    --archive=usda-food-data-api-linked-v1.0.0.tar.gz
```

## Thanks

Thank you to the USDA and all the authors involved in the dependencies of
this project. Without that work this tool would not exist.
