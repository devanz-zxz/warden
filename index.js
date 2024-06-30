const { DirectSecp256k1HdWallet, makeAuthInfoBytes, makeSignDoc, encodePubkey, coins } = require("@cosmjs/proto-signing");
const { assertIsBroadcastTxSuccess, SigningStargateClient } = require("@cosmjs/stargate");

async function sendTransaction(client, wallet, accountNumber, sequence) {
    const [firstAccount] = await wallet.getAccounts();
    const chainId = "buenavista-1";
    const fee = {
        amount: coins(5000, "uward"),
        gas: "200000",
    };

    const msg = {
        typeUrl: "/warden.warden.v1beta2.MsgNewSignatureRequest",
        value: {
            signer: firstAccount.address,
            // Tambahkan field pesan lainnya di sini
        },
    };

    const txBody = {
        messages: [msg],
        memo: "",
        timeoutHeight: "0",
        extensionOptions: [],
        nonCriticalExtensionOptions: [],
    };

    const authInfoBytes = makeAuthInfoBytes(
        [{ pubkey: encodePubkey({ type: "tendermint/PubKeySecp256k1", value: firstAccount.pubkey }), sequence }],
        fee.amount,
        fee.gas,
    );

    const signDoc = makeSignDoc(
        txBody,
        authInfoBytes,
        chainId,
        accountNumber
    );

    const { signed, signature } = await wallet.signAmino(firstAccount.address, signDoc);

    const txRaw = {
        bodyBytes: signed.bodyBytes,
        authInfoBytes: signed.authInfoBytes,
        signatures: [signature],
    };

    const broadcastResult = await client.broadcastTx(Uint8Array.from(txRaw));
    assertIsBroadcastTxSuccess(broadcastResult);

    console.log(`Transaction sent with hash: ${broadcastResult.transactionHash}`);
}

async function main() {
    const mnemonic = "copy toy sing churn leisure exchange private tortoise document peace staff athlete";
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "cosmos" });
    const rpcEndpoint = "https://rpc.cosmos.network:26657";
    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);

    const accountNumber = 474579;
    let sequence = 126;

    for (let i = 0; i < 110; i++) {
        try {
            await sendTransaction(client, wallet, accountNumber, sequence++);
            console.log(`Transaction ${i + 1} sent successfully`);
        } catch (error) {
            console.error(`Error in transaction ${i + 1}:`, error);
        }
    }
}

main().catch(console.error);
