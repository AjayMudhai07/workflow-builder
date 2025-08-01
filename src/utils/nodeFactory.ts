// utils/nodeFactory.ts
import { Node } from "reactflow";
import { nodeLoaderService } from "../services/nodeLoaderService";
import { NodeConfig } from "../types/nodeConfig";
import { RetryPolicy, BackoffStrategy } from "../base_node";

export interface CreateNodeOptions {
    position: { x: number; y: number };
    nodeType: string;
    id?: string;
    customData?: any;
}

export class NodeFactory {
    private static instance: NodeFactory;

    private constructor() {}

    public static getInstance(): NodeFactory {
        if (!NodeFactory.instance) {
            NodeFactory.instance = new NodeFactory();
        }
        return NodeFactory.instance;
    }

    public createNode(options: CreateNodeOptions): Node | null {
        const { position, nodeType, id, customData } = options;
        
        // Get node configuration from the loaded JSON
        const nodeConfig = nodeLoaderService.getNodeConfigByType(nodeType);
        
        if (!nodeConfig) {
            console.error(`Node configuration not found for type: ${nodeType}`);
            return null;
        }

        // Generate unique ID if not provided
        const nodeId = id || this.generateNodeId(nodeType);

        // Create the node with configuration-based properties
        const node: Node = {
            id: nodeId,
            type: nodeType,
            position,
            data: {
                ...customData,
                nodeConfig,
                // Add any default data based on node configuration
                name: nodeConfig.name,
                description: nodeConfig.description,
                inputTypes: nodeConfig.inputTypes,
                outputTypes: nodeConfig.outputTypes,
                config: nodeConfig.config || {}
            }
        };

        return node;
    }

    public createBaseNodeInstance(nodeConfig: NodeConfig, nodeId: string): any {
        // Create a base node instance with the configuration
        const retryPolicy = this.createRetryPolicy(nodeConfig.retryPolicy);
        
        return {
            id: nodeId,
            type: nodeConfig.nodeType,
            name: nodeConfig.name,
            config: nodeConfig.config || {},
            accepted_input_formats: nodeConfig.inputTypes,
            output_formats: nodeConfig.outputTypes,
            retry_policy: retryPolicy,
            timeout: nodeConfig.timeout || 30
        };
    }

    private createRetryPolicy(retryPolicyConfig?: any): RetryPolicy {
        return new RetryPolicy({
            max_retries: retryPolicyConfig?.max_retries || 3,
            backoff_strategy: this.getBackoffStrategy(retryPolicyConfig?.backoff_strategy || 'exponential'),
            initial_delay: retryPolicyConfig?.initial_delay || 1000,
            max_delay: retryPolicyConfig?.max_delay || 30000,
            backoff_multiplier: retryPolicyConfig?.backoff_multiplier || 2,
            retry_on_errors: retryPolicyConfig?.retry_on_errors || [
                "ConnectionError", 
                "TimeoutError", 
                "ServiceUnavailableError",
                "RateLimitError"
            ],
            no_retry_on_errors: retryPolicyConfig?.no_retry_on_errors || [
                "AuthenticationError", 
                "ValidationError", 
                "FileNotFoundError",
                "PermissionError"
            ]
        });
    }

    private getBackoffStrategy(strategy: string): BackoffStrategy {
        switch (strategy.toLowerCase()) {
            case 'fixed':
                return BackoffStrategy.FIXED;
            case 'linear':
                return BackoffStrategy.LINEAR;
            case 'exponential':
            default:
                return BackoffStrategy.EXPONENTIAL;
        }
    }

    private generateNodeId(nodeType: string): string {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `${nodeType}_${timestamp}_${random}`;
    }

    public getAvailableNodeTypes(): string[] {
        return nodeLoaderService.getAllNodeConfigs().map(config => config.nodeType);
    }

    public getNodeConfigByType(nodeType: string): NodeConfig | null {
        return nodeLoaderService.getNodeConfigByType(nodeType);
    }

    public validateNodeCompatibility(sourceNodeType: string, targetNodeType: string): boolean {
        const sourceConfig = nodeLoaderService.getNodeConfigByType(sourceNodeType);
        const targetConfig = nodeLoaderService.getNodeConfigByType(targetNodeType);

        if (!sourceConfig || !targetConfig) {
            return false;
        }

        // Check if any output type of source matches any input type of target
        return sourceConfig.outputTypes.some(outputType =>
            targetConfig.inputTypes.includes(outputType)
        );
    }

    public getCompatibleTargetNodes(sourceNodeType: string): NodeConfig[] {
        const sourceConfig = nodeLoaderService.getNodeConfigByType(sourceNodeType);
        if (!sourceConfig) return [];

        return nodeLoaderService.getAllNodeConfigs().filter(targetConfig =>
            sourceConfig.outputTypes.some(outputType =>
                targetConfig.inputTypes.includes(outputType)
            )
        );
    }

    public getCompatibleSourceNodes(targetNodeType: string): NodeConfig[] {
        const targetConfig = nodeLoaderService.getNodeConfigByType(targetNodeType);
        if (!targetConfig) return [];

        return nodeLoaderService.getAllNodeConfigs().filter(sourceConfig =>
            sourceConfig.outputTypes.some(outputType =>
                targetConfig.inputTypes.includes(outputType)
            )
        );
    }
}

// Export singleton instance
export const nodeFactory = NodeFactory.getInstance();

// Updated utility function that uses the factory
export const getNewNode = ({ type, position }: { type: string; position?: { x: number; y: number } }) => {
    const defaultPosition = position || { x: 0, y: 0 };
    return nodeFactory.createNode({
        position: defaultPosition,
        nodeType: type
    });
};