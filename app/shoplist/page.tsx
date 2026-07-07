"use client";

import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";
import { useProtectedRoute } from "@/hooks/use-protected-route";

export default function ShoplistPage() {
    useProtectedRoute();
    return (
        <>
            <Space size={8} />
            <ToolbarWin title="Shopping list" />
        </>
    )
}