import { createPublicClient, createWalletClient, webSocket, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts' 
import { base } from 'viem/chains'

// However many RPCS you need to use, feel free to reuse if you want
// You can get free RPCs at https://tenderly.co/
// Must be BASE RPCS
const transport = http('HTTP_RPC_HERE')
const transport1 = webSocket('WEBSOCKET_RPC_HERE');
const transport2 = webSocket('WEBSOCKET_RPC_HERE');
const transport3 = webSocket('WEBSOCKET_RPC_HERE');
const transport4 = webSocket('WEBSOCKET_RPC_HERE');
const transport5 = webSocket('WEBSOCKET_RPC_HERE');
const transport6 = webSocket('WEBSOCKET_RPC_HERE');
const transport7 = webSocket('WEBSOCKET_RPC_HERE');
const transport8 = webSocket('WEBSOCKET_RPC_HERE');
const transport9 = webSocket('WEBSOCKET_RPC_HERE');
const transport10 = webSocket('WEBSOCKET_RPC_HERE');

export const publicClient = createPublicClient({
  chain: base,
  transport: transport,
})
export const publicClient1 = createPublicClient({
  chain: base,
  transport: transport1,
})
export const publicClient2 = createPublicClient({
  chain: base,
  transport: transport2,
})
export const publicClient3 = createPublicClient({
  chain: base,
  transport: transport3,
})
export const publicClient4 = createPublicClient({
  chain: base,
  transport: transport4,
})
export const publicClient5 = createPublicClient({
  chain: base,
  transport: transport5,
})
export const publicClient6 = createPublicClient({
  chain: base,
  transport: transport6,
})
export const publicClient7 = createPublicClient({
  chain: base,
  transport: transport7,
})
export const publicClient8 = createPublicClient({
  chain: base,
  transport: transport8,
})
export const publicClient9 = createPublicClient({
  chain: base,
  transport: transport9,
})
export const publicClient10 = createPublicClient({
  chain: base,
  transport: transport10,
})

// Private Accounts
export const account = privateKeyToAccount(`ACCOUNT0_PRIVATE_KEY`);
export const account1 = privateKeyToAccount(`ACCOUNT1_PRIVATE_KEY`);
export const account2 = privateKeyToAccount(`ACCOUNT2_PRIVATE_KEY`);
export const account3 = privateKeyToAccount(`ACCOUNT3_PRIVATE_KEY`);
export const account4 = privateKeyToAccount(`ACCOUNT4_PRIVATE_KEY`);
export const account5 = privateKeyToAccount(`ACCOUNT5_PRIVATE_KEY`);
export const account6 = privateKeyToAccount(`ACCOUNT6_PRIVATE_KEY`);
export const account7 = privateKeyToAccount(`ACCOUNT7_PRIVATE_KEY`);
export const account8 = privateKeyToAccount(`ACCOUNT8_PRIVATE_KEY`);
export const account9 = privateKeyToAccount(`ACCOUNT9_PRIVATE_KEY`);
export const account10 = privateKeyToAccount(`ACCOUNT10_PRIVATE_KEY`);

export const walletClient = createWalletClient({
  account: account,
  chain: base,
  transport: transport,
})
export const walletClient1 = createWalletClient({
  account: account1,
  chain: base,
  transport: transport1,
})
export const walletClient2 = createWalletClient({
  account: account2,
  chain: base,
  transport: transport2,
})
export const walletClient3 = createWalletClient({
  account: account3,
  chain: base,
  transport: transport3,
})
export const walletClient4 = createWalletClient({
  account: account4,
  chain: base,
  transport: transport4,
})
export const walletClient5 = createWalletClient({
  account: account5,
  chain: base,
  transport: transport5,
})
export const walletClient6 = createWalletClient({
  account: account6,
  chain: base,
  transport: transport6,
})
export const walletClient7 = createWalletClient({
  account: account7,
  chain: base,
  transport: transport7,
})
export const walletClient8 = createWalletClient({
  account: account8,
  chain: base,
  transport: transport8,
})
export const walletClient9 = createWalletClient({
  account: account9,
  chain: base,
  transport: transport9,
})
export const walletClient10 = createWalletClient({
  account: account10,
  chain: base,
  transport: transport10,
})