"""Offline English -> Simplified Chinese RSS reading aid. No outbound network calls."""
import argparse
import hashlib
import json
import re
import threading
from functools import lru_cache
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import ctranslate2
import sentencepiece
from opencc import OpenCC

parser = argparse.ArgumentParser()
parser.add_argument('--model', required=True)
parser.add_argument('--port', type=int, default=5291)
args = parser.parse_args()
root = Path(args.model).resolve()
model = next(root.rglob('model.bin')).parent
tokenizer = sentencepiece.SentencePieceProcessor(model_file=str(next(root.rglob('sentencepiece.model'))))
engine = ctranslate2.Translator(str(model), device='cpu', compute_type='int8', intra_threads=4, inter_threads=1)
simplify = OpenCC('t2s')
lock = threading.Lock()
glossary = {'Hamilton': '汉密尔顿', 'Verstappen': '维斯塔潘', 'Antonelli': '安东内利', 'Leclerc': '勒克莱尔', 'Norris': '诺里斯', 'Piastri': '皮亚斯特里', 'Russell': '拉塞尔', 'Ferrari': '法拉利', 'McLaren': '迈凯伦', 'Mercedes': '梅赛德斯', 'Grand Prix': '大奖赛', 'Formula 1': '一级方程式', 'F1': 'F1'}


@lru_cache(maxsize=2000)
def translate(text):
    if not text:
        return ''
    tokens = tokenizer.encode(text, out_type=str)
    result = engine.translate_batch([tokens], beam_size=4, replace_unknowns=True, max_decoding_length=300, repetition_penalty=1.1)[0]
    output = simplify.convert(tokenizer.decode(result.hypotheses[0])).strip()
    for english, chinese in glossary.items():
        output = re.sub(r'\b' + re.escape(english) + r'\b', chinese, output, flags=re.I)
    return output.replace('哈密顿', '汉密尔顿')


class Handler(BaseHTTPRequestHandler):
    def send_json(self, status, body):
        payload = json.dumps(body, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(payload)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        if self.path != '/health':
            self.send_json(404, {'status': 'not_found'})
            return
        self.send_json(200, {'status': 'ready', 'engine': 'Argos en-zh 1.9 / CTranslate2', 'target': 'zh-CN', 'network': 'offline'})

    def do_POST(self):
        if self.path != '/translate' or self.headers.get_content_type() != 'application/json':
            self.send_json(400, {'status': 'invalid_request'})
            return
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 65536:
                raise ValueError()
            self.connection.settimeout(10)
            body = json.loads(self.rfile.read(length))
            texts = body['texts']
            if not isinstance(texts, list) or not 1 <= len(texts) <= 40 or any(not isinstance(text, str) or len(text) > 1200 or any(ord(char) < 32 for char in text) for text in texts):
                raise ValueError()
            if not lock.acquire(blocking=False):
                self.send_json(429, {'status': 'busy'})
                return
            try:
                translations = [translate(text) for text in texts]
            finally:
                lock.release()
            self.send_json(200, {'translations': translations, 'engine': 'argos-en-zh-1.9', 'inputHash': hashlib.sha256(json.dumps(texts, ensure_ascii=False).encode()).hexdigest()})
        except (ValueError, KeyError, TypeError, json.JSONDecodeError):
            self.send_json(400, {'status': 'invalid_request'})

    def log_message(self, _format, *_arguments):
        pass  # Headlines and source summaries must not enter access logs.


print('Offline translation ready on 127.0.0.1:' + str(args.port), flush=True)
ThreadingHTTPServer(('127.0.0.1', args.port), Handler).serve_forever()
