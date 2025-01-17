# FriendTech-Sniper-Bot
The best MEV bot to snipe on FriendTech (Worked flawlessly on my side, but I just threw it all on Github without making it user-friendly). If people are actually interested, let me know @ and I can try a bit harder and make it user-friendly. This software led the market the past week (30%-60%) and beat competition. At the time of writing, 2-3 competitors had software on the same level.

Big Picture: We send a ton of transactions every block to the Base blockchain, hoping our transaction occurs right after a user buys their first key.
Flow is like this => When a new user deposits funds, you can start the manualSnipe script and your computer or server will start sending a lot of calls to a smart contract you deployed. The smart contract contains a pool of your assets and when called, will call the FriendTech contract and buy, hold, and sell keys. By creating a proxy smart contract to interact with the FriendTech contract, we can efficiently use our pool of assets, rather then keeping them an EOAs. (more size, more speed)

This is the leading MEV software to snipe new keys on FriendTech. Below is how to set it up

1) Download the package onto your computer, make sure you have NodeJS installed on your computer
2) Set up a MetaMask wallet and add some funds on the Base blockchain
3) Copy the smart contract "snipe.sol" into Remix or your platform of choice and deploy it on the Base blockchain (parameter is FriendTech contract address => 0xcf205808ed36593aa40a44f10c7f7c2f67d4a4d4)
4) Create 10 new addresses on the Base blockchain (all of these accounts need to have ETH for gas fees, 0.1 min)
5) Use the whitelist function on your deployed smart contract to whitelist all of your 10 addresses. (Only whitelisted addresses can call the smart contract)
6) Deposit some ETH into your deployed smart contract. (This pool of ETH will be used to buy and sell keys on FriendTech)
7) Update the following:
   a) Get a set of API keys from Twitter's Developer Portal, and add them to autoSnipe.ts (lines 43-46)
   b) Add a Discord webhook to line 92 in autoSnipe.ts
   c) Create 10 different private key accounts. Update autoSniper.ts with all 10 addresses of your new accounts (lines 5-14)
   d) Update manualSnipe.ts with all 10 account addresses as well (lines 6-15)
   e) Update manualSniper.ts with your deplolyed contract address from step 2 (line 19)
   f) Update sniper.ts with your deplolyed contract address from step 2 (line 19)
   g) Update client.ts with your rpcs and private keys
   h) Update state.json with the latest new userID that has joined FriendTech. You can find this by going to this link:
      https://prod-api.kosetto.com/users/by-id/194000 => and keep increasing the userID until the website says user not found
8) Open a new terminal and run "npm install"
9) Run "tsc"

Now you have 2 modes to run 
1) npm run manualSnipe => This is for manual sniping. You provide a user's address (from a monitor, check my github for the monitor setup), how many keys you want to snipe, and a delay time (in milliseconds) and the bot will start running and attempt to buy a user's key until it reaches max retries or the script is stopped by the user
2) npm run autoSnipe => This creates an in-house monitor that actively watches for new users, checks their Twitter metrics, and begins a snipe if it thinks its solid from a simple algo. Sends Discord notification when snipes starts, so you can cancel out if you want to. Everything is automated, but you should customize the code to your liking. You also run chmod +x restartScript.sh and then start the script with ./restartScript.sh if you want it to continuously run (24/7).


Disclaimer: Please interact with the software at your own risk, I am not responsible for any financial loss or any downside caused by it. I cannot guarantee any results from it. The software is not an offering from me. I share no responsibility for the usage and outcome of this now open-sourced software.
