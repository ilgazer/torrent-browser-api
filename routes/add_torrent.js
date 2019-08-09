const busboy = require('koa-busboy')();
const moveFile = require('move-file');

module.exports = ({router}, {delugeApi}, {dao}, image_dir) => {
    router.post("/add_torrent", busboy, (ctx) => {
        let filename=Date.now() + ctx.request.files[1].filename;
        Promise.all([delugeApi.getTorrentInfo(ctx.request.files[0].path),
            moveFile(ctx.request.files[1].path, image_dir + "/" + filename)]).then(
            ([json]) => {
                dao.saveTorrent(ctx.request.body.title, ctx.request.body.author, filename, json.result.files_tree.contents);
            }, reason => console.log("Rejected promise on getTorrentInfo" + reason));
        delugeApi.addTorrentFromFile(ctx.request.files[0].path).then(() => console.log("Add torrent successful"),
            reason => console.log("Rejected promise on addTorrentFromFile" + reason));
    })
};