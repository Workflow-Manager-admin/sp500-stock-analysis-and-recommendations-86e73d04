#!/bin/bash
cd /home/kavia/workspace/code-generation/sp500-stock-analysis-and-recommendations-86e73d04/sp500_stock_evaluator_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

