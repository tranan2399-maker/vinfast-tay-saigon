#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Local Development Server for VinFast Tây Sài Gòn
Auto rewrites clean URLs and handles lead submissions.
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import http.server
import socketserver
import json
import os
import webbrowser
from datetime import datetime

PORT = 3000
HOST = "127.0.0.1"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class VinFastHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        # Clean URL rewrite: /slug/ or /slug -> /slug.html
        path = self.path.split('?')[0].split('#')[0]
        if path != '/' and not os.path.exists(os.path.join(BASE_DIR, path.lstrip('/'))):
            trimmed = path.strip('/')
            html_candidate = os.path.join(BASE_DIR, trimmed + '.html')
            if os.path.exists(html_candidate):
                self.path = '/' + trimmed + '.html'
        return super().do_GET()

    def do_POST(self):
        if self.path == '/api/submit-lead' or self.path.startswith('/api/submit-lead'):
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                try:
                    lead_data = json.loads(post_data.decode('utf-8'))
                except Exception:
                    import urllib.parse
                    parsed = urllib.parse.parse_qs(post_data.decode('utf-8'))
                    lead_data = {k: v[0] if len(v) == 1 else v for k, v in parsed.items()}

                lead_data['submitted_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                
                data_dir = os.path.join(BASE_DIR, 'data')
                os.makedirs(data_dir, exist_ok=True)
                leads_file = os.path.join(data_dir, 'leads.json')
                
                leads = []
                if os.path.exists(leads_file):
                    try:
                        with open(leads_file, 'r', encoding='utf-8') as f:
                            leads = json.load(f)
                    except Exception:
                        leads = []
                
                leads.append(lead_data)
                with open(leads_file, 'w', encoding='utf-8') as f:
                    json.dump(leads, f, ensure_ascii=False, indent=2)

                response = {
                    "success": True,
                    "message": "Đăng ký thành công! Chuyên viên VinFast Tây Sài Gòn sẽ liên hệ lại với Quý khách trong vòng 5 phút.",
                    "lead": lead_data
                }
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
                customer = lead_data.get('fullName', lead_data.get('lastName', 'Khách hàng'))
                phone = lead_data.get('phone', '')
                car = lead_data.get('model', 'Xe máy điện')
                print(f"[NHẬN LEAD THÀNH CÔNG] {customer} - SĐT: {phone} - Quan tâm: {car}")
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
        else:
            self.send_error(404, "Endpoint not found")

def run():
    global PORT
    candidate_ports = [3000, 3001, 5500, 8000, 8888, 9000]
    for p in candidate_ports:
        try:
            handler = VinFastHTTPRequestHandler
            socketserver.TCPServer.allow_reuse_address = True
            with socketserver.TCPServer((HOST, p), handler) as httpd:
                PORT = p
                url = f"http://{HOST}:{PORT}/"
                print("="*65)
                print(f" VINFAST TÂY SÀI GÒN - MÁY CHỦ LOCAL ĐANG CHẠY")
                print(f" Địa chỉ: {url}")
                print(f" Thư mục: {BASE_DIR}")
                print(f" Bấm Ctrl + C để dừng máy chủ")
                print("="*65)
                if "--no-browser" not in sys.argv:
                    try:
                        webbrowser.open(url)
                    except Exception:
                        pass
                httpd.serve_forever()
                break
        except OSError:
            continue

if __name__ == '__main__':
    run()
