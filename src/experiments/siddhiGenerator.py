# Leer el archivo de context rules
with open("siddhi.txt", "r") as f:
    context_rules = f.read()

# Leer las triggering rules generadas
with open("300-random-rules.txt", "r") as f:
    triggering_rules = f.read()

# Combinar todo
siddhi_full = "\n".join([context_rules, triggering_rules])

# Guardar en un archivo para Android
with open("example.txt", "w") as f:
    f.write(siddhi_full)

print("Archivo example.txt listo para Android con todas las reglas.")
