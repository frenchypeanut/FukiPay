#!/bin/bash

set -e

CMD=$1
BOT_API="https://api.telegram.org/bot${BOT_TOKEN}"

case $1 in
  cleanup)
    # call getUpdates endpoint with last update identifier + 1
    # it has for effect to clean up all pending updates
    id=$(curl -s ${BOT_API}/getUpdates | jq '.result[-1].update_id') ;
    if [ "${id}" != null ]; then
      echo "Cleaning updates..." ;
      offset=$((${id} + 1)) ;
      curl -s ${BOT_API}/getUpdates?offset=${offset} | jq;
    fi;
  ;;
  updates)
    curl -s ${BOT_API}/getUpdates
    ;;
  webhook-delete)
    curl -s ${BOT_API}/deleteWebhook
    ;;
  webhook-info)
    curl -s ${BOT_API}/getWebHookInfo
    ;;
  webhook-set)
    curl -s -F "url=${2}" ${BOT_API}/setWebhook
    ;;
  webhook-check)
    info=$(curl -s ${BOT_API}/getWebHookInfo) ;
    ok=$(echo ${info} | jq '.ok') ;
    if [ ${ok} != true ]; then echo -e "\e[1m\e[33m[warning] check BOT_TOKEN variable" ; fi ;
    url=$(echo ${info} | jq '.result.url') ;
    if [ ${url} == "\"\"" ]; then echo -e "\e[1m\e[33m[warning] check your webhook url" ; fi ;
esac
