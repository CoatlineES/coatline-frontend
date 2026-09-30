import sys

filepath = r'c:\Users\whilmis\Documents\GitHub\coastline-\src\views\employee\CrmView.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Accounts payload
t1 = '''          phone: editingAccount.phone || undefined,
          city: editingAccount.city || undefined,
          filial: editingAccount.filial || undefined,
        };'''
r1 = '''          phone: editingAccount.phone || undefined,
          city: editingAccount.city || undefined,
          filial: editingAccount.filial || undefined,
          notes: editingAccount.notes || undefined,
        };'''
content = content.replace(t1, r1)

# Contacts payload
t2 = '''        email: editingContact.email || undefined,
        phone: editingContact.phone || undefined,
        position: editingContact.position || undefined,
      };'''
r2 = '''        email: editingContact.email || undefined,
        phone: editingContact.phone || undefined,
        position: editingContact.position || undefined,
        notes: editingContact.notes || undefined,
      };'''
content = content.replace(t2, r2)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
