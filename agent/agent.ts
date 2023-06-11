import { Queue, Worker } from "bullmq";
import { FlowProducer } from "bullmq";

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

const queue = new Queue("foo", CONN);

const flowProducer = new FlowProducer(CONN);

async function main() {
  console.log("adding");

  const flow = await flowProducer.add({
    name: "ACTION_3",
    queueName: "foo",
    children: [
      { name: "ACTION_2", data: { place: "walls" }, queueName: "foo" },
      { name: "ACTION_1", data: { place: "ceiling" }, queueName: "foo" },
    ],
  });

  await queue.add("ACTION_1", { qux: "baz" });
  //   await queue.add("ACTION_2", { qux: "bar" });
  //   await queue.add("ACTION_2", { qux: "bar" });
  //   await queue.add("ACTION_1", { qux: "baz" });
  //   await queue.add("ACTION_2", { qux: "bar" });
  //   await queue.add("ACTION_2", { qux: "bar" });
}

main();
