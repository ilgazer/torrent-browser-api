module.exports = ({router}, {delugeApi}, {dao}, image_dir) => {
    router.post("/add_torrent",
        require('koa-busboy')({
            dest: image_dir
        }), (ctx) => {
            delugeApi.getTorrentInfo(ctx.request.files[0].path)
                .then((json) => dao.saveTorrent(ctx.request.body.title, ctx.request.body.author,
                    ctx.request.files[1].path.split("/").pop(), json.result.files_tree.contents))
                .then(() => console.log("Add torrent to Mongo successful"),
                    reason => console.log("Rejected promise on getTorrentInfo" + reason));
            delugeApi.addTorrentFromFile(ctx.request.files[0].path)
                .then(() => console.log("Add torrent to Deluge successful"),
                    reason => console.log("Rejected promise on addTorrentFromFile" + reason));
        })
};