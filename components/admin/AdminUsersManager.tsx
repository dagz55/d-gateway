'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

type ProfileRow = {
  id: string
  email: string
  username: string
  full_name: string
  is_admin: boolean
  created_at: string
}

export default function AdminUsersManager() {
  const [items, setItems] = useState<ProfileRow[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [q, setQ] = useState('')
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const fetchItems = async () => {
    try {
      setLoading(true)
      const url = new URL('/api/admin/users', window.location.origin)
      url.searchParams.set('page', String(page))
      url.searchParams.set('limit', String(limit))
      if (q) url.searchParams.set('q', q)
      const res = await fetch(url.toString())
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to load users')
      setItems(json.data.items)
      setTotal(json.data.total)
      setTotalPages(json.data.totalPages)
    } catch (e: any) {
      toast.error(e.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [page, limit])

  const toggleAdmin = async (userId: string, value: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, is_admin: value })
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update')
      toast.success('User updated')
      setItems(prev => prev.map(u => u.id === userId ? { ...u, is_admin: value } : u))
    } catch (e: any) {
      toast.error(e.message || 'Failed to update')
    }
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Search email, username or name" value={q} onChange={(e) => setQ(e.target.value)} />
            <Button onClick={() => { setPage(1); fetchItems() }}>Search</Button>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-6">Loading...</TableCell></TableRow>
                ) : items.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No users</TableCell></TableRow>
                ) : (
                  items.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.full_name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.username}</TableCell>
                      <TableCell>
                        {new Date(u.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Switch checked={u.is_admin} onCheckedChange={(v) => toggleAdmin(u.id, v)} />
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => toggleAdmin(u.id, !u.is_admin)}>
                          {u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {items.length ? (page - 1) * limit + 1 : 0}–{Math.min(page * limit, total)} of {total}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
