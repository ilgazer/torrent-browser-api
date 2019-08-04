module.exports = function (url,password) {
    const request = require('request');
    const delugeRequest = (method, params, callback) => {
        request.post({
            url: url,
            headers: {
                'content-type': 'application/json',
            },
            gzip: true,
            jar: true,
            body: JSON.stringify({
                "method": method,
                id: 100,
                params: params
            })
        }, (err, httpResponse, body) =>
            callback(JSON.parse(body,
                function (k, v) {
                    return (typeof v === "object" || typeof v === "boolean" || isNaN(v)) ? v : parseInt(v, 10);
                }
            )))

    };
    delugeRequest("auth.login",
        [password],
        (json) => {
            if (json.result)
                console.log("Login successful");
            else
                console.log("Login failed");

        });
    const addTorrentFromFile = (filename) => {
        //console.log(filename);
        delugeRequest("core.get_config_values",
            [[
                "compact_allocation",
                "download_location",
                "max_connections_per_torrent",
                "max_download_speed_per_torrent",
                "move_completed",
                "move_completed_path",
                "max_upload_slots_per_torrent",
                "max_upload_speed_per_torrent",
                "prioritize_first_last_pieces"
            ]],
            (json) => {
                delugeRequest("web.add_torrents",
                    [[{
                        "path": filename,
                        "options": {
                            "file_priorities": [
                                1
                            ],
                            "add_paused": false,
                            "max_download_speed": json.result.max_download_speed_per_torrent,
                            "prioritize_first_last_pieces": json.result.prioritize_first_last_pieces,
                            "max_upload_speed": json.result.max_upload_speed_per_torrent,
                            "max_connections": json.result.max_connections_per_torrent,
                            "move_completed_path": json.result.move_completed_path,
                            "download_location": json.result.download_location,
                            "compact_allocation": json.result.compact_allocation,
                            "move_completed": json.result.move_completed,
                            "max_upload_slots": json.result.max_upload_slots_per_torrent
                        }
                    }]],
                    (json) => {
                        console.log(json.result);
                    }
                )
            })
    };
    const getTorrentInfo = (filename, callback) => {
        delugeRequest("web.get_torrent_info", [filename], callback);
    };
    return {
        addTorrentFromFile: addTorrentFromFile,
        getTorrentInfo: getTorrentInfo
    };
};

