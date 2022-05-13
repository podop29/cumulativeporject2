"use strict";

const res = require("express/lib/response");
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Jobs{
    // Creates a job form data, updates db, and returns the job
    // data should be {title, salary, equity, company_handle}
    static async create({title, salary, equity, company_handle}){
        const duplicateCheck = await db.query(`
        SELECT title
        FROM jobs
        WHERE title = $1`, [title])

        if(duplicateCheck.rows[0])
            throw new BadRequestError(`Duplicated Job: ${title}`)
        
        
        const results = await db.query(`
        INSERT INTO jobs
        (title, salary, equity, company_handle)
        VALUES ($1,$2,$3,$4)
        Returning title, salary, equity, company_handle
        `,[  title,
            salary,
            equity,
            company_handle])
    

        const job = results.rows[0];

        return job
    }

    /** Find all jobs.
   *
   * Returns [{title, salary, equity, company_handle}, ...]
   * */

    static async findAll(){
        const jobs = await db.query(`
        SELECT title, salary, equity, company_handle 
        FROM jobs
        ORDER BY title`)
        return jobs.rows
    }


//Filters jobs on title, minSalary, hasEquity, any or all can be passed.
  // Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
static async filter(title, minSalary, hasEquity){
    //Creates string with title in % wildcard symbols for querying
    const queryName = `'%${title}%'`
    let equity = false;
    if(hasEquity == 'true'){
        equity = true
    }
    let jobRes
    if(title){
        jobRes = await db.query(
        `SELECT title,
         salary,
          equity, 
          company_handle
         FROM jobs
         WHERE title ILIKE ${queryName}
         ORDER BY title`);
      }else{
        jobRes = await db.query(
          `SELECT title,
          salary,
           equity, 
           company_handle
          FROM jobs
           ORDER BY title`);
      }

      let finalResults = [];
      console.log(minSalary, equity)
      if(minSalary && equity!== false){
          console.log("gottem")
          finalResults = jobRes.rows.map(j=>{
              if(j.salary >= minSalary && j.equity !== null && j.equity !== '0')
              return j
          })

      }
      else if(minSalary){
        finalResults = jobRes.rows.map(j=>{
            if(j.salary >= minSalary) return j
        })
      }
      else if(equity){
        finalResults = jobRes.rows.map(j=>{
            if(j.equity !== null && j.equity !== '0') return j
        })
      }
      //Remove null values for list of jobs
      if(finalResults.length != 0)return finalResults.filter(c => c != null) 
      return jobRes.rows


}

/**
 * 
Get all jobs for a company
 */
static async getJobsFor(handle){
        const jobs = await db.query(`
            SELECT title, salary, equity, company_handle 
            FROM jobs
            WHERE company_handle = $1
            order by title `, [handle])
            if(jobs.rows.length == 0) return
            return jobs.rows
}




  /**
   * 
   *Gets job based on specific title
   */
    static async get(title){
        const job = await db.query(`
        SELECT title, salary, equity, company_handle 
        FROM jobs
        WHERE title = $1
        order by title `, [title])
        if(!job.rows[0])
        throw new NotFoundError(`No job: ${title}`);

        return job.rows[0]

    }


    static async update(handle, data){
        const {setCols, values} = sqlForPartialUpdate(data)
        const handleVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE title = ${handleVarIdx} 
                      RETURNING title, salary, equity, company_handle"`;
    const result = await db.query(querySql, [...values, handle]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${handle}`);

    return job;
    }


    static async remove(title) {
        const result = await db.query(
              `DELETE
               FROM jobs
               WHERE title = $1
               RETURNING title`,
            [title]);
        const company = result.rows[0];
    
        if (!company) throw new NotFoundError(`No company: ${title}`);
      }
}



module.exports = Jobs