import("dotenv/config");

import { Worker } from "worker_threads";

import express from "express";
import cors from "cors";

import path from 'path';

const PORT = process.env.PORT ?? 3000;
const PATH = process.env.DIST ?? path.join(process.cwd(), 'uploads');
const PASSWORD = process.env.PASSWORD;

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    const password = req.headers['x-password'];

    if (password == PASSWORD) next();

    else res.status(403).json({
        status: false,
        code: 403,
        i18n: 'FORBIDDEN'
    });
});

app.post('/api/v1/upload/url', (req, res) => {
    const { url, path: dist } = req.body;

    if (!url)
        return res.status(400).json({
            status: false,
            code: 400,
            i18n: 'BAD_DATA',
            data: {
                field: 'url'
            }
        });

    if (!dist)
        return res.status(400).json({
            status: false,
            code: 400,
            i18n: 'BAD_DATA',
            data: {
                field: 'path'
            }
        });

    const dest = path.join(PATH, dist);
    const dir = dest.replace('/' + path.basename(dest), '');

    new Worker(path.join(process.cwd(), 'src', 'worker.js'), {
        workerData: {
            url,
            dir,
            path: dest,
        }
    }).on('error', console.error);

    res.json({
        status: true,
        code: 200,
        data: {
            url: url,
            path: dest,
            directory: dir
        }
    })
});

app.use((req, res) => {
    res.status(404).json({
        status: false,
        code: 404,
        i18n: 'PATH_NOT_FOUND'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});