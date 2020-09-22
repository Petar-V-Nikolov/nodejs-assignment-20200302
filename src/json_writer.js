const { Writable } = require("stream");
const fs = require("fs");
const moment = require("moment");
const log = require("./logging");

class JSONFileWriter extends Writable {
  constructor(options) {
    super(Object.assign({}, { objectMode: true }, options));
    this.objects = [];
    this.prefix = options.prefix;
  }

  writeFile(object) {
    const timestamp = moment().format("YYYYMMDD_HHmmss");
    const fileName = `./${this.prefix}${timestamp}.json`;
    const stream = fs.createWriteStream(fileName);
    stream.write(Buffer.from(JSON.stringify(object, undefined, 2)));
    stream.end();
    log.info(`Created file ${fileName}`);
  }

  _write(data, encoding, done) {
    this.objects.push(data);
    done();
  }

  _final(done) {
    if (this.objects.length === 1) {
      this.writeFile(this.objects[0]);
    } else if (this.objects.length > 1) {
      this.writeFile(this.objects);
    }
    done();
  }
}

module.exports = JSONFileWriter;
