const SchemaValidator = require("./schema_validator");
const JSONFileWriter = require("./json_writer");
const Aggregator = require("./aggregator");
const log = require("./logging");

const https = require("https");
const fs = require("fs");
const csv = require("fast-csv");

const RATES_FILE_URL = "https://s3.eu-north-1.amazonaws.com/lemon-1/rate.json";
const CSV_FILE_NAME = "scooter_1337.csv";
const CSV_FILE_URL =
  "https://s3.eu-north-1.amazonaws.com/lemon-1/scooter_1337.csv";

log.info("Running ...");

https
  .get(RATES_FILE_URL, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      try {
        let ratesData = JSON.parse(data);
        createOutput(ratesData);
      } catch (err) {
        log.error(err.message);
      }
    });
  })
  .on("error", (err) => {
    log.error(err.message);
  });

createOutput = (ratesData) => {
  https
    .get(CSV_FILE_URL, (res) =>
      res.pipe(fs.createWriteStream(CSV_FILE_NAME, "utf8"))
    )
    .on("error", (err) => {
      log.error(err.message);
    });

  const fileReadStream = fs.createReadStream(`./${CSV_FILE_NAME}`, "utf8");
  const csvParser = csv({ headers: true, trim: true });

  fileReadStream
    .pipe(csvParser)
    .pipe(new SchemaValidator())
    .pipe(new Aggregator({ rates: ratesData }))
    .pipe(new JSONFileWriter({ prefix: "output_" }));
};

const errorLog = new JSONFileWriter({ prefix: "error_" });

invalidRecords = (data) => {
  errorLog.writeFile(data);
};
