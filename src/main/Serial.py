import asyncio
import websockets
import pandas as pd
import json
import serial
import datetime
import os
import re
from serial.tools import list_ports
from io import StringIO

# Set of connected clients
clients = set()

# Class to maintain the state for each client
class ClientState:
    def __init__(self):
        self.mode = None  # 'replay' or 'live'
        self.file_path = None
        self.df = None  # DataFrame for replay mode
        self.current_index = 0
        self.sending_data = False
        self.serial_port = None
        self.start_event = asyncio.Event()  # Event to signal start
        self.stop_event = asyncio.Event()   # Event to signal stop
        self.reset_event = asyncio.Event()  # Event to signal reset
        self.mode_event = asyncio.Event()   # Event to signal mode change
        self.csv_file_path = None           # CSV file path for live data

# Handle incoming WebSocket connections
async def handle_client(websocket):
    clients.add(websocket)
    print(f"Client connected: {websocket.remote_address}")

    client_state = ClientState()
    data_task = None  # Initialize data_task

    try:
        # Create task for handling messages
        message_task = asyncio.create_task(message_handler(websocket, client_state))

        while True:
            # Wait for mode to be set
            await client_state.mode_event.wait()
            client_state.mode_event.clear()

            # Cancel any existing data_task
            if data_task and not data_task.done():
                data_task.cancel()
                try:
                    await data_task
                except asyncio.CancelledError:
                    pass

            # Start new data_task based on the mode
            if client_state.mode == 'replay':
                data_task = asyncio.create_task(send_replay_data(client_state))
            elif client_state.mode == 'live':
                data_task = asyncio.create_task(send_live_data(client_state))
            else:
                data_task = None  # Unknown mode

    except websockets.exceptions.ConnectionClosedError as e:
        print(f"Connection closed with error: {e}")
    except Exception as e:
        print(f"Exception in handle_client: {e}")
    finally:
        if data_task and not data_task.done():
            data_task.cancel()
            try:
                await data_task
            except asyncio.CancelledError:
                pass
        if client_state.serial_port and client_state.serial_port.is_open:
            client_state.serial_port.close()
        clients.remove(websocket)
        print(f"Client disconnected: {websocket.remote_address}")

# Task to handle incoming messages from the client
async def message_handler(websocket, client_state):
    try:
        async for message in websocket:
            print(f"Received message: {message}")

            # Attempt to parse the message as JSON
            try:
                message_data = json.loads(message)
            except json.JSONDecodeError:
                message_data = None

            if message_data and message_data.get('type') == 'replay':
                # Message contains file content from web client
                filename = message_data.get('filename')
                content = message_data.get('content')
                client_state.mode = 'replay'
                client_state.file_path = filename
                client_state.df = pd.read_csv(StringIO(content))
                client_state.current_index = 0
                client_state.sending_data = False
                # Clear events
                client_state.start_event.clear()
                client_state.stop_event.clear()
                client_state.reset_event.clear()
                client_state.mode_event.set()
                print(f"Replay mode initialized with file content: {filename}")
            elif message.startswith("replay"):
                _, file_path = message.split(", ")
                client_state.mode = 'replay'
                client_state.file_path = file_path
                client_state.df = pd.read_csv(file_path)
                client_state.current_index = 0
                client_state.sending_data = False
                # Clear events
                client_state.start_event.clear()
                client_state.stop_event.clear()
                client_state.reset_event.clear()
                client_state.mode_event.set()
                print(f"Replay mode initialized with file: {file_path}")
            elif message == "live":
                client_state.mode = 'live'
                client_state.sending_data = False
                # Clear events
                client_state.start_event.clear()
                client_state.stop_event.clear()
                client_state.reset_event.clear()
                client_state.mode_event.set()
                print("Live mode initialized")
            elif message == "start":
                client_state.sending_data = True
                client_state.start_event.set()
                print("Data sending started")
            elif message == "stop":
                client_state.sending_data = False
                client_state.stop_event.set()
                print("Data sending stopped")
                # Do not close the serial port here; we'll handle it in the live data function
            elif message == "reset":
                client_state.sending_data = False
                client_state.reset_event.set()
                print("Data sending reset")
    except websockets.exceptions.ConnectionClosedError as e:
        print(f"Connection closed with error: {e}")
    except Exception as e:
        print(f"Exception in message_handler: {e}")

# Function to broadcast a message to all connected clients
async def broadcast_to_clients(message):
    disconnected_clients = set()
    for client in clients:
        try:
            await client.send(message)
        except websockets.exceptions.ConnectionClosed:
            disconnected_clients.add(client)
    # Remove disconnected clients
    clients.difference_update(disconnected_clients)

# Function to send replay data from CSV file
async def send_replay_data(client_state):
    try:
        print("Starting replay data sender")
        while client_state.current_index < len(client_state.df):
            if client_state.sending_data:
                row = client_state.df.iloc[client_state.current_index]
                data = row.to_json()
                print(f"Sending data at index {client_state.current_index}: {data}")
                await broadcast_to_clients(data)
                client_state.current_index += 1
                await asyncio.sleep(0.1)  # Adjust as needed
            else:
                # Wait for start or reset
                start_wait_task = asyncio.create_task(client_state.start_event.wait())
                reset_wait_task = asyncio.create_task(client_state.reset_event.wait())
                try:
                    done, pending = await asyncio.wait(
                        [start_wait_task, reset_wait_task],
                        return_when=asyncio.FIRST_COMPLETED
                    )

                    if start_wait_task in done:
                        client_state.start_event.clear()
                        client_state.sending_data = True
                        reset_wait_task.cancel()
                        await asyncio.gather(reset_wait_task, return_exceptions=True)
                    elif reset_wait_task in done:
                        client_state.reset_event.clear()
                        client_state.current_index = 0
                        client_state.sending_data = False
                        start_wait_task.cancel()
                        await asyncio.gather(start_wait_task, return_exceptions=True)
                        print("Replay data sender reset")
                        break  # Exit the loop to allow for mode change or re-initialization
                except asyncio.CancelledError:
                    start_wait_task.cancel()
                    reset_wait_task.cancel()
                    await asyncio.gather(start_wait_task, reset_wait_task, return_exceptions=True)
                    raise
        print("Exiting replay data sender")
    except asyncio.CancelledError:
        print("Replay data sender cancelled")
        raise
    except Exception as e:
        print(f"Exception in send_replay_data: {e}")
        error_message = json.dumps({"error": str(e)})
        await broadcast_to_clients(error_message)

# Function to send live data from serial port
async def send_live_data(client_state):
    try:
        port_name = await find_serial_port()
        if port_name is None:
            error_message = json.dumps({"error": "No active serial port found"})
            print(f"Error: {error_message}")
            await broadcast_to_clients(error_message)
            return

        # Open the serial port
        client_state.serial_port = serial.Serial(port_name, 115200, timeout=0.1)
        print("Starting live data sender")

        # Determine the root directory and create the Replays folder
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
        replays_dir = os.path.join(root_dir, 'Replays')
        os.makedirs(replays_dir, exist_ok=True)

        # Calculate csv_file_path once when live data starts
        current_time_str = re.sub(r'\.\d+', '', datetime.datetime.now().isoformat()).replace(':', '-')
        csv_file_name = f"RocketTelemetry-{current_time_str}.csv"
        client_state.csv_file_path = os.path.join(replays_dir, csv_file_name)
        # Create the initial CSV file
        with open(client_state.csv_file_path, "w") as f:
            f.write("timestamp,Roll_Radians,Pitch_Radians,Yaw_Radians,Latitude,Longitude,Acc_net,Altitude,Voltage,System_State\n")

        while True:
            if client_state.sending_data:
                # Ensure serial port is open
                if client_state.serial_port is None or not client_state.serial_port.is_open:
                    port_name = await find_serial_port()
                    if port_name is None:
                        error_message = json.dumps({"error": "No active serial port found"})
                        print(f"Error: {error_message}")
                        await broadcast_to_clients(error_message)
                        client_state.sending_data = False
                        continue
                    try:
                        client_state.serial_port = serial.Serial(port_name, 115200, timeout=0.1)
                        print("Serial port re-opened")
                    except Exception as e:
                        error_message = json.dumps({"error": f"Failed to open serial port: {e}"})
                        print(error_message)
                        await broadcast_to_clients(error_message)
                        client_state.sending_data = False
                        continue

                # Read line from serial port
                line = client_state.serial_port.readline().decode('utf-8').strip()
                if line:
                    print(f"Read line from serial: {line}")
                    values = line.split(',')
                    if len(values) >= 9:
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
                        print(f"Sending data to clients: {json_data}")
                        await broadcast_to_clients(json_data)
                        # Append data to CSV file
                        with open(client_state.csv_file_path, "a") as f:
                            f.write(f"{timestamp},{','.join(values)}\n")
                await asyncio.sleep(0.1)  # Adjust as needed
            else:
                # Close serial port if open
                if client_state.serial_port and client_state.serial_port.is_open:
                    client_state.serial_port.close()
                    print("Serial port closed because sending_data is False")

                # Wait for start or reset
                start_wait_task = asyncio.create_task(client_state.start_event.wait())
                reset_wait_task = asyncio.create_task(client_state.reset_event.wait())
                try:
                    done, pending = await asyncio.wait(
                        [start_wait_task, reset_wait_task],
                        return_when=asyncio.FIRST_COMPLETED
                    )

                    if start_wait_task in done:
                        client_state.start_event.clear()
                        client_state.sending_data = True
                        reset_wait_task.cancel()
                        await asyncio.gather(reset_wait_task, return_exceptions=True)
                        # Re-open serial port if needed
                        continue  # Loop will handle re-opening
                    elif reset_wait_task in done:
                        client_state.reset_event.clear()
                        client_state.sending_data = False
                        start_wait_task.cancel()
                        await asyncio.gather(start_wait_task, return_exceptions=True)
                        # Exit the loop to allow for mode change
                        print("Reset event set, exiting live data sender")
                        break
                except asyncio.CancelledError:
                    start_wait_task.cancel()
                    reset_wait_task.cancel()
                    await asyncio.gather(start_wait_task, reset_wait_task, return_exceptions=True)
                    raise

        print("Exiting live data sender")
    except asyncio.CancelledError:
        print("Live data sender cancelled")
        # Close serial port if open
        if client_state.serial_port and client_state.serial_port.is_open:
            client_state.serial_port.close()
            print("Serial port closed due to cancellation")
        raise
    except Exception as e:
        print(f"Exception in send_live_data: {e}")
        error_message = json.dumps({"error": str(e)})
        await broadcast_to_clients(error_message)
        # Close serial port if open
        if client_state.serial_port and client_state.serial_port.is_open:
            client_state.serial_port.close()
            print("Serial port closed due to exception")

# Function to find the active serial port
async def find_serial_port():
    ports = list_ports.comports()
    print(f"Available ports: {ports}")
    for port in ports:
        print(f"Trying port: {port.device}")
        try:
            ser = serial.Serial(port.device, 115200, timeout=1)
            line = ser.readline(10).decode('utf-8').strip()
            print(f"Response from port {port.device}: {line}")
            if line:
                ser.close()
                return port.device
            ser.close()
        except (OSError, serial.SerialException) as e:
            print(f"Error with port {port.device}: {e}")
            continue
    return None

# Main entry point to start the WebSocket server
async def main():
    async with websockets.serve(handle_client, "localhost", 8080):
        print("WebSocket server started on ws://localhost:8080")
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    # Run the main function
    asyncio.run(main())
