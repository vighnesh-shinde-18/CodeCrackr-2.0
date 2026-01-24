import { useNavigate } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { IconLogout, IconDotsVertical } from "@tabler/icons-react";
import { toast } from "sonner";
import authService from "../../api/AuthServices";
import { useEffect } from "react";
// 🟢 1. Import Hooks
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";

function NavUserComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

 
 
  // 🟢 2. READ FROM CACHE (Reactive)
  // This hook runs automatically. If Login updates the cache, this updates too.
  const { data: user } = useQuery({
    queryKey: ["current-user"],
    // QueryFn handles "Hard Refresh" (Page Reload) case
    queryFn: () => {
        const username = localStorage.getItem("username");
        const email = localStorage.getItem("email");
        if (!username) return null;
        return { username, email };
    },
    // InitialData ensures no flicker on first mount
    initialData: () => {
        const username = localStorage.getItem("username");
        const email = localStorage.getItem("email");
        return username ? { username, email } : null;
    },
    staleTime: Infinity, // User data doesn't change often
  });

  const handleLogout = async () => {
    await authService.logout();
    localStorage.clear();
    
    // 🟢 3. Clear Cache on Logout
    queryClient.setQueryData(["current-user"], null);
    queryClient.invalidateQueries(); // Clear other data (history, etc)
    
    toast.success("Logged out Successfully");
    navigate("/login");
  }

  // Safe Fallback if user is null
  if (!user) return null;

  const initials = user.username ? user.username.slice(0, 2).toUpperCase() : "US";

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center justify-between">
        <SidebarMenuButton size="lg" className="flex-1">
          <Avatar className="h-8 w-8 rounded-lg grayscale">
            <AvatarImage src={user.avatar} alt={user.username || "User"} />
            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight ml-3">
            <span className="truncate font-medium">{user.username || "Unknown"}</span>
            <span className="text-muted-foreground truncate text-xs">{user.email || ""}</span>
          </div>
        </SidebarMenuButton>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-muted rounded-md transition cursor-pointer">
              <IconDotsVertical className="h-4 w-4 cursor-pointer" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="cursor-pointer" align="end">
            {/* 🟢 Fixed: Removed nested DropdownMenuItem */}
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                <IconLogout className="mr-2 h-4 w-4" />
                <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

const NavUser =  React.memo(NavUserComponent);
export default NavUser;