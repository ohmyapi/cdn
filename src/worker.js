import axios from "axios";

import { parentPort, workerData } from "worker_threads";
import fs from "fs";

const download = (params = { url: '', path: '', dir: '' }) => {
    if (fs.existsSync(params.dir) == false) {
        fs.mkdirSync(params.dir, {
            recursive: true,
        });
    }

    axios({
        method: "get",
        url: params.url,
        responseType: "stream"
    }).then(function (response) {
        response.data.pipe(fs.createWriteStream(params.path));
    }).finally(() => {
        console.log(`[${Date.now()}] ${params.url} => ${params.path}`);
        parentPort.close();
    });
}

download(workerData);
