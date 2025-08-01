// components/BlockLibrary/index.tsx
import { useState, useEffect, useCallback } from "react";
import { BlockCategory } from "./BlockCategory";
import { nodeLoaderService } from "../../services/nodeLoaderService";
import { EXAMPLE_NODES_CONFIG } from "../../types/nodeConfig";
import { IconHexagons, IconUpload, IconRefresh, IconFileText } from '@tabler/icons-react';

export function BlockLibrary() {
    const [blockLibrary, setBlockLibrary] = useState({});
    const [blockCategories, setBlockCategories] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [configVersion, setConfigVersion] = useState<string | null>(null);

    const loadDefaultConfig = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await nodeLoaderService.loadNodesFromJSON(EXAMPLE_NODES_CONFIG);
            setBlockLibrary(nodeLoaderService.getBlockLibrary());
            setBlockCategories(nodeLoaderService.getBlockCategories());
            setConfigVersion(nodeLoaderService.getConfigVersion());
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);
        
        try {
            await nodeLoaderService.loadNodesFromFile(file);
            setBlockLibrary(nodeLoaderService.getBlockLibrary());
            setBlockCategories(nodeLoaderService.getBlockCategories());
            setConfigVersion(nodeLoaderService.getConfigVersion());
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            // Reset file input
            event.target.value = '';
        }
    }, []);

    const handleLoadFromURL = useCallback(async () => {
        const url = prompt('Enter URL to nodes configuration JSON file:');
        if (!url) return;

        setIsLoading(true);
        setError(null);
        
        try {
            await nodeLoaderService.loadNodesFromURL(url);
            setBlockLibrary(nodeLoaderService.getBlockLibrary());
            setBlockCategories(nodeLoaderService.getBlockCategories());
            setConfigVersion(nodeLoaderService.getConfigVersion());
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const exportCurrentConfig = useCallback(() => {
        const config = nodeLoaderService.exportCurrentConfig();
        if (config) {
            const dataStr = JSON.stringify(config, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `nodes-config-${config.version}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        }
    }, []);

    // Load default configuration on component mount
    useEffect(() => {
        if (!nodeLoaderService.isConfigLoaded()) {
            loadDefaultConfig();
        } else {
            setBlockLibrary(nodeLoaderService.getBlockLibrary());
            setBlockCategories(nodeLoaderService.getBlockCategories());
            setConfigVersion(nodeLoaderService.getConfigVersion());
        }
    }, [loadDefaultConfig]);

    const categoryList = Object.keys(blockLibrary) as (keyof typeof blockLibrary)[];

    return (
        <div className="flex flex-col flex-[0.5] md:flex-[0.3] lg:flex-[0.18] border-r border-border">
            <div className="flex items-center justify-between px-2 py-1 h-7 border-b border-border">
                <div className="flex items-center">
                    <IconHexagons size={18} />
                    <span className="text-md font-bold ml-1">Block Library</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={loadDefaultConfig}
                        title="Load default nodes"
                        className="p-1 hover:bg-border rounded"
                        disabled={isLoading}
                    >
                        <IconRefresh size={14} className={isLoading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Config Management Panel */}
            <div className="p-2 border-b border-border bg-background/50">
                <div className="text-xs mb-2">
                    {configVersion && (
                        <span className="text-green-400">Config v{configVersion}</span>
                    )}
                </div>
                
                <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs hover:bg-border p-1 rounded">
                        <IconUpload size={14} />
                        <span>Load JSON Config</span>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={isLoading}
                        />
                    </label>
                    
                    <button
                        onClick={handleLoadFromURL}
                        className="flex items-center gap-2 text-xs hover:bg-border p-1 rounded text-left"
                        disabled={isLoading}
                    >
                        <IconFileText size={14} />
                        <span>Load from URL</span>
                    </button>
                    
                    {nodeLoaderService.isConfigLoaded() && (
                        <button
                            onClick={exportCurrentConfig}
                            className="flex items-center gap-2 text-xs hover:bg-border p-1 rounded text-left"
                        >
                            <IconFileText size={14} />
                            <span>Export Config</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="p-2 bg-red-900/20 border-b border-red-500/20">
                    <div className="text-xs text-red-400">Error: {error}</div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="p-2 border-b border-border">
                    <div className="text-xs text-blue-400 flex items-center gap-2">
                        <IconRefresh size={14} className="animate-spin" />
                        Loading nodes configuration...
                    </div>
                </div>
            )}

            {/* Block Categories */}
            <div className="p-2 overflow-auto flex-1">
                {categoryList.length > 0 ? (
                    categoryList.map((key) => (
                        <BlockCategory 
                            key={key} 
                            name={key} 
                            data={blockLibrary[key]} 
                            displayName={blockCategories[key]}
                        />
                    ))
                ) : (
                    !isLoading && (
                        <div className="text-xs text-gray-400 text-center py-4">
                            No nodes available. Load a configuration file.
                        </div>
                    )
                )}
            </div>
        </div>
    );
}