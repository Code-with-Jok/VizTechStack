"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteRoadmapClient } from "@/lib/api-client/roadmaps";
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

interface DeleteRoadmapButtonProps {
    roadmapId: string;
    roadmapTitle: string;
}

export function DeleteRoadmapButton({ roadmapId, roadmapTitle }: DeleteRoadmapButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { getToken } = useAuth();

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            const token = await getToken();
            await deleteRoadmapClient(roadmapId, token ?? undefined);
            setOpen(false);
            router.refresh();
        } catch (error) {
            console.error("Failed to delete roadmap:", error);
            alert("Xóa roadmap thất bại. Vui lòng thử lại.");
        } finally {
            setIsDeleting(false);
        }
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
                    <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        {isDeleting ? "Đang xóa..." : "Xóa"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
