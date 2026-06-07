"use client";

import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";
import Option from "@/components/option";
import { useProtectedRoute } from "@/hooks/use-protected-route";

export default function RecipePage() {
    useProtectedRoute();
    return (
        <>
            <Space size={40} />
            <ToolbarWin title="My Recipes" />
            <Option buttons={1} text1="Create Recipe" />
        </>
    );
}