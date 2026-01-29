#!/bin/bash

export PGPASSWORD=$POSTGRES_PASSWORD

# Wait for DB to be ready
until psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -p $POSTGRES_PORT -c '\q'; do
  echo "Waiting for PostgresSQL"
  sleep 1
done

echo "Successfully started PostgresSQL"
cd /home/pathless-trails/server
exec npm start
