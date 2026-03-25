"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, FileText, AlertTriangle, Loader2, User } from "lucide-react";

export default function DoctorAI() {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [symptomText, setSymptomText] = useState("");
  const [notesResult, setNotesResult] = useState("");
  const [summaryResult, setSummaryResult] = useState("");
  const [notesError, setNotesError] = useState("");
  const [summaryError, setSummaryError] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    fetch("/api/doctors/patients")
      .then((res) => res.json())
      .then((data) => setPatients(data));
  }, []);

  const generateNotes = async () => {
    if (!symptomText) return;
    setLoadingNotes(true);
    setNotesError("");
    setNotesResult("");
    try {
      const res = await fetch("/api/ai/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptomText }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to generate medical notes.");
      }

      setNotesResult(data.result);
    } catch (error) {
      console.error(error);
      setNotesError(
        error instanceof Error ? error.message : "Unable to generate medical notes."
      );
    } finally {
      setLoadingNotes(false);
    }
  };

  const generateSummary = async () => {
    if (!selectedPatient) return;
    setLoadingSummary(true);
    setSummaryError("");
    setSummaryResult("");
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: selectedPatient }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to generate patient summary.");
      }

      setSummaryResult(data.summary);
    } catch (error) {
      console.error(error);
      setSummaryError(
        error instanceof Error ? error.message : "Unable to generate patient summary."
      );
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-8 ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">AI Features</h1>
            <p className="text-muted-foreground">AI-powered tools for doctors</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Auto Medical Notes Generator
                </CardTitle>
                <CardDescription>
                  Enter brief symptoms and get structured medical notes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Patient Symptoms</Label>
                    <Input
                      placeholder="e.g., fever for 3 days, body ache, headache"
                      value={symptomText}
                      onChange={(e) => setSymptomText(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={generateNotes}
                    disabled={loadingNotes || !symptomText}
                  >
                    {loadingNotes ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Notes
                      </>
                    )}
                  </Button>
                  {notesResult && (
                    <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm">
                      {notesResult}
                    </div>
                  )}
                  {notesError && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                      {notesError}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Patient Summary Generator
                </CardTitle>
                <CardDescription>
                  Generate AI-powered patient overview from medical history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Select Patient</Label>
                    <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full"
                    onClick={generateSummary}
                    disabled={loadingSummary || !selectedPatient}
                  >
                    {loadingSummary ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Summary
                      </>
                    )}
                  </Button>
                  {summaryResult && (
                    <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm">
                      {summaryResult}
                    </div>
                  )}
                  {summaryError && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                      {summaryError}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Risk Alert System
                </CardTitle>
                <CardDescription>
                  Automatic warnings for patients with recurring symptoms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patients
                    .filter((p) => p.medicalRecords.length > 2)
                    .slice(0, 5)
                    .map((patient) => {
                      const symptomCounts: Record<string, number> = {};
                      patient.medicalRecords.forEach((r: any) => {
                        const symptom = r.symptom.toLowerCase().split(" ")[0];
                        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
                      });
                      const recurring = Object.entries(symptomCounts).find(
                        ([_, count]) => count >= 2
                      );

                      if (!recurring) return null;

                      return (
                        <div
                          key={patient.id}
                          className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-destructive" />
                            <div>
                              <p className="font-medium">{patient.user.name}</p>
                              <p className="text-sm text-destructive">
                                Recurring: {recurring[0]} ({recurring[1]} occurrences)
                              </p>
                            </div>
                          </div>
                          <Badge variant="destructive">Risk Alert</Badge>
                        </div>
                      );
                    })}
                  {patients.filter((p) => p.medicalRecords.length > 2).length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No risk alerts at this time
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
