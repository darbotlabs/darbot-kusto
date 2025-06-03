# Changelog

## 0.9.6 (2024-12-19)

### Fixed

- Resolved merge conflicts in server.ts and test/unit/cli.test.js
- Fixed TypeScript compilation errors by removing duplicate QueryResult interface
- Enhanced extractQueryResult helper method to properly handle KustoResultTable generators
- All return statements now properly include both columns and rows properties
- Improved test coverage and reliability

### Improved

- Better error handling in query result processing
- More robust type definitions for query results
- Enhanced CLI functionality and validation

### Testing

- 11 unit tests passing
- Comprehensive test suite for CLI commands
- Integration tests validate core functionality

## 0.9.0-beta (YYYY-MM-DD)

- Initial beta release.
