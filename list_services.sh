#! /bin/bash

i=0

pname=""
address=""
port=""
ip=""

ADVERTISE_IP="$(tailscale ip  --1)"

echo "network ip: $ADVERTISE_IP"

# var="$(etcdctl get "$ADVERTISE_IP" --prefix)"
var="$(etcdctl get "service/" --prefix)"
while read -r line
do
    # lsof output without extra-spacing
    # x="$(echo "$line" | sed 's/ * / /g')"
    if ((i % 2 == 0)); then
        # echo "$i $line"
        vpnIpAndAddress="$(echo "$line" | cut -d '/' -f 2-)"
        ip="$(echo "$vpnIpAndAddress" | cut -d '/' -f 1)"
        addressAndPort="$(echo "$vpnIpAndAddress" | cut -d '/' -f 2-)"
        address="$(echo "$addressAndPort" | cut -d ':' -f 1)"
        port="$(echo "$addressAndPort" | cut -d ':' -f 2)"

    else
        pname="$line"
        echo "$pname $ip $address $port"
    fi
    i=$((i + 1))

done < <(printf '%s\n' "$var")
