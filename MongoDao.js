module.exports = async (url) => {
    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;
    await mongoose.connect(url, {useNewUrlParser: true});
    console.log("Connected");
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));

    const autoPopulateChildren = function (next) {
        this.populate('children');
        next();
    };

    const FolderSchema = new Schema({
        _id: Schema.Types.ObjectId,
        name: String,
        isFile: Boolean,
        path: String,
        children: [{
            type: Schema.Types.ObjectId,
            ref: 'Folder'
        }]
    });
    FolderSchema
        .pre('findOne', autoPopulateChildren)
        .pre('find', autoPopulateChildren);

    FolderModel = mongoose.model("Folder", FolderSchema);
    const TorrentSchema = new Schema({
        _id: Schema.Types.ObjectId,
        title: String,
        author: String,
        img: String, //filepath
        files_tree: {
            type: Schema.Types.ObjectId,
            ref: 'Folder'
        },
    });
    const TorrentModel = mongoose.model("Torrent", TorrentSchema);

    const parseTree = (contents) => {
        let items = Object.entries(contents);
        let folderIds = [];
        for (let i = 0; i < items.length; i++) {
            let folderName = items[i][0];
            let folder = items[i][1];
            let folderDoc = new FolderModel({
                _id: mongoose.Types.ObjectId(),
                name: folderName,
                isFile: folder.type === "file",
                path: folder.path,
            });
            if (folder.contents) {
                folderDoc.children = (parseTree(folder.contents));
            }
            folderDoc.save();
            folderIds.push(folderDoc._id);
            //console.log(folderDoc);
        }
        return folderIds;
    };
    return {

        saveTorrent: (title, author, img, contents) => {
            let torrent = new TorrentModel({
                _id: mongoose.Types.ObjectId(),
                title: title,
                author: author,
                img: img, //filepath
                files_tree: parseTree(contents)[0]
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
