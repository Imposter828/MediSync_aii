"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Calendar, Clock, Stethoscope, Edit, Trash2, Plus, Search } from "lucide-react";
import { format } from "date-fns";

// Dynamic imports for client-only components
const Dialog = dynamic(() => import("@/components/ui/dialog").then(mod => ({ default: mod.Dialog })), { ssr: false });
const DialogContent = dynamic(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogContent })), { ssr: false });
const DialogDescription = dynamic(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogDescription })), { ssr: false });
const DialogHeader = dynamic(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogHeader })), { ssr: false });
const DialogTitle = dynamic(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogTitle })), { ssr: false });
const DialogTrigger = dynamic(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogTrigger })), { ssr: false });

const AlertDialog = dynamic(() => import("@/components/ui/alert-dialog").then(mod => ({ default: mod.AlertDialog })), { ssr: false });
const AlertDialogAction = dynamic(() => import("@/components/ui/alert-dialog").then(mod => ({ default: mod.AlertDialogAction })), { ssr: false });
const AlertDialogCancel = dynamic(() => import("@/components/ui/alert-dialog").then(mod => ({ default: mod.AlertDialogCancel })), { ssr: false });
const AlertDialogContent = dynamic(() => import("@/components/ui/alert-dialog").then(mod => ({ default: mod.AlertDialogContent })), { ssr: false });
const AlertDialogDescription = dynamic(() => import("@/components/ui/alert-dialog").then(mod => ({ default: mod.AlertDialogDescription })), { ssr: false });
const AlertDialogFooter = dynamic(() => import("@/components/ui/alert-dialog").then(mod => ({ default: mod.AlertDialogFooter })), { ssr: false });
const AlertDialogHeader = dynamic(() => import("@/components/ui/alert-dialog").then(mod => ({ default: mod.AlertDialogHeader })), { ssr: false });
const AlertDialogTitle = dynamic(() => import("@/components/ui/alert-dialog").then(mod => ({ default: mod.AlertDialogTitle })), { ssr: false });
const AlertDialogTrigger = dynamic(() => import("@/components/ui/alert-dialog").then(mod => ({ default: mod.AlertDialogTrigger })), { ssr: false });

export default function PatientHistory() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    symptom: "",
    duration: "",
    diagnosis: "",
    treatment: "",
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    symptom: "",
    duration: "",
  });
  const [saving, setSaving] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/patients/history");
      if (!res.ok) {
        throw new Error(`Failed to fetch history: ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecords(data);
      } else {
        console.error("Expected array of records, got:", data);
        setRecords([]);
      }
    } catch (error) {
      console.error("Error loading history:", error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setEditForm({
      symptom: record.symptom,
      duration: record.duration.toString(),
      diagnosis: record.diagnosis || "",
      treatment: record.treatment || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/patients/history/${editingRecord.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptom: editForm.symptom,
          duration: parseInt(editForm.duration),
          diagnosis: editForm.diagnosis || null,
          treatment: editForm.treatment || null,
        }),
      });
      if (res.ok) {
        await loadHistory();
        setIsEditDialogOpen(false);
        setEditingRecord(null);
      } else {
        console.error("Failed to update record");
      }
    } catch (error) {
      console.error("Error updating record:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (recordId: string) => {
    try {
      const res = await fetch(`/api/patients/history/${recordId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadHistory();
      } else {
        console.error("Failed to delete record");
      }
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const handleAddRecord = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/patients/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptom: addForm.symptom,
          duration: parseInt(addForm.duration),
        }),
      });
      if (res.ok) {
        await loadHistory();
        setIsAddDialogOpen(false);
        setAddForm({ symptom: "", duration: "" });
      } else {
        console.error("Failed to add record");
      }
    } catch (error) {
      console.error("Error adding record:", error);
    } finally {
      setSaving(false);
    }
  };

  const filteredRecords = records.filter((record) =>
    record.symptom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.diagnosis && record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (record.treatment && record.treatment.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Loading component for dialogs
  const DialogLoading = () => (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      <span className="ml-2">Loading...</span>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 p-8 ml-0 md:ml-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-8 ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Medical History</h1>
                <p className="text-muted-foreground">View and manage your complete medical history timeline</p>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Record
                  </Button>
                </DialogTrigger>
                <Suspense fallback={<DialogLoading />}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Medical Record</DialogTitle>
                      <DialogDescription>
                        Add a new symptom entry to your medical history.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="symptom">Symptom</Label>
                        <Textarea
                          id="symptom"
                          value={addForm.symptom}
                          onChange={(e) => setAddForm({ ...addForm, symptom: e.target.value })}
                          placeholder="Describe your symptoms..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration (days)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={addForm.duration}
                          onChange={(e) => setAddForm({ ...addForm, duration: e.target.value })}
                          placeholder="How many days?"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddRecord} disabled={saving || !addForm.symptom || !addForm.duration}>
                          {saving ? "Adding..." : "Add Record"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Suspense>
              </Dialog>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search medical history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <Card key={record.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{record.symptom}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {record.duration} days
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(record.createdAt), "MMM dd, yyyy")}
                          </div>
                          <div className="flex items-center gap-1">
                            <Stethoscope className="h-4 w-4" />
                            Dr. {record.doctor.user.name}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(record)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <Suspense fallback={<DialogLoading />}>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Medical Record</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this medical record? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(record.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </Suspense>
                      </AlertDialog>
                    </div>
                  </div>
                  {record.diagnosis && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Diagnosis:</p>
                      <p className="text-sm">{record.diagnosis}</p>
                    </div>
                  )}
                  {record.treatment && (
                    <div className="mt-2 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Treatment:</p>
                      <p className="text-sm">{record.treatment}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No records match your search" : "No medical history found"}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")} className="mt-2">
                  Clear search
                </Button>
              )}
            </div>
          )}

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <Suspense fallback={<DialogLoading />}>
              <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Medical Record</DialogTitle>
                <DialogDescription>
                  Update the details of this medical record.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-symptom">Symptom</Label>
                  <Textarea
                    id="edit-symptom"
                    value={editForm.symptom}
                    onChange={(e) => setEditForm({ ...editForm, symptom: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-duration">Duration (days)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    value={editForm.duration}
                    onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-diagnosis">Diagnosis (optional)</Label>
                  <Textarea
                    id="edit-diagnosis"
                    value={editForm.diagnosis}
                    onChange={(e) => setEditForm({ ...editForm, diagnosis: e.target.value })}
                    placeholder="Doctor's diagnosis..."
                  />
                </div>
                <div>
                  <Label htmlFor="edit-treatment">Treatment (optional)</Label>
                  <Textarea
                    id="edit-treatment"
                    value={editForm.treatment}
                    onChange={(e) => setEditForm({ ...editForm, treatment: e.target.value })}
                    placeholder="Prescribed treatment..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
              </DialogContent>
            </Suspense>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
