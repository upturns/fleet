
job "docker-node" {
  type = "service"


  group "event-handler" {
    count = 1
    network {
      // mode = "bridge"
      port "redis" {
        to     = 6379
        static = 6379
      }
    }

    volume "agent" {
      type      = "host"
      source    = "agent"
      read_only = false
    }

    service {
      tags     = []
      provider = "consul"
    }

    task "node-task" {
      driver = "raw_exec"
      config {
        command = "/Users/max/.nvm/versions/node/v15.14.0/bin/node"
        args    = ["/Users/max/Documents/fleet/agent/dist/agent.js"]
      }
      resources {
        cpu    = 10
        memory = 10
      }
    }
  }
}
