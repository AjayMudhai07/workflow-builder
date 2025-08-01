// components/BlockLibrary/BlockCategory.tsx
import { Block } from "./Block";

interface BlockCategoryProps {
    name: string;
    data: any[];
    displayName?: string;
}

export function BlockCategory({ name, data, displayName }: BlockCategoryProps) {
    return (
        <>
            <div className="font-bold mb-1 text-sm text-gray-300">
                {displayName || name.charAt(0).toUpperCase() + name.slice(1)}
            </div>
            {data && data.length > 0 ? (
                data.map((block) => {
                    return <Block key={block.id} data={block} />;
                })
            ) : (
                <div className="text-xs text-gray-500 mb-3 ml-2">
                    No blocks in this category
                </div>
            )}
        </>
    );
}