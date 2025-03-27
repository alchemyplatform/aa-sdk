#!/bin/bash

# Maximum number of retries
MAX_RETRIES=3
# Delay between retries (in seconds)
RETRY_DELAY=10

# The command to run
COMMAND="vocs build"

# Retry logic
for (( i=1; i<=$MAX_RETRIES; i++ ))
do
    echo "Attempt $i/$MAX_RETRIES: Running build command..."
    $COMMAND
    EXIT_CODE=$?

    if [ $EXIT_CODE -eq 0 ]; then
        echo "Build succeeded!"
        exit 0
    else
        echo "Build failed with exit code $EXIT_CODE."
        if [ $i -lt $MAX_RETRIES ]; then
            echo "Retrying in $RETRY_DELAY seconds..."
            sleep $RETRY_DELAY
        fi
    fi
done

echo "Build failed after $MAX_RETRIES attempts."
exit 1
