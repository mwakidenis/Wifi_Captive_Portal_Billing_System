"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Search, Eye, MessageSquare, Clock, CheckCircle, AlertCircle, XCircle, MoreHorizontal, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { apiClient } from "@/lib/api"

interface SupportRequest {
  id: number
  name: string
  phone: string
  transactionCode: string
  message: string
  status: string
  createdAt: string
  updatedAt: string
}

const SupportManagement = () => {
  const [requests, setRequests] = useState<SupportRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  useEffect(() => {
    fetchSupportRequests()
  }, [searchTerm, statusFilter, currentPage])

  const fetchSupportRequests = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getSupportRequests({
        status: statusFilter,
        page: currentPage,
        limit: 10,
        search: searchTerm,
      })
      if (response.success && response.data) {
        setRequests(response.data.requests)
        setTotalPages(response.data.totalPages)
      } else {
        throw new Error(response.error || "Failed to fetch support requests")
      }
    } catch (error: any) {
      console.error("Error fetching support requests:", error)
      toast.error("Failed to load support requests", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any }> = {
      pending: { color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400", icon: Clock },
      in_progress: { color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", icon: RefreshCw },
      resolved: { color: "bg-green-500/10 text-green-600 dark:text-green-400", icon: CheckCircle },
      closed: { color: "bg-gray-500/10 text-gray-600 dark:text-gray-400", icon: XCircle },
    }
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    return (
      <Badge className={`${config.color} border-0 flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
      </Badge>
    )
  }

  const handleStatusUpdate = async (requestId: number, newStatus: string) => {
    try {
      const response = await apiClient.updateSupportRequestStatus(requestId, newStatus)
      if (response.success) {
        toast.success("Status updated successfully")
        fetchSupportRequests() // Refresh the list
        if (selectedRequest && selectedRequest.id === requestId) {
          setSelectedRequest({ ...selectedRequest, status: newStatus })
        }
      } else {
        throw new Error(response.error || "Failed to update status")
      }
    } catch (error: any) {
      toast.error("Failed to update status", {
        description: error.message,
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, phone, transaction code, or message..."
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={fetchSupportRequests}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Support Requests Table */}
      <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Support Requests ({requests.length})</CardTitle>
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
                    <TableHead className="text-slate-600 dark:text-slate-300">ID</TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-300">Name</TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-300">Transaction Code</TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-300">Created</TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-sm text-slate-900 dark:text-white">#{request.id}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        <div>
                          <div className="font-medium">{request.name}</div>
                          <div className="text-sm text-slate-500">{request.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400 font-mono">{request.transactionCode}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">{formatDate(request.createdAt)}</TableCell>
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
                                setSelectedRequest(request)
                                setShowDetailsDialog(true)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {request.status === "pending" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(request.id, "in_progress")}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Mark In Progress
                              </DropdownMenuItem>
                            )}
                            {request.status === "in_progress" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(request.id, "resolved")}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Resolved
                              </DropdownMenuItem>
                            )}
                            {request.status !== "closed" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(request.id, "closed")}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Close Request
                              </DropdownMenuItem>
                            )}
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
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Support Request Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">
              Support Request #{selectedRequest?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Name</label>
                  <p className="text-slate-900 dark:text-white">{selectedRequest.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Phone</label>
                  <p className="text-slate-900 dark:text-white">{selectedRequest.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Transaction Code</label>
                  <p className="text-slate-900 dark:text-white font-mono">{selectedRequest.transactionCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Message</label>
                <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                  <p className="text-slate-900 dark:text-white whitespace-pre-wrap">{selectedRequest.message}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-slate-600 dark:text-slate-400">Created</label>
                  <p className="text-slate-900 dark:text-white">{formatDate(selectedRequest.createdAt)}</p>
                </div>
                <div>
                  <label className="font-medium text-slate-600 dark:text-slate-400">Last Updated</label>
                  <p className="text-slate-900 dark:text-white">{formatDate(selectedRequest.updatedAt)}</p>
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                {selectedRequest.status === "pending" && (
                  <Button
                    onClick={() => handleStatusUpdate(selectedRequest.id, "in_progress")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Mark In Progress
                  </Button>
                )}
                {selectedRequest.status === "in_progress" && (
                  <Button
                    onClick={() => handleStatusUpdate(selectedRequest.id, "resolved")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Resolved
                  </Button>
                )}
                {selectedRequest.status !== "closed" && (
                  <Button
                    onClick={() => handleStatusUpdate(selectedRequest.id, "closed")}
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Close Request
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SupportManagement