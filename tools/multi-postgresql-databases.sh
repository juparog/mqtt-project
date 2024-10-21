#!/bin/bash

set -e
set -u

export PGDATABASE=${POSTGRESQL_DATABASE:-postgres}
export PGUSER=${POSTGRESQL_USERNAME:-postgres}
export PGPASSWORD=$POSTGRESQL_PASSWORD

function create_user_and_database() {
  local database=$1
  echo "  Creating user and database '$database'"
  psql -v ON_ERROR_STOP=1 <<-EOSQL
      CREATE DATABASE $database;
      CREATE USER $database WITH PASSWORD '$database';
      GRANT ALL PRIVILEGES ON DATABASE $database TO $database;
      \c $database postgres
      GRANT ALL ON SCHEMA public TO $database;
EOSQL
}

if [ -n "${POSTGRES_MULTIPLE_DATABASES:-}" ]; then
  echo "Multiple database creation requested: $POSTGRES_MULTIPLE_DATABASES"
  for db in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
    create_user_and_database $db
  done
  echo "Multiple databases created"
fi
