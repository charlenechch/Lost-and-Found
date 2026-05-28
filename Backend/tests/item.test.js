const request = require("supertest");
const app = require("../app");

describe("Lost & Found API", () => {

  test("GET /items should return 200", async () => {
    const response = await request(app).get("/items");

    expect(response.statusCode).toBe(200);
  });

  test("POST /items should fail with empty data", async () => {
    const response = await request(app)
      .post("/items")
      .send({});

    expect(response.statusCode).toBe(400);
  });

});