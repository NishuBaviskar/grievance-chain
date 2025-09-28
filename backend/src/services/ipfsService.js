const { create } = require('ipfs-http-client');
require('dotenv').config();

const ipfsApiUrl = process.env.IPFS_API_URL;
let ipfs;

try {
    ipfs = create({ url: ipfsApiUrl });
    console.log('✅ Connected to IPFS node at:', ipfsApiUrl);
} catch (error) {
    console.error('❌ Could not connect to IPFS node. Please ensure IPFS Desktop or daemon is running.');
    console.error(error);
    ipfs = null;
}

/**
 * Uploads a file buffer to IPFS.
 * @param {Buffer} fileBuffer - The buffer of the file to upload.
 * @returns {Promise<string>} The IPFS CID (hash) of the uploaded file.
 */
const uploadToIPFS = async(fileBuffer) => {
    if (!ipfs) {
        throw new Error("IPFS client is not initialized. Check connection.");
    }
    console.log('Uploading file to IPFS...');
    const result = await ipfs.add(fileBuffer);
    console.log('File uploaded to IPFS with CID:', result.path);
    return result.path;
};

module.exports = { uploadToIPFS };