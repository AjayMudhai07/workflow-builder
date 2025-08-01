// components/NodeConfigManager/index.tsx
import { useState, useCallback } from "react";
import { nodeLoaderService } from "../../services/nodeLoaderService";
import { NodeConfig, NodesConfigFile } from "../../types/nodeConfig";
import { 
    IconSettings, 
    IconPlus, 
    IconTrash, 
    IconEdit, 
    IconSave,
    IconX,
    IconDownload,
    IconUpload 
} from '@tabler/icons-react';

interface NodeConfigManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onConfigUpdated: () => void;
}

export function NodeConfigManager({ isOpen, onClose, onConfigUpdated }: NodeConfigManagerProps) {
    const [nodes, setNodes] = useState<NodeConfig[]>([]);
    const [editingNode, setEditingNode] = useState<NodeConfig | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [configVersion, setConfigVersion] = useState("1.0.0");

    const loadCurrentConfig = useCallback(() => {
        const currentNodes = nodeLoaderService.getAllNodeConfigs();
        const version = nodeLoaderService.getConfigVersion() || "1.0.0";
        setNodes([...currentNodes]);
        setConfigVersion(version);
    }, []);

    const handleAddNode = () => {
        const newNode: NodeConfig = {
            id: `new_node_${Date.now()}`,
            name: "New Node",
            description: "Description for new node",
            category: "transform",
            nodeType: "customNode",
            inputTypes: ["dataset"],
            outputTypes: ["dataset"],
            config: {}
        };
        setEditingNode(newNode);
        setIsEditing(true);
    };

    const handleEditNode = (node: NodeConfig) => {
        setEditingNode({ ...node });