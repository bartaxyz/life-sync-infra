import { Request, Response } from "express";
import { lifeSync } from "./index";

// Mock @google-cloud/storage
jest.mock("@google-cloud/storage", () => {
  const mockSave = jest.fn().mockResolvedValue(undefined);
  const mockFile = jest.fn(() => ({ save: mockSave }));
  const mockBucket = jest.fn(() => ({ file: mockFile }));
  return {
    Storage: jest.fn(() => ({ bucket: mockBucket })),
  };
});

const mockSave = () => {
  const { Storage } = require("@google-cloud/storage");
  return Storage().bucket("").file("").save;
};

function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    method: "POST",
    headers: { "x-apple-id": "test@apple.id" },
    body: {
      type: "location",
      data: { timestamp: 1700000000, source: "iOS", lat: 50.0, lng: 14.0 },
    },
    ...overrides,
  } as unknown as Request;
}

function makeRes(): Response {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.ALLOWED_APPLE_ID = "test@apple.id";
});

describe("lifeSync", () => {
  it("returns 405 for non-POST requests", async () => {
    const req = makeReq({ method: "GET" });
    const res = makeRes();
    await lifeSync(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("returns 401 when Apple ID header is missing", async () => {
    const req = makeReq({ headers: {} });
    const res = makeRes();
    await lifeSync(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 403 for an invalid Apple ID", async () => {
    const req = makeReq({ headers: { "x-apple-id": "other@apple.id" } });
    const res = makeRes();
    await lifeSync(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("returns 400 for an invalid request body", async () => {
    const req = makeReq({ body: { type: "unknown", data: {} } });
    const res = makeRes();
    await lifeSync(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 when data is missing required fields", async () => {
    const req = makeReq({ body: { type: "location", data: { lat: 50.0 } } });
    const res = makeRes();
    await lifeSync(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("saves data to GCS and returns 200 on success", async () => {
    const req = makeReq();
    const res = makeRes();
    await lifeSync(req, res);
    expect(mockSave()).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("saves to the correct file based on data type", async () => {
    const req = makeReq({ body: { type: "sleep", data: { timestamp: 1700000000, source: "watchOS" } } });
    const res = makeRes();
    await lifeSync(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const { Storage } = require("@google-cloud/storage");
    expect(Storage().bucket("").file).toHaveBeenCalledWith("sleep.json");
  });

  it("returns 500 when GCS throws", async () => {
    mockSave().mockRejectedValueOnce(new Error("GCS failure"));
    const req = makeReq();
    const res = makeRes();
    await lifeSync(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
