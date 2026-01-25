we containerized both frontend and backend separately
both the containers are isolated and don't know about each other(not connected)

Right now:
1) Both containers run on Docker’s default bridge
2) They don’t know each other by name
3) localhost means “my own container”
4) So frontend can’t directly call backend

You are using:
Frontend → Host → Backend
via host.docker.internal
Which is a temporary workaround.

__Docker Compose:__
1) Creates a private network
2) Connects all services to it
3) Gives each service a DNS name 
(backend, frontend, mongo, nginx)

# -->DNS resolution take place internally in compose, otherwise without compose we need to use host.docker.internal injecting the ip address of each container manually (which changes on evry restart)

So containers can talk like:

Frontend → http://backend:8000
No IPs. No hacks. No host in between.
That’s the real container-to-container communication.

One line:
'Docker Compose turns isolated containers into a connected microservice system using automatic networking and DNS.'