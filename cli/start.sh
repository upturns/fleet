
  #!/bin/sh
  tmux new-session -d 'sh -c "sudo nomad agent --config=./nomad_configs/nomad_remote.hcl"'
  tmux split-window -v 'sh -c "consul agent -server -ui -node=local1 --bind 0.0.0.0 --client 0.0.0.0 --advertise 100.75.213.102 -data-dir=\"/tmp/consul/data\" --bootstrap-expect=1"'
  tmux split-window -h 'sh -c "./waitForService.sh 0.0.0.0 8600 nomad-server.service.consul && nomad job run ./nomad_jobs/local_redis.hcl && ./waitForService.sh 0.0.0.0 8600 redis-ptc-redis.service.consul"'
  tmux new-window 'mutt'
  tmux -2 attach-session -d
  