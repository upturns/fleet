  #!/bin/sh
  tmux new-session -d 'sh -c "nomad agent --config=../nomad_remote.hcl"'
  tmux split-window -v 'sh -c "consul agent -server --bootstrap-expect=1 -ui -node=max_mbp --bind 0.0.0.0 --client 0.0.0.0 --advertise 100.75.213.102 -data-dir=\"/tmp/consul/data\""'
  tmux split-window -h 'sh -c "ts-node waitForService.ts nomad-server.service.consul" && nomad run ./Jobs/local_redis.hcl && ts-node waitForService.ts redis-ptc-redis.service.consul'
  tmux new-window 'mutt'
  tmux -2 attach-session -d