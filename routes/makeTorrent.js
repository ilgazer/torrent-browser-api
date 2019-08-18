module.exports = ({router}, {delugeApi}, download_dir) => {
    const os = require('os');
    const fs = require('fs');
    const path = require('path');

    function ensureDir(dirpath) {
        try {
            return fs.promises.mkdir(dirpath, {recursive: true})
        } catch (err) {
            if (err.code !== 'EEXIST') throw err
        }
    }

    function onFileWithPromise(filePromises, fieldname, file, filename, encoding, mimetype) {
        file.tmpName = filename;

        const filePromise = ensureDir(path.join(download_dir, path.dirname(filename))).then(() => {
            const saveTo = path.join(download_dir, filename);
            const writeStream = fs.createWriteStream(saveTo);

            return new Promise((resolve, reject) => writeStream
                .on('open', () => file
                    .pipe(writeStream)
                    .on('error', reject)
                    .on('finish', () => {
                        const readStream = fs.createReadStream(saveTo);
                        readStream.fieldname = fieldname;
                        readStream.filename = filename;
                        readStream.transferEncoding = readStream.encoding = encoding;
                        readStream.mimeType = readStream.mime = mimetype;
                        resolve(readStream);
                    })
                )
                .on('error', (err) => {
                    file
                        .resume()
                        .on('error', reject);
                    reject(err);
                })
            );
        });
        filePromises.push(filePromise);
    }

    router.post('/make_torrent', async (ctx) => {
            const {files, fields} = await require('async-busboy')(ctx.req, {
                preservePath: true,
                onFileWithPromise: onFileWithPromise
            });

            const parent_dir =path.join(download_dir, files.map(file => file.filename.split("/")[0]).reduce((a, b) => {
                if (a !== b)
                    throw new Error("Get parent directory failed.\n" + a + "does not equal " + b);
                else
                    return a;
            }));
            const json=await delugeApi.makeTorrent(parent_dir, fields.tracker);
            console.log(json);

            console.log(parent_dir);
            console.log(fields);
            ctx.body = "Success";
        }
    );
};