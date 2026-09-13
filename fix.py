import os
import re

filepath = 'src/views/public/PublicCertificationView.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Just replace the specific line
old_line = "setCertification((prev: any) => ({ ...prev, ...data }));"
new_lines = """// Recargar datos completos para evitar inconsistencias
        const { data: newData } = await api.get(/certifications/public/);
        if (newData.certification) {
          setFullData(newData);
          setCertification(newData.certification);
        } else {
          setFullData({ certification: newData, baseQuotation: null, budgetQuotation: null, certifications: [] });
          setCertification(newData);
        }"""

if old_line in content:
    content = content.replace(old_line, new_lines)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Done!")
else:
    print("Old line not found!")
