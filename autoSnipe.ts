import axios from 'axios';
import fs from 'fs';
import Twit from 'twit';
const STATE_FILE = './state.json';
import { publicClient, walletClient } from './client';
import friendtechABI from './friendtechABI.json';
import { parseEther, parseGwei } from 'viem'
import { spawn } from 'child_process';
import treeKill from 'tree-kill';

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Map to store the previous balances of addresses
const MINIMUM_FOLLOWERS = 22000;

interface TradeLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: bigint;
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  logIndex: number;
  removed: boolean;
  args: {
    trader: string;
    subject: string;
    isBuy: boolean;
    shareAmount: bigint;
    ethAmount: bigint;
    protocolEthAmount: bigint;
    subjectEthAmount: bigint;
    supply: bigint;
  };
  eventName: 'Trade';
}

// Set up the Twitter client (get API keys from Twitter)
const T = new Twit({
  consumer_key: 'GET_YOUR_API_KEYS_AT_TWITTER',
  consumer_secret: 'GET_YOUR_API_KEYS_AT_TWITTER',
  access_token: 'GET_YOUR_API_KEYS_AT_TWITTER',
  access_token_secret: 'GET_YOUR_API_KEYS_AT_TWITTER',
  timeout_ms: 4 * 1000,  // optional HTTP request timeout to apply to all requests.
  strictSSL: true,     // optional - requires SSL certificates to be valid.
});

interface SharesAndSnipers {
  shares: string;
  snipers: number;
}

function determineSharesAndSnipers(followersCount: number): SharesAndSnipers {
  if (followersCount >= 1200 && followersCount <= 11111) {
    return { shares: "10", snipers: 2 };
  } else if (followersCount > 11111 && followersCount <= 22000) {
    return { shares: "22", snipers: 6 };
  } else if (followersCount > 22000 && followersCount <= 44000) {
    return { shares: "25", snipers: 8 };
  } else if (followersCount > 44000 && followersCount <= 67000) {
    return { shares: "27", snipers: 10 };
  } else if (followersCount > 67000 && followersCount <= 110000) {
    return { shares: "30", snipers: 10 };
  } else if (followersCount > 110000) {
    return { shares: "35", snipers: 10 };
  } else {
    return { shares: "10", snipers: 1 }; // Default values
  }
}

function getLastUserId() {
  if (fs.existsSync(STATE_FILE)) {
    const data = fs.readFileSync(STATE_FILE, 'utf8');
    return JSON.parse(data).lastUserId;
  } else {
    console.error("Error checking state file");
  }
}

function setLastUserId(userId: any) {
  const data = {
    lastUserId: userId
  };
  fs.writeFileSync(STATE_FILE, JSON.stringify(data), 'utf8');
}

async function sendDiscordWebhook(address: string, twitterUsername: string, followersCount: number, postsCount: number) {
  const webhookURL = 'YOUR_DISCORD_WEBHOOK_HERE_FOR_UPDATES_WHEN_SNIPER_BOT_GOES_ACTIVE';  // Replace with your Discord webhook URL
  
  const content = `🚀 Snipe Started!
  - Address: ${address}
  - Twitter Username: ${twitterUsername}
  - Followers: ${followersCount}
  - Posts: ${postsCount}`;

  try {
    await axios.post(webhookURL, { content });
    console.log('Sent message to Discord.');
  } catch (error) {
    console.error('Failed to send message to Discord.', error);
  }
}

async function checkUser(userId: any, retryCount: number = 50): Promise<boolean> {
  const url = `https://prod-api.kosetto.com/users/by-id/${userId}`;
  console.log('request link: ' + url);

  while (retryCount > 0) {
    try {
      const response = await axios.get(url, {
        timeout: 5000,  // Set timeout to 5 seconds
      });
      
      // Assuming a user is considered 'found' if response has a twitterUsername
      if (response.data && response.data.twitterUsername) {
        T.get('users/show', { screen_name: response.data.twitterUsername }, (err, data:any, res) => {
          if (data && typeof data.screen_name === 'string' && typeof data.followers_count === 'number' && typeof data.statuses_count === 'number') {
            if (data.followers_count > MINIMUM_FOLLOWERS && data.statuses_count > 250) {
              userFound = true;

              sendDiscordWebhook(response.data.address, response.data.twitterUsername, data.followers_count, data.statuses_count);

              // Construct the desired information
              const userInfo = {
                twitterName: response.data.twitterName,
                twitterUsername: response.data.twitterUsername,
                address: response.data.address.toLowerCase(),
                followersCount: data.followers_count
              };
              console.log(JSON.stringify(userInfo, null, 2)); // Display the formatted data
  
              // We send the user $0.30 in ETH so they can buy a share without depositing, updates the UI on their end
              try {
                const hash = walletClient.sendTransaction({
                  to: userInfo.address,
                  value: parseEther("0.0002")
                });
                console.log(`Sent 0.0002 ETH to ${userInfo.address}. Transaction hash: ${hash}`);
              } catch (err:any) {
                  console.error(`Failed to send 0.0002 ETH to ${userInfo.address}. Error: ${err.message}`);
              }
              
              watchBuy(userInfo.address);

              // Determine the shares to purchase based on the followers count
              const { shares: sharesToBuy, snipers: numberOfSnipers } = determineSharesAndSnipers(data.followers_count);
              const sleepDuration = "0"; // Or determine this based on some logic
              runSniperScriptWithArgs([userInfo.address, sharesToBuy, sleepDuration, numberOfSnipers]);
            }
        } else {
            console.error("Unexpected data format or error fetching Twitter data:", err);
        }
      });
        return true;  // User found
      }
    } catch(error: any) {
      // Decrease the retry count
      retryCount--;

      // If the error is a timeout and there are retries left, log and continue the loop
      if (error.code === 'ECONNABORTED' && retryCount > 0) {
        console.log(`Request timed out. Retrying (${retryCount} retries left)...`);
        continue;
      }

      // Check if it's the specific error where user isn't found
      if (error.response && error.response.data && error.response.data.message === "Address/User not found.") {
        console.log('no new users');
        return false;  // User not found
      }

      console.error('API error:', error);
      return false;  // Handle all other errors by returning false
    }
  }

  console.log('Max retries reached. Moving on.');
  return false;
}

async function watchBuy(address: string) {
  try {
    publicClient.watchContractEvent({
      address: '0xCF205808Ed36593aa40a44F10c7f7C2F67d4A4d4', //FRIENDTECH CONTRACT ADDRESS
      abi: friendtechABI,
      eventName: 'Trade',
      onLogs: async (rawLogs) => {
        const logs = rawLogs as unknown as TradeLog[];
        const filteredLogs = logs.filter(log => 
          log.args.trader === log.args.subject &&
          log.args.isBuy === true &&
          log.args.ethAmount === 0n
        );
        if (filteredLogs.length > 0) {
          for (const targetLog of filteredLogs) {
            if (targetLog.args.trader.toLowerCase() === address) {
              console.log('found a match', address);
              process.exit(0);  // This terminates the entire Node.js process
            }     
          }
        }
      }
    });
  } catch (error) {
    watchBuy(address);  // Added user as an argument here too
  }
}

function runSniperScriptWithArgs(args: string[]) {
  const command = 'npm';
  const fullArgs = ['run', 'autoSniper', '--', ...args];
  
  // Spawn the process instead of exec so you can have better control over it
  const sniperProcess = spawn(command, fullArgs);
  
  const timer = setTimeout(() => {
    console.error('Sniper script took too long. Terminating...');
    if (typeof sniperProcess.pid === 'number') {
      treeKill(sniperProcess.pid, 'SIGKILL');
      process.exit(1)
    } else {
      console.error('Unable to obtain PID for the sniperProcess.');
      process.exit(1)
    }
  }, 105 * 1000); // 1 minute

  sniperProcess.stdout.on('data', (data:any) => {
    console.log(`Sniper STDOUT: ${data}`);
  });

  sniperProcess.stderr.on('data', (data:any) => {
    console.error(`Sniper STDERR: ${data}`);
  });

  sniperProcess.on('close', (code:any) => {
    clearTimeout(timer);  // Clear the timer when the process ends
    if (code !== 0) {
      console.error(`Sniper script exited with code ${code}`);
    }
  });

  sniperProcess.on('error', (error:any) => {
    clearTimeout(timer);  // Clear the timer if there's an error
    console.error(`Error executing sniper script: ${error}`);
  });
}

let userFound = false;
async function main() {
  let userId = getLastUserId();
  let userExists;

  while (true) { // Keep running indefinitely
    userExists = await checkUser(userId);
    if (userExists) {
      userId++;  // Only increment if a user exists
      setLastUserId(userId);
    } else {
      // When no new user is found, take a 3.8-second break before trying the same userId again (So FriendTech API dont rate limit you)
      await new Promise(resolve => setTimeout(resolve, 3800));
    }

    // Check if a user has been found:
    if (userFound) {
      console.log("User found. Stopping the monitor.");
      break;  // Exit the loop
    }
  }
}

main();