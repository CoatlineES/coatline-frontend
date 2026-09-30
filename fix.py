import sys

filepath = r'c:\Users\whilmis\Documents\GitHub\coastline-\src\views\employee\CrmView.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

if content.startswith('\ufeff'):
    content = content[1:]

try:
    fixed_content = content.encode('windows-1252').decode('utf-8')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    print("Fixed file successfully.")
except Exception as e:
    print("Error:", e)
