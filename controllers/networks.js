const Network = require('../models/network');
const Memo = require('../models/memo');
const cloudinary = require('../utilities/cloudinary');


const index = async (req, res) => {
    try {
        const networks = await Network.find({user: req.user._id}).populate('user').sort({ name: 1 }); 
        const networksWithPlaceholder = networks.map(network => {
            const modifiedNetwork = network.toObject();
            modifiedNetwork.image = modifiedNetwork.image || '/images/default-profile-image.png'; 
            return modifiedNetwork;
        });

        res.render('networks/index', { networks: networksWithPlaceholder });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error fetching networks");
    }
};

const show = async (req, res) => {
    try {
        const network = await Network.findById(req.params.id).populate('user').sort({ date: -1});
        const memos = await Memo.find({ network: network._id }).populate('network', 'name');
        
        const formattedMemos = memos.map(memo => ({
            ...memo.toObject(),
            formattedDate: memo.date ? memo.date.toLocaleDateString() : 'No Date',
        }));

        res.render('networks/show', { n: network, memos: formattedMemos });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching network details");
    }
};


const newNetwork = (req, res) => {
    res.render('networks/new', {title: 'New Network', errorMessage: ''});
}

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
        
        const network = new Network({
            ...req.body,
            image: imageUrl,
            cloudinary_id: cloudinaryId,
            user: req.user._id
        });

        await network.save();
        res.redirect('/networks');
    } catch (err) {
        if (err.code === 11000) { 
            res.render('networks/new', { 
                errorMessage: 'This name already exists. Please use a different name.',
                formData: req.body 
            });
        } else {
            // Handle other types of errors
            console.log(err);
            res.render('networks/new', { 
                errorMessage: err.message,
                formData: req.body
            });
        }
    }
};


const editNetwork = async(req, res) => {
    try {
        const network = await Network.findById(req.params.id);
        res.render('networks/edit', { network, errorMessage: '' });
    } catch (err) {
        console.log(err);
        res.redirect('/networks');
    }
}

const update = async(req, res) => {
    const id = req.params.id;
    try {
        await Network.findByIdAndUpdate(id, req.body);
        res.redirect('/networks');
    } catch (err) {
        console.log(err);
        res.render('networks/edit', { network: { ...req.body, _id: id}, errorMessage: err.message });
    }
}

const deleteNetwork = async (req, res) => {
    try {
        const network = await Network.findById(req.params.id);
        if (network.cloudinary_id) {
            await cloudinary.uploader.destroy(network.cloudinary_id);
        }
        await Network.findByIdAndDelete(req.params.id);
        res.redirect('/networks');
    } catch (err) {
        console.log(err);
        res.status(500).send("Error deleting memo");
    }
};

module.exports = {
    index,
    show,
    new: newNetwork,
    create,
    edit: editNetwork,
    update,
    delete: deleteNetwork
}