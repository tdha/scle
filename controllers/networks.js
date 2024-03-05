const Network = require('../models/network');
const cloudinary = require('../utilities/cloudinary');

// const index = async(req, res) => {
//     const networks = await Network.find({});
//     console.log(index);
//     res.render('networks/index', {title: 'Network', networks});
// }

const index = async (req, res) => {
    try {
        const networks = await Network.find({});
        const networksWithPlaceholder = networks.map(network => {
            const modifiedNetwork = network.toObject();
            if (!modifiedNetwork.image || modifiedNetwork.image === 'defaultImageURLHere') {
                modifiedNetwork.image = '/images/default-profile-image.png';
            }
            return modifiedNetwork;
        });

        res.render('networks/index', { networks: networksWithPlaceholder });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error fetching networks");
    }
};

const newNetwork = (req, res) => {
    res.render('networks/new', {title: 'New Network', errorMsg: ''});
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
        console.log(err);
        res.render('networks/new', { errorMessage: err.message });
    }
};

module.exports = {
    index,
    new: newNetwork,
    create,
    // edit: editNetwork,
    // update,
    // delete: deleteNetwork
}