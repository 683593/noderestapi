const router = require('express').Router();
const algoliasearch = require('algoliasearch')
const client = algoliasearch('T3ZK4AEKKP', 'fd51510ed1c219f510a5e2760b9c8033');
const index = client.initIndex('Rizwaan');

router.get('/', (req, resp, next) => {

    if (req.query.query) {
        index.search({
            query: req.query.query,
            page: req.query.page
        }, (err, content) => {
            resp.json({
                success: true,
                message: 'Here is your search',
                content: content,
                status: 200,
                search_result: req.query.query
            })
        })
    }
});
module.exports = router;