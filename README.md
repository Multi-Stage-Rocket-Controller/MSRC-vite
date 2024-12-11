# Multi-Stage Rocket Controller (MSRC)

## Installation Instructions
>[!WARNING]
> When running the application a secondary server "active" terminal will be open. This needs to be closed after running the application for future use.
>
Install Node.js (https://nodejs.org/en/learn/getting-started/how-to-install-nodejs)

when in the project, run:
```
npm i
```
This will install all dependencies for the application.

## Websocket development:
>[!NOTE]
> Make sure to have atleast python 3.11 downloaded onto your system before doing any development with the python websocket server.
>(https://www.python.org/downloads/)

Set up your virtual environment (https://docs.python.org/3/library/venv.html):
```
python -m venv /path/to/new/virtual/environment
```
Activate your environment:

Windows
```
.\venv\Scripts\activate
```

Linux
```
source venv/Scripts/bin/activate
```

Install dependencies:
```
cd ./src/python-server
pip install -r requirements.txt
```

## Running the Application
In a new terminal, you can run:
```
npm run dev
```
This also starts the python websocket server in the background that has been nicely compiled into an executable file.
>[!WARNING]
>It should be noted that we currently have trouble building the application.
>```npm start``` will not work with the current configuration of packages and code and would need to be looked into for future versions.

>[!NOTE]
> There are other commands that are within the framework that we used ([electron-vite](https://electron-vite.org/)). You can customize this to your liking.

>[!NOTE]
>Currently we have Linux and Windows funcitonality But nothing with darwin for MacOS systems.
