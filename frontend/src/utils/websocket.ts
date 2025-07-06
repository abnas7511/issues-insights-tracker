import { Issue } from '../types';

// Utility for connecting to backend WebSocket for real-time updates
// Usage: const ws = connectIssuesWebSocket(onUpdate)

export function connectIssuesWebSocket(onUpdate: (data: Issue) => void) {
  // Use window.location for dynamic host, fallback to localhost
  const loc = window.location;
  const wsProtocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
  let wsHost = loc.hostname + (loc.port ? ':' + loc.port : '');
  // If running on localhost, use backend port 8000 by default
  if (loc.hostname === 'localhost' || loc.hostname === '127.0.0.1') {
    wsHost = loc.hostname + ':8000';
  }
  // Generate a random client_id
  const clientId = crypto.randomUUID();
  const wsUrl = `${wsProtocol}//${wsHost}/ws/${clientId}`;
  const ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    try {
      // Backend sends stringified dict, so parse twice if needed
      let msg = event.data;
      if (typeof msg === 'string' && msg.startsWith("{'type'")) {
        // Replace single quotes with double for JSON parse
        msg = msg.replace(/'/g, '"');
      }
      const data = JSON.parse(msg);
      if (data.type === 'issue_update') {
        onUpdate(data.data);
      }
    } catch {
      // Ignore parse errors
    }
  };

  return ws;
}
