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
    var socketArray = [];
    var onReceive;

    (function (exports, global) {

        exports.create = function (successCallback, errorCallback, args) {

            var socket = new net.Socket();

            socketArray.push(socket);

            successCallback(0);
        };

        exports.update = function (successCallback, errorCallback, args) {
            var size = 4096;

            if (args[bufferSize] !== undefined) {
                size = args[bufferSize];
            }

            socket.setRecvBufferSize(size);
        };

        exports.setPaused = function (successCallback, errorCallback, args) {
            var socketId = args[0];
            socketArray[socketId].pause();
        };

        exports.setKeepAlive = function (successCallback, errorCallback, args) {
            var socketId = args[0];
            var enable = args[1];
            var delay = args[2];
            socketArray[socketId].setKeepAlive(enable, delay);

        };

        exports.setNoDelay = function (successCallback, errorCallback, args) {
            var socketId = args[0];
            var noDela = args[1];
            socketArray[socketId].setNoDelay(noDela);
        };

		internalCallback = function (data) {
				console.log('Received: ' + data);
				onReceive({socketId: this.socketId, data:data}, {keepCallback:true});
		}

        exports.connect = function (successCallback, errorCallback, args) {

            var socketId = args[0];
            var address = args[1];
            var port = args[2];

            socketArray[socketId].connect(port, address, internalCallback);
			socketArray[socketId].socketId= socketId; 
			socketArray[socketId].on('data', internalCallback);

            successCallback(0);

        };
		
		

        exports.disconnect = function (successCallback, errorCallback, args) {

            var socketId = args[0];
            socketArray[socketId].end();
        };

        exports.secure = function (successCallback, errorCallback, args) {};

        exports.pipeToFile = function (successCallback, errorCallback, args) {};

        exports.readyToRead = function (args) {};

        exports.send = function (successCallback, errorCallback, args) {
            var socketId = args[0];
            var value = new Uint8Array(args[1]);

            socketArray[socketId].write(value, null, successCallback);
        };

        exports.close = function (successCallback, errorCallback, args) {

            var socketId = args[0];
            socketArray[socketId].destroy();
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
