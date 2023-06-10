job "example" {

  meta {
    run_uuid = "${uuidv4()}"
  }
  type = "batch"

  task "sleep" {
    driver = "raw_exec"
    config {
      command = "/bin/sh"
      args    = ["-c", "ls"]
      // command = "echo"
      // args    = ["'hello'"]
    }
    resources {
      cpu    = 10
      memory = 10
    }
  }

}