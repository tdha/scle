const Memo = require('../models/memo');
const cloudinary = require('../utilities/cloudinary');
const Network = require('../models/network');

const index = async(req, res) => {
    try {
        const memos = await Memo.find({user: req.user._id}).populate('network');
        const formattedMemos = memos.map(memo => {
            const formattedMemo = memo.toObject();
            formattedMemo.formattedDate = memo.date ? memo.date.toLocaleDateString() : 'No Date';
            formattedMemo.networkName = memo.network ? memo.network.name : 'No Network';
            return formattedMemo;
        });
        console.log('Show list of memos');
        res.render('memos/index', { memos: formattedMemos });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error fetching memos");
    }
};


const newMemo = async (req, res) => {
    try {
        const networks = await Network.find({});
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(now - timezoneOffset)).toISOString().split('T')[0];
        
        res.render('memos/new', { networks, today: localISOTime, errorMessage: '' });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error preparing new memo form");
    }
};

const create = async(req, res) => {
    try {
        let imageUploadResult = {};
        if (req.file) { 
            imageUploadResult = await cloudinary.uploader.upload(req.file.path);
        }
        
        const imageUrl = imageUploadResult.secure_url || 'defaultImageURLHere'; 
        const cloudinaryId = imageUploadResult.public_id || '';
        
        if (!req.user) {
            throw new Error('User not authenticated');
        }
        
        let network;
        if (req.body.networkName) {
            network = await Network.findOne({ name: req.body.networkName });
            if (!network) {
                // Include the user's ID when creating a new network
                network = new Network({
                    name: req.body.networkName,
                    user: req.user._id // Assign the user ID here
                });
                await network.save();
            }
        }
        
        const memo = new Memo({
            ...req.body,
            image: imageUrl,
            cloudinary_id: cloudinaryId,
            user: req.user._id, // Already correctly included
            network: network ? network._id : undefined
        });

        await memo.save();
        res.redirect('/memos');
    } catch (err) {
        console.log(err);
        // Properly handle error scenario for re-rendering the form
        const networks = await Network.find({});
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(now - timezoneOffset)).toISOString().split('T')[0];
        res.render('memos/new', { errorMessage: err.message, today: localISOTime, networks });
    }
};


const editMemo = async(req, res) => {
    try {
        const memo = await Memo.findById(req.params.id);
        res.render('memos/edit', { memo, errorMessage: '' });
    } catch (err) {
        console.log(err);
        res.redirect('/memos');
    }
}

const update = async(req, res) => {
    const id = req.params.id;
    try {
        await Memo.findByIdAndUpdate(id, req.body);
        res.redirect('/memos');
    } catch (err) {
        console.log(err);
        res.render('memos/edit', { memo: { ...req.body, _id: id}, errorMessage: err.message });
    }
}

const deleteMemo = async (req, res) => {
    try {
        const memo = await Memo.findById(req.params.id);
        if (memo.cloudinary_id) {
            await cloudinary.uploader.destroy(memo.cloudinary_id);
        }
        await Memo.findByIdAndDelete(req.params.id);
        res.redirect('/memos');
    } catch (err) {
        console.log(err);
        res.status(500).send("Error deleting memo");
    }
};

module.exports = {
    index,
    new: newMemo,
    create,
    edit: editMemo,
    update,
    delete: deleteMemo
}