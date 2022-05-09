const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { sqlForPartialUpdate } = require("../helpers/sql");


//Test for part 1
describe("Tests the sql functions", ()=>{
    test("Tests sqlPartialUpdate function", ()=>{

        const data = {name: "Steve"}
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
              numEmployees: "num_employees",
              logoUrl: "logo_url",
            });

            expect(setCols).toEqual("\"name\"=$1")
            expect(values).toEqual(["Steve"])
    })
    test("Tests if no data is passed into sqlForPartialUpdate function", ()=>{
        const data = {}
        expect(()=>{sqlForPartialUpdate(
            data,
            {
              numEmployees: "num_employees",
              logoUrl: "logo_url",
            })}).toThrow('No data')

    })
})
