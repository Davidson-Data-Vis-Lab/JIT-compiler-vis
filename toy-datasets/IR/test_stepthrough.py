import json

# Loading data in 
with open("toy-datasets/IR/ir5129.json") as f:
    data = json.load(f)

# Setting up an empty list to store events
removed_events = []  

# Iterating through nodes[id] and then the removed dictionary and creating a new dictionary of removed data (removed node saved)
# And instAccess dictionary; instruction id saved

for node in data["nodes"]:
    node_id = node["id"]
    removed_dict = node.get("removed", {})
    inst_access_dict = node.get("instAccess", {})

    # Going through removed dictionary items

    for instr_id, removed_node_id in removed_dict.items():

        # Connecting instAccess info with removed node ID
        inst_access_info = inst_access_dict.get(instr_id, {})
        fn_call_ret_id = inst_access_info.get("fnCallRetId", {})

        removed_events.append([
            removed_node_id,   
            node_id,           
            fn_call_ret_id     
        ])

# Sorting the dictionary by function fn call ret id

removed_events.sort(key=lambda x: (x[2]))

# Printing cleanly

for removed_node_id, node_id, fn_call_ret_id in removed_events:
    print(f"fnCall {fn_call_ret_id} says node {node_id} removed node {removed_node_id}")


#  Defining target phrase to search for

# target_phase_string = "Phase::Run"

# Creating empty dictionary to store phase IDs and names
# phase_ids = {}

# Iterating through fnID2Name dictionary, saving fn name and id
# for num, fn_name in data["fnId2Name"].items():
#     if target_phase_string in str(fn_name):
#         phase_ids.update({num:fn_name})

# Creating empty dictionary to store function and # of calls 
# phase_counter = {}

# Aggregating callids by function id
# for callId, fnId in data["fnCallRetId2fnId"].items():
#     if fnId in phase_ids.keys():
#         if fnId not in phase_counter.keys():
#             phase_counter.update({fnId:{callId}})
#         else:
#             key = phase_counter.get(fnId)
#             phase_counter.update


# total_phase_calls = 0

# for key in phase_counter.keys():
#     total_phase_calls += len(phase_counter.get(key))

 # Total phase calls: 82, total phase functions 15 (called multiple times)
# or each id in phase_ids:
 
# print("Total phase calls:", total_phase_calls)

