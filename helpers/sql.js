const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  //keys holds dataToUpdate property's
  const keys = Object.keys(dataToUpdate);
  //If keys is 0, Then no data was passed and will return an error
  if (keys.length === 0) throw new BadRequestError("No data");


  //Sets column names as the names of property's passed in
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    //Returns columns and values vars to be used in updating db
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
