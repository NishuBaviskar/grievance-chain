const GrievanceChain = artifacts.require("GrievanceChain");

/*
 * This test suite validates the core functionality of the GrievanceChain smart contract.
 * It uses the accounts provided by the Truffle development environment (Ganache).
 * accounts[0] is the default owner of the contract.
 * accounts[1] is used to simulate a student lodging a complaint.
 */
contract("GrievanceChain", (accounts) => {
    let grievanceChainInstance;
    const owner = accounts[0];
    const student = accounts[1];
    const studentId = "S001";
    const complaintTitle = "Regarding library facilities";
    const ipfsHash = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"; // Example IPFS hash

    // Before each test, deploy a fresh instance of the contract
    beforeEach(async() => {
        grievanceChainInstance = await GrievanceChain.new({ from: owner });
    });

    it("should allow a student to lodge a new complaint", async() => {
        // Lodge a complaint from the student's account
        await grievanceChainInstance.lodgeComplaint(studentId, complaintTitle, ipfsHash, { from: student });

        // Retrieve the complaint from the blockchain
        const complaint = await grievanceChainInstance.getComplaint(1);

        // Assert that the stored data matches the input data
        assert.equal(complaint.id, 1, "Complaint ID should be 1");
        assert.equal(complaint.studentId, studentId, "Student ID should match");
        assert.equal(complaint.complaintTitle, complaintTitle, "Complaint title should match");
        assert.equal(complaint.ipfsEvidenceHash, ipfsHash, "IPFS hash should match");
        assert.equal(complaint.status, 0, "Initial status should be 'NotProcessed' (enum value 0)");
    });

    it("should allow the owner to update the status of a complaint", async() => {
        // First, lodge a complaint to have something to update
        await grievanceChainInstance.lodgeComplaint(studentId, complaintTitle, ipfsHash, { from: student });

        const complaintId = 1;
        const newStatus = 1; // Corresponds to 'UnderProcess'

        // Update the status from the owner's account
        await grievanceChainInstance.updateStatus(complaintId, newStatus, { from: owner });

        // Retrieve the updated complaint
        const updatedComplaint = await grievanceChainInstance.getComplaint(complaintId);

        // Assert that the status has been updated
        assert.equal(updatedComplaint.status, newStatus, "Status should be updated to 'UnderProcess' (enum value 1)");
    });

    it("should prevent a non-owner from updating the status", async() => {
        // Lodge a complaint
        await grievanceChainInstance.lodgeComplaint(studentId, complaintTitle, ipfsHash, { from: student });

        const complaintId = 1;
        const newStatus = 2; // 'Resolved'

        // Attempt to update the status from a non-owner account (the student's account)
        try {
            await grievanceChainInstance.updateStatus(complaintId, newStatus, { from: student });
            // If the above line does not throw an error, the test should fail
            assert.fail("The transaction should have reverted, but it did not.");
        } catch (error) {
            // Check that the error message includes 'revert' and the reason from the contract's `require` statement
            assert.include(
                error.message,
                "revert",
                "Expected transaction to revert"
            );
            assert.include(
                error.message,
                "Only the contract owner can perform this action",
                "The revert message should match the contract's requirement"
            );
        }
    });
});