module.exports = ({router}, {delugeApi}, {dao}, image_dir) => {
    router.post("/add_torrent",
        require('koa-busboy')({
            dest: image_dir
        }), (ctx) => {
            delugeApi.getTorrentInfo(ctx.request.files[0].path)
                .then((json) => delugeApi.getTorrentFiles(json.result.info_hash))
                .then((json) => dao.saveTorrent(ctx.request.body.title, ctx.request.body.author,
                        ctx.request.files[1].path.split("/").pop(), json.result.contents)
                )
                .then(() => console.log("Add torrent to Mongo successful"),
                    reason => console.log("Rejected promise on getTorrentInfo" + reason, ctx.request.files));
            delugeApi.addTorrentFromFile(ctx.request.files[0].path)
                .then(() => {
                        console.log("Add torrent to Deluge successful");
                        ctx.body = "Success."
                    },
                    reason => console.log("Rejected promise on addTorrentFromFile" + reason));
        })
};