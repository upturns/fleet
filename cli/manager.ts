import { Queue, Worker } from "bullmq";
import { FlowProducer } from "bullmq";

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

function ACTION_1(data: any) {
  console.log("Running action 1");
  return 1;
}

function ACTION_2(data: any) {
  console.log("Running action 2");
  return 2;
}

function ACTION_3(data: any) {
  console.log("Running action 3");
  return 3;
}

const ACTIONS = {
  ACTION_1,
  ACTION_2,
  ACTION_3,
};

function handler(actionName: string, args: any) {
  if (actionName in ACTIONS) {
    const action = ACTIONS[actionName as keyof typeof ACTIONS];
    const result = action(args);
    console.log(actionName, ">>", result);
    return result;
  }
  return null;
}

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
  const myWorker = new Worker(
    "foo",
    async (job) => {
      console.log("1", "handling:", job.name, job.data);
      const childrenValues = await job.getChildrenValues();
      console.log("children:", childrenValues);
      return handler(job.name, job.data);
    },
    CONN
  );
  const myWorker2 = new Worker(
    "foo",
    async (job) => {
      console.log("2", "handling:", job.name, job.data);
      const childrenValues = await job.getChildrenValues();
      console.log("children:", childrenValues);
      return handler(job.name, job.data);
    },
    CONN
  );

  setTimeout(async () => {
    await myWorker.close();
    await myWorker2.close();
    await queue.close();
    await flowProducer.close();
  }, 2000);
}

main();

const pipeline1 = async () => {
  return 0;
};

const pipeline2 = async () => {
  return 1;
};

const pipeline = async () => {
  const value1 = await pipeline1();
  const value2 = await pipeline2();
  const derivativeValue = value1 + value2;
  return derivativeValue;
};

const derivativeProduct = {
  function: "id",
  inputs: [0],
};
