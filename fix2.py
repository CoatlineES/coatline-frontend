import os

filepath = 'src/views/public/PublicCertificationView.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Just replace the specific line
old_line = "const { data } = await api.post(/certifications/public//sign,"
new_line = "await api.post(/certifications/public//sign,"

if old_line in content:
    content = content.replace(old_line, new_line)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Done!")
else:
    print("Old line not found!")
