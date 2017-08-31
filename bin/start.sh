#!/bin/sh

if test -z "$SLACK_TOKEN"; then
	echo "Set your SLACK_TOKEN environment variable"
	exit 1
fi
slack-irc-client -t $SLACK_TOKEN
