# Chaleira FCUP Documentation

This is the repository for the FCUP Chaleira project. 

Each of the folders contains a separate part of the work which should be installed on the proper device of the project. 

For more instructions check the corresponding folders.

## Firebase Rules

The project assumes that a firebase realtime database exists, and it is configured with the following rules:

```javascript
{
  "rules": {
    ".read": true,
    ".write": true,
    "users": {
      "$uid": {
        ".write": "auth != null && auth.uid == $uid"
      }
    },
		"kettle" : {
      ".write": "auth != null && auth.uid == 'f0YWpdQP04Yi2vG8mB49LCBBFlm2'"
    },      
    "reservations": {
      ".write": "auth != null"
    },
    "user-reservations": {
      ".write": "auth != null && auth.uid == 'f0YWpdQP04Yi2vG8mB49LCBBFlm2'",
      "$uid": {
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```
