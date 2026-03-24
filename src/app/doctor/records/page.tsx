"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Search, User, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

export default function DoctorRecords() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    const res = await fetch("/api/doctors/records");
    const data = await res.json();
    setRecords(data);
    setLoading(false);
  };

  const filteredRecords = search
    ? records.filter(
        (r) =>
          r.patient.user.name.toLowerCase().includes(search.toLowerCase()) ||
          r.symptom.toLowerCase().includes(search.toLowerCase())
      )
    : records;

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
            <h1 className="text-3xl font-bold">Medical Records</h1>
            <p className="text-muted-foreground">View all medical records</p>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient or symptom..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <Card key={record.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{record.patient.user.name}</h3>
                        <Badge variant="outline">
                          {record.patient.gender} · {record.patient.age} years
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {record.symptom}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {record.duration} days
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(record.createdAt), "MMM dd, yyyy")}
                        </div>
                      </div>
                      {record.diagnosis && (
                        <div className="mt-2 p-2 bg-muted rounded text-sm">
                          <span className="font-medium">Diagnosis:</span> {record.diagnosis}
                        </div>
                      )}
                      {record.treatment && (
                        <div className="mt-2 p-2 bg-muted rounded text-sm">
                          <span className="font-medium">Treatment:</span> {record.treatment}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No records found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
