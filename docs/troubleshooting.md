# Troubleshooting

## Common Issues

- **VPN/Firewall:** If you see `ETIMEDOUT` or other network errors, ensure your VPN or firewall allows connections to the Kusto cluster.
- **Authentication:**
  - Double-check your credentials (token, AAD app registration details).
  - Ensure the service principal or your user account has appropriate permissions on the Kusto database.
- **HTTP Error Codes:**
  - `401 Unauthorized`: Authentication failed. Verify credentials and permissions.
  - `403 Forbidden`: You are authenticated but not authorized to access the resource. Check Kusto permissions.
  - `404 Not Found`: The cluster or database might be incorrect, or the specific API endpoint doesn't exist.
  - `500 Internal Server Error`: An issue on the Kusto service side. Try again later.
  - `503 Service Unavailable`: The Kusto service is temporarily unavailable or overloaded. Try again later.
