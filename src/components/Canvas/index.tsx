// components/Canvas/index.tsx
import { useState, useMemo, useCallback } from "react";
import ReactFlow, { 
    addEdge, 
    applyEdgeChanges, 
    applyNodeChanges, 
    Background, 
    Controls, 
    Node, 
    NodeTypes, 
    ReactFlowInstance,
    Connection,
    Edge
} from "reactflow";
import "reactflow/dist/style.css";
import { useDnD } from "@Hooks";
import { nodeFactory } from "../../utils/nodeFactory";
import { nodeLoaderService } from "../../services/nodeLoaderService";
import { OnDropCallbackProps } from "./types";
import { FileUploadNode, FilterDataNode, SortDataNode } from "./customNodes";
import { GenericNode } from "./customNodes/GenericNode";
import { 
    addNewNode, 
    getEdgesSelectors, 
    getNodesSelectors, 
    updateEdges, 
    updateNodes, 
    useAppDispatch, 
    useAppSelector 
} from "@Services";

export function Canvas() {
    const [isHighlight, setIsHighlight] = useState(false);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
    const nodes = useAppSelector(getNodesSelectors);
    const edges = useAppSelector(getEdgesSelectors);
    const dispatch = useAppDispatch();

    // Dynamic node types based on loaded configuration
    const nodeTypes: NodeTypes = useMemo(() => {
        const baseTypes = {
            fileUploadNode: FileUploadNode,
            filterNode: FilterDataNode,
            sortNode: SortDataNode,
        };

        // Add all configured node types, using GenericNode for unknown types
        const configuredTypes = nodeLoaderService.getAllNodeConfigs().reduce((types, config) => {
            if (!baseTypes[config.nodeType]) {
                types[config.nodeType] = GenericNode;
            }
            return types;
        }, {} as NodeTypes);

        return { ...baseTypes, ...configuredTypes };
    }, []);

    const onDropCallback = useCallback(({ position, type }: OnDropCallbackProps) => {
        const node = nodeFactory.createNode({ position, nodeType: type });
        if (node) {
            dispatch(addNewNode(node as Node));
        }
    }, [dispatch]);

    const { onDragOverHandler, onDropHandler } = useDnD({
        setIsHighlight,
        reactFlowInstance,
        onDropCallback,
    });

    // Validate connections based on node configurations
    const isValidConnection = useCallback((connection: Connection | Edge): boolean => {
        const { source, target } = connection;
        
        const sourceNode = nodes.find(node => node.id === source);
        const targetNode = nodes.find(node => node.id === target);
        
        if (!sourceNode || !targetNode) return false;

        // Use nodeFactory to validate compatibility
        return nodeFactory.validateNodeCompatibility(sourceNode.type!, targetNode.type!);
    }, [nodes]);

    const onConnect = useCallback((params: Connection) => {
        if (isValidConnection(params)) {
            dispatch(updateEdges({ 
                edges: addEdge(params, edges), 
                currentEdge: params 
            }));
        } else {
            // Show error message for invalid connections
            const sourceConfig = nodeLoaderService.getNodeConfigByType(
                nodes.find(n => n.id === params.source)?.type || ''
            );
            const targetConfig = nodeLoaderService.getNodeConfigByType(
                nodes.find(n => n.id === params.target)?.type || ''
            );
            
            if (sourceConfig && targetConfig) {
                alert(
                    `Cannot connect ${sourceConfig.name} (outputs: ${sourceConfig.outputTypes.join(', ')}) ` +
                    `to ${targetConfig.name} (inputs: ${targetConfig.inputTypes.join(', ')}). ` +
                    `Output and input types must be compatible.`
                );
            }
        }
    }, [dispatch, edges, isValidConnection, nodes]);

    return (
        <div className="flex-[0.85] flex h-full w-full relative text-xs">
            {isHighlight && (
                <div className="bg-previewBackground absolute inset-y-0 inset-x-0 border border-previewBorder rounded"></div>
            )}

            <ReactFlow
                nodes={nodes}
                onNodesChange={(changes) => {
                    dispatch(updateNodes(applyNodeChanges(changes, nodes)));
                }}
                onEdgesChange={(changes) => {
                    dispatch(
                        updateEdges({
                            edges: applyEdgeChanges(changes, edges),
                            currentEdge: changes,
                        })
                    );
                }}
                edges={edges}
                onInit={setReactFlowInstance}
                onDrop={onDropHandler}
                onDragEnter={() => setIsHighlight(true)}
                onDragLeave={() => setIsHighlight(false)}
                onConnect={onConnect}
                onDragOver={onDragOverHandler}
                nodeTypes={nodeTypes}
                isValidConnection={isValidConnection}
                fitView
                connectionLineStyle={{ stroke: '#fff', strokeWidth: 2 }}
                defaultEdgeOptions={{
                    style: { stroke: '#fff', strokeWidth: 2 },
                    type: 'smoothstep',
                }}
            >
                <Background />
                <Controls className="bg-white" />
                
                {/* Node compatibility indicator */}
                <div className="absolute top-4 left-4 bg-background/80 p-2 rounded text-xs">
                    <div className="text-gray-400">
                        Loaded: {nodeLoaderService.getAllNodeConfigs().length} node types
                    </div>
                    {nodeLoaderService.getConfigVersion() && (
                        <div className="text-green-400">
                            Config v{nodeLoaderService.getConfigVersion()}
                        </div>
                    )}
                </div>
            </ReactFlow>
        </div>
    );
}