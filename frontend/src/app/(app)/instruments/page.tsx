"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Scale,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AccuracyClass,
  apiFetch,
  Instrument,
  InstrumentCategory,
  InstrumentStatus,
} from "@/lib/api";

export default function InstrumentsPage() {
  const { user } = useAuth();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // New Instrument Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState<InstrumentCategory>("electronic_weighing_scale");
  const [brand, setBrand] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [capacityRating, setCapacityRating] = useState("");
  const [accuracyClass, setAccuracyClass] = useState<AccuracyClass>("class_iii");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("Central Delhi");
  const [pincode, setPincode] = useState("110001");
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  const loadInstruments = () => {
    setLoading(true);
    apiFetch<Instrument[]>("/instruments")
      .then((data) => setInstruments(data))
      .catch((err) => console.error("Failed to load instruments:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInstruments();
  }, []);

  const handleRegisterInstrument = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setSubmitting(true);
    try {
      await apiFetch<Instrument>("/instruments", {
        method: "POST",
        body: JSON.stringify({
          category,
          brand,
          model_number: modelNumber,
          serial_number: serialNumber,
          capacity_rating: capacityRating,
          accuracy_class: accuracyClass,
          installation_address: address,
          district,
          pincode,
        }),
      });
      setIsModalOpen(false);
      // Reset form
      setBrand("");
      setModelNumber("");
      setSerialNumber("");
      setCapacityRating("");
      setAddress("");
      loadInstruments();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Failed to register instrument");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredInstruments = instruments.filter((inst) => {
    const matchesSearch =
      inst.brand.toLowerCase().includes(search.toLowerCase()) ||
      inst.model_number.toLowerCase().includes(search.toLowerCase()) ||
      inst.serial_number.toLowerCase().includes(search.toLowerCase()) ||
      inst.district.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || inst.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || inst.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: InstrumentStatus) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" /> Verified & Stamped
          </span>
        );
      case "pending_verification":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
            <Clock className="h-3.5 w-3.5" /> Pending Verification
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
            <AlertCircle className="h-3.5 w-3.5" /> Verification Expired
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
            <X className="h-3.5 w-3.5" /> Stamping Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            Unverified
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Weighing & Measuring Instruments Fleet</h2>
          <p className="text-sm text-slate-500">
            Registered devices subjected to Legal Metrology verification under Rule 14.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-teal-600 hover:bg-teal-500 text-white">
          <Plus className="mr-2 h-4 w-4" /> Register New Instrument
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by brand, model, serial no, or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
          >
            <option value="all">All Categories</option>
            <option value="electronic_weighing_scale">Electronic Weighing Scale</option>
            <option value="weighbridge">Heavy Weighbridge</option>
            <option value="flow_meter">Flow Meter</option>
            <option value="petrol_dispenser">Petrol Dispenser</option>
            <option value="weights">Standard Weights</option>
            <option value="measures">Capacity Measures</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified & Stamped</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="expired">Expired</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
      </div>

      {/* Instruments Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading instrument fleet database…</div>
        ) : filteredInstruments.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No instruments found. Click &quot;Register New Instrument&quot; to add a weighing or measuring device.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Device & Brand</th>
                  <th className="px-6 py-3">Serial No</th>
                  <th className="px-6 py-3">Capacity & Accuracy</th>
                  <th className="px-6 py-3">District / Installation</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Next Due Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredInstruments.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{inst.brand}</div>
                      <div className="text-xs text-slate-500">
                        {inst.model_number} ({inst.category.replace(/_/g, " ").toUpperCase()})
                      </div>
                      {inst.trader_name && (
                        <div className="text-[11px] text-teal-600 font-medium">Owner: {inst.trader_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-800">
                      {inst.serial_number}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="font-medium text-slate-900">{inst.capacity_rating}</div>
                      <div className="text-slate-500">{inst.accuracy_class.replace(/_/g, " ").toUpperCase()}</div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="font-medium text-slate-900">{inst.district}</div>
                      <div className="text-slate-500 truncate max-w-xs">{inst.installation_address}</div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(inst.status)}</td>
                    <td className="px-6 py-4 text-xs font-medium">
                      {inst.next_due_date ? (
                        <span
                          className={
                            new Date(inst.next_due_date) < new Date()
                              ? "text-rose-600 font-bold"
                              : "text-slate-700"
                          }
                        >
                          {new Date(inst.next_due_date).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-slate-400">Not verified</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/applications/new?instrument_id=${inst.id}`}
                        className="inline-flex items-center gap-1 rounded bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition border border-teal-200"
                      >
                        Apply Verification
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-teal-400">
                <Scale className="h-5 w-5" />
                <h3 className="text-lg font-bold text-white">Register Instrument for Verification</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterInstrument} className="mt-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Instrument Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as InstrumentCategory)}
                    className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                  >
                    <option value="electronic_weighing_scale">Electronic Weighing Scale</option>
                    <option value="weighbridge">Heavy Weighbridge</option>
                    <option value="flow_meter">Flow Meter</option>
                    <option value="petrol_dispenser">Petrol Dispenser</option>
                    <option value="weights">Standard Weights</option>
                    <option value="measures">Capacity Measures</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Accuracy Class</label>
                  <select
                    value={accuracyClass}
                    onChange={(e) => setAccuracyClass(e.target.value as AccuracyClass)}
                    className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                  >
                    <option value="class_i">Class I (Special Accuracy)</option>
                    <option value="class_ii">Class II (High Accuracy)</option>
                    <option value="class_iii">Class III (Medium Accuracy)</option>
                    <option value="class_iiii">Class IIII (Ordinary Accuracy)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Manufacturer / Brand</label>
                  <Input
                    required
                    placeholder="e.g. Avery India / Contech"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Model Number</label>
                  <Input
                    required
                    placeholder="e.g. CZA-300 / WB-60T"
                    value={modelNumber}
                    onChange={(e) => setModelNumber(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Serial Number</label>
                  <Input
                    required
                    placeholder="e.g. S/N-9984102"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Capacity Rating</label>
                  <Input
                    required
                    placeholder="e.g. 150 kg / 60,000 kg"
                    value={capacityRating}
                    onChange={(e) => setCapacityRating(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Installation Premises Address</label>
                <Input
                  required
                  placeholder="Street address, factory yard or shop location"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">District / Jurisdiction</label>
                  <Input
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Pincode</label>
                  <Input
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>

              {modalError && <p className="text-xs text-rose-400">{modalError}</p>}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white" disabled={submitting}>
                  {submitting ? "Registering…" : "Register Device"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
