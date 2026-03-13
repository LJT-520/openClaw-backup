const WebSocket = require('ws');
const express = require('express');

const app = express();
const MCP_PORT = 30000;
const WS_PORT = 30001;

console.log('🚀 Starting AutoClaw MCP Server...');

// WebSocket server for browser extension
const wss = new WebSocket.Server({ port: WS_PORT });

wss.on('connection', function connection(ws) {
  console.log('✅ Browser extension connected');
  
  ws.on('message', function message(data) {
    try {
      const msg = JSON.parse(data.toString());
      console.log('📨 Received from extension:', msg.type);
    } catch (error) {
      console.log('📨 Raw message:', data.toString());
    }
  });

  // Send connection confirmation
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'AutoClaw MCP Server is ready',
    timestamp: Date.now()
  }));
});

// HTTP server for MCP protocol
app.use(express.json());

app.post('/mcp', (req, res) => {
  const { jsonrpc, method, params, id } = req.body;
  
  console.log(`📋 MCP request: ${method}`);
  
  // Handle different MCP methods
  let result;
  switch (method) {
    case 'tools/list':
      result = {
        tools: [
          { name: 'claw_navigate', description: 'Navigate to URL' },
          { name: 'claw_click_element', description: 'Click page element' },
          { name: 'claw_take_screenshot', description: 'Take screenshot' }
        ]
      };
      break;
    case 'tools/call':
      result = { 
        success: true, 
        message: `Executed tool: ${params.name}` 
      };
      break;
    default:
      result = { error: 'Method not found' };
  }
  
  res.json({
    jsonrpc: "2.0",
    id: id,
    result: result
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    mcp_port: MCP_PORT,
    ws_port: WS_PORT,
    timestamp: Date.now()
  });
});

app.listen(MCP_PORT, () => {
  console.log(`🚀 MCP server running on port ${MCP_PORT}`);
  console.log(`🔌 WebSocket server running on port ${WS_PORT}`);
  console.log('📋 MCP endpoint: http://localhost:30000/mcp');
  console.log('❤️  Health check: http://localhost:30000/health');
  console.log('✅ Ready for browser extension connections');
});