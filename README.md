# TCP communication Plugin for electron

This plugin provides TCP sockets for Android, iOS and Electron

## Status

Beta on Android and iOS - work in progress for Electron


## How to start using electron plugin ? 

First you have to add to below entry to config.xml - it is containing path to file which contain electron starting settings

```xml
<platform name="electron">
    <preference name="ElectronSettingsFilePath" value="resources/electron/settings.json" />
</platform>
	
```

in that settings file you have to configure node integration support 

```javascript
{
    "browserWindow": {
        "height": 600,
        "webPreferences":{
            "devTools": true,
            "nodeIntegration": true
        },
        "width": 1024
    }
}
	
```

after each plugin modification (yes you cane modificate plugin  by yourself in main plugin location) 
you have to remove platform and add again (as below) 

```bash
cordova platform remove electron 
cordova platform remove electron@1.1.1 # or any modern version 
```

Please remember that if yout want to run node plugin you have to use npm.
 
To import any node module you have to use "global.require" - main require is overriden by cordova

## Example


```typescript
    if (this.socketID) {
      const oldSocker = this.socketID;
      this.socketID = null;
      // tslint:disable: no-string-literal
      window['chrome'].sockets.tcp.close(oldSocker);
    }

    window["chrome"].sockets.tcp.receiveIntentionally();

    window['chrome'].sockets.tcp.create({}, async (createInfo) => {
      console.log(createInfo.socketId);
      this.socketID = createInfo.socketId;

      window['chrome'].sockets.tcp.onReceive.addListener((info) => {
        if (info.socketId !== this.socketID) {
          return;
        }
        // info.data is an arrayBuffer.
        //console.log(this.arrayBuffetToString(info.data));

      });


      window['chrome'].sockets.tcp.connect(this.socketID, '192.168.8.106', 2233, async (result) => {



        const mes_err_handl = new ArrayBuffer(10);
		
        var view   = new Uint8Array(mes_err_handl);
        view[0] = 101; 
        view[1] = 102; 
        view[2] = 103; 

        window['chrome'].sockets.tcp.send(this.socketID, mes_err_handl, async (writeInfo) => {
        });
      });
    });
	
	```
	