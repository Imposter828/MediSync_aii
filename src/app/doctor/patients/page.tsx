"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Search, Filter, Plus, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";

export default function DoctorPatients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSymptom, setFilterSymptom] = useState("all");
  const [filterDuration, setFilterDuration] = useState("all");
  const [filterFrequency, setFilterFrequency] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [recordForm, setRecordForm] = useState({
    symptom: "",
    duration: 0,
    diagnosis: "",
    treatment: "",
  });

  useEffect(() => {
    loadPatients();
  }, [search, filterSymptom, filterDuration, filterFrequency]);

  const loadPatients = async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterSymptom && filterSymptom !== "all") params.set("symptom", filterSymptom);
    if (filterDuration && filterDuration !== "all") params.set("duration", filterDuration);
    if (filterFrequency && filterFrequency !== "all") params.set("frequency", filterFrequency);

    const res = await fetch(`/api/doctors/patients?${params}`);
    const data = await res.json();
    setPatients(data);
    setLoading(false);
  };

  const handleAddRecord = async () => {
    if (!selectedPatient) return;

    const res = await fetch("/api/doctors/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: selectedPatient.id,
        ...recordForm,
      }),
    });

    if (res.ok) {
      setShowRecordDialog(false);
      setRecordForm({ symptom: "", duration: 0, diagnosis: "", treatment: "" });
      loadPatients();
    }
  };

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
            <h1 className="text-3xl font-bold">Patients</h1>
            <p className="text-muted-foreground">Manage and view patient records</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterSymptom} onValueChange={setFilterSymptom}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by symptom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="fever">Fever</SelectItem>
                <SelectItem value="headache">Headache</SelectItem>
                <SelectItem value="cough">Cough</SelectItem>
                <SelectItem value="pain">Pain</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDuration} onValueChange={setFilterDuration}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Duration >" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="5">&gt; 5 days</SelectItem>
                <SelectItem value="10">&gt; 10 days</SelectItem>
                <SelectItem value="30">&gt; 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterFrequency} onValueChange={setFilterFrequency}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Visit frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="2">&gt; 2 visits</SelectItem>
                <SelectItem value="5">&gt; 5 visits</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {patients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{patient.user.name}</h3>
                        <Badge variant="secondary">{patient.gender}</Badge>
                        {patient.age && <Badge variant="outline">{patient.age} years</Badge>}
                        {patient.medicalRecords.length > 2 && (
                          <Badge variant="warning">Frequent</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{patient.user.email}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {patient.medicalRecords.length} visits · Last visit:{" "}
                        {patient.medicalRecords[0]
                          ? format(new Date(patient.medicalRecords[0].createdAt), "MMM dd, yyyy")
                          : "N/A"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedPatient(patient)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View History
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Medical History - {patient.user.name}</DialogTitle>
                            <DialogDescription>
                              {patient.gender} · {patient.age} years old
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {patient.medicalRecords.length > 0 ? (
                              patient.medicalRecords.map((record: any) => (
                                <div
                                  key={record.id}
                                  className="p-4 border rounded-lg bg-muted/50"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <p className="font-medium">{record.symptom}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {record.duration} days ·{" "}
                                        {format(new Date(record.createdAt), "MMM dd, yyyy")}
                                      </p>
                                    </div>
                                    <Badge>{record.doctor.user.name}</Badge>
                                  </div>
                                  {record.diagnosis && (
                                    <div className="mt-2">
                                      <p className="text-sm font-medium">Diagnosis:</p>
                                      <p className="text-sm">{record.diagnosis}</p>
                                    </div>
                                  )}
                                  {record.treatment && (
                                    <div className="mt-2">
                                      <p className="text-sm font-medium">Treatment:</p>
                                      <p className="text-sm">{record.treatment}</p>
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-center text-muted-foreground py-4">
                                No medical records found
                              </p>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button onClick={() => setSelectedPatient(patient)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Record
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Medical Record</DialogTitle>
                            <DialogDescription>
                              Add a new medical record for {patient.user.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Symptoms</Label>
                              <Input
                                placeholder="e.g., fever, headache, cough"
                                value={recordForm.symptom}
                                onChange={(e) =>
                                  setRecordForm({ ...recordForm, symptom: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label>Duration (days)</Label>
                              <Input
                                type="number"
                                min="1"
                                value={recordForm.duration}
                                onChange={(e) =>
                                  setRecordForm({
                                    ...recordForm,
                                    duration: parseInt(e.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label>Diagnosis</Label>
                              <Input
                                placeholder="Diagnosis"
                                value={recordForm.diagnosis}
                                onChange={(e) =>
                                  setRecordForm({ ...recordForm, diagnosis: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label>Treatment</Label>
                              <Input
                                placeholder="Treatment"
                                value={recordForm.treatment}
                                onChange={(e) =>
                                  setRecordForm({ ...recordForm, treatment: e.target.value })
                                }
                              />
                            </div>
                            <Button className="w-full" onClick={handleAddRecord}>
                              Save Record
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {patients.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No patients found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
