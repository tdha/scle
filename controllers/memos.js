const Memo = require('../models/memo');
const cloudinary = require('../utilities/cloudinary');
const Network = require('../models/network');

const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 24;
        const skip = (page - 1) * limit;

        const totalMemos = await Memo.countDocuments({user: req.user._id});
        const memos = await Memo.find({user: req.user._id})
                                .populate('network')
                                .sort({ createdAt: -1 })
                                .skip(skip)
                                .limit(limit);

        const formattedMemos = memos.map(memo => {
            const formattedMemo = memo.toObject();
            formattedMemo.formattedDate = memo.date ? memo.date.toLocaleDateString() : 'No Date';
            formattedMemo.networkName = memo.network ? memo.network.name : 'No Network';
            return formattedMemo;
        });

        const totalPages = Math.ceil(totalMemos / limit);

        res.render('memos/index', {
            memos: formattedMemos,
            currentPage: page,
            totalPages
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching memos");
    }
};

const newMemo = async (req, res) => {
    try {
        const networks = await Network.find({user: req.user._id}).sort('name');
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
        
        const imageUrl = imageUploadResult.secure_url || ''; 
        const cloudinaryId = imageUploadResult.public_id || '';
        
        if (!req.user) {
            throw new Error('User not authenticated');
        }
        
        let network;
        if (req.body.networkName) {
            network = await Network.findOne({ name: req.body.networkName });
            if (!network) {
                network = new Network({
                    name: req.body.networkName,
                    user: req.user._id 
                });
                await network.save();
            }
        }
        
        const memo = new Memo({
            ...req.body,
            image: imageUrl,
            cloudinary_id: cloudinaryId,
            user: req.user._id, 
            network: network ? network._id : undefined
        });

        await memo.save();
        res.redirect('/memos');
    } catch (err) {
        console.log(err);
        const networks = await Network.find({});
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(now - timezoneOffset)).toISOString().split('T')[0];
        res.render('memos/new', { errorMessage: err.message, today: localISOTime, networks });
    }
};


const editMemo = async(req, res) => {
    try {
        const memo = await Memo.findById(req.params.id).populate('network');
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