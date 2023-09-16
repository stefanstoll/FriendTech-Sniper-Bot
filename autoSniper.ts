import { spawn, ChildProcess } from 'child_process';

// Define a list of objects for the unique attributes for each sniper.
const sniperConfigs = [
  { script: 'sniper.js', address: 'YOUR_FIRST_ACCOUNT_ADDRESS_HERE', clientIndex: 1 },
  { script: 'sniper.js', address: 'YOUR_SECOND_ACCOUNT_ADDRESS_HERE', clientIndex: 2 },
  { script: 'sniper.js', address: 'YOUR_THIRD_ACCOUNT_ADDRESS_HERE', clientIndex: 3 },
  { script: 'sniper.js', address: 'YOUR_FOURTH_ACCOUNT_ADDRESS_HERE', clientIndex: 4 },
  { script: 'sniper.js', address: 'YOUR_FIFTH_ACCOUNT_ADDRESS_HERE', clientIndex: 5 },
  { script: 'sniper.js', address: 'YOUR_SIXTH_ACCOUNT_ADDRESS_HERE', clientIndex: 6 },
  { script: 'sniper.js', address: 'YOUR_SEVENTH_ACCOUNT_ADDRESS_HERE', clientIndex: 7 },
  { script: 'sniper.js', address: 'YOUR_EIGHTH_ACCOUNT_ADDRESS_HERE', clientIndex: 8 },
  { script: 'sniper.js', address: 'YOUR_NINTH_ACCOUNT_ADDRESS_HERE', clientIndex: 9 },
  { script: 'sniper.js', address: 'YOUR_TENTH_ACCOUNT_ADDRESS_HERE', clientIndex: 10 }
];

const args = process.argv.slice(2);
const targetAddress = args[0]; // Default value if not provided
const sharesToPurchase = args[1] || "20"; // Default
const sleepPeriod = args[2] || "400"; // Default
const numberOfSnipers = parseInt(args[3] || "4"); // Default to 4 if not provided

const children: ChildProcess[] = [];

async function runSnipers() {
  // Only select the required number of snipers
  const selectedSnipers = sniperConfigs.slice(0, numberOfSnipers);

  for (const config of selectedSnipers) {
    const child: ChildProcess = spawn('node', [config.script, targetAddress, sharesToPurchase, sleepPeriod, config.address, String(config.clientIndex)]);

    children.push(child);

    if (child.stdout) {
      child.stdout.on('data', (data) => {
        console.log(`[Sniper ${config.address}] ${data}`);
      });
    }

    if (child.stderr) {
      child.stderr.on('data', (data) => {
        console.error(`[Sniper ${config.address} ERROR] ${data}`);
      });
    }
  }
}

runSnipers();

// Handle process termination
process.on('exit', () => {
  children.forEach(child => child.kill());
});
