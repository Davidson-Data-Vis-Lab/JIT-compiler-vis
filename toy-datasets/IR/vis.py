import json
from graphviz import Digraph

with open("toy-datasets/IR/ir5129.json") as f:
    data = json.load(f)

dot = Digraph()

# Only take first 10 nodes for sanity
for node in data["nodes"][:10]:
    label = f"{node['id']}\\nop:{node['opcode']}"
    dot.node(str(node["id"]), label)

    for edge in node["edges"]:
        dot.edge(str(node["id"]), str(edge))

dot.render("small_ir", format="png")
