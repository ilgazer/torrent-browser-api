module.exports = async (url) => {
    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;
    await mongoose.connect(url, {useNewUrlParser: true});
    console.log("Connected");
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));

    const TorrentSchema = new Schema({
        _id: Schema.Types.ObjectId,
        title: String,
        author: String,
        img: String, //path
        info_hash: String
    });
    const TorrentModel = mongoose.model("Torrent", TorrentSchema);

    return {

        saveTorrent: (title, author, img, hash) => {
            let torrent = new TorrentModel({
                _id: mongoose.Types.ObjectId(),
                title: title,
                author: author,
                img: img, //filepath
                info_hash:hash
            });
            torrent.save();
        },

        getTorrents: async (limit, continuation) => {
            return await (continuation ? TorrentModel.find({
                    _id: {
                        "$lt": mongoose.Types.ObjectId(continuation)
                    }
                }
            ) : TorrentModel.find())
                .sort({_id: "descending"})
                .limit(limit)
                .populate("files_tree")
                .exec();
        },

        getTorrentById: async (id) => {
            return await TorrentModel.find({
                _id: mongoose.Types.ObjectId(id)
            })
                .populate("files_tree")
                .exec();
        }
    };
};
