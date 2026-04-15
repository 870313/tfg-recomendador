# Use only a file with X triggering rules generated with triggering_rules script
#   You should delete context rules and the last line from that file
with open('triggering_rules.txt') as f:
    content = f.readlines()

result = [0, 0, 0, 0, 0, 0, 0]
for x in content:
    i = 0

    # atHome rule and status rule added together to random rules
    if "atHome" in x:
        i = i + 2

    rule = x.split("->")

    i = i + len(rule) - 1

    result[i] = result[i] + 1

print("END")
print(result)