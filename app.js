async function init() {
    const Koa = require('koa');
    const Router = require('koa-router');
    const DelugeApi = require('./deluge_api');
    const cors = require('koa2-cors');

    const MongoDao = require('./MongoDao');
    let config = require('minimist')(process.argv.slice(2));

    console.log(config);
    const koa = new Koa();
    const router = new Router();
    const delugeApi = DelugeApi(config.deluge_url, config.deluge_pass);

    const dao = await MongoDao(config.mongo_url);
    require("./routes/basic")({router});
    require("./routes/add_torrent")({router}, {delugeApi}, {dao}, config.image_dir);
    require("./routes/list_torrents")({router}, {dao});

    koa.use(cors({
        origin: "*",
        allowMethods: ['GET', 'POST', 'DELETE'],
    }));

    koa.use(router.routes());
    koa.use(router.allowedMethods());

    koa.listen(config.port);
}

init().then(() => console.log("Init complete"));