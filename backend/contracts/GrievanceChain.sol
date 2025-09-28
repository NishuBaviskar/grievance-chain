// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GrievanceChain {
    address public owner;

    // <<< THE FIX: Expanded the Status enum for a detailed resolution chain >>>
    enum Status { 
        NotProcessed,           // 0
        Acknowledged,           // 1
        UnderInvestigation,     // 2
        PendingCommitteeReview, // 3
        Resolved,               // 4
        Rejected                // 5
    }

    struct Transaction {
        Status newStatus;
        uint256 timestamp;
        address updatedBy;
    }

    struct Complaint {
        uint256 id;
        string studentId;
        string complaintTitle;
        string ipfsEvidenceHash;
        Status currentStatus;
        uint256 createdAt;
        uint256 lastUpdatedAt;
        Transaction[] history;
    }

    uint256 public complaintCounter;
    mapping(uint256 => Complaint) public complaints;

    event ComplaintLodged(uint256 indexed id, string indexed studentId, string ipfsHash, uint256 createdAt);
    event StatusUpdated(uint256 indexed id, Status newStatus, uint256 updatedAt);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
        complaintCounter = 0;
    }

    function lodgeComplaint(string memory _studentId, string memory _title, string memory _ipfsHash) public {
        complaintCounter++;
        uint256 newId = complaintCounter;
        
        Complaint storage newComplaint = complaints[newId];
        newComplaint.id = newId;
        newComplaint.studentId = _studentId;
        newComplaint.complaintTitle = _title;
        newComplaint.ipfsEvidenceHash = _ipfsHash;
        newComplaint.currentStatus = Status.NotProcessed;
        newComplaint.createdAt = block.timestamp;
        newComplaint.lastUpdatedAt = block.timestamp;

        newComplaint.history.push(Transaction({
            newStatus: Status.NotProcessed,
            timestamp: block.timestamp,
            updatedBy: msg.sender
        }));

        emit ComplaintLodged(newId, _studentId, _ipfsHash, block.timestamp);
    }

    function updateStatus(uint256 _complaintId, Status _newStatus) public onlyOwner {
        require(_complaintId > 0 && _complaintId <= complaintCounter, "Complaint does not exist");
        Complaint storage complaintToUpdate = complaints[_complaintId];
        require(complaintToUpdate.currentStatus != _newStatus, "Status is already set to this value");
        
        complaintToUpdate.currentStatus = _newStatus;
        complaintToUpdate.lastUpdatedAt = block.timestamp;

        complaintToUpdate.history.push(Transaction({
            newStatus: _newStatus,
            timestamp: block.timestamp,
            updatedBy: msg.sender
        }));

        emit StatusUpdated(_complaintId, _newStatus, block.timestamp);
    }

    function getComplaint(uint256 _complaintId) public view returns (Complaint memory) {
        require(_complaintId > 0 && _complaintId <= complaintCounter, "Complaint does not exist");
        return complaints[_complaintId];
    }

    function getComplaintHistory(uint256 _complaintId) public view returns (Transaction[] memory) {
        require(_complaintId > 0 && _complaintId <= complaintCounter, "Complaint does not exist");
        return complaints[_complaintId].history;
    }
}