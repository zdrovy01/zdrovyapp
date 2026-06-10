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
            <Toolbar title="Recipes" href1="/createrecipe" icon1={<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 2V20M2 11H20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>} showIcon2={false} />
        </>
    );
}