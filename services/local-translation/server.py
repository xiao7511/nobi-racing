"""Offline English -> Simplified Chinese RSS reading aid. No outbound network calls."""
import argparse
import hashlib
import json
import os
import re
import threading
from functools import lru_cache
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import ctranslate2
import sentencepiece
from opencc import OpenCC
from text_quality import prepare_english, split_sentences, postprocess, quality_issues

parser = argparse.ArgumentParser()
parser.add_argument('--model', required=True)
parser.add_argument('--port', type=int, default=5291)
args = parser.parse_args()
root = Path(args.model).resolve()
model = next(root.rglob('model.bin')).parent
tokenizer = sentencepiece.SentencePieceProcessor(model_file=str(next(root.rglob('sentencepiece.model'))))
threads = int(os.environ.get('NOBI_TRANSLATION_THREADS', '4'))
if not 1 <= threads <= 4:
    raise SystemExit('NOBI_TRANSLATION_THREADS must be between 1 and 4.')
engine = ctranslate2.Translator(str(model), device='cpu', compute_type='int8', intra_threads=threads, inter_threads=1)
simplify = OpenCC('t2s')
lock = threading.Lock()
@lru_cache(maxsize=2000)
def translate(text):
    if not text:
        return ''
    sentences = split_sentences(prepare_english(text))
    tokens = [tokenizer.encode(sentence, out_type=str) for sentence in sentences]
    # The packaged OPUS sentence model has a short context window. Never silently
    # truncate long clauses or publish a partially translated description.
    if any(len(sentence) > 150 for sentence in tokens):
        return None
    results = engine.translate_batch(tokens, beam_size=4, replace_unknowns=True, max_decoding_length=600, length_penalty=0.2)
    # Argos detokenizes copied out-of-vocabulary pieces by joining them. Calling
    # SentencePiece.decode can leave its word-boundary marker in news names.
    outputs = [postprocess(sentence, simplify.convert(''.join(result.hypotheses[0]).replace('▁', ' ')).strip()) for sentence, result in zip(sentences, results)]
    if any(quality_issues(sentence, output) for sentence, output in zip(sentences, outputs)):
        return None
    output = ''.join(outputs)
    return output if not quality_issues(text, output) else None


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
            source = body.get('source', 'en')
            if source not in ('en', 'zh') or body.get('target', 'zh-CN') != 'zh-CN':
                raise ValueError()
            if not isinstance(texts, list) or not 1 <= len(texts) <= 40 or any(not isinstance(text, str) or len(text) > 1200 or any(ord(char) < 32 for char in text) for text in texts):
                raise ValueError()
            if not lock.acquire(blocking=False):
                self.send_json(429, {'status': 'busy'})
                return
            try:
                translations = [simplify.convert(text) if source == 'zh' else translate(text) for text in texts]
            finally:
                lock.release()
            self.send_json(200, {'translations': translations, 'engine': 'argos-en-zh-1.9-f1-v2', 'statuses': ['translated' if text is not None else 'unavailable' for text in translations], 'inputHash': hashlib.sha256(json.dumps(texts, ensure_ascii=False).encode()).hexdigest()})
        except (ValueError, KeyError, TypeError, json.JSONDecodeError):
            self.send_json(400, {'status': 'invalid_request'})

    def log_message(self, _format, *_arguments):
        pass  # Headlines and source summaries must not enter access logs.


print('Offline translation ready on 127.0.0.1:' + str(args.port), flush=True)
ThreadingHTTPServer(('127.0.0.1', args.port), Handler).serve_forever()
