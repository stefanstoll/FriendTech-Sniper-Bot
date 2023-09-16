import { spawn, ChildProcess } from 'child_process';
import readline from 'readline';

// Define a list of objects for the unique attributes for each sniper.
const sniperConfigs = [
  { script: 'manualSniper.js', address: 'YOUR_1ST_ADDRESS_HERE', clientIndex: 1 },
  { script: 'manualSniper.js', address: 'YOUR_2ND_ADDRESS_HERE', clientIndex: 2 },
  { script: 'manualSniper.js', address: 'YOUR_3RD_ADDRESS_HERE', clientIndex: 3 },
  { script: 'manualSniper.js', address: 'YOUR_4TH_ADDRESS_HERE', clientIndex: 4 },
  { script: 'manualSniper.js', address: 'YOUR_5TH_ADDRESS_HERE', clientIndex: 5 },
  { script: 'manualSniper.js', address: 'YOUR_6TH_ADDRESS_HERE', clientIndex: 6 },
  { script: 'manualSniper.js', address: 'YOUR_7TH_ADDRESS_HERE', clientIndex: 7 },
  { script: 'manualSniper.js', address: 'YOUR_8TH_ADDRESS_HERE', clientIndex: 8 },
  { script: 'manualSniper.js', address: 'YOUR_9TH_ADDRESS_HERE', clientIndex: 9 },
  { script: 'manualSniper.js', address: 'YOUR_10TH_ADDRESS_HERE', clientIndex: 10 }
];

const children: ChildProcess[] = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function promptUser(question: string, defaultValue: string = ""): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

async function runSnipers() {
  const targetAddress = await promptUser('Address to Target? ');
  const sharestoPurchase = await promptUser('(Optional) Shares to Buy? (default: 20) ', '20');
  const sleepPeriod = await promptUser('(Optional) Sleep Time? (default: 400) ', '400');
  
  // Ask the user how many snipers they want to activate
  const numberOfSnipers = parseInt(await promptUser('How many snipers do you want to activate? (1-10): '), 10);

  rl.close();

  if (isNaN(numberOfSnipers) || numberOfSnipers < 1 || numberOfSnipers > 10) {
    console.error('Invalid number of snipers. Please select a number between 1 and 10.');
    return;
  }

  // Only select the required number of snipers
  const selectedSnipers = sniperConfigs.slice(0, numberOfSnipers);

  for (const config of selectedSnipers) {
    const child: ChildProcess = spawn('node', [config.script, targetAddress, sharestoPurchase, sleepPeriod, config.address, String(config.clientIndex)]);

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
process.on('SIGINT', () => {
  children.forEach(child => child.kill());
  process.exit();
});
process.on('SIGTERM', () => {
  children.forEach(child => child.kill());
  process.exit();
});