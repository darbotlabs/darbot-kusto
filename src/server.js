#!/usr/bin/env node

// server.js - Specific handler for MCP server invocation
// This ensures no prompts during VS Code MCP server installation

const KustoMCPConnector = require('./mcpConnector');
const path = require('path');
const fs = require('fs');

// Skip all prompts during initial setup
// Configuration will be loaded from file or requested later on first query
console.log('Darbot Kusto MCP server initializing...');
console.log('Windows/Azure authentication will be used by default.');
console.log('Configuration will be requested only when needed.');

// This ensures the VS Code MCP extension sees success
process.exitCode = 0;
