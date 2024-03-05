const express = require('express');
const router = express.Router();
const upload = require('../utilities/multer');
const networksController = require('../controllers/networks');
const Network = require('../models/network');
const Memo = require('../models/memo');
const ensureLoggedIn = require('../config/ensureLoggedIn');

router.get('/', ensureLoggedIn, networksController.index);
router.get('/new', ensureLoggedIn, networksController.new);

// router.get('/:id', async (req, res) => {
//     try {
//         const network = await Network.findById(req.params.id);
//         res.render('networks/show', { n: network }); 
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Error fetching network details");
//     }
// });

router.get('/:id', ensureLoggedIn, async (req, res) => {
    try {
        const network = await Network.findById(req.params.id);
        // Assuming 'network' field in memo references the network's ID
        const memos = await Memo.find({ network: network._id }).populate('network', 'name'); // Populate network name
        
        res.render('networks/show', { 
            n: network,
            memos: memos
        }); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching network details");
    }
});

router.post('/', upload.single('image'), ensureLoggedIn, networksController.create);
router.get('/:id/edit', ensureLoggedIn, networksController.edit);
router.put('/:id', ensureLoggedIn, networksController.update);
router.delete('/:id', ensureLoggedIn, networksController.delete);

module.exports = router;
