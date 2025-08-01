// services/nodeLoaderService.ts
import { NodeConfig, NodesConfigFile } from '../types/nodeConfig';
import { BlockType, BlockCategoryType } from '../types';

export class NodeLoaderService {
  private static instance: NodeLoaderService;
  private nodesConfig: NodesConfigFile | null = null;
  private blockLibrary: Record<BlockCategoryType, BlockType[]> = {};
  private blockCategories: Record<BlockCategoryType, string> = {};
  private iconMap: Record<string, React.ReactNode> = {};

  private constructor() {
    this.initializeIconMap();
  }

  public static getInstance(): NodeLoaderService {
    if (!NodeLoaderService.instance) {
      NodeLoaderService.instance = new NodeLoaderService();
    }
    return NodeLoaderService.instance;
  }

  private initializeIconMap() {
    // Import all available icons
    const { 
      IconFileTypeCsv, 
      IconFilter, 
      IconArrowsSort, 
      IconFileTypeJson,
      IconSum,
      IconApi,
      IconDownload,
      IconHexagon
    } = require('@tabler/icons-react');

    this.iconMap = {
      'IconFileTypeCsv': <IconFileTypeCsv />,
      'IconFilter': <IconFilter />,
      'IconArrowsSort': <IconArrowsSort />,
      'IconFileTypeJson': <IconFileTypeJson />,
      'IconSum': <IconSum />,
      'IconApi': <IconApi />,
      'IconDownload': <IconDownload />,
      'IconHexagon': <IconHexagon />
    };
  }

  public async loadNodesFromFile(file: File): Promise<void> {
    try {
      const fileContent = await this.readFileAsText(file);
      const parsedConfig: NodesConfigFile = JSON.parse(fileContent);
      
      if (!this.validateNodesConfig(parsedConfig)) {
        throw new Error('Invalid nodes configuration file format');
      }

      this.nodesConfig = parsedConfig;
      this.buildBlockLibrary();
    } catch (error) {
      console.error('Error loading nodes from file:', error);
      throw new Error(`Failed to load nodes configuration: ${error.message}`);
    }
  }

  public async loadNodesFromJSON(configJson: NodesConfigFile): Promise<void> {
    try {
      if (!this.validateNodesConfig(configJson)) {
        throw new Error('Invalid nodes configuration format');
      }

      this.nodesConfig = configJson;
      this.buildBlockLibrary();
    } catch (error) {
      console.error('Error loading nodes from JSON:', error);
      throw new Error(`Failed to load nodes configuration: ${error.message}`);
    }
  }

  public async loadNodesFromURL(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const configJson: NodesConfigFile = await response.json();
      await this.loadNodesFromJSON(configJson);
    } catch (error) {
      console.error('Error loading nodes from URL:', error);
      throw new Error(`Failed to load nodes from URL: ${error.message}`);
    }
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsText(file);
    });
  }

  private validateNodesConfig(config: any): config is NodesConfigFile {
    if (!config || typeof config !== 'object') {
      return false;
    }

    if (!config.version || typeof config.version !== 'string') {
      return false;
    }

    if (!Array.isArray(config.nodes)) {
      return false;
    }

    // Validate each node
    for (const node of config.nodes) {
      if (!this.validateNodeConfig(node)) {
        return false;
      }
    }

    return true;
  }

  private validateNodeConfig(node: any): node is NodeConfig {
    const requiredFields = ['id', 'name', 'description', 'category', 'nodeType', 'inputTypes', 'outputTypes'];
    
    for (const field of requiredFields) {
      if (!node[field]) {
        return false;
      }
    }

    if (!Array.isArray(node.inputTypes) || !Array.isArray(node.outputTypes)) {
      return false;
    }

    return true;
  }

  private buildBlockLibrary(): void {
    if (!this.nodesConfig) {
      return;
    }

    // Reset libraries
    this.blockLibrary = {};
    this.blockCategories = {};

    // Group nodes by category
    const categorizedNodes: Record<string, NodeConfig[]> = {};
    
    for (const nodeConfig of this.nodesConfig.nodes) {
      const category = nodeConfig.category;
      
      if (!categorizedNodes[category]) {
        categorizedNodes[category] = [];
      }
      
      categorizedNodes[category].push(nodeConfig);
    }

    // Build block library and categories
    for (const [category, nodes] of Object.entries(categorizedNodes)) {
      const categoryKey = category as BlockCategoryType;
      
      // Set category display name (capitalize first letter)
      this.blockCategories[categoryKey] = category.charAt(0).toUpperCase() + category.slice(1);
      
      // Convert nodes to BlockType format
      this.blockLibrary[categoryKey] = nodes.map(nodeConfig => this.convertNodeConfigToBlockType(nodeConfig));
    }
  }

  private convertNodeConfigToBlockType(nodeConfig: NodeConfig): BlockType {
    return {
      id: nodeConfig.id,
      name: nodeConfig.name,
      icon: this.getIconForNode(nodeConfig.icon || 'IconHexagon'),
      description: nodeConfig.description,
      input: nodeConfig.inputTypes.join(', '),
      output: nodeConfig.outputTypes.join(', '),
      nodeType: nodeConfig.nodeType,
      config: nodeConfig.config || {}
    };
  }

  private getIconForNode(iconName: string): React.ReactNode {
    return this.iconMap[iconName] || this.iconMap['IconHexagon'];
  }

  public getBlockLibrary(): Record<BlockCategoryType, BlockType[]> {
    return this.blockLibrary;
  }

  public getBlockCategories(): Record<BlockCategoryType, string> {
    return this.blockCategories;
  }

  public getNodeConfig(nodeId: string): NodeConfig | null {
    if (!this.nodesConfig) {
      return null;
    }

    return this.nodesConfig.nodes.find(node => node.id === nodeId) || null;
  }

  public getNodeConfigByType(nodeType: string): NodeConfig | null {
    if (!this.nodesConfig) {
      return null;
    }

    return this.nodesConfig.nodes.find(node => node.nodeType === nodeType) || null;
  }

  public getAllNodeConfigs(): NodeConfig[] {
    return this.nodesConfig?.nodes || [];
  }

  public isConfigLoaded(): boolean {
    return this.nodesConfig !== null;
  }

  public getConfigVersion(): string | null {
    return this.nodesConfig?.version || null;
  }

  public exportCurrentConfig(): NodesConfigFile | null {
    return this.nodesConfig;
  }

  public reset(): void {
    this.nodesConfig = null;
    this.blockLibrary = {};
    this.blockCategories = {};
  }
}

// Export singleton instance
export const nodeLoaderService = NodeLoaderService.getInstance();