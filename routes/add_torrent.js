const busboy = require('koa-busboy')();
const moveFile = require('move-file');

module.exports = ({router}, {delugeApi}, {dao}) => {
    router.post("/add_torrent", busboy, (ctx) => {
        delugeApi.getTorrentInfo(ctx.request.files[0].path).then(
            (json) => {
                console.log(ctx.request.files[0].path);
                if (!json.result || json.error !== null) {
                    throw new Error("get_torrent_info failed:\n" + JSON.stringify(json));
                }
                dao.saveTorrent(ctx.request.body.title, ctx.request.body.author, "", json.result.files_tree.contents);
            });
        delugeApi.addTorrentFromFile(ctx.request.files[0].path);
    })
};