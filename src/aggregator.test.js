const Aggregator = require("./aggregator");
let aggregator;
const zonesMock = [
  {
    zone: "A",
    price: 0.2,
    currency: "USD",
  },
  {
    zone: "B",
    price: 0.3,
    currency: "USD",
  },
  {
    zone: "C",
    price: 0.4,
    currency: "USD",
  },
];

describe("Aggregator", () => {
  beforeEach(() => {
    aggregator = new Aggregator({ rates: zonesMock });
  });

  it("Should pass through correct format", () => {
    const doneMock = jest.fn();
    const record = {
      customerId: "LA1169",
      startTime: "2018-04-01 06:42:57",
      endTime: "2018-04-01 07:15:50",
      zone: "B",
    };

    aggregator._transform(record, "utf-8", doneMock);
    expect(aggregator.aggregates).toEqual([
      {
        customerId: "LA1169",
        totalRides: 1,
        durationMinutes: 33,
        totalPrice: 9.9,
      },
    ]);

    expect(doneMock).toHaveBeenCalled();
  });

  it("Should aggregate values on existing record", () => {
    const doneMock = jest.fn();
    aggregator.aggregates = [
      {
        customerId: "LX1703",
        totalRides: 1,
        durationMinutes: 33,
        totalPrice: 9.9,
      },
    ];
    const record = {
      customerId: "LX1703",
      startTime: "2018-04-02 16:36:00",
      endTime: "2018-04-02 17:04:16",
      zone: "B",
    };

    aggregator._transform(record, "utf-8", doneMock);
    expect(aggregator.aggregates).toEqual([
      {
        customerId: "LX1703",
        totalRides: 2,
        durationMinutes: 62,
        totalPrice: 18.6,
      },
    ]);

    expect(doneMock).toHaveBeenCalled();
  });

  it("precisionRound() should round a number to a specific number of decimal places", () => {
    const number = 26.799999999999997;
    const precision = 2;

    expect(aggregator.precisionRound(number, precision)).toEqual(26.8);
  });
});
