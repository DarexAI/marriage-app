const { PublicKey, Connection, Keypair, Transaction, TransactionInstruction, SystemProgram } = require("@solana/web3.js");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

/**
 * BlockchainService: handles Solana blockchain interactions
 */
class BlockchainService {
  constructor() {
    this.connection = null;
    this.wallet = null;
    this.programId = null;
    this.initialized = false;
  }

  /**
   * Initialize blockchain connection
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      this.connection = new Connection(
        process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
        "confirmed"
      );

      const walletPath = path.join(__dirname, "../config/backend-wallet.json");
      
      if (!fs.existsSync(walletPath)) {
        console.warn("Wallet file not found. Blockchain features disabled.");
        return false;
      }

      const secretKey = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
      this.wallet = Keypair.fromSecretKey(Uint8Array.from(secretKey));

      // load program ID
      const idlPath = path.join(__dirname, "../config/marriage_registry.json");
      if (fs.existsSync(idlPath)) {
        const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));
        this.programId = new PublicKey(
          process.env.SOLANA_PROGRAM_ID || idl.address || "CmkicBWwA7dVBKPXbZ5AGHXQGGqNhyS7rY8skEv6NxMy"
        );
      } else {
        this.programId = new PublicKey(
          process.env.SOLANA_PROGRAM_ID || "CmkicBWwA7dVBKPXbZ5AGHXQGGqNhyS7rY8skEv6NxMy"
        );
      }

      this.initialized = true;

      console.log(`   Wallet: ${this.wallet.publicKey.toBase58()}`);
      console.log(`   Program: ${this.programId.toBase58()}`);

      return true;
    } catch (error) {
      console.error("Blockchain initialization failed:", error.message);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Derive PDA for certificate
   * Seeds: ["cert", issuer, cert_id]
   * @param {string} certId - Certificate ID
   * @returns {Promise<[PublicKey, number]>} PDA and bump
   */
  async derivePDA(certId) {
    if (!this.initialized) {
      throw new Error("Blockchain service not initialized");
    }

    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("cert"),
        this.wallet.publicKey.toBuffer(),
        Buffer.from(certId)
      ],
      this.programId
    );
  }

  /**
   * Hash certificate data using SHA-256
   * @param {Buffer|string} data - Certificate data to hash
   * @returns {Buffer} Hash digest
   */
  hashCertificate(data) {
    const input = Buffer.isBuffer(data) ? data : Buffer.from(data);
    return crypto.createHash("sha256").update(input).digest();
  }

  createRegisterInstruction(certId, certHash, recordPDA) {
    const discriminator = Buffer.from([228, 31, 247, 186, 188, 173, 35, 201]);
    
    // serialize cert_id (string)
    const certIdBuffer = Buffer.from(certId);
    const certIdLength = Buffer.alloc(4);
    certIdLength.writeUInt32LE(certIdBuffer.length);
    
    // cert_hash is already a 32-byte buffer
    const certHashBuffer = certHash;
    
    const data = Buffer.concat([
      discriminator,
      certIdLength,
      certIdBuffer,
      certHashBuffer
    ]);

    return new TransactionInstruction({
      keys: [
        { pubkey: recordPDA, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
      ],
      programId: this.programId,
      data: data
    });
  }

  /**
   * Register certificate on Solana blockchain
   * @param {string} certId - Certificate ID
   * @param {Buffer} hash - Certificate hash
   * @returns {Promise<Object>} Transaction result
   */
  async registerCertificate(certId, hash) {
    if (!this.initialized) {
      throw new Error("Blockchain service not initialized");
    }

    try {
      const [recordPDA] = await this.derivePDA(certId);

      console.log(`Registering certificate ${certId} on blockchain...`);
      console.log(`   PDA: ${recordPDA.toBase58()}`);

      const instruction = this.createRegisterInstruction(certId, hash, recordPDA);

      const transaction = new Transaction().add(instruction);
      const signature = await this.connection.sendTransaction(
        transaction,
        [this.wallet],
        { skipPreflight: false, preflightCommitment: "confirmed" }
      );

      await this.connection.confirmTransaction(signature, "confirmed");

      console.log(`Certificate registered. TX: ${signature}`);

      return {
        success: true,
        txSignature: signature,
        certificateId: certId,
        certificateHash: hash.toString("hex"),
        recordPDA: recordPDA.toBase58(),
      };
    } catch (error) {
      console.error(`Certificate registration failed:`, error);
      
      return {
        success: false,
        error: error.message,
        certificateId: certId,
      };
    }
  }

  /**
   * Verify certificate on blockchain
   * @param {string} certId - Certificate ID
   * @returns {Promise<Object>} Verification result
   */
  async verifyCertificate(certId) {
    if (!this.initialized) {
      throw new Error("Blockchain service not initialized");
    }

    try {
      const [recordPDA] = await this.derivePDA(certId);
      const accountInfo = await this.connection.getAccountInfo(recordPDA);

      if (!accountInfo) {
        return {
          verified: false,
          message: "Certificate not found on blockchain",
        };
      }

      return {
        verified: true,
        message: "Certificate found on blockchain",
        recordPDA: recordPDA.toBase58(),
      };
    } catch (error) {
      console.error("Verification error:", error);
      return {
        verified: false,
        error: error.message,
      };
    }
  }

  /**
   * Get wallet balance
   * @returns {Promise<number>} Balance in SOL
   */
  async getBalance() {
    if (!this.initialized) {
      throw new Error("Blockchain service not initialized");
    }

    try {
      const balance = await this.connection.getBalance(this.wallet.publicKey);
      const balanceInSol = balance / 1e9;
      return balanceInSol;
    } catch (error) {
      console.error("Balance check failed:", error);
      return 0;
    }
  }

  /**
   * Check if service is ready
   * @returns {boolean} Ready status
   */
  isReady() {
    return this.initialized;
  }
}

const blockchainService = new BlockchainService();

module.exports = blockchainService;