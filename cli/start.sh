
  #!/bin/sh
  tmux new-session -d 'sh -c "sudo nomad agent --config=./nomad_configs/nomad_remote.hcl"'
  tmux split-window -v 'sh -c "consul agent -server --bootstrap-expect=1 -ui -node=max_mbp --bind 0.0.0.0 --client 0.0.0.0 --advertise 100.75.213.102 -data-dir=\"/tmp/consul/data\""'
  tmux split-window -h 'sh -c "node ./dist/main.js wait nomad-server.service.consul" && nomad job run ./nomad_jobs/local_redis.hcl && node ./dist/main.js wait redis-ptc-redis.service.consul"'
  tmux new-window 'mutt'
  tmux -2 attach-session -d
  