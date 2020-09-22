const { Transform } = require("stream");
const Ajv = require("ajv");
const log = require("./logging");

const schema = {
  title: "record",
  type: "object",
  properties: {
    customerId: {
      type: "string",
      pattern: "[A-Z]{2}(.*)[0-9]{4}",
    },
    startTime: {
      type: "string",
      minLength: 19,
      maxLength: 19,
    },
    endTime: {
      type: "string",
      minLength: 19,
      maxLength: 19,
    },
    zone: {
      type: "string",
      pattern: "[ABC]{1}",
    },
  },
  required: ["customerId", "startTime", "endTime", "zone"],
};

class SchemaValidator extends Transform {
  constructor(options) {
    super(Object.assign({}, { objectMode: true }, options));
    this.validate = new Ajv().compile(schema);
    this.invalidData = [];
  }
  _transform(data, encoding, done) {
    const valid = this.validate(data);
    if (valid) {
      this.push(data);
    } else {
      log.error(`Invalid record: ${JSON.stringify(data)}`);
      this.invalidData.push(data);
    }
    done();
  }
  _flush(done) {
    invalidRecords(this.invalidData);
    done();
  }
}

module.exports = SchemaValidator;
