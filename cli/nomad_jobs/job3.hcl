job "OneOff-NodeExample" {

  meta {
    run_uuid = "${uuidv4()}"
  }
  type = "batch"

  task "node-task" {
    driver = "raw_exec"
    config {
      // command = "/bin/sh"
      command = "/Users/max/.nvm/versions/node/v15.14.0/bin/node"
      args    = ["/Users/max/Documents/m4x5/DistributedTypescriptCompiler/Nomad/cli/main.js"]
      // command = "echo"
      // args    = ["'hello'"]
    }
    resources {
      cpu    = 10
      memory = 10
    }
  }

}