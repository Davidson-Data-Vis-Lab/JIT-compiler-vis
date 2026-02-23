import json

with open("toy-datasets/IR/ir5129.json") as f:
    data = json.load(f)

target_fnId = "105039"

call_ids = []

for callId, fnId in data["fnCallRetId2fnId"].items():
    if str(fnId) == target_fnId:
        call_ids.append(callId)

print("GraphBuilderPhase::Run was called", len(call_ids), "times.")
print("Call IDs:", call_ids)

