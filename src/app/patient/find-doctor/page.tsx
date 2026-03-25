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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sparkles, Search, Stethoscope, AlertTriangle, User, Calendar, Clock, Loader2 } from "lucide-react";

export default function PatientFindDoctor() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSpecialization, setFilterSpecialization] = useState("all");
  const [filterExperience, setFilterExperience] = useState("all");
  
  const [symptomText, setSymptomText] = useState("");
  const [symptomDuration, setSymptomDuration] = useState(1);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, [filterSpecialization, filterExperience]);

  const loadDoctors = async () => {
    const params = new URLSearchParams();
    if (filterSpecialization && filterSpecialization !== "all") params.set("specialization", filterSpecialization);
    if (filterExperience && filterExperience !== "all") params.set("experience", filterExperience);

    try {
      const res = await fetch(`/api/doctors/all?${params}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch doctors: ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setDoctors(data);
      } else {
        console.error("Expected array of doctors, got:", data);
        setDoctors([]);
      }
    } catch (error) {
      console.error("Error loading doctors:", error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const getAISuggestion = async () => {
    if (!symptomText || !symptomDuration) return;
    setLoadingAI(true);
    try {
      const res = await fetch("/api/ai/symptom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptom: symptomText, duration: symptomDuration }),
      });
      const data = await res.json();
      setAiSuggestion(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAI(false);
    }
  };

  const bookAppointment = async () => {
    if (!selectedDoctor || !bookingDate || !bookingTime) return;
    setBookingLoading(true);
    try {
      const dateTime = new Date(`${bookingDate}T${bookingTime}`);
      const res = await fetch("/api/patients/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          date: dateTime.toISOString(),
        }),
      });
      if (res.ok) {
        setBookingSuccess(true);
        setTimeout(() => {
          setBookingSuccess(false);
          setSelectedDoctor(null);
        }, 2000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setBookingLoading(false);
    }
  };

  const specializationMap: Record<string, string> = {
    "Cardiologist": "Cardiology",
    "Neurologist": "Neurology",
    "ENT Specialist": "ENT",
    "Dermatologist": "Dermatology",
    "Orthopedic": "Orthopedic",
    "Pediatrician": "Pediatrician",
    "Psychiatrist": "Psychiatry",
  };

  const filteredDoctors = aiSuggestion
    ? doctors.filter((d) => aiSuggestion.suggested.some((s: string) => {
        const mapped = specializationMap[s] || s;
        return d.specialization === mapped || s === "Specialist";
      }))
    : doctors;

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-8 ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Find Doctor</h1>
            <p className="text-muted-foreground">Find the right doctor for your needs</p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Smart Doctor Finder
              </CardTitle>
              <CardDescription>
                Describe your symptoms and duration to get AI-powered doctor suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label>Your Symptom</Label>
                  <Input
                    placeholder="e.g., headache, fever, cough"
                    value={symptomText}
                    onChange={(e) => setSymptomText(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-[200px]">
                  <Label>Duration (days)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={symptomDuration}
                    onChange={(e) => setSymptomDuration(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={getAISuggestion} disabled={loadingAI || !symptomText}>
                    {loadingAI ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Get Suggestion
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {aiSuggestion && (
                <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="font-medium">AI Suggestion</span>
                  </div>
                  <p className="text-sm mb-2">
                    Based on your symptom lasting <strong>{symptomDuration} days</strong>:
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {aiSuggestion.suggested.map((s: string, i: number) => (
                      <Badge key={i} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                  {aiSuggestion.warning && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded border border-destructive/20">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-destructive">{aiSuggestion.warning}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">All Doctors</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <Select value={filterSpecialization} onValueChange={setFilterSpecialization}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="General Physician">General Physician</SelectItem>
                  <SelectItem value="Cardiologist">Cardiologist</SelectItem>
                  <SelectItem value="Neurologist">Neurologist</SelectItem>
                  <SelectItem value="Dermatologist">Dermatologist</SelectItem>
                  <SelectItem value="Pediatrician">Pediatrician</SelectItem>
                  <SelectItem value="Orthopedic">Orthopedic</SelectItem>
                  <SelectItem value="ENT">ENT Specialist</SelectItem>
                  <SelectItem value="Psychiatry">Psychiatrist</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterExperience} onValueChange={setFilterExperience}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="1">1+ years</SelectItem>
                  <SelectItem value="5">5+ years</SelectItem>
                  <SelectItem value="10">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => {
                const isSelected = selectedDoctor?.id === doctor.id;
                return (
                  <Card
                    key={doctor.id}
                    className={`hover:shadow-md transition-shadow ${isSelected ? "border-2 border-primary" : ""}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <Stethoscope className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Dr. {doctor.user.name}</h3>
                          <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {doctor.experience} years experience
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={isSelected ? "secondary" : "outline"}
                          onClick={() => setSelectedDoctor(doctor)}
                          className="flex-1"
                        >
                          {isSelected ? "Selected" : "Select Doctor"}
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="flex-1" onClick={() => setSelectedDoctor(doctor)}>
                              Book Appointment
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Book Appointment</DialogTitle>
                              <DialogDescription>
                                Book an appointment with Dr. {doctor.user.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {bookingSuccess ? (
                                <div className="p-4 bg-green-100 text-green-700 rounded-lg text-center">
                                  Appointment booked successfully!
                                </div>
                              ) : (
                                <>
                                  <div>
                                    <Label>Date</Label>
                                    <Input
                                      type="date"
                                      value={bookingDate}
                                      onChange={(e) => setBookingDate(e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <Label>Time</Label>
                                    <Input
                                      type="time"
                                      value={bookingTime}
                                      onChange={(e) => setBookingTime(e.target.value)}
                                    />
                                  </div>
                                  <Button
                                    className="w-full"
                                    onClick={bookAppointment}
                                    disabled={bookingLoading || !bookingDate || !bookingTime}
                                  >
                                    {bookingLoading ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Booking...
                                      </>
                                    ) : (
                                      "Confirm Booking"
                                    )}
                                  </Button>
                                </>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {!loading && filteredDoctors.length === 0 && (
            <div className="text-center py-12">
              <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No doctors found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
