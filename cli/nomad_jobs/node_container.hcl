
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
      tags = []
      // port = "redis"
      provider = "consul"
    }

    task "redis-task" {
      driver = "docker"

      volume_mount {
        volume      = "agent"
        destination = "/agent"
        read_only   = false
      }


      config {
        image = "node:20-alpine"
        // ports   = ["redis"]
        command = "sh"
        args    = ["-c", "cd /agent && npm i && node /agent/dist/agent.js"]
      }
    }
  }
}

