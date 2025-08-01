// components/Header/index.tsx
import { useCallback, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from '@Assets/logo_48.png';
import { OnCloseType } from "./types";
import { HOME_PATH } from "@Routes";
import { SaveModal } from "./SaveModal";
import { NodeConfigManager } from "../NodeConfigManager";
import { MODAL_SAVE } from "@Constants";
import { 
    IconFolderPlus, 
    IconDeviceFloppy, 
    IconX, 
    IconSettings,
    IconNodes
} from '@tabler/icons-react';
import { 
    createWorkflow, 
    getCurrentWorkflowSelectors, 
    updateWorkflow, 
    useAppDispatch, 
    useAppSelector, 
    resetCurrentWorkflow 
} from "@Services";

export function Header() {
    const dispatch = useAppDispatch();
    const currentWorkflow = useAppSelector(getCurrentWorkflowSelectors);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isConfigManagerOpen, setIsConfigManagerOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = `Workflow Builder ${currentWorkflow?.name ? `| ${currentWorkflow?.name}` : ''}`;
    }, [currentWorkflow]);

    const onClose = useCallback(
        ({ type, data }: Parameters<OnCloseType>[0]) => {
            setIsSaveModalOpen(false);
            if (type === MODAL_SAVE && currentWorkflow) {
                if (data?.id === 0) {
                    dispatch(createWorkflow({ ...currentWorkflow, id: data?.id, name: data?.name }));
                } else {
                    dispatch(
                        updateWorkflow({
                            id: data?.id,
                            data: { ...currentWorkflow, name: data?.name },
                        })
                    );
                }
                navigate(HOME_PATH);
            }
        },
        [currentWorkflow, dispatch, navigate]
    );

    const handleConfigUpdated = useCallback(() => {
        // Force re-render of components that depend on node configuration
        // This could be enhanced with a proper event system or state management
        window.dispatchEvent(new CustomEvent('nodeConfigUpdated'));
    }, []);

    return (
        <>
            <header className="flex justify-between items-center bg-header border-b border-border px-4 h-12">
                <div className="flex items-center h-full font-extrabold text-2xl tracking-tighter text-[#4f4e60]">
                    <img src={logo} alt="logo" className="w-8 mr-2" />
                    <span className="hidden md:block">Workflow Builder</span>
                </div>
                
                {/* Center section - Current workflow info */}
                {currentWorkflow && location?.pathname !== HOME_PATH && (
                    <div className="flex items-center gap-4">
                        <span className="flex justify-center items-center text-sm font-semibold">
                            <IconFolderPlus size={18} />
                            <span className="ml-1">{currentWorkflow?.name}</span>
                        </span>
                        
                        {/* Node configuration indicator */}
                        <div className="flex items-center text-xs text-gray-400">
                            <IconNodes size={16} />
                            <span className="ml-1">
                                {/* This would show the current number of loaded node types */}
                                Node Config Active
                            </span>
                        </div>
                    </div>
                )}
                
                {/* Right section - Action buttons */}
                {currentWorkflow && location?.pathname !== HOME_PATH ? (
                    <div className="flex gap-1 md:gap-2 lg:gap-4">
                        {/* Node Configuration Manager Button */}
                        <button 
                            onClick={() => setIsConfigManagerOpen(true)} 
                            title="Manage node configurations"
                            className="flex justify-center items-center rounded border border-border p-1.5 px-3 text-xs font-bold hover:bg-border"
                        >
                            <IconSettings size={16} />
                            <span className="ml-1 hidden md:inline">Nodes</span>
                        </button>
                        
                        {/* Save Workflow Button */}
                        <button 
                            onClick={() => setIsSaveModalOpen(true)} 
                            title="Save workflow" 
                            className="flex justify-center items-center rounded border border-border p-1.5 px-4 text-xs font-bold hover:bg-border"
                        >
                            <IconDeviceFloppy size={18} />
                            <span className="ml-1 hidden md:inline">Save workflow</span>
                        </button>
                        
                        {/* Close Workflow Button */}
                        <Link 
                            onClick={() => dispatch(resetCurrentWorkflow())} 
                            to={HOME_PATH} 
                            title="Close workflow" 
                            className="flex justify-center items-center rounded border border-border p-1.5 px-1.5 text-xs font-bold hover:bg-border"
                        >
                            <IconX size={18} />
                        </Link>
                    </div>
                ) : (
                    /* Home page - Show global node config button */
                    location?.pathname === HOME_PATH && (
                        <button 
                            onClick={() => setIsConfigManagerOpen(true)} 
                            title="Manage global node configurations"
                            className="flex justify-center items-center rounded border border-border p-1.5 px-3 text-xs font-bold hover:bg-border"
                        >
                            <IconSettings size={16} />
                            <span className="ml-1">Node Config</span>
                        </button>
                    )
                )}
            </header>
            
            {/* Save Modal */}
            {isSaveModalOpen && (
                <SaveModal
                    id={currentWorkflow?.id}
                    workflowName={currentWorkflow?.name}
                    onClose={onClose}
                />
            )}
            
            {/* Node Configuration Manager Modal */}
            {isConfigManagerOpen && (
                <NodeConfigManager
                    isOpen={isConfigManagerOpen}
                    onClose={() => setIsConfigManagerOpen(false)}
                    onConfigUpdated={handleConfigUpdated}
                />
            )}
        </>
    );
}