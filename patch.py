# -*- coding: utf-8 -*-
import sys

filepath = r'c:\Users\whilmis\Documents\GitHub\coastline-\src\views\employee\CrmView.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Accounts Excel Import
t1 = '''              city: row['Ciudad'] || row['city'],
            })).filter(item => !!item.name); // Filter out empty rows'''
r1 = '''              city: row['Ciudad'] || row['city'],
              notes: row['Notas'] || row['notas'] || row['Notes'] || row['notes'] || '',
            })).filter(item => !!item.name); // Filter out empty rows'''
content = content.replace(t1, r1)

# 2. Contacts Excel Import
t2 = '''                  position: row['Cargo'] || row['cargo'] || row['position'] || row['__EMPTY_4'] || (values[4] as string) || '',
                };
              }).filter(item => !!item.accountName && !!item.name);'''
r2 = '''                  position: row['Cargo'] || row['cargo'] || row['position'] || row['__EMPTY_4'] || (values[4] as string) || '',
                  notes: row['Notas'] || row['notas'] || row['Notes'] || row['notes'] || row['__EMPTY_5'] || (values[5] as string) || '',
                };
              }).filter(item => !!item.accountName && !!item.name);'''
content = content.replace(t2, r2)

# 3. Account Modal
t3 = '''                      placeholder="Ej. Grupo EULEN"
                    />
                  </div>
                <div className="flex justify-end gap-3 pt-4">'''
r3 = '''                      placeholder="Ej. Grupo EULEN"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Notas</label>
                    <textarea
                      value={editingAccount.notes || ''}
                      onChange={(e) => setEditingAccount({...editingAccount, notes: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50 min-h-[80px] resize-y"
                      placeholder="Notas adicionales sobre la empresa..."
                    />
                  </div>
                <div className="flex justify-end gap-3 pt-4">'''
content = content.replace(t3, r3)

# 4. Contact Modal
t4 = '''                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">'''
r4 = '''                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Notas</label>
                  <textarea
                    value={editingContact.notes || ''}
                    onChange={(e) => setEditingContact({...editingContact, notes: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50 min-h-[80px] resize-y"
                    placeholder="Notas adicionales sobre el contacto..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">'''
content = content.replace(t4, r4)

# 5. Accounts Table Header
t5 = '''                    <th className="p-5 border-b border-slate-200 text-center">Completadas</th>
                    <th 
                      className="p-5 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"'''
r5 = '''                    <th className="p-5 border-b border-slate-200 text-center">Completadas</th>
                    <th className="p-5 border-b border-slate-200 text-center">Notas</th>
                    <th 
                      className="p-5 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"'''
content = content.replace(t5, r5)

# 6. Accounts Table Row
t6 = '''                            )}
                          </td>
                          <td className="p-5 text-slate-500 text-sm">
                            {new Date(acc.createdAt).toLocaleDateString()}'''
r6 = '''                            )}
                          </td>
                          <td className="p-5 text-slate-500 text-sm max-w-[150px] truncate" title={acc.notes || ''}>
                            {acc.notes || '-'}
                          </td>
                          <td className="p-5 text-slate-500 text-sm">
                            {new Date(acc.createdAt).toLocaleDateString()}'''
content = content.replace(t6, r6)

# 7. Contacts Table Header
t7 = '''                    <th className="p-5 border-b border-slate-200">Cargo</th>
                    <th className="p-5 border-b border-slate-200">Teléfono</th>
                    <th className="p-5 border-b border-slate-200">Empresa (Cuenta)</th>'''
r7 = '''                    <th className="p-5 border-b border-slate-200">Cargo</th>
                    <th className="p-5 border-b border-slate-200">Teléfono</th>
                    <th className="p-5 border-b border-slate-200">Notas</th>
                    <th className="p-5 border-b border-slate-200">Empresa (Cuenta)</th>'''
content = content.replace(t7, r7)

# 8. Contacts Table Row
t8 = '''                            </div>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-2 text-sm font-medium text-[#001c3a]">'''
r8 = '''                            </div>
                          </td>
                          <td className="p-5 text-slate-500 text-sm max-w-[150px] truncate" title={contact.notes || ''}>
                            {contact.notes || '-'}
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-2 text-sm font-medium text-[#001c3a]">'''
content = content.replace(t8, r8)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
