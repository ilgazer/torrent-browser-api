module.exports = ({router}, {delugeApi}) => {
    router.get('/torrent_files/:hash', async (ctx) => {
        console.log(ctx.params);
        let json = await delugeApi.getTorrentFiles(ctx.params.hash.toLowerCase());
        ctx.body = JSON.stringify({
            result: parseTree(json.result.contents)[0]
        });
    });

    function parseTree(contents) {
        let results = [];
        let items = Object.entries(contents);
        for (let i = 0; i < items.length; i++) {
            let folderName = items[i][0];
            let folder = items[i][1];
            let result = {
                name: folderName,
                isFile: folder.type === "file",
                path: folder.path,
                progress: folder.progress,
                children: folder.contents ? parseTree(folder.contents) : []
            };
            results.push(result);
        }
        return results;
    }
};

