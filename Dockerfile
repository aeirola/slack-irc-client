FROM node:6
RUN npm install -g slack-irc-client
ADD bin/start.sh /start.sh
ENTRYPOINT /start.sh
