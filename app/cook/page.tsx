"use client";

import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";
import { useProtectedRoute } from "@/hooks/use-protected-route";

export default function CookPage() {
    useProtectedRoute();
    return (
        <>
            <Space size={40} />
            <ToolbarWin title="Cook" />
        </>
    )
}