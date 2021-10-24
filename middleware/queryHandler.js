const queryHandler = (model, populateFields) => async (req,res,next) => {

    let query;
    const reqQuery = {...req.query};  // copy req.query

    // Temporarily Remove 'SELECT', 'SORT', 'LIMIT', 'PAGE' from query and focus on WHERE conditions
    const removeFields = ['select, sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery); //create String from query
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`); // Add '$' for mongoose fn $lte

    query = model.find(JSON.parse(queryStr));  // DB Query 

    // Add SELECT FROM fields to query
    if(req.query.select){
        const fields = req.query.select.split(',').join(' '); // convert multiple fields in query object into a string
        query = query.select(fields);
    }

    // Add SORT (use by date as default and DESC)
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
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

    // Populate Table
    if(populateFields){
        query = query.populate(populateFields);
    }
    // Execute Query
    const queryResults = await query;

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

    res.queryResults = {
        success: true,
        count: queryResults.length,
        pagination,
        data: queryResults
    }

    next();
}

module.exports = queryHandler;