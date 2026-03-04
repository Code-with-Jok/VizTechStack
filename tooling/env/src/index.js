"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientEnv = exports.serverEnv = void 0;
var server_1 = require("./server");
Object.defineProperty(exports, "serverEnv", { enumerable: true, get: function () { return server_1.serverEnv; } });
var client_1 = require("./client");
Object.defineProperty(exports, "clientEnv", { enumerable: true, get: function () { return client_1.clientEnv; } });
