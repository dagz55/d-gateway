'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'

type SignalRow = {
  id?: string
  user_id?: string
  pair: string
  action: 'BUY' | 'SELL' | 'HOLD'
  target_price: number
  stop_loss?: number | null
  take_profits?: number[] | null
  status?: 'ACTIVE' | 'EXPIRED' | 'TRIGGERED'
  confidence?: number
  issued_at?: string
  expires_at?: string | null
}

export default function AdminSignalsManager() {
  const [items, setItems] = useState<SignalRow[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [editing, setEditing] = useState<SignalRow | null>(null)

  const blank: SignalRow = useMemo(() => ({ pair: '', action: 'BUY', target_price: 0, stop_loss: null, take_profits: [] }), [])
  const [form, setForm] = useState<SignalRow>(blank)

  const fetchItems = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/signals?page=${page}&limit=${limit}`)
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to load signals')
      setItems(json.data.items)
    } catch (e: any) {
      toast.error(e.message || 'Failed to load signals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [page, limit])

  const parseTP = (s: string): number[] => {
    return s
      .split(',')
      .map(v => v.trim())
      .filter(Boolean)
      .map(v => Number(v))
      .filter(v => !Number.isNaN(v))
  }

  const tpString = (form.take_profits || []).join(', ')

  const onSubmit = async () => {
    try {
      setSaving(true)
      const payload = {
        ...form,
        target_price: Number(form.target_price),
        stop_loss: form.stop_loss === null || form.stop_loss === undefined ? null : Number(form.stop_loss),
        take_profits: form.take_profits || [],
      }
      const method = editing?.id ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/signals', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, id: editing?.id }) })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || 'Save failed')
      toast.success(editing?.id ? 'Signal updated' : 'Signal created')
      setEditing(null)
      setForm(blank)
      fetchItems()
    } catch (e: any) {
      toast.error(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (row: SignalRow) => {
    setEditing(row)
    setForm({ ...row })
  }

  const remove = async (id?: string) => {
    if (!id) return
    if (!confirm('Delete this signal?')) return
    try {
      const res = await fetch(`/api/admin/signals?id=${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || 'Delete failed')
      toast.success('Signal deleted')
      fetchItems()
    } catch (e: any) {
      toast.error(e.message || 'Delete failed')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Edit Signal' : 'Create Signal'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Pair</Label>
              <Input value={form.pair} onChange={(e) => setForm(f => ({ ...f, pair: e.target.value }))} placeholder="BTC/USDT" />
            </div>
            <div>
              <Label>Action</Label>
              <Select value={form.action} onValueChange={(v) => setForm(f => ({ ...f, action: v as any }))}>
                <SelectTrigger><SelectValue placeholder="Select action" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUY">BUY</SelectItem>
                  <SelectItem value="SELL">SELL</SelectItem>
                  <SelectItem value="HOLD">HOLD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Confidence</Label>
              <Input type="number" min={0} max={100} value={form.confidence ?? 50} onChange={(e) => setForm(f => ({ ...f, confidence: Number(e.target.value) }))} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Entry (Target Price)</Label>
              <Input type="number" step="0.00000001" value={form.target_price} onChange={(e) => setForm(f => ({ ...f, target_price: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Stop Loss (optional)</Label>
              <Input type="number" step="0.00000001" value={form.stop_loss ?? ''} onChange={(e) => setForm(f => ({ ...f, stop_loss: e.target.value === '' ? null : Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status || 'ACTIVE'} onValueChange={(v) => setForm(f => ({ ...f, status: v as any }))}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="EXPIRED">EXPIRED</SelectItem>
                  <SelectItem value="TRIGGERED">TRIGGERED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Take Profits (comma-separated)</Label>
            <Input
              placeholder="e.g. 65000, 67000, 69000"
              value={tpString}
              onChange={(e) => setForm(f => ({ ...f, take_profits: parseTP(e.target.value) }))}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={onSubmit} disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update Signal' : 'Create Signal'}
            </Button>
            {editing && (
              <Button variant="outline" onClick={() => { setEditing(null); setForm(blank) }}>Cancel</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Signals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pair</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead>SL</TableHead>
                  <TableHead>TPs</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-6">Loading...</TableCell></TableRow>
                ) : items.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">No signals</TableCell></TableRow>
                ) : (
                  items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.pair}</TableCell>
                      <TableCell>{row.action}</TableCell>
                      <TableCell>{row.target_price}</TableCell>
                      <TableCell>{row.stop_loss ?? '-'}</TableCell>
                      <TableCell>{(row.take_profits || []).join(', ')}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(row)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => remove(row.id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

