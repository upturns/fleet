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
function ACTION_1(data) {
    console.log("Running action 1");
    return 1;
}
function ACTION_2(data) {
    console.log("Running action 2");
    return 2;
}
function ACTION_3(data) {
    console.log("Running action 3");
    return 3;
}
const ACTIONS = {
    ACTION_1,
    ACTION_2,
    ACTION_3,
};
function handler(actionName, args) {
    if (actionName in ACTIONS) {
        const action = ACTIONS[actionName];
        const result = action(args);
        console.log(actionName, ">>", result);
        return result;
    }
    return null;
}
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
                //   { name: "fix", data: { place: "floor" }, queueName: "foo" },
            ],
        });
        //   await queue.add("ACTION_1", { qux: "baz" });
        //   await queue.add("ACTION_2", { qux: "bar" });
        //   await queue.add("ACTION_2", { qux: "bar" });
        //   await queue.add("ACTION_1", { qux: "baz" });
        //   await queue.add("ACTION_2", { qux: "bar" });
        //   await queue.add("ACTION_2", { qux: "bar" });
        console.log("creating worker:");
        const myWorker = new bullmq_1.Worker("foo", (job) => __awaiter(this, void 0, void 0, function* () {
            console.log("1", "handling:", job.name, job.data);
            const childrenValues = yield job.getChildrenValues();
            console.log("children:", childrenValues);
            return handler(job.name, job.data);
        }), CONN);
        const myWorker2 = new bullmq_1.Worker("foo", (job) => __awaiter(this, void 0, void 0, function* () {
            console.log("2", "handling:", job.name, job.data);
            const childrenValues = yield job.getChildrenValues();
            console.log("children:", childrenValues);
            return handler(job.name, job.data);
        }), CONN);
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            yield myWorker.close();
            yield myWorker2.close();
            yield queue.close();
            yield flowProducer.close();
        }), 2000);
    });
}
main();
const pipeline1 = () => __awaiter(void 0, void 0, void 0, function* () {
    return 0;
});
const pipeline2 = () => __awaiter(void 0, void 0, void 0, function* () {
    return 1;
});
const pipeline = () => __awaiter(void 0, void 0, void 0, function* () {
    const value1 = yield pipeline1();
    const value2 = yield pipeline2();
    const derivativeValue = value1 + value2;
    return derivativeValue;
});
const derivativeProduct = {
    function: "id",
    inputs: [0],
};
