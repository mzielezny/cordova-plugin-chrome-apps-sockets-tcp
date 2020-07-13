/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
(function () {

    if (global.require === undefined) {
        console.error(
            "Electron Node.js integration is disabled, you can not use cordova-file-plugin without it\n" +
            "Check docs how to enable Node.js integration: https://cordova.apache.org/docs/en/latest/guide/platforms/electron/#quick-start");
        return;
    }

    console.log("In electron version of cordova plugin");

    const net = global.require('net');

    var socketCounter = 0;
    var socketArray = new Map();

    (function (exports, global) {

		var onReceive;

        exports.create = function (successCallback, errorCallback, args) {

            var socket = new net.Socket({
                    allowHalfOpen: true,
                    readable: true,
                    writable: true
                });

            var socketId = socketCounter;

            socketCounter = socketCounter + 1;

            console.log('The Socket is: ' + socketId);

            socket.socketId = socketId;

            socket.onReceive = undefined;
            socket.onClose = undefined;
            socket.onWriteEnd = undefined;
            socket.onConnect = undefined;
			socket.onConnectError = undefined; 
			socket.onWrite = undefined; 

            socket.internalErrorCallback = function (error) {
                console.log('Error Received: ');
                console.log(error);
				error.resultCode = -1; 
                socket.onConnectError(error);
            }

            socket.internalCloseCallback = function (close) {
                console.log('Close Received: ');
                console.log(close);
                if (socket.onClose != undefined) {
                    socket.onClose(0);
                }
            }

            socket.internalConnectCallback = function (close) {
                console.log('Connect Received: ');
                console.log(close);
                socket.onConnect(0);

            }

            socket.internalDrainCallback = function (close) {
                console.log('Drain Received: ');
                console.log(close);
            }

            socket.internalEndCallback = function (close) {
                console.log('End Received: ');
                console.log(close);
            }
            socket.internalTimeoutCallback = function (close) {
                console.log('Timeout Received: ');
                console.log(close);
            }

            socket.internalConnectWrapper = function (close) {
                console.log('Really connect: ');
                socket.onConnect(0);
            }

            socket.internalWriteCallback = function (write) {
                socket.onWrite(write);
            }

            socket.internalCallback = function (data) {
                if (data !== undefined) {
                    onReceive({
                        socketId: this.socketId,
                        data: data
                    }, {
                        keepCallback: true
                    });
                }
            }

            socketArray.set(socketId, socket);

            successCallback(socket.socketId);
        };

        exports.update = function (successCallback, errorCallback, args) {
            var size = 4096;

            var socketId = args[0];

            if (args[bufferSize] !== undefined) {
                size = args[bufferSize];
            }

            socketArray.get(socketId).setRecvBufferSize(size);
        };

        exports.setPaused = function (successCallback, errorCallback, args) {
            var socketId = args[0];
            socketArray.get(socketId).pause();
        };

        exports.setKeepAlive = function (successCallback, errorCallback, args) {
            var socketId = args[0];
            var enable = args[1];
            var delay = args[2];
            socketArray.get(socketId).setKeepAlive(enable, delay);

        };

        exports.setNoDelay = function (successCallback, errorCallback, args) {
            var socketId = args[0];
            var noDela = args[1];
            socketArray.get(socketId).setNoDelay(noDela);
            successCallback(0);
        };

        exports.connect = function (successCallback, errorCallback, args) {

            var socketId = args[0];
            var address = args[1];
            var port = args[2];

            var socket = socketArray.get(socketId);

            socket.onConnect = successCallback;
            socket.onConnectError = errorCallback;

            //socketArray.get(socketId).socketId = socketId;

            socket.on('data', socket.internalCallback);
            socket.on('error', socket.internalErrorCallback);
            socket.on('close', socket.internalCloseCallback);
            socket.on('connect', socket.internalConnectCallback);
            socket.on('drain', socket.internalDrainCallback);
            socket.on('end', socket.internalEndCallback);
            socket.on('timeout', socket.internalTimeoutCallback);

            socket.connect(port, address, socket.internalConnectWrapper);

        };

        exports.disconnect = function (successCallback, errorCallback, args) {

            var socketId = args[0];
            socketArray.get(socketId).end();
            socketArray.get(socketId).removeListener('data', internalCallback);
        };

        exports.secure = function (successCallback, errorCallback, args) {};

        exports.pipeToFile = function (successCallback, errorCallback, args) {};

        exports.readyToRead = function (args) {};

        exports.send = function (successCallback, errorCallback, args) {
            var socketId = args[0];
            var value = new Uint8Array(args[1]);

            var socket = socketArray.get(socketId);
			
			socket.onWrite = successCallback;
			
            socket.write(value, null,  socket.internalWriteCallback);
        };

        exports.close = function (successCallback, errorCallback, args) {

            var socketId = args[0];
            socketArray.get(socketId).destroy();
            socketArray.get(socketId).removeListener('data', internalCallback);
            socketArray.delete(socketId);


        };

        exports.getInfo = function (successCallback, errorCallback, args) {};

        exports.getSockets = function (successCallback, errorCallback, args) {};

        exports.registerReceiveEvents = function (
            successCallback,
            errorCallback,
            args) {
            onReceive = successCallback;
        };
    })(module.exports, window);

    require("cordova/exec/proxy").add("ChromeSocketsTcp", module.exports);
})();