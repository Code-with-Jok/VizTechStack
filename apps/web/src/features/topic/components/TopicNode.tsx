import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import type { TopicData, TopicNodeType } from '../types';

export const TopicNode = memo(
    ({ data, selected }: NodeProps<TopicNodeType>) => {
        return (
            <div
                className={`px-4 py-3 shadow-xl rounded-xl border-2 transition-all duration-300 min-w-[150px] text-center ${selected
                    ? "border-purple-500 scale-105 shadow-purple-500/20"
                    : "border-white/10"
                    } glass-card`}
            >
                <Handle
                    type="target"
                    position={Position.Top}
                    className="w-3 h-3 bg-purple-500 border-2 border-white"
                />
                <div className="flex flex-col items-center gap-2">
                    <div className="text-sm font-bold tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                        {data.label}
                    </div>
                    {typeof data.description === "string" && data.description && (
                        <div className="text-[10px] text-zinc-500 line-clamp-2 leading-tight">
                            {data.description}
                        </div>
                    )}
                </div>
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className="w-3 h-3 bg-purple-500 border-2 border-white"
                />

                {/* Decorative element */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl opacity-0 hover:opacity-10 transition-opacity pointer-events-none" />
            </div>
        );
    }
);

TopicNode.displayName = "TopicNode";
