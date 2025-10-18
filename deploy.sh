#!/bin/bash
export SSHPASS=$(grep SSHPASS .env | cut -d '=' -f2-)

sshpass -e ssh root@172.233.188.56 << 'EOF'
cd hospital_finder
git pull
export NODE_OPTIONS=--openssl-legacy-provider
npm run build
cp -r ./dist/* /var/www/hospital-finder/static
cp -r /root/hospital_finder/staticfiles /var/www/hospital-finder/static
pkill -f gunicorn || true
sleep 2
./bin/gunicorn --bind 127.0.0.1:8001 hospital_finder.wsgi:application --log-file ./log.txt --capture-output --log-level debug &
EOF