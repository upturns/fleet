# Fleet

This project is a `sh` script for easily managing a distributed-computing environment based on open source tools.

## CLI

Options:

- a

## Dependencies

### Infrastructure

- [Consul](https://developer.hashicorp.com/consul/) is a [Raft-based](https://developer.hashicorp.com/consul/docs/architecture/consensus) program that allows machines to form a cluster and register DNS-queryable services.
- [Nomad](https://developer.hashicorp.com/nomad/) is a Consul-compatible task scheduler and orchestration tool. The Nomad agent running on a machine provides an API for managing computations, and connects to other Nomad agents to share scheduled work.
- [Redis](https://redis.io/docs/) is a key-value store.

### Task-Executor

- [Node.js](https://nodejs.org/en) is the de-facto Javascript runtime.
- [BullMQ](https://docs.bullmq.io/) implements a Typescript interface for a message/job queue backed by Redis that supports job dependencies.

### Utilities

- [Envoy](https://www.envoyproxy.io/docs/envoy/latest/) is an easy-to-configure proxy.
- [JuiceFS](https://juicefs.com/docs/community/introduction/) mounts a filesystem backed by a remote object store (like S3) and a metadata database such as Postgres or Redis.

Optional:

- [Tailscale](https://tailscale.com/kb/1151/what-is-tailscale/) provides an easy-to-use VPN service. This allows machines to connect to eachother via private IP addresses.

## Implementation

Every cluster begins with a Consul agent.

### 1. Consul

The command to begin the very first Consul agent is:

```sh
consul agent \
    -server \
    --boostrap-expect=1 \
    -ui -node=remote1 \
    -bind=0.0.0.0 \
    --advertise 100.116.113.42 \
    --client 0.0.0.0 \
    -data-dir=/tmp/consul/data
```

To connect later agents, the command is:

```sh
consul agent \
    -ui \
    -node=max_mbp \
    -retry-join 100.116.113.42 \
    --client 0.0.0.0 \
    --bind 0.0.0.0 \
    --advertise 100.75.213.102 \
    -data-dir=/tmp/consul/data
```

### 2. Nomad

To start the first Nomad agent, run:

```sh
nomad agent --config=nomad_remote.hcl
```

To start later Nomad agents, use:

```sh
nomad agent --config=nomad_local.hcl
```

Note that the "advertise" addresses specified in these configuration files must be the local IP of the machine, _not_ localhost (or Consul auto-discovery)

### 3. Redis

Start a Redis service on the cluster using:

```hcl
job "pytechco-redis" {
  type = "service"


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
```

alternatively, run Redis directly on the machine using:

```hcl
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
```

Lookup the address for the service using `dig`:

```sh
 dig @100.75.213.102 -p 8600 redis-ptc-redis.service.consul
```

And then you can check that Redis is reachable with:

```
redis-cli -h 192.168.1.3 -p 6379 -a hello ping
```

### 4. BullMQ
