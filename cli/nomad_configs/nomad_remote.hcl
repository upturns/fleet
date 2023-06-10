data_dir = "/tmp/nomad/data"

bind_addr = "0.0.0.0" # the default


server {
  enabled = true
  # This should only be true for the first server in the cluster
  bootstrap_expect = 1
}

client {
  enabled = true
}

plugin "raw_exec" {
  config {
    enabled = true
  }
}

plugin "docker" {
  config {
  }
}

consul {
  address             = "0.0.0.0:8500"
  auto_advertise      = true
  client_auto_join    = true
  server_auto_join    = true
  client_service_name = "nomad-client"
  server_service_name = "nomad-server"
}


