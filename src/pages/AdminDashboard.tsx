import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { LogOut, Search, Trash2, Download, Eye, Users, FileImage, Calendar, LayoutDashboard } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function AdminDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalStudents: 0, todaysFlyers: 0, downloads: 0 });
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const loadData = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    
    try {
      if (supabase) {
        const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setStudents(data || []);
        setStats({ totalStudents: data?.length || 0, todaysFlyers: data?.length || 0, downloads: data?.length || 0 });
      } else {
        const [studentsRes, statsRes] = await Promise.all([
          fetch("/api/students", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/stats", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (studentsRes.status === 401 || statsRes.status === 401) {
          localStorage.removeItem("adminToken");
          navigate("/admin/login");
          return;
        }

        setStudents(await studentsRes.json());
        setStats(await statsRes.json());
      }
    } catch (err) {
      toast.error("Failed to load dashboard data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    
    try {
      if (supabase) {
         const { error } = await supabase.from('students').delete().eq('id', id);
         if (error) throw error;
         toast.success("Record deleted");
         loadData();
      } else {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`/api/students/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          toast.success("Record deleted");
          loadData();
        }
      }
    } catch (err) {
      toast.error("Failed to delete record");
    }
  };

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(search.toLowerCase()) || 
    s.flyer_code.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search)
  );

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-5 h-5 text-[#D4AF37]" />
          <h1 className="font-semibold tracking-wide">NCC Admin Console</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-neutral-300 hover:text-white hover:bg-neutral-800">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </header>

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm shadow-neutral-200">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Users className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Total Students</p>
                <h3 className="text-2xl font-bold text-neutral-900">{stats.totalStudents}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm shadow-neutral-200">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-green-50 text-green-600 rounded-2xl"><Calendar className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Today's Flyers</p>
                <h3 className="text-2xl font-bold text-neutral-900">{stats.todaysFlyers}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm shadow-neutral-200">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-[#D4AF37]/10 text-[#D4AF37] rounded-2xl"><FileImage className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Total Flyers Generated</p>
                <h3 className="text-2xl font-bold text-neutral-900">{stats.downloads}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Section */}
        <Card className="border-none shadow-sm shadow-neutral-200">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-neutral-100 gap-4">
            <CardTitle className="text-lg font-bold text-neutral-800">Generated Flyers</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input 
                placeholder="Search by name, phone or code..." 
                className="pl-9 bg-neutral-50 border-neutral-200 focus-visible:ring-[#D4AF37]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-neutral-50/50">
                <TableRow>
                  <TableHead className="w-16 text-center">Photo</TableHead>
                  <TableHead>Student Details</TableHead>
                  <TableHead>Flyer Code</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-neutral-500">No records found.</TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((s) => (
                    <TableRow key={s.id} className="hover:bg-neutral-50/50">
                      <TableCell className="p-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-200 bg-neutral-100 shrink-0">
                          <img src={s.photo_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-neutral-900">{s.full_name}</p>
                        <p className="text-xs text-neutral-500">{s.phone} • {s.state_of_origin}</p>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-neutral-100 text-neutral-700 text-xs font-mono font-medium border border-neutral-200">
                          {s.flyer_code}
                        </span>
                      </TableCell>
                      <TableCell className="text-neutral-500 text-sm">
                        {new Date(s.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" className="w-8 h-8 rounded-full border-neutral-200 text-neutral-600" render={<a href={s.flyer_url} target="_blank" rel="noreferrer" title="View Flyer" />} nativeButton={false}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="w-8 h-8 rounded-full border-neutral-200 text-blue-600" render={<a href={s.flyer_url} download title="Download Flyer" />} nativeButton={false}>
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="w-8 h-8 rounded-full border-neutral-200 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(s.id)} title="Delete Record">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
