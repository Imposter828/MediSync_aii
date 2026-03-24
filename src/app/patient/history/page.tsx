"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Clock, Stethoscope } from "lucide-react";
import { format } from "date-fns";

export default function PatientHistory() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const res = await fetch("/api/patients/history");
    const data = await res.json();
    setRecords(data);
    setLoading(false);
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
            <h1 className="text-3xl font-bold">Medical History</h1>
            <p className="text-muted-foreground">View your complete medical history timeline</p>
          </div>

          <div className="space-y-4">
            {records.map((record) => (
              <Card key={record.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
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

          {records.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No medical history found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
