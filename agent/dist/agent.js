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
const bullmq_1 = require("bullmq");
const bullmq_2 = require("bullmq");
console.log("Running Fleet Agent");
const HOST = "192.168.1.3";
const PORT = 6379;
const PASSWORD = "hello";
const CONN = {
    connection: {
        host: HOST,
        port: PORT,
        password: PASSWORD,
    },
};
const queue = new bullmq_1.Queue("foo", CONN);
const flowProducer = new bullmq_2.FlowProducer(CONN);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("adding");
        const flow = yield flowProducer.add({
            name: "ACTION_3",
            queueName: "foo",
            children: [
                { name: "ACTION_2", data: { place: "walls" }, queueName: "foo" },
                { name: "ACTION_1", data: { place: "ceiling" }, queueName: "foo" },
            ],
        });
        yield queue.add("ACTION_1", { qux: "baz" });
        //   await queue.add("ACTION_2", { qux: "bar" });
        //   await queue.add("ACTION_2", { qux: "bar" });
        //   await queue.add("ACTION_1", { qux: "baz" });
        //   await queue.add("ACTION_2", { qux: "bar" });
        //   await queue.add("ACTION_2", { qux: "bar" });
    });
}
main();
