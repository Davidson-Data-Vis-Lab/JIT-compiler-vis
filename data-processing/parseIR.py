"""
IR Phase Edge Parser - Reconstructs edges given an ir.json file
"""

import json
import sys

PHASES = [
    {"phaseFnId": 93598,  "name": "GraphBuilderPhase"},
    {"phaseFnId": 106391, "name": "InliningPhase"},
    {"phaseFnId": 113115, "name": "CopyMetadataForConcurrentCompilePhase"},
    {"phaseFnId": 114364, "name": "TyperPhase"},
    {"phaseFnId": 116499, "name": "TypedLoweringPhase"},
    {"phaseFnId": 117715, "name": "LoopPeelingPhase"},
    {"phaseFnId": 118352, "name": "LoadEliminationPhase"},
    {"phaseFnId": 120666, "name": "EscapeAnalysisPhase"},
    {"phaseFnId": 127301, "name": "GenericLoweringPhase"},
    {"phaseFnId": 128744, "name": "EarlyOptimizationPhase"},
    {"phaseFnId": 130937, "name": "EffectControlLinearizationPhase"},
    {"phaseFnId": 137709, "name": "LateOptimizationPhase"},
    {"phaseFnId": 139239, "name": "MemoryOptimizationPhase"},
    {"phaseFnId": 141217, "name": "MachineOperatorOptimizationPhase"},
    {"phaseFnId": 142962, "name": "InstructionSelectionPhase"},
]

PHASE_INDEX_LOOKUP = {}
for i, phase in enumerate(PHASES):
    PHASE_INDEX_LOOKUP[phase["phaseFnId"]] = i

def load_file(filepath):
    with open(filepath, "r") as f:
        return json.load(f)

def build_instr_to_phase(nodes):
    # build a dictionary with all phases
    instr_to_phase = {}

    for node in nodes:
        node_id = node.get("id")

        for instr_id_str, entry in node.get("removed", {}).items():
            instr_id = int(instr_id_str)
            instr_to_phase[(node_id, instr_id)] = {
                "type":      "removed",
                "from_node": entry.get("nodeId"),
            }

        for instr_id_str, entry in node.get("replaced", {}).items():
            instr_id = int(instr_id_str)
            instr_to_phase[(node_id, instr_id)] = {
                "type":      "replaced",
                "from_node": entry.get("from"),
                "to_node":   entry.get("to"),
            }

        for instr_id_str, access in node.get("instAccess", {}).items():
            instr_id = int(instr_id_str)
            if (node_id, instr_id) in instr_to_phase:
                instr_to_phase[(node_id, instr_id)]["phaseFnId"] = access.get("phaseFnId")

    return instr_to_phase

def build_initial_edges(nodes):
    initial_edges = []
    for node in nodes:
        node_id = node.get("id")
        for y in node.get("initialEdges", []):
            initial_edges.append([node_id, y])
    return initial_edges

def build_final_edges(nodes):
    final_edges = []
    for node in nodes:
        node_id = node.get("id")
        for y in node.get("edges", []):
            final_edges.append([node_id, y])
    return final_edges
    

def build_phase_dict(instr_to_phase, initial_edges, final_edges):
    phase_edges = []
    for i in range(len(PHASES)):
        phase_edges.append(list(initial_edges))

    

    for (node_id, instr_id), info in sorted(instr_to_phase.items()):
        phase_fn_id = info.get("phaseFnId")
        phase_idx   = PHASE_INDEX_LOOKUP.get(phase_fn_id, -1)
        if phase_idx == -1:
            continue

        if info["type"] == "removed":
            from_node = info["from_node"]
            for p in range(phase_idx, len(PHASES) - 1):
                if [node_id, from_node] in phase_edges[p]:
                    phase_edges[p].remove([node_id, from_node])

        elif info["type"] == "replaced":
            from_node = info["from_node"]
            to_node   = info["to_node"]
            for p in range(phase_idx, len(PHASES) - 1):
                if [node_id, from_node] in phase_edges[p]:
                    phase_edges[p].remove([node_id, from_node])
                    phase_edges[p].append([node_id, to_node])

    # overwrite the last phase with final edges
    phase_edges[len(PHASES) - 1] = final_edges

    result = []
    for i, phase in enumerate(PHASES):
        result.append({
            "phase_index": i,
            "phaseFnId":   phase["phaseFnId"],
            "name":        phase["name"],
            "edges":       phase_edges[i],
        })
    return result


def print_phases(phases):
    for phase in phases:
        print("Phase " + str(phase["phase_index"]) + ": " + phase["name"])
        for pair in phase["edges"]:
            print("  " + str(pair[0]) + " -> " + str(pair[1]))
        print()

def write_output(phases, nodes, filepath):
    node_ids = [node.get("id") for node in nodes]

    result = {}
    for node_id in node_ids:
        result[node_id] = {}
        for phase in phases:
            node_edges = [pair[1] for pair in phase["edges"] if pair[0] == node_id]
            result[node_id][phase["phaseFnId"]] = node_edges

    with open(filepath, "w") as f:
        json.dump(result, f, indent=2)
    print("Written to " + filepath)


def print_phases_by_node(phases, nodes):
    # get all node ids
    node_ids = [node.get("id") for node in nodes]
    
    for node_id in node_ids:
        print("Node " + str(node_id))
        for phase in phases:
            # find all edges where this node is x
            node_edges = [pair[1] for pair in phase["edges"] if pair[0] == node_id]
            print("  Phase " + str(phase["phase_index"]) + " (" + phase["name"] + "): " + str(node_edges))
        print()

# run
data           = load_file(sys.argv[1])
nodes          = data.get("nodes", [])
initial_edges  = build_initial_edges(nodes)
final_edges    = build_final_edges(nodes)
instr_to_phase = build_instr_to_phase(nodes)
phases         = build_phase_dict(instr_to_phase, initial_edges, final_edges)

if len(sys.argv) > 2 and sys.argv[2] == "--output":
    write_output(phases, nodes, sys.argv[3])
else:
    print_phases_by_node(phases, nodes)