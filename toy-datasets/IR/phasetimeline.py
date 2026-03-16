import json
from collections import defaultdict

def build_step_through_using_instaccess(ir_file_path, output_file_path):
    """Use instAccess.fnCallRetId to directly map modifications to phases"""
    
    with open(ir_file_path) as f:
        data = json.load(f)
    
    KNOWN_PHASE_FNIDS = {
        "92288": "GraphBuilderPhase",
        "105039": "InliningPhase",
        "111674": "CopyMetadataForConcurrentCompilePhase",
        "112905": "TyperPhase",
        "115040": "TypedLoweringPhase",
        "116258": "LoopPeelingPhase",
        "116895": "LoadEliminationPhase",
        "119301": "EscapeAnalysisPhase",
        "125811": "GenericLoweringPhase",
        "127274": "EarlyOptimizationPhase",
        "129485": "EffectControlLinearizationPhase",
        "136261": "LateOptimizationPhase",
        "137579": "MemoryOptimizationPhase",
        "139557": "MachineOperatorOptimizationPhase",
        "141294": "InstructionSelectionPhase"
    }
    
    # Step 1: Build map of callRetId -> phase info
    callRetId_to_phase = {}
    for callRetId, fnId in data.get("fnCallRetId2fnId", {}).items():
        if str(fnId) in KNOWN_PHASE_FNIDS:
            callRetId_to_phase[int(callRetId)] = {
                "fnId": fnId,
                "phase_name": KNOWN_PHASE_FNIDS[str(fnId)],
                "callRetId": int(callRetId)
            }
    
    print(f"Found {len(callRetId_to_phase)} phase execution calls")
    
   
    
    # Save to file
    with open(output_file_path, 'w') as f:
        json.dump(result, f, indent=2)
    
    print(f"\n✓ Saved to {output_file_path}")
    
    # Print summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    for i, phase in enumerate(result["phases"]):
        print(f"\nPhase Call {i} (callRetId: {phase['callRetId']}): {phase['phase_name']}")
        print(f"  Nodes modified: {phase['nodes_modified_count']}")
        total_instructions = sum(len(n["modifications"]) for n in phase["nodes"])
        print(f"  Total instruction modifications: {total_instructions}")
    
    return result


# Run it!
if __name__ == "__main__":
    result = build_step_through_using_instaccess(
        "toy-datasets/IR/ir5129.json",
        "toy-datasets/IR/ir5129_by_instaccess.json"
    )