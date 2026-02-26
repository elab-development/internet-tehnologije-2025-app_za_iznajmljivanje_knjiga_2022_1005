const request = require("supertest");
const app = require("../index");

describe("API Integracioni Testovi", () => {
  it("GET /api/publikacije treba da vrati niz publikacija", async () => {
    const res = await request(app).get("/api/publikacije");
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/kontakt treba da uspešno pošalje podatke", async () => {
    const res = await request(app).post("/api/kontakt").send({
      ime: "Test Korisnik",
      email: "test@example.com",
      poruka: "Ovo je test poruka",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe("Poruka je uspešno poslata biblioteci!");
  });
});
