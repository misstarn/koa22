const Router = require("@koa/router");

const { addTopic, getTopics, getData, topicDetail, addComment, updateVote } = require('../controllers/topicController')

const router = new Router();


router.post('/addTopic', addTopic)
router.get('/getTopics', getTopics)

router.get('/getData', getData)
router.get('/:id', topicDetail)

router.post('/addComment', addComment)
router.post('/updateVote/:id', updateVote)

module.exports = router;