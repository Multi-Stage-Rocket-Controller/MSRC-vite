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
    global sending_data  # Reset the current index when a new client connects
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
    global current_index, sending_data
    try:
        df = pd.read_csv(file_path)
        while current_index < len(df):
            # Check for "stop" or "reset" messages asynchronously
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=0.1)
                if message == "stop":
                    sending_data = False
                    await wait_for_start_stop(websocket)  # Pause until "start" or "reset" is received
                elif message == "reset":
                    sending_data = False
                    current_index = 0
                    file_path = ""
                    await wait_for_start_stop(websocket)  # Wait for a "start" command to resume
            except asyncio.TimeoutError:
                pass  # No message received; continue processing

            if sending_data:
                row = df.iloc[current_index]
                data = row.to_json()
                print(f"Current index is: {current_index}" )
                await websocket.send(data)
                current_index += 1
                await asyncio.sleep(0.1)  # Wait before sending the next row
            else:
                await wait_for_start_stop(websocket)  # Wait for a "start" command to resume
    except Exception as e:
        error_message = json.dumps({"error": str(e)})
        print(f"Error sending data to client: {error_message}")
        await websocket.send(error_message)


# Handle live data streaming
async def handle_live(websocket):
    global sending_data, serial_port
    try:
        port_name = await find_serial_port()
        if port_name is None:
            error_message = json.dumps({"error": "No active serial port found"})
            print(f"Error: {error_message}")
            await websocket.send(error_message)
            return

        # Determine the root directory and create the Replays folder
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
        replays_dir = os.path.join(root_dir, 'Replays')
        os.makedirs(replays_dir, exist_ok=True)

        await wait_for_start_stop(websocket)  # Wait for the "start" message first

        # Open the serial port
        serial_port = serial.Serial(port_name, 115200, timeout=0.1)  # Add timeout to avoid blocking

        while True:
            # Check for WebSocket messages
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=0.1)
                if message == "stop":
                    sending_data = False
                elif message == "reset":
                    sending_data = False
                    # Reset any other state here if needed
            except asyncio.TimeoutError:
                pass  # No message received; continue processing

            if sending_data:
                # Attempt to read a line from the serial port
                line = serial_port.readline().decode('utf-8').strip()
                if line:
                    print(f"Read line from serial: {line}")
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

                await asyncio.sleep(0.1)  # Allow other tasks to run
            else:
                # If not sending data, wait for a "start" command
                await wait_for_start_stop(websocket)

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
    print(f"Available ports: {ports}")
    for port in ports:
        print(f"Trying port: {port.device}")
        try:
            ser = serial.Serial(port.device, 115200, timeout=1)
            line = ser.readline(10).decode('utf-8').strip()  # Read from the port without sending any data
            print(f"Response from port {port.device}: {line}")
            if line:  # If we get a response, this is our port
                print(ser)
                ser.close()  # Close the port after detecting it
                return port.device
        except (OSError, serial.SerialException) as e:
            print(f"Error with port {port.device}: {e}")
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