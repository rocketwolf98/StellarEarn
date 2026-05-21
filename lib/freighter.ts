interface FreighterApi {
  getPublicKey(): Promise<string>;
  signTransaction(xdr: string, options: { networkPassphrase: string }): Promise<{ signedTxXdr: string }>;
}

declare global {
  interface Window {
    freighterApi: FreighterApi;
  }
}

export async function getPublicKey() {
  const publicKey = await window.freighterApi.getPublicKey();
  return publicKey;
}

export async function signTransaction(xdr: string, network: string) {
  const signed = await window.freighterApi.signTransaction(xdr, {
    networkPassphrase: network,
  });

  return signed.signedTxXdr;
}