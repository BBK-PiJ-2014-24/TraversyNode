const queryHandler = (model, populateFields) => async (req,res,next) => {

    // STEP 0: Initialization and Declaration 
    let query; // the query will be built up over various stages
    const reqQuery = {...req.query};  // Note that req.query contains all the params AFTER the "?" in the route.
                                      // A spread operator is used so that it makes a hard copy of the req.query

    // STEP 1: Focus on the Query itself, ignore the SQL that just shapes the results 
    // So, temporarily Remove 'SELECT', 'SORT', 'LIMIT', 'PAGE' from query and focus on WHERE conditions
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]); // delete in copy of req.params

    // STEP 2: Run the Query with 'WHERE' conditions 
    let queryStr = JSON.stringify(reqQuery); //create String from query in order that it can b adjusted in next line
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`); // Add '$' for mongoose fn $lte
    query = model.find(JSON.parse(queryStr));  // DB Query, convert querStr back into JSON.  

    // STEP 3: Refine the Query Results with SELECT, JOIN(Populate), SORT, LIMIT and PAGINATION
    // Add SELECT fields to query
    if(req.query.select){
        const fields = req.query.select.split(',').join(' '); // convert multiple fields in query object into a string
        query = query.select(fields);
    }

    // Add SORT (use by date as default and DESC)
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' '); // .join creates a string
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // PAGINATION
    const page = parseInt(req.query.page, 10) || 1; //base 10
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit; // to allow the query to start on any page
    const endIndex = page * limit;
    const totalDocs = await model.countDocuments();
    // LIMIT
    query = query.skip(startIndex).limit(limit);

    // JOIN - Populate Table
    if(populateFields){
        query = query.populate(populateFields);
    }
    // STEP 4: Run the completed Query
    const queryResults = await query;

    // OPTIONAL STEP 5: 
    // Pagination Meta Data - API tells the client what is the next and prev page
    const pagination = {};

    if(endIndex < totalDocs){
        pagination.next = {
            page: page +1,
            limit: limit,
        }
    }

    if(startIndex > 0){
        pagination.prev = {
            page: page -1,
            limit
        }
    }

    // STEP 6: The res obj to be sent to the client
    res.queryResults = {
        success: true,
        count: queryResults.length,
        pagination,
        data: queryResults
    }

    next();
}

module.exports = queryHandler;