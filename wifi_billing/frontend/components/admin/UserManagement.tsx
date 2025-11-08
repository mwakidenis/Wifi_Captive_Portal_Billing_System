"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Eye, Trash2, CheckCircle, UserX, WifiOff, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { apiClient, type User } from "@/lib/api"

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchUsers()
  }, [searchTerm, statusFilter, currentPage])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // First try to get regular users
      const userResponse = await apiClient.getUsers({
        search: searchTerm,
        status: statusFilter,
        page: currentPage,
        limit: 10,
      })

      // Also fetch auth users (registered users)
      const authResponse = await fetch('http://localhost:5000/auth/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || localStorage.getItem('user_token')}`
        }
      })

      let allUsers = []
      if (userResponse.success && userResponse.data) {
        allUsers = [...userResponse.data.users]
      }

      // If we can get auth users, add them to the list
      if (authResponse.ok) {
        try {
          const authData = await authResponse.json()
          if (authData.success && authData.data) {
            // Convert auth user to user format
            const authUser = {
              id: authData.data.id,
              phone: authData.data.phone,
              macAddress: "Not set",
              status: "registered",
              currentPackage: null,
              expiresAt: null,
              totalSpent: 0,
              sessionsCount: 0,
              lastSeen: authData.data.createdAt
            }
            allUsers.push(authUser)
          }
        } catch (e) {
          console.log("Could not fetch auth users")
        }
      }

      setUsers(allUsers)
      setTotalPages(Math.ceil(allUsers.length / 10))
    } catch (error: any) {
      console.error("Error fetching users:", error)
      toast.error("Failed to load users", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-500/10 text-green-600 dark:text-green-400", label: "Active" },
      expired: { color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400", label: "Expired" },
      blocked: { color: "bg-red-500/10 text-red-600 dark:text-red-400", label: "Blocked" },
      registered: { color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", label: "Registered" },
    } as const
    type StatusKey = keyof typeof statusConfig
    const config = statusConfig[status as StatusKey] || statusConfig.expired
    return <Badge className={`${config.color} border-0`}>{config.label}</Badge>
  }

  const handleUserAction = async (userId: number, action: string) => {
    try {
      let response
      const user = users.find((u) => u.id === userId)
      switch (action) {
        case "block":
          response = await apiClient.blockUser(userId)
          if (response.success) {
            toast.success("User blocked successfully", {
              description: `${user?.phone} has been blocked from accessing the network`,
            })
          }
          break
        case "unblock":
          response = await apiClient.unblockUser(userId)
          if (response.success) {
            toast.success("User unblocked successfully", {
              description: `${user?.phone} can now access the network`,
            })
          }
          break
        case "disconnect":
          response = await apiClient.disconnectUser(userId)
          if (response.success) {
            toast.success("User disconnected successfully", {
              description: `${user?.phone} has been disconnected from the network`,
            })
          }
          break
        case "delete":
          response = await apiClient.deleteUser(userId)
          if (response.success) {
            toast.success("User deleted successfully", {
              description: `${user?.phone} has been removed from the system`,
            })
          }
          break
      }
      if (response?.success) {
        fetchUsers() // Refresh the list
      } else {
        throw new Error(response?.error || "Action failed")
      }
    } catch (error: any) {
      toast.error("Action failed", {
        description: error.message,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by phone or MAC address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => {
            toast.info("Exporting user data...", { duration: 2000 })
            // TODO: Implement export functionality
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
      {/* Users Table */}
      <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-slate-600 dark:text-slate-300">Phone</TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-300">MAC Address</TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-300">Current Package</TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-300">Total Spent</TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-300">Last Seen</TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-slate-900 dark:text-white">{user.phone}</TableCell>
                      <TableCell className="font-mono text-sm text-slate-600 dark:text-slate-400">{user.macAddress}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">{user.currentPackage || "None"}</TableCell>
                      <TableCell className="text-slate-900 dark:text-white font-medium">Ksh {user.totalSpent}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">{user.lastSeen}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                toast.info("Opening user details...", { duration: 2000 })
                                // TODO: Navigate to user details page or open modal
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUserAction(user.id, "disconnect")}> <WifiOff className="h-4 w-4 mr-2" /> Disconnect </DropdownMenuItem>
                            {user.status === "blocked" ? (
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, "unblock")}> <CheckCircle className="h-4 w-4 mr-2" /> Unblock User </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, "block")}> <UserX className="h-4 w-4 mr-2" /> Block User </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
                                  handleUserAction(user.id, "delete")
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button variant="outline" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</Button>
              <span className="text-sm text-slate-600 dark:text-slate-400">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
export default UserManagement
