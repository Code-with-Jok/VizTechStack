"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteRoadmap } from '../hooks';
import type { DeleteRoadmapButtonProps } from '../types';

export function DeleteRoadmapButton({ roadmapId, roadmapTitle }: DeleteRoadmapButtonProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const { deleteRoadmap, loading } = useDeleteRoadmap({
        onCompleted: () => {
            setOpen(false);
            router.refresh();
        },
        onError: (error) => {
            console.error("Failed to delete roadmap:", error);
            alert("Xóa roadmap thất bại. Vui lòng thử lại.");
        },
    });

    const handleDelete = async () => {
        await deleteRoadmap(roadmapId);
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa roadmap</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa roadmap &quot;{roadmapTitle}&quot;?
                        Hành động này không thể hoàn tác.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        {loading ? "Đang xóa..." : "Xóa"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
