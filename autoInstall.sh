#!/bin/bash

# Adding mongodb source
apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/debian-sysvinit dist 10gen' | tee /etc/apt/sources.list.d/10gen.list

apt-get update

# Dependecies
# whois = mkpasswd
apt-get install mongodb-10gen git-core curl build-essential openssl libssl-dev whois python -y

mkdir /data
mkdir /data/db

#Install node js
git clone https://github.com/joyent/node.git
cd node
 
# 'git tag' shows all available versions: select the latest stable.
git checkout v0.10.16
 
# Configure seems not to find libssl by default so we give it an explicit pointer.
# Optionally: you can isolate node by adding --prefix=/opt/node
./configure --openssl-libpath=/usr/lib/ssl
make
make test

make install

# it's alive ?
if [ -z $(node -v) && -z $(npm -v) ]
then
	exit 0
else
	npm install pm2 -g
fi
