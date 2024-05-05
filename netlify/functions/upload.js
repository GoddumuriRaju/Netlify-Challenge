const process = require('process');
const Busboy = require('busboy');
const { promises: fs } = require('fs');
const os = require('os');
const path = require('path');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const busboy = new Busboy({ headers: event.headers });

    let uploadPath;
    busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
        console.log(`File [${fieldname}]: filename: %j`, filename);
        const filePath = path.join(os.tmpdir(), filename);
        uploadPath = filePath;
        await pipeFile(file, filePath);
    });

    const pipeFile = (fileStream, filePath) => {
        return new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(filePath);
            fileStream.pipe(writeStream);
            fileStream.on('end', () => writeStream.close());
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
    };

    return new Promise((resolve, reject) => {
        busboy.on('finish', () => {
            console.log('Done parsing form!');
            // Logic to handle file upload to Large Media (e.g., move file from temp storage to a permanent one)
            resolve({
                statusCode: 200,
                body: `File uploaded successfully to ${uploadPath}`,
            });
        });

        busboy.on('error', error => reject({
            statusCode: 500,
            body: `Error parsing form: ${error}`,
        }));

        busboy.write(event.body, event.isBase64 ? 'base64' : 'binary');
        busboy.end();
    });
};
