module.exports = ({router}, {delugeApi}, {dao}, image_dir) => {
    router.get('/torrents', async (ctx) => {
        ctx.body = JSON.stringify(
            await dao.getTorrents(
                parseInt(ctx.query.limit),
                ctx.query.continuation));
    });
    router.get('/torrents/:id', async (ctx) => {
        ctx.body = JSON.stringify(
            await dao.getTorrentById(ctx.params.id));
    });

    router.post("/torrents",
        require('koa-busboy')({
            dest: image_dir
        }), (ctx) => {
            delugeApi.getTorrentInfo(ctx.request.files[0].path)
                .then((json) => dao.saveTorrent(ctx.request.body.title, ctx.request.body.author,
                        ctx.request.files[1].path.split("/").pop(), json.result.info_hash)
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