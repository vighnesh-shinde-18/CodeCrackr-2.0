"use client";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLocation, Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import React from "react";

function NavSecondaryComponent({ items }) {
    const location = useLocation();

    const menuItems = () =>{
        return items.map((item) => {
            const isActive = location.pathname === item.url;
            return (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                        asChild
                        className={isActive ? "bg-primary text-primary-foreground" : ""}
                    >
                        <Link to={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            );
        })
    }

    return (
        <SidebarGroup>
            <SidebarGroupContent className="mt-3 border-t pt-4">
                <Label className="text-2xl text-muted-foreground px-1 pb-3 uppercase tracking-widest font-semibold text-[15px]">
                    ⚡ AI Features
                </Label>
                <SidebarMenu>{menuItems()}</SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
};

const NavSecondary = React.memo(NavSecondaryComponent);
export default NavSecondary;
