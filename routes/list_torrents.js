module.exports = ({router}, {dao}) => {
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
};