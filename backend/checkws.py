import asyncio
import websockets

async def listen():
    uri = "ws://localhost:8000/ws/testclient"
    async with websockets.connect(uri) as websocket:
        while True:
            msg = await websocket.recv()
            print(msg)

asyncio.run(listen())