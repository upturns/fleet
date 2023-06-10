job "redis" {

  group "ptc-redis" {
    count = 1
    network {
      port "redis" {
        to     = 6379
        static = 6379
      }
    }

    service {
      tags = ["leader", "mysql"]

      port = "redis"


      tagged_addresses {
        redis = "0.0.0.0:6379"
      }

      provider = "consul"

      meta {
        meta = "for your service"
      }

    }


    task "redis-task" {
      driver = "raw_exec"
      config {
        command = "/opt/homebrew/bin/redis-server"
        args    = ["/Users/max/Documents/m4x5/DistributedTypescriptCompiler/Nomad/cli/Jobs/redis.conf"]
      }
      resources {
        cpu    = 20
        memory = 20
      }
    }
  }
}