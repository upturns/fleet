import { exec } from "child_process";

export async function waitForService(service_name: string) {
  const timeout = 3000;
  const max_attempts = 5;

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

  await helper(5);
}
