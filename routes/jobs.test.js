"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
    const newJob = {
        title: "test",
        salary: 20000,
        equity: "0.1",
        company_handle: "c1"
      };
  
    test("ok for users", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send(newJob)
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(201);
      expect(resp.body).toEqual({
        job: newJob,
      });
    });
  
    test("bad request with missing data", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send({
            title: "new",
            salary: 10,
          })
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(500);
    });
  
    test("bad request with invalid data", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send({
            ...newJob,
            salary: 100,
          })
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(201);
    });
  });



  /************************************** GET /companies */

describe("GET /jobs", function () {
    test("ok for anon", async function () {
      const resp = await request(app).get("/jobs");
      expect(resp.body).toEqual({
        jobs:
        [
            {
                title: "TestJob",
                salary: 60000,
                equity: "0",
                company_handle: "c1"
            },
            {
            title: "TestJob2",
            salary: 80000,
            equity: null,
            company_handle: "c1"
            },
            {
                title: "TestJob3",
                salary: 100000,
                equity: "0.5",
                company_handle: "c1"
            }
          ],
      });
    });
  
    test("fails: test next() handler", async function () {
      await db.query("DROP TABLE jobs CASCADE");
      const resp = await request(app)
          .get("/jobs")
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(500);
    });
  });


  /************************************** GET /jobs/:handle */

describe("GET /jobs/:title", function () {
    test("works for anon", async function () {
      const resp = await request(app).get(`/jobs/TestJob`)
      .set("authorization", `Bearer ${u1Token}`);
      expect(resp.body).toEqual({
        job:
            {
                title: "TestJob",
                salary: 60000,
                equity: "0",
                company_handle: "c1"
            }
      });
      
    })

  
  
    test("not found for no such jobs", async function () {
      const resp = await request(app).get(`/jobs/nope`);
      expect(resp.statusCode).toEqual(401);
    });
  });



  /************************************** DELETE /jobs/:title */

describe("DELETE /jobs/:title", function () {
    test("works for admin", async function () {
      const resp = await request(app)
          .delete(`/jobs/TestJob`)
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.body).toEqual({ deleted: "TestJob" });
    });
  
    test("unauth for anon", async function () {
      const resp = await request(app)
          .delete(`/jobs/TestJob`);
      expect(resp.statusCode).toEqual(401);
    });
  
    test("not found for no such TestJob", async function () {
      const resp = await request(app)
          .delete(`/jobs/nope`)
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(404);
    });
  });