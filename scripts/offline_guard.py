"""Process-scoped offline test guard. This is not an OS firewall or child-process sandbox."""
import ipaddress
import socket
from contextlib import ExitStack
from unittest.mock import patch


class OfflineGuard:
    def __init__(self):
        self.blocked = []
        self._patches = ExitStack()

    def host(self, value, operation):
        try:
            host = value.decode("ascii") if isinstance(value, bytes) else str(value)
            address = ipaddress.ip_address(host)
            if address.is_loopback:
                return host
        except (ValueError, UnicodeError):
            pass
        self.blocked.append(operation)
        raise OSError("Offline test blocked non-loopback networking")

    def address(self, address, operation):
        if not isinstance(address, tuple) or len(address) < 2:
            self.blocked.append(operation)
            raise OSError("Offline test requires a literal loopback address")
        self.host(address[0], operation)

    def __enter__(self):
        original_dns = socket.getaddrinfo
        original_name = socket.gethostbyname
        original_names = socket.gethostbyname_ex
        original_connect = socket.socket.connect
        original_connect_ex = socket.socket.connect_ex
        original_bind = socket.socket.bind
        original_sendto = socket.socket.sendto
        audit = self

        def dns(host, port, family=0, type=0, proto=0, flags=0):
            audit.host(host, "DNS")
            return original_dns(host, port, family, type, proto, flags | socket.AI_NUMERICHOST)

        def name(host):
            audit.host(host, "DNS")
            return original_name(host)

        def names(host):
            audit.host(host, "DNS")
            return original_names(host)

        def reverse(host):
            audit.host(host, "reverse DNS")
            return ("localhost", [], [host])

        def connect(sock, address):
            audit.address(address, "TCP connect")
            return original_connect(sock, address)

        def connect_ex(sock, address):
            audit.address(address, "TCP connect_ex")
            return original_connect_ex(sock, address)

        def bind(sock, address):
            audit.address(address, "bind")
            return original_bind(sock, address)

        def sendto(sock, data, *args):
            if not args:
                raise OSError("Missing UDP destination")
            audit.address(args[-1], "UDP sendto")
            return original_sendto(sock, data, *args)

        for target, attribute, replacement in (
            (socket, "getaddrinfo", dns), (socket, "gethostbyname", name),
            (socket, "gethostbyname_ex", names), (socket, "gethostbyaddr", reverse),
            (socket.socket, "connect", connect), (socket.socket, "connect_ex", connect_ex),
            (socket.socket, "bind", bind), (socket.socket, "sendto", sendto),
        ):
            self._patches.enter_context(patch.object(target, attribute, replacement))
        return self

    def __exit__(self, *args):
        return self._patches.__exit__(*args)
