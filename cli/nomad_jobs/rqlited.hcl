// job "OneOff-NodeExample" {

//   meta {
//     run_uuid = "${uuidv4()}"
//   }
//   type = "batch"



// }

job "rqlite" {

  group "group1" {
    count = 1
    network {
      // mode = "bridge"
      port "redis" {
        to = 6379
        // static = 4001
      }
    }

    task "node-task" {
      // type = "service"
      service {
        port     = "redis"
        provider = "consul"

        // meta {
        //   run_uuid = "${uuidv4()}"
        // }

      }
      driver = "raw_exec"

      config {
        // command = "/bin/sh"
        command = "/opt/homebrew/bin/redis-server"
        args    = ["/Users/max/Documents/m4x5/DistributedTypescriptCompiler/Nomad/cli/Jobs/redis.conf"]
        // ports   = ["rqlite"]
        // command = "echo"
        // args    = ["'hello'"]
      }
      resources {
        cpu    = 10
        memory = 10
      }
    }

  }

}
// job "rqlite" {
//   type = "service"


//   group "rqlite" {
//     count = 1

//     // service {
//     //   name     = "redis-svc"
//     //   port     = "redis"
//     //   provider = "nomad"
//     // }



//     service {
//       tags = ["leader", "mysql"]

//       // port = "redis"


//       // connect {
//       //   sidecar_service {}
//       // }

//       provider = "consul"

//       meta {
//         meta = "for your service"
//       }

//     }

//     task "node-task" {
//       driver = "raw_exec"
//       config {
//         // command = "/bin/sh"
//         command = "/opt/homebrew/bin/rqlited"
//         args    = ["-node-id", "1", "~/node.1"]
//         // command = "echo"
//         // args    = ["'hello'"]
//       }
//       resources {
//         cpu    = 10
//         memory = 10
//       }
//     }
//   }
// }

