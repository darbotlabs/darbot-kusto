#!/usr/bin/env node
// server.ts - Specific handler for MCP server invocation
// This ensures no prompts during VS Code MCP server installation
import KustoMCPConnector from './mcpConnector';
import * as path from 'path';
import * as fs from 'fs';

console.log('Darbot Kusto MCP server initializing...');
console.log('Windows/Azure authentication will be used by default.');
console.log('Configuration will be requested only when needed.');

process.exitCode = 0;
