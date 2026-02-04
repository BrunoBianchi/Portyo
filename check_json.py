
import json

def print_structure(data, depth=0, max_depth=3):
    if depth >= max_depth:
        return
    
    if isinstance(data, dict):
        for key in data:
            print("  " * depth + key)
            if key in ['editor', 'palette', 'editorPage', 'addBlock']:
                 print_structure(data[key], depth + 1, max_depth)
            elif depth == 0: # Print high level structure always
                 print_structure(data[key], depth + 1, 1)

try:
    with open('frontend/public/i18n/pt/dashboard.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        print("Structure of frontend/public/i18n/pt/dashboard.json:")
        print_structure(data)
except Exception as e:
    print(e)

print("-" * 20)

try:
    with open('frontend/public/i18n/en/dashboard.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        print("Structure of frontend/public/i18n/en/dashboard.json:")
        print_structure(data)
except Exception as e:
    print(e)
