import glob, re, os
from collections import defaultdict
import json

dir_path = r'e:\MY WORK\Web Scraping\FIle cào\vinfasttaysaigon.vn'
html_files = glob.glob(os.path.join(dir_path, '*.html'))

external_links = defaultdict(set)
link_contexts = defaultdict(list)

for fpath in html_files:
    fname = os.path.basename(fpath)
    with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # 1. Check href in <a>
    matches = re.finditer(r'<a\s+([^>]*?)href=["\']([^"\']+)["\']([^>]*)>(.*?)</a>', content, re.IGNORECASE | re.DOTALL)
    for m in matches:
        before_attr = m.group(1)
        href = m.group(2).strip()
        after_attr = m.group(3)
        inner_text = re.sub(r'<[^>]+>', '', m.group(4)).strip()[:60]
        
        if any(d in href for d in ['vinfastauto.com', 'vinfast.vn', 'shop.vinfastauto', 'go.vinfastauto']):
            # Filter out pdf/media files from count if purely static documentation
            external_links[href].add(fname)
            if len(link_contexts[href]) < 3:
                link_contexts[href].append({'file': fname, 'text': inner_text, 'attrs': (before_attr + ' ' + after_attr)[:80]})

    # 2. Check form actions
    form_matches = re.finditer(r'<form\s+([^>]*?)action=["\']([^"\']+)["\']', content, re.IGNORECASE)
    for m in form_matches:
        action = m.group(2).strip()
        if any(d in action for d in ['vinfastauto.com', 'vinfast.vn']):
            external_links['FORM_ACTION: ' + action].add(fname)

print(f"Total unique external Vinfast links found: {len(external_links)}")
results = []
for href, files in sorted(external_links.items(), key=lambda x: -len(x[1])):
    results.append({
        'href': href,
        'count': len(files),
        'files': list(files)[:5],
        'samples': link_contexts[href]
    })

with open(os.path.join(dir_path, 'external_links_report.json'), 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("\nTOP EXTERNAL LINKS FOUND:")
for r in results[:25]:
    print(f"[{r['count']} files] {r['href']} -> Sample text: {[s['text'] for s in r['samples']]}")
