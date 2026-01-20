we containerized both frontend and backend separately
both the containers are isolated and don't know about each other(not connected)

Right now:
Both containers run on Docker’s default bridge
They don’t know each other by name
localhost means “my own container”
So frontend can’t directly call backend

You are using:

Frontend → Host → Backend
via host.docker.internal
Which is a temporary workaround.

__Docker Compose:__
Creates a private network
Connects all services to it
Gives each service a DNS name
(backend, frontend, mongo, nginx)

So containers can talk like:

Frontend → http://backend:8000
No IPs. No hacks. No host in between.
That’s the real container-to-container communication.

One line:
'Docker Compose turns isolated containers into a connected microservice system using automatic networking and DNS.'