"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const child_process_1 = require("child_process");
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const waitForService_1 = require("./waitForService");
const program = new commander_1.Command();
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
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    const ip = yield getTailscaleIP();
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
}));
program
    .command("wait")
    .description("Start a new node in the network")
    //   .argument("<string>", "string to split")
    //   .option("--first", "display just the first substring")
    //   .option("-s, --separator <char>", "separator character", ",")
    .option("-s, --services <char>", "path to services folder", "./cli/services")
    .argument("service-name")
    .action((service_name) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, waitForService_1.waitForService)(service_name);
}));
program.parse();
function generateScript(consulArgs, nomadArgs) {
    const consulCMD = `consul ${consulArgs.join(" ")}`;
    const nomadCMD = `nomad ${nomadArgs.join(" ")}`;
    const template = `
  #!/bin/sh
  tmux new-session -d 'sh -c "${nomadCMD.replace(/"/g, '\\"')}"'
  tmux split-window -v 'sh -c "${consulCMD.replace(/"/g, '\\"')}"'
  tmux split-window -h 'sh -c "node ./dist/main.js wait nomad-server.service.consul" && nomad run ./Jobs/local_redis.hcl && node ./dist/main.js wait redis-ptc-redis.service.consul'
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
function getTailscaleIP() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, error) => {
            const ls = (0, child_process_1.spawn)("tailscale", ["ip"]);
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
    });
}
function generateConsulArgs(ip) {
    const config = {
        server: true,
        client: true,
        name: "max_mbp",
        config_dir: "./services",
        data_dir: "/tmp/consul/data",
    };
    let args = [
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
function generateNomadArgs(ip) {
    const config = {
        server: true,
        client: true,
        name: "max_mbp",
        config_dir: "./services",
        data_dir: "/tmp/consul/data",
    };
    let args = ["agent", "--config=./nomad_configs/nomad_remote.hcl"];
    return args;
}
function runNomad() {
    const nomad = (0, child_process_1.spawn)("nomad", ["agent", "-dev", "-bind=0.0.0.0"]);
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
