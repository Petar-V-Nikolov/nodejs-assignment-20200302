const { Transform } = require("stream");
const moment = require("moment");

class Aggregator extends Transform {
  constructor(options) {
    super(Object.assign({}, { objectMode: true }, options));
    this.aggregates = [];
    this.ratesData = options.rates;
  }

  _transform(data, encoding, done) {
    const dateFormat = "YYYY-MM-DD HH:mm:ss";
    const start = moment(data.startTime, dateFormat);
    const end = moment(data.endTime, dateFormat);
    const minutes = moment.duration(end.diff(start)).asMinutes();
    let record = this.aggregates.find(
      (record) => record.customerId === data.customerId
    );
    let ratesZone = this.ratesData.find(
      (ratesZone) => ratesZone.zone === data.zone
    );
    if (record) {
      record.totalRides += 1;
      record.durationMinutes += Math.ceil(minutes);
      const price = record.totalPrice + Math.ceil(minutes) * ratesZone.price;
      record.totalPrice = this.precisionRound(price, 2);
    } else {
      const price = Math.ceil(minutes) * ratesZone.price;
      record = {
        customerId: data.customerId,
        totalRides: 1,
        durationMinutes: Math.ceil(minutes),
        totalPrice: this.precisionRound(price, 2),
      };

      this.aggregates.push(record);
    }
    done();
  }
  _flush(done) {
    this.push(this.aggregates);
    done();
  }
  precisionRound = (number, precision) => {
    const factor = Math.pow(10, precision);
    return Math.round((number + Number.EPSILON) * factor) / factor;
  };
}

module.exports = Aggregator;
