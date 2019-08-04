async function init() {
    const Koa = require('koa');
    const Router = require('koa-router');
    const DelugeApi = require('./deluge_api');
    const MongoDao = require('./MongoDao');


    let config = require('minimist')(process.argv.slice(2));
    console.log(config);

    const koa = new Koa();
    const router = new Router();
    const delugeApi = DelugeApi(config.deluge_url, config.deluge_pass);
    const dao = await MongoDao(config.mongo_url);

    require("./routes/basic")({router});
    require("./routes/add_torrent")({router}, {delugeApi}, {dao});
    require("./routes/list_torrents")({router}, {dao});

    koa.use(router.routes());
    koa.use(router.allowedMethods());

    koa.listen(3000);
}

init().then(()=>console.log("Init complete"));