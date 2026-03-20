import json

with open("toy-datasets/IR/ir5129.json") as f:
    data = json.load(f)

target_phase_string = "Phase::Run"

phase_ids = {}

for num, fn_name in data["fnId2Name"].items():
    if target_phase_string in str(fn_name):
        phase_ids.update({num:fn_name})



phase_counter = {}

for callId, fnId in data["fnCallRetId2fnId"].items():  
    if str(fnId) in phase_ids.keys():
        if str(fnId) not in phase_counter.keys():
            phase_counter.update({str(fnId):[callId]})
        else:
            function_list = phase_counter.get(str(fnId))
            function_list.append(callId)
            phase_counter.update({str(fnId):function_list})

print(phase_counter)

total_phase_calls = 0

for key in phase_counter.keys():
    total_phase_calls += len(phase_counter.get(key))
    print(f"{key} has " + str(len(phase_counter.get(key))) + " calls")
    print(phase_counter.get(key))
    print("\n")

print("There are " + str(total_phase_calls) + " total phase calls.")

nodes = data["nodes"]

total_instructions = 0
fnCallRetIDs = set()

for node in nodes:

    instructionAccess = node["instAccess"]

    instructions = instructionAccess.keys()

    for instructionID in instructions:

        total_instructions += 1

        fnCallRetIDs.add(instructionAccess[instructionID]["fnCallRetId"])

print("There are " + str(total_instructions) + " total instructions within the JSON file.")
print("There are " + str(len(fnCallRetIDs)) + " total, unique function call return IDs within the JSON file")


#instructionAccess = nodes[0]["instAccess"]

#for instruction in instructionAccess.keys():
#   print(instructionAccess.get(instruction)['address'])