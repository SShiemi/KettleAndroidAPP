# Firebase status page
![Firebase](firebase.png)

This is a firebase status page designed to show the current state of the kettle. 

As a side functionality the page can be used to as to manually access the realtime database.

This code is useful in understanding how firebase's realtime database works.

## Installation
This part of the project can ideally be installed on the RaspberryPi sp that it can eventually be accessed within the network

1. Install `node` and `npm`
2. You must have the Firebase CLI installed. If you don't have it, install it with `npm install -g firebase-tools` and then configure it with `firebase login`. ( done via pop-up )
3. On the command line run `firebase use --add` inside the folder and select the Firebase project you have created.
4. On the command line run `firebase serve` using the Firebase CLI tool to launch a local server

## Displayed data
The data from the database is available on the status page in the form of several tables. 

The tables are populated automatically, via listeners that are subscribed to the firebase.

### Kettle data
The first table holds the data that describes the status of the kettle.

It holds the following fields:

* Kettle Status - Holds the status of the Kettle. Available statuses:

| Status        | Description                             | Next Statuses |
|:-------------:|:----------------------------------------|:-------------:|
| Off           | Kettle is off                           | Starting      |
| Starting      | Kettle is booting                       | Idle          | 
| Idle          | Kettle is idle and awaiting reservation | Shutting down |
| Shutting Down | Kettle is shutting down                 | Off           |

It holds the following fields:

* Brewing Status - Holds the status of the Kettle. Available statuses:

| Status        | Description                 | Next Statuses |
|:-------------:|:----------------------------|:-------------:|
| Not Brewing   | Kettle is idle              | Starting      |
| Starting      | Kettle is starting to brew  | Brewing       | 
| Brewing       | Kettle is brewing           | Stop Brewing  |
| Stop Brewing  | Kettle is done brewing      | Not Brewing   |

* Water levels - It holds the water levels information in the following format `Cur`/`Max`

  * `Cur` holds the current water level, in *__ml__*

  * `Max` represents the maximum capacity of the kettle in *__ml__*
  
* Number of reservations - holds the total number of reservations

### Global Reservation Data
This table that holds all the current reservations. The fields for each reservation are the following:

* User - the UUID of the user that made the reservation
* Quantity - the quantity of water reserved in *__ml__*
* Status - The current status of the reservation. Available statuses:

| Status  | Description                            | Next Statuses      | Terminal State |
|:-------:|:---------------------------------------|:------------------:|:--------------:|
|Pending  |	Reservation sent and awaits evaluation | Approved, Rejected | No             |
|Rejected |	Not enough water to brew               | N/A                | Yes            | 
|Approved |	Reservation is awaiting to be brewed   | Brewing            | No             |
|Brewing  |	Kettle is brewing your water           | Done               | No             |
|Done     |	Water is brewed                        | Deleted            | No             |
|Deleted  |	Reservation complete                   | N/A                | Yes            |

### User Reservation Data
This table is usually empty, but can be used to represent the same date as the *__Global Reservation Data Table__*
filtered by user `UUID`. 
>*__The fields of this table are the same as the global one.__*

## Command Buttons
There is a small list of command buttons that can be used to interact with the database or to test functionalities.
Those buttons interact *__directly with the firebase and have no direct interaction with the data display tables__*.

### Add Reservation
This button can add an ad-hoc reservation to the firebase.

Upon clicking it, a prompt appears, which asks for the amount in *__ml__* to be reserved. 

The user for the reservation will be the currently selected user. *__(Default: the kettle admin user)__*

>*__This action will ignore all business logic and directly insert a pending request on the database__*

### Change User
This button will change the user used to communicate with the firebase.

Upon clicking it, a prompt appears, which asks for the `UUID` if the user. *__(Default: the kettle admin user)__*

>*__This action does not interact with the database directly__*

### Clear Reservations
This button will remove *__all__* existing reservations from the database.

>*__This action is irreversible and is used only for debugging purposes__*

### Switch Status
This button can change the kettle status ad-hoc in the firebase.

Upon clicking it, a prompt appears, which asks for the new status. 

>*__This action can be performed only by the kettle admin user and will ignore all business logic and directly interacts with the database__*

### Set Water Level
This button can change the current water level ad-hoc in the firebase.

Upon clicking it, a prompt appears, which asks for the amount in *__ml__* to be set. 

The user for the reservation will be the currently selected user. *__(Default: the kettle admin user)__*

>*__This action can be performed only by the kettle admin user and will ignore all business logic and directly interacts with the database__*

### Get Reservations For User
This button adds a listener to the database which will populate automatically the user reservation table.

Upon clicking it, a prompt appears, which asks for the `UUID` of the desired user. *__(Default: the kettle admin user)__*

### Change Reservation Status
This button can change the status of a reservation ad-hoc in the firebase.

Upon clicking it, a prompt appears, which asks for the reservation and the new status. 

>*__This action will ignore all business logic and directly interacts with the database__*