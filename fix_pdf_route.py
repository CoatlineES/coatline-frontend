import os

filepath = 'src/views/public/PublicCertificationView.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_line = "const response = await api.post('/projects/generate-pdf', {"
new_line = "const response = await api.post('/certifications/public/generate-pdf', {"

if old_line in content:
    content = content.replace(old_line, new_line)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Done!")
else:
    print("Old line not found!")
