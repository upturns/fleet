import { exec, spawn } from "child_process";
import { Command } from "commander";
import * as fs from "fs";
import { waitForService } from "./waitForService";

const program = new Command();

program
  .name("tzu")
  .description("CLI for managing a simple distributed system.")
  .version("0.8.0");

program
  .command("run")
  .description("Start a new node in the network")
  //   .argument("<string>", "string to split")
  //   .option("--first", "display just the first substring")
  //   .option("-s, --separator <char>", "separator character", ",")
  .option("-s, --services <char>", "path to services folder", "./cli/services")
  .action(async (options) => {
    const ip = await getTailscaleIP();
    console.log("IP is:", ip);
    if (ip) {
      const consulArgs = generateConsulArgs(ip);
      console.log("consul args:", consulArgs);
      const nomadArgs = generateNomadArgs(ip);
      console.log("nomad args:", nomadArgs);

      const tmuxScript = generateScript(consulArgs, nomadArgs);

      fs.writeFile("start.sh", tmuxScript, (err) => {
        if (err) {
          console.error(err);
        }
        // file written successfully
      });
    }
    // console.log(options);
    // runConsul(options.services);
    // runNomad();
    // const limit = options.first ? 1 : undefined;
    // console.log(str.split(options.separator, limit));
  });

program
  .command("wait")
  .description("Start a new node in the network")
  //   .argument("<string>", "string to split")
  //   .option("--first", "display just the first substring")
  //   .option("-s, --separator <char>", "separator character", ",")
  .option("-s, --services <char>", "path to services folder", "./cli/services")
  .argument("service-name")
  .action(async (service_name) => {
    const ip = await getTailscaleIP();
    if (ip) {
      await waitForService(ip, service_name);
    } else {
      console.error("Failed to find own IP via tailscale!");
    }
  });

program.parse();

// const CONSUL_CONFIG = {
//   data_dir: "/tmp/consul/data",
//   log_level: "INFO",
//   node_name: "server-1",
//   server: true,
//   bootstrap_expect: 1,
//   client_addr: "0.0.0.0",
//   ui: true,
// };

interface IConsulConfig {
  server: boolean;
  client: boolean;
  config_dir: string;
  data_dir: string;
  name: string;
}

function generateScript(consulArgs: string[], nomadArgs: string[]): string {
  const consulCMD = `consul ${consulArgs.join(" ")}`;
  const nomadCMD = `sudo nomad ${nomadArgs.join(" ")}`;

  const template = `
  #!/bin/sh
  tmux new-session -d 'sh -c "${nomadCMD.replace(/"/g, '\\"')}"'
  tmux split-window -v 'sh -c "${consulCMD.replace(/"/g, '\\"')}"'
  tmux split-window -h 'sh -c "node ./dist/main.js wait nomad-server.service.consul" && nomad job run ./nomad_jobs/local_redis.hcl && node ./dist/main.js wait redis-ptc-redis.service.consul"'
  tmux new-window 'mutt'
  tmux -2 attach-session -d
  `;

  return template;
}

/*

  consul agent \
    -server \
    --boostrap-expect=1 \
    -ui -node=remote1 \
    -bind=0.0.0.0 \
    --advertise 100.116.113.42 \
    --client 0.0.0.0 \
    -data-dir=/tmp/consul/data
  */

async function getTailscaleIP(): Promise<string | null> {
  return new Promise((resolve, error) => {
    const ls = spawn("tailscale", ["ip"]);

    ls.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
      const lines = data.toString().split("\n");
      resolve(lines[0].trim() || null);
    });

    ls.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    ls.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
    });
  });
}

function generateConsulArgs(ip: string): string[] {
  const config: IConsulConfig = {
    server: true,
    client: true,
    name: "max_mbp",
    config_dir: "./services",
    data_dir: "/tmp/consul/data",
  };
  let args: string[] = [
    "agent",
    "-server",
    "--bootstrap-expect=1",
    "-ui",
    `-node=${config.name}`,
    "--bind",
    "0.0.0.0",
    "--client",
    "0.0.0.0",
    "--advertise",
    `${ip}`,
    `-data-dir="/tmp/consul/data"`,
  ];
  return args;
}

function generateNomadArgs(ip: string): string[] {
  const config: IConsulConfig = {
    server: true,
    client: true,
    name: "max_mbp",
    config_dir: "./services",
    data_dir: "/tmp/consul/data",
  };
  let args: string[] = ["agent", "--config=./nomad_configs/nomad_remote.hcl"];
  return args;
}

function runNomad() {
  const nomad = spawn("nomad", ["agent", "-dev", "-bind=0.0.0.0"]);

  nomad.stdout.on("data", (data) => {
    console.log(`[nomad stdout] ${data}`);
  });

  nomad.stderr.on("data", (data) => {
    console.error(`[nomad stderr] ${data}`);
  });

  nomad.on("close", (code) => {
    console.log(`[nomad] child process exited with code ${code}`);
  });
}
