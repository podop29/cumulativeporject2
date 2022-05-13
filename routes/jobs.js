const express = require("express");

const { BadRequestError, ExpressError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin, ensureCorrectUserOrAdmin } = require("../middleware/auth");
const Job = require("../models/jobs");



const router = new express.Router();



/**
 * POST / {job} => {job}
 * job should be {title, salary, equity, company_handle}
 * returns {title, salary, equity, company_handle}
 * Authorization: admin
 */

router.post("/", ensureAdmin, async (req,res,next)=>{
    try{
        const job = await Job.create(req.body);
        return res.status(201).json({job});
    }catch(e){
        return next(e)
    }
})


/**
 * GET
 * Get all jobs
 * authorization, logged in
 */

router.get("/", async(req,res,next)=>{
    try{
        let title = req.query['title']
        let minSalary = parseInt(req.query['minSalary'])
        let hasEquity = req.query['hasEquity']
        if(title || minSalary || hasEquity){
            const jobs = await Job.filter(title,minSalary,hasEquity)
            return res.json({ jobs });
          }


        const jobs = await Job.findAll()
        return res.json({jobs})
    }catch(e){
        return next(e)
    }

})

/**
 * GET job by title
 * returns job 
 * authorization, logged in
 */
router.get("/:handle", ensureLoggedIn, async (req,res,next)=>{
    try{
        const handle = req.params.handle
        const job = await Job.get(handle)
        console.log(job)
        return res.json({job})

    }catch(e){
        return next(e)
    }
})


/** PATCH /[handle] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: {title, salary, equity, company_handle}
 *
 * Returns { title, salary, equity, company_handle }
 *
 * Authorization required: admin
 */

 router.patch("/:title", ensureAdmin, async function (req, res, next) {
    try {
        console.log(req.params.title)
      const job = await Job.update(req.params.title, req.body);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  });



  /** DELETE /[title]  =>  { deleted: title }
 *
 * Authorization: admin
 */

router.delete("/:title", ensureAdmin, async function (req, res, next) {
    try {
      await Job.remove(req.params.title);
      return res.json({ deleted: req.params.title });
    } catch (err) {
      return next(err);
    }
  });
  


module.exports = router;
