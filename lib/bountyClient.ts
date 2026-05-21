import {
  Contract,
  TransactionBuilder,
  Networks,
  Keypair,
  rpc,
} from "@stellar/stellar-sdk";

const RPC_URL = "https://soroban-testnet.stellar.org";

// Replace with your deployed contract ID
const CONTRACT_ID = "YOUR_CONTRACT_ID_HERE";

const server = new rpc.Server(RPC_URL);

export class BountyClient {
  contract: Contract;

  constructor(contractId: string = CONTRACT_ID) {
    this.contract = new Contract(contractId);
  }

  // -------------------------
  // INIT CONTRACT
  // -------------------------
  async init(sourceKeypair: Keypair) {
    const tx = await server.prepareTransaction(
      new TransactionBuilder(await server.getAccount(sourceKeypair.publicKey()), {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(this.contract.call("init"))
        .setTimeout(30)
        .build()
    );

    tx.sign(sourceKeypair);
    return server.sendTransaction(tx);
  }

  // -------------------------
  // CREATE BOUNTY
  // -------------------------
  async createBounty(
    sponsor: Keypair,
    token: string,
    prize: string,
    deadline: number
  ) {
    const tx = await server.prepareTransaction(
      new TransactionBuilder(await server.getAccount(sponsor.publicKey()), {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          this.contract.call(
            "create_bounty",
            sponsor.publicKey(),
            token,
            prize,
            deadline
          )
        )
        .setTimeout(30)
        .build()
    );

    tx.sign(sponsor);
    const res = await server.sendTransaction(tx);
    return res;
  }

  // -------------------------
  // SUBMIT WORK
  // -------------------------
  async submit(
    participant: Keypair,
    bountyId: number,
    workHash: string
  ) {
    const tx = await server.prepareTransaction(
      new TransactionBuilder(await server.getAccount(participant.publicKey()), {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          this.contract.call(
            "submit",
            bountyId,
            participant.publicKey(),
            workHash
          )
        )
        .setTimeout(30)
        .build()
    );

    tx.sign(participant);
    return server.sendTransaction(tx);
  }

  // -------------------------
  // SELECT WINNER
  // -------------------------
  async selectWinner(
    sponsor: Keypair,
    bountyId: number,
    winner: string
  ) {
    const tx = await server.prepareTransaction(
      new TransactionBuilder(await server.getAccount(sponsor.publicKey()), {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          this.contract.call(
            "select_winner",
            bountyId,
            sponsor.publicKey(),
            winner
          )
        )
        .setTimeout(30)
        .build()
    );

    tx.sign(sponsor);
    return server.sendTransaction(tx);
  }

  // -------------------------
  // CANCEL BOUNTY
  // -------------------------
  async cancel(
    sponsor: Keypair,
    bountyId: number
  ) {
    const tx = await server.prepareTransaction(
      new TransactionBuilder(await server.getAccount(sponsor.publicKey()), {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          this.contract.call(
            "cancel",
            bountyId,
            sponsor.publicKey()
          )
        )
        .setTimeout(30)
        .build()
    );

    tx.sign(sponsor);
    return server.sendTransaction(tx);
  }

  // -------------------------
  // VIEW: GET BOUNTY
  // -------------------------
  async getBounty(id: number) {
    return server.simulateTransaction(
      this.contract.call("get_bounty", id)
    );
  }

  // -------------------------
  // VIEW: SUBMISSIONS
  // -------------------------
  async getSubmissions(id: number) {
    return server.simulateTransaction(
      this.contract.call("get_submissions", id)
    );
  }

  // -------------------------
  // PLATFORM FEES
  // -------------------------
  async getFees() {
    return server.simulateTransaction(
      this.contract.call("platform_fees")
    );
  }
}