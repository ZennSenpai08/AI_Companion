import socket
import unittest

from scripts.offline_guard import OfflineGuard


class OfflineGuardTests(unittest.TestCase):
    def test_dns_tcp_udp_and_wildcard_bind_are_blocked_before_network_use(self):
        original_dns = socket.getaddrinfo
        with socket.socket() as tcp, socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as udp:
            with OfflineGuard() as guard:
                operations = (
                    lambda: socket.getaddrinfo("example.invalid", 80),
                    lambda: socket.gethostbyname("example.invalid"),
                    lambda: socket.gethostbyname_ex("example.invalid"),
                    lambda: socket.gethostbyaddr("203.0.113.1"),
                    lambda: tcp.connect(("192.0.2.1", 80)),
                    lambda: tcp.connect_ex(("192.0.2.1", 80)),
                    lambda: udp.sendto(b"fixture", ("192.0.2.1", 80)),
                    lambda: tcp.bind(("0.0.0.0", 0)),
                )
                for operation in operations:
                    with self.assertRaises(OSError):
                        operation()
                self.assertEqual(len(guard.blocked), len(operations))
        self.assertIs(socket.getaddrinfo, original_dns)

    def test_literal_loopback_resolution_and_bind_remain_usable(self):
        with OfflineGuard() as guard, socket.socket() as sock:
            self.assertTrue(socket.getaddrinfo("127.0.0.1", 80))
            sock.bind(("127.0.0.1", 0))
            self.assertGreater(sock.getsockname()[1], 0)
            self.assertEqual(guard.blocked, [])
