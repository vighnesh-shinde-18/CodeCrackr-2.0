"use client";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"; 
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

function NavMain({ items }){
    const location = useLocation();

    const menuItems = () => {
        return items.map((item) => {
            const isActive = location.pathname === item.url;
            return (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        className={isActive ? "bg-primary text-primary-foreground" : ""}
                    >
                        <Link to={item.url}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            );
        });
    }

    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>{menuItems()}</SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
};

export default NavMain;