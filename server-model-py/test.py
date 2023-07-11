import socket

hostname = socket.gethostname()
IPAddr = socket.gethostbyname(hostname)
print(IPAddr)