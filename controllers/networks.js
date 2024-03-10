const Network = require('../models/network');
const Memo = require('../models/memo');
const cloudinary = require('../utilities/cloudinary');

const index = async (req, res) => {
    try {
        // Pagination
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 12; 
        const skip = (page - 1) * limit; 

        const totalNetworks = await Network.countDocuments({user: req.user._id});
        const totalPages = Math.ceil(totalNetworks / limit);

        const networks = await Network.find({user: req.user._id})
                                      .populate('user')
                                      .sort({ name: 1 }) // Sort alphabetically
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
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const networkId = req.params.id;
        const totalMemos = await Memo.countDocuments({ network: networkId });
        const memos = await Memo.find({ network: networkId })
                                .populate('network', 'name')
                                .sort({ createdAt: -1 }) // Sort latest to oldest by date created
                                .skip(skip)
                                .limit(limit);

        const totalPages = Math.ceil(totalMemos / limit);

        const formattedMemos = memos.map(memo => ({
            ...memo.toObject(),
            formattedDate: memo.date ? memo.date.toLocaleDateString() : 'No Date',
        }));

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
        // Database duplication
        let errorMessage = 'An error occurred';
        if (err.code === 11000) { 
            errorMessage = 'This name already exists.';
        } else if (err.name === 'ValidationError') {
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

const editImage = async (req, res) => {
    try {
      const network = await Network.findById(req.params.id);
      res.render('networks/edit-image', { network });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error displaying image edit page.");
    }
  };  

const update = async(req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    try {
        const existingNetwork = await Network.findOne({ name: updatedData.name, _id: { $ne: id } });

        if (existingNetwork) {
            return res.render('networks/edit', {
                network: updatedData,
                errorMessage: 'This name already exists.', // Name is unique
                id: id
            });
        }

        if (req.file) {
            const imageUploadResult = await cloudinary.uploader.upload(req.file.path);
            updatedData.image = imageUploadResult.secure_url || updatedData.image;
            updatedData.cloudinary_id = imageUploadResult.public_id || updatedData.cloudinary_id;
        }

        await Network.findByIdAndUpdate(id, updatedData);
        res.redirect(`/networks/${id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating network");
    }
};

const updateImage = async (req, res) => {
    try {
      const { id } = req.params;
      const network = await Network.findById(id);
  
      // Delete old image from Cloudinary, if it exists
      if (network.cloudinary_id) {
        await cloudinary.uploader.destroy(network.cloudinary_id);
      }
  
      // Upload the new image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);
  
      // Update the network (contact) with the new image URL and cloudinary_id
      await Network.findByIdAndUpdate(id, { 
        image: result.secure_url, 
        cloudinary_id: result.public_id 
      });
  
      res.redirect(`/networks/${id}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error updating image.");
    }
  };  

// const deleteNetwork = async (req, res) => {
//     try {
//         const network = await Network.findById(req.params.id);
//         if (network.cloudinary_id) {
//             await cloudinary.uploader.destroy(network.cloudinary_id);
//         }
//         await Network.findByIdAndDelete(req.params.id);
//         res.redirect('/networks');
//     } catch (err) {
//         console.log(err);
//         res.status(500).send("Error deleting memo");
//     }
// };
const deleteNetwork = async (req, res) => {
    try {
        const networkId = req.params.id;

        // Delete all memos related to this network
        await Memo.deleteMany({ network: networkId });

        // Now delete the network
        const network = await Network.findById(networkId);
        if (network.cloudinary_id) {
            await cloudinary.uploader.destroy(network.cloudinary_id);
        }
        await Network.findByIdAndDelete(networkId);

        res.redirect('/networks');
    } catch (err) {
        console.log(err);
        res.status(500).send("Error deleting network and its memos");
    }
};

module.exports = {
    index,
    show,
    new: newNetwork,
    create,
    edit: editNetwork,
    editImage,
    update,
    updateImage,
    delete: deleteNetwork
}