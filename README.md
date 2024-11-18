# Multi-Stage Rocket Controller (MSRC)

## Installation Instructions
>[!WARNING]
> You will need to have two terminals open. One for the WebSocket server (`Serial.py`) and the other will be for the application. This [requires the newest version of Python](https://www.python.org/downloads/).

```
npm i
```
This will install all dependencies for the application. To run the WebSocket server script, you will need to do the following:
```
cd ./src/main/
pip install -r requirements.txt
```

## Running the Application
>[!WARNING]
> In order to run the Rocket Visualizer, you first need run the python script, *then* run the application.

```
cd ./src/main
python Serial.py
```
>[!NOTE]
>For the above script, `python` might not be the right command. Please [check your version](https://note.nkmk.me/en/python-sys-platform-version-info/) before continuing.

In a new terminal, you can run:
```
npm run dev
```
>[!NOTE]
> There are other commands that are within the framework that we used ([electron-vite](https://electron-vite.org/)). You can customize this to your liking.