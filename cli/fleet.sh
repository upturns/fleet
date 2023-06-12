#!/bin/bash

# Cont

usage() { echo "Usage: $0 [-s <45|90>] [-p <string>] [-a <string>] [-c <bool>]" 1>&2; exit 1; }

c=0
while getopts ":n:s:a:c" o; do
    case "${o}" in
        n)
            n=${OPTARG}
            # ((s == 45 || s == 90)) || usage
            ;;
        s)
            s=${OPTARG}
            ;;
        a)
            a=${OPTARG}
            ;;
        c)
            c=1
            ;;
        *)
            usage
            ;;
    esac
done
shift $((OPTIND-1))

# if [ -z "${s}" ] || [ -z "${p}" ]; then


echo "s = ${s}"
echo "n = ${n}"
echo "a = ${a}"
echo "c = ${c}"


# consul agent -dev;

NOMAD_CONFIG_REMOTE="./nomad_configs/nomad_remote.hcl"
CONSUL_ADVERTISE="100.75.213.102"
CONSUL_DATA_DIR="/tmp/consul/data"
CONSUL_NODE_NAME=$n

NOMAD_SERVICE_NAME="nomad-server.service.consul"
REDIS_SERVICE_NAME="redis-ptc-redis.service.consul"
REDIS_JOB_SPEC="./nomad_jobs/local_redis.hcl"

CONSUL_EXISTING_SERVER="xxx"

CONSUL_CMD="consul agent -server -ui -node=$CONSUL_NODE_NAME --bind 0.0.0.0 --client 0.0.0.0 --advertise $CONSUL_ADVERTISE -data-dir=$CONSUL_DATA_DIR"



# if [ -z "${s}" ]; then
#     usage
# fi
if [ -z "${s}" ] ; then
    CONSUL_CMD="$CONSUL_CMD --bootstrap-expect=1"
else
    CONSUL_CMD="$CONSUL_CMD -retry-join=$s"
fi;

# if [ $c = 1 ] ; then
#     CONSUL_CMD="$CONSUL_CMD -retry-join=$CONSUL_EXISTING_SERVER"
# fi;

NOMAD_CMD="sudo nomad agent --config=$NOMAD_CONFIG_REMOTE"

INIT_SERVICES_CMD="./waitForService.sh 0.0.0.0 8600 $NOMAD_SERVICE_NAME && nomad job run $REDIS_JOB_SPEC && ./waitForServices.sh 0.0.0.0 8600 $REDIS_SERVICE_NAME"


# TAILSCALE_PATH="$(which tailscale)"
# TAILSCALE_IP="$(tailscale ip --1)"
# echo "$TAILSCALE_IP"
# tailscale ip --1
# # V="$(tailscale ip --1 | awk '{print $NF}')"


# echo "$V"
tmux new-session -d $CONSUL_CMD
tmux split-window -v $NOMAD_CMD
tmux split-window -h $INIT_SERVICES_CMD
tmux new-window 'mutt'
tmux -2 attach-session -d

# echo "$CONSUL_CMD" 
# echo $NOMAD_CMD
# echo $INIT_SERVICES_CMD

# tmux new-session -d "sh -c 'sudo nomad agent --config=$NOMAD_CONFIG_REMOTE'"
# tmux split-window -v "sh -c 'consul agent -server -ui -node=$CONSUL_NODE_NAME --bind 0.0.0.0 --client 0.0.0.0 --advertise $CONSUL_ADVERTISE -data-dir=$CONSUL_DATA_DIR --bootstrap-expect=1'"
# tmux split-window -h "sh -c './waitForService.sh 0.0.0.0 8600 $NOMAD_SERVICE_NAME && nomad job run $REDIS_JOB_SPEC && ./waitForService.sh 0.0.0.0 8600 $REDIS_SERVICE_NAME'"
# tmux new-window 'mutt'
# tmux -2 attach-session -d
