"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForService = void 0;
const child_process_1 = require("child_process");
function waitForService(service_name) {
    return __awaiter(this, void 0, void 0, function* () {
        const timeout = 3000;
        const max_attempts = 5;
        console.log(`Waiting for [${service_name}]...`);
        const helper = (attempts_remaining) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, err) => {
                const nomad = (0, child_process_1.exec)([
                    "dig",
                    "+nocmd",
                    "@100.75.213.102",
                    "-p",
                    "8600",
                    "+noall",
                    "+answer",
                    service_name,
                ].join(" "), (error, stdout, stderr) => {
                    // console.log(error, stdout, stderr);
                    const resultParts = stdout.trim().split(/\s/);
                    if (resultParts.length !== 5) {
                        console.log(stdout);
                        //   throw Error("failed to find!");
                        console.log(`failed to find, ${attempts_remaining} attempts remanining.`);
                        if (attempts_remaining === 0) {
                            console.error("Failed to find service!");
                            resolve();
                        }
                        else {
                            setTimeout(() => helper(attempts_remaining - 1), timeout);
                        }
                    }
                    else {
                        const ip = resultParts[4];
                        console.log("found ip:", ip);
                        resolve();
                    }
                });
            });
        });
        yield helper(5);
    });
}
exports.waitForService = waitForService;
