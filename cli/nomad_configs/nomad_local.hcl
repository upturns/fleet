data_dir = "/tmp/nomad/data"

// bind_addr = "100.75.213.102" # the default
bind_addr = "0.0.0.0" # the default

advertise {
  # Defaults to the first private IP address.
  // http = "100.75.213.102"
  // rpc  = "100.75.213.102"
  // serf = "100.75.213.102"
  // http = "100.116.113.42"
  // rpc  = "100.116.113.42"
  // serf = "100.116.113.42"
}

server {
  enabled = true
  # This should only be true for the first server in the cluster
}

client {
  enabled = true
  // servers                 = ["0.0.0.0:4648"]
  gc_disk_usage_threshold = 90
}

plugin "raw_exec" {
  config {
    enabled = true
  }
}

// plugin "docker" {
//   config {
//     // enabled = true
//   }
// }

consul {
  address             = "0.0.0.0:8500"
  auto_advertise      = true
  client_auto_join    = true
  server_auto_join    = true
  client_service_name = "nomad-client"
  server_service_name = "nomad-server"
  // address = "100.75.213.102:8500"
}


