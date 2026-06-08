"use client";

import Toolbar from "@/components/toolbar";
import Space from "@/components/space";
import Option from "@/components/option";
import { useProtectedRoute } from "@/hooks/use-protected-route";

export default function RecipePage() {
    useProtectedRoute();
    return (
        <>
            <Space size={40} />
            <Toolbar title="My Recipes" />
            <Option buttons={1} text1="Create Recipe" />
        </>
    );
}