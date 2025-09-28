const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const db = require('../config/db');
require('dotenv').config();

const provider = new ethers.JsonRpcProvider(process.env.GANACHE_RPC_URL);
const contractArtifactPath = path.resolve(__dirname, '../../build/contracts/GrievanceChain.json');
const contractArtifact = JSON.parse(fs.readFileSync(contractArtifactPath, 'utf8'));
const contractAbi = contractArtifact.abi;
const contractAddress = process.env.SMART_CONTRACT_ADDRESS;
const privateKey = process.env.GANACHE_PRIVATE_KEY;
const signer = new ethers.Wallet(privateKey, provider);
const grievanceContract = new ethers.Contract(contractAddress, contractAbi, signer);
console.log('✅ Blockchain service configured.');

const lodgeComplaintOnChain = async(studentId, title, ipfsHash) => await grievanceContract.lodgeComplaint(studentId, title, ipfsHash);
const getComplaintFromChain = async(complaintId) => await grievanceContract.getComplaint(complaintId);
const updateStatusOnChain = async(complaintId, statusEnum) => await grievanceContract.updateStatus(complaintId, statusEnum);

const startEventListener = () => {
    console.log('👂 Starting blockchain event listener...');
    grievanceContract.on('ComplaintLodged', async(id, studentId, ipfsHash, createdAt, event) => {
        const complaintIdBc = Number(id);
        const txHash = event.log.transactionHash;
        if (!txHash) return console.error('[SYNC CRITICAL ERROR] TxHash is undefined.');
        try {
            const [txRows] = await db.query("SELECT complaint_id_fk FROM complaint_transactions WHERE transaction_hash = ? AND action_type = 'CREATE_PENDING'", [txHash]);
            if (txRows.length === 0) return;
            const complaintDbId = txRows[0].complaint_id_fk;
            await db.query(`UPDATE complaints SET complaint_id_bc = ? WHERE id = ? AND complaint_id_bc IS NULL`, [complaintIdBc, complaintDbId]);
            await db.query(`UPDATE complaint_transactions SET action_type = 'CREATE_CONFIRMED' WHERE transaction_hash = ?`, [txHash]);
            console.log(`[SYNC COMPLETE] ✅ Complaint ID ${complaintIdBc} confirmed in DB.`);
        } catch (error) {
            console.error(`[SYNC FATAL ERROR] while processing ComplaintLodged event for TxHash ${txHash}.`, error.stack);
        }
    });
    grievanceContract.on('StatusUpdated', async(id, newStatus, updatedAt, event) => {
        const complaintIdBc = Number(id);
        const txHash = event.log.transactionHash;
        const statusMap = ["Not Processed", "Acknowledged", "Under Investigation", "Pending Committee Review", "Resolved", "Rejected"];
        const newStatusString = statusMap[Number(newStatus)];
        try {
            await db.query('UPDATE complaints SET status = ?, updated_at_bc = ? WHERE complaint_id_bc = ?', [newStatusString, Number(updatedAt), complaintIdBc]);
            const [complaintRows] = await db.query('SELECT id FROM complaints WHERE complaint_id_bc = ?', [complaintIdBc]);
            if (complaintRows.length > 0) {
                const complaintIdFk = complaintRows[0].id;
                await db.query(`INSERT INTO complaint_transactions (complaint_id_fk, action_type, transaction_hash, status_to) VALUES (?, ?, ?, ?)`, [complaintIdFk, 'STATUS_UPDATE_CONFIRMED', txHash, newStatusString]);
                console.log(`[SYNC COMPLETE] ✅ Status update for Complaint ID ${complaintIdBc} fully synced.`);
            }
        } catch (error) {
            console.error(`[SYNC FATAL ERROR] while processing StatusUpdated event for ID ${complaintIdBc}.`, error.stack);
        }
    });
};

module.exports = {
    lodgeComplaintOnChain,
    getComplaintFromChain,
    updateStatusOnChain,
    startEventListener
};