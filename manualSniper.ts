import { parseEther, parseGwei, encodeFunctionData } from 'viem';
const optimizedABI: any = require('./optimizedABI.json');

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const args = process.argv.slice(2);
const targetAddress = args[0];
const sharestoPurchase = parseInt(args[1]);
const sleepPeriod = parseInt(args[2]);

const MAX_FEE_PER_GAS = parseGwei('5');
const MAX_PRIORITY_FEE_PER_GAS = parseGwei('0.1');

const MAX_RETRIES = 2000; //Max amount of times to run

const USER_ADDRESS = args[3] as `0x${string}`;
const CONTRACT_ADDRESS = 'PUT_YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE' as `0x${string}`;

const clientIndex = args[4];
const publicClient = require('./client')['publicClient' + clientIndex];
const walletClient = require('./client')['walletClient' + clientIndex];

const DEFAULT_SHARES = "20";
const GAS = 150000n;

const SHARE_TO_VALUE_MAPPING: { [key: number]: string } = {
  1: "0.00006875",
  2: "0.00034375",
  3: "0.0009625",
  4: "0.0020625",
  5: "0.00378125",
  6: "0.00625625",
  7: "0.009625",
  8: "0.014025",
  9: "0.01959375",
  10: "0.02646875",
  11: "0.0347875",
  12: "0.0446875",
  13: "0.05630625",
  14: "0.06978125",
  15: "0.08525",
  16: "0.10285",
  17: "0.12271875",
  18: "0.14499375",
  19: "0.1698125",
  20: "0.1973125",
  21: "0.22763125",
  22: "0.26090625",
  23: "0.297275",
  24: "0.336875",
  25: "0.37984375",
  26: "0.42631875",
  27: "0.4764375",
  28: "0.5303375",
  29: "0.58815625",
  30: "0.65003125",
  35: "1.0250625",
  40: "1.522125"
}

let currentNonce: number | null = null;

async function tryBuy(config: any, data: string) {
  try {
    if (currentNonce === null) {
      currentNonce = await publicClient.getTransactionCount({
        address: USER_ADDRESS,
      });
    }
    console.log('using nonce = ' + currentNonce);

    const transaction = {
      to: config.to,
      data: data,
      gas: config.gas,
      maxFeePerGas: config.maxFeePerGas,
      maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
      nonce: currentNonce
    };

    const txHash = await walletClient.sendTransaction(transaction as any);

    // Increment nonce for next transaction.
    currentNonce!++;

    console.log(`Submitted transaction. txHash:`, txHash);

  } catch (error: any) {
    // Reset nonce to null to refetch it next time.
    currentNonce = null;
  }
}

async function main() {
  const purchaseValue = SHARE_TO_VALUE_MAPPING[sharestoPurchase]
    ? parseEther(SHARE_TO_VALUE_MAPPING[sharestoPurchase])
    : parseEther(SHARE_TO_VALUE_MAPPING[DEFAULT_SHARES]);

  const commonContractConfig = {
    to: CONTRACT_ADDRESS,
    abi: optimizedABI,
    gas: GAS,
    maxFeePerGas: MAX_FEE_PER_GAS,
    functionName: 'attemptToBuyShares'
  };

  const data = encodeFunctionData({
    abi: optimizedABI,
    functionName: 'attemptToBuyShares',
    args: [targetAddress, sharestoPurchase, purchaseValue]
  });

  async function sendTransactionWithDelay(config: any, data: string, sleepPeriod: number) {
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        await tryBuy(config, data);
        await new Promise(resolve => setTimeout(resolve, sleepPeriod)); // Delay for sleepPeriod
      } catch (error: any) {
        console.error("An unexpected error occurred in main loop:", error.message);
      }
    }
    console.log('Reached max retries. Stopped sending txns.');
  }
  
  await sendTransactionWithDelay(commonContractConfig, data, sleepPeriod);
}

main();