"""F1 terminology and conservative machine-output checks; no story-specific rewrites."""
import json
import re
from pathlib import Path

_parent = Path(__file__).resolve().parents[1]
_names_path = next(path for path in (_parent / 'public-reference' / 'names.json',
                                   _parent / 'reference' / 'names.json') if path.is_file())
NAMES = json.loads(_names_path.read_text(encoding='utf-8-sig'))
GLOSSARY = dict(NAMES)
for _english, _chinese in NAMES.items():
    if re.search(r'\b[A-Z]{3,}\b', _english):
        GLOSSARY[_english.split()[-1]] = _chinese.split('·')[-1]
GLOSSARY.update({
    'Red Bull': '红牛', 'Haas': '哈斯', 'Sauber': '索伯',
    'Sao Paulo': '圣保罗', 'São Paulo': '圣保罗', 'Interlagos': '英特拉格斯',
    'Grand Prix': '大奖赛', 'Formula One': '一级方程式', 'Formula 1': '一级方程式',
    'Formula 2': '二级方程式', 'Formula 3': '三级方程式',
    'pole position': '杆位', 'qualifying session': '排位赛',
    'Safety Car': '安全车', 'Virtual Safety Car': '虚拟安全车',
    'pit stop': '进站', 'parc ferme': '封闭车检区', 'paddock': '围场',
    'sprint': '冲刺赛', 'WATCH': '视频', 'HIGHLIGHTS': '集锦',
})
ALIASES = {
    'Russell': {'罗素': '拉塞尔'},
    'Hamilton': {'哈密顿': '汉密尔顿', '哈密尔顿': '汉密尔顿'},
    'Sainz': {'赛恩斯': '塞恩斯', '塞恩兹': '塞恩斯'},
    'Verstappen': {'韦斯塔潘': '维斯塔潘'},
    'Ferrari': {'法拉里': '法拉利'},
    'McLaren': {'麦克拉伦': '迈凯伦', '迈克拉伦': '迈凯伦'},
    'Albon': {'阿尔邦': '阿尔本'},
    'Camara': {'卡马拉': '卡马拉'},
}
ABBREVIATIONS = frozenset(('F1', 'F2', 'F3', 'FIA', 'DRS', 'ERS', 'KERS', 'MGU',
                          'GP', 'GP2', 'GP3', 'V6', 'V8', 'V10', 'V12', 'ABS',
                          'LED', 'GPS', 'AI', 'CEO', 'TV', 'BBC', 'CNN', 'AP',
                          'USD', 'EUR', 'km', 'mph', 'kmh', 'kW', 'bhp', 'kg', 'mm'))


def _word(pattern):
    return r'(?<![A-Za-z])' + re.escape(pattern) + r'(?![A-Za-z])'


def prepare_english(text):
    """Expand terse, ambiguous racing terms using their normal English meanings."""
    text = re.sub(r'\brues\b', 'regrets', text, flags=re.I)
    text = re.sub(r'\brued\b', 'regretted', text, flags=re.I)
    text = re.sub(r'\brue\b', 'regret', text, flags=re.I)
    text = re.sub(r'\bpole\b(?!\s+position)', 'pole position', text, flags=re.I)
    text = re.sub(r'\bdebut qualifying\b', 'first qualifying session', text, flags=re.I)
    text = re.sub(r'\bafter (crash|collision)\b', r'after a \1', text, flags=re.I)
    text = re.sub(r'\bqualifying(?=[.!?]?\s*$)', 'qualifying session', text, flags=re.I)
    # Headline punctuation matters to this small sentence translation model.
    if text and text[-1] not in '.!?。！？':
        text += '.'
    return text


def split_sentences(text):
    """Keep decimal/lap times intact and avoid splitting common abbreviations."""
    sentences, start = [], 0
    for match in re.finditer(r'[.!?]+["\u201d\u2019)]*\s+(?=[A-Z"\u201c\u2018(])', text):
        candidate = text[start:match.end()].strip()
        if re.search(r'\b(?:Mr|Mrs|Ms|Dr|Prof|St|vs|No)\.$', candidate, re.I):
            continue
        if re.search(r'(?:\b[A-Z]\.){2,}$', candidate):
            continue
        if candidate:
            sentences.append(candidate)
        start = match.end()
    if text[start:].strip():
        sentences.append(text[start:].strip())
    return sentences


def postprocess(source, output):
    # Work on output only: mixing Chinese glossary words into an English input
    # makes this model omit subjects and clauses.
    for english, chinese in sorted(GLOSSARY.items(), key=lambda item: -len(item[0])):
        if re.search(_word(english), source, re.I):
            output = re.sub(_word(english), chinese, output, flags=re.I)
    for english, chinese in NAMES.items():
        if re.search(_word(english), source, re.I) and ' ' in english:
            first = english.split()[0]
            output = re.sub(_word(first), chinese.split('·')[0], output, flags=re.I)
    for english, aliases in ALIASES.items():
        if re.search(_word(english), source, re.I):
            for before, after in aliases.items():
                output = output.replace(before, after)
    if re.search(r'\bpole\b', source, re.I):
        output = re.sub('极点位置|杆位置|杆子|柱子|极位', '杆位', output)
    if re.search(r'\bqualifying\b', source, re.I):
        output = re.sub('资格赛|资格|合格', '排位赛', output)
    if re.search(r'\bcrash\b', source, re.I):
        output = output.replace('失事', '撞车')
    if re.search(r'\bdebut\b', source, re.I):
        output = output.replace('首播', '首次').replace('第一届', '首次')
    if re.search(r'\bgrid\b', source, re.I):
        output = output.replace('电网', '发车位')

    def duplicate_name(match):
        a = re.sub(r'[·\s]', '', match[1])
        b = re.sub(r'[·\s]', '', match[2])
        return match[1] if a == b else match[0]

    output = re.sub(r'([\u3400-\u9fff·]{2,40})\s*[（(]\s*([\u3400-\u9fff·\s]{2,40})\s*[）)]', duplicate_name, output)
    output = output.translate(str.maketrans({',': '，', ';': '；', '!': '！', '?': '？'}))
    output = re.sub(r'(?<!\d):|:(?!\d)', '：', output)
    output = re.sub(r'(?<!\d)\.|\.(?!\d)', '。', output)
    return re.sub(r'\s*([，。；：！？])\s*', r'\1', output).strip()


def quality_issues(source, output):
    if not isinstance(output, str) or not re.search(r'[\u3400-\u9fff]', output):
        return ['missing_chinese']
    issues = []
    words = re.findall(r'[A-Za-z][A-Za-z0-9]*(?:[-_][A-Za-z0-9]+)*', output)
    if any(word not in ABBREVIATIONS and not re.fullmatch(r'(?:[PQ]\d|[A-Z]{1,3}\d{2,3})', word) for word in words):
        issues.append('untranslated_english')
    if len(re.sub(r'\s', '', output)) < len(re.sub(r'\s', '', source)) * 0.15:
        issues.append('truncated_output')
    for english, chinese in GLOSSARY.items():
        if english not in NAMES and not re.search(r'\b[A-Z]{3,}\b', english):
            continue
        if re.search(_word(english), source, re.I):
            expected = chinese.split('·')[-1].removesuffix('车队')
            if expected and expected not in output:
                issues.append('missing_name')
                break
    numeric_source = re.sub(r'\b(?:F[123]|GP[23]?|[PQ]\d|V(?:6|8|10|12)|Formula\s*1)\b', '', source, flags=re.I)
    for number in re.findall(r'\d+(?:[.:]\d+)*', numeric_source):
        alternatives = {'1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六', '7': '七', '8': '八', '9': '九', '10': '十'}
        if number not in output and alternatives.get(number, '\x00') not in output:
            issues.append('missing_number')
            break
    requirements = ((r'\bpole\b', '杆位|头位'), (r'\bcrash\b', '撞|碰|事故'),
                    (r'\bqualifying\b', '排位|Q[123]'))
    for pattern, expected in requirements:
        if re.search(pattern, source, re.I) and not re.search(expected, output):
            issues.append('missing_racing_term')
    if re.search(r'\b(?:not|never|no(?!\s*\d))\b', source, re.I) and not re.search('不|没|未|无|否', output):
        issues.append('missing_negation')
    return issues
