const Network = require('../models/network');
const Memo = require('../models/memo');
const cloudinary = require('../utilities/cloudinary');


const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 12; 
        const skip = (page - 1) * limit; 

        const totalNetworks = await Network.countDocuments({user: req.user._id});
        const totalPages = Math.ceil(totalNetworks / limit);

        const networks = await Network.find({user: req.user._id})
                                      .populate('user')
                                      .sort({ name: 1 })
                                      .skip(skip)
                                      .limit(limit);
        
        const networksWithPlaceholder = networks.map(network => {
            const modifiedNetwork = network.toObject();
            modifiedNetwork.image = modifiedNetwork.image || '/images/default-profile-image.png'; 
            return modifiedNetwork;
        });

        res.render('networks/index', { 
            networks: networksWithPlaceholder,
            currentPage: page,
            totalPages
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error fetching networks");
    }
};


const show = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const networkId = req.params.id;
        const totalMemos = await Memo.countDocuments({ network: networkId });
        const memos = await Memo.find({ network: networkId })
                                .populate('network', 'name')
                                .sort({ createdAt: -1 })
                                .skip(skip)
                                .limit(limit);

        const formattedMemos = memos.map(memo => ({
            ...memo.toObject(),
            formattedDate: memo.date ? memo.date.toLocaleDateString() : 'No Date',
        }));

        const totalPages = Math.ceil(totalMemos / limit);

        res.render('networks/show', {
            n: await Network.findById(networkId),
            memos: formattedMemos,
            currentPage: page,
            totalPages
        });
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
        let errorMessage = 'An error occurred';
        if (err.code === 11000) { 
            errorMessage = 'This name already exists.';
        } else if (err.name === 'ValidationError') {
            // Get the first error message from the errors object
            const errorsKeys = Object.keys(err.errors);
            errorMessage = err.errors[errorsKeys[0]].message;
        } else {
            console.log(err);
        }
        res.render('networks/new', { 
            errorMessage,
            formData: req.body 
        });
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
    const { id } = req.params;
    const updatedData = req.body;

    try {
        const existingNetwork = await Network.findOne({ name: updatedData.name, _id: { $ne: id } });

        if (existingNetwork) {
            return res.render('networks/edit', {
                network: updatedData,
                errorMessage: 'This name already exists.',
                id: id
            });
        }

        if (req.file) {
            const imageUploadResult = await cloudinary.uploader.upload(req.file.path);
            updatedData.image = imageUploadResult.secure_url || updatedData.image;
            updatedData.cloudinary_id = imageUploadResult.public_id || updatedData.cloudinary_id;
        }

        await Network.findByIdAndUpdate(id, updatedData);
        res.redirect('/networks');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating network");
    }
};


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