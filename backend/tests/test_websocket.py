import pytest
import asyncio
from unittest.mock import AsyncMock
from app.core.websocket import WebSocketManager

@pytest.mark.asyncio
async def test_connect_and_disconnect():
    manager = WebSocketManager()
    ws = AsyncMock()
    await manager.connect(ws, "client1")
    assert "client1" in manager.active_connections
    manager.disconnect("client1")
    assert "client1" not in manager.active_connections

@pytest.mark.asyncio
async def test_send_personal_message():
    manager = WebSocketManager()
    ws = AsyncMock()
    await manager.connect(ws, "client2")
    await manager.send_personal_message("hello", "client2")
    ws.send_text.assert_called_with("hello")

@pytest.mark.asyncio
async def test_broadcast():
    manager = WebSocketManager()
    ws1 = AsyncMock()
    ws2 = AsyncMock()
    await manager.connect(ws1, "c1")
    await manager.connect(ws2, "c2")
    await manager.broadcast("msg")
    ws1.send_text.assert_called_with("msg")
    ws2.send_text.assert_called_with("msg")

@pytest.mark.asyncio
async def test_broadcast_issue_update():
    manager = WebSocketManager()
    ws = AsyncMock()
    await manager.connect(ws, "c3")
    await manager.broadcast_issue_update({"id": 1, "title": "Test"})
    ws.send_text.assert_called()
