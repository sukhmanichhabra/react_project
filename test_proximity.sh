#!/bin/bash

echo "=== PROXIMITY ASSIGNMENT TEST ==="
echo "Starting test for proximity-based property assignment..."
echo ""

# Load environment variables if .env file exists
if [ -f .env ]; then
    echo "Loading environment variables from .env file..."
    export $(cat .env | xargs)
fi

# Run the test script
echo "Running proximity assignment test..."
node test_proximity_assignment.js

echo ""
echo "=== TEST COMPLETED ==="
echo "Check the output above for results."
echo ""
echo "To manually trigger reassignment via API (admin only):"
echo "POST /api/admin/agents/reassign-proximity"
echo ""
echo "Key improvements implemented:"
echo "1. Properties are now assigned to the nearest agent within service radius"
echo "2. Verified agents are prioritized over unverified ones"
echo "3. Service radius is respected (default 50km)"
echo "4. Equal load distribution is now secondary to proximity"
echo "5. Admin endpoint added for manual reassignment"