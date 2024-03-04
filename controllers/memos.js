const Memo = require('../models/memo');

const index = async(req, res) => {
    try {
        const memos = await Memo.find({});
        const formattedMemos = memos.map(memo => {
            const formattedMemo = memo.toObject(); // Convert Mongoose document to a plain JavaScript object
            formattedMemo.formattedDate = memo.date ? memo.date.toLocaleDateString() : 'No Date';
            return formattedMemo;
        });
        console.log('Show list of memos');
        res.render('memos/index', { memos: formattedMemos });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error fetching memos");
    }
}

const newMemo = (req, res) => {
    res.render('memos/new', {errorMessage: ''});
}

const create = async(req, res) => {
    try {
        await Memo.create(req.body);
        res.redirect('/memos');
    } catch (err) {
        console.log(err);
        res.render('memos/new', { errorMessage: err.message });
    }
}

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
        // if error, show edit form with entered info and error
        res.render('memos/edit', { memo: { ...req.body, _id: id}, errorMessage: err.message });
    }
}

module.exports = {
    index,
    new: newMemo,
    create,
    edit: editMemo,
    update
}