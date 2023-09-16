#!/bin/bash

while true; do
  npm run autoSnipe
  
  echo "Script finished or exited with error, waiting..."
  sleep 2  # wait for 5 seconds
done
