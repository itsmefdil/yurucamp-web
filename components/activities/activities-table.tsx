"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Activity } from "@/types/activity"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

export function ActivitiesTable() {
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchActivities()
    }, [])

    const fetchActivities = async () => {
        try {
            const { data, error } = await supabase
                .from("activities")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) {
                throw error
            }

            setActivities(data || [])
        } catch (error) {
            console.error("Error fetching activities:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah anda yakin ingin menghapus aktifitas ini?")) return

        try {
            const { error } = await supabase
                .from("activities")
                .delete()
                .eq("id", id)

            if (error) throw error

            setActivities(activities.filter((activity) => activity.id !== id))
        } catch (error) {
            console.error("Error deleting activity:", error)
            alert("Gagal menghapus aktifitas")
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Judul</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Lokasi</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {activities.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                Belum ada aktifitas
                            </TableCell>
                        </TableRow>
                    ) : (
                        activities.map((activity) => (
                            <TableRow key={activity.id}>
                                <TableCell className="font-medium">{activity.title}</TableCell>
                                <TableCell className="capitalize">{activity.category}</TableCell>
                                <TableCell>
                                    {activity.date ? format(new Date(activity.date), "dd MMMM yyyy", { locale: id }) : "-"}
                                </TableCell>
                                <TableCell>{activity.location || "-"}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(activity.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
