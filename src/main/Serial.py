import asyncio
import websockets
import pandas as pd
import json
import serial
import datetime
import os
from serial.tools import list_ports

clients = set()
serial_port = None
sending_data = False
current_index = 0  # Global variable to keep track of the current index

# Handle incoming WebSocket connections
async def handle_client(websocket):
    global sending_data
    clients.add(websocket)
    print(f"Client connected: {websocket.remote_address}")
    current_index = 0  # Reset the current index when a new client connects
    try:
        async for message in websocket:
            print(f"Received message: {message}")
            if message.startswith("replay"):
                _, file_path = message.split(", ")
                await handle_replay(websocket, file_path)
            elif message == "live":
                await handle_live(websocket)
    except websockets.exceptions.ConnectionClosedError as e:
        print(f"Connection closed with error: {e}")
    finally:
        clients.remove(websocket)
        print(f"Client disconnected: {websocket.remote_address}")

# Handle replay data
async def handle_replay(websocket, file_path):
    global current_index
    try:
        await wait_for_start_stop(websocket)  # Wait for the "start" message first
        if sending_data:  # Check if we should start sending data
            df = pd.read_csv(file_path)
            while current_index < len(df):
                if not sending_data:
                    break
                row = df.iloc[current_index]
                data = row.to_json()
                print(f"Sending data to client: {data}")
                await websocket.send(data)
                current_index += 1
                await asyncio.sleep(0.1)  # Wait for 0.5 seconds before sending the next row
    except Exception as e:
        error_message = json.dumps({"error": str(e)})
        print(f"Error sending data to client: {error_message}")
        await websocket.send(error_message)

# Handle live data streaming
async def handle_live(websocket):
    global serial_port
    try:
        serial_port = await find_serial_port()
        if serial_port is None:
            error_message = json.dumps({"error": "No active serial port found"})
            print(f"Error: {error_message}")
            await websocket.send(error_message)
            return

        # Determine the root directory and create the Replays folder
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
        replays_dir = os.path.join(root_dir, 'Replays')
        os.makedirs(replays_dir, exist_ok=True)

        await wait_for_start_stop(websocket)  # Wait for the "start" message first

        while True:
            if sending_data:
                line = serial_port.readline().decode('utf-8').strip()
                values = line.split(',')
                if len(values) >= 9 and values[8] == '0':
                    timestamp = datetime.datetime.now().isoformat()
                    data = {
                        "timestamp": timestamp,
                        "Roll_Radians": values[0],
                        "Pitch_Radians": values[1],
                        "Yaw_Radians": values[2],
                        "Latitude": values[3],
                        "Longitude": values[4],
                        "Acc_net": values[5],
                        "Altitude": values[6],
                        "Voltage": values[7],
                        "System_State": values[8]
                    }
                    json_data = json.dumps(data)
                    print(f"Sending data to client: {json_data}")
                    await websocket.send(json_data)
                    csv_file_path = os.path.join(replays_dir, f"RocketTelemetry-{datetime.datetime.now().date()}.csv")
                    with open(csv_file_path, "a") as f:
                        f.write(f"{timestamp},{','.join(values)}\n")
            else:
                await wait_for_start_stop(websocket)  # Wait for the next "start" or "stop" message
    except Exception as e:
        error_message = json.dumps({"error": str(e)})
        print(f"Error sending data to client: {error_message}")
        await websocket.send(error_message)

# Wait for the "start" or "stop" commands
async def wait_for_start_stop(websocket):
    global sending_data, current_index
    async for message in websocket:
        if message == "start":
            sending_data = True
            break
        elif message == "stop":
            sending_data = False
            break
        elif message == "reset":
            sending_data = False
            current_index = 0
            break

# Find the active serial port
async def find_serial_port():
    ports = list_ports.comports()
    for port in ports:
        try:
            ser = serial.Serial(port.device, 115200, timeout=120)
            ser.write(b'\n')  # Send a newline to prompt any response
            line = ser.readline().decode('utf-8').strip()
            if line:  # If we get a response, this is our port
                return ser
        except (OSError, serial.SerialException):
            continue
    return None

# Main entry point to start the WebSocket server
async def main():
    async with websockets.serve(handle_client, "localhost", 8080):  # Ensure port is 8080
        print("WebSocket server started on ws://localhost:8080")
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    # Determine the root directory and create the Replays folder
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    replays_dir = os.path.join(root_dir, 'Replays')
    os.makedirs(replays_dir, exist_ok=True)

    # Create the initial CSV file in the Replays folder if it doesn't exist
    csv_file_path = os.path.join(replays_dir, f"RocketTelemetry-{datetime.datetime.now().date()}.csv")
    if not os.path.exists(csv_file_path):
        with open(csv_file_path, "w") as f:
            f.write("timestamp,Roll_Radians,Pitch_Radians,Yaw_Radians,Latitude,Longitude,Acc_net,Altitude,Voltage,System_State\n")

    asyncio.run(main())