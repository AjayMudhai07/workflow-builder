// types/nodeConfig.ts
export interface NodeConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  nodeType: string;
  icon?: string;
  inputTypes: string[];
  outputTypes: string[];
  config?: {
    [key: string]: any;
  };
  retryPolicy?: {
    max_retries?: number;
    backoff_strategy?: string;
    initial_delay?: number;
    max_delay?: number;
    backoff_multiplier?: number;
    retry_on_errors?: string[];
    no_retry_on_errors?: string[];
  };
  timeout?: number;
}

export interface NodesConfigFile {
  version: string;
  nodes: NodeConfig[];
}

// Example nodes.json file structure
export const EXAMPLE_NODES_CONFIG: NodesConfigFile = {
  "version": "1.0.0",
  "nodes": [
    {
      "id": "csv_upload",
      "name": "CSV File Upload",
      "description": "Upload and parse CSV files for data processing",
      "category": "input",
      "nodeType": "fileUploadNode",
      "icon": "IconFileTypeCsv",
      "inputTypes": ["file"],
      "outputTypes": ["dataset"],
      "config": {
        "acceptedFileTypes": [".csv", ".txt"],
        "maxFileSize": "10MB"
      }
    },
    {
      "id": "json_upload",
      "name": "JSON File Upload",
      "description": "Upload and parse JSON files for data processing",
      "category": "input",
      "nodeType": "jsonUploadNode",
      "icon": "IconFileTypeJson",
      "inputTypes": ["file"],
      "outputTypes": ["dataset"],
      "config": {
        "acceptedFileTypes": [".json"],
        "maxFileSize": "10MB"
      }
    },
    {
      "id": "data_filter",
      "name": "Data Filter",
      "description": "Filter dataset rows based on column conditions",
      "category": "transform",
      "nodeType": "filterNode",
      "icon": "IconFilter",
      "inputTypes": ["dataset"],
      "outputTypes": ["dataset"],
      "config": {
        "supportedOperations": ["equals", "not_equals", "contains", "not_contains", "greater_than", "less_than"]
      }
    },
    {
      "id": "data_sort",
      "name": "Data Sort",
      "description": "Sort dataset rows based on column values",
      "category": "transform",
      "nodeType": "sortNode",
      "icon": "IconArrowsSort",
      "inputTypes": ["dataset"],
      "outputTypes": ["dataset"],
      "config": {
        "supportedOrders": ["asc", "desc"]
      }
    },
    {
      "id": "data_aggregate",
      "name": "Data Aggregation",
      "description": "Aggregate data using various statistical functions",
      "category": "transform",
      "nodeType": "aggregateNode",
      "icon": "IconSum",
      "inputTypes": ["dataset"],
      "outputTypes": ["dataset"],
      "config": {
        "supportedFunctions": ["sum", "avg", "count", "min", "max", "median"]
      }
    },
    {
      "id": "api_call",
      "name": "API Call",
      "description": "Make HTTP requests to external APIs",
      "category": "integration",
      "nodeType": "apiCallNode",
      "icon": "IconApi",
      "inputTypes": ["dataset", "json"],
      "outputTypes": ["json", "dataset"],
      "config": {
        "supportedMethods": ["GET", "POST", "PUT", "DELETE"],
        "timeout": 30000
      },
      "retryPolicy": {
        "max_retries": 3,
        "backoff_strategy": "exponential",
        "initial_delay": 1000,
        "max_delay": 30000
      }
    },
    {
      "id": "csv_export",
      "name": "CSV Export",
      "description": "Export processed data as CSV file",
      "category": "output",
      "nodeType": "csvExportNode",
      "icon": "IconDownload",
      "inputTypes": ["dataset"],
      "outputTypes": ["file"],
      "config": {
        "defaultFileName": "export.csv",
        "includeHeaders": true
      }
    }
  ]
};