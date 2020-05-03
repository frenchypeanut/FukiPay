#!/bin/bash

# simple watcher
# https://stackoverflow.com/questions/6475252/bash-script-watch-folder-execute-command

DIR=$1
BUILD=$2
RUN=$3

daemon() {
    chsum1=""
    pid=""

    while [[ true ]]
    do
        chsum2=`find $DIR -type f -exec md5sum {} \; | sort -k 2 | md5sum`
        if [[ $chsum1 != $chsum2 ]] ; then
            if [[ $pid != "" ]] ; then
                kill -9 $pid
            fi
            $BUILD
            $RUN &
            pid=$!
            chsum1=$chsum2
        fi
        sleep 2
    done
}

daemon
