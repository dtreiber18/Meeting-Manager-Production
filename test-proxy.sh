#!/bin/bash

echo "Testing proxy endpoint..."
sleep 2
curl -H "Accept: application/json" -v http://localhost:4200/api/meetings/3