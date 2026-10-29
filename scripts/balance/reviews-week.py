# Konser eleştirisi tekrarı (playtest O-9): sim-playtest REVIEWS_OUT çıktısında açılış cümlesi kalıplarının tekrarı.
# Kullanım: python3 scripts/balance/reviews-week.py <reviews.jsonl>
import json, re, sys, collections
rows = [json.loads(l) for l in open(sys.argv[1]) if l.strip()]
from itertools import groupby
def norm(s, loc):
    s = re.sub(r'\d+', '#', s)
    return s
by = collections.defaultdict(list)
for r in rows:
    if r['tr'] and r['who'] in ('ada', 'hale'): by[(r['seed'], r['who'])].append(r['tr'])
tops, rivals, totals, opens_unique = [], 0, 0, []
for k, revs in by.items():
    opens = []
    for t in revs:
        first = re.split(r'(?<=[.!?…])\s+', t)[0]
        # açılışın ilk 5 kelimesi kalıp sayılır (mekân adı ve sayı ayıklanır)
        w = re.sub(r'\d+', '#', first).split()
        opens.append(' '.join(w[:6]))
        if 'Kıyaslama kaçınılmaz' in t or 'daha iyi bir iş çıkardı' in t: rivals += 1
    c = collections.Counter(opens)
    tops.append(c.most_common(1)[0][1] / len(opens))
    opens_unique.append(len(c) / len(opens))
    totals += len(revs)
print(json.dumps({'konser': totals, 'enSikAcilisPayi': round(sum(tops)/len(tops), 3), 'farkliAcilisOrani': round(sum(opens_unique)/len(opens_unique), 3), 'rakipKiyasi': rivals, 'rakipKiyasiPayi': round(rivals/totals, 3)}))
