
var express = require('express'); 
var router = express.Router();

var admin_controller = require('../controllers/admincontroller'); 

router.get('/test', (req, res) => {
    res.send("slash command get test response!");
});

router.post('/admin/init', admin_controller.init);


module.exports = router;