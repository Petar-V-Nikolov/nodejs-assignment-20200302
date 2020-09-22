const SchemaValidator = require("./schema_validator");

describe("SchemaValidator", () => {
  const doneMock = jest.fn();
  let schemaValidator;
  beforeEach(() => {
    doneMock.mockClear();
    schemaValidator = new SchemaValidator();
  });

  it("Should push the result if data is valid", () => {
    const record = {
      customerId: "LA1169",
      startTime: "2018-04-01 06:42:57",
      endTime: "2018-04-01 07:15:50",
      zone: "B",
    };

    const pushSpy = jest.spyOn(schemaValidator, "push");

    schemaValidator._transform(record, "utf-8", doneMock);

    expect(pushSpy).toHaveBeenCalledWith(record);
    expect(doneMock).toHaveBeenCalled();
  });

  it("Should push invalide data in invalidData list", () => {
    const record = {
      customerId: "MV1411",
      startTime: "2018-04-03 01:55:14",
      endTime: "2018-04-03 02:44:05",
      zone: "-",
    };

    schemaValidator._transform(record, "utf-8", doneMock);

    expect(schemaValidator.invalidData).toEqual([
      {
        customerId: "MV1411",
        startTime: "2018-04-03 01:55:14",
        endTime: "2018-04-03 02:44:05",
        zone: "-",
      },
    ]);
    expect(doneMock).toHaveBeenCalled();
  });
});
