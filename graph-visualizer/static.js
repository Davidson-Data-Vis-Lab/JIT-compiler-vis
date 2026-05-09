/**
 * Static graph renderer using hierarchical/tree layout.
 * Called by renderVis() in main.js when static mode is selected.
 * Calls bindTooltips() from tooltip.js after drawing.
 * 
 * @author Ellora Devulapally, Taft Harrell
 */

/**
 * Creates nodes and links and draws onto SVG using static hierarchical layout.
 */
function renderStaticVis() {
    let vis = this;

    // Determine which nodes to show for the current phase
    let visibleNodes = vis.nodes.filter(n => vis.phaseNodes.has(n.id));

    // Create copies of links and nodes
    const links = vis.links.map(link => ({ ...link }));
    const nodes = visibleNodes.map(node => ({ ...node }));

    //Define width and height of SVG
    const width = 700;
    const height = 550;
    const nodeRadius = 10;

    // Clear and rebuild the SVG on every render
    d3.select("#chart-area").select("svg").remove();

    const svg = d3.select("#chart-area")
        .append("svg")
        .attr("id", "SVG")
        .attr("width", width * 1.5)
        .attr("height", height * 1.5)
        .attr("viewBox", [-width / 2, -height / 2, width, height]);

    // Create arrow markers
    svg.append("defs").append("marker")
        .attr("id", "arrow-static")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 20)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("fill", "black")
        .attr("d", 'M0,-5L10,0L0,5');

    // Use dagre or simple positioning algorithm
    // Option 1: Simple hierarchical layout based on depth
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    
    // Calculate node depths (simple BFS)
    const depths = new Map();
    const visited = new Set();
    
    // Find root nodes (nodes with no incoming edges)
    const hasIncoming = new Set(links.map(l => 
        typeof l.target === "object" ? l.target.id : l.target
    ));
    const rootNodes = nodes.filter(n => !hasIncoming.has(n.id));
    
    // BFS to assign depths
    const queue = rootNodes.map(n => ({ node: n, depth: 0 }));
    while (queue.length > 0) {
        const { node, depth } = queue.shift();
        if (visited.has(node.id)) continue;
        
        visited.add(node.id);
        depths.set(node.id, depth);
        
        // Find children
        const children = links
            .filter(l => (typeof l.source === "object" ? l.source.id : l.source) === node.id)
            .map(l => nodeMap.get(typeof l.target === "object" ? l.target.id : l.target))
            .filter(Boolean);
        
        children.forEach(child => {
            if (!visited.has(child.id)) {
                queue.push({ node: child, depth: depth + 1 });
            }
        });
    }
    
    // Assign nodes to unvisited (shouldn't happen in well-formed graph)
    nodes.forEach(n => {
        if (!depths.has(n.id)) {
            depths.set(n.id, 0);
        }
    });
    
    // Group nodes by depth
    const maxDepth = Math.max(...Array.from(depths.values()));
    const nodesByDepth = new Map();
    for (let i = 0; i <= maxDepth; i++) {
        nodesByDepth.set(i, []);
    }
    
    nodes.forEach(n => {
        const depth = depths.get(n.id);
        nodesByDepth.get(depth).push(n);
    });
    
    // Position nodes
    const xSpacing = width / (maxDepth + 1);
    const yPadding = 50;
    
    nodes.forEach(n => {
        const depth = depths.get(n.id);
        const nodesAtDepth = nodesByDepth.get(depth);
        const index = nodesAtDepth.indexOf(n);
        const ySpacing = (height - 2 * yPadding) / (nodesAtDepth.length + 1);
        
        n.x = -width / 2 + xSpacing * (depth + 0.5);
        n.y = -height / 2 + yPadding + ySpacing * (index + 1);
    });

    // Draw links
    const link = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(links)
        .join("path")
        .attr("class", "edge")
        .attr("stroke", "black")
        .attr("marker-end", "url(#arrow-static)")
        .attr("d", d => {
            const source = typeof d.source === "object" ? d.source : nodeMap.get(d.source);
            const target = typeof d.target === "object" ? d.target : nodeMap.get(d.target);
            return `M${source.x},${source.y}L${target.x},${target.y}`;
        });

    // Draw nodes
    const node = svg.append("g")
        .attr("fill", "currentColor")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .attr("transform", d => `translate(${d.x},${d.y})`);

    node.append("circle")
        .attr("class", "node")
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .attr("r", nodeRadius)
        .attr('fill', d => '#6baed6');

    node.append("text")
        .attr("x", 10)
        .attr("y", "0.31em")
        .text(d => d.id)
        .clone(true).lower()
        .attr("fill", "none");

    node.on('dblclick', (e, d) => console.log(d));

    // Store on vis so tooltip.js can bind hover handlers to these elements
    vis.nodeSelection = node;
    vis.linkSelection = link;

    bindTooltips();  // tooltip.js
}