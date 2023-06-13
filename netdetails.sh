#! /bin/bash

ADVERTISE_IP="$(tailscale ip  --1)"

echo "network ip: $ADVERTISE_IP"

etcdctl del "$ADVERTISE_IP" --prefix

node_hostname="$(uname -n)"

echo "Registering services for $node_hostname"

var="$(lsof -V -Pi -n +c 0 | grep "(LISTEN)")"
while read -r line
do
    # lsof output without extra-spacing
    x="$(echo "$line" | sed 's/ * / /g')"
    # command name
    pname="$(echo "$x" | cut -d ' ' -f 1)"
    pid="$(echo "$x" | cut -d ' ' -f 2)"
    address="$(echo "$x" | cut -d ' ' -f 9)"


    # x="$(echo "$line" | sed 's/\s+/ /' | cut -d ' ' -f 1)"
    # y="$(echo "$line" | sed 's/\ +/\ /' | cut -d ' ' -f 2)"
    # echo "$line"
    echo "$pid - $pname - $address"

    # use `ps` 
    stats="$(ps aux $pid)"
    stats="$(echo "$stats" | grep $pid | sed 's/ * / /g')"

    cpu="$(echo "$stats" | cut -d ' ' -f 3)"
    mem="$(echo "$stats" | cut -d ' ' -f 4)"
    cmd="$(echo "$stats" | cut -d ' ' -f 11-)"

    etcdctl put "service/$ADVERTISE_IP/$address" "$pname" 

done < <(printf '%s\n' "$var")
