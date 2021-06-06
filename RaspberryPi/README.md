# RaspberryPi Documentation

In this folder we have all the files that have to be placed on the RaspberryPi.

## Project Dependencies:

- nodejs (Min version 10 - Max version 14)
- firebase
- firebase-tools
- firebase-database
- firebase-auth
- realtime firebase database set up according to the json on the main page
- eslint

## Installation instructions

1. install `node` - version 10, 12 or 14 (12 is __recommended__ )


2. install firebase-tools
   
    1. Type `npm install -g firebase-tools` in terminal, follow the steps
    2. Login into your firebase project
        - Via UI: type `firebase use --add` and follow the steps.
        - Via terminal: type `firebase login --no-localhost`
            - if you do this you will need to add `--token <token>` on all firebase commands
    

3. Initiate firebase project
   
    1. Type `firebase init` in terminal
    2. Navigate with the arrow keys and select the `Database` and `Functions` options, by pressing space
    3. use the default database json rules file
    4. Select `JavaScript` as the project language
    5. (Optional) enable ESLint
    6. Create package.json
    7. Don't overwrite the index.js
    8. (Optional) overwrite .gitignore
    9. Install dependencies
    

4. install project dependencies
    1. Type `npm install firebase` in terminal
    2. Type `npm install serialport` in terminal
    3. Type `npm install -g @serialport/list` in terminal
    
    
5. Detect the serialport
   1. Turn on the Arduino
    2. Connect the arduino to the Raspberry
    3. run `serialport-list` to detect the port on which the arduino is connected
    4. Edit the port in `functions/data.js` (line 5) by substituting `COM3` with the port you are using
    
    
6. Run the project by running `firebase serve` 
    - (Optional) Some distributions need additional firebase modules and will rise errors.
        - Type `npm install firebase-database` in terminal
        - Type `npm install firebase-auth` in terminal
    
    
## Domain knowledge 

The RaspberryPi holds the domain knowledge of the entire ecosystem. All the Rules and logic are going to be described bellow

### Arduino data

Arduino communicates one way with the raspberry, through a serial port. The information comes in a semicolon separated list, 1 reading per line.

Example: `water:600;temprature:21.5`

This translates to the total weight of the kettle + water being __600__ grams, and the current temperature detected being __21.5__ C.
Since the kettle weights ~440gr, and the density of water is approximately 1kg/L RaspberryPi calculates that the kettle has 600 - 440 = 160gr = __160ml__ of water.

#### Water Data Treatment

To avoid the fluctuations due to density, and the standard error of the weight, we preprocess the data.
We do this by calculating the moving average of the last 10 measurements, and by updating the water level only if its quantity changes with more than 5%.

#### Temperature Data Treatment

The data is stored directly and is used to communicate if the kettle brewing or not.
The rules to determine if the water is boiling are as follows:
- If the water temperature is above 30 degrees, the kettle switches the brewing status to `Starting`
- if the water temperature is above 99 degrees, and the brewing status of the Kettle is `Brewing`
it switches the brewing status to `Stop Brewing`

### Kettle statuses

Raspberry waits for notifications of intermediate statuses and performs all the related automatic transitions.

Table of brewing statuses:

| Status        | Description                             | Next Statuses |
|:-------------:|:----------------------------------------|:-------------:|
| Off           | Kettle is off                           | Starting      |
| Starting      | Kettle is booting                       | Idle          | 
| Idle          | Kettle is idle and awaiting reservation | Shutting down |
| Shutting Down | Kettle is shutting down                 | Off           |

When the status is either `Starting` or `Shutting Down` the RaspberryPi detects this transition, executes the related events and transitions to the next status.

### Brewing statuses

Raspberry waits for notifications of intermediate statuses and performs all the related automatic transitions.

Table of brewing statuses:

| Status        | Description                 | Next Statuses |
|:-------------:|:----------------------------|:-------------:|
| Not Brewing   | Kettle is idle              | Starting      |
| Starting      | Kettle is starting to brew  | Brewing       | 
| Brewing       | Kettle is brewing           | Stop Brewing  |
| Stop Brewing  | Kettle is done brewing      | Not Brewing   |

When the status is either `Starting` or `Stop Brewing` the RaspberryPi detects this transition, executes the related events and transitions to the next status.

### Reservation Logic

//TODO, awaiting last tests