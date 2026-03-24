"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Check, X, Stethoscope } from "lucide-react";
import { format } from "date-fns";

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await fetch("/api/patients/appointments");
      if (!res.ok) {
        throw new Error(`Failed to fetch appointments: ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setAppointments(data);
      } else {
        console.error("Expected array of appointments, got:", data);
        setAppointments([]);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
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

  const pending = appointments.filter((a) => a.status === "PENDING");
  const approved = appointments.filter((a) => a.status === "APPROVED");
  const cancelled = appointments.filter((a) => a.status === "CANCELLED");

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-8 ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">My Appointments</h1>
            <p className="text-muted-foreground">View and manage your appointments</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{pending.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <Check className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{approved.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                <X className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{cancelled.length}</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {appointments.map((apt) => (
              <Card key={apt.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <Stethoscope className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Dr. {apt.doctor.user.name}</h3>
                        <p className="text-sm text-muted-foreground">{apt.doctor.specialization}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(apt.date), "MMM dd, yyyy")}
                          <Clock className="h-4 w-4 ml-2" />
                          {format(new Date(apt.date), "hh:mm a")}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        apt.status === "APPROVED"
                          ? "success"
                          : apt.status === "CANCELLED"
                          ? "destructive"
                          : "warning"
                      }
                    >
                      {apt.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {appointments.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No appointments found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
