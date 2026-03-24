"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, TrendingUp, AlertTriangle, Clock, User } from "lucide-react";
import { format } from "date-fns";

export default function PatientDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patients/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
            <h1 className="text-3xl font-bold">Patient Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {session?.user?.name}</p>
          </div>

          <div className="p-4 mb-6 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Medical Disclaimer
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  This system provides suggestions only and is not a substitute for professional medical advice.
                  Please consult a healthcare professional for proper diagnosis and treatment.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data?.stats?.totalVisits || 0}</div>
                <p className="text-xs text-muted-foreground">Medical visits</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data?.stats?.thisMonthVisits || 0}</div>
                <p className="text-xs text-muted-foreground">Visits this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Health Insights</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data?.healthInsights?.recurringIssues?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Recurring issues</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {data?.upcomingAppointments?.length > 0 ? (
                  <div className="space-y-4">
                    {data.upcomingAppointments.slice(0, 3).map((apt: any) => (
                      <div key={apt.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Dr. {apt.doctor.user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(apt.date), "MMM dd, yyyy 'at' hh:mm a")}
                            </p>
                          </div>
                        </div>
                        <Badge variant="success">{apt.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No upcoming appointments</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Medical History</CardTitle>
                <CardDescription>Your recent medical records</CardDescription>
              </CardHeader>
              <CardContent>
                {data?.patient?.medicalRecords?.length > 0 ? (
                  <div className="space-y-4">
                    {data.patient.medicalRecords.slice(0, 3).map((record: any) => (
                      <div key={record.id} className="p-3 bg-muted rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium">{record.symptom}</p>
                          <Badge variant="outline">{record.duration} days</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(record.createdAt), "MMM dd, yyyy")} · Dr. {record.doctor.user.name}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No medical records</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
