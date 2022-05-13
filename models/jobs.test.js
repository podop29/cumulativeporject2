"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./jobs.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("../routes/_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/*************** CREATE */


describe("Create new jobs", ()=>{
    const newJob = {
        title: "test",
        salary: 20000,
        equity: "0.1",
        company_handle: "c1"
      };
    test("works", async ()=>{
        let job = await Job.create(newJob);
        expect(job).toEqual(newJob);

        const result = await db.query(
            `SELECT title, salary, equity, company_handle
             FROM jobs
             WHERE title = 'test'`);
      expect(result.rows[0]).toEqual(
        {
            title: "test",
            salary: 20000,
            equity: "0.1",
            company_handle: "c1"
        },
      );
    })

    test("bad request with dupe", async function () {
        try {
          await Job.create(newJob);
          await Job.create(newJob);
          fail();
        } catch (err) {
          expect(err instanceof BadRequestError).toBeTruthy();
        }
      });
    });


    /************************************** findAll */

describe("findAll", function () {


    test("works: no filter", async function () {



      let jobs = await Job.findAll();
      console.log(jobs)
      expect(jobs).toEqual([
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
      ]);
    });
  });



  //***************************Filter by values */

describe("Test filter method", function () {
    test('Filter by name', async ()=>{
      let title = "te"
      let minSalary,hasEquity;
      let jobs = await Job.filter(title, minSalary, hasEquity);
      expect(jobs).toEqual([
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
      ]);
      
    })

    test('Filter by minSalary', async ()=>{
        let title,hasEquity;
        let minSalary = 80000;
        let jobs = await Job.filter(title, minSalary, hasEquity);
        expect(jobs).toEqual([
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
        ]);
      })

      test('Filter by hasEquity', async ()=>{
        let title,minSalary;
        let hasEquity = 'true';
        let jobs = await Job.filter(title, minSalary, hasEquity);
        expect(jobs).toEqual([{
            title: "TestJob3",
            salary: 100000,
            equity: "0.5",
            company_handle: "c1"
        }
        ]);
      })



      /************************************** remove */

describe("remove", function () {
    test("works", async function () {
      await Job.remove("TestJob");
      const res = await db.query(
          "SELECT title FROM jobs WHERE title='TestJob'");
      expect(res.rows.length).toEqual(0);
    });
  
    test("not found if no such job", async function () {
      try {
        await Job.remove("nope");
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  });
  
    })

    


  
