import {
  Account,
  Contract,
  rpc,
  Networks,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
} from "@stellar/stellar-sdk";

const RPC_URL = "https://soroban-testnet.stellar.org";
const server = new rpc.Server(RPC_URL);

const CONTRACT_ID = "YOUR_CONTRACT_ID";
const READ_ONLY_ACCOUNT = new Account(
  "GBZXN7PIRZGNMHGA6DK6MY6AC72O453END5TPHJUIXQ3OSBXUPJYNO3S",
  "0"
);

export class BountyClient {
  contract: Contract;

  constructor(contractId: string = CONTRACT_ID) {
    this.contract = new Contract(contractId);
  }

  // -------------------------
  // CREATE BOUNTY (correct Soroban flow)
  // -------------------------
  async createBounty(
    sponsor: string,
    token: string,
    prize: string,
    deadline: number
  ) {
    const sponsorAccount = await server.getAccount(sponsor);
    const tx = await server.prepareTransaction(
      new TransactionBuilder(sponsorAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          this.contract.call(
            "create_bounty",
            nativeToScVal(sponsor),
            nativeToScVal(token),
            nativeToScVal(prize),
            nativeToScVal(deadline)
          )
        )
        .setTimeout(30)
        .build()
    );

    return tx;
  }

  // -------------------------
  // SUBMIT
  // -------------------------
  async submit(
    participant: string,
    bountyId: number,
    workHash: string
  ) {
    const participantAccount = await server.getAccount(participant);
    const tx = await server.prepareTransaction(
      new TransactionBuilder(participantAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          this.contract.call(
            "submit",
            nativeToScVal(bountyId),
            nativeToScVal(participant),
            nativeToScVal(workHash)
          )
        )
        .setTimeout(30)
        .build()
    );

    return tx;
  }

  // -------------------------
  // SELECT WINNER
  // -------------------------
  async selectWinner(
    sponsor: string,
    bountyId: number,
    winner: string
  ) {
    const sponsorAccount = await server.getAccount(sponsor);
    const tx = await server.prepareTransaction(
      new TransactionBuilder(sponsorAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          this.contract.call(
            "select_winner",
            nativeToScVal(bountyId),
            nativeToScVal(sponsor),
            nativeToScVal(winner)
          )
        )
        .setTimeout(30)
        .build()
    );

    return tx;
  }

  // -------------------------
  // CANCEL
  // -------------------------
  async cancel(
    sponsor: string,
    bountyId: number
  ) {
    const sponsorAccount = await server.getAccount(sponsor);
    const tx = await server.prepareTransaction(
      new TransactionBuilder(sponsorAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          this.contract.call(
            "cancel",
            nativeToScVal(bountyId),
            nativeToScVal(sponsor)
          )
        )
        .setTimeout(30)
        .build()
    );

    return tx;
  }

  // -------------------------
  // READ ONLY (CORRECT WAY)
  // -------------------------
  async getBounty(id: number) {
    const tx = new TransactionBuilder(READ_ONLY_ACCOUNT, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        this.contract.call("get_bounty", nativeToScVal(id))
      )
      .setTimeout(30)
      .build();

    return server.simulateTransaction(tx);
  }

  async getSubmissions(id: number) {
    const tx = new TransactionBuilder(READ_ONLY_ACCOUNT, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        this.contract.call("get_submissions", nativeToScVal(id))
      )
      .setTimeout(30)
      .build();

    return server.simulateTransaction(tx);
  }

  async getFees() {
    const tx = new TransactionBuilder(READ_ONLY_ACCOUNT, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(this.contract.call("platform_fees"))
      .setTimeout(30)
      .build();

    return server.simulateTransaction(tx);
  }
}