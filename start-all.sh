#!/bin/bash

echo "Starting Travel Route Planner..."

echo "Starting backend server..."
cd server && npm run dev &
BACKEND_PID=$!

echo "Waiting for backend server to start..."
sleep 3

echo "Starting frontend development server..."
cd .. && npm run dev &
FRONTEND_PID=$!

echo "Both servers are starting..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers..."

trap "kill $BACKEND_PID $FRONTEND_PID; echo 'Servers stopped.'; exit" INT TERM

wait