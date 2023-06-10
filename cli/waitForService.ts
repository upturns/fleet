// #!/bin/bash
// printf "%s" "waiting for ServerXY ..."
// while ! timeout 0.2 ping -c 1 -n "100.75.213.102" 6464 &> /dev/null
// do
//     printf "%c" "."
// done
// printf "\n%s\n"  "Server is back online"
import { spawn, exec } from "child_process";

const timeout = 3000;
const max_attempts = 5;

const args = process.argv.slice(2);
const service_name = args[0];
console.log(`Waiting for [${service_name}]...`);

const helper = async (attempts_remaining: number): Promise<void> => {
  return new Promise((resolve, err) => {
    const nomad = exec(
      [
        "dig",
        "+nocmd",
        "@100.75.213.102",
        "-p",
        "8600",
        "+noall",
        "+answer",
        service_name,
      ].join(" "),

      (error, stdout, stderr) => {
        // console.log(error, stdout, stderr);
        const resultParts = stdout.trim().split(/\s/);
        if (resultParts.length !== 5) {
          console.log(stdout);
          //   throw Error("failed to find!");
          console.log(
            `failed to find, ${attempts_remaining} attempts remanining.`
          );
          if (attempts_remaining === 0) {
            console.error("Failed to find service!");
            resolve();
          } else {
            setTimeout(() => helper(attempts_remaining - 1), timeout);
          }
        } else {
          const ip = resultParts[4];
          console.log("found ip:", ip);
          resolve();
        }
      }
    );
  });
};

async function main() {
  await helper(5);
}

main();
// nomad.on

// nomad.stdout.on("data", (data) => {
//   console.log(`[nomad stdout] ${data}`);
// });

// nomad.stderr.on("error", (data) => {
//   console.error(`[nomad stderr] ${data}`);
// });

// nomad.on("close", (code) => {
//   console.log(`[nomad] child process exited with code ${code}`);
// });
