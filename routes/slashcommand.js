
var express = require('express'); 
var router = express.Router();

var admin_controller = require('../controllers/admincontroller'); 
var survey_controller = require('../controllers/surveycontroller');
var my_controller = require('../controllers/mycontroller')

router.get('/test', (req, res) => {
    res.send("slash command get test response!");
});

// Admin
router.post('/admin/init', admin_controller.init);

router.post('/admin/add', admin_controller.add);

router.post('/admin/delete', admin_controller.delete);

router.post('/admin/list', admin_controller.list);


// Survey
router.post('/survey/add', survey_controller.add);

router.post('/survey/set', survey_controller.set);

router.post('/survey/list', survey_controller.surveylistForResearcherOrManager);

router.post('/survey/view', survey_controller.view);

<<<<<<< HEAD

//Personal suervey records
router.post('/my/history', my_controller.history);




module.exports = router;
=======
//member results list
router.post('/survey/my_History', survey_controller.myHistory);
>>>>>>> 10f066739253f22f1256a081f5a13358d457308a



module.exports = router;
