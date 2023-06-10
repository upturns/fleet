
job "docker-redis" {
  type = "service"


  group "ptc-redis" {
    count = 1
    network {
      // mode = "bridge"
      port "redis" {
        to     = 6379
        static = 6379
      }
    }

    service {
      tags = ["leader", "mysql"]

      port = "redis"

      provider = "consul"

      meta {
        meta = "for your service"
      }

    }
    task "redis-task" {

      driver = "docker"

      config {
        image = "redis:7.0.7-alpine"
        ports = ["redis"]
      }
    }
  }
}

