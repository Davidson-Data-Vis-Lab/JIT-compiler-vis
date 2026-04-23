"""
IR Phase Edge Parser - Reconstructs edges given an ir.json file
"""

import json
import sys

# Write in list of all recognized phase::run phases

PHASES = [
  {"phaseFnId": 93598, "phase_name": "GraphBuilderPhase"},
  {"phaseFnId": 106391, "name": "InliningPhase"},
    {"phaseFnId": 113115, "name": "CopyMetadataForConcurrentCompilePhase"},
    {"phaseFnId": 114364, "name": "TyperPhase"},
    {"phaseFnId": 116499, "name": "TypedLoweringPhase"},
    {"phaseFnId": 117715, "name": "LoopPeelinPhase"},
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

def loadfile(filepath):
    with open(filepath, "r") as f:
        return json.load(f)
    
# def phases_to_instr(data):
#     phases_to_instr = {}

#     for node in nodes: 
#         for added_instr in node.get("added", {}).items():
#             added_instr = int()

#         for instr_id_str, access in node.get("instAccess", {}).items():
#             instr_id = int(instr_id_str)
#             phase_id = access.get("phaseFnId")


def build_instr_to_phase(nodes):
    instr_to_phase = {}

    for node in nodes:
        node_id = node.get("id")
    # Only get instruction ids from when it's a relevant instruction
        arr_instrs = set()
        for instr_id_str in node.get("added", {}).keys():
            arr_instrs.add(int(instr_id_str))
        for instr_id_str in node.get("removed", {}).keys():
            arr_instrs.add(int(instr_id_str))
        for instr_id_str in node.get("replaced", {}).keys():
            arr_instrs.add(int(instr_id_str))

    # Now only pull phaseFnId from instAccess for those IDs
        instr_to_phase[node_id] = {}
        for instr_id_str, access in node.get("instAccess", {}).items():
            instr_id = int(instr_id_str)
            if instr_id in arr_instrs:
                instr_to_phase[node_id][instr_id] = access.get("phaseFnId")

    return instr_to_phase


def  (nodes, instr_to_phase):
    # start each middle phase as a copy of the previous
    # (you'll pass in phase 0's edges to seed this)
    
    for node in nodes:
        node_id = node.get("id")

        for instr_id_str, entry in node.get("removed", {}).items():
            instr_id    = int(instr_id_str)
            phase_fn_id = build_instr_to_phase[node_id].get(instr_id)
            phase_idx   = PHASE_INDEX_LOOKUP.get(phase_fn_id, -1)
            if phase_idx == -1:
                continue
            # apply remove to phase_edges[phase_idx]

        for instr_id_str, entry in node.get("replaced", {}).items():
            instr_id    = int(instr_id_str)
            phase_fn_id = instr_to_phase[node_id].get(instr_id, -1)
            phase_idx   = PHASE_INDEX_LOOKUP.get(phase_fn_id, -1)
            if phase_idx == -1:
                continue
            # apply replace to phase_edges[phase_idx]

# ---------------------------------------------------------------------------
# Step 3: Collect every REMOVE and REPLACE instruction across all nodes,
#         sorted by instruction ID so we process them in order.
#
# Each entry looks like:
#   {
#     "instr_id":   12345,
#     "node_id":    42,       <- the node being modified (x)
#     "type":       "remove" or "replace",
#     "from_node":  19,       <- y being removed
#     "to_node":    25,       <- y being added (replace only)
#     "position":   0,
#     "phase_fn_id": 106391
#   }
# ---------------------------------------------------------------------------



def collect_instructions(nodes, instr_to_phase):
    mutations = []

    for node in nodes:
        node_id = node.get("id")

        for instr_id_str, entry in node.get("removed", {}).items():
            instr_id    = int(instr_id_str)
            phase_fn_id = instr_to_phase[node_id].get(instr_id)
            mutations.append({
                "instr_id":    instr_id,
                "node_id":     node_id,
                "type":        "remove",
                "from_node":   entry.get("nodeId"),
                "to_node":     None,
                "position":    entry.get("position", 0),
                "phase_fn_id": phase_fn_id,
            })

        for instr_id_str, entry in node.get("replaced", {}).items():
            instr_id    = int(instr_id_str)
            phase_fn_id = instr_to_phase[node_id].get(instr_id, -1)
            mutations.append({
                "instr_id":    instr_id,
                "node_id":     node_id,
                "type":        "replace",
                "from_node":   entry.get("from"),
                "to_node":     entry.get("to"),
                "position":    entry.get("position", 0),
                "phase_fn_id": phase_fn_id,
            })

    mutations.sort(key=lambda m: m["instr_id"])
    return mutations


def get_phases(data):
    fnName = data.get("fnId2Name", {})
    nodes = data.get("nodes", [])
    instructions = {}

    


"""
IR Phase Edge Parser
====================
Builds a list of [x, y] edge pairs for each optimization phase,
where x is the node being modified and y is the input node.

Each phase carries forward all edges from the previous phase,
then applies any REMOVE or REPLACE changes that happened during it.

Usage:
    python parse_ir_phases.py ir.json
    python parse_ir_phases.py ir.json --output edges_by_phase.json
"""

import json
import sys
import copy


# ---------------------------------------------------------------------------
# Hardcoded phases - phaseFnId -> short name
# Ordered by their position in the compilation pipeline
# ---------------------------------------------------------------------------

PHASES = [
    {"phaseFnId": 93598,  "name": "GraphBuilder"},
    {"phaseFnId": 106391, "name": "Inlining"},
    {"phaseFnId": 113115, "name": "CopyMetadataForConcurrentCompile"},
    {"phaseFnId": 114364, "name": "Typer"},
    {"phaseFnId": 116499, "name": "TypedLowering"},
    {"phaseFnId": 117715, "name": "LoopPeeling"},
    {"phaseFnId": 118352, "name": "LoadElimination"},
    {"phaseFnId": 120666, "name": "EscapeAnalysis"},
    {"phaseFnId": 127301, "name": "GenericLowering"},
    {"phaseFnId": 128744, "name": "EarlyOptimization"},
    {"phaseFnId": 130937, "name": "EffectControlLinearization"},
    {"phaseFnId": 137709, "name": "LateOptimization"},
    {"phaseFnId": 139239, "name": "MemoryOptimization"},
    {"phaseFnId": 141217, "name": "MachineOperatorOptimization"},
    {"phaseFnId": 142962, "name": "InstructionSelection"},
]

# Build a lookup so we can go phaseFnId -> index in the list above
PHASE_INDEX_LOOKUP = {}
for i, phase in enumerate(PHASES):
    PHASE_INDEX_LOOKUP[phase["phaseFnId"]] = i


# ---------------------------------------------------------------------------
# Step 1: Load the file
# ---------------------------------------------------------------------------

def load_json(filepath):
    with open(filepath, "r") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Step 2: Pre-process instAccess so we can quickly look up
#         which phase any instruction ID belongs to.
#
# Builds a dict: node_id -> { instr_id -> phaseFnId }
# We need this so that when we walk through removed/replaced,
# we already know which phase each instruction belongs to.
# ---------------------------------------------------------------------------

def build_instr_to_phase(nodes):
    # node_id -> { instr_id (int) -> phaseFnId }
    instr_to_phase = {}

    for node in nodes:
        node_id = node.get("id")
        instr_to_phase[node_id] = {}

        for instr_id_str, access in node.get("instAccess", {}).items():
            instr_id    = int(instr_id_str)
            phase_fn_id = access.get("phaseFnId", -1)
            instr_to_phase[node_id][instr_id] = phase_fn_id

    return instr_to_phase


# ---------------------------------------------------------------------------
# Step 3: Collect every REMOVE and REPLACE instruction across all nodes,
#         sorted by instruction ID so we process them in order.
#
# Each entry looks like:
#   {
#     "instr_id":   12345,
#     "node_id":    42,       <- the node being modified (x)
#     "type":       "remove" or "replace",
#     "from_node":  19,       <- y being removed
#     "to_node":    25,       <- y being added (replace only)
#     "position":   0,
#     "phase_fn_id": 106391
#   }
# ---------------------------------------------------------------------------

def collect_mutations(nodes, instr_to_phase):
    mutations = []

    for node in nodes:
        node_id = node.get("id")

        for instr_id_str, entry in node.get("removed", {}).items():
            instr_id    = int(instr_id_str)
            phase_fn_id = instr_to_phase[node_id].get(instr_id, -1)
            mutations.append({
                "instr_id":    instr_id,
                "node_id":     node_id,
                "type":        "remove",
                "from_node":   entry.get("nodeId"),
                "to_node":     None,
                "position":    entry.get("position", 0),
                "phase_fn_id": phase_fn_id,
            })

        for instr_id_str, entry in node.get("replaced", {}).items():
            instr_id    = int(instr_id_str)
            phase_fn_id = instr_to_phase[node_id].get(instr_id, -1)
            mutations.append({
                "instr_id":    instr_id,
                "node_id":     node_id,
                "type":        "replace",
                "from_node":   entry.get("from"),
                "to_node":     entry.get("to"),
                "position":    entry.get("position", 0),
                "phase_fn_id": phase_fn_id,
            })

    mutations.sort(key=lambda m: m["instr_id"])
    return mutations


# ---------------------------------------------------------------------------
# Step 4: Build the edge pairs for every phase.
#
# - Phase 0 (GraphBuilder) starts from initialEdges
# - Each subsequent phase carries forward the previous phase's pairs,
#   then applies any mutations that belong to it
# - Final phase (InstructionSelection) is snapped from the node's
#   edges array (the post-optimization final state)
# ---------------------------------------------------------------------------

def build_phase_edges(data):
    nodes          = data.get("nodes", [])
    instr_to_phase = build_instr_to_phase(nodes)
    mutations      = collect_mutations(nodes, instr_to_phase)

    # We'll store each phase's edges as a dict: (x, y) -> True
    # Using a dict keyed by tuple makes remove/replace easy.
    # At the end we convert to a list of [x, y] pairs.

    num_phases  = len(PHASES)
    phase_edges = [dict() for _ in range(num_phases)]   # one dict per phase

    # --- First phase: seed from initialEdges ---
    first_phase_edges = {}
    for node in nodes:
        node_id = node.get("id")
        for y in node.get("initialEdges", []):
            if y is not None:
                first_phase_edges[(node_id, y)] = True

    phase_edges[0] = first_phase_edges

    # --- Middle phases: carry forward then apply mutations ---
    # First carry forward phase 0 into all others (we'll overwrite as we go)
    for i in range(1, num_phases - 1):
        phase_edges[i] = copy.copy(phase_edges[i - 1])

    # Now walk through mutations in order and apply to the right phase
    for mutation in mutations:
        phase_fn_id = mutation["phase_fn_id"]
        phase_idx   = PHASE_INDEX_LOOKUP.get(phase_fn_id, -1)

        # Skip if this instruction doesn't belong to a known phase
        if phase_idx == -1:
            continue

        # Skip first and last phase - handled separately
        if phase_idx == 0 or phase_idx == num_phases - 1:
            continue

        node_id   = mutation["node_id"]
        from_node = mutation["from_node"]
        to_node   = mutation["to_node"]

        if mutation["type"] == "remove":
            pair = (node_id, from_node)
            if pair in phase_edges[phase_idx]:
                del phase_edges[phase_idx][pair]
            # Also carry the removal forward into all later phases
            for later in range(phase_idx + 1, num_phases - 1):
                if pair in phase_edges[later]:
                    del phase_edges[later][pair]

        elif mutation["type"] == "replace":
            old_pair = (node_id, from_node)
            new_pair = (node_id, to_node)
            if old_pair in phase_edges[phase_idx]:
                del phase_edges[phase_idx][old_pair]
            phase_edges[phase_idx][new_pair] = True
            # Carry forward into later phases
            for later in range(phase_idx + 1, num_phases - 1):
                if old_pair in phase_edges[later]:
                    del phase_edges[later][old_pair]
                phase_edges[later][new_pair] = True

    # --- Last phase: seed from final edges array ---
    last_phase_edges = {}
    for node in nodes:
        node_id = node.get("id")
        for y in node.get("edges", []):
            if y is not None:
                last_phase_edges[(node_id, y)] = True

    phase_edges[num_phases - 1] = last_phase_edges

    # --- Convert each phase dict to a list of [x, y] pairs ---
    result = []
    for i, phase in enumerate(PHASES):
        pairs = [[x, y] for (x, y) in sorted(phase_edges[i].keys())]
        result.append({
            "phase_index": i,
            "phaseFnId":   phase["phaseFnId"],
            "name":        phase["name"],
            "edges":       pairs,
        })

    return result


# ---------------------------------------------------------------------------
# Step 5: Print output
# ---------------------------------------------------------------------------

def pretty_print(phases):
    for phase in phases:
        print("=" * 60)
        print("Phase " + str(phase["phase_index"]) + ": " + phase["name"])
        print("phaseFnId: " + str(phase["phaseFnId"]))
        print("Edge pairs [node, input_node]:")
        for pair in phase["edges"]:
            print("  " + str(pair))
        print()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if len(sys.argv) < 2:
    print("Usage: python parse_ir_phases.py ir.json [--output out.json]")
    sys.exit(1)

ir_file     = sys.argv[1]
output_file = None
pretty      = False

i = 2
while i < len(sys.argv):
    arg = sys.argv[i]
    if arg == "--output" or arg == "-o":
        output_file = sys.argv[i + 1]
        i += 2
    elif arg == "--pretty" or arg == "-p":
        pretty = True
        i += 1
    else:
        i += 1

data   = load_json(ir_file)
phases = build_phase_edges(data)

if pretty:
    pretty_print(phases)
elif output_file:
    with open(output_file, "w") as f:
        json.dump(phases, f, indent=2)
    print("Written to " + output_file)
else:
    json.dump(phases, sys.stdout, indent=2)
    print()
