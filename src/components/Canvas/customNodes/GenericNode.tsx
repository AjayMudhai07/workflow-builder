// components/Canvas/customNodes/GenericNode.tsx
import { startTransition, useCallback, useState, useEffect } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { nodeLoaderService } from "../../../services/nodeLoaderService";
import { NodeConfig } from "../../../types/nodeConfig";
import { setPreview, updateNodeData, useAppDispatch } from "@Services";
import { IconHexagon, IconPlay, IconSettings } from '@tabler/icons-react';

export function GenericNode({ id, data, type }: NodeProps<any>) {
    const dispatch = useAppDispatch();
    const [nodeConfig, setNodeConfig] = useState<NodeConfig | null>(null);
    const [nodeData, setNodeData] = useState<any>(data);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [configValues, setConfigValues] = useState<Record<string, any>>({});

    useEffect(() => {
        const config = nodeLoaderService.getNodeConfigByType(type!);
        setNodeConfig(config);
        
        if (config?.config) {
            setConfigValues({ ...config.config });
        }
    }, [type]);

    const handleRun = useCallback(async () => {
        if (!nodeConfig) return;

        setIsProcessing(true);
        
        try {
            // Simulate node processing based on configuration
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Create mock output based on node configuration
            let output;
            if (nodeConfig.outputTypes.includes('dataset') && nodeData?.list) {
                output = nodeData.list;
            } else if (nodeConfig.outputTypes.includes('json')) {
                output = { processed: true, nodeId: id, timestamp: Date.now() };
            } else {
                output = `Processed by ${nodeConfig.name}`;
            }

            dispatch(updateNodeData({
                id,
                data: { ...nodeData, processed: true, output }
            }));

            startTransition(() => {
                dispatch(setPreview(output));
            });
        } catch (error) {
            console.error(`Error processing node ${id}:`, error);
        } finally {
            setIsProcessing(false);
        }
    }, [dispatch, id, nodeConfig, nodeData]);

    const handleConfigChange = (key: string, value: any) => {
        setConfigValues(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveConfig = () => {
        dispatch(updateNodeData({
            id,
            data: { ...nodeData, config: configValues }
        }));
        setShowConfig(false);
    };

    const getIconForNode = () => {
        // You could extend this to support more icons based on nodeConfig.icon
        return <IconHexagon size={18} />;
    };

    const renderConfigField = (key: string, value: any) => {
        if (typeof value === 'boolean') {
            return (
                <label key={key} className="flex items-center gap-2 text-xs">
                    <input
                        type="checkbox"
                        checked={configValues[key] ?? value}
                        onChange={(e) => handleConfigChange(key, e.target.checked)}
                        className="nodrag"
                    />
                    {key}
                </label>
            );
        }
        
        if (typeof value === 'number') {
            return (
                <div key={key} className="mb-2">
                    <label className="block text-xs mb-1">{key}</label>
                    <input
                        type="number"
                        value={configValues[key] ?? value}
                        onChange={(e) => handleConfigChange(key, Number(e.target.value))}
                        className="nodrag w-full p-1 text-xs bg-gray-800 border border-gray-600 rounded"
                    />
                </div>
            );
        }
        
        if (Array.isArray(value)) {
            return (
                <div key={key} className="mb-2">
                    <label className="block text-xs mb-1">{key}</label>
                    <select
                        value={configValues[key] ?? value[0]}
                        onChange={(e) => handleConfigChange(key, e.target.value)}
                        className="nodrag w-full p-1 text-xs bg-gray-800 border border-gray-600 rounded"
                    >
                        {value.map((option: any) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
            );
        }
        
        // Default to text input
        return (
            <div key={key} className="mb-2">
                <label className="block text-xs mb-1">{key}</label>
                <input
                    type="text"
                    value={configValues[key] ?? value}
                    onChange={(e) => handleConfigChange(key, e.target.value)}
                    className="nodrag w-full p-1 text-xs bg-gray-800 border border-gray-600 rounded"
                />
            </div>
        );
    };

    if (!nodeConfig) {
        return (
            <div className="rounded-md overflow-hidden shadow-lg bg-red-900/20 border border-red-500 flex flex-col p-2 min-w-44">
                <span className="text-red-400 text-sm">Unknown node type: {type}</span>
            </div>
        );
    }

    return (
        <>
            {/* Input handles */}
            {nodeConfig.inputTypes.length > 0 && (
                <Handle type="target" position={Position.Left} id={`${id}_target`} />
            )}
            
            <div className="rounded-md overflow-hidden shadow-lg bg-card flex flex-col p-2 min-w-44 relative">
                <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center text-sm font-bold">
                        {getIconForNode()}
                        <span className="ml-1">{nodeConfig.name}</span>
                    </span>
                    
                    {nodeConfig.config && Object.keys(nodeConfig.config).length > 0 && (
                        <button
                            onClick={() => setShowConfig(!showConfig)}
                            className="nodrag p-1 hover:bg-background rounded"
                            title="Configure node"
                        >
                            <IconSettings size={14} />
                        </button>
                    )}
                </div>
                
                <div className="text-xs opacity-70 mb-2">
                    {nodeConfig.description}
                </div>
                
                <div className="text-xs opacity-50 mb-2">
                    <div>In: {nodeConfig.inputTypes.join(', ')}</div>
                    <div>Out: {nodeConfig.outputTypes.join(', ')}</div>
                </div>

                {/* Configuration Panel */}
                {showConfig && nodeConfig.config && (
                    <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded p-2 min-w-48 z-10 shadow-lg">
                        <div className="text-xs font-bold mb-2">Configuration</div>
                        {Object.entries(nodeConfig.config).map(([key, value]) =>
                            renderConfigField(key, value)
                        )}
                        <div className="flex gap-1 mt-2">
                            <button
                                onClick={handleSaveConfig}
                                className="nodrag px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setShowConfig(false)}
                                className="nodrag px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Processing status */}
                {nodeData?.processed && (
                    <div className="text-xs text-green-400 mb-2">
                        ✓ Processed
                    </div>
                )}

                <button
                    className={`nodrag rounded p-1.5 px-2.5 self-end mt-2 flex items-center gap-1 text-xs ${
                        isProcessing 
                            ? 'bg-yellow-600 hover:bg-yellow-700' 
                            : 'bg-background/60 hover:bg-background'
                    }`}
                    onClick={handleRun}
                    disabled={isProcessing}
                >
                    <IconPlay size={14} className={isProcessing ? 'animate-pulse' : ''} />
                    {isProcessing ? 'Processing...' : 'Run'}
                </button>
            </div>

            {/* Data preview */}
            {nodeData?.list && (
                <span className="text-xs opacity-70 mt-1">
                    [DATASET] {nodeData.list.length - 1} rows | {nodeData.list[0]?.length} columns
                </span>
            )}
            
            {/* Output handles */}
            {nodeConfig.outputTypes.length > 0 && (
                <Handle type="source" position={Position.Right} id={`${id}_source`} />
            )}
        </>
    );
}