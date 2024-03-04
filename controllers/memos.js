const Memo = require('../models/memo');

const index = async(req, res) => {
    const memos = await Memo.find({});
    console.log('Show list of memos');
    res.render('memos/index', {memos});
}

const newMemo = (req, res) => {
    res.render('memos/new', {errorMessage: ''});
}

const create = async(req, res) => {
    try {
        await Memo.create(req.body);
        res.redirect(`/memos`);
    } catch (err) {
        console.log(err);
        res.render('memos/new', { errorMessage: err.message });
    }
}

module.exports = {
    index,
    new: newMemo,
    create
}