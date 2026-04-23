"""
IR Phase Edge Parser - Reconstructs edges given an ir.json file
"""

import json
import sys

def loadfile(filepath):
    with open(filepath, "r") as f:
        return json.load(f)
    

def get_phases(data):
    fnName = data.get("fnId2Name", {})
    nodes = data.get("nodes", [])
    instructions = {}

    for node in nodes: 
        for instr_id_str, access in node.get("instAccess", {}).items():
            instr_id = int(instr_id_str)
            phase_id = access.get("phaseFnId")

            if phase

