 Weather Dashboard Deployment – Web Infrastructure Lab

This guide explains how to deploy a weather dashboard web application using Docker containers and a load balancer. It includes setting up two web servers (web01 and web02), and a load balancer (lb01) using HAProxy to distribute traffic evenly between the two servers using round-robin load balancing.

Docker Image Information

Repository URL:
[https://hub.docker.com/r/](https://hub.docker.com/r/)\<your_dockerhub_username>/weather-dashboard

Image name:
weather-dashboard

Tags:

latest
v1.0

Replace `<your_dockerhub_username>` with your actual Docker Hub username.

Building the Image Locally

To build the Docker image on your local machine, open the terminal in your project directory and run the following command:

docker build -t weather-dashboard .

This command uses the Dockerfile in the current directory to build the image and tags it as "weather-dashboard".

Running the Image on Web Servers

On both web01 and web02 servers, follow these steps:

1. Pull the image from Docker Hub:

docker pull \<your\_dockerhub\_username>/weather-dashboard\:latest

2. Run the container:

docker run -d -p 80:80 --name weather-web <your_dockerhub_username>/weather-dashboard\:latest

This command runs the container in detached mode and maps port 80 of the container to port 80 of the host.

If your application uses an API key or other environment variables, you can add them like this:

docker run -d -p 80:80 --env API_KEY=your_api_key_here --name weather-web \<your\_dockerhub\_username>/weather-dashboard\:latest

Make sure your application is programmed to read from environment variables.

Load Balancer Setup with HAProxy

On the load balancer server (lb01), HAProxy is configured to forward traffic to both web01 and web02 using round-robin.

In the haproxy.cfg file, add or update the following configuration:

frontend http_front
bind *:80
default_backend http_back

backend http_back
balance roundrobin
server web01 web01_ip:80 check
server web02 web02_ip:80 check

Replace web01 ip and web02 ip with the actual IP addresses of your web servers.

Reloading HAProxy

After updating haproxy.cfg, reload HAProxy to apply the changes.

If HAProxy is running directly on the server:

sudo service haproxy reload

If HAProxy is running with Docker Compose:

docker-compose restart

Ensure the HAProxy configuration file is properly mounted in docker-compose.yml:

volumes:

./haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg

---

Testing the Deployment

To confirm the setup is working:

1. Open the IP address or domain name of your load balancer in a web browser.
2. Refresh the page several times.
3. Change the HTML or content on web01 and web02 slightly so you can see the difference.
4. Alternatively, use curl in the terminal to test multiple responses:

curl [http://your-loadbalancer-ip](http://your-loadbalancer-ip)

Run this command several times. If load balancing is working, you will get different responses from web01 and web02.

Handling Secrets

It is recommended not to include API keys or secrets directly in your Docker image.

To pass secrets securely, use environment variables when running the container:

docker run -d -p 80:80 --env API\_KEY=your\_api\_key\_here \<your\_image>

If using Docker Compose, save secrets in a .env file:

API_KEY=your_api_key_here

Then reference it in docker-compose.yml:

environment:

 API_KEY=\${API_KEY}

Never upload .env files containing real credentials to version control.

In production environments, consider using secure tools like Docker secrets or HashiCorp Vault for managing sensitive data.

Development Challenges and Solutions

Challenge: Unable to start Docker in Codespaces due to systemd limitations.

Solution: Used Docker Compose with built-in docker compose up rather than relying on systemctl.

Challenge: Load balancer not forwarding traffic.

Solution: Checked Docker network configuration and container port exposure, fixed by using a custom bridge network.

Challenge: API not responding due to missing API key.

Solution: Created .env file to load the API key securely and passed it during container run.

Credits and Resources

OpenWeatherMap API - https://openweathermap.org/api


summary

1.The weather dashboard was containerized using Docker.
2.The same image was deployed to two web servers.
3.A load balancer was set up using HAProxy to distribute traffic using round-robin.
4.The system was tested using a web browser and the curl command to verify load balancing.
5.Environment variables were used to handle sensitive data securely.

This setup provides a simple and effective way to deploy a lightweight web application across multiple servers with load balancing.

