import mermaid from 'mermaid';

/**
 * Call once on app startup.
 */
export function initMermaid() {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      primaryColor: '#eff6ff',
      primaryTextColor: '#1e3a5f',
      primaryBorderColor: '#3b82f6',
      lineColor: '#6366f1',
      secondaryColor: '#f1f5f9',
      tertiaryColor: '#fff',
      fontSize: '13px',
    },
    flowchart: {
      curve: 'basis',
      padding: 16,
    },
  });
}

/**
 * Generates Mermaid definition from active components and wires in the 3D workspace.
 */
export function generateWorkspaceMermaid(placedComponents, placedWires, getComponentPinDefs) {
    if (!placedComponents || placedComponents.length === 0) {
        return 'flowchart LR\n  empty["🔌 Place a component to start"]';
    }

    // Map each component's instanceId to its index and info
    const compMap = new Map();
    placedComponents.forEach((g, index) => {
        const id = g.userData.instanceId || `comp_${index}`;
        compMap.set(id, {
            index,
            id,
            type: g.userData.type || 'component',
            variant: g.userData.variant || null,
            label: g.userData.label || g.userData.type || 'component'
        });
    });

    const componentEmoji = (type) => {
        const map = {
            arduino:    '🤖',
            esp32:      '🤖',
            led:        '💡',
            resistor:   '⚡',
            buzzer:     '🔊',
            button:     '🔘',
            ldr:        '☀️',
            servo:      '⚙️',
            dht11:      '🌡️',
            ultrasonic: '📡',
            lcd:        '🖥️',
            relay:      '🔌',
            motor:      '🔄',
            breadboard: '🎛️'
        };
        return map[type?.toLowerCase()] || '🔩';
    };

    const nodeLabel = (comp) => {
        const emoji = componentEmoji(comp.type);
        const variant = comp.variant ? ` ${comp.variant}` : '';
        const label = comp.label ? comp.label.replace(/_/g, ' ') : `${comp.type}${variant}`;
        return `${emoji} ${label}`;
    };

    const nodeId = (id) => `N_${id.replace(/[^a-zA-Z0-9]/g, '_')}`;

    const linkClass = (color) => {
        if (!color) return '';
        const map = {
            '#ef4444': 'pwr',   // power red
            '#1e293b': 'gnd',   // ground dark
            '#6366f1': 'sig',   // signal indigo
            '#fbbf24': 'adc',   // analog amber
        };
        return map[color.toLowerCase()] || '';
    };

    // Node declarations
    const nodes = placedComponents.map((g, index) => {
        const id = g.userData.instanceId || `comp_${index}`;
        const comp = compMap.get(id);
        return `  ${nodeId(id)}["${nodeLabel(comp)}"]`;
    }).join('\n');

    // Edge declarations
    const edges = [];
    if (Array.isArray(placedWires)) {
        placedWires.forEach((wire) => {
            const fromG = placedComponents.find(g => g.userData.instanceId === wire.fromCompId);
            const toG = placedComponents.find(g => g.userData.instanceId === wire.toCompId);
            if (!fromG || !toG) return;

            const fromDefs = getComponentPinDefs(fromG);
            const toDefs = getComponentPinDefs(toG);
            const fromPinName = fromDefs[wire.fromPinIdx]?.name || `Pin ${wire.fromPinIdx}`;
            const toPinName = toDefs[wire.toPinIdx]?.name || `Pin ${wire.toPinIdx}`;

            const fromNode = nodeId(wire.fromCompId);
            const toNode = nodeId(wire.toCompId);
            const label = `${fromPinName} → ${toPinName}`;
            const cls = linkClass(wire.color);

            edges.push(`  ${fromNode} -->|"${label}"| ${toNode}${cls ? `:::${cls}` : ''}`);
        });
    }

    const classDefs = [
        '  classDef pwr stroke:#ef4444,color:#ef4444',
        '  classDef gnd stroke:#475569,color:#475569',
        '  classDef sig stroke:#6366f1,color:#6366f1',
        '  classDef adc stroke:#f59e0b,color:#f59e0b',
    ].join('\n');

    return `flowchart LR\n${nodes}\n${edges.join('\n')}\n${classDefs}`;
}

/**
 * Render a Mermaid diagram into a container element.
 * Replaces any previous diagram content.
 */
export async function renderMermaidDiagram(container, diagramText) {
  if (!container) return;
  try {
    const id = `mermaid-${Date.now()}`;
    const { svg } = await mermaid.render(id, diagramText);
    container.innerHTML = svg;
  } catch (err) {
    console.warn('[mermaid-schematic] render error:', err);
    container.innerHTML = `<p style="color:#ef4444;font-size:12px;padding:8px;">
      Diagram render error — check console for details.
    </p>`;
  }
}
